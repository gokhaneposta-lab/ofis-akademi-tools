"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

type Mode = "join" | "split";
type DelimiterOption = "semicolon" | "comma" | "pipe" | "space" | "newline" | "custom";

function resolveSep(delimiter: DelimiterOption, customDelimiter: string): string {
  switch (delimiter) {
    case "comma":
      return ",";
    case "pipe":
      return "|";
    case "space":
      return " ";
    case "newline":
      return "\n";
    case "custom":
      return customDelimiter;
    case "semicolon":
    default:
      return ";";
  }
}

export default function ListeBirlestirici() {
  const [mode, setMode] = useState<Mode>("join");
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterOption>("semicolon");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [result, setResult] = useState("");
  const [lineCount, setLineCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sqlInFormat, setSqlInFormat] = useState(false);
  const [wrapQuotes, setWrapQuotes] = useState(false);

  function quoteValue(raw: string): string {
    const v = raw.trim();
    if (
      v.length >= 2 &&
      ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"')))
    ) {
      return v;
    }
    return `'${v.replace(/'/g, "''")}'`;
  }

  function handleConvert() {
    setCopied(false);
    if (mode === "join") {
      const lines = input
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      setLineCount(lines.length);
      if (!lines.length) {
        setResult("");
        return;
      }
      const values = wrapQuotes ? lines.map(quoteValue) : lines;
      if (sqlInFormat) {
        setResult(`IN (${values.join(",")})`);
      } else {
        setResult(values.join(resolveSep(delimiter, customDelimiter)));
      }
      return;
    }

    // split: yatay → dikey
    const sep = resolveSep(delimiter === "newline" ? "comma" : delimiter, customDelimiter);
    const effectiveSep = delimiter === "newline" ? /[\r\n]+/ : sep;
    const parts =
      typeof effectiveSep === "string"
        ? input.split(effectiveSep)
        : input.split(effectiveSep);
    const cleaned = parts.map((p) => p.trim()).filter((p) => p.length > 0);
    setLineCount(cleaned.length);
    setResult(cleaned.join("\n"));
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

  const delims: { id: DelimiterOption; label: string }[] = [
    { id: "semicolon", label: "Noktalı Virgül ;" },
    { id: "comma", label: "Virgül ," },
    { id: "pipe", label: "Dikey Çizgi |" },
    { id: "space", label: "Boşluk" },
    ...(mode === "join" ? [{ id: "newline" as const, label: "Yeni Satır" }] : []),
    { id: "custom", label: "Özel" },
  ];

  return (
    <ToolLayout
      title="Liste Birleştir / Ayır"
      description="Alt alta satırları tek satırda birleştirin veya virgüllü / yan yana listeyi Excel sütununa (alt alta) ayırın."
      path="/excel-araclari/liste-birlestir"
      keywords={[
        "excel liste birleştirme",
        "liste birleştirici",
        "virgüllü listeyi satırlara",
        "yatay listeyi dikey",
      ]}
      howToSteps={[
        "Birleştir veya Ayır modunu seçin.",
        "Listeyi yapıştırıp ayraç seçin.",
        "Dönüştür’e basın; sonucu Excel’e kopyalayın.",
      ]}
      faq={[
        {
          question: "Ayır modu ne yapar?",
          answer:
            "Virgül veya boşlukla yan yana yazılmış değerleri her satıra bir değer olacak şekilde alt alta dizer.",
        },
        {
          question: "SQL IN formatı ne zaman?",
          answer: "Yalnızca Birleştir modunda. WHERE kolon IN (...) için açın.",
        },
        {
          question: "Veriler kaydediliyor mu?",
          answer: "Hayır, tarayıcı içinde yapılır.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          ID listesi hazırlama, SQL IN üretme ve tek satırlık listeleri Excel sütununa çevirme aynı araçta.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/sql-in-formatter" className="font-medium underline" style={{ color: ACCENT }}>
            SQL IN Formatter
          </Link>
          {" · "}
          <Link href="/blog/excel-listeleri-birlestirme" className="font-medium underline" style={{ color: ACCENT }}>
            Liste birleştirme rehberi
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="relative flex rounded-2xl bg-gray-200/70 p-1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl shadow-sm transition-transform duration-300"
              style={{
                background: ACCENT,
                transform: mode === "split" ? "translateX(calc(100% + 0.5rem))" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setMode("join");
                setResult("");
                setLineCount(0);
              }}
              className={`relative z-10 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold ${
                mode === "join" ? "text-white" : "text-gray-600"
              }`}
            >
              Birleştir (dikey → yatay)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("split");
                setSqlInFormat(false);
                setResult("");
                setLineCount(0);
                if (delimiter === "newline") setDelimiter("comma");
              }}
              className={`relative z-10 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold ${
                mode === "split" ? "text-white" : "text-gray-600"
              }`}
            >
              Ayır (yatay → dikey)
            </button>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ayraç</span>
            <div className="mt-1 flex flex-wrap gap-1 rounded-2xl bg-gray-100/80 p-1">
              {delims.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDelimiter(d.id)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold sm:text-sm ${
                    delimiter === d.id ? "text-white shadow-sm" : "text-gray-600 hover:bg-white/80"
                  }`}
                  style={delimiter === d.id ? { background: ACCENT } : undefined}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {delimiter === "custom" && (
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => setCustomDelimiter(e.target.value)}
                placeholder="Özel ayraç"
                className="mt-2 h-10 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none"
              />
            )}
          </div>

          {mode === "join" ? (
            <div className="mt-3 space-y-2.5">
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={wrapQuotes}
                  onChange={(e) => setWrapQuotes(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  style={{ accentColor: ACCENT }}
                />
                <span>
                  <span className="font-medium">Tek tırnak ekle</span>
                  <span className="mt-0.5 block text-xs text-gray-600">
                    örn. <span className="font-mono">&apos;12345678901&apos;</span>
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={sqlInFormat}
                  onChange={(e) => setSqlInFormat(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                  style={{ accentColor: ACCENT }}
                />
                <span className="font-medium">SQL IN formatı</span>
              </label>
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-600">
              Yan yana değerler seçilen ayraçla bölünüp her satıra bir değer yazılır.
            </p>
          )}

          <label className="mt-4 block text-sm font-semibold text-gray-900">
            {mode === "join" ? "Alt alta liste" : "Yan yana / tek satır liste"}
          </label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="12rem"
              placeholder={
                mode === "join"
                  ? "12345\n23456\n34567"
                  : "12345;23456;34567   veya   a, b, c, d"
              }
            />
          </div>
          <PrimaryButton className="mt-3" onClick={handleConvert}>
            {mode === "join" ? "Birleştir" : "Ayır"}
          </PrimaryButton>
        </div>

        {lineCount > 0 && (
          <p className="mt-2 text-xs font-medium tabular-nums text-gray-600">{lineCount} değer</p>
        )}

        {result && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <label className="block text-sm font-semibold text-gray-900">
              {mode === "join" ? "Birleştirilmiş sonuç" : "Alt alta liste (Excel sütunu)"}
            </label>
            <textarea
              readOnly
              value={result}
              rows={mode === "split" ? 8 : sqlInFormat ? 3 : 4}
              className="mt-2 w-full resize-y rounded-xl border border-emerald-200/80 bg-white px-3 py-3 font-mono text-sm text-gray-900 shadow-sm focus:outline-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
              >
                {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
