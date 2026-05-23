import Link from "next/link";
import type { Metadata } from "next";
import { TSB_DASHBOARD_GROUPS, TSB_DASHBOARD_PANELS } from "@/lib/tsbDashboardPanels";
import { canonicalUrl, getSiteUrl } from "@/lib/site";
import { tsb } from "@/components/tsb/tsbDashboardUi";

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
    <div className={tsb.pageBg}>
      <header className={tsb.pageHeader}>
        <div className={tsb.pageHeaderInner}>
          <Link href="/" className={tsb.backLink}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Ana Sayfa
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className={tsb.pageTitle}>Sektör verileri (TSB)</h1>
            <span className={tsb.pageBadge}>Dashboard</span>
          </div>
          <p className={tsb.pageLead}>
            Türkiye Sigortalar Birliği kaynaklı, site içinde yeniden işlenmiş gösterge panelleri.{" "}
            <strong>Finansal karşılaştırma</strong> çeyrek bazında gelir tablosu ve bilanço KPI&apos;larını;{" "}
            <strong>prim panelleri</strong> aylık üretim verisini kullanır.
          </p>
        </div>
      </header>

      <main className={tsb.main}>
        {TSB_DASHBOARD_GROUPS.map((group) => {
          const panels = TSB_DASHBOARD_PANELS.filter((p) => p.group === group.id);
          return (
            <section key={group.id} aria-labelledby={`tsb-group-${group.id}`}>
              <h2 id={`tsb-group-${group.id}`} className="text-base font-semibold text-slate-900">
                {group.title}
              </h2>
              <p className="mt-0.5 max-w-2xl text-sm text-slate-600">{group.description}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {panels.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className={`group ${tsb.dataPanel} p-3 transition hover:border-emerald-300/80 hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)]`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg" aria-hidden>
                        {p.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="inline-block rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                          {p.badge}
                        </span>
                        <h3 className="mt-1 text-sm font-semibold text-slate-900 group-hover:text-emerald-800">
                          {p.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-600">{p.subtitle}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-right text-[11px] font-semibold text-emerald-800 group-hover:underline">
                      Panele git →
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        <p className="text-center text-[11px] text-slate-500">
          <Link href="/finans-sigorta" className="font-medium text-emerald-800 hover:underline">
            Finans &amp; Sigorta metrikleri
          </Link>
          {" · "}
          Kaynak ve yöntem için{" "}
          <a
            href="https://www.tsb.org.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-emerald-800 underline decoration-emerald-600/40"
          >
            tsb.org.tr
          </a>
        </p>
      </main>
    </div>
  );
}
