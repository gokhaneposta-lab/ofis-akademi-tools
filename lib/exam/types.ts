export type ExamStatus = "in_progress" | "completed" | "expired";

export type ExamRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  question_count: number;
  duration_minutes: number;
  passing_score: number;
  is_active: boolean;
  selection_rules: unknown | null;
  created_at: string;
  updated_at: string;
};

export type QuestionRow = {
  id: string;
  exam_id: string;
  category: string;
  difficulty: string;
  question_text: string;
  explanation: string | null;
  source: string | null;
  external_id: string | null;
  sort_order: number;
  is_active: boolean;
  is_dummy: boolean;
};

export type QuestionOptionRow = {
  id: string;
  question_id: string;
  option_key: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
};

/** Client-safe option (no is_correct). */
export type PublicOption = {
  id: string;
  option_key: string;
  option_text: string;
};

export type PublicQuestion = {
  id: string;
  position: number;
  category: string;
  difficulty: string;
  question_text: string;
  options: PublicOption[];
  selected_option_id: string | null;
};

export type ExamAttemptRow = {
  id: string;
  exam_id: string;
  status: ExamStatus;
  started_at: string;
  expires_at: string;
  completed_at: string | null;
  score: number | null;
  correct_count: number | null;
  wrong_count: number | null;
  blank_count: number | null;
  total_questions: number;
};

export type ScoreBreakdown = {
  score: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  total_questions: number;
  passed: boolean;
};

export type ResultQuestionReview = {
  position: number;
  question_id: string;
  question_text: string;
  category: string;
  selected_option_id: string | null;
  selected_option_key: string | null;
  selected_option_text: string | null;
  correct_option_id: string;
  correct_option_key: string;
  correct_option_text: string;
  is_correct: boolean | null;
  is_blank: boolean;
  explanation: string | null;
  is_dummy: boolean;
};
