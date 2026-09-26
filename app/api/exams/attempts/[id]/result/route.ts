import { NextResponse } from "next/server";
import { isExamDbConfigured } from "@/lib/exam/db";
import {
  ensureAttemptFreshness,
  getAttempt,
  getExamById,
  loadResultReview,
} from "@/lib/exam/queries";
import { computeScore } from "@/lib/exam/scoring";
import { parseSelectionRules, sectionKeyForCategory } from "@/lib/exam/sections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!isExamDbConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL yok" }, { status: 503 });
  }
  const { id } = await ctx.params;
  let attempt = await getAttempt(id);
  if (!attempt) {
    return NextResponse.json({ error: "Attempt bulunamadı" }, { status: 404 });
  }
  const exam = await getExamById(attempt.exam_id);
  if (!exam) {
    return NextResponse.json({ error: "Sınav bulunamadı" }, { status: 404 });
  }

  attempt = await ensureAttemptFreshness(attempt, exam);

  if (attempt.status === "in_progress") {
    return NextResponse.json(
      { error: "Sınav henüz tamamlanmadı", redirectTo: `/sinav/${exam.slug}/attempt/${attempt.id}` },
      { status: 409 },
    );
  }

  const review = await loadResultReview(attempt.id);
  const breakdown = computeScore({
    totalQuestions: attempt.total_questions,
    correctCount: attempt.correct_count ?? 0,
    wrongCount: attempt.wrong_count ?? 0,
    blankCount: attempt.blank_count ?? 0,
    passingScore: exam.passing_score,
  });

  const hasDummy = review.some((r) => r.is_dummy);

  const rules = parseSelectionRules(exam.selection_rules);
  const sections = rules
    ? rules.sections
        .map((s) => {
          const items = review.filter(
            (r) => sectionKeyForCategory(r.category, rules) === s.key,
          );
          return {
            key: s.key,
            label: s.label,
            total: items.length,
            correct: items.filter((r) => r.is_correct === true).length,
          };
        })
        .filter((s) => s.total > 0)
    : [];

  return NextResponse.json({
    ok: true,
    exam: {
      slug: exam.slug,
      title: exam.title,
      passing_score: exam.passing_score,
    },
    attempt: {
      id: attempt.id,
      status: attempt.status,
      started_at: attempt.started_at,
      completed_at: attempt.completed_at,
      expires_at: attempt.expires_at,
    },
    ...breakdown,
    sections,
    review,
    dummyNotice: hasDummy
      ? "Bu denemede test (dummy) sorular yer alıyor olabilir."
      : undefined,
  });
}
