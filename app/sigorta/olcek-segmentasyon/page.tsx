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
      description="Şirketler hangi ölçek grubunda — A+’dan D’ye kimlerle aynı lige düşüyor?"
      sourceNote={<TsbSourceNote />}
    >
      <TsbOlcekSegmentasyonDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/olcek-segmentasyon" />
    </TsbPageLayout>
  );
}
