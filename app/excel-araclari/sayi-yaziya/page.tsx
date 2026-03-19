"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { sayiyiYaziyaCevir } from "@/lib/sayiYaziya";

export default function SayiYaziyaPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [paraBirimi, setParaBirimi] = useState(true);
  const [buyukHarf, setBuyukHarf] = useState(false);

  function normalizeNumberString(s: string): string {
    const t = s.trim().replace(/\s/g, "");
    if (t.includes(",") && !t.replace(",", "").includes(".")) {
      return t.replace(/\./g, "").replace(",", ".");
    }
    return t.replace(",", ".");
  }

  function handleConvert() {
    const lines = input
      .split(/\r?\n/)
      .map((l) => normalizeNumberString(l))
      .filter(Boolean);

    const outputs: string[] = [];
    for (const line of lines) {
      const num = parseFloat(line);
      if (Number.isNaN(num)) {
        outputs.push(`[Geçersiz: ${line}]`);
        continue;
      }
      outputs.push(sayiyiYaziyaCevir(num, { paraBirimi, buyukHarf }));
    }
    setResult(outputs.join("\n"));
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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="Sayıyı Yazıya Çevir — Ücretsiz Excel Aracı"
        description="Rakamları Türkçe yazıya dönüştürün. Excel sayı yazıya çevir, fatura ve çek metni. TL ve kuruş formatı. Ücretsiz, tarayıcıda çalışır."
        path="/excel-araclari/sayi-yaziya"
        keywords={["excel sayı yazıya çevir", "sayıyı yazıya çevirme", "rakam yazıya", "fatura yazı", "Excel araçları"]}
      />
      <PageRibbon
        title="Sayıyı Yazıya Çevir"
        description="Rakamları Türkçe yazıya dönüştürün. Fatura, çek ve sözleşme metinlerinde kullanım için TL ve kuruş formatı desteklenir."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Yazıya çevirmek istediğiniz sayıları (her satıra bir tane) aşağıdaki kutuya yapıştırın. Virgül veya nokta ondalık ayracı kullanabilirsiniz.",
            "Türk lirası & kuruş veya sade sayı, büyük harf seçeneklerini işaretleyin.",
            "Çevir butonuna tıklayın.",
            "Sonucu kopyalayıp fatura, çek veya sözleşme metnine yapıştırın.",
          ]}
          excelAlternatif={
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Excel&apos;de Türkçe &quot;sayıyı yazıya çevirme&quot; (fatura, çek, sözleşme için) hazır bir fonksiyon değildir. İngilizce sürümde NUMBERSTRING benzeri işlevler bazı dillerde vardır; Türkçe için genelde VBA makrosu veya eklenti kullanılır.
              </p>
              <p>
                Bu araç sayıyı Türkçe yazıya (TL ve kuruş dahil) anında çevirir; sonucu kopyalayıp Excel veya Word&apos;e yapıştırabilirsiniz. Kurulum gerektirmez, tarayıcıda çalışır.
              </p>
            </div>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Sayıları Türkçe yazıya çevirir. Vergi/fatura metinlerinde tutarları <span className="font-semibold">TL ve kuruş</span> şeklinde yazmanıza yardımcı olur.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Girdi</p>
              <p className="text-gray-700"><span className="font-mono">1250,50</span></p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Çıktı</p>
              <p className="text-gray-700">Ondalık varsa <span className="font-semibold">kuruş</span> da eklenir; TL + kuruş para metni döner.</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">“Türk lirası & kuruş” seçeneği</span>
              <br />
              Kuruş/ondalık varsa kuruş kısmını da metne dahil eder.
            </p>
            <p>
              <span className="font-semibold">“Büyük harf” ne yapar?</span>
              <br />
              Çıktı yazısını büyük harfe dönüştürür.
            </p>
            <p>
              <span className="font-semibold">Excel’e nasıl aktarırım?</span>
              <br />
              Kopyala → ilgili metin alanına yapıştır.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Daha fazla örnek için{" "}
            <Link href="/blog/excelde-sayiyi-yaziya-cevirme" className="underline" style={{ color: THEME.ribbon }}>
              sayıyı yazıya çevirme rehberini
            </Link>{" "}
            inceleyebilirsin.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Format</span>
            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={paraBirimi}
                  onChange={(e) => setParaBirimi(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-400"
                  style={{ accentColor: THEME.ribbon }}
                />
                Türk lirası & kuruş
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={buyukHarf}
                  onChange={(e) => setBuyukHarf(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-400"
                  style={{ accentColor: THEME.ribbon }}
                />
                Büyük harf
              </label>
            </div>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder="Sayı veya sayıları yazın (her satıra bir sayı)...&#10;1234,56&#10;15000&#10;1.250.000,75"
          className="w-full rounded-lg border p-4 text-sm resize-y placeholder:text-gray-400 bg-white"
          style={{ borderColor: THEME.gridLine }}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleConvert}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Yazıya Çevir
          </button>
          <CopyButton
            onClick={handleCopy}
            disabled={!result}
            copied={copied}
            label="Sonucu Kopyala"
            copiedLabel="Kopyalandı"
          />
        </div>

        {result && (
          <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs font-semibold text-gray-700 mb-2">Yazıyla:</div>
            <textarea
              readOnly
              value={result}
              rows={6}
              className="w-full rounded border p-3 text-sm resize-y bg-gray-50"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        )}

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/sayi-yaziya" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
