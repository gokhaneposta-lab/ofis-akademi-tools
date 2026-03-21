"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { validateIBAN } from "@/lib/iban";

const ACCENT = "#217346";

export default function IbanDogrulamaPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleValidate() {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/\s/g, ""))
      .filter(Boolean);
    const output: string[] = [];
    for (const line of lines) {
      const { valid, message } = validateIBAN(line);
      output.push(
        valid
          ? `${line}\tGeçerli`
          : `${line}\tGeçersiz${message ? " — " + message : ""}`,
      );
    }
    setResult(output.join("\n"));
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

  const validCount = result
    ? result.split("\n").filter((l) => l.includes("\tGeçerli")).length
    : 0;
  const totalCount = result ? result.split("\n").filter(Boolean).length : 0;

  const howToSteps = [
    "IBAN'ları kutuya yapıştırın (her satıra bir IBAN).",
    "Doğrula butonuna tıklayın.",
    "Geçerli/Geçersiz sonucunu görün.",
  ];

  const faq = [
    {
      question: "Boşluklu IBAN girebilir miyim?",
      answer: "Evet, boşluklar otomatik temizlenir.",
    },
    {
      question: "Toplu IBAN kontrolü?",
      answer: "Her satıra bir IBAN yazarak toplu doğrulama yapabilirsiniz.",
    },
    {
      question: "Sonuçları nasıl aktarırım?",
      answer: "Sonucu kopyalayıp Excel'e yapıştırın.",
    },
  ];

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        IBAN listesini toplu olarak doğrular; geçerli ve geçersiz kayıtları
        ayırır. TR ve uluslararası IBAN formatı (MOD-97) desteklenir. Ödeme
        öncesi hatalı IBAN riskini azaltır ve operasyon sürecini hızlandırır.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="font-mono text-gray-700 break-all">
            TR33 0006 1005 1978 6457 8413 26
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="font-mono text-gray-700 break-all">
            TR330006100519786457841326 → Geçerli
          </p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="IBAN Doğrulama"
      description="IBAN numaralarını doğrulayın. TR ve uluslararası IBAN desteklenir."
      path="/excel-araclari/iban-dogrulama"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <>
          <Link
            href="/egitimler/orta"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Orta seviye eğitim
          </Link>
          <span className="text-gray-400" aria-hidden>
            ·
          </span>
          <Link
            href="/blog/excelde-iban-dogrulama"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Excel&apos;de IBAN doğrulama
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label
            htmlFor="iban-input"
            className="mb-2 block text-sm font-semibold text-gray-900"
          >
            IBAN&apos;ları yapıştırın
          </label>
          <InputTextarea
            id="iban-input"
            value={input}
            onChange={setInput}
            rows={6}
            minHeight="10rem"
            className="font-mono"
            placeholder={
              "Her satıra bir IBAN yazın veya yapıştırın...\n" +
              "TR33 0006 1005 1978 6457 8413 26\n" +
              "TR12 0004 6002 1588 8000 0132 95"
            }
          />
          <PrimaryButton className="mt-3" onClick={handleValidate}>
            Doğrula
          </PrimaryButton>
        </div>

        {totalCount > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-700">
              <strong className="tabular-nums text-gray-900">{validCount}</strong>{" "}
              / {totalCount} geçerli
            </p>
          </div>
        )}

        {result && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="divide-y divide-gray-100">
              {result
                .split("\n")
                .filter(Boolean)
                .map((line, i) => {
                  const tabIdx = line.indexOf("\t");
                  const iban =
                    tabIdx >= 0 ? line.slice(0, tabIdx) : line;
                  const afterTab =
                    tabIdx >= 0 ? line.slice(tabIdx + 1) : "";
                  const isValid = afterTab.startsWith("Geçerli");
                  return (
                    <div
                      key={`${i}-${iban.slice(0, 12)}`}
                      className="flex items-start gap-3 px-4 py-3 sm:items-center"
                    >
                      <span
                        className="mt-0.5 shrink-0 sm:mt-0"
                        aria-hidden
                      >
                        {isValid ? (
                          <svg
                            className="h-5 w-5 text-emerald-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="h-5 w-5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </span>
                      <p className="min-w-0 flex-1 break-all font-mono text-sm text-gray-900">
                        {iban}
                      </p>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isValid
                            ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                            : "bg-red-50 text-red-800 ring-1 ring-red-200/80"
                        }`}
                      >
                        {isValid ? "Geçerli" : "Geçersiz"}
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="flex justify-end border-t border-gray-100 px-4 py-3">
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
