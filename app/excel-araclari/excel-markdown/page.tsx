"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { excelPasteToMarkdown } from "@/lib/excelToolHelpers";

const ACCENT = "#217346";

export default function ExcelMarkdownPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleConvert() {
    setResult(excelPasteToMarkdown(input));
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
      title="Excel → Markdown Tablo"
      description="Excel’den kopyalanan tabloyu Notion, GitHub ve dokümantasyon için Markdown tabloya çevirir."
      path="/excel-araclari/excel-markdown"
      keywords={["excel markdown tablo", "notion tablo excel", "github markdown table"]}
      howToSteps={[
        "Excel’de tabloyu kopyalayın (Ctrl+C).",
        "Aşağıya yapıştırıp Dönüştür’e basın.",
        "Markdown çıktısını Notion veya GitHub’a yapıştırın.",
      ]}
      faq={[
        {
          question: "İlk satır ne olur?",
          answer: "Başlık satırı kabul edilir; altına --- ayırıcı eklenir.",
        },
        {
          question: "Hangi ayraçlar?",
          answer: "Sekme (Excel varsayılanı), virgül, noktalı virgül veya |.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          Dokümantasyon ve README paylaşımında Excel tablosunu temiz Markdown’a çevirmenin en hızlı yolu.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/excel-json" className="font-medium underline" style={{ color: ACCENT }}>
            Excel ⇄ JSON
          </Link>
          {" · "}
          <Link href="/excel-araclari/csv-ayir" className="font-medium underline" style={{ color: ACCENT }}>
            CSV Ayırıcı
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="block text-sm font-semibold text-gray-900">Excel tablosu</label>
          <div className="mt-1.5">
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="11rem"
              className="font-mono text-sm"
              placeholder={"Ürün\tAdet\nKalem A\t12\nKalem B\t5"}
            />
          </div>
          <PrimaryButton className="mt-3" onClick={handleConvert}>
            Dönüştür
          </PrimaryButton>

          {result ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4">
              <p className="text-sm font-semibold text-gray-900">Markdown</p>
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
