-- ============================================================
-- InterviewIQ
-- Migration 002 - Profiles & Resumes
-- ============================================================

----------------------------------------------------------
-- PROFILES
----------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (

    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    full_name TEXT,

    avatar_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

----------------------------------------------------------
-- RESUMES
----------------------------------------------------------

CREATE TABLE IF NOT EXISTS resumes (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    file_name TEXT NOT NULL,

    storage_path TEXT NOT NULL,

    parsed_text TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

----------------------------------------------------------
-- INDEXES
----------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_resumes_user_id
ON resumes(user_id);

CREATE INDEX IF NOT EXISTS idx_resumes_created_at
ON resumes(created_at DESC);

----------------------------------------------------------
-- updated_at Triggers
----------------------------------------------------------

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


DROP TRIGGER IF EXISTS resumes_updated_at ON resumes;

CREATE TRIGGER resumes_updated_at
BEFORE UPDATE ON resumes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();