# InterviewIQ Deployment Guide

This document explains how **InterviewIQ** is deployed in production.

The production environment uses:

```text
Frontend  → Vercel
Backend   → Render
Database  → Supabase PostgreSQL
Auth      → Supabase Authentication
Storage   → Supabase Storage
AI        → Google Gemini
STT       → OpenAI Whisper
```

---

# 1. Production Architecture

```text
User
  ↓
Vercel
Next.js Frontend
  ↓
Render
FastAPI Backend
  ↓
Supabase
Database / Auth / Storage
  ↓
Whisper + Gemini
```

The frontend and backend are deployed separately.

The frontend communicates with the backend using the production API URL stored in environment variables.

---

# 2. Frontend Deployment with Vercel

The InterviewIQ frontend is deployed using **Vercel**.

Live application:

```text
https://interview-iq-one-lovat.vercel.app/
```

---

# 3. Connect Repository to Vercel

1. Sign in to Vercel.
2. Choose **Add New Project**.
3. Import the InterviewIQ GitHub repository.
4. Select the frontend project directory.
5. Confirm that Vercel detects Next.js.
6. Add the required environment variables.
7. Deploy the project.

If the repository contains both frontend and backend folders, configure the Vercel Root Directory as:

```text
frontend
```

---

# 4. Frontend Environment Variables

The production frontend requires environment variables such as:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_API_URL=your_render_backend_url
```

The backend URL must point to the deployed Render service instead of localhost.

Incorrect:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Correct production style:

```env
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
```

---

# 5. Backend Deployment with Render

The InterviewIQ FastAPI backend is deployed using **Render**.

The backend is configured as a Web Service.

---

# 6. Create Render Web Service

1. Sign in to Render.
2. Create a new **Web Service**.
3. Connect the InterviewIQ GitHub repository.
4. Select the backend directory.
5. Configure the Python runtime.
6. Add the backend environment variables.
7. Configure the build and start commands.
8. Deploy the service.

If the repository contains multiple applications, configure the Root Directory as:

```text
backend
```

---

# 7. Render Build Command

The backend dependencies are installed using:

```bash
pip install -r requirements.txt
```

This installs the FastAPI backend and the required AI, database, and processing libraries.

---

# 8. Render Start Command

The FastAPI server can be started using:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Render supplies the `PORT` environment variable automatically.

The server must listen on:

```text
0.0.0.0
```

rather than only:

```text
127.0.0.1
```

because the service must be accessible externally.

---

# 9. Backend Environment Variables

The backend requires configuration values for Supabase and Gemini.

Example:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GEMINI_API_KEY=your_gemini_api_key
```

The exact variable names should match the backend configuration class used in the project.

Never store production secrets directly inside source code.

---

# 10. Render Health Check

Render can periodically check whether the backend service is available.

The project should expose a lightweight health endpoint.

Example:

```text
/api/v1/health
```

or the health path currently defined by the backend.

Configure the Render Health Check Path to match the actual FastAPI health endpoint.

The health endpoint should return a successful HTTP response while the application is running normally.

---

# 11. CORS Configuration

The backend must allow requests from the deployed frontend domain.

The production frontend origin is:

```text
https://interview-iq-one-lovat.vercel.app
```

The FastAPI CORS configuration should include this domain.

For local development, it may also include:

```text
http://localhost:3000
```

Example conceptual configuration:

```text
Allowed origins:
- http://localhost:3000
- https://interview-iq-one-lovat.vercel.app
```

Without the correct CORS configuration, browser requests from the frontend may be blocked.

---

# 12. Supabase Production Configuration

Supabase provides:

- Authentication
- PostgreSQL database
- Storage
- OAuth integration

The same Supabase project can be used by both the deployed frontend and backend.

---

# 13. Supabase Site URL

Inside Supabase Authentication settings, configure the production application URL.

Production Site URL:

```text
https://interview-iq-one-lovat.vercel.app
```

This ensures authentication redirects users back to the deployed application instead of localhost.

---

# 14. Authentication Redirect URLs

Add the required production callback URLs under:

```text
Supabase Dashboard
→ Authentication
→ URL Configuration
```

Typical development and production entries include:

```text
http://localhost:3000/**
https://interview-iq-one-lovat.vercel.app/**
```

The exact callback route used by the frontend should also be permitted.

---

# 15. Google OAuth Deployment

InterviewIQ supports Google OAuth through Supabase.

Production OAuth requires configuration in both:

- Google Cloud Console
- Supabase

---

# 16. Google Cloud OAuth Configuration

In Google Cloud Console:

1. Open the OAuth client used by InterviewIQ.
2. Configure the required authorized origins.
3. Add the Supabase OAuth callback URI.
4. Save the configuration.

Google sends the OAuth response to Supabase.

Supabase then redirects the user back to InterviewIQ.

---

# 17. OAuth Redirect Flow

The production OAuth flow is:

```text
User selects Login with Google
        ↓
Google Authentication
        ↓
Supabase OAuth Callback
        ↓
Supabase creates session
        ↓
InterviewIQ authentication callback
        ↓
Dashboard
```

The frontend should generate its callback URL from the current application origin.

This prevents production users from being redirected to:

```text
localhost
```

after Google login.

---

# 18. Frontend Callback URL

A common production-safe approach is to build the callback URL using the browser origin.

Conceptually:

```text
window.location.origin + "/auth/callback"
```

When running locally:

```text
http://localhost:3000/auth/callback
```

When deployed:

```text
https://interview-iq-one-lovat.vercel.app/auth/callback
```

This allows the same frontend code to work in both environments.

---

# 19. Supabase Database

The production PostgreSQL database is hosted by Supabase.

The application uses tables including:

```text
profiles
resumes
interviews
interview_questions
interview_responses
interview_reports
```

Database relationships and constraints are described in:

```text
docs/database.md
```

---

# 20. Supabase Storage

Production files are stored in Supabase Storage.

Examples include:

- Resume PDFs
- Profile avatars
- Interview audio recordings

The backend and frontend should use the correct storage bucket names and access rules.

---

# 21. Production Resume Processing

The production resume workflow is:

```text
User uploads resume
       ↓
Vercel frontend
       ↓
Render backend
       ↓
Validate PDF
       ↓
Extract text
       ↓
PII sanitization
       ↓
Supabase Storage
       ↓
Resume metadata saved
```

---

# 22. Production Interview Flow

```text
User creates interview
       ↓
Vercel frontend
       ↓
Render FastAPI API
       ↓
Supabase interview record
       ↓
Gemini question generation
       ↓
Questions saved
       ↓
User records answer
       ↓
Audio sent to Render
       ↓
Whisper transcription
       ↓
Gemini evaluation
       ↓
Scores saved to Supabase
       ↓
Results returned to frontend
```

---

# 23. Whisper Deployment Considerations

InterviewIQ uses OpenAI Whisper locally within the backend environment.

Whisper requires:

- Python dependencies
- PyTorch
- FFmpeg
- Sufficient memory and CPU resources

The deployed backend environment must include the required dependencies for audio processing.

If Whisper fails in production, check:

```text
FFmpeg availability
PyTorch installation
Whisper installation
Memory usage
Audio file format
```

---

# 24. Gemini Production Configuration

The Gemini API key should exist only in the backend environment.

It should not be included in frontend code.

Correct:

```text
Frontend
   ↓
FastAPI
   ↓
Gemini
```

Avoid:

```text
Frontend
   ↓
Gemini directly with private key
```

Keeping the Gemini API key on the backend protects the credential from browser exposure.

---

# 25. Environment Separation

InterviewIQ uses separate values for local and production environments.

## Local

```text
Frontend:
http://localhost:3000

Backend:
http://127.0.0.1:8000
```

## Production

```text
Frontend:
https://interview-iq-one-lovat.vercel.app

Backend:
Render production URL
```

Environment variables should be used instead of hardcoding these URLs.

---

# 26. `.gitignore`

Sensitive environment files should be ignored by Git.

Examples:

```text
.env
.env.local
venv/
node_modules/
.next/
```

Production secrets must never be pushed to GitHub.

---

# 27. Deployment Workflow

The normal deployment workflow is:

```text
Local development
       ↓
Test application
       ↓
Commit changes
       ↓
Push to GitHub
       ↓
Vercel redeploys frontend
       ↓
Render redeploys backend
       ↓
Production verification
```

Automatic deployment depends on the GitHub branch configured in each hosting platform.

---

# 28. Production Verification

After deployment, verify the following:

- Landing page loads
- Registration works
- Email login works
- Google OAuth works
- Dashboard loads
- Profile updates work
- Resume upload works
- Resume list persists
- Interview creation works
- Gemini generates questions
- Questions persist after refresh
- Voice recording works
- Audio uploads successfully
- Whisper transcription works
- Gemini evaluation works
- Scores and feedback are saved
- Interview history loads
- Reports display correctly

---

# 29. Troubleshooting

## Google Login Redirects to Localhost

Check:

- Supabase Site URL
- Supabase Redirect URLs
- Frontend OAuth `redirectTo`
- Production callback URL
- Google OAuth configuration

The redirect must use the deployed domain in production.

---

## Frontend Cannot Reach Backend

Check:

```env
NEXT_PUBLIC_API_URL
```

Confirm that it contains the Render production URL.

Also verify:

- Render service is running
- CORS includes the Vercel domain
- API URL uses HTTPS

---

## Backend Deployment Fails

Check:

- Python version
- `requirements.txt`
- Build logs
- Environment variables
- Start command
- FFmpeg requirements

---

## API Returns 401

Check:

- User is logged in
- Supabase session exists
- JWT access token is being sent
- Authorization header uses Bearer format

Example:

```http
Authorization: Bearer <token>
```

---

## Resume Upload Fails

Check:

- Supabase Storage configuration
- Storage bucket permissions
- File type
- Backend environment variables
- Authentication token

---

## Interview Generation Fails

Check:

- Gemini API key
- API quota
- Selected resume
- Resume ownership
- Interview ownership
- Backend logs

---

## Audio Processing Fails

Check:

- Audio format
- File upload
- FFmpeg
- Whisper dependencies
- Render memory availability

---

# 30. Security Considerations

Production deployment should follow these rules:

- Never commit `.env` files
- Never expose Supabase service role keys
- Never expose Gemini API keys
- Use HTTPS in production
- Validate JWT tokens
- Validate resource ownership
- Sanitize resume PII
- Restrict Supabase Storage access
- Use environment variables for secrets
- Keep authentication redirect URLs controlled

---

# 31. Current Production Stack

| Component      | Platform            |
| -------------- | ------------------- |
| Frontend       | Vercel              |
| Backend        | Render              |
| Database       | Supabase PostgreSQL |
| Authentication | Supabase Auth       |
| Storage        | Supabase Storage    |
| Speech-to-Text | OpenAI Whisper      |
| AI Evaluation  | Google Gemini       |
| Source Control | GitHub              |

---

# 32. Live Application

InterviewIQ is available at:

```text
https://interview-iq-one-lovat.vercel.app/
```

---

# 33. Related Documentation

For more information, see:

```text
README.md
docs/setup.md
docs/architecture.md
docs/database.md
docs/api.md
```

---

# 34. Conclusion

InterviewIQ uses a distributed cloud deployment architecture where the frontend, backend, authentication, database, and storage services are hosted independently.

Vercel provides the production Next.js frontend, Render hosts the FastAPI backend, and Supabase provides authentication, PostgreSQL, and file storage.

This deployment structure keeps the application modular and allows each component to be managed and scaled independently.
