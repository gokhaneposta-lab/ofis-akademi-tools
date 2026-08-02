"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { detectSeparator, formatSqlValue } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

export default function SqlUpdateFormatterPage() {
  const [input, setInput] = useState("");
  const [tableName, setTableName] = useState("tablo");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleConvert() {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      setResult("");
      return;
    }
    const sep = detectSeparator(lines[0]);
    const headers = lines[0].split(sep).map((h) => h.trim()).filter(Boolean);
    if (headers.length < 2) {
      setResult("En az 2 sütun gerekli: anahtar + güncellenecek alan.");
      return;
    }
    const keyCol = headers[0];
    const setCols = headers.slice(1);
    const safeTable = tableName.trim() || "tablo";
    const updates: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(sep).map((c) => c.trim());
      const keyVal = formatSqlValue(cells[0] ?? "", false);
      const sets = setCols.map((col, j) => `${col} = ${formatSqlValue(cells[j + 1] ?? "", false)}`);
      updates.push(`UPDATE ${safeTable} SET ${sets.join(", ")} WHERE ${keyCol} = ${keyVal};`);
    }

    setResult(updates.join("\n"));
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

  const lineCount = result ? result.split("\n").filter((l) => l.startsWith("UPDATE")).length : 0;

  return (
    <ToolLayout
      title="SQL UPDATE Formatter"
      description="Excel tablosundan SQL UPDATE üretir. İlk sütun WHERE anahtarı, diğer sütunlar SET alanlarıdır."
      path="/excel-araclari/sql-update-formatter"
      keywords={["sql update excel", "excel to sql update", "sql update formatter"]}
      howToSteps={[
        "Excel’den tabloyu yapıştırın: ilk satır sütun adları olsun.",
        "İlk sütun WHERE koşulundaki anahtar (ör. id), sonraki sütunlar güncellenecek alanlar.",
        "Tablo adını girip Dönüştür’e basın.",
      ]}
      faq={[
        {
          question: "Hangi sütun WHERE olur?",
          answer: "Her zaman ilk sütun anahtar kabul edilir.",
        },
        {
          question: "Birden fazla alan güncelleyebilir miyim?",
          answer: "Evet. İkinci sütundan itibaren tüm kolonlar SET listesine eklenir.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          Toplu güncelleme senaryolarında satır satır UPDATE yazmayı kaldırır. INSERT ve IN araçlarıyla aynı aile.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/excel-sql-insert" className="font-medium underline" style={{ color: ACCENT }}>
            SQL INSERT
          </Link>
          {" · "}
          <Link href="/excel-araclari/sql-in-formatter" className="font-medium underline" style={{ color: ACCENT }}>
            SQL IN
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="block text-xs font-medium text-gray-600">Tablo adı</label>
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="mt-1 w-full max-w-xs rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none"
          />

          <label className="mt-4 block text-sm font-semibold text-gray-900">
            Excel verisi (ilk sütun = anahtar)
          </label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={10}
              minHeight="12rem"
              className="font-mono text-sm"
              placeholder={"id\tad\tdurum\n1\tAhmet\taktif\n2\tAyşe\tpasif"}
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleConvert}>
            Dönüştür
          </PrimaryButton>
          {lineCount > 0 ? (
            <p className="mt-2 text-xs tabular-nums text-gray-600">{lineCount} UPDATE</p>
          ) : null}

          {result ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4">
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-emerald-200/80 bg-white p-3 font-mono text-xs text-gray-900 sm:text-sm">
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
