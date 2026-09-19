import type { Metadata } from "next";
import ExamTakeClient from "@/components/exam/ExamTakeClient";

type Props = { params: Promise<{ slug: string; attemptId: string }> };

export const metadata: Metadata = {
  title: "Sınav",
  robots: { index: false, follow: false },
};

export default async function ExamAttemptPage({ params }: Props) {
  const { slug, attemptId } = await params;
  return <ExamTakeClient attemptId={attemptId} examSlug={slug} />;
}
