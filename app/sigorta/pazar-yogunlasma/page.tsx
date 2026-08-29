import type { Metadata } from "next";
import TsbPazarYogunlasmaDashboard from "@/components/tsb/TsbPazarYogunlasmaDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { primPanelTab } from "@/lib/tsbDashboardPanels";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

const tab = primPanelTab("pazar-yogunlasma");

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.pazarYogunlasma);

export default function SigortaPazarYogunlasmaPage() {
  return (
    <TsbPageLayout
      seoPageId="pazarYogunlasma"
      currentHref="/sigorta/pazar-yogunlasma"
      description={tab.story}
      sourceNote={<TsbSourceNote />}
    >
      <TsbPazarYogunlasmaDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/pazar-yogunlasma" />
    </TsbPageLayout>
  );
}
