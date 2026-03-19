/**
 * Excel araç sayfaları için JSON-LD şema çıktısı.
 * - BreadcrumbList
 * - SoftwareApplication
 * - HowTo
 * - FAQPage
 */

type BreadcrumbItem = { name: string; url: string };

type FAQItem = {
  question: string;
  answer: string;
};

type ToolJsonLdProps = {
  name: string;
  description: string;
  path: string;
  howToSteps: string[];
  faq: FAQItem[];
  keywords?: string[];
  breadcrumb?: BreadcrumbItem[];
};

function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";
}

export default function ToolJsonLd({
  name,
  description,
  path,
  howToSteps,
  faq,
  keywords = [],
  breadcrumb,
}: ToolJsonLdProps) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const defaultBreadcrumb: BreadcrumbItem[] = [
    { name: "Ofis Akademi", url: `${baseUrl}/` },
    { name: "Excel Araçları", url: `${baseUrl}/excel-araclari` },
    { name, url },
  ];

  const items = breadcrumb ?? defaultBreadcrumb;

  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    ...(keywords.length > 0 ? { keywords: keywords.join(", ") } : {}),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: howToSteps.map((txt, idx) => ({
      "@type": "HowToStep",
      position: idx + 1,
      text: txt,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

