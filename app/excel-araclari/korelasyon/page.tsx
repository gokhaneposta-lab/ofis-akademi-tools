"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";
import { parseTwoColumns, pearson, mean, std } from "@/lib/istatistik";

export default function KorelasyonPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ r: number; n: number; ortalamaX: number; ortalamaY: number; stdX: number; stdY: number } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const { x, y } = parseTwoColumns(input);
    if (x.length < 2) {
      setResult(null);
      return;
    }
    const r = pearson(x, y);
    setResult({
      r,
      n: x.length,
      ortalamaX: mean(x),
      ortalamaY: mean(y),
      stdX: std(x, false),
      stdY: std(y, false),
    });
    setCopied(false);
  }

  function copyText(): string {
    if (!result) return "";
    return [
      "Pearson korelasyon katsayısı (r)\t" + result.r.toFixed(4),
      "Çift sayısı (n)\t" + result.n,
      "X ortalaması\t" + result.ortalamaX.toFixed(4),
      "Y ortalaması\t" + result.ortalamaY.toFixed(4),
      "X standart sapma\t" + result.stdX.toFixed(4),
      "Y standart sapma\t" + result.stdY.toFixed(4),
    ].join("\n");
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
        title="Korelasyon (Pearson)"
        description="İki değişken (X ve Y) arasındaki Pearson korelasyon katsayısını hesaplayın. Excel'den 2 sütun yapıştırın."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">X ve Y değerleri (her satırda iki sayı — Tab veya noktalı virgül ile)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"1\t10\n2\t20\n3\t18\n4\t25\n5\t30"}
            rows={8}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
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
          <div className="space-y-2">
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
              <div className="text-2xl font-bold tabular-nums" style={{ color: THEME.ribbon }}>
                r = {result.r.toFixed(4)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                r yakın +1: pozitif ilişki; yakın -1: negatif ilişki; 0'a yakın: zayıf ilişki.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">Çift sayısı (n)</td>
                    <td className="px-3 py-2 text-right">{result.n}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">X ortalaması</td>
                    <td className="px-3 py-2 text-right tabular-nums">{result.ortalamaX.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">Y ortalaması</td>
                    <td className="px-3 py-2 text-right tabular-nums">{result.ortalamaY.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">X standart sapma</td>
                    <td className="px-3 py-2 text-right tabular-nums">{result.stdX.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                  <tr style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">Y standart sapma</td>
                    <td className="px-3 py-2 text-right tabular-nums">{result.stdY.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="text-xs text-gray-500">Ofis Akademi · İstatistik araçları</div>
      </div>
    </div>
  );
}
