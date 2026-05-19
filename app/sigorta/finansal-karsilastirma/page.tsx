import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbFinansalKarsilastirmaDashboard from "@/components/tsb/TsbFinansalKarsilastirmaDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Finansal karşılaştırma (TSB) — Şirket vs HD sektör",
  description:
    "Çeyrek bazında gelir ve bilanço özet KPI'ları; seçilen hayat dışı şirket ile HD sektör (ortalama ve oranlarda Σ/Σ) yan yana.",
  alternates: {
    canonical: canonicalUrl("/sigorta/finansal-karsilastirma"),
  },
  openGraph: {
    title: "Finansal karşılaştırma (TSB) | Ofis Akademi",
    description: "KPI satırları · dönem sütunları · şirket ve HD sektör.",
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
          Excel&apos;deki <strong>Sektör Karşılaştırma</strong> düzenine benzer tablo: satırlarda KPI&apos;lar, sütunlarda
          son <strong>10 çeyrek</strong>; her dönemde yan yana <strong>seçilen şirket</strong> ve{" "}
          <strong>HD sektör</strong> (hayat dışı peer havuzu). Varsayılan şirket <strong>Bereket Sigorta AŞ</strong> (kod
          1025); listeden başka bir HD şirketi veya sektör ortalaması ile kıyas yapabilirsiniz. Güncelleme{" "}
          <strong>çeyrek</strong> bazındadır (gelir tablosu ve bilanço özeti).
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbFinansalKarsilastirmaDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/finansal-karsilastirma" />
    </TsbPageLayout>
  );
}
