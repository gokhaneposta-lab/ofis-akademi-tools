"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { parseNumbers, mean, std } from "@/lib/istatistik";

const ACCENT = "#217346";

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
    <ToolLayout
      title="Z Skor (Z-Score) Hesaplama"
      description="Her değerin ortalamadan kaç standart sapma uzakta olduğunu hesaplayın."
      path="/excel-araclari/z-score"
      howToSteps={["Sayıları kutuya yapıştırın.", "Hesapla butonuna tıklayın.", "Her değerin z-skoru tabloda görünür."]}
      faq={[
        { question: "z-skor negatif olur mu?", answer: "Evet, ortalamanın altında olduğuna işaret eder." },
        { question: "Eşik değer var mı?", answer: "|Z| > 2 sık kullanılan eşiktir." },
        { question: "Excel'e nasıl aktarırım?", answer: "Tabloyu Kopyala ile yapıştırın." },
      ]}
      aboutContent={
        <>
          <p className="mb-4 text-sm text-gray-700">
            Verideki her değerin ortalamaya göre kaç standart sapma uzaklıkta olduğunu hesaplar; sonuç{" "}
            <span className="font-semibold">z-skor</span> olarak gösterilir. Aykırı değer tespitinde kullanılır.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
              <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
              <p className="font-mono text-gray-700">10, 12, 14, 15, 100</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
              <p className="mb-1 font-semibold text-gray-800">Çıktı</p>
              <p className="text-gray-700">Her değer için z-skor; |z| &gt; 2 olan satırlar vurgulanır.</p>
            </div>
          </div>
        </>
      }
      relatedLinks={
        <Link href="/blog/excel-z-score-z-skor-hesaplama" className="underline underline-offset-2" style={{ color: ACCENT }}>
          Excel&apos;de z-skor rehberi
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-8 pt-2 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="mb-0.5 block text-sm font-medium text-gray-800">Sayıları yapıştırın</label>
          <p className="mt-0.5 text-xs text-gray-400">Z = (değer − ortalama) / standart sapma</p>
          <InputTextarea
            value={input}
            onChange={setInput}
            placeholder="10, 12, 14, 15, 100"
            rows={6}
            minHeight="10rem"
            className="!resize-y border-gray-200 bg-white font-mono"
          />
          <PrimaryButton className="mt-3" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {result && (
          <>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-md">
                <div className="text-2xl font-bold tabular-nums sm:text-3xl" style={{ color: ACCENT }}>
                  {result.ort.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
                </div>
                <div className="mt-1 text-xs text-gray-500">Ortalama</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-md">
                <div className="text-2xl font-bold tabular-nums sm:text-3xl" style={{ color: ACCENT }}>
                  {result.std.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
                </div>
                <div className="mt-1 text-xs text-gray-500">Std Sapma</div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr>
                      <th className="border-b border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">Değer</th>
                      <th className="border-b border-gray-200 px-4 py-2.5 text-right font-semibold text-gray-700">Z-Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.values.map((v, i) => {
                      const z = result.zScores[i];
                      const outlier = Math.abs(z) > 2;
                      return (
                        <tr key={i} className={`border-b border-gray-100 last:border-b-0 ${outlier ? "bg-red-50" : ""}`}>
                          <td className="px-4 py-2 tabular-nums text-gray-900">{v}</td>
                          <td className="px-4 py-2 text-right tabular-nums text-gray-900">{z.toFixed(4)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end border-t border-gray-200 px-4 py-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!result}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm transition enabled:hover:border-gray-300 enabled:hover:bg-gray-50 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  style={result ? { color: ACCENT } : undefined}
                >
                  {copied ? "Kopyalandı" : "Tabloyu Kopyala"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
