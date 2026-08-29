import type { Metadata } from "next";
import TsbKanalPrimDashboard from "@/components/tsb/TsbKanalPrimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { primPanelTab } from "@/lib/tsbDashboardPanels";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

const tab = primPanelTab("kanal-prim");

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.kanalPrim);

export default function SigortaKanalPrimPage() {
  return (
    <TsbPageLayout
      seoPageId="kanalPrim"
      currentHref="/sigorta/kanal-prim"
      description={tab.story}
      sourceNote={<TsbSourceNote />}
    >
      <TsbKanalPrimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/kanal-prim" />
    </TsbPageLayout>
  );
}
