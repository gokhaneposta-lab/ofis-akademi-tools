import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbPrimWaterfallDashboard from "@/components/tsb/TsbPrimWaterfallDashboard";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Prim köprü grafiği (branş su şelalesi) — TSB",
  description:
    "Şirket toplam priminin iki dönem arasındaki farkını ana branş katkılarına bölen köprü grafiği; başlangıç ve bitiş dönemini seçebilirsiniz.",
  alternates: {
    canonical: canonicalUrl("/sigorta/prim-waterfall"),
  },
  openGraph: {
    title: "Prim köprü grafiği (TSB) | Ofis Akademi",
    description: "Branş bazlı prim değişimi — su şelalesi görünümü.",
    url: `${BASE}/sigorta/prim-waterfall`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaPrimWaterfallPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Prim köprü grafiği (branş su şelalesi)</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Seçilen şirketin toplam primi <strong>başlangıç</strong> ve <strong>bitiş</strong> dönemleri arasında nasıl
            değişti? Fark, ana branşların katkılarına ayrılır. Varsayılan karşılaştırma için{" "}
            <strong>Önceki yıl aynı ay</strong> veya <strong>Bir önceki ay</strong> düğmelerini kullanabilir; isterseniz
            başlangıç ayını listeden doğrudan seçebilirsiniz.
          </p>
          <aside className="mt-4 max-w-3xl rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] text-gray-600">
            <strong>Kaynak:</strong> TSB kamuya açık prim istatistikleri —{" "}
            <a
              href="https://www.tsb.org.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-800 underline decoration-emerald-600/40 hover:decoration-emerald-700"
            >
              tsb.org.tr
            </a>
            .
          </aside>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <TsbPrimWaterfallDashboard />
      </main>
    </div>
  );
}
