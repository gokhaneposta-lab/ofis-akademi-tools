import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbBransPayDagilimDashboard from "@/components/tsb/TsbBransPayDagilimDashboard";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Branş üretim payı — şirket vs sektör (TSB) | Ofis Akademi",
  description:
    "Seçilen şirketin portföyünde branş veya tarife grubu dağılımını, aynı kırılımda sektör dağılımı ile yan yana %100 yığılmış şerit grafikte karşılaştırın (TSB prim verisi).",
  alternates: {
    canonical: canonicalUrl("/sigorta/brans-pay-dagilim"),
  },
  openGraph: {
    title: "Branş üretim payı — şirket vs sektör | Ofis Akademi",
    description: "TSB verisiyle branş/tarife pay dağılımı karşılaştırması.",
    url: `${BASE}/sigorta/brans-pay-dagilim`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaBransPayDagilimPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link
            href="/sigorta/tsb"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Sektör verileri (TSB)
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Branş üretim payı (şirket vs sektör)</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Bu panel, seçtiğiniz <strong>rapor ayı</strong> ve <strong>kanal</strong> için şirketinizin üretimini hangi{" "}
            <strong>ana branş veya tarife grubuna</strong> yaydığını gösterir; sağdaki şeritte aynı kırılımda{" "}
            <strong>tüm sektörün</strong> dağılımını görürsünüz. Aynı kategori her iki grafikte{" "}
            <strong>aynı renkle</strong> eşleşir; böylece portföyünüzün sektör ortalamasından nasıl ayrıştığını hızlıca
            okuyabilirsiniz.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <TsbBransPayDagilimDashboard />
      </main>
    </div>
  );
}
