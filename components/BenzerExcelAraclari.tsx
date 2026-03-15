"use client";

import Link from "next/link";
import { EXCEL_TOOLS } from "@/lib/excel-tools";
import { THEME } from "@/lib/theme";

type Props = {
  /** Mevcut sayfa href'i; listeden çıkarılır. Örn: /excel-araclari/tekrarlananlari-kaldir */
  currentHref: string;
};

export default function BenzerExcelAraclari({ currentHref }: Props) {
  const normalized = currentHref.replace(/\/$/, "");
  const list = EXCEL_TOOLS.filter((t) => t.href.replace(/\/$/, "") !== normalized);
  if (list.length === 0) return null;

  return (
    <section
      className="rounded-lg border bg-white p-4"
      style={{ borderColor: THEME.gridLine }}
      aria-label="Benzer Excel araçları"
    >
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Benzer Excel Araçları</h2>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {list.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="text-gray-700 underline decoration-gray-300 underline-offset-2 hover:decoration-gray-600 hover:text-gray-900"
            >
              {tool.name}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-gray-500">
        <Link href="/excel-araclari" className="underline hover:text-gray-700">
          Tüm Excel araçlarına git →
        </Link>
      </p>
    </section>
  );
}
