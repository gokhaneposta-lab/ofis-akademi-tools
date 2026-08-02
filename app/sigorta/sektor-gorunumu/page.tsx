import type { Metadata } from "next";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSektorGorunumuDashboard from "@/components/tsb/TsbSektorGorunumuDashboard";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.sektorGorunumu);

export default function SigortaSektorGorunumuPage() {
  return (
    <TsbPageLayout
      seoPageId="sektorGorunumu"
      currentHref="/sigorta/sektor-gorunumu"
      title="Sektör görünümü"
      description="Sektör ne kadar büyüdü — prim, kâr, bilanço ve ilk 10 nasıl dağılıyor?"
      sourceNote={<TsbSourceNote />}
    >
      <TsbSektorGorunumuDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/sektor-gorunumu" />
    </TsbPageLayout>
  );
}
