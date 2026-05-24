/**
 * TSB dashboard sayfaları — görünmez JSON-LD (Google için).
 * BreadcrumbList + WebPage + Dataset
 */

import { getSiteUrl } from "@/lib/site";
import {
  tsbHubBreadcrumbItems,
  tsbPanelBreadcrumbItems,
  TSB_SEO,
  type TsbSeoPage,
} from "@/lib/tsbSeo";

type Props = {
  page: TsbSeoPage;
  /** hub sayfası tek seviye breadcrumb; paneller hub altında */
  variant?: "hub" | "panel";
  /** Veri dosyası güncelleme tarihi (ISO) — hub için önerilir */
  dateModified?: string;
};

export default function TsbJsonLd({ page, variant = "panel", dateModified }: Props) {
  const baseUrl = getSiteUrl();
  const url = `${baseUrl}${page.path}`;
  const isHub = variant === "hub";

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

  const payload = [breadcrumbListSchema, webPageSchema, datasetSchema];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
