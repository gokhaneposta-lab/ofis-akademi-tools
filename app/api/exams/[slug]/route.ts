import { NextResponse } from "next/server";
import { isExamDbConfigured } from "@/lib/exam/db";
import { countActiveQuestions, getExamBySlug } from "@/lib/exam/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  if (!isExamDbConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL yok" }, { status: 503 });
  }
  const { slug } = await ctx.params;
  const exam = await getExamBySlug(slug);
  if (!exam || !exam.is_active) {
    return NextResponse.json({ error: "Sınav bulunamadı" }, { status: 404 });
  }
  const bankSize = await countActiveQuestions(exam.id);
  return NextResponse.json({
    ok: true,
    exam: {
      slug: exam.slug,
      title: exam.title,
      description: exam.description,
      category: exam.category,
      question_count: exam.question_count,
      duration_minutes: exam.duration_minutes,
      passing_score: exam.passing_score,
      bank_size: bankSize,
      ready: bankSize >= exam.question_count,
    },
  });
}
