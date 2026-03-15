"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

type Delimiter = "tab" | "comma" | "semicolon";

export default function TranspozPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [delimiter, setDelimiter] = useState<Delimiter>("tab");

  function getSep(): string {
    if (delimiter === "tab") return "\t";
    if (delimiter === "comma") return ",";
    return ";";
  }

  function handleTranspose() {
    const sep = getSep();
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) {
      setResult("");
      return;
    }

    const matrix = lines.map((line) => line.split(sep).map((c) => c.trim()));
    const maxCols = Math.max(...matrix.map((row) => row.length));
    const normalized = matrix.map((row) => {
      const r = [...row];
      while (r.length < maxCols) r.push("");
      return r;
    });

    const rows = normalized[0].length;
    const cols = normalized.length;
    const transposed: string[][] = [];
    for (let r = 0; r < rows; r++) {
      transposed[r] = [];
      for (let c = 0; c < cols; c++) {
        transposed[r][c] = normalized[c][r] ?? "";
      }
    }

    const outSep = "\t";
    setResult(transposed.map((row) => row.join(outSep)).join("\n"));
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
        title="Satır / Sütun Döndür (Transpoz)"
        description="Satırları sütunlara, sütunları satırlara dönüştürün. Excel'deki veriyi yapıştırıp transpoz edebilir, sonucu tekrar Excel'e yapıştırabilirsiniz."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Excel'den satırları veya sütunları kopyalayıp aşağıdaki kutuya yapıştırın (Tab ile ayrılmış olmalı).",
            "Girdi ayırıcısını seçin: sekme, virgül veya noktalı virgül.",
            "Döndür butonuna tıklayın.",
            "Sonucu kopyalayıp Excel'e yapıştırın; satırlar sütun, sütunlar satır olacaktır.",
          ]}
          excelAlternatif={<>Excel&apos;de transpoz için veriyi kopyalayıp <strong>Yapıştır</strong> &gt; <strong>Özel Yapıştır</strong> &gt; <strong>Devrik</strong> seçeneğini işaretleyebilirsiniz.</>}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Veri ayırıcı (girdi)</span>
          <div className="inline-flex rounded-lg border p-1 gap-1" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
            <button
              type="button"
              onClick={() => setDelimiter("tab")}
              className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "tab" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
              style={delimiter === "tab" ? { background: THEME.ribbon } : undefined}
            >
              Sekme (Excel yapıştır)
            </button>
            <button
              type="button"
              onClick={() => setDelimiter("comma")}
              className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "comma" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
              style={delimiter === "comma" ? { background: THEME.ribbon } : undefined}
            >
              Virgül
            </button>
            <button
              type="button"
              onClick={() => setDelimiter("semicolon")}
              className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "semicolon" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
              style={delimiter === "semicolon" ? { background: THEME.ribbon } : undefined}
            >
              Noktalı virgül
            </button>
          </div>
          <p className="text-xs text-gray-500">Sonuç her zaman sekme ile (Excel'e yapıştırmaya uygun) verilir.</p>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Excel'den kopyaladığınız veriyi buraya yapıştırın (satırlar ve sütunlar ayırıcıya göre bölünecek)...&#10;İsim	Departman	Puan&#10;Ali	Satış	85&#10;Ayşe	Pazarlama	92"
          className="w-full rounded-lg border p-4 text-sm resize-y placeholder:text-gray-400 bg-white"
          style={{ borderColor: THEME.gridLine }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleTranspose}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Döndür (Transpoz)
          </button>
          <CopyButton
            onClick={handleCopy}
            disabled={!result}
            copied={copied}
            label="Sonucu Kopyala (Excel)"
            copiedLabel="Kopyalandı"
          />
        </div>

        {result && (
          <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs font-semibold text-gray-700 mb-2">Döndürülmüş veri (Excel'e yapıştırabilirsiniz):</div>
            <textarea
              readOnly
              value={result}
              rows={6}
              className="w-full rounded border p-3 text-sm resize-y bg-gray-50 font-mono"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        )}

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/transpoz" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
