-- ============================================================
-- InterviewIQ
-- Migration 003 - Interviews
-- ============================================================

----------------------------------------------------------
-- Interview Type ENUM
----------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'interview_type'
    ) THEN
        CREATE TYPE interview_type AS ENUM (
            'technical',
            'behavioral',
            'hr',
            'mixed'
        );
    END IF;
END $$;

----------------------------------------------------------
-- INTERVIEWS
----------------------------------------------------------

CREATE TABLE IF NOT EXISTS interviews (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    resume_id UUID
        REFERENCES resumes(id)
        ON DELETE SET NULL,

    job_role TEXT NOT NULL,

    interview_type interview_type NOT NULL,

    difficulty interview_difficulty NOT NULL,

    question_count INTEGER NOT NULL DEFAULT 10
        CHECK (question_count BETWEEN 1 AND 50),

    status interview_status NOT NULL DEFAULT 'pending',

    started_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

----------------------------------------------------------
-- INTERVIEW RESPONSES
----------------------------------------------------------

CREATE TABLE IF NOT EXISTS interview_responses (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    interview_id UUID NOT NULL
        REFERENCES interviews(id)
        ON DELETE CASCADE,

    question_number INTEGER NOT NULL,

    question TEXT NOT NULL,

    audio_path TEXT,

    transcript TEXT,

    technical_score NUMERIC(5,2),

    communication_score NUMERIC(5,2),

    confidence_score NUMERIC(5,2),

    fluency_score NUMERIC(5,2),

    overall_score NUMERIC(5,2),

    feedback TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_question_number
        UNIQUE(interview_id, question_number),

    CONSTRAINT chk_technical
        CHECK (
            technical_score IS NULL
            OR technical_score BETWEEN 0 AND 100
        ),

    CONSTRAINT chk_communication
        CHECK (
            communication_score IS NULL
            OR communication_score BETWEEN 0 AND 100
        ),

    CONSTRAINT chk_confidence
        CHECK (
            confidence_score IS NULL
            OR confidence_score BETWEEN 0 AND 100
        ),

    CONSTRAINT chk_fluency
        CHECK (
            fluency_score IS NULL
            OR fluency_score BETWEEN 0 AND 100
        ),

    CONSTRAINT chk_overall
        CHECK (
            overall_score IS NULL
            OR overall_score BETWEEN 0 AND 100
        )
);

----------------------------------------------------------
-- INTERVIEW REPORTS
----------------------------------------------------------

CREATE TABLE IF NOT EXISTS interview_reports (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    interview_id UUID UNIQUE NOT NULL
        REFERENCES interviews(id)
        ON DELETE CASCADE,

    overall_score NUMERIC(5,2)
        CHECK (overall_score BETWEEN 0 AND 100),

    technical_score NUMERIC(5,2)
        CHECK (technical_score BETWEEN 0 AND 100),

    communication_score NUMERIC(5,2)
        CHECK (communication_score BETWEEN 0 AND 100),

    confidence_score NUMERIC(5,2)
        CHECK (confidence_score BETWEEN 0 AND 100),

    fluency_score NUMERIC(5,2)
        CHECK (fluency_score BETWEEN 0 AND 100),

    strengths TEXT[],

    weaknesses TEXT[],

    suggestions TEXT[],

    pdf_path TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

----------------------------------------------------------
-- INDEXES
----------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_interviews_user
ON interviews(user_id);

CREATE INDEX IF NOT EXISTS idx_interviews_resume
ON interviews(resume_id);

CREATE INDEX IF NOT EXISTS idx_interview_responses_interview
ON interview_responses(interview_id);

CREATE INDEX IF NOT EXISTS idx_interview_reports_interview
ON interview_reports(interview_id);

----------------------------------------------------------
-- TRIGGERS
----------------------------------------------------------

DROP TRIGGER IF EXISTS interviews_updated_at ON interviews;

CREATE TRIGGER interviews_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS interview_responses_updated_at ON interview_responses;

CREATE TRIGGER interview_responses_updated_at
BEFORE UPDATE ON interview_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS interview_reports_updated_at ON interview_reports;

CREATE TRIGGER interview_reports_updated_at
BEFORE UPDATE ON interview_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();