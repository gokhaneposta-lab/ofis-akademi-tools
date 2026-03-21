"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

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

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Tek sütunda görünen CSV metnini doğru ayırıcıyla sütunlara böler. Satış,
        stok, müşteri ve dış sistemden gelen verileri Excel&apos;e hazırlarken
        hız kazandırır.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">Ali;25;İstanbul</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">Sütun 1: Ali · Sütun 2: 25 · Sütun 3: İstanbul</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="CSV Ayırıcı"
      description="CSV metnini satır ve sütunlara ayırın."
      path="/excel-araclari/csv-ayir"
      keywords={["csv ayırma", "CSV sütunlara ayır", "Excel CSV"]}
      howToSteps={[
        "CSV metnini kutuya yapıştırın.",
        "Ayırıcı otomatik algılanır veya elle seçin.",
        "Tablo göründükten sonra kopyalayın.",
      ]}
      faq={[
        {
          question: "Virgül mü noktalı virgül mü?",
          answer: "Otomatik Algıla modunda araç doğru ayırıcıyı bulur.",
        },
        {
          question: "Büyük listeleri işler mi?",
          answer: "Evet, çok satırlı verileri bölebilirsiniz.",
        },
        {
          question: "Excel'e uygun çıktı?",
          answer: "Kopyala butonu sekmeli format üretir.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <>
          <Link
            href="/egitimler/temel"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Temel Excel eğitimi
          </Link>
          <span className="text-gray-400" aria-hidden>
            ·
          </span>
          <Link
            href="/blog/csv-veriyi-sutunlara-ayirma"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            CSV veriyi sütunlara ayırma
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div
            className="relative mb-4 flex rounded-2xl bg-gray-200/70 p-1"
            translate="no"
          >
            {(
              [
                { mode: "auto" as const, label: "Otomatik" },
                { mode: "comma" as const, label: "Virgül" },
                { mode: "semicolon" as const, label: "Noktalı ;" },
                { mode: "tab" as const, label: "Tab" },
              ] as const
            ).map(({ mode, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSeparatorMode(mode)}
                className={`relative flex-1 rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition sm:text-sm ${
                  separatorMode === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {separatorMode === "auto" && detectedSeparator && (
            <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Algılanan:{" "}
              <strong>{getSeparatorLabel(detectedSeparator)}</strong>
            </div>
          )}

          <label
            htmlFor="csv-ayir-input"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            CSV verisini yapıştırın
          </label>
          <InputTextarea
            id="csv-ayir-input"
            value={input}
            onChange={setInput}
            rows={8}
            minHeight="12rem"
            className="resize-y font-mono text-[14px]"
            placeholder={`Örn:\nAli;25;İstanbul\nAyşe;30;Ankara\n\nveya\n\nAli,25,İstanbul\nAyşe,30,Ankara`}
          />
          <PrimaryButton className="mt-3" onClick={handleSplit}>
            Ayır
          </PrimaryButton>
        </div>

        {rows.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {Array.from({ length: maxCols }).map((_, i) => (
                      <th
                        key={i}
                        className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600 sm:px-4"
                      >
                        Sütun {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`border-b border-gray-100 text-gray-900 ${
                        rowIndex % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                      }`}
                    >
                      {Array.from({ length: maxCols }).map((_, colIndex) => (
                        <td
                          key={colIndex}
                          className="border-r border-gray-100 px-3 py-2.5 text-sm whitespace-pre last:border-r-0 sm:px-4"
                        >
                          {row[colIndex] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-[1.25rem] flex-1 text-xs">
                {copyStatus === "success" && (
                  <span className="text-emerald-800">
                    Sonuçlar Excel için panoya kopyalandı. Ctrl+V ile
                    yapıştırabilirsiniz.
                  </span>
                )}
                {copyStatus === "error" && (
                  <span className="text-red-700">
                    Panoya kopyalama sırasında bir hata oluştu. Tarayıcı
                    izinlerini kontrol edin.
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopyResults}
                disabled={rows.length === 0}
                className="inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: ACCENT }}
              >
                {copyStatus === "success" ? "Kopyalandı" : "Kopyala"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
