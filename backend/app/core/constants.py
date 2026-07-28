"""
Application constants.
"""


# API
API_V1_PREFIX = "/api/v1"

# Storage Buckets
RESUME_BUCKET = "resumes"
REPORT_BUCKET = "reports"
AUDIO_BUCKET = "audio"

# File Upload
ALLOWED_RESUME_MIME_TYPES = [
    "application/pdf",
]

MAX_RESUME_SIZE = 5 * 1024 * 1024  # 5 MB

# Audio Upload
ALLOWED_AUDIO_MIME_TYPES = [
    "audio/wav",
    "audio/mpeg",
    "audio/webm",
    "video/webm",
]
MAX_AUDIO_SIZE = 50 * 1024 * 1024  # 50 MB

# Authentication
BEARER_PREFIX = "Bearer "

# Interview Defaults
DEFAULT_QUESTION_COUNT = 10


# Success Messages
MSG_RESUME_UPLOADED = "Resume uploaded successfully."
MSG_PROFILE_CREATED = "Profile created successfully."
MSG_AUTH_SUCCESS = "Authenticated user retrieved successfully."
MSG_INTERVIEW_CREATED = "Interview created successfully."
MSG_REPORT_GENERATED = "Report generated successfully."




