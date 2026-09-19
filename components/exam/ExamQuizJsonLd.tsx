import { getSiteUrl } from "@/lib/site";

type Props = {
  name: string;
  description: string;
  slug: string;
  questionCount: number;
  durationMinutes: number;
  bankSize?: number;
};

/** Schema.org Quiz — sınav landing SEO. */
export default function ExamQuizJsonLd({
  name,
  description,
  slug,
  questionCount,
  durationMinutes,
  bankSize,
}: Props) {
  const base = getSiteUrl();
  const url = `${base}/sinav/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name,
    description,
    url,
    inLanguage: "tr-TR",
    isAccessibleForFree: true,
    educationalLevel: "professional",
    learningResourceType: "Practice test",
    numberOfQuestions: questionCount,
    timeRequired: `PT${durationMinutes}M`,
    provider: {
      "@type": "Organization",
      name: "Ofis Akademi",
      url: base,
    },
    ...(bankSize != null && bankSize > 0
      ? { about: `${bankSize} soruluk havuzdan rastgele seçim` }
      : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
