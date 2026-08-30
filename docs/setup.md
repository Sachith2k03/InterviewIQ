# InterviewIQ Setup Guide

This guide explains how to run **InterviewIQ** locally for development and testing.

---

## 1. Prerequisites

Before starting, install the following tools:

- Git
- Node.js
- npm
- Python 3.12 or later
- FFmpeg
- A Supabase account
- A Google Gemini API key

You will also need access to the InterviewIQ Supabase project or your own compatible Supabase project.

---

## 2. Clone the Repository

Clone the repository:

```bash
git clone <YOUR_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd InterviewIQ
```

The project contains two main applications:

```text
InterviewIQ/
├── frontend/
└── backend/
```

---

# Frontend Setup

## 3. Navigate to the Frontend

```bash
cd frontend
```

---

## 4. Install Dependencies

Run:

```bash
npm install
```

This installs the required Next.js, React, Tailwind CSS, shadcn/ui, and other frontend dependencies.

---

## 5. Configure Frontend Environment Variables

Create a file called:

```text
.env.local
```

inside the `frontend` directory.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Do not commit real API keys or credentials to GitHub.

---

## 6. Start the Frontend

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The InterviewIQ frontend should now be running.

---

# Backend Setup

## 7. Navigate to the Backend

From the project root:

```bash
cd backend
```

---

## 8. Create a Python Virtual Environment

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

---

## 9. Install Python Dependencies

Run:

```bash
pip install -r requirements.txt
```

The backend uses packages including:

- FastAPI
- Uvicorn
- Supabase Python Client
- Pydantic
- OpenAI Whisper
- PyTorch
- Google Generative AI
- PyMuPDF
- ReportLab

---

## 10. Install FFmpeg

Whisper requires FFmpeg for audio processing.

### Windows

Install FFmpeg and add its `bin` directory to the system PATH.

Verify the installation:

```bash
ffmpeg -version
```

### Linux

```bash
sudo apt update
sudo apt install ffmpeg
```

### macOS

Using Homebrew:

```bash
brew install ffmpeg
```

Verify:

```bash
ffmpeg -version
```

---

## 11. Configure Backend Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GEMINI_API_KEY=your_gemini_api_key
```

Additional environment variables may be required depending on the current backend configuration.

Never upload the real `.env` file to GitHub.

---

## 12. Start the Backend

Make sure the Python virtual environment is activated.

Run:

```bash
uvicorn app.main:app --reload
```

The API should be available at:

```text
http://127.0.0.1:8000
```

---

## 13. Verify the Backend

Open the FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

You should see the available InterviewIQ API endpoints.

You can also use ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

# Supabase Configuration

## 14. Authentication

InterviewIQ uses Supabase Authentication.

The following authentication methods are supported:

- Email and password
- Google OAuth
- Password recovery

Make sure the correct frontend URLs are configured in the Supabase authentication settings.

For local development, the frontend URL is normally:

```text
http://localhost:3000
```

For production, add the deployed Vercel domain.

---

## 15. Google OAuth

Google OAuth must be enabled inside:

```text
Supabase Dashboard
→ Authentication
→ Providers
→ Google
```

Configure the Google Client ID and Client Secret.

The correct redirect URLs must also be configured in both Google Cloud and Supabase.

---

## 16. Database

InterviewIQ uses the following primary tables:

```text
profiles
resumes
interviews
interview_questions
interview_responses
interview_reports
```

The database must be configured before running the complete interview workflow.

---

## 17. Supabase Storage

InterviewIQ uses Supabase Storage for files including:

- Resume PDFs
- Profile avatars
- Interview audio recordings

Required storage buckets must exist and have suitable access policies.

---

# Running the Complete Application

For local development, both applications should run at the same time.

### Terminal 1 — Backend

```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

You should then have:

```text
Frontend: http://localhost:3000
Backend:  http://127.0.0.1:8000
Swagger:  http://127.0.0.1:8000/docs
```

---

# Basic Test Flow

After starting both applications:

1. Register a new account or sign in.
2. Open the user profile.
3. Upload a resume in PDF format.
4. Create a new interview.
5. Select the uploaded resume.
6. Choose the job role.
7. Choose the interview type.
8. Select the difficulty.
9. Select the number of questions.
10. Generate the interview.
11. Start the interview.
12. Record an answer.
13. Submit the recording.
14. Wait for Whisper transcription.
15. Review the Gemini-generated evaluation.
16. Complete all interview questions.
17. Review the final interview results.

---

# Common Problems

## Frontend Cannot Connect to Backend

Check:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Make sure the FastAPI backend is running.

---

## Authentication Fails

Check:

- Supabase URL
- Supabase anonymous key
- Authentication redirect URLs
- Google OAuth configuration
- Access token validity

---

## Whisper Cannot Process Audio

Check that FFmpeg is installed:

```bash
ffmpeg -version
```

Also confirm that all Whisper and PyTorch dependencies were installed correctly.

---

## Gemini Evaluation Fails

Check that the Gemini API key is valid and available in the backend environment variables.

---

## Uploaded Files Fail

Check:

- Supabase Storage buckets
- Storage policies
- File type
- Authentication status
- Backend permissions

---

# Security Notes

Never commit any of the following files:

```text
.env
.env.local
```

Never expose:

- Supabase service role keys
- Gemini API keys
- Authentication secrets
- Private credentials

Only environment variables prefixed with `NEXT_PUBLIC_` should be exposed to the browser.

---

# Production

InterviewIQ currently uses:

```text
Frontend  → Vercel
Backend   → Render
Database  → Supabase PostgreSQL
Auth      → Supabase Authentication
Storage   → Supabase Storage
AI        → Google Gemini
STT       → OpenAI Whisper
```

For production deployment instructions, see:

```text
docs/deployment.md
```
