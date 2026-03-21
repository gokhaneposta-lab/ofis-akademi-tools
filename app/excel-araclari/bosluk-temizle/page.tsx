"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";

const ACCENT = "#217346";

function trimLikeExcel(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .join("\n");
}

export default function BoslukTemizlePage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const result = trimLikeExcel(input);
  const lineCount =
    input.length === 0 ? 0 : input.split(/\r?\n/).length;
  const showResult = Boolean(input.trim());

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }, [result]);

  const howToSteps = [
    "Excel veya başka bir kaynaktan metni kopyalayıp aşağıdaki kutuya yapıştırın.",
    "Metin otomatik temizlenir: her satırın başı/sonu ve ardışık boşluklar tek boşluğa indirilir.",
    "Sonucu kopyalayıp tekrar Excel'e yapıştırın.",
  ];

  const faq = [
    {
      question: "TRIM ne yapar?",
      answer:
        "Metnin başı/sonu boşluklarını siler ve kelimeler arası ardışık boşlukları tekler.",
    },
    {
      question: "Excel formülleriyle aynı mı?",
      answer: "Mantık olarak benzer; araç toplu işlem yapmayı kolaylaştırır.",
    },
    {
      question: "Hangi durumlarda şart?",
      answer:
        "DÜŞEYARA/XLOOKUP, EĞER ve filtreleme öncesi “eşleşmiyor” sorunlarında.",
    },
  ];

  const aboutContent = (
    <p className="text-sm text-gray-700">
      Metinlerdeki baştaki/sondaki boşlukları temizleyip kelimeler arasındaki
      birden fazla boşluğu tek boşluğa indirir. Böylece eşleştirme, arama ve
      sıralamada oluşan “görünmez hata”ları azaltır.
    </p>
  );

  return (
    <ToolLayout
      title="Boşluk Temizle"
      description="Excel başındaki ve sondaki boşlukları siler; metin içi çoklu boşlukları tek boşluğa indirir. Excel TRIM mantığı."
      path="/excel-araclari/bosluk-temizle"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          Daha fazla örnek için{" "}
          <Link
            href="/blog/excelde-bosluk-temizleme"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            boşluk temizleme rehberini
          </Link>{" "}
          inceleyebilirsin.
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-gray-900">
                Metni yapıştırın
              </span>
              <span
                className="inline-flex w-fit shrink-0 items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium tabular-nums text-gray-600"
                aria-live="polite"
              >
                {lineCount} satır
              </span>
            </div>

            <InputTextarea
              value={input}
              onChange={setInput}
              placeholder="  Başta ve sonda boşluklu   metin   buraya..."
              rows={8}
              minHeight="12rem"
            />

            {showResult && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-gray-900">
                  Temizlenmiş metin
                </span>
                <textarea
                  readOnly
                  value={result}
                  rows={8}
                  className="w-full resize-y rounded-xl border-2 border-emerald-400/90 bg-white px-4 py-3.5 text-[15px] leading-relaxed text-gray-900 shadow-[0_0_0_1px_rgba(16,185,129,0.12)] focus:outline-none"
                  style={{ minHeight: "12rem" }}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!result}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    style={
                      copied
                        ? { borderColor: ACCENT, color: ACCENT }
                        : undefined
                    }
                  >
                    {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
