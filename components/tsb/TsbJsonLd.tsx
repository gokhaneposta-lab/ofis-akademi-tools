/**
 * TSB dashboard sayfaları — görünmez JSON-LD (Google için).
 * BreadcrumbList + WebPage + Dataset
 */

import { getSiteUrl } from "@/lib/site";
import { tsbSeoFaqsFor } from "@/lib/tsbSeoContent";
import {
  tsbHubBreadcrumbItems,
  tsbPanelBreadcrumbItems,
  TSB_SEO,
  type TsbSeoPage,
  type TsbSeoPageId,
} from "@/lib/tsbSeo";

type Props = {
  page: TsbSeoPage;
  /** hub sayfası tek seviye breadcrumb; paneller hub altında */
  variant?: "hub" | "panel";
  /** Veri dosyası güncelleme tarihi (ISO) — hub için önerilir */
  dateModified?: string;
  /** FAQ kaynağı — panel/hub seoPageId */
  seoPageId?: TsbSeoPageId | "hub";
};

export default function TsbJsonLd({ page, variant = "panel", dateModified, seoPageId }: Props) {
  const baseUrl = getSiteUrl();
  const url = `${baseUrl}${page.path}`;
  const isHub = variant === "hub";
  const faqs = seoPageId ? tsbSeoFaqsFor(seoPageId) : [];

  const breadcrumbItems = isHub
    ? tsbHubBreadcrumbItems(baseUrl, page)
    : tsbPanelBreadcrumbItems(baseUrl, page);

  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.jsonLdName,
    description: page.description,
    url,
    inLanguage: "tr-TR",
    isPartOf: {
      "@type": "WebSite",
      name: "Ofis Akademi",
      url: baseUrl,
    },
    ...(dateModified ? { dateModified } : {}),
    keywords: page.keywords.join(", "),
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: page.jsonLdName,
    description: page.description,
    url,
    keywords: page.keywords.join(", "),
    inLanguage: "tr-TR",
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: "Türkiye Sigortalar Birliği",
      url: "https://www.tsb.org.tr",
    },
    provider: {
      "@type": "Organization",
      name: "Ofis Akademi",
      url: baseUrl,
    },
    ...(dateModified ? { dateModified } : {}),
    ...(isHub
      ? {
          hasPart: Object.values(TSB_SEO)
            .filter((p) => p.path !== TSB_SEO.hub.path)
            .map((p) => ({
              "@type": "DataCatalog",
              name: p.jsonLdName,
              url: `${baseUrl}${p.path}`,
            })),
        }
      : {}),
  };

  const payload: Record<string, unknown>[] = [breadcrumbListSchema, webPageSchema, datasetSchema];

  if (faqs.length > 0) {
    payload.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
