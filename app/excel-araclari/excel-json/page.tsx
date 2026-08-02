"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { detectSeparator, looksLikeNumber } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

type Mod = "toJson" | "toTable";

function toJsonValue(cell: string): number | string {
  const t = cell.trim();
  if (looksLikeNumber(t)) {
    const normalized = t.replace(",", ".");
    return normalized.includes(".") ? parseFloat(normalized) : parseInt(normalized, 10);
  }
  return t;
}

function jsonToTsv(parsed: unknown): string {
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("JSON bir nesne dizisi olmalı (örn. [{...}, {...}]).");
  }
  const rows = parsed as Record<string, unknown>[];
  if (typeof rows[0] !== "object" || rows[0] === null || Array.isArray(rows[0])) {
    throw new Error("Dizi elemanları nesne olmalı.");
  }
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row ?? {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );
  const lines = [headers.join("\t")];
  for (const row of rows) {
    lines.push(headers.map((h) => String(row?.[h] ?? "")).join("\t"));
  }
  return lines.join("\n");
}

export default function ExcelJsonPage() {
  const [mod, setMod] = useState<Mod>("toJson");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pretty, setPretty] = useState(true);

  function handleConvert() {
    setError("");
    setCopied(false);
    if (mod === "toJson") {
      const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        setResult("");
        setError("En az başlık + 1 veri satırı gerekli.");
        return;
      }
      const sep = detectSeparator(lines[0]);
      const headers = lines[0].split(sep).map((h) => h.trim()).filter(Boolean);
      if (!headers.length) {
        setResult("");
        return;
      }
      const arr: Record<string, number | string>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(sep).map((c) => c.trim());
        const obj: Record<string, number | string> = {};
        headers.forEach((h, j) => {
          obj[h] = toJsonValue(cells[j] ?? "");
        });
        arr.push(obj);
      }
      setResult(pretty ? JSON.stringify(arr, null, 2) : JSON.stringify(arr));
      return;
    }

    try {
      const parsed = JSON.parse(input) as unknown;
      setResult(jsonToTsv(parsed));
    } catch (e) {
      setResult("");
      setError(e instanceof Error ? e.message : "Geçersiz JSON.");
    }
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

  const objCount = mod === "toJson" && result ? (result.match(/\{\s*"/g)?.length ?? 0) : 0;

  return (
    <ToolLayout
      title="Excel ⇄ JSON"
      description="Excel/CSV tablosunu JSON’a veya JSON dizisini Excel’e yapıştırılabilir tabloya çevirir."
      path="/excel-araclari/excel-json"
      howToSteps={[
        "Yön seçin: Excel → JSON veya JSON → Excel.",
        "Veriyi yapıştırın (Excel yönünde ilk satır sütun adları olmalı).",
        "Dönüştür’e basın; sonucu kopyalayın.",
      ]}
      faq={[
        {
          question: "JSON → Excel nasıl yapıştırılır?",
          answer: "Çıktı sekme ile ayrılmıştır; Excel’de bir hücreye Ctrl+V ile yapıştırın.",
        },
        {
          question: "Hangi JSON biçimi desteklenir?",
          answer: "Nesne dizisi: [{ \"ad\": \"...\" }, ...]",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          API ve entegrasyon işlerinde tablo ↔ JSON dönüşümünü iki yönlü yapar. Veri tarayıcıda kalır.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/blog/excel-json-donusturucu" className="font-medium underline" style={{ color: ACCENT }}>
            Excel&apos;den JSON rehberi
          </Link>
        </span>
      }
      keywords={["excel to json", "json to excel", "csv to json", "json excel çevir"]}
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="relative flex rounded-2xl bg-gray-200/70 p-1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl shadow-sm transition-transform duration-300"
              style={{
                background: ACCENT,
                transform: mod === "toTable" ? "translateX(calc(100% + 0.5rem))" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => {
                setMod("toJson");
                setResult("");
                setError("");
              }}
              className={`relative z-10 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold ${
                mod === "toJson" ? "text-white" : "text-gray-600"
              }`}
            >
              Excel → JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setMod("toTable");
                setResult("");
                setError("");
              }}
              className={`relative z-10 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold ${
                mod === "toTable" ? "text-white" : "text-gray-600"
              }`}
            >
              JSON → Excel
            </button>
          </div>

          {mod === "toJson" ? (
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={pretty}
                onChange={(e) => setPretty(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                style={{ accentColor: ACCENT }}
              />
              <span className="font-medium">Girintili (okunaklı) JSON</span>
            </label>
          ) : null}

          <label className="mt-4 block text-sm font-semibold text-gray-900">
            {mod === "toJson" ? "Excel / CSV verisi" : "JSON (nesne dizisi)"}
          </label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={10}
              minHeight="12rem"
              className="resize-y font-mono text-sm"
              placeholder={
                mod === "toJson"
                  ? "id\tad\n1\tAhmet\n2\tMehmet"
                  : '[\n  {"id": 1, "ad": "Ahmet"},\n  {"id": 2, "ad": "Mehmet"}\n]'
              }
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleConvert}>
            Dönüştür
          </PrimaryButton>

          {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
          {objCount > 0 ? (
            <p className="mt-2 text-xs font-medium tabular-nums text-gray-600">{objCount} nesne</p>
          ) : null}

          {result ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4">
              <p className="text-sm font-semibold text-gray-900">
                {mod === "toJson" ? "JSON çıktısı" : "Tablo (Excel’e yapıştır)"}
              </p>
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-emerald-200/80 bg-white p-3 font-mono text-xs text-gray-900 sm:text-sm">
                {result}
              </pre>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-gray-50"
                  style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
                >
                  {copied ? "Kopyalandı ✓" : "Kopyala"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}
