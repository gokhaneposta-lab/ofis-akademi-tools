"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

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

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Excel&apos;deki tabloyu, veritabanına veri eklemek için kullanılabilecek SQL INSERT
        komutlarına dönüştürür. Sütun başlıklarını kolon adı olarak kullanır.
      </p>
      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <p>
          <span className="font-semibold text-gray-900">Örnek girdi:</span> ilk satır kolon
          adları, alt satırlar veri (örn.{" "}
          <span className="font-mono text-gray-800">id | ad | soyad</span>).
        </p>
        <p>
          <span className="font-semibold text-gray-900">Örnek çıktı:</span> her satır için{" "}
          <span className="font-mono text-gray-800">INSERT INTO ... VALUES (...);</span>{" "}
          formatında komut.
        </p>
        <p className="text-xs text-gray-500">
          Sonucu kopyalayıp SQL istemcisinde çalıştırabilirsin.
        </p>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Excel → SQL INSERT Dönüştürücü"
      description="Excel tablosunu SQL INSERT komutlarına dönüştürür. Veritabanına veri eklemek için kullanılır."
      path="/excel-araclari/excel-sql-insert"
      howToSteps={[
        "Excel'den tabloyu kopyalayıp aşağıdaki alana yapıştırın (ilk satır sütun başlıkları olmalı). Sekme veya pipe (|) ile ayrılmış veri desteklenir.",
        "Tablo adını girin (varsayılan: tablo). Veritabanındaki hedef tablo adıyla değiştirin.",
        "Dönüştür butonuna tıklayın.",
        "Oluşan SQL INSERT komutlarını Kopyala ile alıp veritabanı istemcisinde çalıştırın.",
      ]}
      faq={[
        {
          question: "Tablo adı nasıl belirlenir?",
          answer:
            "“Tablo adı” alanından; boş bırakırsan varsayılan tablo adı tablo olur.",
        },
        {
          question: "Metin değerleri tırnaklanır mı?",
          answer: "Evet. Sayı gibi görünmeyen hücreler tırnak içinde üretilir.",
        },
        {
          question: "Kaç satır INSERT çıkar?",
          answer: "Girişteki veri satırı sayısı kadar INSERT satırı oluşur.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          <Link
            href="/blog/excel-sql-insert-donusturucu"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            SQL INSERT rehberi
          </Link>
        </span>
      }
      keywords={[
        "excel to sql insert",
        "excel sql dönüştürücü",
        "veritabanına veri ekleme",
        "SQL INSERT generator",
      ]}
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label
            htmlFor="excel-sql-insert-table"
            className="block text-sm font-semibold text-gray-900"
          >
            Tablo adı (SQL&apos;de kullanılacak)
          </label>
          <input
            id="excel-sql-insert-table"
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="tablo"
            className="mt-1.5 h-11 w-full max-w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15 sm:max-w-md"
          />

          <label
            htmlFor="excel-sql-insert-input"
            className="mt-4 block text-sm font-semibold text-gray-900"
          >
            Excel verisi (ilk satır = sütun adları, sekme veya | ile ayrılmış)
          </label>
          <div className="mt-1.5">
            <InputTextarea
              id="excel-sql-insert-input"
              value={input}
              onChange={setInput}
              rows={10}
              minHeight="14rem"
              className="resize-y font-mono text-sm"
              placeholder={"id\tad\tsoyad\n1\tAhmet\tKaya\n2\tMehmet\tYılmaz"}
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleConvert}>
            Dönüştür
          </PrimaryButton>
        </div>

        {lineCount > 0 && (
          <p className="mt-2 text-xs font-medium tabular-nums text-gray-600">
            {lineCount} INSERT satırı
          </p>
        )}

        {result ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <label
              htmlFor="excel-sql-insert-result"
              className="block text-sm font-semibold text-gray-900"
            >
              SQL INSERT çıktısı
            </label>
            <textarea
              id="excel-sql-insert-result"
              readOnly
              value={result}
              rows={12}
              className="mt-2 w-full resize-y rounded-xl border border-emerald-200/80 bg-white px-3 py-3 font-mono text-xs text-gray-900 shadow-sm focus:outline-none sm:text-sm"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
              >
                {copied ? "Kopyalandı ✓" : "Kopyala"}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </ToolLayout>
  );
}
