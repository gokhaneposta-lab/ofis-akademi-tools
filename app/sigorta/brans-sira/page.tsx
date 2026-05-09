import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbBransSiraDashboard from "@/components/tsb/TsbBransSiraDashboard";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Branş sıra özeti (TSB) — Şirket bazlı sektör sıralaması",
  description:
    "Hayat dışı ve hayat–emeklilik ana branşlarında seçilen şirketin prim sırası; önceki yılın aynı ayı ile kıyas (TSB verisi).",
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
            Her ana branş için seçilen şirketin <strong>prim sırası</strong>, o branşta üretimi olan diğer şirketlere göre
            hesaplanır. Karşılaştırma, seçtiğiniz dönem ile <strong>bir önceki yılın aynı ayı</strong> arasındaki sıra
            farkını gösterir. Şirketi listeden değiştirebilirsiniz; sayfa açıldığında sık izlenen bir şirket önceliklidir
            (ör. <strong>Bereket Sigorta AŞ</strong>, kod 1025). Hayat–emeklilik şirketleri için listeden uygun kodu
            seçebilirsiniz (ör. <strong>Bereket Emeklilik ve Hayat AŞ</strong>, 3005).
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
      </main>
    </div>
  );
}
