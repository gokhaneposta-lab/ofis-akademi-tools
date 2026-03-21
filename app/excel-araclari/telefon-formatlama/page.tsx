"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

type Separator = " " | "-" | ".";
type FormatMode = "local" | "international";

const SEP_OPTIONS: { value: Separator; label: string }[] = [
  { value: " ", label: "Boşluk" },
  { value: "-", label: "Tire" },
  { value: ".", label: "Nokta" },
];

const MODE_OPTIONS: { value: FormatMode; label: string }[] = [
  { value: "local", label: "Yerel (0)" },
  { value: "international", label: "Uluslararası (+90)" },
];

/** Sadece rakamları al; 9 ise başa 0 ekle; 10 hane 0 ile başlamıyorsa başa 0 ekle (mobil); 12 ve 90 ile başlıyorsa 0 ile değiştir */
function normalizeDigits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 9 && digits[0] !== "0") return "0" + digits;
  if (digits.length === 12 && digits.startsWith("90")) return "0" + digits.slice(2);
  if (digits.length === 10 && digits[0] === "0") return digits;
  if (digits.length === 10 && digits[0] !== "0") return "0" + digits; // mobil 538... → 0538...
  if (digits.length === 11 && digits[0] === "0") return digits;
  return digits.length >= 10 && digits.length <= 11 ? digits : null;
}

/** Türkiye: 10 hane = mobil 0+3+3+2+2 (0532 123 45 67); 11 hane = mobil veya sabit hep 0+3+3+2+2 (0538 789 89 86, 0212 345 67 89) */
function formatNumber(
  num: string,
  sep: Separator,
  mode: FormatMode,
  paren: boolean
): string {
  const len = num.length;
  if (len === 10 || (len === 11 && num[0] === "0")) {
    const area = num.slice(0, 4);
    const a = num.slice(4, 7);
    const b = num.slice(7, 9);
    const c = num.slice(9, 11);
    if (mode === "international") {
      const areaInt = num.slice(1, 4);
      const rest = [a, b, c].join(sep);
      if (paren) return `+90 (${areaInt}) ${rest}`;
      return `+90 ${areaInt}${sep}${a}${sep}${b}${sep}${c}`;
    }
    if (paren) return `(${area})${sep}${a}${sep}${b}${sep}${c}`;
    return [area, a, b, c].join(sep);
  }
  return num;
}

export default function TelefonFormatlamaPage() {
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState<Separator>(" ");
  const [formatMode, setFormatMode] = useState<FormatMode>("local");
  const [paren, setParen] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const [invalidLines, setInvalidLines] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const sepIndex = SEP_OPTIONS.findIndex((o) => o.value === separator);
  const modeIndex = MODE_OPTIONS.findIndex((o) => o.value === formatMode);

  function handleFormat() {
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const out: string[] = [];
    const invalid: string[] = [];
    lines.forEach((line) => {
      const num = normalizeDigits(line);
      if (num) {
        out.push(formatNumber(num, separator, formatMode, paren));
      } else {
        invalid.push(line);
      }
    });
    setResult(out);
    setInvalidLines(invalid);
    setCopied(false);
  }

  async function handleCopy() {
    if (!result.length) return;
    try {
      await navigator.clipboard.writeText(result.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error("Kopyalanamadı:", e);
    }
  }

  return (
    <ToolLayout
      title="Telefon Numarası Formatlama"
      description="Telefon numaralarını standart formata çevirir."
      path="/excel-araclari/telefon-formatlama"
      keywords={["telefon formatlama", "telefon numarası formatı", "0532 format", "+90 format"]}
      howToSteps={[
        "Numaraları kutuya yapıştırın.",
        "Ayırıcı ve görünüm seçin.",
        "Formatla butonuna tıklayın.",
      ]}
      faq={[
        { question: "Neden bazı satırlar geçersiz?", answer: "Numara 10-11 hane aralığında olmalı." },
        { question: "Uluslararası format?", answer: "Başına +90 koyar." },
        { question: "Excel'e nasıl aktarırım?", answer: "Kopyala → Ctrl+V." },
      ]}
      aboutContent={
        <>
          <p className="text-sm leading-relaxed text-gray-600">
            Telefon numaralarını tek tek ya da liste halinde standart görünüme çevirir. Ayırıcı (boşluk/tire/nokta), yerel veya uluslararası format ve (istersen) alan kodu parantez seçeneklerini kullanabilirsin.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs shadow-sm">
              <p className="mb-1 font-semibold text-gray-800">Girdi</p>
              <p className="font-mono text-gray-700">05321234567</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs shadow-sm">
              <p className="mb-1 font-semibold text-gray-800">Çıktı (yerel)</p>
              <p className="font-mono text-gray-700">0532 123 45 67</p>
            </div>
          </div>
        </>
      }
      relatedLinks={
        <Link
          href="/blog/excel-telefon-numarasi-formatlama"
          className="font-medium underline decoration-emerald-700/30 underline-offset-2 transition hover:decoration-emerald-700"
          style={{ color: ACCENT }}
        >
          Excel telefon numarası formatlama rehberi
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="mb-4 space-y-3">
            <div>
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Ayırıcı</span>
              <div className="relative flex rounded-2xl bg-gray-200/70 p-1">
                <div
                  className="absolute top-1 bottom-1 left-1 rounded-xl transition-transform duration-300 ease-out"
                  style={{
                    width: "calc((100% - 0.5rem) / 3)",
                    transform: `translateX(calc(${sepIndex} * 100%))`,
                    backgroundColor: ACCENT,
                  }}
                  aria-hidden
                />
                {SEP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSeparator(opt.value)}
                    className={`relative z-10 flex-1 rounded-xl py-2.5 text-center text-sm font-semibold transition-colors ${
                      separator === opt.value ? "text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Görünüm</span>
              <div className="relative flex rounded-2xl bg-gray-200/70 p-1">
                <div
                  className="absolute top-1 bottom-1 left-1 rounded-xl transition-transform duration-300 ease-out"
                  style={{
                    width: "calc((100% - 0.5rem) / 2)",
                    transform: `translateX(calc(${modeIndex} * 100%))`,
                    backgroundColor: ACCENT,
                  }}
                  aria-hidden
                />
                {MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormatMode(opt.value)}
                    className={`relative z-10 flex-1 rounded-xl py-2.5 px-1 text-center text-xs font-semibold leading-tight sm:text-sm ${
                      formatMode === opt.value ? "text-white" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={paren}
                onChange={(e) => setParen(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-gray-300"
                style={{ accentColor: ACCENT }}
              />
              Alan kodu parantez içinde
            </label>
          </div>

          <label htmlFor="telefon-input" className="mb-1.5 block text-xs font-medium text-gray-600">
            Numaraları yapıştırın
          </label>
          <InputTextarea
            id="telefon-input"
            value={input}
            onChange={setInput}
            placeholder={"05321234567\n532 123 45 67\n902121234567"}
            rows={8}
            className="font-mono resize-y"
          />
          <PrimaryButton className="mt-3" onClick={handleFormat}>
            Formatla
          </PrimaryButton>
        </div>

        {invalidLines.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {invalidLines.length} satır geçersiz veya tanınamadı (10–11 haneli numara beklenir).
          </div>
        )}

        {result.length > 0 && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-gray-900">
              {result.join("\n")}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className={`mt-4 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition sm:w-auto ${
                copied
                  ? "border-emerald-400 bg-emerald-600 text-white"
                  : "border-emerald-300/80 bg-white text-emerald-900 shadow-sm hover:bg-emerald-50"
              }`}
              style={{ borderColor: copied ? undefined : "rgba(16, 185, 129, 0.35)" }}
            >
              {copied ? "✓ Kopyalandı" : "Sonucu kopyala"}
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
