import type { Metadata } from "next";
import ExamResultClient from "@/components/exam/ExamResultClient";

type Props = { params: Promise<{ slug: string; attemptId: string }> };

export const metadata: Metadata = {
  title: "Sınav Sonucu",
  robots: { index: false, follow: false },
};

export default async function ExamResultPage({ params }: Props) {
  const { slug, attemptId } = await params;
  return <ExamResultClient attemptId={attemptId} examSlug={slug} />;
}
