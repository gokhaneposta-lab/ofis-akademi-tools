import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import TsbKanalDagilimDashboard from "@/components/tsb/TsbKanalDagilimDashboard";
import TsbRelatedDashboards from "@/components/tsb/TsbRelatedDashboards";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Sektör kanal dağılımı (TSB) — Şirket vs sektör",
  description:
    "Hayat dışı veya hayat–emeklilik kapsamında merkez, acente, banka, broker ve diğer kanallarda prim dağılımı; şirket ve sektör yan yana.",
  alternates: {
    canonical: canonicalUrl("/sigorta/kanal-dagilim"),
  },
  openGraph: {
    title: "Sektör kanal dağılımı | Ofis Akademi",
    description: "TSB verisi · kanal bazında pay karşılaştırması.",
    url: `${BASE}/sigorta/kanal-dagilim`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function SigortaKanalDagilimPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sektör kanal dağılımı</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Seçilen dönem ve ana branş filtresinde <strong>şirketin</strong> kanal kırılımı ile <strong>sektörün</strong>{" "}
            (aynı filtredeki toplam) kanal kırılımını karşılaştırın. Varsayılan şirket hayat dışında{" "}
            <strong>Bereket Sigorta AŞ</strong>, hayat–emeklilikte veri varsa <strong>Bereket Emeklilik ve Hayat AŞ</strong>{" "}
            önceliklidir.
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
        <TsbKanalDagilimDashboard />
        <TsbRelatedDashboards currentHref="/sigorta/kanal-dagilim" />
      </main>
    </div>
  );
}
