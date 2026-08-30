# InterviewIQ System Architecture

This document describes the high-level architecture of **InterviewIQ**, including the frontend, backend, database, storage, authentication, and AI services used by the platform.

---

# 1. Architecture Overview

InterviewIQ follows a **client-server architecture** with a modular backend.

The main components are:

- Next.js frontend
- FastAPI backend
- Supabase Authentication
- Supabase PostgreSQL database
- Supabase Storage
- OpenAI Whisper
- Google Gemini

The frontend is responsible for the user interface, while the backend handles business logic, validation, AI processing, database operations, and file processing.

---

# 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │        User          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Next.js Frontend   │
                         │                      │
                         │  React + TypeScript  │
                         │  Tailwind + shadcn   │
                         └───────┬───────┬──────┘
                                 │       │
                    Authentication│       │ API Requests
                                 │       │
                                 ▼       ▼
                    ┌────────────────┐  ┌─────────────────────┐
                    │    Supabase    │  │   FastAPI Backend   │
                    │ Authentication │  │                     │
                    └────────────────┘  │ Services / Routers  │
                                        │ Schemas / Queries   │
                                        └──────────┬──────────┘
                                                   │
                       ┌───────────────────────────┼───────────────────────────┐
                       │                           │                           │
                       ▼                           ▼                           ▼
              ┌────────────────┐         ┌────────────────┐         ┌────────────────┐
              │   Supabase DB  │         │Supabase Storage│         │  AI Services   │
              │   PostgreSQL   │         │                │         │                │
              └────────────────┘         └────────────────┘         └───────┬────────┘
                                                                            │
                                                               ┌────────────┴────────────┐
                                                               ▼                         ▼
                                                     ┌─────────────────┐       ┌─────────────────┐
                                                     │ OpenAI Whisper  │       │ Google Gemini   │
                                                     │ Speech-to-Text  │       │ AI Evaluation   │
                                                     └─────────────────┘       └─────────────────┘
```

---

# 3. Frontend Architecture

The frontend is developed using **Next.js**, **React**, and **TypeScript**.

Its main responsibilities are:

- Displaying the user interface
- Handling navigation
- Managing authentication state
- Collecting interview configuration
- Recording voice answers
- Sending API requests to the backend
- Displaying interview questions
- Showing AI-generated feedback
- Displaying reports and interview history

The frontend communicates with both:

1. Supabase Authentication
2. FastAPI backend

---

# 4. Backend Architecture

The backend is developed using **FastAPI**.

It follows a modular layered structure.

```text
backend/
└── app/
    ├── core/
    ├── database/
    ├── exceptions/
    ├── routers/
    │   └── v1/
    ├── schemas/
    ├── services/
    └── main.py
```

---

# 5. Backend Layers

## 5.1 Routers

The router layer defines API endpoints and handles incoming HTTP requests.

Examples include:

```text
auth
profile
upload
interview
response
history
report
```

The routers are responsible for:

- Receiving requests
- Validating request parameters
- Getting the authenticated user
- Calling appropriate services
- Returning HTTP responses

Business logic should not be placed directly inside the routers when it can be handled by the service layer.

---

## 5.2 Services

The service layer contains the main application business logic.

Important services include:

```text
Auth Service
Interview Service
Question Generation Service
Response Service
Resume Service
Storage Service
Whisper Service
LLM Service
Report Generator
Fluency Analyzer
```

Examples of service responsibilities include:

- Processing resumes
- Generating interview questions
- Uploading audio
- Converting audio to text
- Evaluating interview answers
- Calculating performance results
- Generating reports

---

## 5.3 Database Query Layer

Database operations are separated from business logic.

Query modules include:

```text
interview_queries.py
resume_queries.py
interview_question_queries.py
response_queries.py
```

These modules are responsible for communicating with Supabase PostgreSQL.

Examples include:

- Creating interviews
- Retrieving interviews
- Saving generated questions
- Saving interview responses
- Updating transcripts
- Updating AI evaluation results
- Deleting records

---

## 5.4 Schemas

Pydantic schemas are used to validate incoming and outgoing data.

Schemas help ensure:

- Correct data types
- Required fields are present
- Invalid values are rejected
- API responses follow predictable structures

Examples include schemas for:

```text
Authentication
Users
Interviews
Questions
Responses
Reports
```

---

## 5.5 Core

The `core` module contains shared backend configuration and utilities.

Typical responsibilities include:

- Application settings
- Environment variable loading
- Constants
- Logging
- Shared configuration

---

# 6. Authentication Architecture

InterviewIQ uses **Supabase Authentication**.

The authentication flow is:

```text
User
  ↓
Frontend Login / Registration
  ↓
Supabase Authentication
  ↓
JWT Access Token
  ↓
Frontend
  ↓
Authorization: Bearer <token>
  ↓
FastAPI Backend
  ↓
Validate User
  ↓
Protected Resource
```

The backend verifies the user's access token before allowing access to protected endpoints.

This prevents unauthenticated users from accessing private interview data.

---

# 7. Resume Processing Architecture

The resume workflow is:

```text
User uploads PDF
       ↓
Frontend sends file
       ↓
FastAPI Backend
       ↓
Validate PDF
       ↓
Extract resume text
       ↓
Sanitize Personally Identifiable Information
       ↓
Store resume file in Supabase Storage
       ↓
Save resume metadata
       ↓
Resume becomes available for interviews
```

Personally Identifiable Information is removed from extracted resume content before the text is used for AI processing.

This reduces unnecessary exposure of private user information to external AI services.

---

# 8. Interview Creation Architecture

The interview creation flow is:

```text
User selects resume
        ↓
Enter job role
        ↓
Select interview type
        ↓
Select difficulty
        ↓
Choose question count
        ↓
Frontend sends request
        ↓
FastAPI validates request
        ↓
Interview saved in database
        ↓
Question generation service
        ↓
Gemini generates questions
        ↓
Questions validated
        ↓
Questions stored in interview_questions
```

Questions are persisted separately from interview responses.

This allows the interview to be reloaded without regenerating the questions.

---

# 9. Voice Response Architecture

InterviewIQ uses a non-real-time voice processing model.

The flow is:

```text
User records answer
       ↓
Browser creates audio recording
       ↓
Frontend uploads audio
       ↓
FastAPI Backend
       ↓
Audio stored in Supabase Storage
       ↓
Whisper Service
       ↓
Speech converted to text
       ↓
Transcript passed to evaluation service
       ↓
Gemini evaluates answer
       ↓
Scores and feedback stored
       ↓
Results returned to frontend
```

The MVP does not use real-time streaming speech-to-text.

Instead, audio is processed after the candidate submits the answer.

---

# 10. AI Architecture

InterviewIQ uses two primary AI components.

## OpenAI Whisper

Whisper is used for:

```text
Audio
  ↓
Speech Recognition
  ↓
Transcript
```

The transcript is then used for answer evaluation.

---

## Google Gemini

Gemini is used for:

### Question Generation

```text
Resume Context
+
Job Role
+
Interview Type
+
Difficulty
      ↓
Gemini
      ↓
Interview Questions
```

### Answer Evaluation

```text
Job Role
+
Difficulty
+
Question
+
Candidate Transcript
      ↓
Gemini
      ↓
Scores + Feedback
```

Evaluation includes:

- Technical Accuracy
- Communication
- Confidence
- Fluency
- Overall Performance

---

# 11. Database Architecture

InterviewIQ currently uses six main public tables:

```text
profiles
resumes
interviews
interview_questions
interview_responses
interview_reports
```

The relationships can be summarized as:

```text
profiles
   │
   ├── resumes
   │
   └── interviews
           │
           ├── interview_questions
           │
           ├── interview_responses
           │
           └── interview_reports
```

---

# 12. Database Relationship Overview

```text
profiles
   │
   │ 1
   │
   ├──────────────< resumes
   │
   │ 1
   │
   └──────────────< interviews
                       │
                       ├──────────────< interview_questions
                       │
                       ├──────────────< interview_responses
                       │
                       └────────────── interview_reports
```

Foreign key relationships and cascading rules help maintain database consistency.

---

# 13. Question and Response Separation

Interview questions and answers are stored separately.

```text
interview_questions
├── interview_id
├── question_number
└── question
```

```text
interview_responses
├── interview_id
├── question_number
├── transcript
├── scores
├── feedback
└── audio_storage_path
```

The response references the corresponding question using:

```text
interview_id + question_number
```

This design avoids unnecessary duplication of question text in response records.

---

# 14. Storage Architecture

Supabase Storage is used for file storage.

Files include:

```text
Resume PDFs
Profile avatars
Interview audio recordings
```

The database stores references or storage paths rather than storing large binary files directly inside PostgreSQL.

---

# 15. Security Architecture

Security is applied across multiple layers.

## Authentication

Supabase Authentication verifies user identities.

## JWT

Authenticated API requests include a Bearer token.

## Authorization

The backend verifies ownership before accessing user-specific resources.

For example, a user should not be able to retrieve another user's:

```text
Resume
Interview
Interview Questions
Interview Responses
Reports
```

## Row Level Security

Supabase Row Level Security can provide an additional database-level access control layer.

## Resume Privacy

Extracted resume text is sanitized before being sent to AI services.

## Environment Variables

Sensitive credentials are stored using environment variables and are excluded from Git.

---

# 16. Deployment Architecture

The production architecture is:

```text
                           Internet
                              │
                              ▼
                      ┌───────────────┐
                      │    Vercel     │
                      │   Frontend    │
                      └───────┬───────┘
                              │
                              ▼
                      ┌───────────────┐
                      │    Render     │
                      │    FastAPI    │
                      └───────┬───────┘
                              │
                 ┌────────────┼─────────────┐
                 │            │             │
                 ▼            ▼             ▼
           ┌──────────┐ ┌──────────┐ ┌──────────────┐
           │ Supabase │ │ Whisper  │ │    Gemini    │
           │ DB/Auth/ │ │   STT    │ │      AI      │
           │ Storage  │ │          │ │              │
           └──────────┘ └──────────┘ └──────────────┘
```

---

# 17. Technology Responsibilities

| Technology          | Responsibility                            |
| ------------------- | ----------------------------------------- |
| Next.js             | Frontend application                      |
| React               | UI component development                  |
| TypeScript          | Type-safe frontend development            |
| Tailwind CSS        | Styling                                   |
| shadcn/ui           | UI components                             |
| FastAPI             | Backend REST API                          |
| Python              | Backend implementation                    |
| Pydantic            | Data validation                           |
| Supabase Auth       | Authentication                            |
| Supabase PostgreSQL | Persistent database                       |
| Supabase Storage    | File storage                              |
| OpenAI Whisper      | Speech-to-text                            |
| Google Gemini       | Question generation and answer evaluation |
| Vercel              | Frontend hosting                          |
| Render              | Backend hosting                           |

---

# 18. Design Principles

InterviewIQ follows several design principles.

## Separation of Concerns

Frontend, business logic, database operations, and AI processing are separated.

## Modular Backend

Backend features are organized into routers, services, schemas, and query modules.

## Data Normalization

Questions are stored separately from responses to avoid duplicated data.

## Secure Access

Authenticated ownership validation is performed before protected operations.

## Persistence

Generated questions and interview responses are saved to the database so users do not lose interview progress unnecessarily.

## Scalability

The architecture allows individual parts of the system to be updated independently.

---

# 19. Complete InterviewIQ Flow

```text
Register / Login
       ↓
Supabase Authentication
       ↓
User Dashboard
       ↓
Upload Resume
       ↓
Resume Validation
       ↓
Text Extraction + PII Sanitization
       ↓
Create Interview
       ↓
Generate Questions with Gemini
       ↓
Store Questions
       ↓
Start Interview
       ↓
Record Voice Answer
       ↓
Store Audio
       ↓
Whisper Transcription
       ↓
Gemini Evaluation
       ↓
Store Transcript + Scores + Feedback
       ↓
Repeat for Remaining Questions
       ↓
Complete Interview
       ↓
Generate / Store Report
       ↓
View Results and Interview History
```

---

# 20. Conclusion

The InterviewIQ architecture separates the responsibilities of the user interface, backend processing, persistent storage, authentication, speech recognition, and artificial intelligence.

This modular structure makes the application easier to maintain, test, and extend while supporting the main goal of providing realistic AI-powered mock interview practice.
