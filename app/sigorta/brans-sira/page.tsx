import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbBransSiraDashboard from "@/components/tsb/TsbBransSiraDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Branş sıra özeti (TSB) — Şirket bazlı sektör sıralaması",
  description:
    "Hayat dışı ve hayat–emeklilik branş/tarife satırlarında şirket primi, branş ve sektör ağırlığı (%), sektör içi sıra ve önceki yılın aynı ayına göre Δ sıra (TSB verisi).",
  alternates: {
    canonical: canonicalUrl("/sigorta/brans-sira"),
  },
  openGraph: {
    title: "Branş sıra özeti | Ofis Akademi",
    description: "TSB verisi · branş bazında sektör içi sıralama.",
    url: `${BASE}/sigorta/brans-sira`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaBransSiraPage() {
  return (
    <TsbPageLayout
      currentHref="/sigorta/brans-sira"
      title="Branş sıra özeti"
      description={
        <>
          Branş/tarife satırında prim, portföy ağırlığı, sektör içi sıra ve önceki yılın aynı ayına göre Δ sıra.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbBransSiraDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/brans-sira" />
    </TsbPageLayout>
  );
}
