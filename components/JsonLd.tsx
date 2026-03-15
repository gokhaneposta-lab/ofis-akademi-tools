/**
 * Sayfa için JSON-LD (SoftwareApplication) çıktılar.
 * Google'ın araç sayfalarını daha iyi anlaması için kullanılır.
 */
type JsonLdToolProps = {
  name: string;
  description: string;
  path: string;
  keywords?: string[];
};

function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";
}

export default function JsonLdTool({ name, description, path, keywords = [] }: JsonLdToolProps) {
  const url = `${getBaseUrl()}${path}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    ...(keywords.length > 0 && { keywords: keywords.join(", ") }),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
