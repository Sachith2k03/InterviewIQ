# InterviewIQ API Documentation

This document provides an overview of the main REST API endpoints used by the **InterviewIQ** backend.

The backend is built with **FastAPI** and exposes versioned API endpoints for authentication, profile management, resume handling, interview creation, question generation, interview responses, history, and reports.

---

# 1. Base URL

## Local Development

```text
http://127.0.0.1:8000
```

If the API version prefix is enabled, endpoints are available under:

```text
/api/v1
```

Example:

```text
http://127.0.0.1:8000/api/v1/interviews
```

## Production

The production API is hosted on **Render**.

The exact production URL should be configured in the frontend environment variables.

---

# 2. Interactive API Documentation

FastAPI automatically provides interactive API documentation.

## Swagger UI

```text
http://127.0.0.1:8000/docs
```

## ReDoc

```text
http://127.0.0.1:8000/redoc
```

Swagger UI can be used to inspect endpoints, request schemas, response models, and test API requests.

---

# 3. Authentication

InterviewIQ uses **Supabase Authentication**.

Protected backend endpoints require a valid JWT access token.

The frontend sends the token using the HTTP `Authorization` header:

```http
Authorization: Bearer <access_token>
```

The backend validates the token before allowing access to protected resources.

---

# 4. Authentication Endpoints

## Get Current User

```http
GET /api/v1/auth/me
```

Returns information about the currently authenticated user.

### Authentication

Required.

### Example Response

```json
{
  "id": "user-uuid",
  "full_name": "Example User",
  "email": "user@example.com"
}
```

### Possible Errors

```text
401 Unauthorized
```

Returned when the access token is missing, invalid, or expired.

---

# 5. Profile Endpoints

Profile endpoints allow authenticated users to retrieve and update their application profile.

## Get Profile

```http
GET /api/v1/profile
```

Returns the authenticated user's profile.

### Authentication

Required.

---

## Update Profile

```http
PUT /api/v1/profile
```

Updates editable profile information such as the user's full name.

### Example Request

```json
{
  "full_name": "Example User"
}
```

### Authentication

Required.

---

## Avatar Upload

InterviewIQ supports profile avatar upload.

The uploaded avatar is stored using **Supabase Storage**, while the profile record stores the associated avatar URL or storage reference.

---

# 6. Resume Upload Endpoints

Resume endpoints allow users to upload and manage PDF resumes.

## Upload Resume

```http
POST /api/v1/upload
```

Uploads a resume PDF.

### Content Type

```text
multipart/form-data
```

### Processing Flow

```text
Receive PDF
    ↓
Validate file
    ↓
Extract text
    ↓
Sanitize PII
    ↓
Upload PDF to Supabase Storage
    ↓
Save resume metadata
```

### Authentication

Required.

### Validation

The backend rejects invalid or unsupported resume files.

---

# 7. Resume Management

Uploaded resumes are linked to the authenticated user.

Users can:

- View uploaded resumes
- Select a resume for an interview
- Delete eligible resumes

InterviewIQ prevents a resume from being incorrectly deleted when it is still being used by an interview.

---

# 8. Interview Endpoints

Interview endpoints manage interview creation, retrieval, and lifecycle operations.

## Create Interview

```http
POST /api/v1/interviews
```

Creates a new interview.

### Authentication

Required.

### Example Request

```json
{
  "resume_id": "resume-uuid",
  "job_role": "Backend Developer",
  "interview_type": "technical",
  "difficulty": "medium",
  "question_count": 5
}
```

### Main Fields

| Field            | Description         |
| ---------------- | ------------------- |
| `resume_id`      | Selected resume     |
| `job_role`       | Target job role     |
| `interview_type` | Type of interview   |
| `difficulty`     | Selected difficulty |
| `question_count` | Number of questions |

A resume is required when creating an interview.

---

# 9. Get Interview

```http
GET /api/v1/interviews/{interview_id}
```

Returns information about a specific interview.

### Authentication

Required.

### Ownership Check

The backend verifies that the authenticated user owns the interview.

### Possible Errors

```text
401 Unauthorized
403 Forbidden
404 Not Found
```

depending on the request and authorization state.

---

# 10. Generate Interview Questions

```http
POST /api/v1/interviews/{interview_id}/questions/generate
```

Generates AI-powered interview questions for a selected interview.

### Authentication

Required.

### Processing Flow

```text
Validate user
     ↓
Validate interview
     ↓
Validate selected resume
     ↓
Prepare sanitized resume context
     ↓
Send prompt to Gemini
     ↓
Validate generated questions
     ↓
Store questions
```

The system checks that the correct number of questions is generated.

It also prevents invalid or duplicate question sets from being stored.

---

# 11. Get Interview Questions

```http
GET /api/v1/interviews/{interview_id}/questions
```

Returns the questions generated for an interview.

### Authentication

Required.

### Example Response

```json
[
  {
    "question_number": 1,
    "question": "Can you explain the difference between method overloading and method overriding?"
  },
  {
    "question_number": 2,
    "question": "How would you design a REST API for a simple task management application?"
  }
]
```

Questions are stored in the `interview_questions` table.

---

# 12. Interview Response Endpoints

Interview response endpoints handle voice answer submission, transcription, evaluation, retrieval, and deletion.

---

# 13. Submit Interview Response

```http
POST /api/v1/interviews/{interview_id}/responses
```

Submits a recorded answer for an interview question.

### Authentication

Required.

### Content Type

```text
multipart/form-data
```

The request includes:

- Question number
- Recorded audio
- Answer duration where applicable

### Processing Flow

```text
Receive request
      ↓
Validate authenticated user
      ↓
Validate interview ownership
      ↓
Retrieve stored question
      ↓
Upload audio
      ↓
Whisper transcription
      ↓
Gemini evaluation
      ↓
Save response
      ↓
Return result
```

---

# 14. Speech Transcription

Submitted audio is processed using **OpenAI Whisper**.

```text
Audio
   ↓
Whisper
   ↓
Transcript
```

The generated transcript is stored with the interview response and used for AI evaluation.

---

# 15. Answer Evaluation

After transcription, the candidate answer is evaluated using **Google Gemini**.

The evaluation considers:

- Technical Accuracy
- Communication
- Confidence
- Fluency
- Overall Performance

The resulting values are stored in the database.

### Example Evaluation Response

```json
{
  "technical_score": 82,
  "communication_score": 78,
  "confidence_score": 75,
  "fluency_score": 80,
  "overall_score": 79,
  "question_feedback": "The answer demonstrates a good understanding of the main concept but could include a clearer example."
}
```

---

# 16. Get All Responses for an Interview

```http
GET /api/v1/interviews/{interview_id}/responses
```

Returns all submitted responses for the specified interview.

### Authentication

Required.

### Ownership Validation

The backend verifies that the interview belongs to the authenticated user.

---

# 17. Get Response for a Question

```http
GET /api/v1/interviews/{interview_id}/responses/{question_number}
```

Returns the stored response for a specific interview question.

### Authentication

Required.

### Parameters

| Parameter         | Description              |
| ----------------- | ------------------------ |
| `interview_id`    | Interview UUID           |
| `question_number` | Position of the question |

---

# 18. Delete Response

```http
DELETE /api/v1/interviews/{interview_id}/responses/{question_number}
```

Deletes the stored response for a selected interview question where allowed by the application.

### Authentication

Required.

The backend checks whether the response exists before attempting deletion.

---

# 19. Response Data

An interview response can contain fields such as:

```text
id
interview_id
question_number
audio_storage_path
transcript
technical_score
communication_score
confidence_score
fluency_score
overall_score
question_feedback
answer_duration_seconds
created_at
updated_at
```

The question text itself is stored separately in `interview_questions`.

---

# 20. Interview History

InterviewIQ provides interview history functionality.

History data can contain information such as:

- Interview ID
- Job role
- Interview type
- Difficulty
- Question count
- Status
- Resume title
- Overall score
- Creation date
- Start time
- Completion time

This allows users to review previous interview sessions.

---

# 21. Report Endpoints

Report functionality provides summarized interview performance.

Reports are generated after the required interview data has been collected.

A report can contain:

```text
overall_score
technical_score
communication_score
confidence_score
fluency_score
strengths
weaknesses
recommendations
```

---

# 22. PDF Reports

InterviewIQ supports generating a downloadable interview report.

The report generation service uses the stored interview results to create a PDF containing the candidate's performance information.

The PDF can include:

- Interview details
- Performance scores
- Strengths
- Weaknesses
- Recommendations
- Question-level results

---

# 23. API Request Flow

A typical authenticated request follows this structure:

```text
Frontend
    ↓
Get Supabase access token
    ↓
HTTP request
    ↓
Authorization: Bearer <JWT>
    ↓
FastAPI router
    ↓
Authentication validation
    ↓
Service layer
    ↓
Database query / AI service
    ↓
Response returned
```

---

# 24. API Architecture

The backend separates responsibilities across different layers.

```text
Request
   ↓
Router
   ↓
Schema Validation
   ↓
Service
   ↓
Database Query / External Service
   ↓
Response
```

This makes the API easier to maintain and test.

---

# 25. Error Handling

The backend returns standard HTTP status codes depending on the result of the request.

Common responses include:

| Status | Meaning                                    |
| ------ | ------------------------------------------ |
| `200`  | Request completed successfully             |
| `201`  | Resource created successfully              |
| `400`  | Invalid request                            |
| `401`  | Authentication required or token invalid   |
| `403`  | User is not allowed to access the resource |
| `404`  | Requested resource does not exist          |
| `409`  | Request conflicts with existing data       |
| `422`  | Request validation failed                  |
| `500`  | Unexpected server error                    |

---

# 26. Resource Ownership

InterviewIQ performs ownership checks for user-specific resources.

Before accessing protected data, the backend verifies that the authenticated user owns the requested resource.

This applies to resources such as:

```text
Resumes
Interviews
Interview questions
Interview responses
Reports
```

A user should not be able to retrieve another user's interview data by manually changing an ID in an API request.

---

# 27. Database Interaction

The API communicates with Supabase through dedicated database query modules.

Examples include:

```text
interview_queries.py
resume_queries.py
interview_question_queries.py
response_queries.py
```

This separates database logic from route handling and business logic.

---

# 28. Single Record Retrieval

For lookups where a matching row may not exist, the backend safely checks the returned data instead of assuming a record always exists.

Conceptually:

```text
Query with limit(1)
       ↓
Any results?
   ┌───┴────┐
  Yes       No
   ↓         ↓
Return    NotFoundException
record
```

This provides predictable handling of missing database records.

---

# 29. External Services

The API communicates with several external services.

| Service             | Purpose                                   |
| ------------------- | ----------------------------------------- |
| Supabase Auth       | User authentication                       |
| Supabase PostgreSQL | Application database                      |
| Supabase Storage    | Resume, avatar, and audio storage         |
| OpenAI Whisper      | Speech transcription                      |
| Google Gemini       | Question generation and answer evaluation |

---

# 30. API Security

Important API security measures include:

- JWT authentication
- Resource ownership validation
- Input validation with Pydantic
- Environment-based secret management
- Supabase access controls
- Resume PII sanitization
- Protected user-specific endpoints

Sensitive API credentials should never be included directly in frontend code or committed to GitHub.

---

# 31. Example Complete API Flow

```text
POST /interviews
       ↓
Create interview
       ↓
POST /interviews/{id}/questions/generate
       ↓
Generate and save questions
       ↓
GET /interviews/{id}/questions
       ↓
Display questions
       ↓
POST /interviews/{id}/responses
       ↓
Upload voice response
       ↓
Whisper transcription
       ↓
Gemini evaluation
       ↓
Save scores and feedback
       ↓
GET /interviews/{id}/responses
       ↓
Review answers
       ↓
Generate final report
```

---

# 32. Development Testing

The API can be tested using:

- FastAPI Swagger UI
- Postman
- Insomnia
- Frontend integration
- Automated Python tests

For most development testing, Swagger UI is available at:

```text
http://127.0.0.1:8000/docs
```

---

# 33. Conclusion

The InterviewIQ API acts as the central application layer between the frontend, database, storage, authentication system, speech recognition engine, and AI evaluation service.

Its modular FastAPI structure allows authentication, interview management, question generation, voice response processing, evaluation, and reporting to remain separated and maintainable.
