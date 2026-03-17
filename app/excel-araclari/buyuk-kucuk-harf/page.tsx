"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

type CaseMode = "upper" | "lower" | "proper";

function toProper(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

function transformText(text: string, mode: CaseMode): string {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  return text.split(/\r?\n/).map(toProper).join("\n");
}

export default function BuyukKucukHarfPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CaseMode>("upper");
  const [copied, setCopied] = useState(false);

  const result = transformText(input, mode);

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
        title="Büyük / Küçük Harf Dönüştür"
        description="Metni büyük harf, küçük harf veya her kelimenin ilk harfi büyük (Proper) yapın. Excel UPPER, LOWER, PROPER mantığı."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Metni veya Excel'den kopyaladığınız hücreleri aşağıdaki kutuya yapıştırın.",
            "Büyük harf, Küçük harf veya Her kelimenin ilk harfi büyük seçeneğini seçin.",
            "Sonucu kopyalayıp Excel'e yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de metni büyük harf, küçük harf veya her kelimenin ilk harfi büyük (Proper) yapmak için aşağıdaki fonksiyonları kullanabilirsiniz. A1 metnin bulunduğu hücredir.
              </p>
              <ExcelFormulBlok
                baslik="Büyük harf için:"
                formül="=BÜYÜKHARF(A1)"
                aciklama="BÜYÜKHARF (İngilizce: UPPER) fonksiyonu metnin tüm harflerini büyük harfe çevirir. Örneğin 'merhaba' → 'MERHABA'."
              />
              <ExcelFormulBlok
                baslik="Küçük harf için:"
                formül="=KÜÇÜKHARF(A1)"
                aciklama="KÜÇÜKHARF (İngilizce: LOWER) fonksiyonu metnin tüm harflerini küçük harfe çevirir."
              />
              <ExcelFormulBlok
                baslik="Her kelimenin ilk harfi büyük (Proper) için:"
                formül="=YAZIM.DÜZENİ(A1)"
                aciklama="YAZIM.DÜZENİ (İngilizce: PROPER) fonksiyonu her kelimenin ilk harfini büyük, diğerlerini küçük yapar. Örneğin 'excel araçları' → 'Excel Araçları'."
              />
            </>
          }
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Dönüşüm türü</label>
          <div className="inline-flex rounded-lg border p-1 gap-1" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
            {(["upper", "lower", "proper"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded px-4 py-2 text-sm font-medium transition ${mode === m ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
                style={mode === m ? { background: THEME.ribbon } : undefined}
              >
                {m === "upper" ? "Büyük harf" : m === "lower" ? "Küçük harf" : "Her kelimenin ilk harfi büyük"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Metin (yapıştırın)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Buraya metin yapıştırın..."
            rows={8}
            className="w-full rounded-lg border p-3 text-sm bg-white resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>
        {result && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sonuç</label>
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
          <BenzerExcelAraclari currentHref="/excel-araclari/buyuk-kucuk-harf" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
