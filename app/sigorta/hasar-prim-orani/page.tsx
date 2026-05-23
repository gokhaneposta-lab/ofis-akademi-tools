import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbHasarPrimDashboard from "@/components/tsb/TsbHasarPrimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Hasar / Prim oranı (TSB) — Branş bazlı H/P tablosu",
  description:
    "Hasar/prim oranı: brüt ve net, DERK dahil ve hariç; branş veya tarife grubu seçimi; sektör sıralaması ve çeyreklik trend.",
  alternates: {
    canonical: canonicalUrl("/sigorta/hasar-prim-orani"),
  },
  openGraph: {
    title: "Hasar / Prim oranı (TSB) | Ofis Akademi",
    description: "Branş bazlı H/P · sektör sıralaması · çeyreklik trend.",
    url: `${BASE}/sigorta/hasar-prim-orani`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaHasarPrimOraniPage() {
  return (
    <TsbPageLayout
      currentHref="/sigorta/hasar-prim-orani"
      title="Hasar / Prim oranı"
      description={
        <>
          Hasar/prim (H/P) oranı: branş veya tarife grubu kırılımında brüt/net, DERK dahil/hariç; odak şirketin sektör
          sırası ve çeyreklik trendi.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbHasarPrimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/hasar-prim-orani" />
    </TsbPageLayout>
  );
}
