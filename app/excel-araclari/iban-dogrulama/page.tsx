"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { validateIBAN } from "@/lib/iban";

export default function IbanDogrulamaPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

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

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Doğrulamak istediğiniz IBAN'ları aşağıdaki kutuya yapıştırın (her satıra bir IBAN; boşluk olmadan).",
            "Doğrula butonuna tıklayın.",
            "Geçerli / Geçersiz sonucunu görün; geçerli IBAN'ları kopyalayıp kullanabilirsiniz.",
          ]}
          excelAlternatif={<>Excel&apos;de IBAN doğrulama hazır fonksiyon değildir; MOD 97 algoritması VBA veya formülle uygulanabilir. Banka sistemleri genelde otomatik kontrol eder.</>}
        />
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

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/iban-dogrulama" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
