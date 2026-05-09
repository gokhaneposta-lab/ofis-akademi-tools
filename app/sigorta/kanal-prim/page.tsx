import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbKanalPrimDashboard from "@/components/tsb/TsbKanalPrimDashboard";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Kanal Bazlı Prim Üretimi (Hayat Dışı / Hayat–Emeklilik) — TSB Verisi",
  description:
    "TSB kanal bazlı prim özeti: hayat ve hayat dışı grupları, dönem ve kanal filtreleri, sıra ve pay.",
  alternates: {
    canonical: canonicalUrl("/sigorta/kanal-prim"),
  },
  openGraph: {
    title: "Kanal Bazlı Prim (Hayat Dışı / Hayat–Emeklilik) | Ofis Akademi",
    description:
      "TSB prim verisi; filtreler ve tablo altında sektör toplamı.",
    url: `${BASE}/sigorta/kanal-prim`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaKanalPrimPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Kanal bazlı prim üretimi (Hayat dışı / Hayat–emeklilik)
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            TSB satış kanalı bazında prim verisinden hazırlanmış özet tablo.{" "}
            <strong>Hayat</strong> ve <strong>hayat dışı</strong> şirketler üstteki görünümde ayrı gruplanmıştır; dönem,
            ana branş ve kanal ile filtreleyerek tabloyu daraltabilirsiniz.
          </p>
          <aside className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] text-gray-600 max-w-3xl">
            <strong>Kaynak:</strong> TSB kamuya açık prim istatistikleri. Ofis Akademi bu veriyi yeniden düzenler;
            resmi tablo ve yöntem için her zaman{" "}
            <a
              href="https://www.tsb.org.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-800 underline decoration-emerald-600/40 hover:decoration-emerald-700"
            >
              tsb.org.tr
            </a>{" "}
            adresine başvurun.
          </aside>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <TsbKanalPrimDashboard />
      </main>
    </div>
  );
}
