import type { Metadata } from "next";
import TsbHasarPrimDashboard from "@/components/tsb/TsbHasarPrimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.hasarPrimOrani);

export default function SigortaHasarPrimOraniPage() {
  return (
    <TsbPageLayout
      seoPageId="hasarPrimOrani"
      currentHref="/sigorta/hasar-prim-orani"
      title="Hasar / Prim oranı"
      description={
        <>
          Hasar/prim (H/P) oranı: branş veya tarife grubu kırılımında brüt/net, DERK dahil/hariç; odak şirketin sektör
          sırası ve çeyreklik trendi.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbHasarPrimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/hasar-prim-orani" />
    </TsbPageLayout>
  );
}
