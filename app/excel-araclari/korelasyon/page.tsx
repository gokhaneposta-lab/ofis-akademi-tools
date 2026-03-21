"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { parseTwoColumns, pearson, mean, std } from "@/lib/istatistik";

const ACCENT = "#217346";

export default function KorelasyonPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    r: number;
    n: number;
    ortalamaX: number;
    ortalamaY: number;
    stdX: number;
    stdY: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const howToSteps = [
    "X ve Y sütunlarını Excel'den kopyalayıp aşağıdaki kutuya yapıştırın (her satırda iki sayı; Tab veya noktalı virgül ile ayrılmış).",
    "Hesapla butonuna tıklayın.",
    "Pearson korelasyon katsayısı (r) ve özet istatistikler görünür; Sonucu Kopyala ile alabilirsiniz.",
  ];

  const faq = [
    {
      question: "r hangi aralıkta olur?",
      answer: "Genelde -1 ile +1 arasında.",
    },
    {
      question: "r 0’a yakınsa?",
      answer: "Doğrusal ilişki zayıftır.",
    },
    {
      question: "Excel’e nasıl aktarırım?",
      answer: "“Sonucu Kopyala” ile panoya al.",
    },
  ];

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

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        X ve Y iki değişkeni arasındaki ilişkinin gücünü ölçer. Sonuç olarak{" "}
        <span className="font-semibold">Pearson korelasyon katsayısı</span> olan{" "}
        <span className="font-semibold">r</span> değerini verir.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="font-mono text-gray-700">
            1 10, 2 20, 3 30
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">
            Doğrusal artış varsa <span className="font-semibold">r ≈ +1</span>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Korelasyon Hesaplama (Pearson)"
      description="İki değişken (X ve Y) arasındaki Pearson korelasyon katsayısı r hesaplama. Excel'den 2 sütun yapıştırın."
      path="/excel-araclari/korelasyon"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <Link
          href="/blog/excel-korelasyon-pearson-hesaplama"
          className="font-medium underline underline-offset-2"
          style={{ color: ACCENT }}
        >
          Excel’de Pearson korelasyon hesaplama
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label
            htmlFor="korelasyon-input"
            className="block text-sm font-semibold text-gray-900"
          >
            X ve Y değerleri
          </label>
          <p className="mt-0.5 text-xs text-gray-400">Her satırda iki sayı</p>
          <div className="mt-1.5">
            <InputTextarea
              id="korelasyon-input"
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="12rem"
              className="resize-y font-mono"
              placeholder={"1\t10\n2\t20\n3\t18\n4\t25\n5\t30"}
            />
          </div>
          <PrimaryButton className="mt-3" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {result && (
          <>
            <div className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 px-4 py-4 text-center">
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color: ACCENT }}
              >
                r = {result.r.toFixed(4)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                r yakın +1: pozitif ilişki; yakın -1: negatif ilişki; 0&apos;a
                yakın: zayıf ilişki.
              </p>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2.5 font-medium text-gray-700">
                      Çift sayısı (n)
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {result.n}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2.5 font-medium text-gray-700">
                      X ortalaması
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {result.ortalamaX.toLocaleString("tr-TR", {
                        maximumFractionDigits: 4,
                      })}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2.5 font-medium text-gray-700">
                      Y ortalaması
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {result.ortalamaY.toLocaleString("tr-TR", {
                        maximumFractionDigits: 4,
                      })}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-2.5 font-medium text-gray-700">
                      X standart sapma
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {result.stdX.toLocaleString("tr-TR", {
                        maximumFractionDigits: 4,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-medium text-gray-700">
                      Y standart sapma
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {result.stdY.toLocaleString("tr-TR", {
                        maximumFractionDigits: 4,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-stretch border-t border-gray-200 px-4 py-3 sm:justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!result}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  style={
                    copied
                      ? { borderColor: ACCENT, color: ACCENT }
                      : undefined
                  }
                >
                  {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
