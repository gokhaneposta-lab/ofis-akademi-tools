"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { formatSqlValue } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

export default function SqlInFormatterPage() {
  const [input, setInput] = useState("");
  const [forceQuote, setForceQuote] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const values = useMemo(() => {
    return input
      .split(/[\r\n,;]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }, [input]);

  function handleConvert() {
    if (values.length === 0) {
      setResult("");
      return;
    }
    const body = values.map((v) => formatSqlValue(v, forceQuote)).join(", ");
    setResult(`(${body})`);
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

  return (
    <ToolLayout
      title="SQL IN Formatter"
      description="Satır veya virgülle ayrılmış listeyi SQL IN (...) formatına çevirir. WHERE kolon IN (... ) için hazır çıktı."
      path="/excel-araclari/sql-in-formatter"
      keywords={["sql in formatter", "excel sql in", "sql in listesi", "where in excel"]}
      howToSteps={[
        "Excel’den veya listeden değerleri yapıştırın (her satırda bir değer veya virgülle ayrılmış).",
        "İsterseniz tüm değerleri tırnak içine alın (metin kolonları için).",
        "Dönüştür’e basın; çıkan (… ) ifadesini SQL sorgunuza yapıştırın.",
      ]}
      faq={[
        {
          question: "Sayılar tırnaklanır mı?",
          answer: "Hayır — sayı gibi görünenler tırnaksız yazılır. “Hepsi tırnaklı” seçeneğiyle zorlayabilirsiniz.",
        },
        {
          question: "Virgüllü liste kabul eder mi?",
          answer: "Evet. Satır sonu, virgül ve noktalı virgül ayırıcı olarak kullanılır.",
        },
        {
          question: "INSERT’ten farkı ne?",
          answer: "INSERT satır ekler; bu araç WHERE … IN (…) listesi üretir.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          Analist ve yazılımcıların en sık ihtiyaç duyduğu SQL parçası: uzun bir ID veya kod listesini güvenli şekilde
          IN listesine çevirmek. Veri tarayıcıda kalır.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/excel-sql-insert" className="font-medium underline" style={{ color: ACCENT }}>
            Excel → SQL INSERT
          </Link>
          {" · "}
          <Link href="/excel-araclari/sql-update-formatter" className="font-medium underline" style={{ color: ACCENT }}>
            SQL UPDATE Formatter
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={forceQuote}
              onChange={(e) => setForceQuote(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300"
              style={{ accentColor: ACCENT }}
            />
            <span className="font-medium">Tüm değerleri tırnakla (metin kolon)</span>
          </label>

          <label className="mt-4 block text-sm font-semibold text-gray-900">Listeyi yapıştırın</label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="11rem"
              className="font-mono text-sm"
              placeholder={"1001\n1002\n1003"}
            />
          </div>
          <p className="mt-1 text-xs tabular-nums text-gray-500">{values.length} değer</p>

          <PrimaryButton className="mt-3" onClick={handleConvert}>
            Dönüştür
          </PrimaryButton>

          {result ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4">
              <p className="text-sm font-semibold text-gray-900">SQL IN çıktısı</p>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-emerald-200/80 bg-white p-3 font-mono text-xs text-gray-900 sm:text-sm">
                {result}
              </pre>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
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
