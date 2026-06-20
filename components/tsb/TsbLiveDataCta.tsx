import Link from "next/link";
import type { TsbMetricDashboardLink } from "@/lib/tsbMetricDashboardLinks";

type Props = {
  link: TsbMetricDashboardLink;
};

/** Finans-sigorta KPI sayfalarında TSB canlı veri CTA — iç link + SEO. */
export default function TsbLiveDataCta({ link }: Props) {
  return (
    <section
      className="mb-8 rounded-xl border-2 border-sky-200/90 bg-gradient-to-br from-sky-50/80 to-white p-4 shadow-sm sm:p-5"
      aria-labelledby="tsb-live-data-cta-heading"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-900">
            Canlı TSB verisi
          </span>
          <h2 id="tsb-live-data-cta-heading" className="mt-2 text-sm font-bold text-gray-900 sm:text-base">
            {link.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-[13px]">{link.description}</p>
        </div>
        <Link
          href={link.href}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-800 sm:text-sm"
        >
          Dashboard&apos;a git
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <p className="mt-3 text-[11px] text-gray-500">
        Tüm paneller{" "}
        <Link href="/sigorta/tsb" className="font-medium text-emerald-800 underline decoration-emerald-300">
          TSB sektör verileri hub
        </Link>
        {" "}sayfasında listelenir.
      </p>
    </section>
  );
}
