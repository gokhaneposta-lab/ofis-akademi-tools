import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbBransDegisimDashboard from "@/components/tsb/TsbBransDegisimDashboard";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Sektör branş değişim tablosu (TSB) — Şirket vs sektör",
  description:
    "Hayat dışı ve hayat–emeklilik kırılımında şirket–sektör prim karşılaştırması; ana branş veya tarife grubu görünümü (daraltma türü), seçilen ay ile önceki yılın aynı ayı arasında değişim ve pazar payı.",
  alternates: {
    canonical: canonicalUrl("/sigorta/brans-degisim"),
  },
  openGraph: {
    title: "Sektör branş değişim tablosu | Ofis Akademi",
    description: "TSB prim verisi · branş bazında şirket vs sektör.",
    url: `${BASE}/sigorta/brans-degisim`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaBransDegisimPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sektör branş değişim tablosu</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Bu panel, <strong>TSB prim verisi</strong> üzerinden seçtiğiniz şirketi sektörle{" "}
            <strong>ana branş veya tarife grubu</strong> satırlarında karşılaştırır (üstteki daraltma türü ile seçilir).
            Üstte <strong>hayat dışı</strong>, altta <strong>hayat ve emeklilik</strong> listelenir; ara toplamlar ve genel
            toplam özeti verir. Yüzde değişimleri, seçtiğiniz rapor ayına göre{" "}
            <strong>bir önceki yılın aynı ayı</strong> ile kıyaslanarak hesaplanır.
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
        <TsbBransDegisimDashboard />
      </main>
    </div>
  );
}
