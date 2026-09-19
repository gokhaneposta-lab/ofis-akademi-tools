-- Generic Exam Engine V1
-- Excel/CSV import-ready question bank; guest attempts; server-authoritative timer

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  question_count integer NOT NULL CHECK (question_count > 0),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  passing_score integer NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  is_active boolean NOT NULL DEFAULT true,
  selection_rules jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exams_active ON exams (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_exams_category ON exams (category);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams (id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'genel',
  difficulty text NOT NULL DEFAULT 'medium',
  question_text text NOT NULL,
  explanation text,
  source text,
  external_id text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_dummy boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_questions_exam_active
  ON questions (exam_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_questions_exam_category
  ON questions (exam_id, category);
CREATE INDEX IF NOT EXISTS idx_questions_external
  ON questions (exam_id, external_id);

CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
  option_key text NOT NULL CHECK (option_key IN ('A', 'B', 'C', 'D', 'E')),
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  UNIQUE (question_id, option_key)
);

CREATE INDEX IF NOT EXISTS idx_question_options_question
  ON question_options (question_id);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams (id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'expired')),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  score integer,
  correct_count integer,
  wrong_count integer,
  blank_count integer,
  total_questions integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam ON exam_attempts (exam_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts (status);

CREATE TABLE IF NOT EXISTS exam_attempt_questions (
  attempt_id uuid NOT NULL REFERENCES exam_attempts (id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions (id) ON DELETE RESTRICT,
  position integer NOT NULL CHECK (position >= 1),
  PRIMARY KEY (attempt_id, question_id),
  UNIQUE (attempt_id, position)
);

CREATE INDEX IF NOT EXISTS idx_attempt_questions_attempt
  ON exam_attempt_questions (attempt_id, position);

CREATE TABLE IF NOT EXISTS exam_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES exam_attempts (id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions (id) ON DELETE RESTRICT,
  selected_option_id uuid REFERENCES question_options (id) ON DELETE SET NULL,
  is_correct boolean,
  answered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt
  ON exam_answers (attempt_id);
