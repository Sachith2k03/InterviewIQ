-- ============================================================
-- InterviewIQ
-- Migration 004 - Indexes & Views
-- ============================================================

----------------------------------------------------------
-- PERFORMANCE INDEXES
----------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_interviews_status
ON interviews(status);

CREATE INDEX IF NOT EXISTS idx_interviews_created_at
ON interviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_overall_score
ON interview_reports(overall_score DESC);

CREATE INDEX IF NOT EXISTS idx_responses_created_at
ON interview_responses(created_at DESC);

----------------------------------------------------------
-- INTERVIEW HISTORY VIEW
----------------------------------------------------------

CREATE OR REPLACE VIEW interview_history_view AS

SELECT

    i.id,

    i.user_id,

    i.job_role,

    i.interview_type,

    i.difficulty,

    i.question_count,

    i.status,

    i.created_at,

    i.started_at,

    i.completed_at,

    r.title AS resume_title,

    rep.overall_score,

    rep.technical_score,

    rep.communication_score,

    rep.confidence_score,

    rep.fluency_score,

    rep.pdf_path

FROM interviews i

LEFT JOIN resumes r
ON r.id = i.resume_id

LEFT JOIN interview_reports rep
ON rep.interview_id = i.id;

----------------------------------------------------------
-- USER STATISTICS VIEW
----------------------------------------------------------

CREATE OR REPLACE VIEW user_statistics_view AS

SELECT

    i.user_id,

    COUNT(i.id) AS total_interviews,

    ROUND(AVG(rep.overall_score), 2) AS average_score,

    MAX(i.created_at) AS last_interview,

    MAX(rep.overall_score) AS best_score

FROM interviews i

LEFT JOIN interview_reports rep
ON rep.interview_id = i.id

GROUP BY i.user_id;