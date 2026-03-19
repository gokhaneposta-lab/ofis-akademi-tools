"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

type Mod = "x_yuzde" | "a_b_yuzde";

export default function YuzdeHesaplamaPage() {
  const [mod, setMod] = useState<Mod>("x_yuzde");
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const a = parseFloat(val1.replace(/\s/g, "").replace(",", "."));
    const b = parseFloat(val2.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(a) || Number.isNaN(b)) {
      setResult("");
      return;
    }

    let line: string;
    if (mod === "x_yuzde") {
      const sonuc = (a * b) / 100;
      line = `${a.toLocaleString("tr-TR")} sayısının %${b.toLocaleString("tr-TR")}'si = ${sonuc.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      if (b === 0) {
        setResult("B sıfır olamaz (yüzde payda).");
        setCopied(false);
        return;
      }
      const yuzde = (a / b) * 100;
      line = `${a.toLocaleString("tr-TR")}, ${b.toLocaleString("tr-TR")} sayısının %${yuzde.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}'idir`;
    }
    setResult(line);
    setCopied(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Yüzde Hesaplama"
        description="X'in Y%'si kaç? A, B'nin yüzde kaçı? KDV, komisyon, kar marjı ve oran hesaplamaları için."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Hesaplama türünü seçin: X'in Y%'si kaç? veya A, B'nin yüzde kaçı?",
            "İki değeri girin (virgül veya nokta ondalık ayracı).",
            "Hesapla butonuna tıklayın; sonucu kopyalayabilirsiniz.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de yüzde hesaplama: bir sayının yüzde kaçı, veya iki sayıdan birinin diğerinin yüzde kaçı olduğu formülle bulunur.
              </p>
              <ExcelFormulBlok
                baslik="X'in Y%'si kaç (örn. KDV, komisyon):"
                formül="=A1*B1/100"
                aciklama="A1 ana sayı, B1 yüzde oranı (örn. 18 KDV için). Sonuç = sayı × oran / 100. Örnek: 1000 TL'nin %18'i = 1000*18/100 = 180."
              />
              <ExcelFormulBlok
                baslik="A, B'nin yüzde kaçı:"
                formül="=A1/B1*100"
                aciklama="İki değerin oranını yüzde olarak bulmak için: A1/B1*100. Örnek: 50, 200'ün %25'idir (50/200*100 = 25). B1 sıfır olmamalı."
              />
            </>
          }
        />
        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Yüzde hesaplarını hızlı ve hatasız yapar. KDV, indirim, komisyon, kar marjı ve oran karşılaştırmalarında günlük ofis işini hızlandırır.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">X = 1.000, Y = 18</p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">1.000 sayısının %18&apos;i = 180,00</p>
            </div>
          </div>
        </section>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Hesaplama türü</span>
          <div className="inline-flex rounded-lg border p-1 gap-1" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
            <button
              type="button"
              onClick={() => setMod("x_yuzde")}
              className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${mod === "x_yuzde" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
              style={mod === "x_yuzde" ? { background: THEME.ribbon } : undefined}
            >
              X'in Y%'si kaç?
            </button>
            <button
              type="button"
              onClick={() => setMod("a_b_yuzde")}
              className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${mod === "a_b_yuzde" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
              style={mod === "a_b_yuzde" ? { background: THEME.ribbon } : undefined}
            >
              A, B'nin yüzde kaçı?
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {mod === "x_yuzde" ? "Sayı (X)" : "Pay (A)"}
            </label>
            <input
              type="text"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              placeholder={mod === "x_yuzde" ? "1000" : "250"}
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {mod === "x_yuzde" ? "Yüzde (Y)" : "Tüm (B)"}
            </label>
            <input
              type="text"
              value={val2}
              onChange={(e) => setVal2(e.target.value)}
              placeholder={mod === "x_yuzde" ? "18" : "1000"}
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleHesapla}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Hesapla
          </button>
          <CopyButton onClick={handleCopy} disabled={!result} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
        </div>

        {result && (
          <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-sm font-medium text-gray-800">{result}</div>
          </div>
        )}

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Virgül ile sayı girebilir miyim?</span><br />Evet. Araç virgül veya nokta ile ondalık sayı girişini destekler.</p>
            <p><span className="font-semibold text-gray-900">A, B&apos;nin yüzde kaçı hesabı ne zaman kullanılır?</span><br />Bir değerin toplam içindeki payını bulmak istediğinizde bu modu kullanın.</p>
            <p><span className="font-semibold text-gray-900">Sonucu Excel&apos;e taşıyabilir miyim?</span><br />Evet. “Sonucu Kopyala” ile metni doğrudan Excel&apos;e yapıştırabilirsiniz.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/temel" className="underline" style={{ color: THEME.ribbon }}>
              temel eğitim
            </Link>
            {" "}ve{" "}
            <Link href="/blog/excelde-yuzde-hesaplama" className="underline" style={{ color: THEME.ribbon }}>
              yüzde rehberi
            </Link>
            {" "}sayfasına göz atın.
          </div>
        </section>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/yuzde-hesaplama" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
