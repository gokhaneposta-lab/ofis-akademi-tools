import type { Metadata } from "next";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import TsbSirketMerkeziDashboard from "@/components/tsb/TsbSirketMerkeziDashboard";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.sirketMerkezi);

export default function SigortaSirketMerkeziPage() {
  return (
    <TsbPageLayout
      seoPageId="sirketMerkezi"
      currentHref="/sigorta/sirket-merkezi"
      title="Şirket merkezi"
      description={
        <>
          Tek şirket için merkezi görünüm: özet karne, finansal ve teknik KPI önizlemeleri, prim ve pazar
          sekmeleri — ilgili TSB panellerine filtreli geçiş.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbSirketMerkeziDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/sirket-merkezi" />
    </TsbPageLayout>
  );
}
