import type { Metadata } from "next";
import TsbBransKiyasHub from "@/components/tsb/TsbBransKiyasHub";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_BRANS_KIYAS_STORY } from "@/lib/tsbDashboardPanels";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.bransSira);

export default function SigortaBransSiraPage() {
  return (
    <TsbPageLayout
      seoPageId="bransSira"
      currentHref="/sigorta/brans-sira"
      description={TSB_BRANS_KIYAS_STORY.sira}
      sourceNote={<TsbSourceNote />}
    >
      <TsbBransKiyasHub view="sira" />
      <TsbRelatedDashboards currentHref="/sigorta/brans-sira" />
    </TsbPageLayout>
  );
}
