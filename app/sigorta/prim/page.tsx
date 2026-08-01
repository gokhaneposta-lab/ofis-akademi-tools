import type { Metadata } from "next";
import TsbPrimUretimHub from "@/components/tsb/TsbPrimUretimHub";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import {
  parseBransKiyasView,
  parsePrimPanelId,
  primPanelTab,
  TSB_PRIM_HUB_HREF,
  type TsbPrimPanelId,
} from "@/lib/tsbDashboardPanels";
import { tsbPanelHelpForHref } from "@/lib/tsbPanelHelpContent";
import { TSB_SEO, tsbPageMetadata, type TsbSeoPageId } from "@/lib/tsbSeo";

const PANEL_SEO: Record<TsbPrimPanelId, TsbSeoPageId> = {
  brans: "bransDegisim",
  "kanal-prim": "kanalPrim",
  "kanal-dagilim": "kanalDagilim",
  "prim-trend-12": "primTrend12",
  "pazar-yogunlasma": "pazarYogunlasma",
};

type PageProps = {
  searchParams: Promise<{ panel?: string; view?: string }>;
};

function seoForPanel(panel: TsbPrimPanelId, view: string | undefined): TsbSeoPageId {
  if (panel === "brans" && view === "sira") return "bransSira";
  return PANEL_SEO[panel];
}

function helpHrefForPanel(panel: TsbPrimPanelId, view: string | undefined): string {
  if (panel === "brans") return view === "sira" ? "/sigorta/brans-sira" : "/sigorta/brans-degisim";
  return primPanelTab(panel).legacyHref;
}

function resolveBransView(panelRaw: string | undefined, viewRaw: string | undefined) {
  if (panelRaw === "brans-sira") return "sira" as const;
  if (panelRaw === "brans-degisim") return "degisim" as const;
  return parseBransKiyasView(viewRaw);
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const panel = parsePrimPanelId(sp.panel);
  const bransView = resolveBransView(sp.panel, sp.view);
  return tsbPageMetadata(TSB_SEO[seoForPanel(panel, bransView)]);
}

export default async function SigortaPrimUretimPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const panel = parsePrimPanelId(sp.panel);
  const bransView = resolveBransView(sp.panel, sp.view);
  const tab = primPanelTab(panel);
  const seoId = seoForPanel(panel, bransView);

  return (
    <TsbPageLayout
      seoPageId={seoId}
      currentHref={TSB_PRIM_HUB_HREF}
      activePrimPanel={panel}
      title="Prim ve üretim"
      description={
        <>
          {tab.title} — {tab.subtitle}. Üst sekmelerden diğer prim panellerine geçin; branş kıyası içinde
          değişim ve sıra ayrı alt sayfalardır.
        </>
      }
      sourceNote={<TsbSourceNote />}
      helpItems={tsbPanelHelpForHref(helpHrefForPanel(panel, sp.view))}
    >
      <TsbPrimUretimHub panel={panel} bransView={bransView} />
      <TsbRelatedDashboards currentHref={TSB_PRIM_HUB_HREF} />
    </TsbPageLayout>
  );
}
