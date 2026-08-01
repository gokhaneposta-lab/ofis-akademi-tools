/** TSB gösterge panelleri — hub ve çapraz linkler için tek kaynak */
export type TsbDashboardGroupId = "finansal" | "prim" | "teknik";

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
    id: "teknik",
    title: "Teknik karlılık",
    description: "Gelir tablosu hasar/prim oranları; branş seçimi ve DERK dahil/hariç kırılımı.",
  },
  {
    id: "prim",
    title: "Prim ve üretim",
    description:
      "Aylık TSB prim istatistikleri — kanal, branş, sıra, trend ve yoğunlaşma tek hub’da sekmelerle.",
  },
] as const;

export const TSB_FINANSAL_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  {
    href: "/sigorta/sektor-gorunumu",
    badge: "Sektör",
    title: "Sigorta sektörü görünümü",
    subtitle: "HD + H/E toplam · kâr · bilanço · oranlar · ilk 10",
    icon: "🌐",
    group: "finansal",
  },
  {
    href: "/sigorta/sirket-karne",
    badge: "Karne",
    title: "Şirket karne",
    subtitle: "Tek şirket · özet · sekmeler · panellere geçiş",
    icon: "📋",
    group: "finansal",
  },
  {
    href: "/sigorta/finansal-karsilastirma",
    badge: "Finansal",
    title: "Finansal karşılaştırma",
    subtitle: "KPI satırları · çeyrekler · HD / H/E / toplam · şirket vs sektör",
    icon: "📋",
    group: "finansal",
  },
  {
    href: "/sigorta/olcek-segmentasyon",
    badge: "Ölçek",
    title: "Ölçek segmentasyonu",
    subtitle: "A+…D grupları · şirket listesi · sektör/segment sırası",
    icon: "🏢",
    group: "finansal",
  },
] as const;

export const TSB_TEKNIK_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  {
    href: "/sigorta/ana-brans-tkz",
    badge: "TKZ",
    title: "Ana branş TKZ",
    subtitle: "TSB ana branş · teknik gelir/gider · şirket vs kıyas",
    icon: "🧮",
    group: "teknik",
  },
  {
    href: "/sigorta/hasar-prim-orani",
    badge: "H/P",
    title: "Hasar / Prim oranı",
    subtitle: "Branş bazlı · DERK dahil/hariç · sektör sırası",
    icon: "📉",
    group: "teknik",
  },
] as const;

/** Prim hub — tek kart / tek sayfa; alt görünümler sekmeyle. */
export const TSB_PRIM_HUB_HREF = "/sigorta/prim";

export type TsbPrimPanelId =
  | "brans"
  | "kanal-prim"
  | "kanal-dagilim"
  | "prim-trend-12"
  | "pazar-yogunlasma";

/** Branş kıyası hub içi alt sayfa */
export type TsbBransKiyasView = "degisim" | "sira";

export type TsbPrimViewTab = {
  id: TsbPrimPanelId;
  title: string;
  subtitle: string;
  legacyHref: string;
};

export const TSB_PRIM_VIEW_TABS: readonly TsbPrimViewTab[] = [
  {
    id: "brans",
    title: "Branş kıyası",
    subtitle: "Karşılaştırma ve sıra — değişim/pay veya sıra özeti",
    legacyHref: "/sigorta/brans-degisim",
  },
  {
    id: "kanal-prim",
    title: "Prim sıralaması",
    subtitle: "Kanal / branş kırılımında şirket sırası · pay · YoY",
    legacyHref: "/sigorta/kanal-prim",
  },
  {
    id: "kanal-dagilim",
    title: "Satış kanalları",
    subtitle: "Genel bakış · branş profili · şirket kıyası · liderler",
    legacyHref: "/sigorta/kanal-dagilim",
  },
  {
    id: "prim-trend-12",
    title: "Son 12 ay prim",
    subtitle: "Sektör vs şirket çizgisi · aylık üretim",
    legacyHref: "/sigorta/prim-trend-12",
  },
  {
    id: "pazar-yogunlasma",
    title: "Pazar yoğunlaşması",
    subtitle: "Branş bazında HHI · top-5 pay · 12 ay trend",
    legacyHref: "/sigorta/pazar-yogunlasma",
  },
] as const;

export const TSB_PRIM_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  {
    href: TSB_PRIM_HUB_HREF,
    badge: "Prim",
    title: "Prim ve üretim",
    subtitle: "Branş kıyası · kanal · trend · yoğunlaşma — sekmeli hub",
    icon: "📊",
    group: "prim",
  },
] as const;

/** Tüm paneller (finansal + teknik + prim), hub sırası */
export const TSB_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  ...TSB_FINANSAL_DASHBOARD_PANELS,
  ...TSB_TEKNIK_DASHBOARD_PANELS,
  ...TSB_PRIM_DASHBOARD_PANELS,
] as const;

export function parsePrimPanelId(raw: string | null | undefined): TsbPrimPanelId {
  if (raw === "brans-degisim" || raw === "brans-sira") return "brans";
  if (TSB_PRIM_VIEW_TABS.some((t) => t.id === raw)) return raw as TsbPrimPanelId;
  return "brans";
}

export function parseBransKiyasView(raw: string | null | undefined): TsbBransKiyasView {
  return raw === "sira" ? "sira" : "degisim";
}

export function primPanelHref(id: TsbPrimPanelId, view?: string): string {
  const q = new URLSearchParams();
  q.set("panel", id);
  if (view) q.set("view", view);
  return `${TSB_PRIM_HUB_HREF}?${q.toString()}`;
}

export function primPanelTab(id: TsbPrimPanelId): TsbPrimViewTab {
  return TSB_PRIM_VIEW_TABS.find((t) => t.id === id) ?? TSB_PRIM_VIEW_TABS[0];
}

export function primPanelIdFromLegacyHref(href: string): TsbPrimPanelId | null {
  const path = href.split("?")[0] ?? href;
  if (path === "/sigorta/brans-degisim" || path === "/sigorta/brans-sira") return "brans";
  return TSB_PRIM_VIEW_TABS.find((t) => t.legacyHref === path)?.id ?? null;
}

export function tsbDashboardPanelsForGroup(groupId: TsbDashboardGroupId): TsbDashboardPanel[] {
  return TSB_DASHBOARD_PANELS.filter((p) => p.group === groupId);
}

export function tsbDashboardPanelsExcept(excludeHref: string): TsbDashboardPanel[] {
  return TSB_DASHBOARD_PANELS.filter((p) => p.href !== excludeHref);
}

export function tsbDashboardPanelByHref(href: string): TsbDashboardPanel | undefined {
  const path = href.split("?")[0] ?? href;
  if (path === TSB_PRIM_HUB_HREF || primPanelIdFromLegacyHref(path)) {
    return TSB_PRIM_DASHBOARD_PANELS[0];
  }
  return TSB_DASHBOARD_PANELS.find((p) => p.href === path);
}
