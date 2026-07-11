import type { Metadata } from "next";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import TsbSirketKarneDashboard from "@/components/tsb/TsbSirketKarneDashboard";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.sirketKarne);

export default function SigortaSirketKarnePage() {
  return (
    <TsbPageLayout
      seoPageId="sirketKarne"
      currentHref="/sigorta/sirket-karne"
      title="Şirket karne"
      description={
        <>
          Tek şirket için merkezi görünüm: özet karne (prim, finansal, kanal, trend), finansal/teknik/prim/pazar
          sekmeleri ve ilgili panellere filtreli geçiş.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbSirketKarneDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/sirket-karne" />
    </TsbPageLayout>
  );
}
