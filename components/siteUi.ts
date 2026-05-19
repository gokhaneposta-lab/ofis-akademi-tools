/** Site geneli — araçlar, pazarlama sayfaları, hub (TSB `tsbDashboardUi` ile uyumlu ton). */
export const site = {
  pageBg: "min-h-screen bg-[#f4f6f9]",
  pageHeader: "border-b border-slate-200/90 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]",
  pageHeaderInner: "mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8",
  pageHeaderWide: "mx-auto max-w-[88rem] px-4 py-5 sm:px-6 lg:px-8",
  backLink:
    "mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-emerald-800",
  pageTitle: "text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.65rem]",
  pageLead: "mt-2 max-w-3xl text-sm leading-relaxed text-slate-600",
  main: "mx-auto max-w-5xl px-4 py-8 sm:px-6",
  mainWide: "mx-auto max-w-[88rem] px-4 py-8 sm:px-6 lg:px-8",

  toolPageBg: "min-h-screen bg-[#f4f6f9]",
  toolHeader:
    "sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-md print:hidden",
  toolHeaderInner: "mx-auto flex max-w-4xl items-center gap-3 px-4 py-2.5 sm:px-6",
  toolTitle: "truncate text-base font-semibold text-slate-900",
  toolDesc: "truncate text-xs text-slate-500",
  toolMain: "mx-auto max-w-4xl space-y-6 px-4 pb-12 pt-5 sm:px-6",
  toolWorkbench:
    "rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:p-5",
  toolPrivacy:
    "rounded-md border border-slate-200/60 bg-slate-50/80 px-3 py-2 text-[11px] leading-relaxed text-slate-500",
  toolExampleBox:
    "rounded-md border border-slate-200/70 bg-slate-50/90 px-3 py-2.5 text-xs leading-relaxed text-slate-600",
  toolExampleLabel: "mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500",

  card:
    "rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition hover:border-slate-300/90 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]",
  cardTitle: "text-sm font-semibold text-slate-900",
  cardDesc: "mt-1.5 text-xs leading-relaxed text-slate-600",

  btnPrimary:
    "inline-flex w-full items-center justify-center rounded-lg bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-45",
  btnSecondary:
    "inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50",

  input:
    "w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/80",
  select:
    "h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300",

  tableShell:
    "overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
} as const;

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
