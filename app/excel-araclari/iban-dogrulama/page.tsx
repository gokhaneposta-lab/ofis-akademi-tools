"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { validateIBAN } from "@/lib/iban";
import ToolJsonLd from "@/components/ToolJsonLd";

export default function IbanDogrulamaPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const howToSteps = [
    "Doğrulamak istediğiniz IBAN'ları aşağıdaki kutuya yapıştırın (her satıra bir IBAN; boşluk olmadan).",
    "Doğrula butonuna tıklayın.",
    "Geçerli / Geçersiz sonucunu görün; geçerli IBAN'ları kopyalayıp kullanabilirsiniz.",
  ];

  const faq = [
    {
      question: "Boşluklu IBAN girebilir miyim?",
      answer: "Evet. Araç boşlukları otomatik temizler.",
    },
    {
      question: "Toplu IBAN kontrolü destekleniyor mu?",
      answer: "Evet. Her satıra bir IBAN yazarak toplu doğrulama yapabilirsiniz.",
    },
    {
      question: "Sonuçları nasıl aktarırım?",
      answer: "Sonucu kopyalayıp Excel'e yapıştırabilirsiniz.",
    },
  ];

  function handleValidate() {
    const lines = input.split(/\r?\n/).map((l) => l.trim().replace(/\s/g, "")).filter(Boolean);
    const output: string[] = [];
    for (const line of lines) {
      const { valid, message } = validateIBAN(line);
      output.push(valid ? `${line}\tGeçerli` : `${line}\tGeçersiz${message ? " — " + message : ""}`);
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

  const validCount = result ? result.split("\n").filter((l) => l.includes("\tGeçerli")).length : 0;
  const totalCount = result ? result.split("\n").filter(Boolean).length : 0;

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="IBAN Doğrulama"
        description="IBAN numaralarını doğrulayın. Türkiye ve uluslararası IBAN formatı (MOD-97) desteklenir. Her satıra bir IBAN yazın veya yapıştırın."
      />
      <ToolJsonLd
        name="IBAN Doğrulama"
        description="IBAN numaralarını doğrulayın. Türkiye ve uluslararası IBAN formatı (MOD-97) desteklenir. Her satıra bir IBAN yazın veya yapıştırın."
        path="/excel-araclari/iban-dogrulama"
        howToSteps={howToSteps}
        faq={faq}
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={howToSteps}
          excelAlternatif={
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Excel&apos;de IBAN doğrulama için hazır bir fonksiyon yoktur. IBAN, MOD 97 algoritması ile kontrol edilir: sayısal değer 97&apos;ye bölünür, kalan 1 olmalıdır.
              </p>
              <p>
                Bu kontrolü Excel&apos;de uzun formül zinciri veya VBA makrosu ile yapabilirsiniz; çoğu kullanıcı için banka sistemleri ve bu gibi çevrimiçi araçlar daha pratiktir. Bu araç TR ve uluslararası IBAN&apos;ları anında doğrular.
              </p>
            </div>
          }
        />
        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            IBAN listesini toplu olarak kontrol eder ve geçerli/geçersiz ayrımı yapar. Ödeme öncesi hatalı IBAN riskini azaltır ve operasyon sürecini hızlandırır.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">TR330006100519786457841326</p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">TR330006100519786457841326 → Geçerli</p>
            </div>
          </div>
        </section>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder="Her satıra bir IBAN yazın veya yapıştırın...&#10;TR33 0006 1005 1978 6457 8413 26&#10;TR12 0004 6002 1588 8000 0132 95"
          className="w-full rounded-lg border p-4 text-sm resize-y placeholder:text-gray-400 bg-white font-mono"
          style={{ borderColor: THEME.gridLine }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleValidate}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Doğrula
          </button>
          <CopyButton onClick={handleCopy} disabled={!result} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
        </div>

        {totalCount > 0 && (
          <p className="text-xs text-gray-600">
            <strong>{validCount}</strong> / {totalCount} IBAN geçerli
          </p>
        )}

        {result && (
          <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs font-semibold text-gray-700 mb-2">Sonuç (IBAN — Durum):</div>
            <textarea readOnly value={result} rows={6} className="w-full rounded border p-3 text-sm resize-y bg-gray-50 font-mono" style={{ borderColor: THEME.gridLine }} />
          </div>
        )}

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Boşluklu IBAN girebilir miyim?</span><br />Evet. Araç boşlukları otomatik temizler.</p>
            <p><span className="font-semibold text-gray-900">Toplu IBAN kontrolü destekleniyor mu?</span><br />Evet. Her satıra bir IBAN yazarak toplu doğrulama yapabilirsiniz.</p>
            <p><span className="font-semibold text-gray-900">Sonuçları nasıl aktarırım?</span><br />Sonucu kopyalayıp Excel&apos;e yapıştırabilirsiniz.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/orta" className="underline" style={{ color: THEME.ribbon }}>
              orta seviye eğitim
            </Link>
            {" "}ve{" "}
            <Link href="/blog/excelde-iban-dogrulama" className="underline" style={{ color: THEME.ribbon }}>
              IBAN rehberi
            </Link>
            {" "}sayfasına bakın.
          </div>
        </section>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/iban-dogrulama" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
