"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { parseNumbers } from "@/lib/istatistik";

const ACCENT = "#217346";

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

  const howToSteps = [
    "Sayıları aşağıdaki kutuya yapıştırın (Excel'den sütun kopyalayabilirsiniz).",
    "Sınıf genişliğini (aralık) girin (örn. 10 → 0–10, 10–20, 20–30).",
    "Hesapla butonuna tıklayın; frekans tablosu görünür. Tabloyu Kopyala ile Excel'e yapıştırabilirsiniz.",
  ];

  const faq = [
    {
      question: "Sınıf genişliği neyi belirler?",
      answer: "Aralıkların büyüklüğünü (örn. 10 → 0–10, 10–20, 20–30...).",
    },
    {
      question: "Excel’de nasıl karşılığı var?",
      answer: "FREKANS dizi formülü veya Veri Analizi histogram.",
    },
    {
      question: "Excel’e nasıl aktarırım?",
      answer: "Tabloyu “Tabloyu Kopyala” ile panoya alıp Excel’e yapıştır.",
    },
  ];

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Sayıları belirli aralıklara (sınıf aralıkları) böler ve her aralığın kaç kez geçtiğini (frekans) hesaplar. Histogram ve veri dağılımı analizi için temel tablodur.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="font-mono text-gray-700">5, 12, 18, 22, 25, 33, 38, 42, 55</p>
          <p className="mt-2 text-gray-600">
            Sınıf genişliği: <span className="font-mono font-semibold text-gray-800">10</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Frekans tablosu (özet)</p>
          <ul className="space-y-0.5 text-gray-700">
            <li>0 – 10 → 1</li>
            <li>10 – 20 → 2</li>
            <li>20 – 30 → 2</li>
            <li>30 – 40 → 2</li>
            <li>40 – 50 → 1</li>
            <li>50 – 60 → 1</li>
          </ul>
        </div>
      </div>
    </>
  );

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
    <ToolLayout
      title="Frekans Dağılımı Hesaplama"
      description="Sayıları sınıf aralıklarına bölerek frekans tablosu oluşturma. Histogram verisi, frekans dağılımı hesaplama."
      path="/excel-araclari/frekans-dagilimi"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <Link
          href="/blog/excel-frekans-dagilimi-hesaplama"
          className="font-medium underline underline-offset-2"
          style={{ color: ACCENT }}
        >
          Excel frekans dağılımı hesaplama rehberi
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label
            htmlFor="frekans-dagilimi-input"
            className="block text-sm font-semibold text-gray-900"
          >
            Sayıları yapıştırın
          </label>
          <div className="mt-1.5">
            <InputTextarea
              id="frekans-dagilimi-input"
              value={input}
              onChange={setInput}
              rows={6}
              minHeight="10rem"
              className="font-mono resize-y"
              placeholder="5, 12, 18, 22, 25, 33, 38, 42, 55"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600">Sınıf genişliği:</span>
            <input
              type="text"
              value={binWidthStr}
              onChange={(e) => setBinWidthStr(e.target.value)}
              inputMode="decimal"
              className="h-10 w-20 rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-sm text-gray-900 tabular-nums focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {bins.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/90">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-600">
                      Aralık
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-600">
                      Frekans
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bins.map((b, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 last:border-b-0 odd:bg-white even:bg-gray-50/50"
                    >
                      <td className="px-4 py-2.5 text-gray-900">{b.label}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gray-900">{b.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!bins.length}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  style={
                    copied
                      ? { borderColor: ACCENT, color: ACCENT }
                      : undefined
                  }
                >
                  {copied ? "Kopyalandı ✓" : "Tabloyu Kopyala"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
