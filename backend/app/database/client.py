from supabase import Client, create_client

from app.core.config import settings

# Used ONLY for authentication
supabase_auth: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY,
)

# Used for backend database/storage operations
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)