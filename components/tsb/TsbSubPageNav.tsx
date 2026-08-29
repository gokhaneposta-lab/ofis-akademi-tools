"use client";

import { cn } from "@/components/tsb/tsbDashboardUi";

export type TsbSubPageItem<T extends string> = {
  id: T;
  label: string;
  /** Kısa açıklama — alt sayfa olduğunu pekiştirir */
  hint?: string;
};

/**
 * Filtre pill’lerinden ayrı: panel içi “alt sayfa” geçişi.
 * Sticky üst sekme / HD–H-E / daraltma ile karışmasın diye underline tab dili.
 */
export function TsbSubPageNav<T extends string>({
  label = "Alt sayfa",
  items,
  value,
  onChange,
  className,
}: {
  label?: string;
  items: readonly TsbSubPageItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "rounded-xl border border-slate-200/90 bg-white px-3 pt-2.5 shadow-sm ring-1 ring-slate-900/[0.02] sm:px-4",
        className,
      )}
      aria-label={label}
    >
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <div className="-mx-1 flex flex-wrap gap-0 border-b border-slate-200" role="tablist">
        {items.map((item) => {
          const active = item.id === value;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative min-h-[2.75rem] min-w-[7.5rem] flex-1 px-3 py-2 text-left transition sm:flex-none sm:min-w-[9rem] sm:px-4",
                active ? "text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              <span className={cn("block text-[0.95rem] sm:text-base", active ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
              {item.hint ? (
                <span
                  className={cn(
                    "mt-0.5 hidden text-[11px] leading-snug sm:block",
                    active ? "text-slate-600" : "text-slate-400",
                  )}
                >
                  {item.hint}
                </span>
              ) : null}
              <span
                className={cn(
                  "absolute inset-x-3 bottom-0 h-[3px] rounded-full transition",
                  active ? "bg-emerald-600" : "bg-transparent",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
