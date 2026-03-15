"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { parseNumbers, percentile, quartile } from "@/lib/istatistik";

export default function CeyrekYuzdelikPage() {
  const [input, setInput] = useState("");
  const [customYuzde, setCustomYuzde] = useState("90");
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [customValue, setCustomValue] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const arr = parseNumbers(input);
    if (arr.length === 0) {
      setResult(null);
      setCustomValue(null);
      return;
    }
    const p = Math.min(100, Math.max(0, parseFloat(customYuzde.replace(",", ".")) || 90)) / 100;
    setResult({
      Minimum: quartile(arr, 0),
      "1. Çeyrek (Q1, %25)": quartile(arr, 1),
      "Medyan (Q2, %50)": quartile(arr, 2),
      "3. Çeyrek (Q3, %75)": quartile(arr, 3),
      Maksimum: quartile(arr, 4),
    });
    setCustomValue(percentile(arr, p));
    setCopied(false);
  }

  function copyText(): string {
    if (!result) return "";
    const lines = Object.entries(result).map(([k, v]) => `${k}\t${v}`);
    if (customValue !== null) lines.push(`Yüzdelik %${Number(customYuzde) || 90}\t${customValue}`);
    return lines.join("\n");
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
        title="Çeyrekler & Yüzdelik"
        description="Veri seti için minimum, Q1, medyan, Q3, maksimum ve isteğe bağlı özel yüzdelik dilimi (örn. %90)."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Sayıları aşağıdaki kutuya yapıştırın (virgül veya satır sonu ile ayrılmış).",
            "İsterseniz özel yüzdelik dilimini girin (örn. 90 → %90).",
            "Hesapla butonuna tıklayın; minimum, Q1, medyan, Q3, maksimum ve özel yüzdelik görünür.",
          ]}
          excelAlternatif={<>Excel&apos;de: <code className="bg-gray-100 px-1 rounded text-xs">=ÇEYREK(A:A;1)</code> (Q1), <code className="bg-gray-100 px-1 rounded text-xs">2</code> (medyan), <code className="bg-gray-100 px-1 rounded text-xs">3</code> (Q3). Yüzdelik: <code className="bg-gray-100 px-1 rounded text-xs">=YÜZDELİK(A:A;0,9)</code> (%90).</>}
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sayılar (Excel'den yapıştırabilirsiniz)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="10, 20, 30, 40, 50, 60, 70, 80, 90, 100"
            rows={6}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-600">Özel yüzdelik dilimi (%):</label>
          <input
            type="text"
            value={customYuzde}
            onChange={(e) => setCustomYuzde(e.target.value)}
            className="w-16 rounded border px-2 py-1.5 text-sm"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleHesapla}
            className="inline-flex min-w-[140px] justify-center rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Hesapla
          </button>
          <CopyButton onClick={handleCopy} disabled={!result} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
        </div>
        {result && (
          <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(result).map(([key, val]) => (
                  <tr key={key} className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">{key}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{val.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                ))}
                {customValue !== null && (
                  <tr className="border-b-0" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">Yüzdelik %{customYuzde}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{customValue.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/ceyrek-yuzdelik" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · İstatistik araçları</div>
      </div>
    </div>
  );
}
