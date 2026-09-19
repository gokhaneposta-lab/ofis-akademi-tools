import { NextResponse } from "next/server";
import { attemptCookieOptions, EXAM_ATTEMPT_COOKIE } from "@/lib/exam/cookies";
import { isExamDbConfigured } from "@/lib/exam/db";
import { getExamBySlug, remainingSeconds, startExamAttempt } from "@/lib/exam/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  if (!isExamDbConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL yok" }, { status: 503 });
  }
  const { slug } = await ctx.params;
  const exam = await getExamBySlug(slug);
  if (!exam || !exam.is_active) {
    return NextResponse.json({ error: "Sınav bulunamadı" }, { status: 404 });
  }

  try {
    const attempt = await startExamAttempt(exam);
    const maxAge = Math.ceil(
      (new Date(attempt.expires_at).getTime() - Date.now()) / 1000,
    ) + 3600;
    const res = NextResponse.json({
      ok: true,
      attemptId: attempt.id,
      examSlug: exam.slug,
      totalQuestions: attempt.total_questions,
      expiresAt: attempt.expires_at,
      remainingSeconds: remainingSeconds(attempt.expires_at),
      redirectTo: `/sinav/${exam.slug}/attempt/${attempt.id}`,
    });
    res.cookies.set(EXAM_ATTEMPT_COOKIE, attempt.id, attemptCookieOptions(maxAge));
    return res;
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Sınav başlatılamadı", detail }, { status: 400 });
  }
}
