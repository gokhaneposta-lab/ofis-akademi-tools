"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import JsonLdTool from "@/components/JsonLd";
import ToolJsonLd from "@/components/ToolJsonLd";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import PrimaryButton from "@/components/PrimaryButton";
import InputTextarea from "@/components/InputTextarea";
import ResultCard, { ResultRow, ResultField } from "@/components/ResultCard";
import Accordion from "@/components/Accordion";

const ACCENT = "#217346";
const ACCENT_LIGHT = "#e6f4ec";

const HOW_TO_STEPS = [
  "Ad soyad listesini alana yapıştırın (her satıra bir kişi).",
  "\"Ad + Soyad\" veya \"Sadece Soyad\" modunu seçin.",
  "Ayır butonuna tıklayın.",
  "Sonucu kopyalayıp Excel'e yapıştırın.",
];

const FAQ = [
  { question: "Verilerim kaydediliyor mu?", answer: "Hayır. İşlem tarayıcı içinde yapılır, veriler sunucuya gönderilmez." },
  { question: "Çok satırlı liste destekleniyor mu?", answer: "Evet. Her satıra bir kişi olacak şekilde toplu işlem yapabilirsiniz." },
  { question: "Sonucu Excel'e nasıl yapıştırırım?", answer: "\"Sonucu Kopyala\" ile alıp Excel'de ilgili hücreye Ctrl+V yapmanız yeterli." },
];

const MODES = [
  { key: "split" as const, label: "Ad + Soyad" },
  { key: "surnameOnly" as const, label: "Sadece Soyad" },
];

export default function AdSoyadAyirici() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ firstName: string; lastName: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"split" | "surnameOnly">("split");
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const splitNames = useCallback(() => {
    setLoading(true);
    setShowResult(false);
    setTimeout(() => {
      const lines = input
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const output = lines.map((line) => {
        const parts = line.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return { firstName: "", lastName: "" };
        return {
          firstName: parts.slice(0, -1).join(" "),
          lastName: parts[parts.length - 1],
        };
      });

      setResult(output);
      setLoading(false);
    }, 400);
  }, [input]);

  useEffect(() => {
    if (result.length > 0 && !loading) {
      requestAnimationFrame(() => setShowResult(true));
      const t = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [result, loading]);

  const handleCopy = useCallback(() => {
    if (!result.length) return;
    let text: string;
    if (mode === "split") {
      text = "Ad\tSoyad\n" + result.map((r) => `${r.firstName}\t${r.lastName}`).join("\n");
    } else {
      text = result.map((r) => r.lastName || r.firstName).filter(Boolean).join("\n");
    }
    navigator.clipboard.writeText(text);
  }, [result, mode]);

  const hasResult = result.length > 0;
  const lineCount = input ? input.split("\n").filter((l) => l.trim()).length : 0;
  const activeIdx = MODES.findIndex((m) => m.key === mode);

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLdTool
        name="Ad Soyad Ayırıcı — Ücretsiz Excel Aracı"
        description="Tam ad listesini ad ve soyad olarak ayırın; Excel'e yapıştırıp tablo veya noktalı virgül formatında kopyalayın."
        path="/excel-araclari/ad-soyad-ayir"
        keywords={["excel ad soyad ayırma", "ad soyad ayırıcı", "isim soyisim ayırma"]}
      />
      <ToolJsonLd
        name="Ad Soyad Ayırıcı"
        description="Tam ad listesini ad ve soyad olarak ayırın; tablo veya Excel formatında kopyalayın."
        path="/excel-araclari/ad-soyad-ayir"
        howToSteps={HOW_TO_STEPS}
        faq={FAQ}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Link
            href="/excel-araclari"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 active:scale-90"
            aria-label="Geri"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold text-gray-900">Ad Soyad Ayır</h1>
            <p className="truncate text-xs text-gray-500">Tam adı ad ve soyad olarak ayırır</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex max-w-lg flex-col px-4 pb-10 pt-5 sm:px-5">

        {/* Segmented control */}
        <div className="relative flex rounded-2xl bg-gray-200/70 p-1" translate="no">
          <div
            className="absolute top-1 bottom-1 rounded-xl shadow-sm transition-all duration-300 ease-out"
            style={{
              background: ACCENT,
              width: `calc(${100 / MODES.length}% - 4px)`,
              left: `calc(${(100 / MODES.length) * activeIdx}% + 2px)`,
            }}
          />
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`relative z-10 flex-1 whitespace-nowrap rounded-xl py-2.5 text-center text-sm font-bold transition-colors duration-200 ${
              mode === "split" ? "text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Ad + Soyad
          </button>
          <button
            type="button"
            onClick={() => setMode("surnameOnly")}
            className={`relative z-10 flex-1 whitespace-nowrap rounded-xl py-2.5 text-center text-sm font-bold transition-colors duration-200 ${
              mode === "surnameOnly" ? "text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sadece Soyad
          </button>
        </div>

        {/* Input → Button → Result: connected flow */}
        <div className="mt-4 flex flex-col">
          {/* Input card */}
          <div
            className={`border border-gray-200 bg-white px-4 pb-4 pt-4 shadow-md transition-[border-radius] duration-300 sm:px-5 ${
              hasResult && showResult ? "rounded-t-2xl rounded-b-none border-b-0" : "rounded-2xl"
            }`}
          >
            <label className="mb-2.5 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-gray-700">Ad soyad listesini girin</span>
              {lineCount > 0 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] tabular-nums font-medium text-gray-500">
                  {lineCount} satır
                </span>
              )}
            </label>
            <InputTextarea
              value={input}
              onChange={setInput}
              placeholder={"Ad soyad listesini yapıştırın\n(her satır bir kişi)\n\nÖrn:\nMELİHA ELVİN GÜZEL YILDIRIM\nAHMET MEHMET DEMİR\nAYŞE KAYA"}
            />

            {/* Button */}
            <PrimaryButton
              onClick={splitNames}
              disabled={!input.trim() || loading}
              className="mt-3"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Ayrılıyor...
                </>
              ) : (
                "Ayır"
              )}
            </PrimaryButton>
          </div>

          {/* Result card */}
          <ResultCard
            ref={resultRef}
            visible={hasResult && showResult}
            count={result.length}
            onCopy={handleCopy}
          >
            {result.map((row, i) => (
              <ResultRow key={i} index={i} total={result.length} animate={showResult}>
                {mode === "split" ? (
                  <div className="space-y-2">
                    <ResultField label="Ad" value={row.firstName} />
                    <ResultField label="Soyad" value={row.lastName} variant="accent" />
                  </div>
                ) : (
                  <p className="truncate text-[15px] font-bold" style={{ color: ACCENT }}>
                    {row.lastName || row.firstName || "—"}
                  </p>
                )}
              </ResultRow>
            ))}
          </ResultCard>
        </div>

        {/* Collapsible info sections */}
        <div className="mt-6 flex flex-col gap-3">
          <Accordion title="Nasıl kullanılır?">
            <ol className="list-inside list-decimal space-y-2 text-gray-700">
              {HOW_TO_STEPS.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </Accordion>

          <Accordion title="Bu araç ne işe yarar?">
            <p>
              Tek sütunda duran ad-soyad listesini saniyeler içinde ayırır.
              Özellikle personel listesi, CRM aktarımı ve e-posta listesi
              düzenlemede vakit kazandırır.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="mb-1 text-[11px] font-semibold text-gray-500">Örnek girdi</p>
                <p className="text-xs text-gray-800">MELİHA ELVİN GÜZEL YILDIRIM</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: ACCENT_LIGHT }}>
                <p className="mb-1 text-[11px] font-semibold text-gray-500">Örnek çıktı</p>
                <p className="text-xs text-gray-800">
                  Ad: MELİHA ELVİN GÜZEL<br />Soyad: YILDIRIM
                </p>
              </div>
            </div>
          </Accordion>

          <Accordion title="Sık sorulan sorular">
            <div className="space-y-4">
              {FAQ.map((f, i) => (
                <div key={i}>
                  <p className="font-semibold text-gray-900">{f.question}</p>
                  <p className="mt-0.5 text-gray-600">{f.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Link href="/egitimler/temel" className="underline" style={{ color: ACCENT }}>
                Temel Excel eğitimi
              </Link>
              <span className="text-gray-300">·</span>
              <Link href="/blog/excelde-ad-soyad-ayirma" className="underline" style={{ color: ACCENT }}>
                Rehber yazısı
              </Link>
            </div>
          </Accordion>
        </div>

        {/* Similar tools */}
        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/ad-soyad-ayir" />
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Ofis Akademi · Excel & Veri Analizi
        </p>
      </main>

      <style jsx global>{`
        @keyframes staggerFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
