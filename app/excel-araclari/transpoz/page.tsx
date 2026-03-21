"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

type Delimiter = "tab" | "comma" | "semicolon";

const DELIMITER_LABELS: Record<Delimiter, string> = {
  tab: "Sekme",
  comma: "Virgül",
  semicolon: "Noktalı virgül",
};

export default function TranspozPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [delimiter, setDelimiter] = useState<Delimiter>("tab");

  const howToSteps = [
    "Excel'den satırları veya sütunları kopyalayıp aşağıdaki kutuya yapıştırın (Tab ile ayrılmış olmalı).",
    "Girdi ayırıcısını seçin: sekme, virgül veya noktalı virgül.",
    "Döndür butonuna tıklayın.",
    "Sonucu kopyalayıp Excel'e yapıştırın; satırlar sütun, sütunlar satır olacaktır.",
  ];

  const faq = [
    {
      question: "Hangi ayırıcılar çalışır?",
      answer: "Sekme, virgül ve noktalı virgül.",
    },
    {
      question: "Excel’e nasıl yapıştırırım?",
      answer: "Sonucu kopyalayıp Excel’de hedef hücreye yapıştırın. Çıktı sekme ile döndüğü için tablolar kolay oluşur.",
    },
    {
      question: "Formül alternatifi var mı?",
      answer: "Evet. Excel alternatifi kısmında =TRANSPOSE(...) örneği var.",
    },
  ];

  function getSep(): string {
    if (delimiter === "tab") return "\t";
    if (delimiter === "comma") return ",";
    return ";";
  }

  function handleTranspose() {
    const sep = getSep();
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) {
      setResult("");
      return;
    }

    const matrix = lines.map((line) => line.split(sep).map((c) => c.trim()));
    const maxCols = Math.max(...matrix.map((row) => row.length));
    const normalized = matrix.map((row) => {
      const r = [...row];
      while (r.length < maxCols) r.push("");
      return r;
    });

    const rows = normalized[0].length;
    const cols = normalized.length;
    const transposed: string[][] = [];
    for (let r = 0; r < rows; r++) {
      transposed[r] = [];
      for (let c = 0; c < cols; c++) {
        transposed[r][c] = normalized[c][r] ?? "";
      }
    }

    const outSep = "\t";
    setResult(transposed.map((row) => row.join(outSep)).join("\n"));
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

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Excel’den kopyaladığınız tabloyu satır ve sütun ekseninde çevirir: üstteki
        satırlar yan yana sütunlara, sütunlar alt alta satırlara dönüşür. Rapor
        düzeni veya pivot öncesi veriyi hızlıca yeniden yönlendirmek için
        kullanılır; işlem tarayıcıda kalır.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek</p>
          <p className="text-gray-700">
            İki satır × üç sütunluk bir blok yapıştırdığınızda, çıktı üç satır × iki
            sütun olur; hücreler sekme ile ayrılır ve Excel’e doğrudan yapıştırılabilir.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">İpucu</p>
          <p className="text-gray-700">
            Excel’de aynı işlem için Özel Yapıştır → Devrik veya{" "}
            <span className="font-mono">=TRANSPOSE(A1:C5)</span> kullanılabilir; bu
            araç metin tabanlı hızlı dönüşüm sunar.
          </p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Satır / Sütun Döndür (Transpoz)"
      description="Satırları sütunlara, sütunları satırlara dönüştürün."
      path="/excel-araclari/transpoz"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <Link
          href="/blog/excel-transpoz-satir-sutun-dondurme"
          className="font-medium underline underline-offset-2"
          style={{ color: ACCENT }}
        >
          Transpoz rehberi
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="relative mb-4 flex rounded-2xl bg-gray-200/70 p-1" translate="no">
            {(Object.keys(DELIMITER_LABELS) as Delimiter[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDelimiter(d)}
                className={`relative z-10 flex-1 rounded-xl py-2.5 text-center text-xs font-semibold transition sm:text-sm ${
                  delimiter === d
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={delimiter === d ? { background: ACCENT } : undefined}
              >
                {DELIMITER_LABELS[d]}
              </button>
            ))}
          </div>
          <p className="mb-3 text-xs text-gray-400">
            Sonuç her zaman sekme ile verilir.
          </p>

          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Veriyi yapıştırın
          </label>
          <InputTextarea
            value={input}
            onChange={setInput}
            rows={8}
            minHeight="12rem"
            className="resize-y"
            placeholder={
              "Excel'den kopyaladığınız veriyi buraya yapıştırın (satırlar ve sütunlar ayırıcıya göre bölünecek)...\nİsim\tDepartman\tPuan\nAli\tSatış\t85\nAyşe\tPazarlama\t92"
            }
          />
          <PrimaryButton className="mt-3" onClick={handleTranspose}>
            Döndür (Transpoz)
          </PrimaryButton>
        </div>

        {result && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <label className="mb-2 block text-sm font-semibold text-gray-900">
              Döndürülmüş veri
            </label>
            <textarea
              readOnly
              value={result}
              rows={6}
              className="w-full resize-y rounded-xl border border-emerald-200/80 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-gray-900 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] focus:outline-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={
                  copied ? { borderColor: ACCENT, color: ACCENT } : undefined
                }
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
