"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { parseNumbers, percentile, quartile } from "@/lib/istatistik";

const ACCENT = "#217346";

export default function CeyrekYuzdelikPage() {
  const [input, setInput] = useState("");
  const [customYuzde, setCustomYuzde] = useState("90");
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [customValue, setCustomValue] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const howToSteps = [
    "Sayıları aşağıdaki kutuya yapıştırın (virgül veya satır sonu ile ayrılmış).",
    "İsterseniz özel yüzdelik dilimini girin (örn. 90 → %90).",
    "Hesapla butonuna tıklayın; minimum, Q1, medyan, Q3, maksimum ve özel yüzdelik görünür.",
  ];

  const faq = [
    {
      question: "Yüzdelik (%90) ne demek?",
      answer: "Değerlerin %90'ı bu sonuçtan küçük veya eşittir.",
    },
    {
      question: "Q1/Q3 ne işe yarar?",
      answer: "Dağılımın “orta” kısmını gösterir; kutu grafiği (box plot) için temel değerlerdir.",
    },
    {
      question: "Excel’e nasıl aktarırım?",
      answer: "“Sonucu Kopyala” ile panoya alıp Ctrl+V yap.",
    },
  ];

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

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Veri setinin çeyreklerini ve yüzdelik dilimini hesaplar: minimum, <span className="font-semibold">Q1</span>, medyan
        (Q2), <span className="font-semibold">Q3</span>, maksimum ve özel <span className="font-semibold">% dilim</span>{" "}
        (örn. %90).
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="font-mono text-gray-700">10, 20, 30, ..., 100</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">Q1, medyan, Q3 ve maksimum + seçtiğiniz yüzde dilimi.</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Çeyrek (Quartile) ve Yüzdelik Hesaplama"
      description="Quartile ve percentile hesaplama: minimum, Q1, medyan, Q3, maksimum ve özel yüzdelik dilimi (örn. %90)."
      path="/excel-araclari/ceyrek-yuzdelik"
      keywords={["çeyrek hesaplama", "quartile", "yüzdelik", "percentile", "Q1 Q3"]}
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <Link
          href="/blog/excel-ceyrek-quartile-yuzdelik"
          className="font-medium underline underline-offset-2"
          style={{ color: ACCENT }}
        >
          Çeyrek ve yüzdelik rehberi
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label htmlFor="ceyrek-yuzdelik-input" className="block text-sm font-semibold text-gray-900">
            Sayıları yapıştırın
          </label>
          <div className="mt-1.5">
            <InputTextarea
              id="ceyrek-yuzdelik-input"
              value={input}
              onChange={setInput}
              rows={6}
              minHeight="10rem"
              className="font-mono resize-y"
              placeholder="10, 20, 30, 40, 50, 60, 70, 80, 90, 100"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600">Özel yüzdelik (%):</span>
            <input
              type="text"
              value={customYuzde}
              onChange={(e) => setCustomYuzde(e.target.value)}
              className="h-10 w-16 rounded-xl border border-gray-200 bg-gray-50/80 px-2.5 text-center text-sm text-gray-900 tabular-nums focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              aria-label="Özel yüzdelik yüzdesi"
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {result && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <tbody>
                  {Object.entries(result).map(([key, val]) => (
                    <tr key={key} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-4 py-2.5 font-medium text-gray-700">{key}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-900">
                        {val.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
                      </td>
                    </tr>
                  ))}
                  {customValue !== null && (
                    <tr className="border-t border-gray-200 bg-gray-50/60">
                      <td className="px-4 py-2.5 font-medium text-gray-700">Yüzdelik %{customYuzde}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-900">
                        {customValue.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
        )}
      </div>
    </ToolLayout>
  );
}
