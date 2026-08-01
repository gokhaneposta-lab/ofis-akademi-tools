import type { Metadata } from "next";
import TsbPrimUretimHub from "@/components/tsb/TsbPrimUretimHub";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import {
  parsePrimPanelId,
  primPanelTab,
  TSB_PRIM_HUB_HREF,
  type TsbPrimPanelId,
} from "@/lib/tsbDashboardPanels";
import { tsbPanelHelpForHref } from "@/lib/tsbPanelHelpContent";
import { TSB_SEO, tsbPageMetadata, type TsbSeoPageId } from "@/lib/tsbSeo";

const PANEL_SEO: Record<TsbPrimPanelId, TsbSeoPageId> = {
  "kanal-prim": "kanalPrim",
  "kanal-dagilim": "kanalDagilim",
  "brans-degisim": "bransDegisim",
  "brans-sira": "bransSira",
  "prim-trend-12": "primTrend12",
  "pazar-yogunlasma": "pazarYogunlasma",
};

type PageProps = {
  searchParams: Promise<{ panel?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const panel = parsePrimPanelId(sp.panel);
  const seoId = PANEL_SEO[panel];
  return tsbPageMetadata(TSB_SEO[seoId]);
}

export default async function SigortaPrimUretimPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const panel = parsePrimPanelId(sp.panel);
  const tab = primPanelTab(panel);
  const seoId = PANEL_SEO[panel];

  return (
    <TsbPageLayout
      seoPageId={seoId}
      currentHref={TSB_PRIM_HUB_HREF}
      activePrimPanel={panel}
      title="Prim ve üretim"
      description={
        <>
          {tab.title} — {tab.subtitle}. Üst sekmelerden diğer prim görünümlerine geçin; hepsi aynı aylık
          prim-tidy kaynağından beslenir.
        </>
      }
      sourceNote={<TsbSourceNote />}
      helpItems={tsbPanelHelpForHref(tab.legacyHref)}
    >
      <TsbPrimUretimHub panel={panel} />
      <TsbRelatedDashboards currentHref={TSB_PRIM_HUB_HREF} />
    </TsbPageLayout>
  );
}
