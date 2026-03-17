"use client";

import React, { useState } from "react";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

const TR_AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function parseDate(s: string): Date | null {
  const t = s.trim();
  if (!t) return null;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  const dmy = /^(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})/.exec(t);
  if (dmy) {
    const d = new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
    return isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(t);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function pad(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

type OutFormat = "iso" | "trLong" | "ddmmyyyyDot" | "ddmmyyyySlash";

function formatDate(d: Date, fmt: OutFormat): string {
  const g = d.getDate();
  const a = d.getMonth();
  const y = d.getFullYear();
  if (fmt === "iso") return `${y}-${pad(d.getMonth() + 1)}-${pad(g)}`;
  if (fmt === "trLong") return `${pad(g)} ${TR_AYLAR[a]} ${y}`;
  if (fmt === "ddmmyyyyDot") return `${pad(g)}.${pad(a + 1)}.${y}`;
  if (fmt === "ddmmyyyySlash") return `${pad(g)}/${pad(a + 1)}/${y}`;
  return "";
}

export default function TarihFormatDonusturucuPage() {
  const [input, setInput] = useState("");
  const [outFormat, setOutFormat] = useState<OutFormat>("iso");
  const [result, setResult] = useState<string[]>([]);
  const [invalidLines, setInvalidLines] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function handleConvert() {
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const out: string[] = [];
    const invalid: string[] = [];
    lines.forEach((line) => {
      const d = parseDate(line);
      if (d) {
        out.push(formatDate(d, outFormat));
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
        name="Tarih Format Dönüştürücü — Ücretsiz Tarih Format Aracı"
        description="Tarih formatlarını farklı biçimlere çevirir: ISO, Türkçe uzun, GG.AA.YYYY. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/tarih-format-donusturucu"
        keywords={["tarih format dönüştürücü", "tarih formatı", "ISO tarih", "Excel tarih formatı"]}
      />
      <PageRibbon
        title="Tarih Format Dönüştürücü"
        description="Tarih formatlarını farklı biçimlere çevirir (ISO, Türkçe uzun, GG.AA.YYYY vb.)."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Tarihleri aşağıdaki alana yapıştırın (her satırda bir tarih). 01/03/2025, 01.03.2025, 2025-03-01 gibi formatlar desteklenir.",
            "Hedef formatı seçin: ISO (YYYY-MM-DD), Türkçe uzun (01 Mart 2025), GG.AA.YYYY veya GG/AA/YYYY.",
            "Dönüştür butonuna tıklayın.",
            "Sonucu kopyalayıp Excel veya başka uygulamaya yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de tarihi metin olarak farklı formatta göstermek için <strong>METNEÇEVIR</strong> (TEXT) fonksiyonunu kullanabilirsiniz. A1 tarih hücresidir.
              </p>
              <ExcelFormulBlok
                baslik="ISO (YYYY-MM-DD) için:"
                formül="=METNEÇEVIR(A1;'yyyy-aa-gg')"
                aciklama="METNEÇEVIR (TEXT) tarihi verilen biçimde metne çevirir. yyyy yıl, aa ay (iki hane), gg gün. İngilizce Excel'de =TEXT(A1,'yyyy-mm-dd')."
              />
              <ExcelFormulBlok
                baslik="Türkçe uzun (01 Mart 2025) için:"
                formül="=METNEÇEVIR(A1;'gg aaaa yyyy')"
                aciklama="gg gün (iki hane), aaaa ay adı (Mart, Nisan…), yyyy yıl. Hücre dil ayarı Türkçe ise ay adları Türkçe gelir. İngilizce: =TEXT(A1,'dd mmmm yyyy')."
              />
              <ExcelFormulBlok
                baslik="GG.AA.YYYY için:"
                formül="=METNEÇEVIR(A1;'gg.aa.yyyy')"
                aciklama="Nokta ile ayrılmış gün, ay, yıl. Virgüllü ondalık ayırıcı kullanan Türkçe Excel'de formülde nokta kullanın; bazen 'gg.aa.yyyy' yerine 'gg\.aa\.yyyy' gerekebilir."
              />
            </>
          }
        />

        <div>
          <span className="block text-xs font-medium text-gray-600 mb-2">Hedef format</span>
          <div className="inline-flex flex-wrap rounded-lg border p-1 gap-0.5" style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}>
            <button type="button" onClick={() => setOutFormat("iso")} className={`rounded px-3 py-1.5 text-sm font-medium transition ${outFormat === "iso" ? "text-white" : "text-gray-600 hover:bg-gray-200"}`} style={outFormat === "iso" ? { background: THEME.ribbon } : undefined}>ISO (YYYY-MM-DD)</button>
            <button type="button" onClick={() => setOutFormat("trLong")} className={`rounded px-3 py-1.5 text-sm font-medium transition ${outFormat === "trLong" ? "text-white" : "text-gray-600 hover:bg-gray-200"}`} style={outFormat === "trLong" ? { background: THEME.ribbon } : undefined}>Türkçe uzun (01 Mart 2025)</button>
            <button type="button" onClick={() => setOutFormat("ddmmyyyyDot")} className={`rounded px-3 py-1.5 text-sm font-medium transition ${outFormat === "ddmmyyyyDot" ? "text-white" : "text-gray-600 hover:bg-gray-200"}`} style={outFormat === "ddmmyyyyDot" ? { background: THEME.ribbon } : undefined}>GG.AA.YYYY</button>
            <button type="button" onClick={() => setOutFormat("ddmmyyyySlash")} className={`rounded px-3 py-1.5 text-sm font-medium transition ${outFormat === "ddmmyyyySlash" ? "text-white" : "text-gray-600 hover:bg-gray-200"}`} style={outFormat === "ddmmyyyySlash" ? { background: THEME.ribbon } : undefined}>GG/AA/YYYY</button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tarihler (her satırda bir; 01/03/2025, 2025-03-01 vb.)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="01/03/2025\n01.03.2025\n2025-03-01"
            rows={8}
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
            {invalidLines.length} satır tanınamadı (GG/AA/YYYY veya YYYY-MM-DD formatında girin).
          </p>
        )}

        {result.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dönüştürülmüş tarihler</label>
            <pre className="rounded-lg border p-4 text-sm bg-white font-mono text-gray-800 max-h-80 overflow-y-auto whitespace-pre-wrap" style={{ borderColor: THEME.gridLine }}>
              {result.join("\n")}
            </pre>
          </div>
        )}
      </div>

      <BenzerExcelAraclari currentHref="/excel-araclari/tarih-format-donusturucu" />
    </div>
  );
}
