import type { Metadata } from "next";
import TsbPazarYogunlasmaDashboard from "@/components/tsb/TsbPazarYogunlasmaDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.pazarYogunlasma);

export default function SigortaPazarYogunlasmaPage() {
  return (
    <TsbPageLayout
      seoPageId="pazarYogunlasma"
      currentHref="/sigorta/pazar-yogunlasma"
      title="Pazar yoğunlaşması (HHI)"
      description={
        <>
          Ana branş bazında aylık prim paylarından HHI (Herfindahl–Hirschman) endeksi; top-5 pay ve son 12 ay
          trendi.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbPazarYogunlasmaDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/pazar-yogunlasma" />
    </TsbPageLayout>
  );
}
