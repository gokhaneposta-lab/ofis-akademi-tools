import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";

/** Ortak TSB arama ifadeleri — sayfa metadata ve JSON-LD (ekranda görünmez). */
export const TSB_SEO_KEYWORDS_CORE = [
  "TSB",
  "TSB istatistikleri",
  "Türkiye Sigortalar Birliği",
  "sigorta sektör verileri",
  "TSB sigorta verileri",
  "TSB dashboard",
  "sigorta dashboard",
  "sigorta sektör karşılaştırma",
  "TSB online",
  "TSB veri takip",
] as const;

export const TSB_SEO_KEYWORDS_PRIM = [
  "TSB prim",
  "TSB prim istatistikleri",
  "TSB prim verileri",
  "sigorta prim üretimi",
  "sigorta prim istatistikleri",
  "TSB aylık prim",
  "sigorta pazar payı",
  "TSB kanal prim",
  "TSB branş prim",
  "sigorta acente prim",
] as const;

export const TSB_SEO_KEYWORDS_FINANSAL = [
  "TSB finansal",
  "TSB finansal veriler",
  "TSB finansal istatistikleri",
  "sigorta finansal karşılaştırma",
  "TSB gelir tablosu",
  "TSB bilanço",
  "TSB hasar prim oranı",
  "sigorta H/P oranı",
  "TSB çeyreklik veri",
] as const;

export const TSB_OG_IMAGE_PATH = "/og/tsb-sektor";

export type TsbSeoPage = {
  path: string;
  /** Sekme başlığı — layout şablonu sonuna "| Ofis Akademi" ekler */
  title: string;
  description: string;
  keywords: readonly string[];
  jsonLdName: string;
  breadcrumbLabel: string;
};

function kw(...groups: readonly (readonly string[])[]): string[] {
  return [...new Set(groups.flat())];
}

export const TSB_SEO = {
  hub: {
    path: "/sigorta/tsb",
    title: "TSB Prim ve Finansal İstatistikleri — Sigorta Sektör Dashboard",
    description:
      "TSB prim istatistikleri ve finansal veriler: Türkiye Sigortalar Birliği kaynaklı aylık prim üretimi, branş/kanal panelleri ile çeyreklik gelir tablosu ve bilanço karşılaştırmaları.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, TSB_SEO_KEYWORDS_FINANSAL),
    jsonLdName: "TSB Prim ve Finansal İstatistikleri",
    breadcrumbLabel: "TSB Sektör Verileri",
  },
  sektorGorunumu: {
    path: "/sigorta/sektor-gorunumu",
    title: "Sigorta Sektörü Görünümü — HD, Hayat ve Toplam Finansal Dashboard",
    description:
      "TSB çeyreklik verileriyle hayat dışı, hayat–emeklilik ve toplam sigorta sektörü: prim, teknik kâr, net kâr, aktif, özsermaye, finansal oranlar ve ilk 10 şirket analizi.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_FINANSAL, [
      "sigorta sektörü toplam aktif",
      "sigorta sektörü özsermaye",
      "hayat dışı hayat toplam",
      "sigorta sektörü karlılık",
    ]),
    jsonLdName: "Sigorta Sektörü Görünümü",
    breadcrumbLabel: "Sektör görünümü",
  },
  finansalKarsilastirma: {
    path: "/sigorta/finansal-karsilastirma",
    title: "TSB Finansal Karşılaştırma — Gelir Tablosu ve Bilanço KPI",
    description:
      "TSB finansal veriler: çeyreklik gelir tablosu ve bilanço KPI'ları; hayat dışı, hayat–emeklilik veya HD+H/E toplam havuzunda şirket ile sektör toplamı veya ikinci şirket yan yana, dönemsel değişimle.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_FINANSAL),
    jsonLdName: "TSB Finansal Karşılaştırma",
    breadcrumbLabel: "Finansal karşılaştırma",
  },
  anaBransTkz: {
    path: "/sigorta/ana-brans-tkz",
    title: "TSB Ana Branş TKZ — Teknik Gelir, Teknik Gider ve TKZ",
    description:
      "TSB çeyreklik finansal verilerinden, son finansal dönemde TSB ana branş bazında teknik gelir, teknik gider ve teknik kar/zarar (TKZ) kırılımı; şirket, sektör, benzer ölçek veya başka bir şirket kıyası.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_FINANSAL, [
      "TSB teknik kar zarar",
      "TSB ana branş TKZ",
      "sigorta teknik gelir gider",
    ]),
    jsonLdName: "TSB Ana Branş TKZ",
    breadcrumbLabel: "Ana branş TKZ",
  },
  olcekSegmentasyon: {
    path: "/sigorta/olcek-segmentasyon",
    title: "TSB Ölçek Segmentasyonu — A+…D Şirket Grupları",
    description:
      "TSB finansal verilerinden ölçek segmentasyonu: brüt prim, özsermaye ve toplam aktife göre hayat dışı veya hayat–emeklilik havuzunda A+…D grupları; segmentteki tüm şirketler listelenir.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_FINANSAL, [
      "sigorta ölçek segmentasyonu",
      "TSB şirket büyüklük",
      "sigorta sektör segment",
    ]),
    jsonLdName: "TSB Ölçek Segmentasyonu",
    breadcrumbLabel: "Ölçek segmentasyonu",
  },
  sirketKarne: {
    path: "/sigorta/sirket-karne",
    title: "TSB Şirket Karne — Prim, Finansal ve Kanal Özeti",
    description:
      "Tek sigorta şirketi için TSB karne: özet (prim, finansal, kanal, trend), finansal/teknik/prim/pazar sekmeleri ve ilgili panellere filtreli geçiş.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, TSB_SEO_KEYWORDS_FINANSAL, [
      "sigorta şirket karne",
      "TSB şirket özeti",
      "sigorta şirket analizi",
    ]),
    jsonLdName: "TSB Şirket Karne",
    breadcrumbLabel: "Şirket karne",
  },
  hasarPrimOrani: {
    path: "/sigorta/hasar-prim-orani",
    title: "TSB Hasar / Prim Oranı — Branş Bazlı Teknik İstatistikler",
    description:
      "TSB istatistikleri: brüt ve net hasar/prim oranı, branş veya tarife grubu kırılımı, sektör sıralaması ve çeyreklik H/P trendi.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_FINANSAL, ["hasar prim oranı", "TSB hasar prim"]),
    jsonLdName: "TSB Hasar / Prim Oranı",
    breadcrumbLabel: "Hasar / Prim oranı",
  },
  kanalPrim: {
    path: "/sigorta/prim?panel=kanal-prim",
    title: "TSB Prim — Prim Sıralaması (Kanal / Branş)",
    description:
      "TSB prim sıralaması: hayat dışı ve hayat–emeklilikte kanal veya branş kırılımında şirket sırası, pay ve yıllık değişim.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB prim sıralaması", "kanal prim"]),
    jsonLdName: "TSB Prim Sıralaması",
    breadcrumbLabel: "Prim sıralaması",
  },
  kanalDagilim: {
    path: "/sigorta/prim?panel=kanal-dagilim",
    title: "TSB Prim — Satış Kanalları (Dağılım, Branş, Liderler)",
    description:
      "TSB prim: sektör kanal dağılımı, branş kanal profili, şirket–sektör kıyası ve kanal liderleri; hayat dışı / hayat–emeklilik.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB kanal dağılımı", "satış kanalları"]),
    jsonLdName: "TSB Satış Kanalları",
    breadcrumbLabel: "Satış kanalları",
  },
  bransDegisim: {
    path: "/sigorta/prim?panel=brans&view=degisim",
    title: "TSB Prim — Branş Kıyası (Değişim ve Pay)",
    description:
      "TSB prim: branş kıyası altında değişim ve pazar payı; şirket–sektör karşılaştırması (hayat dışı / hayat–emeklilik).",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB branş prim", "branş değişim", "branş kıyası"]),
    jsonLdName: "TSB Branş Kıyası — Değişim",
    breadcrumbLabel: "Branş kıyası",
  },
  bransSira: {
    path: "/sigorta/prim?panel=brans&view=sira",
    title: "TSB Prim — Branş Kıyası (Sıra Özeti)",
    description:
      "TSB prim: branş kıyası altında sıra özeti; sektör içi sıra ve önceki yılın aynı ayına göre sıra değişimi.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB branş sıra", "branş kıyası"]),
    jsonLdName: "TSB Branş Kıyası — Sıra",
    breadcrumbLabel: "Branş kıyası",
  },
  primTrend12: {
    path: "/sigorta/prim?panel=prim-trend-12",
    title: "TSB Prim İstatistikleri — Son 12 Ay Sektör ve Şirket Trendi",
    description:
      "TSB prim istatistikleri: son 12 ay sektör toplamı ile tek şirket prim trendi; hayat dışı / hayat–emeklilik, branş/tarife ve kanal filtresi.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB prim trend", "aylık prim trendi"]),
    jsonLdName: "TSB Son 12 Ay Prim Trendi",
    breadcrumbLabel: "Son 12 ay prim trendi",
  },
  pazarYogunlasma: {
    path: "/sigorta/prim?panel=pazar-yogunlasma",
    title: "TSB Prim — Pazar Yoğunlaşması (HHI) ve Top-5 Pay",
    description:
      "TSB prim istatistikleri: ana branş bazında HHI (Herfindahl–Hirschman) endeksi, ilk 5 şirket payı ve son 12 ay yoğunlaşma trendi.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB pazar payı", "HHI sigorta", "pazar yoğunlaşması"]),
    jsonLdName: "TSB Pazar Yoğunlaşması",
    breadcrumbLabel: "Pazar yoğunlaşması",
  },
} as const satisfies Record<string, TsbSeoPage>;

export type TsbSeoPageId = keyof typeof TSB_SEO;

export function tsbPageMetadata(page: TsbSeoPage): Metadata {
  const base = getSiteUrl();
  const ogImage = `${base}${TSB_OG_IMAGE_PATH}`;
  return {
    title: page.title,
    description: page.description,
    keywords: [...page.keywords],
    alternates: {
      canonical: canonicalUrl(page.path),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${base}${page.path}`,
      siteName: "Ofis Akademi",
      locale: "tr_TR",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: page.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [ogImage],
    },
  };
}

export function tsbHubBreadcrumbItems(baseUrl: string, page: TsbSeoPage) {
  return [
    { name: "Ofis Akademi", url: `${baseUrl}/` },
    { name: page.breadcrumbLabel, url: `${baseUrl}${page.path}` },
  ];
}

export function tsbPanelBreadcrumbItems(baseUrl: string, page: TsbSeoPage) {
  return [
    { name: "Ofis Akademi", url: `${baseUrl}/` },
    { name: TSB_SEO.hub.breadcrumbLabel, url: `${baseUrl}${TSB_SEO.hub.path}` },
    { name: page.breadcrumbLabel, url: `${baseUrl}${page.path}` },
  ];
}
