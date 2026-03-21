"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

type DelimiterOption = "semicolon" | "comma" | "pipe" | "space" | "newline" | "custom";

export default function ListeBirlestirici() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterOption>("semicolon");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [result, setResult] = useState("");
  const [lineCount, setLineCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sqlInFormat, setSqlInFormat] = useState(false);

  function handleJoin() {
    const lines = input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    setLineCount(lines.length);

    if (!lines.length) {
      setResult("");
      setCopied(false);
      return;
    }

    let joined: string;

    if (sqlInFormat) {
      const inner = lines.join(",");
      joined = `IN (${inner})`;
    } else {
      let sep = ";";
      switch (delimiter) {
        case "comma":
          sep = ",";
          break;
        case "pipe":
          sep = "|";
          break;
        case "space":
          sep = " ";
          break;
        case "newline":
          sep = "\n";
          break;
        case "custom":
          sep = customDelimiter;
          break;
        case "semicolon":
        default:
          sep = ";";
      }
      joined = lines.join(sep);
    }

    setResult(joined);
    setCopied(false);
  }

  async function handleCopy() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (error) {
      console.error("Panoya kopyalanamadı:", error);
    }
  }

  const processedInfo =
    lineCount > 0 ? `${lineCount} satır işlendi` : "Henüz satır işlenmedi";

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Alt alta satırları tek satırda birleştirir. Özellikle ID listesi hazırlama, SQL IN sorgusu üretme ve farklı kaynaklardan gelen verileri tek formatta toplamada kullanılır.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">12345 ↵ 23456 ↵ 34567</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">12345;23456;34567 veya IN (12345,23456,34567)</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Liste Birleştirici"
      description="Birden fazla satırdaki değerleri ayraç ile tek satırda birleştirin."
      path="/excel-araclari/liste-birlestir"
      keywords={["excel liste birleştirme", "liste birleştirici", "satırları birleştir"]}
      howToSteps={[
        "Satırları kutuya yapıştırın.",
        "Ayracı seçin.",
        "Birleştir butonuna tıklayın.",
      ]}
      faq={[
        {
          question: "SQL IN formatı ne zaman?",
          answer: "WHERE id IN (...) kullanacaksanız bu modu açın.",
        },
        {
          question: "Özel ayraç?",
          answer: "Özel seçeneğinde istediğiniz karakteri yazabilirsiniz.",
        },
        {
          question: "Veriler kaydediliyor mu?",
          answer: "Hayır, tarayıcı içinde yapılır.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          <Link
            href="/egitimler/orta"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Orta seviye eğitim
          </Link>
          {" · "}
          <Link
            href="/blog/excel-listeleri-birlestirme"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Excel listeleri birleştirme
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ayraç
            </span>
            <div className="relative mt-1 flex flex-wrap gap-1 rounded-2xl bg-gray-200/70 p-1">
              <button
                type="button"
                onClick={() => setDelimiter("semicolon")}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  delimiter === "semicolon"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-white/60"
                }`}
                style={
                  delimiter === "semicolon" ? { background: ACCENT } : undefined
                }
              >
                Noktalı Virgül ;
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("comma")}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  delimiter === "comma"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-white/60"
                }`}
                style={delimiter === "comma" ? { background: ACCENT } : undefined}
              >
                Virgül ,
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("pipe")}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  delimiter === "pipe"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-white/60"
                }`}
                style={delimiter === "pipe" ? { background: ACCENT } : undefined}
              >
                Dikey Çizgi |
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("space")}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  delimiter === "space"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-white/60"
                }`}
                style={delimiter === "space" ? { background: ACCENT } : undefined}
              >
                Boşluk
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("newline")}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  delimiter === "newline"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-white/60"
                }`}
                style={
                  delimiter === "newline" ? { background: ACCENT } : undefined
                }
              >
                Yeni Satır
              </button>
              <button
                type="button"
                onClick={() => setDelimiter("custom")}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  delimiter === "custom"
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-white/60"
                }`}
                style={delimiter === "custom" ? { background: ACCENT } : undefined}
              >
                Özel
              </button>
            </div>
            {delimiter === "custom" && (
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => setCustomDelimiter(e.target.value)}
                placeholder="Özel ayraç (örn: || veya -)"
                className="mt-2 h-10 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              />
            )}
          </div>

          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={sqlInFormat}
              onChange={(e) => setSqlInFormat(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
              style={{ accentColor: ACCENT }}
            />
            <span className="font-medium">SQL IN formatı</span>
          </label>
          {sqlInFormat && (
            <p className="mt-2 text-xs text-gray-600">
              Bu modda değerler virgül ile birleştirilir ve{" "}
              <span className="font-semibold text-gray-800">IN (...)</span> şeklinde
              sarılır.
            </p>
          )}

          <label
            htmlFor="liste-birlestir-input"
            className="mt-4 block text-sm font-semibold text-gray-900"
          >
            Listeyi yapıştırın
          </label>
          <div className="mt-1.5">
            <InputTextarea
              id="liste-birlestir-input"
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="12rem"
              className="resize-y"
              placeholder={`Örn:\n12345678901\n23456789012\n34567890123`}
            />
          </div>
          <PrimaryButton className="mt-3" onClick={handleJoin}>
            Birleştir
          </PrimaryButton>
        </div>

        {lineCount > 0 && (
          <p className="mt-2 text-xs font-medium tabular-nums text-gray-600">
            {processedInfo}
          </p>
        )}

        {result && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <label
              htmlFor="liste-birlestir-result"
              className="block text-sm font-semibold text-gray-900"
            >
              Birleştirilmiş sonuç
            </label>
            <textarea
              id="liste-birlestir-result"
              readOnly
              value={result}
              rows={sqlInFormat ? 3 : 4}
              className="mt-2 w-full resize-y rounded-xl border border-emerald-200/80 bg-white px-3 py-3 font-mono text-sm text-gray-900 shadow-sm focus:outline-none"
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
    </ToolLayout>
  );
}
