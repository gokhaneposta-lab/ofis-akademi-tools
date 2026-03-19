"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="Liste Birleştirici — Ücretsiz Excel Aracı"
        description="Birden fazla satırdaki değerleri seçtiğiniz ayraç ile tek satırda birleştirin. Excel liste birleştirme, SQL IN formatı. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/liste-birlestir"
        keywords={["excel liste birleştirme", "liste birleştirici", "satırları birleştir", "Excel araçları"]}
      />
      <PageRibbon
        title="Liste Birleştirici"
        description="Birden fazla satırdaki değerleri seçtiğiniz ayraç ile tek satırda birleştirin. ID, TC, telefon listelerini SQL veya Excel için hazırlayın."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Birleştirmek istediğiniz satırları (her satırda bir değer) aşağıdaki kutuya yapıştırın.",
            "Ayracı seçin: noktalı virgül, virgül, pipe veya satır sonu.",
            "Birleştir butonuna tıklayın; SQL IN formatı isterseniz ilgili seçeneği işaretleyin.",
            "Sonucu kopyalayıp Excel veya sorguya yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de bir aralıktaki hücreleri tek hücrede, seçtiğiniz ayraçla birleştirmek için METNEBİRLEŞTİR (TEXTJOIN) fonksiyonunu kullanabilirsiniz. Excel 365 ve sonrasında kullanılabilir.
              </p>
              <ExcelFormulBlok
                baslik="Listeyi ayraçla birleştirmek için:"
                formül='=METNEBİRLEŞTİR(";";1;A1:A10)'
                aciklama="METNEBİRLEŞTİR (TEXTJOIN) üç parametre alır: ayraç (örn. noktalı virgül), boş hücreleri yok say (1 veya DOĞRU), birleştirilecek aralık (A1:A10). Sonuç tek hücrede 'değer1;değer2;değer3' şeklinde gelir. Ayracı virgül veya boşluk yapmak için ilk parametreyi ',' veya ' ' yazın."
              />
            </>
          }
        />
        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Alt alta satırları tek satırda birleştirir. Özellikle ID listesi hazırlama, SQL IN sorgusu üretme ve farklı kaynaklardan gelen verileri tek formatta toplamada çok kullanılır.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">12345 ↵ 23456 ↵ 34567</p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">12345;23456;34567 veya IN (12345,23456,34567)</p>
            </div>
          </div>
        </section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Ayraç</span>
            <div className="inline-flex flex-wrap rounded-lg border p-1 gap-1" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
              <button type="button" onClick={() => setDelimiter("semicolon")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "semicolon" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "semicolon" ? { background: THEME.ribbon } : undefined}>Noktalı Virgül ;</button>
              <button type="button" onClick={() => setDelimiter("comma")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "comma" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "comma" ? { background: THEME.ribbon } : undefined}>Virgül ,</button>
              <button type="button" onClick={() => setDelimiter("pipe")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "pipe" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "pipe" ? { background: THEME.ribbon } : undefined}>Dikey Çizgi |</button>
              <button type="button" onClick={() => setDelimiter("space")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "space" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "space" ? { background: THEME.ribbon } : undefined}>Boşluk</button>
              <button type="button" onClick={() => setDelimiter("newline")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "newline" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "newline" ? { background: THEME.ribbon } : undefined}>Yeni Satır</button>
              <button type="button" onClick={() => setDelimiter("custom")} className={`whitespace-nowrap rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition ${delimiter === "custom" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`} style={delimiter === "custom" ? { background: THEME.ribbon } : undefined}>Özel</button>
            </div>
            {delimiter === "custom" && (
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => setCustomDelimiter(e.target.value)}
                placeholder="Özel ayraç (örn: || veya -)"
                className="mt-1 h-9 w-full rounded border px-3 text-xs bg-white placeholder:text-gray-400"
                style={{ borderColor: THEME.gridLine }}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
              <input
                type="checkbox"
                checked={sqlInFormat}
                onChange={(e) => setSqlInFormat(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400 text-[#217346] focus:ring-[#217346]"
                style={{ borderColor: THEME.gridLine }}
              />
              <span className="font-medium">SQL IN formatı</span>
            </label>
            {sqlInFormat && (
              <p className="text-[11px] text-gray-600">
                Bu modda değerler virgül ile birleştirilir ve <span className="font-semibold text-gray-800">IN (...)</span> şeklinde sarılır.
              </p>
            )}
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          placeholder={`Örn:\n12345678901\n23456789012\n34567890123`}
          className="w-full rounded-lg border p-4 text-sm resize-y transition placeholder:text-gray-400 bg-white"
          style={{ borderColor: THEME.gridLine }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <button
              onClick={handleJoin}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: THEME.ribbon }}
            >
              Birleştir
            </button>
            <CopyButton
              onClick={handleCopy}
              disabled={!result}
              copied={copied}
              label="Sonucu Kopyala"
              copiedLabel="Kopyalandı"
            />
          </div>
          <div className="text-xs text-gray-500">{processedInfo}</div>
        </div>

        {result && (
          <div className="mt-2 rounded-lg border p-4 sm:p-5 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs sm:text-sm font-semibold text-gray-800 mb-2">Birleştirilmiş sonuç:</div>
            <textarea
              readOnly
              value={result}
              rows={sqlInFormat ? 3 : 4}
              className="w-full rounded border p-3 text-xs sm:text-sm resize-y bg-gray-50"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        )}

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">SQL IN formatı ne zaman kullanılmalı?</span><br />Veri tabanı sorgusunda `WHERE id IN (...)` kullanacaksanız bu modu açın.</p>
            <p><span className="font-semibold text-gray-900">Özel ayraç verebilir miyim?</span><br />Evet. “Özel” seçeneğinde istediğiniz karakteri yazabilirsiniz (örn: `||`).</p>
            <p><span className="font-semibold text-gray-900">Veriler kaydediliyor mu?</span><br />Hayır. İşlem tarayıcı içinde yapılır, liste saklanmaz.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için:{" "}
            <Link href="/egitimler/orta" className="underline" style={{ color: THEME.ribbon }}>
              Orta seviye eğitim
            </Link>
            {" · "}
            <Link href="/blog/excel-listeleri-birlestirme" className="underline" style={{ color: THEME.ribbon }}>
              rehber yazısı
            </Link>
          </div>
        </section>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/liste-birlestir" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel &amp; Veri Analizi</div>
      </div>
    </div>
  );
}
