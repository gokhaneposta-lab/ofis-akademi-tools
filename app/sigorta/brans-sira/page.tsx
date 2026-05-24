import type { Metadata } from "next";
import TsbBransSiraDashboard from "@/components/tsb/TsbBransSiraDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.bransSira);

export default function SigortaBransSiraPage() {
  return (
    <TsbPageLayout
      seoPageId="bransSira"
      currentHref="/sigorta/brans-sira"
      title="Branş sıra özeti"
      description={
        <>
          Branş/tarife satırında prim, portföy ağırlığı, sektör içi sıra ve önceki yılın aynı ayına göre Δ sıra.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbBransSiraDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/brans-sira" />
    </TsbPageLayout>
  );
}
