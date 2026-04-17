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
    knowsAbout: [
      "Microsoft Excel",
      "Veri Analizi",
      "Finansal Raporlama",
      "Sigorta KPI",
      "IFRS 17",
      "Power Query",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ofis Akademi",
    url: baseUrl,
    inLanguage: "tr-TR",
    description:
      "Excel ve veri analizi rehberleri, ücretsiz araçlar, formül kütüphanesi ve finans/sigorta KPI hesaplayıcıları.",
    publisher: {
      "@type": "Organization",
      name: "Ofis Akademi",
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

