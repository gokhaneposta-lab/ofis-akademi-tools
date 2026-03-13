"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-3 py-10 sm:px-4 sm:py-12">
      <div className="w-full max-w-4xl rounded-2xl bg-slate-900/90 backdrop-blur border border-slate-800 shadow-xl shadow-emerald-900/30 p-6 sm:p-8 flex flex-col gap-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-300 tracking-tight mb-1">
            CSV Ayırıcı
          </h1>
          <p className="text-slate-400 text-sm sm:text-[0.9rem]">
            CSV metnini satır ve sütunlara ayırın. Ayırıcıyı otomatik algılar veya elle
            seçebilirsiniz. Birden fazla satırı destekler.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Ayırıcı
            </span>
            <div className="inline-flex rounded-full bg-slate-800/80 border border-slate-700 p-1 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setSeparatorMode("auto")}
                className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                  separatorMode === "auto"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Otomatik Algıla
              </button>
              <button
                type="button"
                onClick={() => setSeparatorMode("comma")}
                className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                  separatorMode === "comma"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Virgül ,
              </button>
              <button
                type="button"
                onClick={() => setSeparatorMode("semicolon")}
                className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                  separatorMode === "semicolon"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Noktalı Virgül ;
              </button>
              <button
                type="button"
                onClick={() => setSeparatorMode("tab")}
                className={`flex-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${
                  separatorMode === "tab"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Tab
              </button>
            </div>
          </div>

          {separatorMode === "auto" && detectedSeparator && (
            <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/40 rounded-lg px-3 py-2">
              Algılanan ayırıcı:{" "}
              <span className="font-semibold">
                {getSeparatorLabel(detectedSeparator)}
              </span>
            </div>
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={`Örn:\nAli;25;İstanbul\nAyşe;30;Ankara\n\nveya\n\nAli,25,İstanbul\nAyşe,30,Ankara`}
          className="w-full rounded-xl bg-slate-900/80 text-slate-50 border border-slate-700 focus:border-emerald-400 focus:ring-emerald-400/60 focus:ring-2 outline-none p-4 text-sm resize-y transition placeholder:text-slate-500"
        />

        <div className="flex flex-col gap-3 sm:flex-row items-stretch">
          <button
            onClick={handleSplit}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/40 rounded-lg px-3 py-2 inline-block">
                Sonuçlar Excel için panoya kopyalandı. Ctrl+V ile yapıştırabilirsiniz.
              </div>
            )}
            {copyStatus === "error" && (
              <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2 inline-block">
                Panoya kopyalama sırasında bir hata oluştu. Tarayıcı izinlerini kontrol edin.
              </div>
            )}
            <div className="overflow-x-auto rounded-lg border border-slate-600 bg-slate-950/70 shadow-inner">
              <table className="w-full text-left min-w-[270px] border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider bg-slate-700 text-white font-semibold border-b border-slate-600">
                    {Array.from({ length: maxCols }).map((_, i) => (
                      <th key={i} className="py-3 px-4">
                        Sütun {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`${
                        rowIndex % 2 === 0 ? "bg-slate-800" : "bg-slate-900"
                      } border-b border-slate-600`}
                    >
                      {Array.from({ length: maxCols }).map((_, colIndex) => (
                        <td
                          key={colIndex}
                          className="py-3 px-4 text-sm text-slate-100 whitespace-pre border-r border-slate-600 last:border-r-0"
                        >
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

        <div className="text-xs text-slate-500 mt-1">
          Ofis Akademi · Excel &amp; Veri Analizi
        </div>
      </div>
    </div>
  );
}

