"use client";

import React, { useState } from "react";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="İki Listeyi Karşılaştır — Ücretsiz Liste Karşılaştırma Aracı"
        description="İki listeyi karşılaştırır ve ortak veya farklı kayıtları bulur. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/iki-listeyi-karsilastir"
        keywords={["iki listeyi karşılaştır", "liste karşılaştırma", "ortak kayıt", "farklı kayıt", "excel liste"]}
      />
      <PageRibbon
        title="İki Listeyi Karşılaştır"
        description="İki listeyi karşılaştırır ve ortak veya farklı kayıtları bulur."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Liste A ve Liste B alanlarına karşılaştırmak istediğiniz satırları yapıştırın (her satırda bir kayıt). Excel'den tek sütun kopyalayabilirsiniz.",
            "İsterseniz 'Büyük/küçük harf duyarlı' seçeneğini işaretleyin.",
            "Karşılaştır butonuna tıklayın.",
            "Ortak kayıtlar, sadece A'da olanlar ve sadece B'de olanlar gösterilir. Sonucu Metin (virgülle) veya Excel (3 sütun) olarak kopyalayabilirsiniz.",
          ]}
        />

        <div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700 mb-2">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-400"
              style={{ accentColor: THEME.ribbon }}
            />
            Büyük/küçük harf duyarlı
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Liste A (her satırda bir kayıt)</label>
            <textarea
              value={listA}
              onChange={(e) => setListA(e.target.value)}
              placeholder="Ahmet\nMehmet\nAyşe"
              rows={8}
              className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Liste B (her satırda bir kayıt)</label>
            <textarea
              value={listB}
              onChange={(e) => setListB(e.target.value)}
              placeholder="Mehmet\nAli\nAyşe"
              rows={8}
              className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCompare}
            className="px-4 py-2 text-sm font-semibold rounded text-white hover:opacity-90 transition"
            style={{ background: THEME.ribbon }}
          >
            Karşılaştır
          </button>
          {result && (
            <>
              <span className="text-xs text-gray-500">Kopyala formatı:</span>
              <div className="inline-flex rounded-lg border p-1 gap-0.5" style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}>
                <button
                  type="button"
                  onClick={() => setCopyFormat("text")}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition ${copyFormat === "text" ? "text-white" : "text-gray-600 hover:bg-gray-200"}`}
                  style={copyFormat === "text" ? { background: THEME.ribbon } : undefined}
                >
                  Metin (virgülle)
                </button>
                <button
                  type="button"
                  onClick={() => setCopyFormat("excel")}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition ${copyFormat === "excel" ? "text-white" : "text-gray-600 hover:bg-gray-200"}`}
                  style={copyFormat === "excel" ? { background: THEME.ribbon } : undefined}
                >
                  Excel (3 sütun)
                </button>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2 text-sm font-medium rounded transition flex items-center gap-2 ${
                  copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {copied ? "✓ Kopyalandı" : "Sonucu Kopyala"}
              </button>
            </>
          )}
        </div>

        {result && (
          <div className="rounded-lg border p-4 space-y-3 bg-white" style={{ borderColor: THEME.gridLine }}>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ortak kayıtlar</span>
              <p className="mt-1 text-sm text-gray-800">
                {result.ortak.length ? result.ortak.join(", ") : "—"}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sadece A'da</span>
              <p className="mt-1 text-sm text-gray-800">
                {result.onlyA.length ? result.onlyA.join(", ") : "—"}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sadece B'de</span>
              <p className="mt-1 text-sm text-gray-800">
                {result.onlyB.length ? result.onlyB.join(", ") : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      <BenzerExcelAraclari currentHref="/excel-araclari/iki-listeyi-karsilastir" />
    </div>
  );
}
