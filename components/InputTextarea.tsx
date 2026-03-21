import React from "react";

type InputTextareaProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: string;
  className?: string;
};

export default function InputTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 7,
  minHeight = "12rem",
  className = "",
}: InputTextareaProps) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`w-full resize-none rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-[15px] leading-relaxed text-gray-900 placeholder:text-gray-400/60 placeholder:leading-relaxed focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.10)] focus:outline-none transition-all duration-200 ${className}`}
      style={{ minHeight }}
    />
  );
}
