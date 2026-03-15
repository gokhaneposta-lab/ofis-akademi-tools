"use client";

import React from "react";
import { THEME } from "@/lib/theme";

type Props = {
  steps: string[];
  excelAlternatif?: React.ReactNode;
};

export default function NasilKullanilir({ steps, excelAlternatif }: Props) {
  return (
    <div className="rounded-lg border bg-white p-4" style={{ borderColor: THEME.gridLine }}>
      <h2 className="text-sm font-semibold text-gray-800 mb-2">Nasıl kullanılır</h2>
      <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700 mb-4">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      {excelAlternatif != null && (
        <details className="group">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            Excel&apos;de formülle / kendim yapmak istersem
          </summary>
          <div className="mt-2 pl-4 text-sm text-gray-600 border-l-2 pl-3" style={{ borderColor: THEME.ribbon }}>
            {excelAlternatif}
          </div>
        </details>
      )}
    </div>
  );
}
