import type { Metadata } from "next";
import TsbKanalDagilimDashboard from "@/components/tsb/TsbKanalDagilimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { primPanelTab } from "@/lib/tsbDashboardPanels";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

const tab = primPanelTab("kanal-dagilim");

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.kanalDagilim);

export default function SigortaKanalDagilimPage() {
  return (
    <TsbPageLayout
      seoPageId="kanalDagilim"
      currentHref="/sigorta/kanal-dagilim"
      description={tab.story}
      sourceNote={<TsbSourceNote />}
    >
      <TsbKanalDagilimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/kanal-dagilim" />
    </TsbPageLayout>
  );
}
