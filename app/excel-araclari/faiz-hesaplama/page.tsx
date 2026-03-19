"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

export default function FaizHesaplamaPage() {
  const [anapara, setAnapara] = useState("");
  const [oran, setOran] = useState("");
  const [sure, setSure] = useState("");
  const [sureBirim, setSureBirim] = useState<"yil" | "ay">("yil");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const P = parseFloat(anapara.replace(/\s/g, "").replace(",", "."));
    const r = parseFloat(oran.replace(",", ".")) / 100;
    const t = parseFloat(sure.replace(",", "."));
    const tYil = sureBirim === "ay" ? t / 12 : t;

    if (Number.isNaN(P) || Number.isNaN(r) || Number.isNaN(t) || P <= 0 || t <= 0) {
      setResult("");
      return;
    }

    const basitFaiz = P * r * tYil;
    const bilesikToplam = P * Math.pow(1 + r, tYil);
    const bilesikFaiz = bilesikToplam - P;

    const satir = (label: string, val: number) => `${label}\t${val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const lines = [
      "Anapara (₺)\t" + P.toLocaleString("tr-TR", { minimumFractionDigits: 2 }),
      "Yıllık faiz oranı (%)\t" + (r * 100).toLocaleString("tr-TR"),
      "Süre\t" + t + " " + (sureBirim === "ay" ? "ay" : "yıl"),
      "",
      "Basit faiz tutarı\t" + basitFaiz.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Basit faiz sonrası toplam\t" + (P + basitFaiz).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "",
      "Bileşik faiz tutarı\t" + bilesikFaiz.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Bileşik faiz sonrası toplam\t" + bilesikToplam.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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
        title="Faiz Hesaplama"
        description="Basit ve bileşik faiz hesaplayın. Anapara, yıllık faiz oranı ve süre ile faiz tutarını ve toplam getiriyi görün."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Anapara (₺), yıllık faiz oranı (%) ve süreyi girin; süreyi yıl veya ay seçin.",
            "Hesapla butonuna tıklayın.",
            "Basit ve bileşik faiz tutarları ile toplam getiri görünür; Sonucu Kopyala ile alabilirsiniz.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de basit faiz ve bileşik faiz hesaplamak için aşağıdaki formülleri kullanabilirsiniz.
              </p>
              <ExcelFormulBlok
                baslik="Basit faiz tutarı için:"
                formül="=Anapara*Oran*Süre"
                aciklama="Basit faizde faiz tutarı = anapara × yıllık oran × süre (yıl). Örnek: 10000 TL, %10, 2 yıl → 10000*0,1*2 = 2000 TL faiz. Oran ondalık (0,1) veya yüzde hücre referansı olabilir."
              />
              <ExcelFormulBlok
                baslik="Bileşik faiz — toplam gelecek değer:"
                formül="=GELECEK_DEĞER(oran;dönem_sayısı;;-anapara)"
                aciklama="GELECEK_DEĞER (FV) dönemlik bileşik faizle anaparanın ulaşacağı toplam tutarı verir. oran dönemlik (yıllık %12 ise aylık 0,01), dönem_sayısı toplam dönem. Sadece faiz tutarı için toplam değerden anaparayı çıkarın. FAIZ fonksiyonu da belirli dönemdeki faizi verir."
              />
            </>
          }
        />
        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Basit ve bileşik faiz hesaplarını tek ekranda verir. Yatırım, teklif karşılaştırma ve finansal planlama sırasında doğru faiz etkisini hızlıca görmenizi sağlar.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">Anapara: 10.000 · Oran: %12 · Süre: 2 yıl</p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">Basit faiz: 2.400 · Bileşik toplam: 12.544</p>
            </div>
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Anapara (₺)</label>
            <input
              type="text"
              value={anapara}
              onChange={(e) => setAnapara(e.target.value)}
              placeholder="10000"
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Yıllık faiz oranı (%)</label>
            <input
              type="text"
              value={oran}
              onChange={(e) => setOran(e.target.value)}
              placeholder="12"
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Süre</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sure}
                onChange={(e) => setSure(e.target.value)}
                placeholder="1"
                className="flex-1 rounded-lg border p-3 text-sm bg-white"
                style={{ borderColor: THEME.gridLine }}
              />
              <select
                value={sureBirim}
                onChange={(e) => setSureBirim(e.target.value as "yil" | "ay")}
                className="rounded-lg border p-3 text-sm bg-white"
                style={{ borderColor: THEME.gridLine }}
              >
                <option value="yil">Yıl</option>
                <option value="ay">Ay</option>
              </select>
            </div>
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
            <textarea readOnly value={result} rows={12} className="w-full rounded border p-3 text-sm resize-y bg-gray-50 font-mono" style={{ borderColor: THEME.gridLine }} />
          </div>
        )}

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Ay seçince hesaplama nasıl yapılır?</span><br />Araç ay değerini otomatik olarak yıla çevirip faiz hesabını buna göre yapar.</p>
            <p><span className="font-semibold text-gray-900">Basit ve bileşik faiz farkı nedir?</span><br />Basit faizde faiz sadece anaparaya işler, bileşik faizde biriken faiz de faiz üretir.</p>
            <p><span className="font-semibold text-gray-900">Sonucu rapora alabilir miyim?</span><br />Evet. Çıktıyı kopyalayıp Excel raporunuza yapıştırabilirsiniz.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/orta" className="underline" style={{ color: THEME.ribbon }}>
              orta seviye eğitim
            </Link>
            {" "}ve{" "}
            <Link href="/blog/excelde-faiz-hesaplama" className="underline" style={{ color: THEME.ribbon }}>
              faiz rehberi
            </Link>
            {" "}sayfasına bakın.
          </div>
        </section>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/faiz-hesaplama" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
