/** TSB gösterge panelleri — hub ve çapraz linkler için tek kaynak */
export type TsbDashboardGroupId = "finansal" | "prim";

export type TsbDashboardPanel = {
  href: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: string;
  group: TsbDashboardGroupId;
};

export type TsbDashboardGroupMeta = {
  id: TsbDashboardGroupId;
  title: string;
  description: string;
};

export const TSB_DASHBOARD_GROUPS: readonly TsbDashboardGroupMeta[] = [
  {
    id: "finansal",
    title: "Finansal karşılaştırma",
    description:
      "Çeyrek bazında gelir tablosu (GT) ve bilanço (BL) özet KPI’ları; şirket, sektör veya başka bir şirketle kıyas.",
  },
  {
    id: "prim",
    title: "Prim ve üretim",
    description:
      "Aylık TSB prim istatistikleri; kanal, branş, sıralama ve son 12 ay trend panelleri.",
  },
] as const;

export const TSB_FINANSAL_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  {
    href: "/sigorta/finansal-karsilastirma",
    badge: "Finansal",
    title: "Finansal karşılaştırma",
    subtitle: "KPI satırları · çeyrekler · şirket vs sektör",
    icon: "📋",
    group: "finansal",
  },
] as const;

export const TSB_PRIM_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  {
    href: "/sigorta/kanal-prim",
    badge: "Kanal",
    title: "Kanal bazlı prim",
    subtitle: "Satış kanalı kırılımı · hayat dışı / hayat–emeklilik",
    icon: "📊",
    group: "prim",
  },
  {
    href: "/sigorta/kanal-dagilim",
    badge: "Dağılım",
    title: "Sektör kanal dağılımı",
    subtitle: "Şirket vs sektör · kanal payları ve yüzdeler",
    icon: "📈",
    group: "prim",
  },
  {
    href: "/sigorta/brans-degisim",
    badge: "Branş",
    title: "Sektör branş değişim tablosu",
    subtitle: "Şirket vs sektör · pazar payı · önceki yıl aynı ay",
    icon: "📑",
    group: "prim",
  },
  {
    href: "/sigorta/brans-sira",
    badge: "Sıra",
    title: "Branş sıra özeti",
    subtitle: "Sıra · branş/sektör ağırlığı · önceki yıl Δ sıra",
    icon: "🏅",
    group: "prim",
  },
  {
    href: "/sigorta/prim-trend-12",
    badge: "Trend",
    title: "Son 12 ay prim",
    subtitle: "Sektör vs şirket çizgisi · aylık üretim",
    icon: "〰️",
    group: "prim",
  },
] as const;

/** Tüm paneller (finansal + prim), hub sırası */
export const TSB_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  ...TSB_FINANSAL_DASHBOARD_PANELS,
  ...TSB_PRIM_DASHBOARD_PANELS,
] as const;

export function tsbDashboardPanelsForGroup(groupId: TsbDashboardGroupId): TsbDashboardPanel[] {
  return TSB_DASHBOARD_PANELS.filter((p) => p.group === groupId);
}

export function tsbDashboardPanelsExcept(excludeHref: string): TsbDashboardPanel[] {
  return TSB_DASHBOARD_PANELS.filter((p) => p.href !== excludeHref);
}

export function tsbDashboardPanelByHref(href: string): TsbDashboardPanel | undefined {
  return TSB_DASHBOARD_PANELS.find((p) => p.href === href);
}
