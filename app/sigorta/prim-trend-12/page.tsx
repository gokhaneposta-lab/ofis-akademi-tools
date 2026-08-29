import type { Metadata } from "next";
import TsbPrimTrend12Dashboard from "@/components/tsb/TsbPrimTrend12Dashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { primPanelTab } from "@/lib/tsbDashboardPanels";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

const tab = primPanelTab("prim-trend-12");

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.primTrend12);

export default function SigortaPrimTrend12Page() {
  return (
    <TsbPageLayout
      seoPageId="primTrend12"
      currentHref="/sigorta/prim-trend-12"
      description={tab.story}
      sourceNote={<TsbSourceNote />}
    >
      <TsbPrimTrend12Dashboard />
      <TsbRelatedDashboards currentHref="/sigorta/prim-trend-12" />
    </TsbPageLayout>
  );
}
