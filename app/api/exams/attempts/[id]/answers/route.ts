import { NextResponse } from "next/server";
import { isExamDbConfigured } from "@/lib/exam/db";
import {
  ensureAttemptFreshness,
  getAttempt,
  getExamById,
  upsertAnswer,
} from "@/lib/exam/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
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
    return NextResponse.json(
      {
        error: "Süre doldu veya sınav bitti; cevap kaydedilemez.",
        status: attempt.status,
        redirectTo: `/sinav/${exam.slug}/result/${attempt.id}`,
      },
      { status: 410 },
    );
  }

  let body: { questionId?: string; selectedOptionId?: string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }
  if (!body.questionId) {
    return NextResponse.json({ error: "questionId gerekli" }, { status: 400 });
  }

  try {
    await upsertAnswer({
      attemptId: attempt.id,
      questionId: body.questionId,
      selectedOptionId: body.selectedOptionId ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Cevap kaydedilemedi", detail }, { status: 400 });
  }
}
