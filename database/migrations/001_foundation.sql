-- ============================================================
-- InterviewIQ
-- Migration 001 - Foundation
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

----------------------------------------------------------
-- ENUMS
----------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'interview_difficulty'
    ) THEN
        CREATE TYPE interview_difficulty AS ENUM (
            'easy',
            'medium',
            'hard'
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'interview_status'
    ) THEN
        CREATE TYPE interview_status AS ENUM (
            'pending',
            'in_progress',
            'completed',
            'cancelled'
        );
    END IF;
END $$;

----------------------------------------------------------
-- updated_at Trigger Function
----------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;