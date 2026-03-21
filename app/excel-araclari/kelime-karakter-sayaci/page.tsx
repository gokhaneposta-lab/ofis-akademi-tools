"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";

const ACCENT = "#217346";

function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter((s) => s.length > 0).length;
}

function countChars(text: string): { withSpaces: number; withoutSpaces: number } {
  const withSpaces = text.length;
  const withoutSpaces = text.replace(/\s/g, "").length;
  return { withSpaces, withoutSpaces };
}

export default function KelimeKarakterSayaciPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const words = countWords(input);
    const { withSpaces, withoutSpaces } = countChars(input);
    return { words, withSpaces, withoutSpaces };
  }, [input]);

  const copyText = `Kelime sayısı\t${stats.words}\nKarakter (boşluklu)\t${stats.withSpaces}\nKarakter (boşluksuz)\t${stats.withoutSpaces}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }, [copyText]);

  return (
    <ToolLayout
      title="Kelime & Karakter Sayacı"
      description="Metindeki kelime ve karakter sayısını hesaplayın."
      path="/excel-araclari/kelime-karakter-sayaci"
      howToSteps={[
        "Metni kutuya yapıştırın.",
        "Kelime ve karakter sayıları anında hesaplanır.",
        "Sonucu Kopyala ile özeti alabilirsiniz.",
      ]}
      faq={[
        {
          question: "Boşluklu vs boşluksuz farkı nedir?",
          answer: "Boşluklu karakter sayımı boşlukları dahil eder; boşluksuz hariç tutar.",
        },
        {
          question: "Excel'de nasıl yaparım?",
          answer: "UZUNLUK (LEN) fonksiyonu ile karakter sayısı alınır.",
        },
        {
          question: "Kopyalama ne işe yarar?",
          answer: "Kelime ve karakter sayısını tablo formatında panoya alır.",
        },
      ]}
      aboutContent={
        <>
          <p className="mb-4 text-sm text-gray-700">
            Metin içindeki kelime sayısını ve karakter sayısını (boşluklu/boşluksuz) hızlıca hesaplar. Excel veya
            metinden toplu şekilde çalışır.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
              <p className="mb-1 font-semibold text-gray-800">Girdi</p>
              <p className="text-gray-700">
                <span className="font-mono">Merhaba Excel</span>
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
              <p className="mb-1 font-semibold text-gray-800">Çıktı</p>
              <p className="text-gray-700">
                Kelime ve karakter sayıları anında görünür; kopyala ile rapora aktarabilirsiniz.
              </p>
            </div>
          </div>
        </>
      }
      relatedLinks={
        <Link href="/blog/excelde-kelime-ve-karakter-sayisi" className="underline underline-offset-2" style={{ color: ACCENT }}>
          Excel&apos;de kelime ve karakter sayısı
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-8 pt-2 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="mb-2 block text-sm font-medium text-gray-800">Metni yapıştırın</label>
          <InputTextarea
            value={input}
            onChange={setInput}
            placeholder="Buraya metin yapıştırın. Kelime ve karakter sayıları anında güncellenir."
            rows={8}
            minHeight="12rem"
            className="!resize-y border-gray-200 bg-white"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center shadow-md sm:px-5">
            <div className="text-3xl font-bold tabular-nums" style={{ color: ACCENT }}>
              {stats.words}
            </div>
            <div className="mt-1 text-xs text-gray-500">Kelime</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center shadow-md sm:px-5">
            <div className="text-3xl font-bold tabular-nums" style={{ color: ACCENT }}>
              {stats.withSpaces}
            </div>
            <div className="mt-1 text-xs text-gray-500">Karakter (boşluklu)</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center shadow-md sm:px-5">
            <div className="text-3xl font-bold tabular-nums" style={{ color: ACCENT }}>
              {stats.withoutSpaces}
            </div>
            <div className="mt-1 text-xs text-gray-500">Karakter (boşluksuz)</div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          disabled={!input.trim()}
          className="mt-4 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold shadow-md transition enabled:hover:border-gray-300 enabled:hover:bg-gray-50 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-60"
          style={input.trim() ? { color: ACCENT } : undefined}
        >
          {copied ? "Kopyalandı" : "Sonucu Kopyala"}
        </button>
      </div>
    </ToolLayout>
  );
}
