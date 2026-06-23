import type { Metadata } from "next";
import TsbOlcekSegmentasyonDashboard from "@/components/tsb/TsbOlcekSegmentasyonDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.olcekSegmentasyon);

export default function SigortaOlcekSegmentasyonPage() {
  return (
    <TsbPageLayout
      seoPageId="olcekSegmentasyon"
      currentHref="/sigorta/olcek-segmentasyon"
      title="Ölçek segmentasyonu"
      description={
        <>
          Son finansal çeyreğe göre şirketler brüt prim, özsermaye ve toplam aktif büyüklüklerine göre A+…D
          ölçek gruplarına ayrılır. Hayat dışı ve hayat–emeklilik havuzları ayrı sınıflandırılır; tabloda
          segmentteki tüm şirketler listelenir.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbOlcekSegmentasyonDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/olcek-segmentasyon" />
    </TsbPageLayout>
  );
}
