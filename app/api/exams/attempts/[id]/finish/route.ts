import { NextResponse } from "next/server";
import { isExamDbConfigured } from "@/lib/exam/db";
import {
  ensureAttemptFreshness,
  finishAttempt,
  getAttempt,
  getExamById,
} from "@/lib/exam/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
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

  // Timer may have expired — auto-score as expired
  attempt = await ensureAttemptFreshness(attempt, exam);
  if (attempt.status === "expired" || attempt.status === "completed") {
    return NextResponse.json({
      ok: true,
      alreadyFinished: true,
      status: attempt.status,
      redirectTo: `/sinav/${exam.slug}/result/${attempt.id}`,
      score: attempt.score,
    });
  }

  try {
    const { attempt: finished, breakdown } = await finishAttempt(attempt, exam);
    return NextResponse.json({
      ok: true,
      status: finished.status,
      redirectTo: `/sinav/${exam.slug}/result/${finished.id}`,
      ...breakdown,
      passing_score: exam.passing_score,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Bitirme başarısız", detail }, { status: 500 });
  }
}
