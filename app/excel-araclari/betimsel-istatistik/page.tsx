"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { parseNumbers, mean, std, variance } from "@/lib/istatistik";

function mode(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const counts = new Map<number, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  const maxCount = Math.max(...counts.values());
  return [...counts.entries()].filter(([, c]) => c === maxCount).map(([v]) => v);
}

function median(arr: number[]): number {
  if (arr.length === 0) return NaN;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default function BetimselIstatistikPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Record<string, number | string> | null>(null);
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const arr = parseNumbers(input);
    if (arr.length === 0) {
      setResult(null);
      return;
    }
    const ort = mean(arr);
    const modlar = mode(arr);
    setResult({
      "Veri sayısı (n)": arr.length,
      "Ortalama (aritmetik)": ort,
      Medyan: median(arr),
      Mod: modlar.length ? (modlar.length <= 3 ? modlar.join(", ") : `${modlar.slice(0, 2).join(", ")} ...`) : "—",
      "Standart sapma (s)": std(arr, false),
      "Varyans (s²)": variance(arr, false),
      Minimum: Math.min(...arr),
      Maksimum: Math.max(...arr),
      Açıklık: Math.max(...arr) - Math.min(...arr),
    });
    setCopied(false);
  }

  function copyText(): string {
    if (!result) return "";
    return Object.entries(result)
      .map(([k, v]) => `${k}\t${typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(4)) : v}`)
      .join("\n");
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
        title="Betimsel İstatistik"
        description="Sayı listesi için ortalama, medyan, mod, standart sapma, varyans, min, max ve açıklık. Excel'den yapıştırın."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Sayıları virgül, boşluk veya satır sonu ile ayrılmış şekilde aşağıdaki kutuya yapıştırın (Excel'den sütun kopyalayabilirsiniz).",
            "Hesapla butonuna tıklayın.",
            "Ortalama, medyan, mod, standart sapma, varyans, min, max ve açıklık görünür; Sonucu Kopyala ile alabilirsiniz.",
          ]}
          excelAlternatif={<>Excel&apos;de: <code className="bg-gray-100 px-1 rounded text-xs">=ORTALAMA()</code>, <code className="bg-gray-100 px-1 rounded text-xs">=MEDYAN()</code>, <code className="bg-gray-100 px-1 rounded text-xs">=STDSAPMA.S()</code>, <code className="bg-gray-100 px-1 rounded text-xs">=VAR.S()</code>, <code className="bg-gray-100 px-1 rounded text-xs">=MİN()</code>, <code className="bg-gray-100 px-1 rounded text-xs">=MAKS()</code>.</>}
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sayılar (virgül, boşluk veya satır sonu ile ayrılmış)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="10, 20, 30&#10;40 50 60"
            rows={6}
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
          <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(result).map(([key, val]) => (
                  <tr key={key} className="border-b last:border-b-0" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">{key}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {typeof val === "number" ? (Number.isInteger(val) ? val.toLocaleString("tr-TR") : val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })) : val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/betimsel-istatistik" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · İstatistik araçları</div>
      </div>
    </div>
  );
}
