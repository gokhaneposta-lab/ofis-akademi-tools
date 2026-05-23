import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbKanalPrimDashboard from "@/components/tsb/TsbKanalPrimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Kanal Bazlı Prim Üretimi (Hayat Dışı / Hayat–Emeklilik) — TSB Verisi",
  description:
    "TSB kanal bazlı prim özeti: hayat ve hayat dışı grupları, dönem ve kanal filtreleri, sıra ve pay.",
  alternates: {
    canonical: canonicalUrl("/sigorta/kanal-prim"),
  },
  openGraph: {
    title: "Kanal Bazlı Prim (Hayat Dışı / Hayat–Emeklilik) | Ofis Akademi",
    description: "TSB prim verisi; filtreler ve tablo altında sektör toplamı.",
    url: `${BASE}/sigorta/kanal-prim`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaKanalPrimPage() {
  return (
    <TsbPageLayout
      currentHref="/sigorta/kanal-prim"
      title="Kanal bazlı prim üretimi (Hayat dışı / Hayat–emeklilik)"
      description={
        <>
          Satış kanalı bazında prim özeti; hayat dışı ve hayat–emeklilik ayrı bloklarda, dönem ve kanal filtreleriyle.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbKanalPrimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/kanal-prim" />
    </TsbPageLayout>
  );
}
