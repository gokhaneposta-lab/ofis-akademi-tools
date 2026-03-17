"use client";

import React, { useState } from "react";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

type Separator = " " | "-" | ".";
type FormatMode = "local" | "international";

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
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="Telefon Numarası Formatlama — Ücretsiz Format Aracı"
        description="Telefon numaralarını standart formata çevirir. Yerel, uluslararası, parantez ve ayırıcı seçenekleri. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/telefon-formatlama"
        keywords={["telefon formatlama", "telefon numarası formatı", "0532 format", "+90 format"]}
      />
      <PageRibbon
        title="Telefon Numarası Formatlama"
        description="Telefon numaralarını standart formata çevirir (yerel, uluslararası, parantez, boşluk/tire/nokta)."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Telefon numaralarını aşağıdaki alana yapıştırın (her satırda bir numara). Sadece rakam veya 0 ile başlayan numara olabilir; Excel'den sütun kopyalayabilirsiniz.",
            "Ayırıcı (boşluk, tire, nokta), görünüm (yerel 0 ile / uluslararası +90) ve alan kodu parantez seçeneklerini belirleyin.",
            "Formatla butonuna tıklayın.",
            "Sonucu kopyalayıp Excel veya başka uygulamaya yapıştırın.",
          ]}
        />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Telefon numaraları (her satırda bir)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="05321234567\n532 123 45 67\n902121234567"
            rows={8}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        <div className="space-y-4">
          <div>
            <span className="block text-xs font-medium text-gray-600 mb-2">Ayırıcı</span>
            <div className="inline-flex rounded-lg border p-1 gap-0.5" style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}>
              {([" ", "-", "."] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeparator(s)}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition ${separator === s ? "text-white" : "text-gray-600 hover:bg-gray-200"}`}
                  style={separator === s ? { background: THEME.ribbon } : undefined}
                >
                  {s === " " ? "Boşluk" : s === "-" ? "Tire (-)" : "Nokta (.)"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-600 mb-2">Görünüm</span>
            <div className="inline-flex rounded-lg border p-1 gap-0.5" style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}>
              <button
                type="button"
                onClick={() => setFormatMode("local")}
                className={`rounded px-3 py-1.5 text-sm font-medium transition ${formatMode === "local" ? "text-white" : "text-gray-600 hover:bg-gray-200"}`}
                style={formatMode === "local" ? { background: THEME.ribbon } : undefined}
              >
                Yerel (0 ile)
              </button>
              <button
                type="button"
                onClick={() => setFormatMode("international")}
                className={`rounded px-3 py-1.5 text-sm font-medium transition ${formatMode === "international" ? "text-white" : "text-gray-600 hover:bg-gray-200"}`}
                style={formatMode === "international" ? { background: THEME.ribbon } : undefined}
              >
                Uluslararası (+90)
              </button>
            </div>
          </div>
          <div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={paren}
                onChange={(e) => setParen(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400"
                style={{ accentColor: THEME.ribbon }}
              />
              Alan kodu parantez içinde
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleFormat}
            className="px-4 py-2 text-sm font-semibold rounded text-white hover:opacity-90 transition"
            style={{ background: THEME.ribbon }}
          >
            Formatla
          </button>
          {result.length > 0 && (
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 text-sm font-medium rounded transition ${copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
            >
              {copied ? "✓ Kopyalandı" : "Sonucu Kopyala"}
            </button>
          )}
        </div>

        {invalidLines.length > 0 && (
          <p className="text-xs text-amber-700">
            {invalidLines.length} satır geçersiz veya tanınamadı (10–11 haneli numara beklenir).
          </p>
        )}

        {result.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Formatlanmış numaralar</label>
            <pre className="rounded-lg border p-4 text-sm bg-white font-mono text-gray-800 max-h-80 overflow-y-auto whitespace-pre-wrap" style={{ borderColor: THEME.gridLine }}>
              {result.join("\n")}
            </pre>
          </div>
        )}
      </div>

      <BenzerExcelAraclari currentHref="/excel-araclari/telefon-formatlama" />
    </div>
  );
}
