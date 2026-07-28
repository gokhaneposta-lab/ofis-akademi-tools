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
      title="TSB ana branş TKZ tablosu"
      description={
        <>
          Son finansal dönemde seçili şirketin ve kıyasın TSB ana branş bazında <strong>Teknik Gelir</strong>,{" "}
          <strong>Teknik Gider</strong> ve <strong>TKZ</strong> kırılımı.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbAnaBransTkzDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/ana-brans-tkz" />
    </TsbPageLayout>
  );
}
