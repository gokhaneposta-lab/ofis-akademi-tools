import React from "react";

const ACCENT = "#217346";

type PrimaryButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function PrimaryButton({
  children,
  disabled = false,
  onClick,
  className = "",
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full overflow-hidden rounded-xl py-4 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-900/30 hover:brightness-110 active:scale-[0.97] active:shadow-md disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed ${className}`}
      style={{ background: ACCENT, minHeight: "3rem" }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
