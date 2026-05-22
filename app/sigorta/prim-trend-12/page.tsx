import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbPrimTrend12Dashboard from "@/components/tsb/TsbPrimTrend12Dashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";
import { TsbPageLayout } from "@/components/tsb/tsbDashboardUi";
import TsbSourceNote from "@/components/tsb/tsbSourceNote";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Son 12 ay prim trendi (sektör vs şirket) — TSB",
  description:
    "Seçilen bitiş ayına kadar geriye dönük en fazla 12 ay: sektör toplam prim (kırmızı) ile tek şirket priminin (yeşil) çizgi grafiği; hayat dışı / hayat–emeklilik, ana branş veya tarife grubu ve kanal filtresi.",
  alternates: {
    canonical: canonicalUrl("/sigorta/prim-trend-12"),
  },
  openGraph: {
    title: "Son 12 ay prim trendi (TSB) | Ofis Akademi",
    description:
      "Sektör (kırmızı) ve şirket (yeşil) aylık prim çizgisi; ana branş veya tarife grubu ve kanalla daraltma.",
    url: `${BASE}/sigorta/prim-trend-12`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaPrimTrend12Page() {
  return (
    <TsbPageLayout
      currentHref="/sigorta/prim-trend-12"
      title="Son 12 ay prim trendi"
      description={
        <>
          Belirlediğiniz <strong>bitiş ayına</strong> kadar geriye doğru en fazla <strong>12 ay</strong> için{" "}
          <strong>sektör toplam prim</strong> (kırmızı) ile seçtiğiniz <strong>şirket primi</strong> (yeşil) gösterilir.
          Üst grafik <strong>yıl içi kümülatif</strong> prim çizgisidir; alt grafik <strong>aylık üretimi</strong> (ardışık
          aylar arası fark) logaritmik sütunlarla verir. Hayat dışı / hayat–emeklilik, ana branş veya tarife grubu ve kanal
          ile daraltabilirsiniz.
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbPrimTrend12Dashboard />
      <TsbRelatedDashboards currentHref="/sigorta/prim-trend-12" />
    </TsbPageLayout>
  );
}
