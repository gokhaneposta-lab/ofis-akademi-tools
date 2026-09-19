import { requireExamSql } from "./db";
import { pickRandomQuestionIds } from "./selectQuestions";
import { computeScore } from "./scoring";
import type {
  ExamAttemptRow,
  ExamRow,
  PublicQuestion,
  QuestionOptionRow,
  ResultQuestionReview,
  ScoreBreakdown,
} from "./types";

function mapExam(r: Record<string, unknown>): ExamRow {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    description: r.description == null ? null : String(r.description),
    category: String(r.category),
    question_count: Number(r.question_count),
    duration_minutes: Number(r.duration_minutes),
    passing_score: Number(r.passing_score),
    is_active: Boolean(r.is_active),
    selection_rules: r.selection_rules ?? null,
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

function mapAttempt(r: Record<string, unknown>): ExamAttemptRow {
  return {
    id: String(r.id),
    exam_id: String(r.exam_id),
    status: r.status as ExamAttemptRow["status"],
    started_at: String(r.started_at),
    expires_at: String(r.expires_at),
    completed_at: r.completed_at == null ? null : String(r.completed_at),
    score: r.score == null ? null : Number(r.score),
    correct_count: r.correct_count == null ? null : Number(r.correct_count),
    wrong_count: r.wrong_count == null ? null : Number(r.wrong_count),
    blank_count: r.blank_count == null ? null : Number(r.blank_count),
    total_questions: Number(r.total_questions),
  };
}

export async function listActiveExams(): Promise<ExamRow[]> {
  const sql = requireExamSql();
  const rows = await sql`
    SELECT * FROM exams
    WHERE is_active = true
    ORDER BY title ASC
  `;
  return (rows as Record<string, unknown>[]).map(mapExam);
}

export async function getExamBySlug(slug: string): Promise<ExamRow | null> {
  const sql = requireExamSql();
  const rows = await sql`
    SELECT * FROM exams WHERE slug = ${slug} LIMIT 1
  `;
  const row = (rows as Record<string, unknown>[])[0];
  return row ? mapExam(row) : null;
}

export async function getExamById(id: string): Promise<ExamRow | null> {
  const sql = requireExamSql();
  const rows = await sql`
    SELECT * FROM exams WHERE id = ${id} LIMIT 1
  `;
  const row = (rows as Record<string, unknown>[])[0];
  return row ? mapExam(row) : null;
}

export async function countActiveQuestions(examId: string): Promise<number> {
  const sql = requireExamSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS c FROM questions
    WHERE exam_id = ${examId} AND is_active = true
  `;
  return Number((rows as { c: number }[])[0]?.c ?? 0);
}

export async function getAttempt(attemptId: string): Promise<ExamAttemptRow | null> {
  const sql = requireExamSql();
  const rows = await sql`
    SELECT * FROM exam_attempts WHERE id = ${attemptId} LIMIT 1
  `;
  const row = (rows as Record<string, unknown>[])[0];
  return row ? mapAttempt(row) : null;
}

/**
 * Server clock: if past expires_at and still in_progress, score and mark expired.
 * Returns updated attempt (may become expired with scores).
 */
export async function ensureAttemptFreshness(
  attempt: ExamAttemptRow,
  exam: ExamRow,
): Promise<ExamAttemptRow> {
  if (attempt.status !== "in_progress") return attempt;
  if (Date.now() < new Date(attempt.expires_at).getTime()) return attempt;
  const { attempt: expired } = await completeAttempt(attempt, exam, "expired");
  return expired;
}

export function remainingSeconds(expiresAt: string): number {
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 1000));
}

export async function startExamAttempt(exam: ExamRow): Promise<ExamAttemptRow> {
  const sql = requireExamSql();
  const activeCount = await countActiveQuestions(exam.id);
  if (activeCount < exam.question_count) {
    throw new Error(
      `Yetersiz aktif soru: havuzda ${activeCount}, sınav ${exam.question_count} soru istiyor`,
    );
  }

  const idRows = await sql`
    SELECT id FROM questions
    WHERE exam_id = ${exam.id} AND is_active = true
  `;
  const allIds = (idRows as { id: string }[]).map((r) => String(r.id));
  const selected = pickRandomQuestionIds(allIds, exam.question_count);

  const expiresAt = new Date(
    Date.now() + exam.duration_minutes * 60_000,
  ).toISOString();

  const attemptRows = await sql`
    INSERT INTO exam_attempts (
      exam_id, status, started_at, expires_at, total_questions
    ) VALUES (
      ${exam.id},
      'in_progress',
      now(),
      ${expiresAt},
      ${exam.question_count}
    )
    RETURNING *
  `;
  const attempt = mapAttempt((attemptRows as Record<string, unknown>[])[0]!);

  for (let i = 0; i < selected.length; i++) {
    await sql`
      INSERT INTO exam_attempt_questions (attempt_id, question_id, position)
      VALUES (${attempt.id}, ${selected[i]!}, ${i + 1})
    `;
  }

  return attempt;
}

export async function loadPublicAttemptQuestions(
  attemptId: string,
): Promise<PublicQuestion[]> {
  const sql = requireExamSql();
  const qRows = await sql`
    SELECT
      q.id,
      aq.position,
      q.category,
      q.difficulty,
      q.question_text,
      a.selected_option_id
    FROM exam_attempt_questions aq
    JOIN questions q ON q.id = aq.question_id
    LEFT JOIN exam_answers a
      ON a.attempt_id = aq.attempt_id AND a.question_id = aq.question_id
    WHERE aq.attempt_id = ${attemptId}
    ORDER BY aq.position ASC
  `;

  const questions: PublicQuestion[] = [];
  for (const row of qRows as Record<string, unknown>[]) {
    const qid = String(row.id);
    const optRows = await sql`
      SELECT id, option_key, option_text, sort_order
      FROM question_options
      WHERE question_id = ${qid}
      ORDER BY sort_order ASC, option_key ASC
    `;
    questions.push({
      id: qid,
      position: Number(row.position),
      category: String(row.category),
      difficulty: String(row.difficulty),
      question_text: String(row.question_text),
      selected_option_id:
        row.selected_option_id == null ? null : String(row.selected_option_id),
      options: (optRows as Record<string, unknown>[]).map((o) => ({
        id: String(o.id),
        option_key: String(o.option_key),
        option_text: String(o.option_text),
      })),
    });
  }
  return questions;
}

export async function upsertAnswer(opts: {
  attemptId: string;
  questionId: string;
  selectedOptionId: string | null;
}): Promise<void> {
  const sql = requireExamSql();

  const onAttempt = await sql`
    SELECT 1 FROM exam_attempt_questions
    WHERE attempt_id = ${opts.attemptId} AND question_id = ${opts.questionId}
    LIMIT 1
  `;
  if ((onAttempt as unknown[]).length === 0) {
    throw new Error("Soru bu attempt'ta yok");
  }

  if (opts.selectedOptionId) {
    const opt = await sql`
      SELECT id FROM question_options
      WHERE id = ${opts.selectedOptionId} AND question_id = ${opts.questionId}
      LIMIT 1
    `;
    if ((opt as unknown[]).length === 0) {
      throw new Error("Geçersiz seçenek");
    }
  }

  await sql`
    INSERT INTO exam_answers (attempt_id, question_id, selected_option_id, answered_at)
    VALUES (
      ${opts.attemptId},
      ${opts.questionId},
      ${opts.selectedOptionId},
      now()
    )
    ON CONFLICT (attempt_id, question_id) DO UPDATE SET
      selected_option_id = EXCLUDED.selected_option_id,
      answered_at = now()
  `;
}

export async function completeAttempt(
  attempt: ExamAttemptRow,
  exam: ExamRow,
  finalStatus: "completed" | "expired" = "completed",
): Promise<{ attempt: ExamAttemptRow; breakdown: ScoreBreakdown }> {
  const sql = requireExamSql();

  if (attempt.status === "completed" || attempt.status === "expired") {
    const breakdown = computeScore({
      totalQuestions: attempt.total_questions,
      correctCount: attempt.correct_count ?? 0,
      wrongCount: attempt.wrong_count ?? 0,
      blankCount: attempt.blank_count ?? 0,
      passingScore: exam.passing_score,
    });
    return { attempt, breakdown };
  }

  const snapshot = await sql`
    SELECT aq.question_id, aq.position
    FROM exam_attempt_questions aq
    WHERE aq.attempt_id = ${attempt.id}
    ORDER BY aq.position ASC
  `;

  let correct = 0;
  let wrong = 0;
  let blank = 0;

  for (const row of snapshot as { question_id: string }[]) {
    const qid = String(row.question_id);
    const ansRows = await sql`
      SELECT selected_option_id FROM exam_answers
      WHERE attempt_id = ${attempt.id} AND question_id = ${qid}
      LIMIT 1
    `;
    const selected = (ansRows as { selected_option_id: string | null }[])[0]
      ?.selected_option_id;

    if (!selected) {
      blank += 1;
      await sql`
        INSERT INTO exam_answers (attempt_id, question_id, selected_option_id, is_correct, answered_at)
        VALUES (${attempt.id}, ${qid}, NULL, NULL, now())
        ON CONFLICT (attempt_id, question_id) DO UPDATE SET
          is_correct = NULL
      `;
      continue;
    }

    const correctOpt = await sql`
      SELECT id FROM question_options
      WHERE question_id = ${qid} AND is_correct = true
      LIMIT 1
    `;
    const correctId = String((correctOpt as { id: string }[])[0]?.id ?? "");
    const isCorrect = correctId === String(selected);
    if (isCorrect) correct += 1;
    else wrong += 1;

    await sql`
      UPDATE exam_answers
      SET is_correct = ${isCorrect}
      WHERE attempt_id = ${attempt.id} AND question_id = ${qid}
    `;
  }

  const breakdown = computeScore({
    totalQuestions: attempt.total_questions,
    correctCount: correct,
    wrongCount: wrong,
    blankCount: blank,
    passingScore: exam.passing_score,
  });

  const updated = await sql`
    UPDATE exam_attempts
    SET
      status = ${finalStatus},
      completed_at = now(),
      score = ${breakdown.score},
      correct_count = ${breakdown.correct_count},
      wrong_count = ${breakdown.wrong_count},
      blank_count = ${breakdown.blank_count},
      updated_at = now()
    WHERE id = ${attempt.id} AND status = 'in_progress'
    RETURNING *
  `;

  const row = (updated as Record<string, unknown>[])[0];
  if (!row) {
    const current = await getAttempt(attempt.id);
    if (!current) throw new Error("Attempt bulunamadı");
    return completeAttempt(current, exam, finalStatus);
  }

  return {
    attempt: mapAttempt(row),
    breakdown,
  };
}

export async function finishAttempt(
  attempt: ExamAttemptRow,
  exam: ExamRow,
): Promise<{ attempt: ExamAttemptRow; breakdown: ScoreBreakdown }> {
  return completeAttempt(attempt, exam, "completed");
}

export async function loadResultReview(
  attemptId: string,
): Promise<ResultQuestionReview[]> {
  const sql = requireExamSql();
  const rows = await sql`
    SELECT
      aq.position,
      q.id AS question_id,
      q.question_text,
      q.category,
      q.explanation,
      q.is_dummy,
      a.selected_option_id,
      a.is_correct,
      so.option_key AS selected_option_key,
      so.option_text AS selected_option_text,
      co.id AS correct_option_id,
      co.option_key AS correct_option_key,
      co.option_text AS correct_option_text
    FROM exam_attempt_questions aq
    JOIN questions q ON q.id = aq.question_id
    LEFT JOIN exam_answers a
      ON a.attempt_id = aq.attempt_id AND a.question_id = aq.question_id
    LEFT JOIN question_options so ON so.id = a.selected_option_id
    JOIN question_options co
      ON co.question_id = q.id AND co.is_correct = true
    WHERE aq.attempt_id = ${attemptId}
    ORDER BY aq.position ASC
  `;

  return (rows as Record<string, unknown>[]).map((r) => {
    const selectedId =
      r.selected_option_id == null ? null : String(r.selected_option_id);
    const isBlank = !selectedId;
    return {
      position: Number(r.position),
      question_id: String(r.question_id),
      question_text: String(r.question_text),
      category: String(r.category),
      selected_option_id: selectedId,
      selected_option_key:
        r.selected_option_key == null ? null : String(r.selected_option_key),
      selected_option_text:
        r.selected_option_text == null ? null : String(r.selected_option_text),
      correct_option_id: String(r.correct_option_id),
      correct_option_key: String(r.correct_option_key),
      correct_option_text: String(r.correct_option_text),
      is_correct: isBlank ? null : Boolean(r.is_correct),
      is_blank: isBlank,
      explanation: r.explanation == null ? null : String(r.explanation),
      is_dummy: Boolean(r.is_dummy),
    };
  });
}

export type { QuestionOptionRow };
