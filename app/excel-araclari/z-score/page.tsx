"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { parseNumbers, mean, std } from "@/lib/istatistik";

export default function ZScorePage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ values: number[]; zScores: number[]; ort: number; std: number } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const values = parseNumbers(input);
    if (values.length === 0) {
      setResult(null);
      return;
    }
    const ort = mean(values);
    const s = std(values, false);
    const zScores = s === 0 ? values.map(() => 0) : values.map((v) => (v - ort) / s);
    setResult({ values, zScores, ort, std: s });
    setCopied(false);
  }

  function copyText(): string {
    if (!result) return "";
    const header = "Değer\tZ-Skor";
    const lines = result.values.map((v, i) => `${v}\t${result.zScores[i].toFixed(4)}`);
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
        title="Z Skor (Z-Score) Hesaplama"
        description="Z skor hesaplama: her değerin ortalamadan kaç standart sapma uzakta olduğu. Aykırı değer tespiti için."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Sayıları Excel'den veya listeden kopyalayıp aşağıdaki kutuya yapıştırın.",
            "Hesapla butonuna tıklayın.",
            "Her değerin z-skoru tabloda görünür; |z| > 2 genelde aykırı kabul edilir. Tabloyu Kopyala ile Excel'e yapıştırabilirsiniz.",
          ]}
          excelAlternatif={<>Excel&apos;de z-skor: <code className="bg-gray-100 px-1 rounded text-xs">=(A1-ORTALAMA(A:A))/STDSAPMA.S(A:A)</code> veya <code className="bg-gray-100 px-1 rounded text-xs">=(A1-AVERAGE(A:A))/STDEV.S(A:A)</code>.</>}
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sayılar (Excel sütunundan yapıştırın)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="10, 12, 14, 15, 100"
            rows={6}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
          <p className="text-xs text-gray-500 mt-1">Z = (değer − ortalama) / standart sapma. |Z| &gt; 2 genelde aykırı kabul edilir.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleHesapla}
            className="inline-flex min-w-[140px] justify-center rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Hesapla
          </button>
          <CopyButton onClick={handleCopy} disabled={!result} copied={copied} label="Tabloyu Kopyala" copiedLabel="Kopyalandı" />
        </div>
        {result && (
          <>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-medium">Ortalama: <span className="tabular-nums">{result.ort.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</span></span>
              <span className="font-medium">Standart sapma: <span className="tabular-nums">{result.std.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</span></span>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                    <th className="border-b border-r px-3 py-2 text-left font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Değer</th>
                    <th className="border-b px-3 py-2 text-right font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Z-Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {result.values.map((v, i) => (
                    <tr key={i} className="border-b last:border-b-0" style={{ borderColor: THEME.gridLine }}>
                      <td className="border-r px-3 py-1.5 tabular-nums" style={{ borderColor: THEME.gridLine }}>{v}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums">{result.zScores[i].toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/z-score" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · İstatistik araçları</div>
      </div>
    </div>
  );
}
