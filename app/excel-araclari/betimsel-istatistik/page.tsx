"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { parseNumbers, mean, std, variance } from "@/lib/istatistik";

const ACCENT = "#217346";

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
  const [loading, setLoading] = useState(false);

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

  function handleHesaplaClick() {
    setLoading(true);
    setTimeout(() => {
      handleHesapla();
      setLoading(false);
    }, 400);
  }

  return (
    <ToolLayout
      title="Ortalama, Medyan, Standart Sapma Hesaplama"
      description="Betimsel istatistik: ortalama, medyan, mod, standart sapma, varyans, min, max."
      path="/excel-araclari/betimsel-istatistik"
      howToSteps={[
        "Sayıları virgül, boşluk veya satır sonu ile ayrılmış şekilde kutuya yapıştırın.",
        "Hesapla butonuna tıklayın.",
        "Ortalama, medyan, mod, standart sapma, varyans, min, max ve açıklık görünür.",
      ]}
      faq={[
        { question: "Mod neyi gösterir?", answer: "En sık tekrar eden değer(ler)i." },
        { question: "Standart sapma neyi anlatır?", answer: "Verinin ortalamadan ne kadar yayıldığını gösterir." },
        { question: "Sonucu Excel'e nasıl taşırım?", answer: "Sonucu Kopyala ile panoya alıp Ctrl+V yapın." },
      ]}
      aboutContent={
        <>
          <p className="mb-4 text-sm text-gray-700">
            Sayı listesinden tek seferde betimsel istatistik özeti üretir: ortalama, medyan, mod, standart sapma, varyans,
            minimum, maksimum ve açıklık. Excel&apos;den sütun yapıştırarak veya elle girdiğiniz değerlerle çalışır; veri
            tarayıcıda kalır.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
              <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
              <p className="font-mono text-gray-700">10, 20, 30</p>
              <p className="mt-1 text-gray-600">Virgül, boşluk veya satır sonu ile ayırabilirsiniz.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
              <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
              <p className="text-gray-700">n, ortalama, medyan, mod, s, s², min, max ve açıklık tabloda listelenir.</p>
            </div>
          </div>
        </>
      }
      relatedLinks={
        <Link href="/blog/excel-ortalama-medyan-standart-sapma" className="underline underline-offset-2" style={{ color: ACCENT }}>
          Excel&apos;de ortalama, medyan ve standart sapma
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="mb-2 block text-sm font-medium text-gray-800">Sayıları yapıştırın</label>
          <InputTextarea
            value={input}
            onChange={setInput}
            placeholder={"10, 20, 30\n40 50 60"}
            rows={6}
            minHeight="10rem"
            className="!resize-y border-gray-200 bg-white font-mono text-sm"
          />
          <PrimaryButton className="mt-3" onClick={handleHesaplaClick} disabled={!input.trim() || loading}>
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Hesaplanıyor...
              </>
            ) : (
              "Hesapla"
            )}
          </PrimaryButton>
        </div>

        {result && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(result).map(([key, val]) => (
                  <tr key={key} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-4 py-2.5 font-medium text-gray-700">{key}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-900">
                      {typeof val === "number"
                        ? Number.isInteger(val)
                          ? val.toLocaleString("tr-TR")
                          : val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                        : val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition enabled:hover:border-gray-300 enabled:hover:bg-gray-50 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                style={result ? { color: ACCENT } : undefined}
              >
                {copied ? "Kopyalandı" : "Sonucu Kopyala"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
