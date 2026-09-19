import type { Metadata } from "next";
import ExamLandingClient from "./ExamLandingClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug === "tfrs-17" ? "TFRS 17 Deneme Sınavı" : `Sınav: ${slug}`,
    description: "Online deneme sınavı — Ofis Akademi",
  };
}

export default async function ExamLandingPage({ params }: Props) {
  const { slug } = await params;
  return <ExamLandingClient slug={slug} />;
}
