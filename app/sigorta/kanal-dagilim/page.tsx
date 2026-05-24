import type { Metadata } from "next";
import TsbKanalDagilimDashboard from "@/components/tsb/TsbKanalDagilimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";
import { TSB_SEO, tsbPageMetadata } from "@/lib/tsbSeo";

export const metadata: Metadata = tsbPageMetadata(TSB_SEO.kanalDagilim);

export default function SigortaKanalDagilimPage() {
  return (
    <TsbPageLayout
      seoPageId="kanalDagilim"
      currentHref="/sigorta/kanal-dagilim"
      title="Sektör kanal dağılımı"
      description={
        <>
          Odak şirketin kanal payları ile sektör dağılımı aynı dönem ve branş filtresinde yan yana.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbKanalDagilimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/kanal-dagilim" />
    </TsbPageLayout>
  );
}
