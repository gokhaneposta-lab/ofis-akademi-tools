import React, { useState, useCallback, forwardRef } from "react";

const ACCENT = "#217346";
const ACCENT_LIGHT = "#e6f4ec";

type ResultCardProps = {
  visible: boolean;
  count: number;
  successMessage?: string;
  countLabel?: string;
  onCopy: () => void;
  children: React.ReactNode;
  className?: string;
};

const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  function ResultCard(
    {
      visible,
      count,
      successMessage = "Başarıyla ayrıldı",
      countLabel = "kişi işlendi",
      onCopy,
      children,
      className = "",
    },
    ref,
  ) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [onCopy]);

    return (
      <div
        ref={ref}
        className={`overflow-hidden rounded-b-2xl border border-t-0 transition-all duration-500 ease-out ${
          visible
            ? "max-h-[3000px] opacity-100"
            : "max-h-0 opacity-0 border-transparent"
        } ${className}`}
        style={{
          borderColor: visible ? "#a7f3d0" : "transparent",
          background: visible ? ACCENT_LIGHT : "transparent",
        }}
      >
        {/* Success header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 sm:px-5"
          style={{ borderBottom: "1px solid #bbf7d0" }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-2 text-xs font-bold" style={{ color: ACCENT }}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMessage}
            </span>
            <span className="pl-6 text-[11px] text-emerald-600/70">
              {count} {countLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-300 active:scale-95 ${
              copied
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20 scale-105"
                : "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200 hover:bg-emerald-50 hover:ring-emerald-300 hover:shadow-md"
            }`}
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Kopyalandı
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Kopyala
              </>
            )}
          </button>
        </div>

        {/* Result rows */}
        <div className="max-h-[50vh] overflow-y-auto">
          {children}
        </div>
      </div>
    );
  },
);

export default ResultCard;

/* ── Helper: single row with numbered badge + stagger animation ── */

type ResultRowProps = {
  index: number;
  total: number;
  animate: boolean;
  children: React.ReactNode;
};

export function ResultRow({ index, total, animate, children }: ResultRowProps) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-4 sm:px-5"
      style={{
        borderBottom: index < total - 1 ? "1px solid rgba(167,243,208,0.5)" : "none",
        animation: animate ? `staggerFadeIn 0.35s ease-out ${index * 0.04}s both` : "none",
      }}
    >
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-emerald-700"
        style={{ background: "#c6f6d5" }}
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/* ── Helper: Ad / Soyad field pair ── */

type FieldPairProps = {
  label: string;
  value: string;
  variant?: "default" | "accent";
};

export function ResultField({ label, value, variant = "default" }: FieldPairProps) {
  const isAccent = variant === "accent";
  return (
    <p
      className={`flex items-baseline gap-2.5 text-[15px] ${
        isAccent ? "font-bold" : "text-gray-900"
      }`}
      style={isAccent ? { color: ACCENT } : undefined}
    >
      <span
        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${
          isAccent ? "text-emerald-700" : "bg-gray-100 text-gray-500"
        }`}
        style={isAccent ? { background: "#d1fae5" } : undefined}
      >
        {label}
      </span>
      <span className={`truncate ${isAccent ? "" : "font-medium"}`}>{value || "—"}</span>
    </p>
  );
}
