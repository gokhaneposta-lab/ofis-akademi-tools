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
  finansalKarsilastirma: {
    path: "/sigorta/finansal-karsilastirma",
    title: "TSB Finansal Karşılaştırma — Gelir Tablosu ve Bilanço KPI",
    description:
      "TSB finansal veriler: çeyreklik gelir tablosu ve bilanço KPI'ları; sigorta şirketi ile sektör toplamı veya ikinci şirket yan yana, dönemsel değişimle.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_FINANSAL),
    jsonLdName: "TSB Finansal Karşılaştırma",
    breadcrumbLabel: "Finansal karşılaştırma",
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
    path: "/sigorta/kanal-prim",
    title: "TSB Prim — Kanal Bazlı Prim Üretimi İstatistikleri",
    description:
      "TSB prim istatistikleri: hayat dışı ve hayat–emeklilik için merkez, acente, banka, broker kanallarında prim üretimi, sıra ve pay.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB kanal prim", "kanal bazlı prim"]),
    jsonLdName: "TSB Kanal Bazlı Prim",
    breadcrumbLabel: "Kanal bazlı prim",
  },
  kanalDagilim: {
    path: "/sigorta/kanal-dagilim",
    title: "TSB Prim — Kanal Dağılımı ve Pay İstatistikleri",
    description:
      "TSB prim verileri: kanal bazında şirket ve sektör prim dağılımı; hayat dışı veya hayat–emeklilik havuzunda pay karşılaştırması.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB kanal dağılımı"]),
    jsonLdName: "TSB Kanal Dağılımı",
    breadcrumbLabel: "Kanal dağılımı",
  },
  bransDegisim: {
    path: "/sigorta/brans-degisim",
    title: "TSB Prim İstatistikleri — Branş Değişim ve Pazar Payı",
    description:
      "TSB prim istatistikleri: branş veya tarife grubunda şirket–sektör prim karşılaştırması, yıllık değişim ve pazar payı (hayat dışı / hayat–emeklilik).",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB branş prim", "branş değişim"]),
    jsonLdName: "TSB Branş Değişim Tablosu",
    breadcrumbLabel: "Branş değişim",
  },
  bransSira: {
    path: "/sigorta/brans-sira",
    title: "TSB Prim — Branş Sıralama ve Sektör İçi Konum",
    description:
      "TSB prim verileri: branş/tarife satırında şirket primi, sektör ağırlığı, sektör içi sıra ve önceki yılın aynı ayına göre sıra değişimi.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB branş sıra", "pazar payı sıralama"]),
    jsonLdName: "TSB Branş Sıra Özeti",
    breadcrumbLabel: "Branş sıra özeti",
  },
  primTrend12: {
    path: "/sigorta/prim-trend-12",
    title: "TSB Prim İstatistikleri — Son 12 Ay Sektör ve Şirket Trendi",
    description:
      "TSB prim istatistikleri: son 12 ay sektör toplamı ile tek şirket prim trendi; hayat dışı / hayat–emeklilik, branş/tarife ve kanal filtresi.",
    keywords: kw(TSB_SEO_KEYWORDS_CORE, TSB_SEO_KEYWORDS_PRIM, ["TSB prim trend", "aylık prim trendi"]),
    jsonLdName: "TSB Son 12 Ay Prim Trendi",
    breadcrumbLabel: "Son 12 ay prim trendi",
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
