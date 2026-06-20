#Application-wide constants

#API
API_V1_PREFIX = "/api/v1"



#Application
APP_DESCRIPTION = (
    "InterviewIQ is an AI-powered mock interview platform "
    "that analyzes resumes, conducts interviews, and "
    "generates detailed feedback reports."
)



#Storage Buckets
RESUME_BUCKET = "resumes"
AUDIO_BUCKET = "interview-audio"
REPORT_BUCKET = "reports"


#Supported File Types
ALLOWED_RESUME_TYPES = {
    "application/pdf",
}

MAX_RESUME_SIZE = 5 * 1024 * 1024  # 5 MB 



#AI Models
GEMINI_MODEL = "gemini-2.5-flash"
WHISPER_MODEL = "base"



#LIMITS
MAX_AUDIO_SIZE_MB = 25
MAX_INTERVIEW_QUESTIONS = 10


