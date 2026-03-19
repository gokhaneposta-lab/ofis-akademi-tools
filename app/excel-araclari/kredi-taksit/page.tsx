"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

export default function KrediTaksitPage() {
  const [anapara, setAnapara] = useState("");
  const [yillikFaiz, setYillikFaiz] = useState("");
  const [vadeAy, setVadeAy] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const P = parseFloat(anapara.replace(/\s/g, "").replace(",", "."));
    const rYillik = parseFloat(yillikFaiz.replace(",", ".")) / 100;
    const n = parseInt(vadeAy.replace(/\s/g, ""), 10);
    const r = rYillik / 12;

    if (Number.isNaN(P) || Number.isNaN(rYillik) || Number.isNaN(n) || P <= 0 || n <= 0) {
      setResult("");
      return;
    }

    let aylikTaksit: number;
    if (r === 0) aylikTaksit = P / n;
    else aylikTaksit = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const toplamGeri = aylikTaksit * n;
    const toplamFaiz = toplamGeri - P;

    const lines = [
      "Kredi tutarı (₺)\t" + P.toLocaleString("tr-TR", { minimumFractionDigits: 2 }),
      "Yıllık faiz oranı (%)\t" + (rYillik * 100).toLocaleString("tr-TR"),
      "Vade (ay)\t" + n,
      "",
      "Aylık taksit (₺)\t" + aylikTaksit.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Toplam geri ödeme (₺)\t" + toplamGeri.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Toplam faiz (₺)\t" + toplamFaiz.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ];
    setResult(lines.join("\n"));
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
        title="Kredi Taksit Hesaplama"
        description="Kredi tutarı, yıllık faiz oranı ve vadeye göre aylık taksit tutarını hesaplayın. Toplam geri ödeme ve toplam faizi görün."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Kredi tutarı (₺), yıllık faiz oranı (%) ve vade (ay) girin.",
            "Hesapla butonuna tıklayın.",
            "Aylık taksit, toplam geri ödeme ve toplam faiz görünür; Sonucu Kopyala ile alabilirsiniz.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de sabit taksitli kredi için aylık ödeme tutarını DEVRESEL_ÖDEME (PMT) fonksiyonu ile hesaplayabilirsiniz.
              </p>
              <ExcelFormulBlok
                baslik="Aylık taksit tutarı için:"
                formül="=DEVRESEL_ÖDEME(yıllık_faiz/12;vade_ay;-kredi_tutarı)"
                aciklama="DEVRESEL_ÖDEME (İngilizce: PMT) üç ana parametre alır: dönemlik faiz oranı (yıllık oranı 12'ye bölün), toplam taksit sayısı (vade ay), kredi tutarı (negatif yazılır -pv). Sonuç aylık eşit taksit tutarıdır. Toplam geri ödeme = taksit × vade; toplam faiz = toplam geri ödeme - kredi tutarı."
              />
            </>
          }
        />
        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Kredi taksitini ve toplam maliyeti anında hesaplar. Farklı banka tekliflerini karşılaştırırken gerçek geri ödeme yükünü net görmenize yardımcı olur.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">Kredi: 100.000 · Faiz: %24 · Vade: 36 ay</p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">Aylık taksit + toplam geri ödeme + toplam faiz</p>
            </div>
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kredi tutarı (₺)</label>
            <input
              type="text"
              value={anapara}
              onChange={(e) => setAnapara(e.target.value)}
              placeholder="100000"
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Yıllık faiz oranı (%)</label>
            <input
              type="text"
              value={yillikFaiz}
              onChange={(e) => setYillikFaiz(e.target.value)}
              placeholder="24"
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vade (ay)</label>
            <input
              type="text"
              value={vadeAy}
              onChange={(e) => setVadeAy(e.target.value)}
              placeholder="36"
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
            <div className="text-xs font-semibold text-gray-700 mb-2">Sonuç:</div>
            <textarea readOnly value={result} rows={10} className="w-full rounded border p-3 text-sm resize-y bg-gray-50 font-mono" style={{ borderColor: THEME.gridLine }} />
          </div>
        )}

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Faiz oranı yıllık mı girilmeli?</span><br />Evet, yıllık faiz oranını girin; araç bunu aylık döneme çevirerek hesaplar.</p>
            <p><span className="font-semibold text-gray-900">Vade ay dışında girilebilir mi?</span><br />Bu hesaplayıcı vadeyi ay bazında ister. Örneğin 5 yıl için 60 ay girmelisiniz.</p>
            <p><span className="font-semibold text-gray-900">Toplam faiz nasıl hesaplanır?</span><br />Toplam geri ödeme ile anapara farkı olarak gösterilir.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/orta" className="underline" style={{ color: THEME.ribbon }}>
              orta seviye eğitim
            </Link>
            {" "}ve{" "}
            <Link href="/blog/excelde-kredi-taksit-hesaplama" className="underline" style={{ color: THEME.ribbon }}>
              kredi taksit rehberi
            </Link>
            {" "}sayfasına bakın.
          </div>
        </section>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/kredi-taksit" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
