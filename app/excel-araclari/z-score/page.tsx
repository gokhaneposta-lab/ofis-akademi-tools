"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
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
          showEnhancedSections={false}
          steps={[
            "Sayıları Excel'den veya listeden kopyalayıp aşağıdaki kutuya yapıştırın.",
            "Hesapla butonuna tıklayın.",
            "Her değerin z-skoru tabloda görünür; |z| > 2 genelde aykırı kabul edilir. Tabloyu Kopyala ile Excel'e yapıştırabilirsiniz.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de z skor (z-score), bir değerin ortalamadan kaç standart sapma uzakta olduğunu gösterir. Aykırı değer tespiti ve standartlaştırma için kullanılır.
              </p>
              <ExcelFormulBlok
                baslik="Tek hücrenin z skoru için:"
                formül="=(A1-ORTALAMA(A:A))/STDSAPMA.S(A:A)"
                aciklama="Ortalama (ORTALAMA / AVERAGE) veri setinin ortalamasıdır; STDSAPMA.S (STDEV.S) örnek standart sapmasıdır. Formül: (değer - ortalama) / standart sapma. Sonuç genelde -3 ile +3 arasındadır; 2'den büyük veya -2'den küçük değerler aykırı sayılabilir."
              />
            </>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Verideki her değerin ortalamaya göre kaç standart sapma uzaklıkta olduğunu hesaplar. Sonuç: <span className="font-semibold">z-skor</span>. Aykırı değer tespitinde kullanılır.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Girdi:</span> <span className="font-mono">10, 12, 14, 15, 100</span>
            </p>
            <p>
              <span className="font-semibold">Çıktı:</span> her değer için z-skor; genelde ortalamadan çok uzak olan değerlerin |z| değeri daha büyüktür.
            </p>
            <p className="text-xs text-gray-500">|Z| &gt; 2 genelde “aykırı” kabul edilir.</p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">z-skor negatif mi olur?</span>
              <br />
              Evet. Negatif değer, ortalamanın altında olduğuna işaret eder.
            </p>
            <p>
              <span className="font-semibold">Eşik değer var mı?</span>
              <br />
              Sık kullanılan eşik: <span className="font-semibold">|Z| &gt; 2</span>.
            </p>
            <p>
              <span className="font-semibold">Excel’e nasıl aktarırım?</span>
              <br />
              “Tabloyu Kopyala” ile panoya alıp Excel’e yapıştır.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Daha fazla örnek için{" "}
            <Link
              href="/blog/excel-z-score-z-skor-hesaplama"
              className="underline"
              style={{ color: THEME.ribbon }}
            >
              z-skor rehberine
            </Link>{" "}
            bakabilirsin.
          </p>
        </section>

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
