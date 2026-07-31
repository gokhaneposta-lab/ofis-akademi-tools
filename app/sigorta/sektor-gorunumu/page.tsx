import type { Metadata } from "next";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSektorGorunumuDashboard from "@/components/tsb/TsbSektorGorunumuDashboard";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.sektorGorunumu);

export default function SigortaSektorGorunumuPage() {
  return (
    <TsbPageLayout
      seoPageId="sektorGorunumu"
      currentHref="/sigorta/sektor-gorunumu"
      title="Sigorta sektörü görünümü"
      description={
        <>
          Hayat dışı, hayat–emeklilik ve birleşik sektörün finansal büyüklükleri; kârlılık, bilanço,
          teknik oranlar ve ilk 10 şirket kırılımıyla.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbSektorGorunumuDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/sektor-gorunumu" />
    </TsbPageLayout>
  );
}
