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
    "TSB gelir tablosu pivotu ile uyumlu hasar/prim oranları: brüt ve net, DERK dahil ve hariç; branş ve çeyrek seçimi; sektör sıralaması.",
  alternates: {
    canonical: canonicalUrl("/sigorta/hasar-prim-orani"),
  },
  openGraph: {
    title: "Hasar / Prim oranı (TSB) | Ofis Akademi",
    description: "Branş bazlı H/P · DERK dahil/hariç · sektör sıralaması.",
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
          TSB&apos;nin <strong>Hasar Prim Oranları</strong> pivot raporu ile aynı mantık: satırlarda şirketler; sütunlarda
          kazanılmış prim ve gerçekleşen hasar ara kalemleri; en sağda <strong>dört H/P oranı</strong> (brüt/net × DERK
          dahil/hariç). <strong>Genel (hayat dışı)</strong> = Excel GENEL sayfası; branş seçimi tek GT dilimidir. Sektör
          toplamında pay ve payda ayrı Σ alınır (ortalama değil).
        </>
      }
      sourceNote={<TsbSourceNote />}
    >
      <TsbHasarPrimDashboard />
      <TsbRelatedDashboards currentHref="/sigorta/hasar-prim-orani" />
    </TsbPageLayout>
  );
}
