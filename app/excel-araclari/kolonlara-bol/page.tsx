"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

type SeparatorMode = "auto" | "comma" | "semicolon" | "tab";

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

export default function KolonlaraBolPage() {
  const [input, setInput] = useState("");
  const [separatorMode, setSeparatorMode] = useState<SeparatorMode>("auto");
  const [detectedSeparator, setDetectedSeparator] = useState<SeparatorMode | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSplit() {
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) {
      setRows([]);
      setDetectedSeparator(null);
      return;
    }
    let effectiveMode = separatorMode;
    if (separatorMode === "auto") {
      const detected = detectSeparator(lines);
      effectiveMode = detected ?? "comma";
      setDetectedSeparator(detected ?? null);
    } else {
      setDetectedSeparator(null);
    }
    const sepChar = getSeparatorChar(effectiveMode);
    setRows(lines.map((line) => line.split(sepChar).map((cell) => cell.trim())));
    setCopyStatus("idle");
  }

  const maxCols = rows.reduce((max, r) => Math.max(max, r.length), 0);

  async function handleCopy() {
    if (!rows.length) return;
    try {
      await navigator.clipboard.writeText(rows.map((row) => row.join("\t")).join("\n"));
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 1300);
    } catch {
      setCopyStatus("error");
    }
  }

  function getSeparatorLabel(mode: SeparatorMode | null): string {
    if (!mode) return "";
    if (mode === "comma") return "Virgül (,)";
    if (mode === "semicolon") return "Noktalı virgül (;)";
    if (mode === "tab") return "Sekme (Tab)";
    return "Otomatik";
  }

  const SEP_MODES = ["auto", "comma", "semicolon", "tab"] as const;

  return (
    <ToolLayout
      title="Metni Kolonlara Böl"
      description="Metni virgül, noktalı virgül veya sekme ile kolonlara ayırın."
      path="/excel-araclari/kolonlara-bol"
      keywords={[
        "metni kolonlara böl",
        "Excel metin ayırma",
        "virgül ayırıcı",
        "Excel araçları",
      ]}
      howToSteps={[
        "Metni kutuya yapıştırın.",
        "Ayırıcıyı seçin ve Ayır butonuna tıklayın.",
        "Sonucu kopyalayın.",
      ]}
      faq={[
        {
          question: "Hangi ayırıcıyı seçmeliyim?",
          answer: "Otomatik seçin, araç doğru ayırıcıyı bulur.",
        },
        {
          question: "Tab metinleri böler mi?",
          answer: "Evet, Tab seçeneğiyle.",
        },
        {
          question: "Excel'e yapışır mı?",
          answer: "Evet, sekmeli format üretir.",
        },
      ]}
      aboutContent={
        <>
          <p className="text-gray-600">
            Tek hücrede duran karma metni ayırıcıya göre sütunlara böler. Dış sistemden gelen verileri
            Excel&apos;de kullanılabilir tabloya dönüştürmek için uygundur.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/90 p-3 text-sm text-gray-800">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Örnek girdi</p>
              <p className="font-mono text-[13px] text-gray-700">Ali,Yılmaz,İstanbul</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/90 p-3 text-sm text-gray-800">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Örnek çıktı</p>
              <p className="text-[13px] text-gray-700">
                Sütun 1: Ali · Sütun 2: Yılmaz · Sütun 3: İstanbul
              </p>
            </div>
          </div>
        </>
      }
      relatedLinks={
        <>
          <Link href="/egitimler/temel" className="font-medium underline decoration-gray-300 underline-offset-2 transition hover:decoration-current" style={{ color: ACCENT }}>
            Temel Excel eğitimi
          </Link>
          <Link
            href="/blog/excelde-metni-kolonlara-bolme"
            className="font-medium underline decoration-gray-300 underline-offset-2 transition hover:decoration-current"
            style={{ color: ACCENT }}
          >
            Rehber yazısı
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Ayırıcı
              </span>
              <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-gray-100/90 p-1">
                {SEP_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSeparatorMode(mode)}
                    className={`min-h-[2.25rem] flex-1 rounded-lg px-2.5 py-2 text-center text-xs font-semibold transition sm:min-h-0 sm:flex-none sm:px-3 sm:text-sm ${
                      separatorMode === mode
                        ? "text-white shadow-sm"
                        : "text-gray-600 hover:bg-white/80 hover:text-gray-900"
                    }`}
                    style={separatorMode === mode ? { background: ACCENT } : undefined}
                  >
                    {mode === "auto"
                      ? "Otomatik"
                      : mode === "comma"
                        ? "Virgül ,"
                        : mode === "semicolon"
                          ? "Noktalı ;"
                          : "Tab"}
                  </button>
                ))}
              </div>
            </div>
            {separatorMode === "auto" && detectedSeparator && (
              <div
                className="shrink-0 rounded-xl border px-3 py-2 text-xs text-gray-700"
                style={{ borderColor: `${ACCENT}40`, background: "#f0f7f4" }}
              >
                Algılanan:{" "}
                <span className="font-semibold text-gray-900">{getSeparatorLabel(detectedSeparator)}</span>
              </div>
            )}
          </div>

          <label htmlFor="kolonlara-bol-input" className="mt-4 block text-[13px] font-semibold text-gray-700">
            Metni yapıştırın
          </label>
          <div className="mt-2">
            <InputTextarea
              id="kolonlara-bol-input"
              value={input}
              onChange={setInput}
              rows={8}
              placeholder={"Örn: Ad,Soyad,Şehir\nAli,Yılmaz,İstanbul\nAyşe,Kaya,Ankara"}
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleSplit}>
            Kolonlara Ayır
          </PrimaryButton>
        </div>

        {rows.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[270px] border-collapse text-left">
                <thead>
                  <tr
                    className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-700"
                    style={{ background: "#f4faf6" }}
                  >
                    {Array.from({ length: maxCols }).map((_, i) => (
                      <th key={i} className="whitespace-nowrap px-3 py-3 sm:px-4">
                        Sütun {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr
                      key={ri}
                      className="border-b border-gray-100 text-gray-900 last:border-b-0"
                      style={{ background: ri % 2 === 0 ? "#fff" : "#fafafa" }}
                    >
                      {Array.from({ length: maxCols }).map((_, ci) => (
                        <td
                          key={ci}
                          className="border-r border-gray-100 px-3 py-2.5 text-sm whitespace-pre last:border-r-0 sm:px-4"
                        >
                          {row[ci] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 bg-gray-50/90 px-4 py-3 sm:px-5">
              {copyStatus === "success" && (
                <p className="mb-2 text-xs text-emerald-800">
                  Panoya kopyalandı. Excel&apos;de Ctrl+V ile yapıştırın.
                </p>
              )}
              {copyStatus === "error" && (
                <p className="mb-2 text-xs text-red-700">Panoya kopyalanamadı. Tarayıcı iznini kontrol edin.</p>
              )}
              <button
                type="button"
                onClick={handleCopy}
                disabled={rows.length === 0}
                className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ outlineColor: ACCENT }}
              >
                {copyStatus === "success" ? "Kopyalandı" : "Sonucu Kopyala (Excel)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
