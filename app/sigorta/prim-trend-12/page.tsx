import type { Metadata } from "next";
import TsbPrimTrend12Dashboard from "@/components/tsb/TsbPrimTrend12Dashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.primTrend12);

export default function SigortaPrimTrend12Page() {
  return (
    <TsbPageLayout
      seoPageId="primTrend12"
      currentHref="/sigorta/prim-trend-12"
      title="Son 12 ay prim trendi"
      description={
        <>
          Bitiş ayına kadar en fazla 12 ay: sektör ve odak şirket prim çizgisi; altta aylık üretim farkı.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbPrimTrend12Dashboard />
      <TsbRelatedDashboards currentHref="/sigorta/prim-trend-12" />
    </TsbPageLayout>
  );
}
