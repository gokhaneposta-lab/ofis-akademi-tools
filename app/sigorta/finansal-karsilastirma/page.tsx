import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbFinansalKarsilastirmaDashboard from "@/components/tsb/TsbFinansalKarsilastirmaDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Finansal karşılaştırma (TSB) — Şirket vs sektör toplamı",
  description:
    "Çeyreklik gelir tablosu ve bilanço özet KPI'ları; seçilen şirket ile sektör toplamı veya başka bir şirket yan yana.",
  alternates: {
    canonical: canonicalUrl("/sigorta/finansal-karsilastirma"),
  },
  openGraph: {
    title: "Finansal karşılaştırma (TSB) | Ofis Akademi",
    description: "KPI satırları · dönem sütunları · şirket ve sektör toplamı.",
    url: `${BASE}/sigorta/finansal-karsilastirma`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaFinansalKarsilastirmaPage() {
  return (
    <TsbPageLayout
      currentHref="/sigorta/finansal-karsilastirma"
      title="Finansal karşılaştırma"
      description={
        <>
          Çeyreklik <strong>gelir tablosu</strong> ve <strong>bilanço</strong> özetinden türetilmiş finansal göstergeleri tek
          ekranda karşılaştırın. Sol tarafta seçtiğiniz şirket, sağ tarafta <strong>sektör toplamı</strong> veya başka bir
          şirket yer alır; havuz hayat dışı veya hayat/emeklilik olarak filtrelenebilir. TL tutarları ve oranlar (ör. brüt
          prim, özsermaye oranları, hasar/prim) aynı satırda yan yana gösterilir; önceki yılın aynı çeyreği ile değişim
          okunabilir.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbFinansalKarsilastirmaDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/finansal-karsilastirma" />
    </TsbPageLayout>
  );
}
