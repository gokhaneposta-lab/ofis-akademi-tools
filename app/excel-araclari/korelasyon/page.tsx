"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { parseTwoColumns, pearson, mean, std } from "@/lib/istatistik";
import ToolJsonLd from "@/components/ToolJsonLd";

export default function KorelasyonPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ r: number; n: number; ortalamaX: number; ortalamaY: number; stdX: number; stdY: number } | null>(null);
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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Korelasyon Hesaplama (Pearson)"
        description="İki değişken (X ve Y) arasındaki Pearson korelasyon katsayısı r hesaplama. Excel'den 2 sütun yapıştırın."
      />
      <ToolJsonLd
        name="Korelasyon Hesaplama (Pearson)"
        description="İki değişken (X ve Y) arasındaki Pearson korelasyon katsayısı r hesaplama. Excel'den 2 sütun yapıştırın."
        path="/excel-araclari/korelasyon"
        howToSteps={howToSteps}
        faq={faq}
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={howToSteps}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de iki değişken (X ve Y) arasındaki Pearson korelasyon katsayısını KOREL fonksiyonu ile hesaplayabilirsiniz.
              </p>
              <ExcelFormulBlok
                baslik="Pearson korelasyon katsayısı için:"
                formül="=KOREL(A:A;B:B)"
                aciklama="KOREL (İngilizce: CORREL) iki eşit uzunluktaki aralığı alır ve -1 ile +1 arasında korelasyon katsayısı döner. +1'e yakın pozitif, -1'e yakın negatif ilişki; 0'a yakın zayıf ilişki anlamına gelir. A:A X değerleri, B:B Y değerleri; satır sayıları eşit olmalı."
              />
            </>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            X ve Y iki değişkeni arasındaki ilişkinin gücünü ölçer. Sonuç olarak <span className="font-semibold">Pearson korelasyon katsayısı</span> olan <span className="font-semibold">r</span> değerini verir.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Girdi:</span> <span className="font-mono">1 10</span>, <span className="font-mono">2 20</span>, <span className="font-mono">3 30</span>
            </p>
            <p>
              <span className="font-semibold">Çıktı:</span> Doğrusal artış varsa <span className="font-semibold">r ≈ +1</span> görürsün.
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">r hangi aralıkta olur?</span>
              <br />
              Genelde <span className="font-semibold">-1</span> ile <span className="font-semibold">+1</span> arasında.
            </p>
            <p>
              <span className="font-semibold text-gray-900">r 0’a yakınsa?</span>
              <br />
              Doğrusal ilişki zayıftır.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Excel’e nasıl aktarırım?</span>
              <br />
              “Sonucu Kopyala” ile panoya al.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Daha fazla yorum için{" "}
            <Link
              href="/blog/excel-korelasyon-pearson-hesaplama"
              className="underline"
              style={{ color: THEME.ribbon }}
            >
              korelasyon rehberini
            </Link>{" "}
            inceleyebilirsin.
          </p>
        </section>

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
        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/korelasyon" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · İstatistik araçları</div>
      </div>
    </div>
  );
}
