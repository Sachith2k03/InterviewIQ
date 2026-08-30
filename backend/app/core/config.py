from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Application 
    APP_NAME: str = "InterviewIQ API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Supabase 
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    #AI
    GEMINI_API_KEY: str
    CLOUDFLARE_ACCOUNT_ID: str
    CLOUDFLARE_API_TOKEN: str

    model_config = SettingsConfigDict(
        env_file=".env", 
        case_sensitive=True,
    )

settings = Settings()
