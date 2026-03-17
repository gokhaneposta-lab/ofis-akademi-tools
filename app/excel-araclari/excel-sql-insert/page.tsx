"use client";

import React, { useState } from "react";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

function detectSeparator(line: string): string {
  if (line.includes("\t")) return "\t";
  if (line.includes("|")) return "|";
  if (line.includes(";")) return ";";
  if (line.includes(",")) return ",";
  return "\t";
}

function looksLikeNumber(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return /^-?\d+([.,]\d+)?$/.test(t.replace(",", "."));
}

function sqlEscape(val: string): string {
  return val.replace(/'/g, "''");
}

function formatSqlValue(cell: string): string {
  const t = cell.trim();
  if (looksLikeNumber(t)) {
    const normalized = t.replace(",", ".");
    return normalized;
  }
  return `'${sqlEscape(t)}'`;
}

export default function ExcelSqlInsertPage() {
  const [input, setInput] = useState("");
  const [tableName, setTableName] = useState("tablo");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleConvert() {
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setResult("");
      return;
    }

    const sep = detectSeparator(lines[0]);
    const headers = lines[0].split(sep).map((h) => h.trim()).filter(Boolean);
    if (!headers.length) {
      setResult("");
      return;
    }

    const safeTable = tableName.trim() || "tablo";
    const colList = headers.join(", ");
    const inserts: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(sep).map((c) => c.trim());
      const values = headers.map((_, j) => formatSqlValue(cells[j] ?? ""));
      inserts.push(`INSERT INTO ${safeTable} (${colList}) VALUES (${values.join(",")});`);
    }

    setResult(inserts.join("\n"));
    setCopied(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error("Kopyalanamadı:", e);
    }
  }

  const lineCount = result ? result.split("\n").filter(Boolean).length : 0;

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="Excel → SQL INSERT Dönüştürücü — Ücretsiz Veritabanı Aracı"
        description="Excel tablosunu SQL INSERT komutlarına dönüştürür. Veritabanına veri eklemek için kullanılır. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/excel-sql-insert"
        keywords={["excel to sql insert", "excel sql dönüştürücü", "veritabanına veri ekleme", "SQL INSERT generator"]}
      />
      <PageRibbon
        title="Excel → SQL INSERT Dönüştürücü"
        description="Excel tablosunu SQL INSERT komutlarına dönüştürür. Veritabanına veri eklemek için kullanılır."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Excel'den tabloyu kopyalayıp aşağıdaki alana yapıştırın (ilk satır sütun başlıkları olmalı). Sekme veya pipe (|) ile ayrılmış veri desteklenir.",
            "Tablo adını girin (varsayılan: tablo). Veritabanındaki hedef tablo adıyla değiştirin.",
            "Dönüştür butonuna tıklayın.",
            "Oluşan SQL INSERT komutlarını Kopyala ile alıp veritabanı istemcisinde çalıştırın.",
          ]}
        />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tablo adı (SQL'de kullanılacak)</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="tablo"
            className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm bg-white font-mono"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Excel verisi (ilk satır = sütun adları, sekme veya | ile ayrılmış)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"id\tad\tsoyad\n1\tAhmet\tKaya\n2\tMehmet\tYılmaz"}
            rows={10}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleConvert}
            className="px-4 py-2 text-sm font-semibold rounded text-white hover:opacity-90 transition"
            style={{ background: THEME.ribbon }}
          >
            Dönüştür
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result}
            className={`px-4 py-2 text-sm font-medium rounded transition flex items-center gap-2 ${
              copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {copied ? "✓ Kopyalandı" : "Kopyala"}
          </button>
          {lineCount > 0 && (
            <span className="text-xs text-gray-500">{lineCount} INSERT satırı</span>
          )}
        </div>

        {result ? (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">SQL INSERT çıktısı</label>
            <pre className="rounded-lg border p-4 text-xs sm:text-sm bg-gray-50 overflow-x-auto whitespace-pre-wrap font-mono text-gray-800 max-h-80 overflow-y-auto" style={{ borderColor: THEME.gridLine }}>
              {result}
            </pre>
          </div>
        ) : null}
      </div>

      <BenzerExcelAraclari currentHref="/excel-araclari/excel-sql-insert" />
    </div>
  );
}
