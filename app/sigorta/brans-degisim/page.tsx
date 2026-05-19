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
          Bu panel, <strong>TSB prim verisi</strong> üzerinden seçtiğiniz şirketi sektörle{" "}
          <strong>ana branş veya tarife grubu</strong> satırlarında karşılaştırır (üstteki daraltma türü ile seçilir).
          Üstte <strong>hayat dışı</strong>, altta <strong>hayat ve emeklilik</strong> listelenir; ara toplamlar ve genel
          toplam özeti verir. Yüzde değişimleri, seçtiğiniz rapor ayına göre{" "}
          <strong>bir önceki yılın aynı ayı</strong> ile kıyaslanarak hesaplanır.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbBransDegisimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/brans-degisim" />
    </TsbPageLayout>
  );
}
