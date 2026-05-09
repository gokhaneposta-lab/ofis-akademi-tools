import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbPrimTrend12Dashboard from "@/components/tsb/TsbPrimTrend12Dashboard";

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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Son 12 ay prim trendi</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Belirlediğiniz <strong>bitiş ayına</strong> kadar geriye doğru en fazla <strong>12 ay</strong> için{" "}
            <strong>sektör toplam prim</strong> (kırmızı) ile seçtiğiniz <strong>şirket primi</strong> (yeşil; varsayılan
            Bereket) yan yana çizilir. Üstteki görünüm anahtarı ile hayat dışı veya hayat–emeklilik havuzunu seçebilir,
            <strong> ana branş (TSB)</strong> veya <strong>tarife grubu</strong> ile daraltabilir ve <strong>kanal</strong>{" "}
            seçebilirsiniz.
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
        <TsbPrimTrend12Dashboard />
      </main>
    </div>
  );
}
