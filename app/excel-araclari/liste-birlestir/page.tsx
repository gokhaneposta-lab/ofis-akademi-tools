"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-3 py-10 sm:px-4 sm:py-12">
      <div className="w-full max-w-3xl rounded-2xl bg-slate-900/90 backdrop-blur border border-slate-800 shadow-xl shadow-emerald-900/30 p-6 sm:p-8 flex flex-col gap-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-emerald-300 tracking-tight mb-1">
            Liste Birleştirici
          </h1>
          <p className="text-slate-400 text-sm sm:text-[0.9rem]">
            Birden fazla satırdaki değerleri seçtiğiniz ayraç ile tek satırda
            birleştirin. Örneğin ID, TC, telefon listelerini SQL veya Excel
            için hızla hazırlayın.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Ayraç
            </span>
            <div className="inline-flex flex-wrap rounded-full bg-slate-800/80 border border-slate-700 p-1 gap-1">
              <button
                type="button"
                onClick={() => setDelimiter("semicolon")}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                  delimiter === "semicolon"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Noktalı Virgül ;
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("comma")}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                  delimiter === "comma"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Virgül ,
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("pipe")}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                  delimiter === "pipe"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Dikey Çizgi |
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("space")}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                  delimiter === "space"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Boşluk
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("newline")}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                  delimiter === "newline"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Yeni Satır
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("custom")}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition ${
                  delimiter === "custom"
                    ? "bg-emerald-400 text-slate-950 shadow shadow-emerald-500/30"
                    : "text-slate-300 hover:text-emerald-300"
                }`}
              >
                Özel
              </button>
            </div>
            {delimiter === "custom" && (
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => setCustomDelimiter(e.target.value)}
                placeholder="Özel ayraç (örn: || veya -)"
                className="mt-1 h-9 w-full rounded-full border border-slate-700 bg-slate-900 px-3 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-200">
              <input
                type="checkbox"
                checked={sqlInFormat}
                onChange={(e) => setSqlInFormat(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-emerald-400 focus:ring-emerald-500"
              />
              <span className="font-medium">SQL IN formatı</span>
            </label>
            {sqlInFormat && (
              <p className="text-[11px] text-slate-400">
                Bu modda değerler her zaman virgül ile birleştirilir ve{" "}
                <span className="text-emerald-300 font-semibold">IN (...)</span>{" "}
                şeklinde sarılır.
              </p>
            )}
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={`Örn:\n12345678901\n23456789012\n34567890123`}
          className="w-full rounded-xl bg-slate-900/80 text-slate-50 border border-slate-700 focus:border-emerald-400 focus:ring-emerald-400/60 focus:ring-2 outline-none p-4 text-sm resize-y transition placeholder:text-slate-500"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              onClick={handleJoin}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/30 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          <div className="text-xs text-slate-400">{processedInfo}</div>
        </div>

        {result && (
          <div className="mt-2 rounded-xl border border-emerald-500/40 bg-slate-900 shadow-lg shadow-emerald-900/40 p-4 sm:p-5">
            <div className="text-xs sm:text-sm font-semibold text-emerald-300 mb-2">
              Birleştirilmiş sonuç:
            </div>
            <textarea
              readOnly
              value={result}
              rows={sqlInFormat ? 3 : 4}
              className="w-full rounded-lg bg-slate-950/90 text-slate-50 border border-slate-800 focus:outline-none p-3 text-xs sm:text-sm resize-y"
            />
          </div>
        )}

        <div className="text-xs text-slate-500 mt-1">
          Ofis Akademi · Excel &amp; Veri Analizi
        </div>
      </div>
    </div>
  );
}
