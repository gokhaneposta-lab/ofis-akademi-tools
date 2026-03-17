"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

export default function TekrarlananlariKaldirPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);

  function handleRemove() {
    let lines = input.split(/\r?\n/);
    if (trimLines) lines = lines.map((l) => l.trim());
    lines = lines.filter((l) => l.length > 0);

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(line);
    }

    setResult(unique.join("\n"));
    setCopied(false);
  }

  const inputCount = input.split(/\r?\n/).filter((l) => trimLines ? l.trim() : l).length;
  const resultCount = result ? result.split(/\n/).filter(Boolean).length : 0;
  const removedCount = inputCount - resultCount;

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
        title="Tekrarlananları Kaldır"
        description="Listedeki tekrar eden satırları kaldırın. E-posta, TC, telefon listelerini temizleyip benzersiz satırlara dönüştürün."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Excel veya başka bir listeden satırları kopyalayıp aşağıdaki kutuya yapıştırın (her satırda bir değer).",
            "İsterseniz seçenekleri ayarlayın: baştaki/sondaki boşlukları temizle, büyük/küçük harf duyarlı.",
            "Tekrarları Kaldır butonuna tıklayın.",
            "Oluşan benzersiz listeyi Sonucu Kopyala ile alıp tekrar Excel'e yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de tekrar eden satırları kaldırmak için <strong>Veri</strong> sekmesinden <strong>Yinelenenleri Kaldır</strong> kullanabilirsiniz: veriyi seçin → Veri → Yinelenenleri Kaldır → Hangi sütunlara göre kaldırılacağını seçin → Tamam. Tüm satır aynıysa tekrar sayılır.
              </p>
              <ExcelFormulBlok
                baslik="Tek sütunda benzersiz liste (Excel 365):"
                formül="=BENZERSİZ(A:A)"
                aciklama="BENZERSİZ (İngilizce: UNIQUE) fonksiyonu bir aralıktaki yinelenen değerleri kaldırıp yalnızca benzersiz değerleri döndürür. A:A yerine kendi sütun aralığınızı yazın. Sonuç dinamik bir liste olarak aşağıya doğru dolar; yeni benzersiz değer eklendiğinde liste kendini günceller."
              />
            </>
          }
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Seçenekler</span>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400"
                style={{ accentColor: THEME.ribbon }}
              />
              Baştaki ve sondaki boşlukları temizle
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400"
                style={{ accentColor: THEME.ribbon }}
              />
              Büyük/küçük harf duyarlı (A ≠ a)
            </label>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Her satıra bir değer yazın veya yapıştırın...&#10;ornek@mail.com&#10;ornek@mail.com&#10;farkli@mail.com"
          className="w-full rounded-lg border p-4 text-sm resize-y placeholder:text-gray-400 bg-white"
          style={{ borderColor: THEME.gridLine }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleRemove}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Tekrarları Kaldır
          </button>
          <CopyButton
            onClick={handleCopy}
            disabled={!result}
            copied={copied}
            label="Sonucu Kopyala"
            copiedLabel="Kopyalandı"
          />
        </div>

        {resultCount > 0 && (
          <p className="text-xs text-gray-600">
            {inputCount} satır → <strong>{resultCount}</strong> benzersiz
            {removedCount > 0 && <> · <strong>{removedCount}</strong> tekrar kaldırıldı</>}
          </p>
        )}

        {result && (
          <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs font-semibold text-gray-700 mb-2">Benzersiz liste:</div>
            <textarea
              readOnly
              value={result}
              rows={6}
              className="w-full rounded border p-3 text-sm resize-y bg-gray-50"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        )}

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/tekrarlananlari-kaldir" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
