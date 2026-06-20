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
      description={
        <>
          Çeyreklik gelir tablosu ve bilanço KPI&apos;ları; odak şirket ile sektör toplamı veya başka bir şirket yan yana,
          önceki yılın aynı çeyreğine göre değişimle.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbFinansalKarsilastirmaDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/finansal-karsilastirma" />
    </TsbPageLayout>
  );
}
