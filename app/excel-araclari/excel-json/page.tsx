"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

function detectSeparator(line: string): string {
  if (line.includes("\t")) return "\t";
  if (line.includes("|")) return "|";
  if (line.includes(";")) return ";";
  if (line.includes(",")) return ",";
  return "\t";
}

function looksLikeNumber(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return /^-?\d+([.,]\d+)?$/.test(t.replace(",", "."));
}

function toJsonValue(cell: string): number | string {
  const t = cell.trim();
  if (looksLikeNumber(t)) {
    const normalized = t.replace(",", ".");
    return normalized.includes(".") ? parseFloat(normalized) : parseInt(normalized, 10);
  }
  return t;
}

export default function ExcelJsonPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [pretty, setPretty] = useState(true);

  function handleConvert() {
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setResult("");
      return;
    }

    const sep = detectSeparator(lines[0]);
    const headers = lines[0].split(sep).map((h) => h.trim()).filter(Boolean);
    if (!headers.length) {
      setResult("");
      return;
    }

    const arr: Record<string, number | string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(sep).map((c) => c.trim());
      const obj: Record<string, number | string> = {};
      headers.forEach((h, j) => {
        obj[h] = toJsonValue(cells[j] ?? "");
      });
      arr.push(obj);
    }

    const jsonStr = pretty ? JSON.stringify(arr, null, 2) : JSON.stringify(arr);
    setResult(jsonStr);
    setCopied(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error("Kopyalanamadı:", e);
    }
  }

  const objCount = result ? (result.match(/\{\s*"/g)?.length ?? 0) : 0;

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Excel veya CSV verisini JSON formatına çevirir. İlk satırı sütun başlığı kabul ederek her satırı bir JSON objesine dönüştürür; API veya entegrasyon işlerinde hız sağlar.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi (CSV/Excel)</p>
          <p className="font-mono text-gray-700">
            <span className="font-mono">{"id\\tnad"}</span> /{" "}
            <span className="font-mono">{"1\\tAhmet"}</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">Her satır için bir JSON objesi; kopyalayıp kullanabilirsiniz.</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        “Girintili” seçeneği JSON’un okunurluğunu artırır.
      </p>
    </>
  );

  return (
    <ToolLayout
      title="Excel → JSON Dönüştürücü"
      description="Excel veya CSV verisini JSON formatına çevirir. API ve yazılım geliştirme için kullanılır."
      path="/excel-araclari/excel-json"
      howToSteps={[
        "Excel veya CSV'den tabloyu kopyalayıp aşağıdaki alana yapıştırın (ilk satır sütun başlıkları olmalı). Sekme, pipe (|), virgül veya noktalı virgül desteklenir.",
        "İsterseniz 'Girintili (okunaklı)' seçeneğini işaretleyin veya kaldırın.",
        "Dönüştür butonuna tıklayın.",
        "Oluşan JSON'u Kopyala ile alıp API isteği veya kodunuzda kullanın.",
      ]}
      faq={[
        {
          question: "Ayırıcılar çalışır mı?",
          answer: "Evet. Sekme, |, virgül ve noktalı virgül desteklenir.",
        },
        {
          question: "İlk satır ne işe yarar?",
          answer: "Sütun adları için kullanılır; JSON anahtarları buradan gelir.",
        },
        {
          question: "Sonucu nasıl kullanırım?",
          answer: "“Kopyala” ile JSON'u alıp API isteği veya koda yapıştırın.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          <Link
            href="/blog/excel-json-donusturucu"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Excel&apos;den JSON rehberi
          </Link>
        </span>
      }
      keywords={["excel to json", "csv to json", "excel json dönüştürücü", "tablo json"]}
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Çıktı
            </span>
            <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={pretty}
                onChange={(e) => setPretty(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
                style={{ accentColor: ACCENT }}
              />
              <span className="font-medium">Girintili (okunaklı)</span>
            </label>
          </div>

          <label
            htmlFor="excel-json-input"
            className="block text-sm font-semibold text-gray-900"
          >
            Excel / CSV verisi (ilk satır = sütun adları, sekme veya | ile ayrılmış)
          </label>
          <div className="mt-1.5">
            <InputTextarea
              id="excel-json-input"
              value={input}
              onChange={setInput}
              rows={10}
              minHeight="12rem"
              className="resize-y font-mono text-sm"
              placeholder={"id\tad\n1\tAhmet\n2\tMehmet"}
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleConvert}>
            Dönüştür
          </PrimaryButton>

          {objCount > 0 && (
            <p className="mt-2 text-xs font-medium tabular-nums text-gray-600">
              {objCount} nesne
            </p>
          )}

          {result ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
              <label
                htmlFor="excel-json-output"
                className="block text-sm font-semibold text-gray-900"
              >
                JSON çıktısı
              </label>
              <pre
                id="excel-json-output"
                className="mt-2 max-h-80 overflow-x-auto overflow-y-auto whitespace-pre-wrap rounded-xl border border-emerald-200/80 bg-white p-3 font-mono text-xs text-gray-900 shadow-sm sm:text-sm"
              >
                {result}
              </pre>
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
                  {copied ? "Kopyalandı ✓" : "Kopyala"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}
