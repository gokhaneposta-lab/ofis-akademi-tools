import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbFinansalKarsilastirmaDashboard from "@/components/tsb/TsbFinansalKarsilastirmaDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Finansal karşılaştırma (TSB) — Şirket vs HD sektör",
  description:
    "Çeyrek bazında gelir ve bilanço özet KPI’ları; seçilen hayat dışı şirket ile HD sektör (ortalama ve oranlarda Σ/Σ) yan yana.",
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link
            href="/sigorta/tsb"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline mb-3"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Sektör verileri (TSB)
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Finansal karşılaştırma</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Excel’deki <strong>Sektör Karşılaştırma</strong> düzenine benzer tablo: satırlarda KPI’lar, sütunlarda son{" "}
            <strong>10 çeyrek</strong>; her dönemde yan yana <strong>seçilen şirket</strong> ve{" "}
            <strong>HD sektör</strong> (hayat dışı peer havuzu). Varsayılan şirket{" "}
            <strong>Bereket Sigorta AŞ</strong> (kod 1025); listeden başka bir HD şirketi seçebilirsiniz. Veri:{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px]">gelir-tidy/</code> (dönem dosyaları) — tanımlar{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-[11px]">docs/tsb-kpi-tanimlari.md</code>.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <TsbFinansalKarsilastirmaDashboard />
        <TsbRelatedDashboards currentHref="/sigorta/finansal-karsilastirma" />
      </main>
    </div>
  );
}
