"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

type SeparatorMode = "auto" | "comma" | "semicolon" | "tab";

export default function CsvAyirici() {
  const [input, setInput] = useState("");
  const [separatorMode, setSeparatorMode] = useState<SeparatorMode>("auto");
  const [detectedSeparator, setDetectedSeparator] = useState<SeparatorMode | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  function detectSeparator(lines: string[]): SeparatorMode | null {
    const firstNonEmpty = lines.find((l) => l.trim().length > 0);
    if (!firstNonEmpty) return null;

    const candidates: { mode: SeparatorMode; char: string }[] = [
      { mode: "comma", char: "," },
      { mode: "semicolon", char: ";" },
      { mode: "tab", char: "\t" },
    ];

    let best: SeparatorMode | null = null;
    let bestCount = 0;

    for (const c of candidates) {
      const count = firstNonEmpty.split(c.char).length - 1;
      if (count > bestCount) {
        bestCount = count;
        best = c.mode;
      }
    }

    return bestCount > 0 ? best : null;
  }

  function getSeparatorChar(mode: SeparatorMode): string {
    if (mode === "comma") return ",";
    if (mode === "semicolon") return ";";
    if (mode === "tab") return "\t";
    return ",";
  }

  function handleSplit() {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (!lines.length) {
      setRows([]);
      setDetectedSeparator(null);
      return;
    }

    let effectiveMode = separatorMode;

    if (separatorMode === "auto") {
      const detected = detectSeparator(lines);
      effectiveMode = detected ?? "comma";
      setDetectedSeparator(detected);
    } else {
      setDetectedSeparator(null);
    }

    const sepChar = getSeparatorChar(effectiveMode);

    const parsedRows = lines.map((line) =>
      line.split(sepChar).map((cell) => cell.trim())
    );

    setRows(parsedRows);
    setCopyStatus("idle");
  }

  const maxCols = rows.reduce((max, r) => Math.max(max, r.length), 0);

  async function handleCopyResults() {
    if (!rows.length) return;

    const excelText = rows.map((row) => row.join("\t")).join("\n");

    try {
      await navigator.clipboard.writeText(excelText);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 1300);
    } catch (error) {
      setCopyStatus("error");
      console.error("Panoya kopyalanamadı:", error);
    }
  }

  function getSeparatorLabel(mode: SeparatorMode | null): string {
    if (!mode) return "";
    if (mode === "comma") return "Virgül (,)";
    if (mode === "semicolon") return "Noktalı virgül (;)";
    if (mode === "tab") return "Sekme (Tab)";
    return "Otomatik";
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="CSV Ayırıcı — Ücretsiz Excel Aracı"
        description="CSV metnini satır ve sütunlara ayırın. Virgül, noktalı virgül veya tab ayırıcıyı otomatik algılar. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/csv-ayir"
        keywords={["csv ayırma", "CSV sütunlara ayır", "Excel CSV", "veri ayırma", "Excel araçları"]}
      />
      <PageRibbon
        title="CSV Ayırıcı"
        description="CSV metnini satır ve sütunlara ayırın. Ayırıcıyı otomatik algılar veya elle seçebilirsiniz."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-4xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "CSV metnini veya Excel'den kopyaladığınız hücreleri aşağıdaki kutuya yapıştırın.",
            "Ayırıcı otomatik algılanır; isterseniz virgül, noktalı virgül veya sekme seçin.",
            "Tablo göründükten sonra Sonucu Kopyala ile alıp Excel'e yapıştırın.",
          ]}
          excelAlternatif={<>Excel&apos;de CSV&apos;yi sütunlara ayırmak için <strong>Veri</strong> sekmesinden <strong>Metni Sütunlara Dönüştür</strong> sihirbazını kullanabilirsiniz.</>}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
              Ayırıcı
            </span>
            <div className="inline-flex rounded-lg border p-1 gap-1 w-full sm:w-auto" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
              {(["auto", "comma", "semicolon", "tab"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSeparatorMode(mode)}
                  className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                    separatorMode === mode
                      ? "text-white"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                  style={separatorMode === mode ? { background: THEME.ribbon } : undefined}
                >
                  {mode === "auto" ? "Otomatik Algıla" : mode === "comma" ? "Virgül ," : mode === "semicolon" ? "Noktalı Virgül ;" : "Tab"}
                </button>
              ))}
            </div>
          </div>

          {separatorMode === "auto" && detectedSeparator && (
            <div className="text-xs text-gray-700 rounded-lg px-3 py-2 border" style={{ background: "#f0f7f4", borderColor: THEME.ribbon }}>
              Algılanan ayırıcı: <span className="font-semibold">{getSeparatorLabel(detectedSeparator)}</span>
            </div>
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={`Örn:\nAli;25;İstanbul\nAyşe;30;Ankara\n\nveya\n\nAli,25,İstanbul\nAyşe,30,Ankara`}
          className="w-full rounded-lg border p-4 text-sm resize-y transition placeholder:text-gray-400 bg-white"
          style={{ borderColor: THEME.gridLine }}
        />

        <div className="flex flex-col gap-3 sm:flex-row items-stretch">
          <button
            onClick={handleSplit}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Ayır
          </button>
          <CopyButton
            onClick={handleCopyResults}
            disabled={rows.length === 0}
            copied={copyStatus === "success"}
            label="Sonuçları Kopyala (Excel)"
            copiedLabel="Kopyalandı"
          />
        </div>

        {rows.length > 0 && (
          <div className="mt-3 space-y-2">
            {copyStatus === "success" && (
              <div className="text-xs text-gray-700 rounded-lg px-3 py-2 inline-block border" style={{ background: "#f0f7f4", borderColor: THEME.ribbon }}>
                Sonuçlar Excel için panoya kopyalandı. Ctrl+V ile yapıştırabilirsiniz.
              </div>
            )}
            {copyStatus === "error" && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 inline-block">
                Panoya kopyalama sırasında bir hata oluştu. Tarayıcı izinlerini kontrol edin.
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border shadow-inner" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <table className="w-full text-left min-w-[270px] border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider font-semibold border-b text-gray-700" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                    {Array.from({ length: maxCols }).map((_, i) => (
                      <th key={i} className="py-3 px-4">Sütun {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="border-b text-gray-900"
                      style={{ borderColor: THEME.gridLine, background: rowIndex % 2 === 0 ? THEME.sheetBg : THEME.headerBg }}
                    >
                      {Array.from({ length: maxCols }).map((_, colIndex) => (
                        <td key={colIndex} className="py-3 px-4 text-sm whitespace-pre border-r last:border-r-0" style={{ borderColor: THEME.gridLine }}>
                          {row[colIndex] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/csv-ayir" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel &amp; Veri Analizi</div>
      </div>
    </div>
  );
}

