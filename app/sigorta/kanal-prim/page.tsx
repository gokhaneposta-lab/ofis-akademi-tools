import type { Metadata } from "next";
import TsbKanalPrimDashboard from "@/components/tsb/TsbKanalPrimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.kanalPrim);

export default function SigortaKanalPrimPage() {
  return (
    <TsbPageLayout
      seoPageId="kanalPrim"
      currentHref="/sigorta/kanal-prim"
      title="Kanal bazlı prim üretimi (Hayat dışı / Hayat–emeklilik)"
      description={
        <>
          Satış kanalı bazında prim özeti; hayat dışı ve hayat–emeklilik ayrı bloklarda, dönem ve kanal filtreleriyle.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbKanalPrimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/kanal-prim" />
    </TsbPageLayout>
  );
}
