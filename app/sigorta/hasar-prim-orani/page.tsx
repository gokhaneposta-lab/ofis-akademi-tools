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
          <strong>Hasar/prim (H/P) oranı</strong>, dönem içinde gerçekleşen hasarın kazanılmış prime oranını gösterir; genelde
          düşük oran daha iyi teknik sonuç anlamına gelir. Havuz (hayat dışı veya hayat/emeklilik), branş veya tarife
          grubu ile kırılımı daraltın; <strong>odak şirketi</strong> seçerek sektör tablosundaki sıranızı ve trend
          grafiğindeki konumunuzu görün. Tabloda brüt/net H/P, devam eden riskler karşılığı (DERK) dahil ve hariç olmak
          üzere dört varyant sunulur; sektör toplamı tüm şirketlerin birleşik hasar ve priminden hesaplanır.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbHasarPrimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/hasar-prim-orani" />
    </TsbPageLayout>
  );
}
