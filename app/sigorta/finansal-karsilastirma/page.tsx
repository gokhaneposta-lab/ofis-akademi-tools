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
    "Çeyrek bazında gelir ve bilanço özet KPI'ları; seçilen şirket ile havuzdaki şirketlerin toplamı (TL) ve oranlarda Σ pay / Σ payda yan yana.",
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
          Excel&apos;deki <strong>Sektör Karşılaştırma</strong> düzenine benzer tablo: satırlarda KPI&apos;lar; her dönemde yan
          yana <strong>seçilen şirket</strong> ve <strong>sektör toplamı</strong> (havuzdaki tüm şirketlerin Σ&apos;si — HD veya
          hayat/emeklilik havuzu). Varsayılan şirket <strong>Bereket Sigorta AŞ</strong> (kod 1025); listeden başka bir şirket
          veya sektör toplamı ile kıyas yapabilirsiniz. Brüt prim: hayat dışı şirketlerde{" "}
          <strong>60001</strong> (HAYATDISI); hayat/emeklilik şirketlerinde ek olarak tüm branşlarda{" "}
          <strong>62001</strong> (hayat üretimi) dahildir. Güncelleme <strong>çeyrek</strong> bazındadır (gelir tablosu ve
          bilanço özeti).
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbFinansalKarsilastirmaDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/finansal-karsilastirma" />
    </TsbPageLayout>
  );
}
