import Link from "next/link";
import type { Metadata } from "next";
import { metrics, metricCategoryLabels } from "@/lib/sektorMetrikData";

export const metadata: Metadata = {
  title: "Finans & Sigorta için Excel — Sektörel Metrikler",
  description:
    "Sigortacılık ve finans sektöründe kullanılan temel metrikleri Excel ile nasıl hesaplayacağınızı öğrenin. Hasar/Prim oranı, kazanılmış prim, yenileme oranı ve daha fazlası.",
  openGraph: {
    title: "Finans & Sigorta için Excel — Ofis Akademi",
    description:
      "Sigortacılık ve finans metriklerini Excel ile adım adım hesaplayın.",
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
            Sigortacılık ve finans sektöründe kullanılan temel metrikleri
            anlayın ve Excel ile hesaplayın. Her metrik için detaylı açıklama,
            adım adım rehber, gerçek hayat örnekleri ve{" "}
            <strong>interaktif hesaplayıcı</strong> bulunmaktadır.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
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

        {/* Coming soon teaser */}
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white/50 p-6 text-center">
          <p className="text-sm text-gray-500">
            <strong>Yakında:</strong> Finansal Oranlar (Cari Oran, Nakit Oran, VÖK) ve
            Operasyonel Metrikler (SLA, Turnover) eklenecektir.
          </p>
        </section>
      </main>
    </div>
  );
}
