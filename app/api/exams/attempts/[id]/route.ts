import { NextResponse } from "next/server";
import { isExamDbConfigured } from "@/lib/exam/db";
import {
  ensureAttemptFreshness,
  getAttempt,
  getExamById,
  loadPublicAttemptQuestions,
  remainingSeconds,
} from "@/lib/exam/queries";

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

  if (attempt.status !== "in_progress") {
    return NextResponse.json({
      ok: true,
      status: attempt.status,
      redirectTo: `/sinav/${exam.slug}/result/${attempt.id}`,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        expiresAt: attempt.expires_at,
        remainingSeconds: 0,
        totalQuestions: attempt.total_questions,
      },
      exam: { slug: exam.slug, title: exam.title },
      questions: [],
    });
  }

  const questions = await loadPublicAttemptQuestions(attempt.id);
  return NextResponse.json({
    ok: true,
    status: attempt.status,
    attempt: {
      id: attempt.id,
      status: attempt.status,
      expiresAt: attempt.expires_at,
      remainingSeconds: remainingSeconds(attempt.expires_at),
      totalQuestions: attempt.total_questions,
    },
    exam: {
      slug: exam.slug,
      title: exam.title,
      passing_score: exam.passing_score,
    },
    questions,
  });
}
