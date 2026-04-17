import Link from "next/link";
import type { Metadata } from "next";
import { metrics, metricCategoryLabels } from "@/lib/sektorMetrikData";
import { canonicalUrl, getSiteUrl } from "@/lib/site";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Finans & Sigorta için Excel — Sektörel Metrikler",
  description:
    "Sigortacılık ve finans: H/P, kazanılmış prim, KPK, muallak hasar, matematik karşılıklar, DERK, dengeleme karşılığı, cari oran, VÖK ve operasyonel KPI'lar — Excel rehberi ve hesaplayıcılar.",
  alternates: {
    canonical: canonicalUrl("/finans-sigorta"),
  },
  openGraph: {
    title: "Finans & Sigorta için Excel — Ofis Akademi",
    description:
      "Sigortacılık ve finans metriklerini Excel ile adım adım hesaplayın.",
    url: `${BASE}/finans-sigorta`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

export default function FinansSigortaPage() {
  const grouped = metrics.reduce(
    (acc, m) => {
      if (!acc[m.category]) acc[m.category] = [];
      acc[m.category].push(m);
      return acc;
    },
    {} as Record<string, typeof metrics>,
  );

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
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Finans & Sigorta için Excel
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Teknik sigortacılık (UW), finansal oranlar ve operasyonel KPI&apos;ları
            anlayın; Excel ile hesaplayın. Her metrikte açıklama, adımlar, örnekler ve{" "}
            <strong>interaktif hesaplayıcı</strong> vardır.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="mb-8 rounded-2xl border-2 border-emerald-400/80 bg-gradient-to-b from-emerald-50 to-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Yeni · Blog rehberi
              </span>
              <h2 className="mt-2 text-lg font-bold text-gray-900 sm:text-xl">
                IFRS 17 (TFRS 17) &mdash; Sigorta Mali Tablosu + Excel Şablonu
              </h2>
              <p className="mt-1 text-[13px] text-gray-600 sm:text-sm">
                CSM nedir, gelir tablosu nasıl okunur ve Excel&apos;de nasıl modellenir? Serinin tüm yazılarına ve ücretsiz şablona hub yazıdan ulaşın.
              </p>
            </div>
            <Link
              href="/blog/tfrs-17-yeni-sigorta-mali-tablosu-rehberi"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#217346] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90 sm:text-sm"
            >
              IFRS 17 rehberini oku →
            </Link>
          </div>
        </section>

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-10">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              <span className="h-1 w-5 rounded-full bg-emerald-500" />
              {metricCategoryLabels[category as keyof typeof metricCategoryLabels]}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((m) => (
                <Link
                  key={m.slug}
                  href={`/finans-sigorta/${m.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-emerald-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {m.name}
                      </h3>
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                        {m.nameEn}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-3">
                    {m.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Hesaplayıcı
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        Excel Rehberi
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-600 group-hover:underline">
                      Detay →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

      </main>
    </div>
  );
}
