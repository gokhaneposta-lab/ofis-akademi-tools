"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

type SeparatorMode = "auto" | "comma" | "semicolon" | "tab";

function detectSeparator(lines: string[]): SeparatorMode | null {
  const firstNonEmpty = lines.find((l) => l.trim().length > 0);
  if (!firstNonEmpty) return null;
  const candidates: { mode: SeparatorMode; char: string }[] = [
    { mode: "comma", char: "," },
    { mode: "semicolon", char: ";" },
    { mode: "tab", char: "\t" },
  ];
  let best: SeparatorMode | null = null;
  let bestCount = 0;
  for (const c of candidates) {
    const count = firstNonEmpty.split(c.char).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = c.mode;
    }
  }
  return bestCount > 0 ? best : null;
}

function getSeparatorChar(mode: SeparatorMode): string {
  if (mode === "comma") return ",";
  if (mode === "semicolon") return ";";
  if (mode === "tab") return "\t";
  return ",";
}

export default function KolonlaraBolPage() {
  const [input, setInput] = useState("");
  const [separatorMode, setSeparatorMode] = useState<SeparatorMode>("auto");
  const [detectedSeparator, setDetectedSeparator] = useState<SeparatorMode | null>(null);
  const [rows, setRows] = useState<string[][]>([]);
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSplit() {
    const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) {
      setRows([]);
      setDetectedSeparator(null);
      return;
    }
    let effectiveMode = separatorMode;
    if (separatorMode === "auto") {
      const detected = detectSeparator(lines);
      effectiveMode = detected ?? "comma";
      setDetectedSeparator(detected ?? null);
    } else {
      setDetectedSeparator(null);
    }
    const sepChar = getSeparatorChar(effectiveMode);
    setRows(lines.map((line) => line.split(sepChar).map((cell) => cell.trim())));
    setCopyStatus("idle");
  }

  const maxCols = rows.reduce((max, r) => Math.max(max, r.length), 0);

  async function handleCopy() {
    if (!rows.length) return;
    try {
      await navigator.clipboard.writeText(rows.map((row) => row.join("\t")).join("\n"));
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 1300);
    } catch {
      setCopyStatus("error");
    }
  }

  function getSeparatorLabel(mode: SeparatorMode | null): string {
    if (!mode) return "";
    if (mode === "comma") return "Virgül (,)";
    if (mode === "semicolon") return "Noktalı virgül (;)";
    if (mode === "tab") return "Sekme (Tab)";
    return "Otomatik";
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Metni Kolonlara Böl"
        description="Metni virgül, noktalı virgül veya sekme ile kolonlara ayırın. Excel Metni Sütunlara Dönüştür alternatifi."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-4xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Metni veya Excel'den kopyaladığınız hücreleri aşağıdaki kutuya yapıştırın.",
            "Ayırıcıyı seçin (otomatik, virgül, noktalı virgül veya sekme) ve Ayır butonuna tıklayın.",
            "Sonucu Kopyala ile tabloyu Excel'e yapıştırın.",
          ]}
          excelAlternatif={
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Excel&apos;de metni kolonlara bölmek için <strong>Veri</strong> sekmesinden <strong>Metni Sütunlara Dönüştür</strong> sihirbazını kullanın. Bu özellik virgül, noktalı virgül veya sekme ile ayrılmış metni otomatik algılayıp sütunlara dağıtır.
              </p>
              <p>
                Adımlar: Veriyi seçin → Veri → Metni Sütunlara Dönüştür → Sınırlandırılmış seçin → Ayırıcı olarak virgül veya noktalı virgül işaretleyin → Son. Sabit genişlikle bölmek isterseniz ilgili adımda sütun çizgilerini kendiniz ayarlayabilirsiniz.
              </p>
            </div>
          }
        />
        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Tek hücrede duran karma metni ayırıcıya göre sütunlara böler. Dış sistemden gelen verileri Excel&apos;de kullanılabilir tabloya dönüştürmek için idealdir.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">Ali,Yılmaz,İstanbul</p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">Sütun 1: Ali · Sütun 2: Yılmaz · Sütun 3: İstanbul</p>
            </div>
          </div>
        </section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Ayırıcı</span>
            <div className="inline-flex rounded-lg border p-1 gap-1 w-full sm:w-auto" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
              {(["auto", "comma", "semicolon", "tab"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSeparatorMode(mode)}
                  className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${separatorMode === mode ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
                  style={separatorMode === mode ? { background: THEME.ribbon } : undefined}
                >
                  {mode === "auto" ? "Otomatik" : mode === "comma" ? "Virgül ," : mode === "semicolon" ? "Noktalı ;" : "Tab"}
                </button>
              ))}
            </div>
          </div>
          {separatorMode === "auto" && detectedSeparator && (
            <div className="text-xs text-gray-700 rounded-lg px-3 py-2 border" style={{ background: "#f0f7f4", borderColor: THEME.ribbon }}>
              Algılanan: <span className="font-semibold">{getSeparatorLabel(detectedSeparator)}</span>
            </div>
          )}
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder="Örn: Ad,Soyad,Şehir&#10;Ali,Yılmaz,İstanbul&#10;Ayşe,Kaya,Ankara"
          className="w-full rounded-lg border p-4 text-sm resize-y placeholder:text-gray-400 bg-white"
          style={{ borderColor: THEME.gridLine }}
        />

        <div className="flex flex-col gap-3 sm:flex-row items-stretch">
          <button
            onClick={handleSplit}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Kolonlara Ayır
          </button>
          <CopyButton onClick={handleCopy} disabled={rows.length === 0} copied={copyStatus === "success"} label="Sonucu Kopyala (Excel)" copiedLabel="Kopyalandı" />
        </div>

        {rows.length > 0 && (
          <div className="mt-3 space-y-2">
            {copyStatus === "success" && (
              <div className="text-xs text-gray-700 rounded-lg px-3 py-2 inline-block border" style={{ background: "#f0f7f4", borderColor: THEME.ribbon }}>
                Panoya kopyalandı. Excel&apos;de Ctrl+V ile yapıştırın.
              </div>
            )}
            {copyStatus === "error" && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 inline-block">Panoya kopyalanamadı.</div>
            )}
            <div className="overflow-x-auto rounded-lg border shadow-inner" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <table className="w-full text-left min-w-[270px] border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider font-semibold border-b text-gray-700" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                    {Array.from({ length: maxCols }).map((_, i) => (
                      <th key={i} className="py-3 px-4">Sütun {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="border-b text-gray-900" style={{ borderColor: THEME.gridLine, background: ri % 2 === 0 ? THEME.sheetBg : THEME.headerBg }}>
                      {Array.from({ length: maxCols }).map((_, ci) => (
                        <td key={ci} className="py-3 px-4 text-sm whitespace-pre border-r last:border-r-0" style={{ borderColor: THEME.gridLine }}>
                          {row[ci] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Hangi ayırıcıyı seçmeliyim?</span><br />Emin değilseniz “Otomatik” seçin. Araç çoğu metinde doğru ayırıcıyı bulur.</p>
            <p><span className="font-semibold text-gray-900">Tab karakterli metinleri böler mi?</span><br />Evet. “Tab” seçeneğini seçerek ayırabilirsiniz.</p>
            <p><span className="font-semibold text-gray-900">Excel&apos;e düzgün yapışır mı?</span><br />Evet. “Sonucu Kopyala (Excel)” butonu sekmeli format üretir.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için:{" "}
            <Link href="/egitimler/temel" className="underline" style={{ color: THEME.ribbon }}>
              Temel Excel eğitimi
            </Link>
            {" · "}
            <Link href="/blog/excelde-metni-kolonlara-bolme" className="underline" style={{ color: THEME.ribbon }}>
              rehber yazısı
            </Link>
          </div>
        </section>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/kolonlara-bol" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
