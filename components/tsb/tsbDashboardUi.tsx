import Link from "next/link";
import type { ReactNode, SelectHTMLAttributes } from "react";
import TsbJsonLd from "@/components/tsb/TsbJsonLd";
import {
  TSB_DASHBOARD_GROUPS,
  TSB_DASHBOARD_PANELS,
  tsbDashboardPanelByHref,
  type TsbDashboardGroupId,
} from "@/lib/tsbDashboardPanels";
import { tsbPanelHelpForHref } from "@/lib/tsbPanelHelpContent";
import { TSB_SEO, type TsbSeoPageId } from "@/lib/tsbSeo";

/** TSB dashboard — profesyonel finansal analiz platformu görünümü (paylaşılan token'lar). */
export const tsb = {
  pageBg: "min-h-screen bg-[#f4f6f9]",
  pageHeader: "border-b border-slate-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]",
  pageHeaderInner: "mx-auto max-w-[88rem] px-4 py-3.5 sm:px-6 lg:px-8",
  backLink:
    "mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-emerald-800",
  pageTitle: "text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.65rem]",
  pageBadge:
    "rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white",
  pageLead: "mt-1.5 max-w-3xl text-sm leading-snug text-slate-600",
  sourceNote:
    "mt-2 max-w-3xl rounded-md border border-slate-200/70 bg-slate-50/90 px-2.5 py-1.5 text-[11px] leading-relaxed text-slate-600",
  main: "mx-auto max-w-[88rem] space-y-5 px-4 py-5 sm:px-6 lg:px-8",
  dashboardStack: "space-y-4",

  stickyNavWrap:
    "sticky top-0 z-30 -mx-4 mb-1 border-b border-slate-200/90 bg-white/98 px-3 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)] backdrop-blur-md sm:-mx-6 sm:px-5 lg:-mx-8 lg:px-7",
  stickyNavInner: "flex flex-col gap-1.5",
  stickyNavTopRow: "flex flex-wrap items-center justify-between gap-2",
  stickyNavGroupLabel: "text-[10px] font-semibold uppercase tracking-wider text-slate-500",
  stickyNavLinks: "flex flex-wrap gap-0.5",
  stickyNavLink:
    "rounded-md border border-transparent px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
  stickyNavLinkActive: "border-slate-400 bg-slate-100 font-semibold text-slate-900 shadow-sm",
  stickyNavHubBtn:
    "inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900",
  stickyNavAllLabel: "text-[10px] font-medium text-slate-500",

  filterBar:
    "rounded-lg border border-slate-200/80 bg-slate-50/60 px-2.5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
  filterSectionLabel: "mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500",
  filterHint: "mt-1.5 text-[11px] leading-snug text-slate-600",
  filterGrid: "grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",

  panelHelp:
    "rounded-lg border border-slate-200/80 bg-white text-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)] [&_summary::-webkit-details-marker]:hidden",
  panelHelpSummary:
    "cursor-pointer list-none px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50/80",
  panelHelpBody: "border-t border-slate-100 px-3 py-2 text-xs leading-relaxed text-slate-600",
  panelHelpList: "list-disc space-y-1 pl-4",

  insightsWrap: "rounded-lg border border-amber-200/90 bg-amber-50/70 px-3 py-2.5 shadow-sm",
  insightsTitle: "text-[10px] font-semibold uppercase tracking-wider text-amber-900/80",
  insightsList: "mt-1.5 space-y-1 text-xs leading-snug text-amber-950",

  veriDurumuWrap: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
  veriDurumuItem:
    "rounded-lg border border-slate-200/75 bg-slate-50/50 px-2.5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
  veriDurumuLabel: "text-[10px] font-semibold uppercase tracking-wider text-slate-500",
  veriDurumuValue:
    "mt-0.5 text-base font-bold tabular-nums tracking-tight text-emerald-700 sm:text-[1.05rem]",
  veriDurumuValueMuted: "font-semibold text-slate-400",
  veriDurumuHint: "mt-0.5 text-[10px] leading-snug text-slate-500",

  sektorOzetiWrap: "rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:p-4",
  sektorOzetiBaslikWrap: "mb-3",
  sektorOzetiBaslikRow: "flex items-center justify-between gap-2",
  sektorOzetiBaslik: "text-base font-semibold text-slate-900",
  sektorOzetiMetodolojiWrap:
    "relative shrink-0 [&_summary::-webkit-details-marker]:hidden [&[open]_summary]:border-sky-400 [&[open]_summary]:bg-sky-100/90 [&[open]_summary]:text-sky-950",
  sektorOzetiMetodolojiBtn:
    "flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-sky-200/90 bg-sky-50/80 px-2 py-1 text-[11px] font-semibold text-sky-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-100/90 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:ring-offset-1",
  sektorOzetiMetodolojiIcon:
    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-200/80 text-[10px] font-bold leading-none text-sky-900",
  sektorOzetiMetodolojiPanel:
    "absolute right-0 top-full z-20 mt-1.5 w-[min(20rem,calc(100vw-2rem))] rounded-lg border border-sky-200/90 bg-white p-3 text-xs leading-relaxed text-slate-600 shadow-[0_4px_16px_rgba(14,116,144,0.12)]",
  sektorOzetiMetodolojiPanelBaslik:
    "text-[10px] font-semibold uppercase tracking-wide text-sky-800/90",
  sektorOzetiMetodolojiPanelTitle: "mt-0.5 font-semibold text-slate-800",
  sektorOzetiMetodolojiPanelDetay: "mt-1.5 text-[11px] leading-snug text-slate-500",
  sektorOzetiAltBaslik: "mt-0.5 text-sm text-slate-600",
  sektorOzetiDonemNotu: "mt-1 text-[11px] text-slate-500",
  sektorOzetiGrid: "grid gap-2 sm:grid-cols-2 xl:grid-cols-4 [&>article]:min-w-0",
  sektorOzetiKart: "min-w-0 rounded-lg border border-slate-200/75 bg-slate-50/40 px-2.5 py-2",
  sektorOzetiKartBaslik: "mb-2 text-[11px] font-semibold leading-snug text-slate-800",
  sektorOzetiBos: "text-[11px] text-slate-500",
  sektorOzetiListe: "space-y-1",
  sektorOzetiSatir:
    "grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-1.5 text-xs",
  sektorOzetiAdLink:
    "min-w-0 truncate text-slate-800 hover:text-slate-950 hover:underline decoration-slate-300 underline-offset-2",
  sektorOzetiSira: "w-5 shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-500",
  sektorOzetiDeger:
    "shrink-0 justify-self-end whitespace-nowrap rounded px-1 py-0.5 text-[11px] font-semibold tabular-nums",
  filterField: "block min-w-0",
  filterLabel: "mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500",
  filterMicroHint: "mt-0.5 text-[10px] leading-snug text-slate-500",
  select:
    "h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300",
  selectWide:
    "h-8 w-full max-w-xl rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300",
  btnGroup: "flex flex-wrap gap-1",
  btnToggle:
    "rounded-md border px-2.5 py-1 text-xs font-semibold transition focus:outline-none focus:ring-1 focus:ring-slate-300",
  btnToggleOn: "border-slate-800 bg-slate-800 text-white shadow-sm",
  btnToggleOff: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  btnSegmentOn: "border-emerald-800 bg-emerald-800 text-white shadow-sm",
  btnTabOn: "border-emerald-700 bg-emerald-700 text-white shadow-sm",

  caption: "text-[11px] leading-relaxed text-slate-500",
  dataPanel:
    "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)]",
  dataPanelHeader: "border-b border-slate-100 px-3 py-2 sm:px-4",
  dataPanelTitle: "text-sm font-semibold text-slate-900",
  dataPanelBody: "p-3 sm:p-4",
  chartPanel:
    "overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:p-4",

  tableShell:
    "overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.06)]",
  table: "w-full min-w-[640px] border-collapse text-left text-xs text-slate-800",
  tableDense:
    "w-full min-w-[800px] table-fixed border-collapse text-left text-xs text-slate-800",
  thead: "border-b border-slate-200 bg-slate-50/95",
  th: "px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600",
  thCenter:
    "px-2.5 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-600",
  thRight:
    "px-2.5 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-600",
  thSticky:
    "sticky left-0 z-10 border-r border-slate-100 bg-slate-50/95 px-2.5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-600",
  tbodyRow:
    "group border-b border-slate-100/90 transition-colors even:bg-slate-50/40 hover:bg-emerald-50/35",
  tbodyRowDense:
    "group h-10 border-b border-slate-100/90 transition-colors even:bg-slate-50/35 hover:bg-emerald-50/40",
  td: "px-2.5 py-1.5 tabular-nums text-slate-800",
  tdSticky:
    "sticky left-0 z-10 border-r border-slate-100/80 bg-white px-2.5 py-1.5 even:bg-slate-50/40 group-hover:bg-emerald-50/35",
  tfoot: "border-t-2 border-emerald-700/80 bg-emerald-50/50 font-semibold text-slate-900",

  alertError: "rounded-lg border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-900",
  alertWarn: "rounded-lg border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950",
  alertLoading:
    "rounded-lg border border-slate-200/80 bg-white px-4 py-10 text-center text-sm text-slate-600 shadow-sm",
} as const;

/** Grafik seri renkleri (delta anlamı taşımaz). */
export const tsbChart = {
  sirketBrut: "#059669",
  sirketNet: "#2563eb",
  sektor: "#64748b",
} as const;

/** Kötü / iyi delta (metrik bağlamına göre kullanın). */
export const tsbDelta = {
  iyi: "text-emerald-800 font-semibold bg-emerald-50",
  kotu: "text-red-700 font-semibold bg-red-50",
  notr: "text-amber-700 font-semibold bg-amber-50",
  yok: "text-slate-400",
} as const;

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** H/P vb.: artış kötü → kırmızı, düşüş iyi → yeşil. */
export function tsbHpDeltaRenk(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return tsbDelta.yok;
  if (v < 0) return tsbDelta.iyi;
  if (v > 0) return tsbDelta.kotu;
  return tsbDelta.notr;
}

export function tsbDeltaRenk(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return tsbDelta.yok;
  if (v > 0) return tsbDelta.iyi;
  if (v < 0) return tsbDelta.kotu;
  return tsbDelta.notr;
}

/** Sıra Δ sütunu: iyileşme yeşil, aynı sarı, kötüleşme kırmızı. */
export function tsbSiraDeltaRenk(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "text-slate-500";
  if (v < 0) return tsbDelta.iyi;
  if (v > 0) return tsbDelta.kotu;
  return tsbDelta.notr;
}

/**
 * Bu yıl sıra hücresi (kanal-prim): düşük sıra daha iyi.
 * İyileşme (2→1) yeşil, aynı sırada sarı, düşüş kırmızı.
 */
export function tsbSiraIyilestirmeRenk(onceki: number, bu: number): string {
  if (onceki <= 0 || bu <= 0) return "text-slate-700 font-medium tabular-nums";
  if (bu < onceki) return `${tsbDelta.iyi} tabular-nums`;
  if (bu > onceki) return `${tsbDelta.kotu} tabular-nums`;
  return `${tsbDelta.notr} tabular-nums`;
}

const degisimPf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

/** Önceki yıla göre yüzde değişim metni (+ / − işaretli). */
export function tsbFormatDegisimYuzde(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${degisimPf.format(v)}%`;
}

/** Puan farkı metni (+ / − işaretli). */
export function tsbFormatPp(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${degisimPf.format(v)} pp`;
}

type TsbPageLayoutProps = {
  title: string;
  description: ReactNode;
  sourceNote?: ReactNode;
  currentHref: string;
  /** Görünmez SEO (metadata ayrı; JSON-LD buradan) */
  seoPageId: TsbSeoPageId;
  helpItems?: readonly string[];
  children: ReactNode;
};

export function TsbPageLayout({
  title,
  description,
  sourceNote,
  currentHref,
  seoPageId,
  helpItems,
  children,
}: TsbPageLayoutProps) {
  const help = helpItems ?? tsbPanelHelpForHref(currentHref);
  const seo = TSB_SEO[seoPageId];

  return (
    <>
      <TsbJsonLd page={seo} variant="panel" />
      <div className={tsb.pageBg}>
      <header className={tsb.pageHeader}>
        <div className={tsb.pageHeaderInner}>
          <Link href="/sigorta/tsb" className={tsb.backLink}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Sektör verileri (TSB)
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className={tsb.pageTitle}>{title}</h1>
            <span className={tsb.pageBadge}>TSB</span>
          </div>
          <p className={tsb.pageLead}>{description}</p>
          {sourceNote ? <aside className={tsb.sourceNote}>{sourceNote}</aside> : null}
        </div>
      </header>
      <main className={tsb.main}>
        <TsbDashboardStickyNav currentHref={currentHref} />
        {help.length > 0 ? <TsbPanelHelp items={help} /> : null}
        {children}
      </main>
    </div>
    </>
  );
}

export function TsbPanelHelp({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <details className={tsb.panelHelp}>
      <summary className={tsb.panelHelpSummary}>Bu panel nasıl okunur?</summary>
      <div className={tsb.panelHelpBody}>
        <ul className={tsb.panelHelpList}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export type TsbInsightItem = {
  text: ReactNode;
};

/** Boşken render edilmez. */
export function TsbInsights({ items }: { items: readonly TsbInsightItem[] }) {
  if (items.length === 0) return null;
  return (
    <aside className={tsb.insightsWrap} aria-label="Öne çıkan bulgular">
      <p className={tsb.insightsTitle}>Öne çıkan</p>
      <ul className={tsb.insightsList}>
        {items.map((item, i) => (
          <li key={i}>{item.text}</li>
        ))}
      </ul>
    </aside>
  );
}

export function TsbDashboardStickyNav({ currentHref }: { currentHref: string }) {
  const groupId: TsbDashboardGroupId = tsbDashboardPanelByHref(currentHref)?.group ?? "prim";
  const group = TSB_DASHBOARD_GROUPS.find((g) => g.id === groupId);
  const panels = TSB_DASHBOARD_PANELS.filter((p) => p.group === groupId);
  const digerGruplar = TSB_DASHBOARD_GROUPS.filter((g) => g.id !== groupId);

  return (
    <nav className={tsb.stickyNavWrap} aria-label="TSB panel geçişi">
      <div className={tsb.stickyNavInner}>
        <div className={tsb.stickyNavTopRow}>
          <p className={tsb.stickyNavGroupLabel}>{group?.title ?? "Paneller"}</p>
          <Link href="/sigorta/tsb" className={tsb.stickyNavHubBtn}>
            ← Tüm paneller
          </Link>
        </div>
        <div className={tsb.stickyNavLinks}>
          {panels.map((p) => {
            const active = p.href === currentHref;
            return (
              <Link
                key={p.href}
                href={p.href}
                aria-current={active ? "page" : undefined}
                className={cn(tsb.stickyNavLink, active && tsb.stickyNavLinkActive)}
              >
                {p.title}
              </Link>
            );
          })}
        </div>
        {digerGruplar.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-slate-100 pt-1.5">
            <span className={tsb.stickyNavAllLabel}>Diğer:</span>
            {digerGruplar.flatMap((g) =>
              TSB_DASHBOARD_PANELS.filter((p) => p.group === g.id).map((p) => (
                <Link key={p.href} href={p.href} className={tsb.stickyNavLink}>
                  {p.title}
                </Link>
              )),
            )}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

export function TsbFilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(tsb.filterBar, className)}>{children}</div>;
}

export function TsbFilterGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(tsb.filterGrid, className)}>{children}</div>;
}

export function TsbFilterField({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn(tsb.filterField, className)}>
      <span className={tsb.filterLabel}>{label}</span>
      {children}
      {hint ? <span className={tsb.filterMicroHint}>{hint}</span> : null}
    </label>
  );
}

export function TsbSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, ...rest } = props;
  return <select {...rest} className={cn(tsb.select, className)} />;
}

export function TsbToggleButton({
  pressed,
  onClick,
  children,
  variant = "default",
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
  variant?: "default" | "segment" | "tab";
}) {
  const onCls =
    variant === "segment" ? tsb.btnSegmentOn : variant === "tab" ? tsb.btnTabOn : tsb.btnToggleOn;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(tsb.btnToggle, pressed ? onCls : tsb.btnToggleOff)}
    >
      {children}
    </button>
  );
}

export function TsbDataPanel({
  title,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn(tsb.dataPanel, className)}>
      {title ? (
        <header className={tsb.dataPanelHeader}>
          <h2 className={tsb.dataPanelTitle}>{title}</h2>
        </header>
      ) : null}
      <div className={cn(tsb.dataPanelBody, bodyClassName)}>{children}</div>
    </section>
  );
}

export function TsbTableShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(tsb.tableShell, className)}>{children}</div>;
}

export function TsbLoading({ message = "Veri yükleniyor…" }: { message?: string }) {
  return <p className={tsb.alertLoading}>{message}</p>;
}

export function TsbError({ message }: { message: string }) {
  return (
    <p className={tsb.alertError} role="alert">
      {message}
    </p>
  );
}
