import { NextResponse } from "next/server";
import { ExamDbNotConfiguredError, isExamDbConfigured } from "@/lib/exam/db";
import { listActiveExams } from "@/lib/exam/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isExamDbConfigured()) {
    return NextResponse.json(
      { error: "Sınav veritabanı yapılandırılmamış (DATABASE_URL)." },
      { status: 503 },
    );
  }
  try {
    const exams = await listActiveExams();
    return NextResponse.json({
      ok: true,
      exams: exams.map((e) => ({
        slug: e.slug,
        title: e.title,
        description: e.description,
        category: e.category,
        question_count: e.question_count,
        duration_minutes: e.duration_minutes,
        passing_score: e.passing_score,
      })),
    });
  } catch (e) {
    if (e instanceof ExamDbNotConfiguredError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Liste alınamadı", detail }, { status: 500 });
  }
}
