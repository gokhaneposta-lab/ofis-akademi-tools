import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbBransSiraDashboard from "@/components/tsb/TsbBransSiraDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";

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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Branş sıra özeti</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Hayat dışı ve hayat–emeklilik bloklarında her satır için <strong>prim</strong>, şirket portföyüne göre{" "}
            <strong>branş ağırlığı</strong> ve sektöre göre <strong>sektör ağırlığı</strong>, ardından seçilen aya göre{" "}
            <strong>sıra</strong> ve önceki yılın aynı ayına göre <strong>Δ sıra</strong> gösterilir. Üstteki daraltma
            türü ana branş veya tarife satır listesini değiştirir.
          </p>
          <aside className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] text-gray-600 max-w-3xl">
            <strong>Kaynak:</strong> TSB kamuya açık prim istatistikleri (işlenmiş). Resmi tablo için{" "}
            <a
              href="https://www.tsb.org.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-800 underline decoration-emerald-600/40"
            >
              tsb.org.tr
            </a>
            .
          </aside>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <TsbBransSiraDashboard />
        <TsbRelatedDashboards currentHref="/sigorta/brans-sira" />
      </main>
    </div>
  );
}
