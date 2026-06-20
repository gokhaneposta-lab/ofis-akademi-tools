/** Finans-sigorta KPI sayfalarından TSB canlı dashboard iç linkleri. */

export type TsbMetricDashboardLink = {
  href: string;
  title: string;
  description: string;
};

export const METRIC_TSB_DASHBOARD: Partial<Record<string, TsbMetricDashboardLink>> = {
  "hasar-prim-orani": {
    href: "/sigorta/hasar-prim-orani",
    title: "TSB Hasar / Prim oranı dashboard",
    description:
      "Branş bazlı brüt/net H/P, sektör sıralaması ve çeyreklik trend — TSB gelir tablosu verisiyle canlı karşılaştırma.",
  },
  "kazanilmis-prim": {
    href: "/sigorta/prim-trend-12",
    title: "TSB son 12 ay prim trendi",
    description: "Aylık prim üretimi trendi; şirket ve sektör çizgisi, branş/kanal filtresi.",
  },
  "yenileme-orani": {
    href: "/sigorta/brans-degisim",
    title: "TSB branş değişim tablosu",
    description: "Branş bazında yıllık prim değişimi ve pazar payı — portföy kayması analizi.",
  },
  "kayip-orani": {
    href: "/sigorta/hasar-prim-orani",
    title: "TSB Hasar / Prim oranı dashboard",
    description: "Kayıp oranı ile ilişkili teknik performansı sektörle kıyaslayın.",
  },
  "birlesik-oran": {
    href: "/sigorta/hasar-prim-orani",
    title: "TSB Hasar / Prim oranı dashboard",
    description: "H/P ve teknik sonuç göstergelerini branş kırılımında inceleyin.",
  },
  "kazanilmamis-prim-karsiligi": {
    href: "/sigorta/finansal-karsilastirma",
    title: "TSB finansal karşılaştırma",
    description: "Çeyreklik GT/BL KPI — teknik karşılıklar ve finansal yapı yan yana.",
  },
  "muallak-hasar-karsiligi": {
    href: "/sigorta/hasar-prim-orani",
    title: "TSB Hasar / Prim oranı dashboard",
    description: "Hasar tarafı performansını sektör branş dağılımıyla kıyaslayın.",
  },
  "prim-tahsilat-orani": {
    href: "/sigorta/kanal-prim",
    title: "TSB kanal bazlı prim",
    description: "Kanal ve branş bazında aylık prim üretimi, sıra ve pay.",
  },
  "cari-oran": {
    href: "/sigorta/finansal-karsilastirma",
    title: "TSB finansal karşılaştırma",
    description: "Likidite ve bilanço oranları — şirket vs sektör çeyreklik KPI.",
  },
  "nakit-oran": {
    href: "/sigorta/finansal-karsilastirma",
    title: "TSB finansal karşılaştırma",
    description: "Nakit ve likidite göstergelerini sektörle yan yana görün.",
  },
  "asit-test-orani": {
    href: "/sigorta/finansal-karsilastirma",
    title: "TSB finansal karşılaştırma",
    description: "Bilanço oranları çeyreklik TSB finansal verisiyle.",
  },
  "vok-roe": {
    href: "/sigorta/finansal-karsilastirma",
    title: "TSB finansal karşılaştırma",
    description: "VÖK, ROE ve kârlılık KPI'larını sektör toplamıyla kıyaslayın.",
  },
  "net-kar-marji": {
    href: "/sigorta/finansal-karsilastirma",
    title: "TSB finansal karşılaştırma",
    description: "Kârlılık marjları — çeyreklik GT verisi.",
  },
  "borc-ozkaynak-orani": {
    href: "/sigorta/finansal-karsilastirma",
    title: "TSB finansal karşılaştırma",
    description: "Kaldıraç ve öz kaynak yapısı sektör kıyaslaması.",
  },
  "iptal-orani": {
    href: "/sigorta/brans-degisim",
    title: "TSB branş değişim",
    description: "Branş bazında üretim kaybı ve pay değişimini izleyin.",
  },
};

export function getTsbDashboardLinkForMetric(slug: string): TsbMetricDashboardLink | undefined {
  return METRIC_TSB_DASHBOARD[slug];
}
