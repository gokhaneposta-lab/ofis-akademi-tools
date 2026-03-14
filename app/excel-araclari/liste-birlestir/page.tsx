"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

type DelimiterOption = "semicolon" | "comma" | "pipe" | "space" | "newline" | "custom";

export default function ListeBirlestirici() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterOption>("semicolon");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [result, setResult] = useState("");
  const [lineCount, setLineCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sqlInFormat, setSqlInFormat] = useState(false);

  function handleJoin() {
    const lines = input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setLineCount(lines.length);

    if (!lines.length) {
      setResult("");
      setCopied(false);
      return;
    }

    let joined: string;

    if (sqlInFormat) {
      const inner = lines.join(",");
      joined = `IN (${inner})`;
    } else {
      let sep = ";";
      switch (delimiter) {
        case "comma":
          sep = ",";
          break;
        case "pipe":
          sep = "|";
          break;
        case "space":
          sep = " ";
          break;
        case "newline":
          sep = "\n";
          break;
        case "custom":
          sep = customDelimiter;
          break;
        case "semicolon":
        default:
          sep = ";";
      }
      joined = lines.join(sep);
    }

    setResult(joined);
    setCopied(false);
  }

  async function handleCopy() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (error) {
      console.error("Panoya kopyalanamadı:", error);
    }
  }

  const processedInfo =
    lineCount > 0 ? `${lineCount} satır işlendi` : "Henüz satır işlenmedi";

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Liste Birleştirici"
        description="Birden fazla satırdaki değerleri seçtiğiniz ayraç ile tek satırda birleştirin. ID, TC, telefon listelerini SQL veya Excel için hazırlayın."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Ayraç</span>
            <div className="inline-flex flex-wrap rounded-lg border p-1 gap-1" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
              <button type="button" onClick={() => setDelimiter("semicolon")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "semicolon" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "semicolon" ? { background: THEME.ribbon } : undefined}>Noktalı Virgül ;</button>
              <button type="button" onClick={() => setDelimiter("comma")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "comma" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "comma" ? { background: THEME.ribbon } : undefined}>Virgül ,</button>
              <button type="button" onClick={() => setDelimiter("pipe")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "pipe" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "pipe" ? { background: THEME.ribbon } : undefined}>Dikey Çizgi |</button>
              <button type="button" onClick={() => setDelimiter("space")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "space" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "space" ? { background: THEME.ribbon } : undefined}>Boşluk</button>
              <button type="button" onClick={() => setDelimiter("newline")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "newline" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "newline" ? { background: THEME.ribbon } : undefined}>Yeni Satır</button>
              <button type="button" onClick={() => setDelimiter("custom")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "custom" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "custom" ? { background: THEME.ribbon } : undefined}>Özel</button>
            </div>
            {delimiter === "custom" && (
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => setCustomDelimiter(e.target.value)}
                placeholder="Özel ayraç (örn: || veya -)"
                className="mt-1 h-9 w-full rounded border px-3 text-xs bg-white placeholder:text-gray-400"
                style={{ borderColor: THEME.gridLine }}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sqlInFormat}
                onChange={(e) => setSqlInFormat(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400 text-[#217346] focus:ring-[#217346]"
                style={{ borderColor: THEME.gridLine }}
              />
              <span className="font-medium">SQL IN formatı</span>
            </label>
            {sqlInFormat && (
              <p className="text-[11px] text-gray-600">
                Bu modda değerler virgül ile birleştirilir ve <span className="font-semibold text-gray-800">IN (...)</span> şeklinde sarılır.
              </p>
            )}
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={`Örn:\n12345678901\n23456789012\n34567890123`}
          className="w-full rounded-lg border p-4 text-sm resize-y transition placeholder:text-gray-400 bg-white"
          style={{ borderColor: THEME.gridLine }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              onClick={handleJoin}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: THEME.ribbon }}
            >
              Birleştir
            </button>
            <CopyButton
              onClick={handleCopy}
              disabled={!result}
              copied={copied}
              label="Sonucu Kopyala"
              copiedLabel="Kopyalandı"
            />
          </div>
          <div className="text-xs text-gray-500">{processedInfo}</div>
        </div>

        {result && (
          <div className="mt-2 rounded-lg border p-4 sm:p-5 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">Birleştirilmiş sonuç:</div>
            <textarea
              readOnly
              value={result}
              rows={sqlInFormat ? 3 : 4}
              className="w-full rounded border p-3 text-xs sm:text-sm resize-y bg-gray-50"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        )}

        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel &amp; Veri Analizi</div>
      </div>
    </div>
  );
}
