import type { Metadata } from "next";
import TsbAnaBransTkzDashboard from "@/components/tsb/TsbAnaBransTkzDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/TsbPageLayout";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.anaBransTkz);

export default function SigortaAnaBransTkzPage() {
  return (
    <TsbPageLayout
      seoPageId="anaBransTkz"
      currentHref="/sigorta/ana-brans-tkz"
      title="Ana branş TKZ"
      description="Hangi branşlar teknik kâr üretiyor — gelir, gider ve TKZ nasıl dağılmış?"
      sourceNote={<TsbSourceNote />}
    >
      <TsbAnaBransTkzDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/ana-brans-tkz" />
    </TsbPageLayout>
  );
}
