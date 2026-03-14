"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";
import { parseNumbers } from "@/lib/istatistik";

type Bin = { label: string; min: number; max: number; count: number };

function buildBins(arr: number[], binWidth: number): Bin[] {
  if (arr.length === 0 || binWidth <= 0) return [];
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const bins: Bin[] = [];
  let start = Math.floor(min / binWidth) * binWidth;
  if (start > min) start -= binWidth;
  let current = start;
  while (current < max || bins.length === 0) {
    const next = current + binWidth;
    const count = arr.filter((v) => v >= current && (next > max ? v <= next : v < next)).length;
    bins.push({
      label: `${current.toLocaleString("tr-TR")} – ${next.toLocaleString("tr-TR")}`,
      min: current,
      max: next,
      count,
    });
    current = next;
    if (current > max && bins.length >= 1) break;
  }
  return bins;
}

export default function FrekansDagilimiPage() {
  const [input, setInput] = useState("");
  const [binWidthStr, setBinWidthStr] = useState("10");
  const [bins, setBins] = useState<Bin[]>([]);
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const arr = parseNumbers(input);
    const bw = parseFloat(binWidthStr.replace(",", "."));
    if (arr.length === 0 || !Number.isFinite(bw) || bw <= 0) {
      setBins([]);
      return;
    }
    setBins(buildBins(arr, bw));
    setCopied(false);
  }

  function copyText(): string {
    if (!bins.length) return "";
    const header = "Aralık\tFrekans";
    const lines = bins.map((b) => `${b.label}\t${b.count}`);
    return [header, ...lines].join("\n");
  }

  async function handleCopy() {
    const t = copyText();
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Frekans Dağılımı"
        description="Sayıları sınıf aralıklarına bölerek frekans tablosu oluşturun. Histogram için veri hazırlığı."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sayılar (Excel'den yapıştırın)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="5, 12, 18, 22, 25, 33, 38, 42, 55"
            rows={6}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-600">Sınıf genişliği (aralık):</label>
          <input
            type="text"
            value={binWidthStr}
            onChange={(e) => setBinWidthStr(e.target.value)}
            className="w-24 rounded border px-2 py-1.5 text-sm"
            style={{ borderColor: THEME.gridLine }}
          />
          <span className="text-xs text-gray-500">Örn. 10 → 0–10, 10–20, 20–30 ...</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleHesapla}
            className="inline-flex min-w-[140px] justify-center rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Hesapla
          </button>
          <CopyButton onClick={handleCopy} disabled={!bins.length} copied={copied} label="Tabloyu Kopyala" copiedLabel="Kopyalandı" />
        </div>
        {bins.length > 0 && (
          <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                  <th className="border-b border-r px-3 py-2 text-left font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Aralık</th>
                  <th className="border-b px-3 py-2 text-right font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Frekans</th>
                </tr>
              </thead>
              <tbody>
                {bins.map((b, i) => (
                  <tr key={i} className="border-b last:border-b-0" style={{ borderColor: THEME.gridLine }}>
                    <td className="border-r px-3 py-2" style={{ borderColor: THEME.gridLine }}>{b.label}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{b.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="text-xs text-gray-500">Ofis Akademi · İstatistik araçları</div>
      </div>
    </div>
  );
}
