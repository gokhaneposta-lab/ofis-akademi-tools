"use client";

import React, { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";

const ACCENT = "#217346";

function trimLikeExcel(text: string, removeEmptyLines: boolean): string {
  let lines = text.split(/\r?\n/).map((line) => line.replace(/\s+/g, " ").trim());
  if (removeEmptyLines) lines = lines.filter((l) => l.length > 0);
  return lines.join("\n");
}

export default function BoslukTemizlePage() {
  const [input, setInput] = useState("");
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => trimLikeExcel(input, removeEmpty), [input, removeEmpty]);
  const lineCount = input.length === 0 ? 0 : input.split(/\r?\n/).length;
  const outCount = result.length === 0 ? 0 : result.split(/\r?\n/).length;
  const showResult = Boolean(input.trim()) || (input.length > 0 && removeEmpty);

  const handleCopy = useCallback(async () => {
    if (!result && !(removeEmpty && input.length > 0)) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }, [result, removeEmpty, input.length]);

  return (
    <ToolLayout
      title="Boşluk Temizle"
      description="Baştaki/sondaki boşlukları ve çift boşlukları temizler; isteğe bağlı boş satırları siler. Excel TRIM + boş satır."
      path="/excel-araclari/bosluk-temizle"
      howToSteps={[
        "Excel veya başka bir kaynaktan metni kopyalayıp aşağıdaki kutuya yapıştırın.",
        "Metin otomatik temizlenir. İsterseniz boş satırları da silin.",
        "Sonucu kopyalayıp tekrar Excel'e yapıştırın.",
      ]}
      faq={[
        {
          question: "TRIM ne yapar?",
          answer: "Metnin başı/sonu boşluklarını siler ve kelimeler arası ardışık boşlukları tekler.",
        },
        {
          question: "Boş satır silme ne zaman gerekir?",
          answer: "Kopyala-yapıştır sonrası araya giren boş satırları temizlemek için.",
        },
        {
          question: "Excel formülleriyle aynı mı?",
          answer: "Mantık olarak benzer; araç toplu işlem yapmayı kolaylaştırır.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          Metinlerdeki baştaki/sondaki boşlukları temizleyip kelimeler arasındaki birden fazla boşluğu tek boşluğa
          indirir. Boş satır seçeneğiyle listeyi de sıkılaştırır.
        </p>
      }
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
            <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300"
                style={{ accentColor: ACCENT }}
              />
              <span className="font-medium">Boş satırları da sil</span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-gray-900">Metni yapıştırın</span>
              <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium tabular-nums text-gray-600">
                {lineCount} → {outCount} satır
              </span>
            </div>

            <InputTextarea
              value={input}
              onChange={setInput}
              placeholder={"  Başta ve sonda boşluklu   metin\n\n  ikinci satır  "}
              rows={8}
              minHeight="12rem"
            />

            {showResult && (
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-gray-900">Temizlenmiş metin</span>
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
                    disabled={!result && !removeEmpty}
                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
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
