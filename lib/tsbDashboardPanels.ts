/** TSB gösterge panelleri — hub ve çapraz linkler için tek kaynak */
export type TsbDashboardPanel = {
  href: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
};

export const TSB_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  {
    href: "/sigorta/finansal-karsilastirma",
    badge: "Finansal",
    title: "Finansal karşılaştırma",
    subtitle: "KPI satırları · çeyrekler · şirket vs HD sektör (gelir-tidy)",
    icon: "📋",
  },
  {
    href: "/sigorta/kanal-prim",
    badge: "Kanal",
    title: "Kanal bazlı prim",
    subtitle: "Satış kanalı kırılımı · hayat dışı / hayat–emeklilik",
    icon: "📊",
  },
  {
    href: "/sigorta/kanal-dagilim",
    badge: "Dağılım",
    title: "Sektör kanal dağılımı",
    subtitle: "Şirket vs sektör · kanal payları ve yüzdeler",
    icon: "📈",
  },
  {
    href: "/sigorta/brans-degisim",
    badge: "Branş",
    title: "Sektör branş değişim tablosu",
    subtitle: "Şirket vs sektör · pazar payı · önceki yıl aynı ay",
    icon: "📑",
  },
  {
    href: "/sigorta/brans-sira",
    badge: "Sıra",
    title: "Branş sıra özeti",
    subtitle: "Sıra · branş/sektör ağırlığı · önceki yıl Δ sıra",
    icon: "🏅",
  },
  {
    href: "/sigorta/prim-trend-12",
    badge: "Trend",
    title: "Son 12 ay prim",
    subtitle: "Sektör vs şirket çizgisi · aylık üretim",
    icon: "〰️",
  },
] as const;

export function tsbDashboardPanelsExcept(excludeHref: string): TsbDashboardPanel[] {
  return TSB_DASHBOARD_PANELS.filter((p) => p.href !== excludeHref);
}
