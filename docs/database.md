# InterviewIQ Database Documentation

This document describes the database structure used by **InterviewIQ**, including tables, relationships, constraints, and the purpose of each entity.

InterviewIQ uses **Supabase PostgreSQL** as its primary relational database.

---

# 1. Database Overview

The application currently uses six main public tables:

```text
profiles
resumes
interviews
interview_questions
interview_responses
interview_reports
```

These tables store user information, resume metadata, interview configurations, generated questions, candidate responses, and final interview reports.

---

# 2. Entity Relationship Overview

```text
profiles
   │
   ├──────────────< resumes
   │
   └──────────────< interviews
                       │
                       ├──────────────< interview_questions
                       │
                       ├──────────────< interview_responses
                       │
                       └────────────── interview_reports
```

A single user can have multiple resumes and multiple interviews.

Each interview can contain multiple questions and multiple responses.

An interview can also have an associated final report.

---

# 3. `profiles`

The `profiles` table stores application-level information for authenticated users.

The profile ID corresponds to the Supabase Auth user ID.

## Main Fields

| Column       | Description                |
| ------------ | -------------------------- |
| `id`         | Unique user identifier     |
| `full_name`  | User's full name           |
| `email`      | User's email address       |
| `avatar_url` | Profile image location     |
| `created_at` | Profile creation timestamp |
| `updated_at` | Last update timestamp      |

## Relationship

```text
profiles.id
    ↓
auth.users.id
```

The profile is linked to the authenticated Supabase user.

Deleting a user should also remove application data associated with that user according to the configured cascade relationships.

---

# 4. `resumes`

The `resumes` table stores metadata for resumes uploaded by users.

The actual PDF file is stored in Supabase Storage.

## Main Fields

| Column         | Description                              |
| -------------- | ---------------------------------------- |
| `id`           | Unique resume identifier                 |
| `user_id`      | Owner of the resume                      |
| `title`        | Resume title or filename                 |
| `storage_path` | Location of the file in Supabase Storage |
| `created_at`   | Upload timestamp                         |
| `updated_at`   | Last update timestamp                    |

## Relationship

```text
profiles
   │
   │ 1
   │
   └──────────< resumes
                many
```

`resumes.user_id` references `profiles.id`.

The relationship uses:

```text
ON DELETE CASCADE
```

Therefore, when the user's profile is deleted, associated resume records are also deleted.

---

# 5. `interviews`

The `interviews` table stores the configuration and lifecycle information for each interview.

## Main Fields

| Column             | Description                       |
| ------------------ | --------------------------------- |
| `id`               | Unique interview identifier       |
| `user_id`          | User who created the interview    |
| `resume_id`        | Resume selected for the interview |
| `job_role`         | Target job role                   |
| `interview_type`   | Selected interview type           |
| `difficulty`       | Selected difficulty level         |
| `question_count`   | Number of interview questions     |
| `status`           | Current interview status          |
| `started_at`       | Interview start timestamp         |
| `completed_at`     | Interview completion timestamp    |
| `duration_seconds` | Total interview duration          |
| `created_at`       | Interview creation timestamp      |
| `updated_at`       | Last update timestamp             |

## Relationships

```text
profiles.id
    ↓
interviews.user_id
```

and:

```text
resumes.id
    ↓
interviews.resume_id
```

The user relationship uses:

```text
ON DELETE CASCADE
```

The resume relationship uses:

```text
ON DELETE SET NULL
```

This allows the interview record to remain even if its associated resume record is removed at the database level.

However, the application requires a resume when creating a new interview.

---

# 6. Interview Question Count

The `question_count` field defines how many questions should be generated for an interview.

The database applies a valid range constraint.

Example:

```text
1 to 50 questions
```

The backend also validates the requested question count.

---

# 7. Interview Status

The `status` field represents the current state of an interview.

Typical states include values such as:

```text
pending
in_progress
completed
```

The application uses this field to control the interview lifecycle and prevent invalid actions.

---

# 8. `interview_questions`

The `interview_questions` table stores AI-generated interview questions.

Questions are kept separate from candidate responses to avoid duplication and improve normalization.

## Main Fields

| Column            | Description                  |
| ----------------- | ---------------------------- |
| `id`              | Unique question identifier   |
| `interview_id`    | Parent interview             |
| `question_number` | Question order               |
| `question`        | Generated interview question |
| `created_at`      | Creation timestamp           |

## Relationship

```text
interviews
     │
     │ 1
     │
     └──────────< interview_questions
                  many
```

`interview_questions.interview_id` references `interviews.id`.

This relationship uses:

```text
ON DELETE CASCADE
```

Therefore, deleting an interview also removes its generated questions.

---

# 9. Unique Question Constraint

Each question number must be unique inside an interview.

The table uses a composite uniqueness rule:

```text
UNIQUE(interview_id, question_number)
```

This prevents duplicate question positions such as:

```text
Interview A - Question 1
Interview A - Question 1
```

At the same time, another interview can still have its own question number 1.

---

# 10. Question Index

An index is created on:

```text
interview_id
```

This improves query performance when loading all questions belonging to a specific interview.

---

# 11. `interview_responses`

The `interview_responses` table stores the candidate's answer and AI evaluation results for each interview question.

## Main Fields

| Column                    | Description                      |
| ------------------------- | -------------------------------- |
| `id`                      | Unique response identifier       |
| `interview_id`            | Parent interview                 |
| `question_number`         | Question being answered          |
| `audio_storage_path`      | Location of recorded audio       |
| `transcript`              | Whisper-generated transcription  |
| `technical_score`         | Technical accuracy score         |
| `communication_score`     | Communication score              |
| `confidence_score`        | Confidence score                 |
| `fluency_score`           | Fluency score                    |
| `overall_score`           | Overall answer score             |
| `question_feedback`       | AI-generated feedback            |
| `answer_duration_seconds` | Length of the candidate's answer |
| `created_at`              | Response creation timestamp      |
| `updated_at`              | Last update timestamp            |

---

# 12. Response-to-Question Relationship

Responses identify their related question using:

```text
interview_id
+
question_number
```

The response table references:

```text
interview_questions(interview_id, question_number)
```

This creates a relationship between the stored question and the corresponding answer.

---

# 13. Why Question Text Is Not Stored in Responses

The question itself is stored in:

```text
interview_questions
```

rather than being duplicated inside:

```text
interview_responses
```

This improves database normalization.

Instead of storing:

```text
Question:
"What is method overriding?"

Response:
question = "What is method overriding?"
answer = "..."
```

the system stores the question only once.

The response references it using the interview ID and question number.

This reduces duplication and keeps question data consistent.

---

# 14. Unique Response Constraint

Only one response should exist for each interview question.

The table uses:

```text
UNIQUE(interview_id, question_number)
```

This prevents multiple persisted responses from being created for the same question position.

---

# 15. Score Constraints

Evaluation scores are stored as numeric values.

The main evaluation categories are:

```text
technical_score
communication_score
confidence_score
fluency_score
overall_score
```

Each score must remain within the supported score range.

For InterviewIQ, scores are represented on a:

```text
0 - 100
```

scale at the database level.

---

# 16. `interview_reports`

The `interview_reports` table stores the final summarized performance for an interview.

## Main Fields

| Column                | Description                      |
| --------------------- | -------------------------------- |
| `id`                  | Unique report identifier         |
| `interview_id`        | Associated interview             |
| `overall_score`       | Final overall result             |
| `technical_score`     | Aggregated technical result      |
| `communication_score` | Aggregated communication result  |
| `confidence_score`    | Aggregated confidence result     |
| `fluency_score`       | Aggregated fluency result        |
| `strengths`           | Identified candidate strengths   |
| `weaknesses`          | Identified areas for improvement |
| `recommendations`     | AI-generated recommendations     |
| `created_at`          | Report creation timestamp        |
| `updated_at`          | Last update timestamp            |

---

# 17. Report Relationship

The report belongs to an interview.

```text
interviews
     │
     └────────── interview_reports
```

`interview_reports.interview_id` references:

```text
interviews.id
```

The relationship uses:

```text
ON DELETE CASCADE
```

Deleting an interview therefore removes its corresponding report.

---

# 18. Complete Relationship Summary

```text
auth.users
    │
    │
    ▼
profiles
    │
    ├────────────< resumes
    │                 │
    │                 │
    │                 └──────────┐
    │                            │
    └────────────< interviews ◄──┘
                      │
                      ├────────────< interview_questions
                      │                   │
                      │                   │
                      ├────────────< interview_responses
                      │
                      └──────────── interview_reports
```

---

# 19. Foreign Key Summary

| Child Table           | Foreign Key                      | Parent                                               |
| --------------------- | -------------------------------- | ---------------------------------------------------- |
| `profiles`            | `id`                             | `auth.users(id)`                                     |
| `resumes`             | `user_id`                        | `profiles(id)`                                       |
| `interviews`          | `user_id`                        | `profiles(id)`                                       |
| `interviews`          | `resume_id`                      | `resumes(id)`                                        |
| `interview_questions` | `interview_id`                   | `interviews(id)`                                     |
| `interview_responses` | `interview_id`                   | `interviews(id)`                                     |
| `interview_responses` | `interview_id + question_number` | `interview_questions(interview_id, question_number)` |
| `interview_reports`   | `interview_id`                   | `interviews(id)`                                     |

---

# 20. Delete Behavior

Important delete rules include:

```text
Profile deleted
    ↓
Resumes deleted
Interviews deleted
    ↓
Questions deleted
Responses deleted
Reports deleted
```

This prevents orphaned interview data from remaining after the parent user or interview is removed.

The resume reference from an interview uses:

```text
ON DELETE SET NULL
```

at the database relationship level.

---

# 21. Supabase Storage

Large files are not stored directly inside PostgreSQL.

Supabase Storage is used for files such as:

```text
Resume PDFs
Profile avatars
Recorded interview audio
```

The database stores references such as:

```text
storage_path
audio_storage_path
avatar_url
```

This keeps file storage separate from structured relational data.

---

# 22. Resume Data Privacy

Resume PDFs can contain personally identifiable information.

Before extracted resume content is used for AI processing, InterviewIQ sanitizes sensitive information.

Examples can include:

```text
Email addresses
Phone numbers
Physical addresses
Other unnecessary identifying information
```

The sanitized resume text can then be used as context for AI question generation.

---

# 23. Database Access Layer

The backend does not place all database logic directly inside API routes.

Database operations are separated into query modules.

Examples include:

```text
resume_queries.py
interview_queries.py
interview_question_queries.py
response_queries.py
```

These modules handle operations such as:

```text
INSERT
SELECT
UPDATE
DELETE
```

This keeps database code separate from business logic.

---

# 24. Single-Record Lookup Handling

For queries where a record may not exist, the backend uses a limited result query and explicitly handles an empty result.

Conceptually:

```text
query
   ↓
limit(1)
   ↓
result exists?
   ├── Yes → return first row
   └── No  → raise NotFoundException
```

This prevents database API errors when zero matching records are found.

---

# 25. Data Flow Example

A typical interview database flow is:

```text
User uploads resume
       ↓
resumes
       ↓
User creates interview
       ↓
interviews
       ↓
AI generates questions
       ↓
interview_questions
       ↓
Candidate submits voice answer
       ↓
interview_responses
       ↓
Interview completed
       ↓
interview_reports
```

---

# 26. Data Normalization

The schema separates logically different entities.

For example:

```text
Interview configuration
        ↓
interviews

Generated questions
        ↓
interview_questions

Candidate answers
        ↓
interview_responses

Final evaluation
        ↓
interview_reports
```

This reduces unnecessary duplication and makes each table responsible for a clear type of data.

---

# 27. Database Benefits

The current database design provides:

- Clear relationships between users and interviews
- Normalized question and response storage
- Cascading deletion of dependent data
- Controlled score ranges
- Unique question numbering
- Unique responses per question
- Efficient interview question lookup
- Separation between structured data and file storage
- Support for secure user-specific access

---

# 28. Conclusion

InterviewIQ uses a normalized PostgreSQL database structure built on Supabase.

The six-table design separates user profiles, resumes, interviews, questions, responses, and reports while maintaining clear foreign key relationships between them.

The structure supports the complete InterviewIQ workflow from resume upload and interview creation through question generation, voice response evaluation, and final report generation.
