import type { Metadata } from "next";
import TsbBransKiyasHub from "@/components/tsb/TsbBransKiyasHub";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_BRANS_KIYAS_STORY } from "@/lib/tsbDashboardPanels";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.bransDegisim);

export default function SigortaBransDegisimPage() {
  return (
    <TsbPageLayout
      seoPageId="bransDegisim"
      currentHref="/sigorta/brans-degisim"
      description={TSB_BRANS_KIYAS_STORY.degisim}
      sourceNote={<TsbSourceNote />}
    >
      <TsbBransKiyasHub view="degisim" />
      <TsbRelatedDashboards currentHref="/sigorta/brans-degisim" />
    </TsbPageLayout>
  );
}
