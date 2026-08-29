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
    id: "prim",
    title: "Prim ve Üretim",
    description:
      "Aylık TSB prim istatistikleri — sıralama, branş kıyası, kanal dağılımı, trend ve pazar yoğunlaşması.",
  },
  {
    id: "finansal",
    title: "Finansal Karşılaştırma",
    description:
      "Çeyrek bazında gelir tablosu (GT) ve bilanço (BL) özet KPI’ları; şirket, sektör veya başka bir şirketle kıyas.",
  },
  {
    id: "teknik",
    title: "Teknik Karlılık",
    description: "Gelir tablosu hasar/prim oranları; branş seçimi ve DERK dahil/hariç kırılımı.",
  },
] as const;

export const TSB_FINANSAL_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  {
    href: "/sigorta/sektor-gorunumu",
    badge: "Sektör",
    title: "Sektör Görünümü",
    subtitle: "HD + H/E toplam · kâr · bilanço · oranlar · ilk 10",
    icon: "🌐",
    group: "finansal",
  },
  {
    href: "/sigorta/sirket-karne",
    badge: "Karne",
    title: "Şirket Karne",
    subtitle: "Tek şirket · özet · sekmeler · panellere geçiş",
    icon: "📋",
    group: "finansal",
  },
  {
    href: "/sigorta/finansal-karsilastirma",
    badge: "Finansal",
    title: "Finansal Karşılaştırma",
    subtitle: "KPI satırları · çeyrekler · HD / H/E / toplam · şirket vs sektör",
    icon: "📋",
    group: "finansal",
  },
] as const;

/** Hub’ta grupların altında ayrı gösterilir — katalog grubuna karışmaz. */
export const TSB_OLCEK_DASHBOARD_PANEL: TsbDashboardPanel = {
  href: "/sigorta/olcek-segmentasyon",
  badge: "Ölçek",
  title: "Ölçek Segmentasyonu",
  subtitle: "A+…D grupları · şirket listesi · sektör/segment sırası",
  icon: "🏢",
  group: "finansal",
};

export const TSB_TEKNIK_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  {
    href: "/sigorta/ana-brans-tkz",
    badge: "TKZ",
    title: "Ana Branş TKZ",
    subtitle: "Teknik gelir / gider · branş kırılımı · şirket vs kıyas",
    icon: "🧮",
    group: "teknik",
  },
  {
    href: "/sigorta/hasar-prim-orani",
    badge: "H/P",
    title: "Hasar / Prim Oranı",
    subtitle: "Branş bazlı H/P · DERK dahil/hariç · sektör sırası",
    icon: "📉",
    group: "teknik",
  },
] as const;

/** Eski prim hub URL’si — /sigorta/prim artık kanal-prim’e yönlendirir. */
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
  /** Sayfa açılınca kullanıcının cevaplaması gereken tek soru */
  story: string;
  legacyHref: string;
};

/** TSB hub ana sayfa H1 — panel başlıklarından ayrı (grup girişi). */
export const TSB_HUB_PAGE_TITLE = "Sektör Verileri (TSB)";

export const TSB_PRIM_VIEW_TABS: readonly TsbPrimViewTab[] = [
  {
    id: "kanal-prim",
    title: "Prim Sıralaması",
    subtitle: "Kanal / branş kırılımında şirket sırası · pay · YoY",
    story: "Seçili kırılımda hangi şirketler önde — pay ve YoY nasıl?",
    legacyHref: "/sigorta/kanal-prim",
  },
  {
    id: "brans",
    title: "Branş Kıyası",
    subtitle: "Karşılaştırma ve sıra — değişim/pay veya sıra özeti",
    story: "Hangi branşlar büyüyor, hangileri küçülüyor — sıra nasıl değişti?",
    legacyHref: "/sigorta/brans-degisim",
  },
  {
    id: "kanal-dagilim",
    title: "Satış Kanalları",
    subtitle: "Genel bakış · branş profili · şirket kıyası · liderler",
    story: "Lider kanal hangisi — dağılım ve yıllar içi değişim nasıl?",
    legacyHref: "/sigorta/kanal-dagilim",
  },
  {
    id: "prim-trend-12",
    title: "Son 12 Ay Prim",
    subtitle: "Sektör vs şirket çizgisi · aylık üretim",
    story: "Son 12 ayda şirket üretimi sektöre göre nasıl seyretti?",
    legacyHref: "/sigorta/prim-trend-12",
  },
  {
    id: "pazar-yogunlasma",
    title: "Pazar Yoğunlaşması",
    subtitle: "Branş bazında HHI · top-5 pay · 12 ay trend",
    story: "Pazar ne kadar yoğun — ilk 5’in payı artıyor mu?",
    legacyHref: "/sigorta/pazar-yogunlasma",
  },
] as const;

export const TSB_BRANS_KIYAS_STORY: Record<"degisim" | "sira", string> = {
  degisim: "Hangi branşlar büyüyor, hangileri küçülüyor — pay nasıl kayıyor?",
  sira: "Branş sıralaması nasıl değişti — kim yükseldi, kim düştü?",
};

const PRIM_PANEL_META: Record<TsbPrimPanelId, { badge: string; icon: string }> = {
  "kanal-prim": { badge: "Prim", icon: "📊" },
  brans: { badge: "Branş", icon: "📈" },
  "kanal-dagilim": { badge: "Kanal", icon: "🏪" },
  "prim-trend-12": { badge: "Trend", icon: "📉" },
  "pazar-yogunlasma": { badge: "Pazar", icon: "🎯" },
};

/** Prim panelleri — hub’da ayrı kart; her biri kendi sayfasına gider. */
export const TSB_PRIM_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = TSB_PRIM_VIEW_TABS.map((t) => ({
  href: t.legacyHref,
  badge: PRIM_PANEL_META[t.id].badge,
  title: t.title,
  subtitle: t.subtitle,
  icon: PRIM_PANEL_META[t.id].icon,
  group: "prim" as const,
}));

/** Tüm paneller (prim → finansal → teknik), hub sırası; ölçek en sonda */
export const TSB_DASHBOARD_PANELS: readonly TsbDashboardPanel[] = [
  ...TSB_PRIM_DASHBOARD_PANELS,
  ...TSB_FINANSAL_DASHBOARD_PANELS,
  ...TSB_TEKNIK_DASHBOARD_PANELS,
  TSB_OLCEK_DASHBOARD_PANEL,
] as const;

/**
 * Hub vitrin girişleri — asimetrik ağırlık:
 * primary = ana giriş; secondary = ikincil yollar.
 * Katalog grid’inden çıkarılmaz (duplicate bilinçli).
 */
export const TSB_HUB_FEATURED = {
  primaryHref: "/sigorta/sektor-gorunumu",
  secondaryHrefs: ["/sigorta/kanal-prim", "/sigorta/finansal-karsilastirma"] as const,
} as const;

export function tsbHubFeaturedPanels(): {
  primary: TsbDashboardPanel;
  secondary: TsbDashboardPanel[];
} {
  const byHref = (href: string) => {
    const p = tsbDashboardPanelByHref(href);
    if (!p) throw new Error(`TSB hub featured panel bulunamadı: ${href}`);
    return p;
  };
  return {
    primary: byHref(TSB_HUB_FEATURED.primaryHref),
    secondary: TSB_HUB_FEATURED.secondaryHrefs.map(byHref),
  };
}

export function parsePrimPanelId(raw: string | null | undefined): TsbPrimPanelId {
  if (raw === "brans-degisim" || raw === "brans-sira") return "brans";
  if (TSB_PRIM_VIEW_TABS.some((t) => t.id === raw)) return raw as TsbPrimPanelId;
  return "kanal-prim";
}

export function parseBransKiyasView(raw: string | null | undefined): TsbBransKiyasView {
  return raw === "sira" ? "sira" : "degisim";
}

export function primPanelHref(id: TsbPrimPanelId, view?: string): string {
  if (id === "brans" && view === "sira") return "/sigorta/brans-sira";
  if (id === "brans") return "/sigorta/brans-degisim";
  return primPanelTab(id).legacyHref;
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
  if (path === "/sigorta/brans-sira") {
    return TSB_PRIM_DASHBOARD_PANELS.find((p) => p.href === "/sigorta/brans-degisim");
  }
  if (path === TSB_PRIM_HUB_HREF) {
    return TSB_PRIM_DASHBOARD_PANELS.find((p) => p.href === "/sigorta/kanal-prim");
  }
  return TSB_DASHBOARD_PANELS.find((p) => p.href === path);
}

/** Panel sayfası H1 — hub kartları ve prim sekmeleriyle aynı Title Case. */
export function tsbPanelPageTitle(href: string): string {
  const path = href.split("?")[0] ?? href;
  if (path === "/sigorta/brans-sira") return "Branş Kıyası — Sıra Özeti";
  const panel = tsbDashboardPanelByHref(path);
  if (panel) return panel.title;
  const prim = TSB_PRIM_VIEW_TABS.find((t) => t.legacyHref === path);
  if (prim) return prim.title;
  return "TSB Panel";
}

/** Breadcrumb / TopBar / JSON-LD — UI’da H1 ile aynı. */
export const tsbPanelBreadcrumbLabel = tsbPanelPageTitle;

export type TsbNavItem = { label: string; href: string };

/** SiteTopBar → Sektör verileri alt menüsü. */
export function tsbTopBarNavItems(): readonly TsbNavItem[] {
  return [
    { label: "Dashboard Özeti", href: "/sigorta/tsb" },
    ...TSB_PRIM_VIEW_TABS.map((t) => ({ label: t.title, href: t.legacyHref })),
    ...TSB_FINANSAL_DASHBOARD_PANELS.map((p) => ({ label: p.title, href: p.href })),
    { label: TSB_OLCEK_DASHBOARD_PANEL.title, href: TSB_OLCEK_DASHBOARD_PANEL.href },
    ...TSB_TEKNIK_DASHBOARD_PANELS.map((p) => ({ label: p.title, href: p.href })),
  ];
}

/** Mobil başlık çubuğu ve path → Title Case eşlemesi. */
export function tsbPathTitleMap(): Record<string, string> {
  const map: Record<string, string> = {
    "/sigorta/tsb": TSB_HUB_PAGE_TITLE,
    "/sigorta/prim": tsbPanelPageTitle("/sigorta/kanal-prim"),
    "/sigorta/brans-sira": tsbPanelPageTitle("/sigorta/brans-sira"),
  };
  for (const p of TSB_DASHBOARD_PANELS) {
    map[p.href] = p.title;
  }
  return map;
}
