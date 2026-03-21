"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";

const ACCENT = "#217346";
const ACCENT_LIGHT = "#e6f4ec";

const MODES = [
  { key: "upper" as const, label: "BÜYÜK HARF" },
  { key: "lower" as const, label: "küçük harf" },
  { key: "proper" as const, label: "İlk Harf Büyük" },
];

type CaseMode = "upper" | "lower" | "proper";

function toProper(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

function transformText(text: string, mode: CaseMode): string {
  if (mode === "upper") return text.toUpperCase();
  if (mode === "lower") return text.toLowerCase();
  return text.split(/\r?\n/).map(toProper).join("\n");
}

export default function BuyukKucukHarfPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<CaseMode>("upper");
  const [copied, setCopied] = useState(false);

  const result = transformText(input, mode);

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

  const activeIdx = MODES.findIndex((m) => m.key === mode);

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Metinleri tek tıkla büyük harf, küçük harf veya her kelimenin ilk harfi büyük biçimine çevirir. Başlık
        düzenleme ve veri standardizasyonunda zaman kazandırır.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">excel araçları ofis akademi</p>
        </div>
        <div className="rounded-xl border border-gray-200 p-3 text-xs" style={{ background: ACCENT_LIGHT }}>
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">Excel Araçları Ofis Akademi</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Büyük / Küçük Harf Dönüştür"
      description="Metni büyük harf, küçük harf veya Proper yapın."
      path="/excel-araclari/buyuk-kucuk-harf"
      howToSteps={[
        "Metni kutuya yapıştırın.",
        "Büyük harf, Küçük harf veya İlk harf büyük seçin.",
        "Sonucu kopyalayın.",
      ]}
      faq={[
        {
          question: "Türkçe karakterler doğru dönüşür mü?",
          answer: "Evet, ğ ü ş ı ö ç karakterleriyle çalışır.",
        },
        {
          question: "Çok satırlı metin?",
          answer: "Evet, her satır aynı kurala göre çevrilir.",
        },
        {
          question: "Excel'e geri aktarma?",
          answer: "Kopyalayıp yapıştırabilirsiniz.",
        },
      ]}
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
            href="/blog/excelde-buyuk-kucuk-harf-donusturme"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Büyük/küçük harf rehberi
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-8 pt-2 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="relative mb-4 flex rounded-2xl bg-gray-200/70 p-1" translate="no">
            <div
              className="absolute top-1 bottom-1 rounded-xl shadow-sm transition-all duration-300 ease-out"
              style={{
                background: ACCENT,
                width: `calc(${100 / MODES.length}% - 4px)`,
                left: `calc(${(100 / MODES.length) * activeIdx}% + 2px)`,
              }}
            />
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className={`relative z-10 flex-1 min-w-0 rounded-xl py-2.5 text-center text-[11px] font-bold transition-colors duration-200 sm:text-sm ${
                  mode === m.key ? "text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-sm font-medium text-gray-800">Metni yapıştırın</label>
          <InputTextarea
            value={input}
            onChange={setInput}
            placeholder="Buraya metin yapıştırın..."
            rows={8}
            minHeight="12rem"
            className="!resize-y border-gray-200 bg-white"
          />

          {input.trim() && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <label className="mb-2 block text-sm font-medium text-gray-800">Sonuç</label>
              <textarea
                readOnly
                value={result}
                rows={8}
                className="w-full resize-y rounded-xl border-2 border-emerald-400/90 bg-white px-4 py-3.5 text-[15px] leading-relaxed text-gray-900 shadow-[0_0_0_1px_rgba(16,185,129,0.12)] focus:outline-none"
                style={{ minHeight: "12rem" }}
              />
              <div className="mt-3 flex justify-end">
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
    </ToolLayout>
  );
}
