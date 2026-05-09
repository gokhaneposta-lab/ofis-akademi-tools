import Link from "next/link";
import type { Metadata } from "next";
import { canonicalUrl, getSiteUrl } from "@/lib/site";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Sektör verileri (TSB) — Dashboard grubu | Ofis Akademi",
  description:
    "TSB tabanlı gösterge panelleri: kanal bazlı prim, branş değişim tablosu ve sektör karşılaştırmaları.",
  alternates: {
    canonical: canonicalUrl("/sigorta/tsb"),
  },
  openGraph: {
    title: "Sektör verileri (TSB) — Dashboard | Ofis Akademi",
    description: "TSB verisiyle kanal ve branş panelleri.",
    url: `${BASE}/sigorta/tsb`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

const PANELLER = [
  {
    href: "/sigorta/kanal-prim",
    badge: "Kanal",
    title: "Kanal bazlı prim",
    subtitle: "Satış kanalı kırılımı · hayat dışı / hayat–emeklilik",
    icon: "📊",
  },
  {
    href: "/sigorta/kanal-dagilim",
    badge: "Dağılım",
    title: "Sektör kanal dağılımı",
    subtitle: "Şirket vs sektör · kanal payları ve yüzdeler",
    icon: "📈",
  },
  {
    href: "/sigorta/brans-degisim",
    badge: "Branş",
    title: "Sektör branş değişim tablosu",
    subtitle: "Şirket vs sektör · pazar payı · önceki yıl aynı ay",
    icon: "📑",
  },
  {
    href: "/sigorta/brans-sira",
    badge: "Sıra",
    title: "Branş sıra özeti",
    subtitle: "Sıra · branş/sektör ağırlığı · önceki yıl Δ sıra",
    icon: "🏅",
  },
  {
    href: "/sigorta/prim-trend-12",
    badge: "Trend",
    title: "Son 12 ay prim",
    subtitle: "Sektör vs şirket çizgisi · aylık üretim",
    icon: "〰️",
  },
] as const;

export default function SigortaTsbHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:underline mb-3"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Ana Sayfa
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Sektör verileri (TSB)</h1>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Dashboard
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Türkiye Sigortalar Birliği kaynaklı, site içinde yeniden işlenmiş gösterge panelleri. Finans &amp; Sigorta
            metrikleri buradan bağımsız bir <strong>dashboard grubu</strong> olarak düzenlenir; yeni paneller bu sayfaya
            eklenecek.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section aria-labelledby="tsb-panels">
          <h2 id="tsb-panels" className="sr-only">
            TSB panelleri
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PANELLER.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden>
                    {p.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                      {p.badge}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-gray-900 group-hover:text-emerald-800">{p.title}</h3>
                    <p className="mt-1 text-xs text-gray-600">{p.subtitle}</p>
                  </div>
                </div>
                <p className="mt-4 text-right text-[11px] font-semibold text-emerald-700 group-hover:underline">
                  Panele git →
                </p>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-10 text-center text-[11px] text-gray-500">
          <Link href="/finans-sigorta" className="font-medium text-emerald-700 hover:underline">
            Finans &amp; Sigorta metrikleri
          </Link>
          · Kaynak ve yöntem için{" "}
          <a
            href="https://www.tsb.org.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-700 underline decoration-emerald-600/40"
          >
            tsb.org.tr
          </a>
        </p>
      </main>
    </div>
  );
}
