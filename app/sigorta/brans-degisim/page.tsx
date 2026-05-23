import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbBransDegisimDashboard from "@/components/tsb/TsbBransDegisimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Sektör branş değişim tablosu (TSB) — Şirket vs sektör",
  description:
    "Hayat dışı ve hayat–emeklilik kırılımında şirket–sektör prim karşılaştırması; ana branş veya tarife grubu görünümü (daraltma türü), seçilen ay ile önceki yılın aynı ayı arasında değişim ve pazar payı.",
  alternates: {
    canonical: canonicalUrl("/sigorta/brans-degisim"),
  },
  openGraph: {
    title: "Sektör branş değişim tablosu | Ofis Akademi",
    description: "TSB prim verisi · branş bazında şirket vs sektör.",
    url: `${BASE}/sigorta/brans-degisim`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaBransDegisimPage() {
  return (
    <TsbPageLayout
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
