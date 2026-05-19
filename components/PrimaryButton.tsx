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
      className={`relative w-full overflow-hidden rounded-lg py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
      style={{ background: ACCENT, minHeight: "2.75rem" }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}
