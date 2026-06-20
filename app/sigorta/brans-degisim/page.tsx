import type { Metadata } from "next";
import TsbBransDegisimDashboard from "@/components/tsb/TsbBransDegisimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.bransDegisim);

export default function SigortaBransDegisimPage() {
  return (
    <TsbPageLayout
      seoPageId="bransDegisim"
      currentHref="/sigorta/brans-degisim"
      title="Sektör branş değişim tablosu"
      description={
        <>
          Ana branş veya tarife satırlarında şirket–sektör prim karşılaştırması; önceki yılın aynı ayına göre değişim ve
          pazar payı.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbBransDegisimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/brans-degisim" />
    </TsbPageLayout>
  );
}
