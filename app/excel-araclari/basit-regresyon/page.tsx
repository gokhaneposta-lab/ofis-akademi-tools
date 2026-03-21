"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { parseTwoColumns, linearRegression } from "@/lib/istatistik";

const ACCENT = "#217346";

export default function BasitRegresyonPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ a: number; b: number; r2: number; n: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const howToSteps = [
    "X ve Y sütunlarını Excel'den kopyalayıp aşağıdaki kutuya yapıştırın (her satırda iki sayı; Tab veya ; ile ayrılmış).",
    "Hesapla butonuna tıklayın.",
    "Y = a + b·X doğrusunun kesişim (a), eğim (b) ve R² görünür; Sonucu Kopyala ile alabilirsiniz.",
  ];

  const faq = [
    {
      question: "Minimum kaç satır gerekir?",
      answer: "En az 2 veri noktası gerekir.",
    },
    {
      question: "R² ne işe yarar?",
      answer: "Verinin doğrusal modele ne kadar iyi uyduğunu gösterir (0–1 arası).",
    },
    {
      question: "Excel’de nasıl karşılığı var?",
      answer: "LINEST / EĞİM / KESİŞİM ve ilgili istatistikler kullanılır.",
    },
  ];

  function handleHesapla() {
    const { x, y } = parseTwoColumns(input);
    if (x.length < 2) {
      setResult(null);
      return;
    }
    const { a, b, r2 } = linearRegression(x, y);
    setResult({ a, b, r2, n: x.length });
    setCopied(false);
  }

  function copyText(): string {
    if (!result) return "";
    return [
      "Doğrusal regresyon: Y = a + b·X",
      "Kesişim (a)\t" + result.a.toFixed(4),
      "Eğim (b)\t" + result.b.toFixed(4),
      "R² (açıklanan varyans)\t" + result.r2.toFixed(4),
      "Çift sayısı (n)\t" + result.n,
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
        Excel’deki iki sütun değerinden (X ve Y) doğrusal regresyonu hesaplar. Böylece{" "}
        <span className="font-semibold">Y = a + b·X</span> şeklinde en iyi uyum doğrusunu (a, b) ve{" "}
        <span className="font-semibold">R²</span> değerini elde edersin.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">
            Her satırda iki sayı: <span className="font-mono">1 10</span>, <span className="font-mono">2 20</span> …
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">
            Kesişim <span className="font-mono">a</span>, eğim <span className="font-mono">b</span> ve{" "}
            <span className="font-mono">R²</span>.
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        R² 1’e yaklaştıkça, X arttıkça Y’nin doğrusal şekilde değiştiği daha güçlü görünür.
      </p>
    </>
  );

  return (
    <ToolLayout
      title="Regresyon Hesaplama (Doğrusal)"
      description="Y = a + b·X, eğim, kesişim ve R² hesaplama."
      path="/excel-araclari/basit-regresyon"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <Link
          href="/blog/excel-basit-regresyon-dogrusal"
          className="font-medium underline underline-offset-2"
          style={{ color: ACCENT }}
        >
          Doğrusal regresyon rehberi
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label htmlFor="basit-regresyon-input" className="block text-sm font-semibold text-gray-900">
            X ve Y değerleri
          </label>
          <p className="mt-0.5 text-xs text-gray-400">Her satırda iki sayı (Tab veya ; ile)</p>
          <div className="mt-1.5">
            <InputTextarea
              id="basit-regresyon-input"
              value={input}
              onChange={setInput}
              placeholder={"1\t10\n2\t20\n3\t22\n4\t28\n5\t35"}
              rows={8}
              minHeight="12rem"
              className="resize-y font-mono"
            />
          </div>
          <PrimaryButton className="mt-3" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {result && (
          <>
            <div className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 px-4 py-4">
              <p className="text-lg font-bold font-mono">
                Y = {result.a.toFixed(4)} + {result.b.toFixed(4)} · X
              </p>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 font-medium text-gray-700">Kesişim (a)</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {result.a.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 font-medium text-gray-700">Eğim (b)</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {result.b.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 font-medium text-gray-700">R² (belirleme katsayısı)</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {result.r2.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-700">Çift sayısı (n)</td>
                    <td className="px-4 py-3 text-right">{result.n}</td>
                  </tr>
                </tbody>
              </table>
              <div className="border-t border-gray-200 px-4 py-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!result}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
                >
                  {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">R² 0–1 arası; 1&apos;e yakın = doğrusal ilişki güçlü.</p>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
