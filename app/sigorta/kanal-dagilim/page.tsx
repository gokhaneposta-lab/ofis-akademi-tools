import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbKanalDagilimDashboard from "@/components/tsb/TsbKanalDagilimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Sektör kanal dağılımı (TSB) — Şirket vs sektör",
  description:
    "Hayat dışı veya hayat–emeklilik kapsamında merkez, acente, banka, broker ve diğer kanallarda prim dağılımı; şirket ve sektör yan yana.",
  alternates: {
    canonical: canonicalUrl("/sigorta/kanal-dagilim"),
  },
  openGraph: {
    title: "Sektör kanal dağılımı | Ofis Akademi",
    description: "TSB verisi · kanal bazında pay karşılaştırması.",
    url: `${BASE}/sigorta/kanal-dagilim`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaKanalDagilimPage() {
  return (
    <TsbPageLayout
      currentHref="/sigorta/kanal-dagilim"
      title="Sektör kanal dağılımı"
      description={
        <>
          Seçilen dönem ve ana branş filtresinde <strong>şirketin</strong> kanal kırılımı ile{" "}
          <strong>sektörün</strong> (aynı filtredeki toplam) kanal kırılımını karşılaştırın. Varsayılan şirket hayat
          dışında <strong>Bereket Sigorta AŞ</strong>, hayat–emeklilikte veri varsa{" "}
          <strong>Bereket Emeklilik ve Hayat AŞ</strong> önceliklidir.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbKanalDagilimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/kanal-dagilim" />
    </TsbPageLayout>
  );
}
