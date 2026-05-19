import Link from "next/link";
import {
  TSB_DASHBOARD_GROUPS,
  tsbDashboardPanelByHref,
  tsbDashboardPanelsForGroup,
} from "@/lib/tsbDashboardPanels";
import { cn, tsb } from "@/components/tsb/tsbDashboardUi";

type Props = {
  /** Örn. `/sigorta/kanal-dagilim` — bu sayfa pill listesinden çıkarılır */
  currentHref: string;
};

/**
 * Formül kütüphanesindeki "İlgili formüller" bloğuyla uyumlu iç linkler:
 * SEO (iç bağlantı ağı) ve kullanıcıların diğer TSB panellerini keşfi.
 */
export default function TsbRelatedDashboards({ currentHref }: Props) {
  const current = tsbDashboardPanelByHref(currentHref);
  const otherGroupId = current?.group === "finansal" ? "prim" : "finansal";
  const sameGroupPanels = current
    ? tsbDashboardPanelsForGroup(current.group).filter((p) => p.href !== currentHref)
    : [];
  const otherGroupPanels = tsbDashboardPanelsForGroup(otherGroupId);
  const otherGroupMeta = TSB_DASHBOARD_GROUPS.find((g) => g.id === otherGroupId);

  const intro =
    current?.group === "finansal"
      ? "Aynı çeyreklik finansal veri setinden başka panel yok; aşağıda aylık prim panellerine geçebilirsiniz."
      : current?.group === "prim"
        ? "Diğer aylık prim panelleri ve çeyreklik finansal karşılaştırma."
        : "TSB gösterge panelleri arasında gezinmek için aşağıdaki bağlantıları kullanın.";

  const pillCls =
    "rounded-md border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-900";

  return (
    <section className="mt-10 border-t border-slate-200/90 pt-8" aria-labelledby="tsb-related-dashboards-heading">
      <h2
        id="tsb-related-dashboards-heading"
        className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800"
      >
        <span className="h-0.5 w-4 shrink-0 rounded-full bg-emerald-500" aria-hidden />
        İlgili dashboardlar
      </h2>
      <p className={cn(tsb.caption, "mb-4 max-w-2xl")}>{intro}</p>

      {sameGroupPanels.length > 0 && (
        <div className="mb-5">
          <p className={cn(tsb.filterSectionLabel, "mb-2")}>
            {current?.group === "finansal" ? "Finansal" : "Prim ve üretim"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sameGroupPanels.map((p) => (
              <Link key={p.href} href={p.href} className={pillCls}>
                <span className="mr-1" aria-hidden>
                  {p.icon}
                </span>
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {otherGroupMeta && otherGroupPanels.length > 0 && (
        <div>
          <p className={cn(tsb.filterSectionLabel, "mb-2")}>{otherGroupMeta.title}</p>
          <div className="flex flex-wrap gap-1.5">
            {otherGroupPanels.map((p) => (
              <Link key={p.href} href={p.href} className={pillCls}>
                <span className="mr-1" aria-hidden>
                  {p.icon}
                </span>
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/sigorta/tsb"
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-900"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
          </svg>
          TSB dashboard grubu
        </Link>
        <Link
          href="/finans-sigorta"
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-slate-50"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Finans &amp; Sigorta metrikleri
        </Link>
      </div>
    </section>
  );
}
