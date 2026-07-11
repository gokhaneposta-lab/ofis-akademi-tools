import Link from "next/link";
import type { TsbMetricDashboardLink } from "@/lib/tsbMetricDashboardLinks";
import { tsb } from "@/components/tsb/tsbDashboardUi";

type Props = {
  link: TsbMetricDashboardLink;
};

/** Finans-sigorta KPI sayfalarında TSB canlı veri CTA — iç link + SEO. */
export default function TsbLiveDataCta({ link }: Props) {
  return (
    <section
      className="mb-8 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white p-4 shadow-sm ring-1 ring-emerald-900/[0.04] sm:p-5"
      aria-labelledby="tsb-live-data-cta-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className={tsb.pageBadge}>Canlı TSB verisi</span>
          <h2 id="tsb-live-data-cta-heading" className="mt-2 text-sm font-bold text-slate-900 sm:text-base">
            {link.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-[13px]">{link.description}</p>
        </div>
        <Link
          href={link.href}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-emerald-600 bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:text-sm"
        >
          Dashboard&apos;a git
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Tüm paneller{" "}
        <Link href="/sigorta/tsb" className="font-medium text-emerald-800 underline decoration-emerald-300">
          TSB sektör verileri hub
        </Link>
        {" "}sayfasında listelenir.
      </p>
    </section>
  );
}
