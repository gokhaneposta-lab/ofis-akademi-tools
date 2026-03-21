"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

export default function TekrarlananlariKaldirPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimLines, setTrimLines] = useState(true);

  function handleRemove() {
    let lines = input.split(/\r?\n/);
    if (trimLines) lines = lines.map((l) => l.trim());
    lines = lines.filter((l) => l.length > 0);

    const seen = new Set<string>();
    const unique: string[] = [];
    for (const line of lines) {
      const key = caseSensitive ? line : line.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(line);
    }

    setResult(unique.join("\n"));
    setCopied(false);
  }

  const inputCount = input
    .split(/\r?\n/)
    .filter((l) => (trimLines ? l.trim() : l)).length;
  const resultCount = result ? result.split("\n").filter(Boolean).length : 0;
  const removedCount = inputCount - resultCount;

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

  const howToSteps = [
    "Satırları kutuya yapıştırın.",
    "Seçenekleri ayarlayın (boşluk temizleme, harf duyarlılığı).",
    "Tekrarları Kaldır butonuna tıklayın.",
    "Benzersiz listeyi kopyalayın.",
  ];

  const faq = [
    {
      question: "Büyük-küçük harf farkını dikkate alır mı?",
      answer: "İsteğe bağlı. Seçenekten açabilirsiniz.",
    },
    {
      question: "Boşluklardan kaynaklı tekrarları temizler mi?",
      answer: "Evet, boşluk temizle seçeneği ile.",
    },
    {
      question: "Sonucu Excel'e aktarabilir miyim?",
      answer: "Evet, kopyalayıp yapıştırabilirsiniz.",
    },
  ];

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Aynı listede tekrar eden satırları tek seferde temizler. Müşteri,
        e-posta, telefon ve ID listelerini benzersiz hale getirerek rapor ve
        filtre hatalarını azaltır.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">
            ornek@mail.com ↵ ornek@mail.com ↵ farkli@mail.com
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">ornek@mail.com ↵ farkli@mail.com</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Tekrarlananları Kaldır"
      description="Listedeki tekrar eden satırları kaldırın, benzersiz listeye dönüştürün."
      path="/excel-araclari/tekrarlananlari-kaldir"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <>
          <Link
            href="/egitimler/temel"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Temel Excel eğitimi
          </Link>
          <span className="text-gray-400">·</span>
          <Link
            href="/blog/excel-yinelenenleri-kaldirma"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Yinelenenleri kaldırma rehberi
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="mb-3 flex flex-col gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-gray-300"
                style={{ accentColor: ACCENT }}
              />
              Boşlukları temizle
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-gray-300"
              />
              Büyük/küçük harf duyarlı
            </label>
          </div>

          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Listeyi yapıştırın
          </label>
          <InputTextarea
            value={input}
            onChange={setInput}
            rows={8}
            minHeight="12rem"
            placeholder={
              "Her satıra bir değer yazın veya yapıştırın...\nornek@mail.com\nornek@mail.com\nfarkli@mail.com"
            }
          />
          <PrimaryButton className="mt-3" onClick={handleRemove}>
            Tekrarları Kaldır
          </PrimaryButton>
        </div>

        {resultCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium tabular-nums text-gray-700">
              {inputCount} satır
            </span>
            <span
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums"
              style={{
                borderColor: ACCENT,
                color: ACCENT,
                backgroundColor: "rgba(33, 115, 70, 0.08)",
              }}
            >
              {resultCount} benzersiz
            </span>
            {removedCount > 0 && (
              <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium tabular-nums text-red-700">
                {removedCount} tekrar kaldırıldı
              </span>
            )}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm sm:p-5">
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
