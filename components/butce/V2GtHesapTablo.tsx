"use client";

import { useMemo, useState } from "react";
import {
  V2_HESAP_AGAC,
  dugumEtiket,
  type V2HesapDugum,
} from "@/lib/butce/v2/v2GtHesapAgac";

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

type Props = {
  ozetDeger: (satir: number) => number;
  donemEtiket: string;
};

function flatten(
  nodes: V2HesapDugum[],
  expanded: Set<string>,
  depth: number,
): Array<{ node: V2HesapDugum; depth: number }> {
  const out: Array<{ node: V2HesapDugum; depth: number }> = [];
  for (const node of nodes) {
    out.push({ node, depth });
    if (node.children?.length && expanded.has(node.id)) {
      out.push(...flatten(node.children, expanded, depth + 1));
    }
  }
  return out;
}

export default function V2GtHesapTablo({ ozetDeger, donemEtiket }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const rows = useMemo(() => flatten(V2_HESAP_AGAC, expanded, 0), [expanded]);

  function toggle(id: string) {
    setExpanded((once) => {
      const next = new Set(once);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <table className="min-w-full text-sm">
      <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
        <tr>
          <th className="px-2 py-1 text-left">Hesap</th>
          <th className="px-2 py-1 text-left">Kalem</th>
          <th className="px-2 py-1 text-right">{donemEtiket}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ node, depth }) => {
          const hasKids = Boolean(node.children?.length);
          const open = expanded.has(node.id);
          return (
            <tr
              key={node.id}
              className={`border-b border-slate-100 ${node.kalin ? "font-semibold" : ""} ${
                node.vurgu ? "bg-emerald-50/50" : ""
              }`}
            >
              <td className="px-2 py-1 font-mono text-xs text-slate-600">
                <span className="inline-flex items-center gap-1" style={{ paddingLeft: depth * 14 }}>
                  {hasKids ? (
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => toggle(node.id)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {open ? "−" : "+"}
                    </button>
                  ) : (
                    <span className="inline-block w-5" />
                  )}
                  {node.hesap ?? ""}
                </span>
              </td>
              <td className="px-2 py-1">{dugumEtiket(node)}</td>
              <td className="px-2 py-1 text-right tabular-nums">{tl(ozetDeger(node.satir))}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
