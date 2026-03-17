"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

function trimLikeExcel(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n");
}

export default function BoslukTemizlePage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = trimLikeExcel(input);

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
        title="Boşluk Temizle"
        description="Excel başındaki ve sondaki boşlukları siler; metin içi çoklu boşlukları tek boşluğa indirir. Excel TRIM mantığı."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Excel veya başka bir kaynaktan metni kopyalayıp aşağıdaki kutuya yapıştırın.",
            "Metin otomatik temizlenir: her satırın başı/sonu ve ardışık boşluklar tek boşluğa indirilir.",
            "Sonucu kopyalayıp tekrar Excel'e yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de tek hücredeki baştaki ve sondaki boşlukları, ayrıca metin içindeki ardışık boşlukları tek boşluğa indirmek için aşağıdaki formülü kullanabilirsiniz.
              </p>
              <ExcelFormulBlok
                baslik="Tek hücre için:"
                formül="=TRIM(A1)"
                aciklama="TRIM (Türkçe: TEMİZLE) fonksiyonu metnin başındaki ve sonundaki boşlukları siler; kelimeler arasındaki birden fazla boşluğu da tek boşluğa indirir. A1 yerine kendi hücre adresinizi yazın. Tüm sütun için B1'e =TRIM(A1) yazıp aşağı çoğaltabilirsiniz."
              />
            </>
          }
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Metin (yapıştırın)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="  Başta ve sonda boşluklu   metin   buraya..."
            rows={8}
            className="w-full rounded-lg border p-3 text-sm bg-white resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        {input.trim() && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Temizlenmiş metin</label>
              <textarea
                readOnly
                value={result}
                rows={8}
                className="w-full rounded-lg border p-3 text-sm bg-gray-50 resize-y"
                style={{ borderColor: THEME.ribbon }}
              />
            </div>
            <CopyButton onClick={handleCopy} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
          </>
        )}

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/bosluk-temizle" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
