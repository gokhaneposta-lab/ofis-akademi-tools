import type { Metadata } from "next";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import ExamQuizJsonLd from "@/components/exam/ExamQuizJsonLd";
import { isExamDbConfigured } from "@/lib/exam/db";
import { countActiveQuestions, getExamBySlug } from "@/lib/exam/queries";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import ExamLandingClient, { type ExamMeta } from "./ExamLandingClient";

type Props = { params: Promise<{ slug: string }> };

const BASE = getSiteUrl();

const TFRS17_SEO = {
  title: "TFRS 17 Deneme Sınavı (Ücretsiz) — 50 Soru, 60 Dakika | Ofis Akademi",
  description:
    "Ücretsiz TFRS 17 (IFRS 17) online deneme sınavı. 450 soruluk havuzdan rastgele 50 soru, 60 dakika, %70 baraj. Giriş gerekmez; anında skor ve açıklama.",
  keywords: [
    "TFRS 17 sınav",
    "TFRS 17 deneme sınavı",
    "IFRS 17 deneme",
    "IFRS 17 sınav",
    "TFRS 17 test",
    "sigorta muhasebe sınavı",
    "CSM sınav",
    "finans sertifika hazırlık",
  ],
};

async function loadExamMeta(slug: string): Promise<ExamMeta | null> {
  if (!isExamDbConfigured()) return null;
  try {
    const exam = await getExamBySlug(slug);
    if (!exam || !exam.is_active) return null;
    const bank_size = await countActiveQuestions(exam.id);
    return {
      slug: exam.slug,
      title: exam.title,
      description: exam.description,
      category: exam.category,
      question_count: exam.question_count,
      duration_minutes: exam.duration_minutes,
      passing_score: exam.passing_score,
      bank_size,
      ready: bank_size >= exam.question_count,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = await loadExamMeta(slug);
  const path = `/sinav/${slug}`;

  if (slug === "tfrs-17") {
    return {
      title: TFRS17_SEO.title,
      description: TFRS17_SEO.description,
      keywords: TFRS17_SEO.keywords,
      alternates: { canonical: canonicalUrl(path) },
      openGraph: {
        title: "TFRS 17 Deneme Sınavı — Ücretsiz Online | Ofis Akademi",
        description: TFRS17_SEO.description,
        url: `${BASE}${path}`,
        siteName: "Ofis Akademi",
        locale: "tr_TR",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: "TFRS 17 Deneme Sınavı (Ücretsiz)",
        description: TFRS17_SEO.description,
      },
    };
  }

  const title = exam?.title ?? `Sınav: ${slug}`;
  const description =
    exam?.description ??
    "Online deneme sınavı — Ofis Akademi. Giriş gerekmez, anında sonuç.";

  return {
    title: `${title} | Ofis Akademi`,
    description,
    alternates: { canonical: canonicalUrl(path) },
    openGraph: {
      title,
      description,
      url: `${BASE}${path}`,
      siteName: "Ofis Akademi",
      locale: "tr_TR",
      type: "website",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ExamLandingPage({ params }: Props) {
  const { slug } = await params;
  const exam = await loadExamMeta(slug);
  const title = exam?.title ?? (slug === "tfrs-17" ? "TFRS 17 Deneme Sınavı" : `Sınav: ${slug}`);
  const description =
    exam?.description ??
    TFRS17_SEO.description;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Ana Sayfa", path: "/" },
          { name: "Sınavlar", path: "/sinav" },
          { name: title, path: `/sinav/${slug}` },
        ]}
      />
      {exam ? (
        <ExamQuizJsonLd
          name={exam.title}
          description={description}
          slug={exam.slug}
          questionCount={exam.question_count}
          durationMinutes={exam.duration_minutes}
          bankSize={exam.bank_size}
        />
      ) : null}
      <ExamLandingClient slug={slug} initialExam={exam} />
    </>
  );
}
