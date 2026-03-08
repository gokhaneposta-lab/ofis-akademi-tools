import React from "react";

type CopyButtonProps = {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  copied?: boolean;
  label?: string;
  copiedLabel?: string;
};

export default function CopyButton({
  onClick,
  disabled = false,
  copied = false,
  label = "Tüm Sonuçları Kopyala",
  copiedLabel = "Kopyalandı",
}: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-100 border border-slate-700 transition hover:border-emerald-400 hover:text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed ${
        copied ? "!bg-emerald-700 !text-slate-50" : ""
      }`}
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {copiedLabel}
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect
              x="9"
              y="9"
              width="13"
              height="13"
              rx="2"
              strokeWidth={2}
              stroke="currentColor"
            />
            <rect
              x="3"
              y="3"
              width="13"
              height="13"
              rx="2"
              strokeWidth={2}
              stroke="currentColor"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

