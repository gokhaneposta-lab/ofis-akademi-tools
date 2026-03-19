"use client";

import React, { useState } from "react";
import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="Excel → JSON Dönüştürücü — Ücretsiz Veri Aracı"
        description="Excel veya CSV verisini JSON formatına çevirir. API ve yazılım geliştirme için kullanılır. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/excel-json"
        keywords={["excel to json", "csv to json", "excel json dönüştürücü", "tablo json"]}
      />
      <PageRibbon
        title="Excel → JSON Dönüştürücü"
        description="Excel veya CSV verisini JSON formatına çevirir. API ve yazılım geliştirme için kullanılır."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Excel veya CSV'den tabloyu kopyalayıp aşağıdaki alana yapıştırın (ilk satır sütun başlıkları olmalı). Sekme, pipe (|), virgül veya noktalı virgül desteklenir.",
            "İsterseniz 'Girintili (okunaklı)' seçeneğini işaretleyin veya kaldırın.",
            "Dönüştür butonuna tıklayın.",
            "Oluşan JSON'u Kopyala ile alıp API isteği veya kodunuzda kullanın.",
          ]}
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Excel veya CSV verisini JSON formatına çevirir. İlk satırı sütun başlığı kabul ederek her satırı bir JSON objesine dönüştürür; API veya entegrasyon işlerinde hız sağlar.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Girdi (CSV/Excel):</span> <span className="font-mono">id\tnad</span> / <span className="font-mono">1\tAhmet</span>
            </p>
            <p>
              <span className="font-semibold">Çıktı:</span> her satır için JSON objesi; kopyalayıp kullanabilirsiniz.
            </p>
            <p className="text-xs text-gray-500">“Girintili” seçeneği JSON’un okunurluğunu artırır.</p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Ayırıcılar çalışır mı?</span>
              <br />
              Evet. Sekme, `|`, virgül ve noktalı virgül desteklenir.
            </p>
            <p>
              <span className="font-semibold">İlk satır ne işe yarar?</span>
              <br />
              Sütun adları için kullanılır; JSON anahtarları buradan gelir.
            </p>
            <p>
              <span className="font-semibold">Sonucu nasıl kullanırım?</span>
              <br />
              “Kopyala” ile JSON’u alıp API isteği veya koda yapıştır.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Daha fazla örnek için{" "}
            <Link
              href="/blog/excel-json-donusturucu"
              className="underline"
              style={{ color: THEME.ribbon }}
            >
              Excel'den JSON rehberine
            </Link>{" "}
            bakabilirsin.
          </p>
        </section>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Çıktı</label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={pretty}
              onChange={(e) => setPretty(e.target.checked)}
              className="h-4 w-4 rounded border-gray-400"
              style={{ accentColor: THEME.ribbon }}
            />
            Girintili (okunaklı)
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Excel / CSV verisi (ilk satır = sütun adları, sekme veya | ile ayrılmış)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"id\tad\n1\tAhmet\n2\tMehmet"}
            rows={10}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleConvert}
            className="px-4 py-2 text-sm font-semibold rounded text-white hover:opacity-90 transition"
            style={{ background: THEME.ribbon }}
          >
            Dönüştür
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result}
            className={`px-4 py-2 text-sm font-medium rounded transition flex items-center gap-2 ${
              copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {copied ? "✓ Kopyalandı" : "Kopyala"}
          </button>
          {objCount > 0 && (
            <span className="text-xs text-gray-500">{objCount} nesne</span>
          )}
        </div>

        {result ? (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">JSON çıktısı</label>
            <pre className="rounded-lg border p-4 text-xs sm:text-sm bg-gray-50 overflow-x-auto whitespace-pre-wrap font-mono text-gray-800 max-h-80 overflow-y-auto" style={{ borderColor: THEME.gridLine }}>
              {result}
            </pre>
          </div>
        ) : null}
      </div>

      <BenzerExcelAraclari currentHref="/excel-araclari/excel-json" />
    </div>
  );
}
