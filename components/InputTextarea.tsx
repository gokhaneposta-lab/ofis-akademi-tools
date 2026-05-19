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
      className={`w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200/80 transition ${className}`}
      style={{ minHeight }}
    />
  );
}
