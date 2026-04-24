type BrandJsonLdProps = {
  baseUrl: string;
};

export default function BrandJsonLd({ baseUrl }: BrandJsonLdProps) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ofis Akademi",
    alternateName: ["Ofis Akademi Excel ve Veri Analizi", "OfisAkademi"],
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/favicon.ico`,
    },
    description:
      "Excel ve veri analizi eğitimi, ücretsiz araçlar, formül kütüphanesi ve finans/sigorta KPI rehberleri.",
    sameAs: [
      "https://www.linkedin.com/in/gokhan-yıldırım-72276551/",
    ],
    knowsAbout: [
      "Microsoft Excel",
      "Veri Analizi",
      "Finansal Raporlama",
      "Sigorta KPI",
      "IFRS 17",
      "Power Query",
    ],
    founder: {
      "@type": "Person",
      name: "Gökhan Yıldırım",
      jobTitle: "Ofis Akademi Kurucusu",
      sameAs: [
        "https://www.linkedin.com/in/gokhan-yıldırım-72276551/",
      ],
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ofis Akademi",
    alternateName: "OfisAkademi",
    url: baseUrl,
    inLanguage: "tr-TR",
    description:
      "Excel ve veri analizi rehberleri, ücretsiz araçlar, formül kütüphanesi ve finans/sigorta KPI hesaplayıcıları.",
    publisher: {
      "@type": "Organization",
      name: "Ofis Akademi",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  // SearchAction'ın geçerli olması için /blog sayfası ?q= parametresini destekliyor
  // (BlogIndexClient `useSearchParams` ile okur).

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
