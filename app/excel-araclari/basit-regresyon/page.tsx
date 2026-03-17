"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { parseTwoColumns, linearRegression } from "@/lib/istatistik";

export default function BasitRegresyonPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ a: number; b: number; r2: number; n: number } | null>(null);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Regresyon Hesaplama (Doğrusal)"
        description="Basit doğrusal regresyon: Y = a + b·X, eğim, kesişim ve R². Excel'den 2 sütun yapıştırın."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "X ve Y sütunlarını Excel'den kopyalayıp aşağıdaki kutuya yapıştırın (her satırda iki sayı; Tab veya ; ile ayrılmış).",
            "Hesapla butonuna tıklayın.",
            "Y = a + b·X doğrusunun kesişim (a), eğim (b) ve R² görünür; Sonucu Kopyala ile alabilirsiniz.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de basit doğrusal regresyon Y = a + b·X için eğim (b) ve kesişim (a) fonksiyonlarla hesaplanır.
              </p>
              <ExcelFormulBlok
                baslik="Eğim (b) ve kesişim (a) için:"
                formül="=EĞİM(Y_aralığı;X_aralığı)"
                aciklama="EĞİM (SLOPE) doğrunun eğimini, KESİŞİM (INTERCEPT) y eksenini kestiği noktayı verir. Örnek: Y değerleri B1:B20, X değerleri A1:A20 ise =EĞİM(B1:B20;A1:A20) ve =KESİŞİM(B1:B20;A1:A20). R² için =PEARSON(A:A;B:A)^2 veya DOĞRUSAL (LINEST) ile daha detaylı çıktı alabilirsiniz."
              />
            </>
          }
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">X ve Y değerleri (her satırda iki sayı — Tab veya ; ile)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"1\t10\n2\t20\n3\t22\n4\t28\n5\t35"}
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
          <div className="space-y-3">
            <div className="rounded-lg border p-4 bg-white font-mono text-sm" style={{ borderColor: THEME.ribbon }}>
              <strong>Y = {result.a.toFixed(4)} + {result.b.toFixed(4)} · X</strong>
            </div>
            <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">Kesişim (a)</td>
                    <td className="px-3 py-2 text-right tabular-nums">{result.a.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">Eğim (b)</td>
                    <td className="px-3 py-2 text-right tabular-nums">{result.b.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                  <tr className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">R² (belirleme katsayısı)</td>
                    <td className="px-3 py-2 text-right tabular-nums">{result.r2.toLocaleString("tr-TR", { maximumFractionDigits: 4 })}</td>
                  </tr>
                  <tr style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">Çift sayısı (n)</td>
                    <td className="px-3 py-2 text-right">{result.n}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">R² 0–1 arası; 1'e yakın = doğrusal ilişki güçlü.</p>
          </div>
        )}
        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/basit-regresyon" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · İstatistik araçları</div>
      </div>
    </div>
  );
}
