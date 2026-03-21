"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";
import { sayiyiYaziyaCevir } from "@/lib/sayiYaziya";

const ACCENT = "#217346";

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

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Sayıları Türkçe yazıya çevirir. Vergi ve fatura metinlerinde tutarları{" "}
        <span className="font-semibold text-gray-900">TL ve kuruş</span> şeklinde
        yazmanıza yardımcı olur.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="font-mono text-gray-700">1250,50</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">
            Ondalık varsa <span className="font-semibold">kuruş</span> da eklenir;
            TL + kuruş para metni döner.
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-sm text-gray-700">
        <p>
          Excel&apos;de Türkçe &quot;sayıyı yazıya çevirme&quot; (fatura, çek, sözleşme
          için) hazır bir fonksiyon değildir. İngilizce sürümde NUMBERSTRING benzeri
          işlevler bazı dillerde vardır; Türkçe için genelde VBA makrosu veya eklenti
          kullanılır.
        </p>
        <p>
          Bu araç sayıyı Türkçe yazıya (TL ve kuruş dahil) anında çevirir; sonucu
          kopyalayıp Excel veya Word&apos;e yapıştırabilirsiniz. Kurulum gerektirmez,
          tarayıcıda çalışır.
        </p>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Sayıyı Yazıya Çevir"
      description="Rakamları Türkçe yazıya dönüştürün. Fatura, çek ve sözleşme metinlerinde kullanım için TL ve kuruş formatı desteklenir."
      path="/excel-araclari/sayi-yaziya"
      keywords={[
        "excel sayı yazıya çevir",
        "sayıyı yazıya çevirme",
        "rakam yazıya",
        "fatura yazı",
        "Excel araçları",
      ]}
      howToSteps={[
        "Yazıya çevirmek istediğiniz sayıları (her satıra bir tane) kutuya yapıştırın. Virgül veya nokta ondalık ayracı kullanabilirsiniz.",
        "Türk lirası & kuruş veya sade sayı, büyük harf seçeneklerini işaretleyin.",
        "Çevir butonuna tıklayın.",
        "Sonucu kopyalayıp fatura, çek veya sözleşme metnine yapıştırın.",
      ]}
      faq={[
        {
          question: "“Türk lirası & kuruş” seçeneği ne işe yarar?",
          answer: "Kuruş/ondalık varsa kuruş kısmını da metne dahil eder.",
        },
        {
          question: "“Büyük harf” ne yapar?",
          answer: "Çıktı yazısını büyük harfe dönüştürür.",
        },
        {
          question: "Excel’e nasıl aktarırım?",
          answer: "Kopyala → ilgili metin alanına yapıştır.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          Daha fazla örnek için{" "}
          <Link
            href="/blog/excelde-sayiyi-yaziya-cevirme"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            sayıyı yazıya çevirme rehberini
          </Link>{" "}
          inceleyebilirsiniz.
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Format
            </span>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={paraBirimi}
                  onChange={(e) => setParaBirimi(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300"
                  style={{ accentColor: ACCENT }}
                />
                <span className="font-medium">Türk lirası & kuruş</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-800">
                <input
                  type="checkbox"
                  checked={buyukHarf}
                  onChange={(e) => setBuyukHarf(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300"
                  style={{ accentColor: ACCENT }}
                />
                <span className="font-medium">Büyük harf</span>
              </label>
            </div>
          </div>

          <label
            htmlFor="sayi-yaziya-input"
            className="block text-sm font-semibold text-gray-900"
          >
            Sayıları girin
          </label>
          <p className="mt-0.5 text-xs text-gray-500">
            Her satıra bir sayı; virgül veya nokta ile ondalık kullanabilirsiniz.
          </p>
          <div className="mt-2">
            <InputTextarea
              id="sayi-yaziya-input"
              value={input}
              onChange={setInput}
              rows={6}
              minHeight="10rem"
              className="resize-y"
              placeholder={
                "Sayı veya sayıları yazın (her satıra bir sayı)...\n1234,56\n15000\n1.250.000,75"
              }
            />
          </div>

          <PrimaryButton className="mt-3" onClick={handleConvert}>
            Yazıya çevir
          </PrimaryButton>
        </div>

        {result && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <label
              htmlFor="sayi-yaziya-result"
              className="block text-sm font-semibold text-gray-900"
            >
              Yazıyla
            </label>
            <textarea
              id="sayi-yaziya-result"
              readOnly
              value={result}
              rows={6}
              className="mt-2 w-full resize-y rounded-xl border border-emerald-200/80 bg-white px-3 py-3 text-sm leading-relaxed text-gray-900 shadow-sm focus:outline-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={
                  copied ? { borderColor: ACCENT, color: ACCENT } : undefined
                }
              >
                {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
