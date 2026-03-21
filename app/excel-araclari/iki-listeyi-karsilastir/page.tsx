"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

function parseLines(text: string, caseSensitive: boolean): Set<string> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const set = new Set<string>();
  lines.forEach((l) => set.add(caseSensitive ? l : l.toLowerCase()));
  return set;
}

function toDisplaySet(
  set: Set<string>,
  caseSensitive: boolean,
  originalList: string[]
): string[] {
  if (caseSensitive) return Array.from(set).sort();
  const lowerToOriginal = new Map<string, string>();
  originalList.forEach((s) => {
    const t = s.trim();
    if (t && !lowerToOriginal.has(t.toLowerCase())) lowerToOriginal.set(t.toLowerCase(), t);
  });
  return Array.from(set)
    .map((lower) => lowerToOriginal.get(lower) ?? lower)
    .sort((a, b) => a.localeCompare(b, "tr"));
}

export default function IkiListeyiKarsilastirPage() {
  const [listA, setListA] = useState("");
  const [listB, setListB] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [result, setResult] = useState<{
    ortak: string[];
    onlyA: string[];
    onlyB: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  /** "text" = virgülle metin (SQL vb.), "excel" = 3 sütun (sekme ile Excel'e yapıştır) */
  const [copyFormat, setCopyFormat] = useState<"text" | "excel">("text");

  function handleCompare() {
    const origA = listA.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const origB = listB.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const setA = parseLines(listA, caseSensitive);
    const setB = parseLines(listB, caseSensitive);

    const ortakSet = new Set<string>();
    const onlyASet = new Set<string>();
    const onlyBSet = new Set<string>();

    setA.forEach((v) => {
      if (setB.has(v)) ortakSet.add(v);
      else onlyASet.add(v);
    });
    setB.forEach((v) => {
      if (!setA.has(v)) onlyBSet.add(v);
    });

    setResult({
      ortak: toDisplaySet(ortakSet, caseSensitive, [...origA, ...origB]),
      onlyA: toDisplaySet(onlyASet, caseSensitive, origA),
      onlyB: toDisplaySet(onlyBSet, caseSensitive, origB),
    });
    setCopied(false);
  }

  function getCopyText(format: "text" | "excel"): string {
    if (!result) return "";
    if (format === "text") {
      return [
        "Ortak kayıtlar → " + result.ortak.join(", "),
        "Sadece A'da → " + result.onlyA.join(", "),
        "Sadece B'de → " + result.onlyB.join(", "),
      ].join("\n");
    }
    // Excel: 3 sütun, sekme ile ayrılmış; satır sayısı en uzun sütuna göre (boş hücre ile doldurulur)
    const maxRows = Math.max(result.ortak.length, result.onlyA.length, result.onlyB.length, 1);
    const header = "Ortak olan\tSadece A'da olan\tSadece B'de olan";
    const rows: string[] = [];
    for (let i = 0; i < maxRows; i++) {
      const a = result.ortak[i] ?? "";
      const b = result.onlyA[i] ?? "";
      const c = result.onlyB[i] ?? "";
      rows.push([a, b, c].join("\t"));
    }
    return [header, ...rows].join("\n");
  }

  async function handleCopy() {
    const text = getCopyText(copyFormat);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error("Kopyalanamadı:", e);
    }
  }

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        İki farklı listeyi karşılaştırır ve üç sonucu çıkarır:{" "}
        <span className="font-semibold text-gray-900">ortak kayıtlar</span>,{" "}
        <span className="font-semibold text-gray-900">sadece A&apos;da olanlar</span> ve{" "}
        <span className="font-semibold text-gray-900">sadece B&apos;de olanlar</span>. Fark analizi ve eşleştirme işleri hızlanır.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">
            Liste A: <span className="font-mono">Ahmet, Mehmet, Ayşe</span>
            <br />
            Liste B: <span className="font-mono">Mehmet, Ali, Ayşe</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">
            Ortak: <span className="font-mono">Mehmet, Ayşe</span>
            <br />
            Sadece A: <span className="font-mono">Ahmet</span> · Sadece B:{" "}
            <span className="font-mono">Ali</span>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="İki Listeyi Karşılaştır"
      description="İki listeyi karşılaştırır, ortak ve farklı kayıtları bulur."
      path="/excel-araclari/iki-listeyi-karsilastir"
      keywords={["iki listeyi karşılaştır", "liste karşılaştırma", "ortak kayıt", "farklı kayıt", "excel liste"]}
      howToSteps={[
        "Liste A ve B'yi yapıştırın.",
        "Karşılaştır butonuna tıklayın.",
        "Ortak ve farklı kayıtları görün.",
      ]}
      faq={[
        {
          question: "Büyük/küçük harf duyarlı?",
          answer: "Açıkken 'Ahmet' ile 'ahmet' farklı kabul edilir.",
        },
        {
          question: "Excel'e nasıl aktarırım?",
          answer: "Excel (3 sütun) formatıyla kopyalayın.",
        },
        {
          question: "Tekrarlanan kayıtlar?",
          answer: "Küme mantığıyla karşılaştırılır.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <Link
          href="/blog/iki-listeyi-karsilastirma-excel"
          className="font-medium underline underline-offset-2"
          style={{ color: ACCENT }}
        >
          İki listeyi karşılaştırma (Excel)
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-gray-800">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
              style={{ accentColor: ACCENT }}
            />
            <span className="font-medium">Büyük/küçük harf duyarlı</span>
          </label>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="iki-liste-a"
                className="mb-1.5 block text-sm font-semibold text-gray-900"
              >
                Liste A
              </label>
              <InputTextarea
                id="iki-liste-a"
                value={listA}
                onChange={setListA}
                rows={8}
                minHeight="12rem"
                className="resize-y font-mono text-sm"
                placeholder={"Ahmet\nMehmet\nAyşe"}
              />
            </div>
            <div>
              <label
                htmlFor="iki-liste-b"
                className="mb-1.5 block text-sm font-semibold text-gray-900"
              >
                Liste B
              </label>
              <InputTextarea
                id="iki-liste-b"
                value={listB}
                onChange={setListB}
                rows={8}
                minHeight="12rem"
                className="resize-y font-mono text-sm"
                placeholder={"Mehmet\nAli\nAyşe"}
              />
            </div>
          </div>

          <PrimaryButton className="mt-3" onClick={handleCompare}>
            Karşılaştır
          </PrimaryButton>
        </div>

        {result && (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-gray-200/70 p-1">
                <button
                  type="button"
                  onClick={() => setCopyFormat("text")}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    copyFormat === "text"
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:bg-white/60"
                  }`}
                  style={copyFormat === "text" ? { background: ACCENT } : undefined}
                >
                  Metin
                </button>
                <button
                  type="button"
                  onClick={() => setCopyFormat("excel")}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    copyFormat === "excel"
                      ? "text-white shadow-sm"
                      : "text-gray-600 hover:bg-white/60"
                  }`}
                  style={copyFormat === "excel" ? { background: ACCENT } : undefined}
                >
                  Excel
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
                  copied
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                }`}
                style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
              >
                {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div className="overflow-hidden rounded-2xl border border-gray-200 border-l-4 border-l-emerald-500 bg-white shadow-md">
                <div className="flex items-baseline justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5">
                  <h2 className="text-sm font-bold text-gray-900">Ortak kayıtlar</h2>
                  <span className="tabular-nums text-sm font-semibold text-gray-500">
                    {result.ortak.length}
                  </span>
                </div>
                <ul className="max-h-48 overflow-y-auto px-4 py-3 font-mono text-sm text-gray-800 sm:px-5">
                  {result.ortak.length ? (
                    result.ortak.map((item) => (
                      <li key={item} className="border-b border-gray-50 py-1 last:border-0">
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">—</li>
                  )}
                </ul>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 border-l-4 border-l-blue-500 bg-white shadow-md">
                <div className="flex items-baseline justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5">
                  <h2 className="text-sm font-bold text-gray-900">Sadece A&apos;da</h2>
                  <span className="tabular-nums text-sm font-semibold text-gray-500">
                    {result.onlyA.length}
                  </span>
                </div>
                <ul className="max-h-48 overflow-y-auto px-4 py-3 font-mono text-sm text-gray-800 sm:px-5">
                  {result.onlyA.length ? (
                    result.onlyA.map((item) => (
                      <li key={item} className="border-b border-gray-50 py-1 last:border-0">
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">—</li>
                  )}
                </ul>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 border-l-4 border-l-amber-500 bg-white shadow-md">
                <div className="flex items-baseline justify-between gap-2 border-b border-gray-100 px-4 py-3 sm:px-5">
                  <h2 className="text-sm font-bold text-gray-900">Sadece B&apos;de</h2>
                  <span className="tabular-nums text-sm font-semibold text-gray-500">
                    {result.onlyB.length}
                  </span>
                </div>
                <ul className="max-h-48 overflow-y-auto px-4 py-3 font-mono text-sm text-gray-800 sm:px-5">
                  {result.onlyB.length ? (
                    result.onlyB.map((item) => (
                      <li key={item} className="border-b border-gray-50 py-1 last:border-0">
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">—</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
