import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbKanalPrimDashboard from "@/components/tsb/TsbKanalPrimDashboard";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Kanal Bazlı Prim Üretimi (Hayat Dışı / Hayat–Emeklilik) — TSB Verisi",
  description:
    "TSB satış kanalı bazında prim: hayat dışı (HD) ve hayat–emeklilik (kod 3… veya tip H); dönem, ana branş ve kanal; sıra, pay ve toplam satırı.",
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
            href="/finans-sigorta"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline mb-3"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Finans &amp; Sigorta
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Kanal bazlı prim üretimi (Hayat dışı / Hayat–emeklilik)
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-3xl">
            Sigorta Bilgi ve Gözetim Merkezi&apos;nin yayınladığı{" "}
            <strong>satış kanalı bazında primler</strong> verisinden türetilmiş özet tablo.{" "}
            <strong>Hayat–emeklilik</strong> görünümünde şirket kodu <strong>3</strong> ile başlayan şirketler ile tip{" "}
            <strong>H</strong> olanlar yer alır; <strong>Hayat dışı</strong> görünümünde tip <strong>HD</strong> ve kodu{" "}
            <strong>3</strong> ile başlamayan şirketler listelenir. Dönem, ana branş ve kanala göre filtreleyin; önceki yıl
            karşılaştırması aynı takvim ayı için hesaplanır (ör. 2026-03 ↔ 2025-03). Tabloda alt satırda seçili filtreye
            göre prim toplamı gösterilir.
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
        <section className="mt-10 rounded-xl border border-gray-200 bg-white p-4 text-[13px] text-gray-600 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Veriyi güncellemek</h2>
          <p className="mt-2">
            Yeni TSB Excel dosyasını projeye ekleyip şu komutu çalıştırın (dosya adında yıl ve ay bulunsun, örn.{" "}
            <code className="rounded bg-gray-100 px-1">…2026 03…xlsx</code> veya{" "}
            <code className="rounded bg-gray-100 px-1">prim-2026-03.xlsx</code>):
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-900 px-3 py-2 text-[12px] text-emerald-100">
            npm run tsb:import-prim -- path/dosya.xlsx
          </pre>
          <p className="mt-2">
            Aynı dönem tekrar içe aktarılırsa mevcut satırlar yenisiyle değiştirilir. Çıktı:{" "}
            <code className="rounded bg-gray-100 px-1">public/data/tsb/prim-tidy.json</code>
          </p>
        </section>
      </main>
    </div>
  );
}
