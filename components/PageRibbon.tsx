"use client";

import { THEME } from "@/lib/theme";

type PageRibbonProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export default function PageRibbon({ title, description, children }: PageRibbonProps) {
  return (
    <div
      className="px-4 py-3 text-white"
      style={{ background: THEME.ribbon, fontFamily: THEME.font }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-white/90 mt-0.5 max-w-2xl">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
