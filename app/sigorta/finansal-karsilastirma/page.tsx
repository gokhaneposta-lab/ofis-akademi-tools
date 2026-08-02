import type { Metadata } from "next";
import TsbFinansalKarsilastirmaDashboard from "@/components/tsb/TsbFinansalKarsilastirmaDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.finansalKarsilastirma);

export default function SigortaFinansalKarsilastirmaPage() {
  return (
    <TsbPageLayout
      seoPageId="finansalKarsilastirma"
      currentHref="/sigorta/finansal-karsilastirma"
      title="Finansal karşılaştırma"
      description="Şirket sektörün neresinde — büyüklük, kâr ve oranlar nasıl kıyaslanıyor?"
      sourceNote={<TsbSourceNote />}
    >
      <TsbFinansalKarsilastirmaDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/finansal-karsilastirma" />
    </TsbPageLayout>
  );
}
