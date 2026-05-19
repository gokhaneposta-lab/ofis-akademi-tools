import Link from "next/link";
import type { Metadata } from "next";
import { TSB_DASHBOARD_GROUPS, TSB_DASHBOARD_PANELS } from "@/lib/tsbDashboardPanels";
import { canonicalUrl, getSiteUrl } from "@/lib/site";

const BASE = getSiteUrl();

export const metadata: Metadata = {
  title: "Sektör verileri (TSB) — Dashboard grubu | Ofis Akademi",
  description:
    "TSB tabanlı gösterge panelleri: çeyreklik finansal karşılaştırma ve aylık prim panelleri.",
  alternates: {
    canonical: canonicalUrl("/sigorta/tsb"),
  },
  openGraph: {
    title: "Sektör verileri (TSB) — Dashboard | Ofis Akademi",
    description: "TSB finansal ve prim panelleri.",
    url: `${BASE}/sigorta/tsb`,
    siteName: "Ofis Akademi",
    locale: "tr_TR",
    type: "website",
  },
};

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
            Türkiye Sigortalar Birliği kaynaklı, site içinde yeniden işlenmiş gösterge panelleri.{" "}
            <strong>Finansal karşılaştırma</strong> çeyrek bazında gelir tablosu ve bilanço KPI’larını;{" "}
            <strong>prim panelleri</strong> aylık üretim verisini kullanır.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 py-8 sm:px-6">
        {TSB_DASHBOARD_GROUPS.map((group) => {
          const panels = TSB_DASHBOARD_PANELS.filter((p) => p.group === group.id);
          return (
            <section key={group.id} aria-labelledby={`tsb-group-${group.id}`}>
              <h2 id={`tsb-group-${group.id}`} className="text-lg font-bold text-gray-900">
                {group.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-600">{group.description}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {panels.map((p) => (
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
                        <h3 className="mt-2 text-base font-bold text-gray-900 group-hover:text-emerald-800">
                          {p.title}
                        </h3>
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
          );
        })}

        <p className="text-center text-[11px] text-gray-500">
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
