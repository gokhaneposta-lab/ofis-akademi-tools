type BrandJsonLdProps = {
  baseUrl: string;
};

export default function BrandJsonLd({ baseUrl }: BrandJsonLdProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ofis Akademi",
    alternateName: "Ofis Akademi Excel ve Veri Analizi",
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    description:
      "Ofis Akademi, Excel ve veri analizi odakli egitim icerikleri ve ucretsiz araclar sunar.",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ofis Akademi",
    url: baseUrl,
    inLanguage: "tr-TR",
    publisher: {
      "@type": "Organization",
      name: "Ofis Akademi",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/blog?k={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

