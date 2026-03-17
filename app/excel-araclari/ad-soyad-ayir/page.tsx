"use client";
import React, { useState } from "react";
import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

export default function AdSoyadAyirici() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ firstName: string; lastName: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"split" | "surnameOnly">("split");
  const [outputFormat, setOutputFormat] = useState<"table" | "excel">("table");

  function splitNames() {
    const lines = input
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const output = lines.map((line) => {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return { firstName: "", lastName: "" };
      return {
        firstName: parts.slice(0, -1).join(" "),
        lastName: parts[parts.length - 1],
      };
    });

    setResult(output);
    setCopied(false);
  }

  function handleCopy() {
    if (!result.length) return;
    let text = "";
    if (mode === "split") {
      if (outputFormat === "excel") {
        text = "Ad;Soyad\n" + result.map((row) => `${row.firstName};${row.lastName}`).join("\n");
      } else {
        text = "Ad\tSoyad\n" + result.map((row) => `${row.firstName}\t${row.lastName}`).join("\n");
      }
    } else {
      text = result.map((row) => row.lastName || row.firstName).filter(Boolean).join("\n");
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  }

  const inputLines = input ? input.split("\n").filter((l) => l.trim()).length : 0;
  const rowCount = Math.max(1, Math.min(inputLines || 1, 20));

  return (
    <div className="min-h-screen bg-[#e2e8ec]" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="Ad Soyad Ayırıcı — Ücretsiz Excel Aracı"
        description="Tam ad listesini ad ve soyad olarak ayırın; Excel'e yapıştırıp tablo veya noktalı virgül formatında kopyalayın. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/ad-soyad-ayir"
        keywords={["excel ad soyad ayırma", "ad soyad ayırıcı", "isim soyisim ayırma", "Excel araçları"]}
      />
      <PageRibbon
        title="Ad Soyad Ayırıcı"
        description="Tam ad listesini ad ve soyad olarak ayırın; tablo veya Excel formatında kopyalayın."
      >
        <div className="flex flex-wrap items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`px-4 py-1.5 text-sm font-medium rounded transition ${
              mode === "split" ? "bg-white/25" : "hover:bg-white/15"
            }`}
          >
            Ad + Soyad Ayır
          </button>
          <button
            type="button"
            onClick={() => setMode("surnameOnly")}
            className={`px-4 py-1.5 text-sm font-medium rounded transition ${
              mode === "surnameOnly" ? "bg-white/25" : "hover:bg-white/15"
            }`}
          >
            Sadece Soyad
          </button>
          {mode === "split" && (
            <>
              <div className="w-px h-6 bg-white/30 mx-1" />
              <button
                type="button"
                onClick={() => setOutputFormat("table")}
                className={`px-3 py-1.5 text-sm rounded transition ${
                  outputFormat === "table" ? "bg-white/25" : "hover:bg-white/15"
                }`}
              >
                Tablo
              </button>
              <button
                type="button"
                onClick={() => setOutputFormat("excel")}
                className={`px-3 py-1.5 text-sm rounded transition ${
                  outputFormat === "excel" ? "bg-white/25" : "hover:bg-white/15"
                }`}
              >
                Excel (;)
              </button>
            </>
          )}
          <div className="flex-1 min-w-[8px]" />
          <button
            type="button"
            onClick={splitNames}
            className="px-4 py-1.5 text-sm font-semibold rounded bg-white text-[#217346] hover:bg-gray-100 transition"
          >
            Ayır
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result.length}
            className={`px-4 py-1.5 text-sm font-medium rounded transition flex items-center gap-2 ${
              copied
                ? "bg-green-600 text-white"
                : "bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {copied ? (
              <>✓ Kopyalandı</>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                  <rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2" />
                </svg>
                Kopyala
              </>
            )}
          </button>
        </div>
      </PageRibbon>

      <div className="mx-auto mt-2 mb-6 max-w-3xl px-4 sm:px-6 flex flex-col gap-6">
        <NasilKullanilir
          steps={[
            "Excel veya listeden tam ad sütununu kopyalayıp aşağıdaki alana yapıştırın (her satırda bir ad).",
            "Ad + Soyad ayır veya Sadece Soyad modunu seçin; çıktıyı Tablo veya Excel (;) formatında alabilirsiniz.",
            "Ayır butonuna tıklayın.",
            "Sonucu Kopyala ile alıp Excel'e yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de ad soyad ayırmak için <strong>Veri</strong> &gt; <strong>Metni Sütunlara Dönüştür</strong> sihirbazını kullanabilirsiniz. Formülle yapmak isterseniz aşağıdaki örnekler A1&apos;de tam ad olduğunu varsayar.
              </p>
              <ExcelFormulBlok
                baslik="Adı almak için:"
                formül='=SOL(A1;BUL(" ";A1)-1)'
                aciklama="SOL fonksiyonu metnin sol tarafını alır. BUL fonksiyonu boşluğun yerini bulur. Böylece ilk boşluğa kadar olan kısım (ad) ayrılır."
              />
              <ExcelFormulBlok
                baslik="Soyadı almak için:"
                formül='=SAĞ(A1;UZUNLUK(A1)-BUL(" ";A1))'
                aciklama="SAĞ fonksiyonu metnin sağ tarafını alır. UZUNLUK metnin toplam karakter sayısını verir, BUL boşluğun konumunu bulur. Böylece boşluktan sonraki kısım (soyad) alınır."
              />
            </>
          }
        />
      </div>

      {/* Formül çubuğu alanı */}
      <div
        className="flex items-center gap-2 px-4 py-1.5 border-b text-sm"
        style={{ background: THEME.formulaBarBg, borderColor: THEME.gridLine }}
      >
        <span
          className="w-12 flex-shrink-0 text-center py-1 text-gray-600 font-medium"
          style={{ background: THEME.headerBg, border: `1px solid ${THEME.gridLine}` }}
        >
          A1
        </span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-500 text-xs">Tam ad listesi (her satıra bir kişi)</span>
      </div>

      {/* Sayfa alanı - Excel sheet görünümü */}
      <div className="mx-4 mt-2 mb-6 overflow-hidden rounded-b shadow-lg border border-t-0" style={{ borderColor: THEME.gridLine, background: "#fafafa" }}>
        {/* Sütun harfleri + köşe */}
        <div className="flex" style={{ background: THEME.cornerBg, borderBottom: `1px solid ${THEME.gridLine}` }}>
          <div
            className="w-10 flex-shrink-0 border-r flex items-center justify-center text-xs font-semibold text-gray-600"
            style={{ borderColor: THEME.gridLine, minHeight: 24 }}
          />
          <div
            className="flex-1 flex border-l"
            style={{ borderColor: THEME.gridLine }}
          >
            <div className="w-full text-center text-xs font-semibold text-gray-600 py-0.5" style={{ borderBottom: `1px solid ${THEME.gridLine}` }}>
              A
            </div>
          </div>
        </div>

        {/* Satırlar: satır numarası + giriş alanı */}
        <div className="flex" style={{ borderBottom: `1px solid ${THEME.gridLine}` }}>
          <div
            className="w-10 flex flex-col flex-shrink-0"
            style={{ background: THEME.headerBg, borderRight: `1px solid ${THEME.gridLine}` }}
          >
            {Array.from({ length: rowCount }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-center text-xs text-gray-600 border-b"
                style={{ borderColor: THEME.gridLine, minHeight: 28 }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0" style={{ background: THEME.sheetBg }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={rowCount}
              placeholder={"Örn:\nMELİHA ELVİN GÜZEL YILDIRIM\nAHMET MEHMET DEMİR"}
              className="w-full resize-none border-0 p-2 text-sm outline-none placeholder:text-gray-400"
              style={{
                background: THEME.sheetBg,
                minHeight: rowCount * 28,
                fontFamily: "inherit",
                lineHeight: "28px",
                borderLeft: `1px solid ${THEME.gridLine}`,
              }}
            />
          </div>
        </div>

        {/* Sonuç bölümü - Excel tablosu */}
        {result.length > 0 && (
          <>
            <div className="flex" style={{ background: THEME.cornerBg, borderBottom: `1px solid ${THEME.gridLine}` }}>
              <div
                className="w-10 flex-shrink-0 border-r flex items-center justify-center text-xs font-semibold text-gray-600"
                style={{ borderColor: THEME.gridLine, minHeight: 26 }}
              />
              <div className="flex-1 flex">
                <div className="flex-1 border-r text-center text-xs font-semibold py-1.5 text-gray-700" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                  A — Ad
                </div>
                <div className="flex-1 text-center text-xs font-semibold py-1.5 text-gray-700" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                  B — Soyad
                </div>
              </div>
            </div>
            {mode === "split" && (outputFormat === "table" || outputFormat === "excel") && (
              <div className="flex">
                <div
                  className="w-10 flex flex-col flex-shrink-0"
                  style={{ background: THEME.headerBg, borderRight: `1px solid ${THEME.gridLine}` }}
                >
                  {result.map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-xs text-gray-600 border-b"
                      style={{ borderColor: THEME.gridLine, minHeight: 28 }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col">
                  {result.map((row, i) => (
                    <div
                      key={i}
                      className="flex border-b"
                      style={{ borderColor: THEME.gridLine }}
                    >
                      <div
                        className="flex-1 px-2 py-1.5 text-sm border-r"
                        style={{ borderColor: THEME.gridLine, minHeight: 28 }}
                      >
                        {row.firstName}
                      </div>
                      <div
                        className="flex-1 px-2 py-1.5 text-sm font-medium"
                        style={{ minHeight: 28, color: "#217346" }}
                      >
                        {row.lastName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {mode === "split" && outputFormat === "excel" && (
              <div className="px-2 py-2 text-xs text-gray-500 border-t" style={{ borderColor: THEME.gridLine, background: THEME.formulaBarBg }}>
                Excel&apos;e yapıştır: Ad;Soyad (noktalı virgül ayraçlı)
              </div>
            )}
            {mode === "surnameOnly" && (
              <div className="flex">
                <div
                  className="w-10 flex flex-col flex-shrink-0"
                  style={{ background: THEME.headerBg, borderRight: `1px solid ${THEME.gridLine}` }}
                >
                  {result.map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-xs text-gray-600 border-b"
                      style={{ borderColor: THEME.gridLine, minHeight: 28 }}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col">
                  {result.map((row, i) => {
                    const surname = row.lastName || row.firstName;
                    return (
                      <div
                        key={i}
                        className="px-2 py-1.5 text-sm border-b font-medium"
                        style={{ borderColor: THEME.gridLine, minHeight: 28, color: "#217346" }}
                      >
                        {surname}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Alt bilgi */}
      <div className="mx-auto mt-6 max-w-3xl px-4">
        <BenzerExcelAraclari currentHref="/excel-araclari/ad-soyad-ayir" />
      </div>
      <div className="text-center text-xs text-gray-500 pb-4">
        {"Ofis Akademi · Excel & Veri Analizi"}
      </div>
    </div>
  );
}
