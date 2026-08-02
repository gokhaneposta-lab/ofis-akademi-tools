import type { Metadata } from "next";
import TsbHasarPrimDashboard from "@/components/tsb/TsbHasarPrimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.hasarPrimOrani);

export default function SigortaHasarPrimOraniPage() {
  return (
    <TsbPageLayout
      seoPageId="hasarPrimOrani"
      currentHref="/sigorta/hasar-prim-orani"
      title="Hasar / Prim oranı"
      description="Teknik sonuç ne durumda — branş bazında H/P sektörün neresinde?"
      sourceNote={<TsbSourceNote />}
    >
      <TsbHasarPrimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/hasar-prim-orani" />
    </TsbPageLayout>
  );
}
