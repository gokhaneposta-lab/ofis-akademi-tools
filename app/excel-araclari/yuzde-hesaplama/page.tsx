"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

type Mod = "x_yuzde" | "a_b_yuzde";

export default function YuzdeHesaplamaPage() {
  const [mod, setMod] = useState<Mod>("x_yuzde");
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const a = parseFloat(val1.replace(/\s/g, "").replace(",", "."));
    const b = parseFloat(val2.replace(/\s/g, "").replace(",", "."));
    if (Number.isNaN(a) || Number.isNaN(b)) {
      setResult("");
      return;
    }

    let line: string;
    if (mod === "x_yuzde") {
      const sonuc = (a * b) / 100;
      line = `${a.toLocaleString("tr-TR")} sayısının %${b.toLocaleString("tr-TR")}'si = ${sonuc.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      if (b === 0) {
        setResult("B sıfır olamaz (yüzde payda).");
        setCopied(false);
        return;
      }
      const yuzde = (a / b) * 100;
      line = `${a.toLocaleString("tr-TR")}, ${b.toLocaleString("tr-TR")} sayısının %${yuzde.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}'idir`;
    }
    setResult(line);
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
        Yüzde hesaplarını hızlı ve hatasız yapar. KDV, indirim, komisyon, kar marjı ve oran karşılaştırmalarında günlük ofis işini hızlandırır.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">X = 1.000, Y = 18</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">1.000 sayısının %18&apos;i = 180,00</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Yüzde Hesaplama"
      description="X'in Y%'si kaç? A, B'nin yüzde kaçı? KDV, komisyon, kar marjı ve oran hesaplamaları için."
      path="/excel-araclari/yuzde-hesaplama"
      howToSteps={[
        "Hesaplama türünü seçin: X'in Y%'si kaç? veya A, B'nin yüzde kaçı?",
        "İki değeri girin (virgül veya nokta ondalık ayracı).",
        "Hesapla butonuna tıklayın; sonucu kopyalayabilirsiniz.",
      ]}
      faq={[
        {
          question: "Virgül ile sayı girebilir miyim?",
          answer: "Evet. Araç virgül veya nokta ile ondalık sayı girişini destekler.",
        },
        {
          question: "A, B'nin yüzde kaçı hesabı ne zaman kullanılır?",
          answer: "Bir değerin toplam içindeki payını bulmak istediğinizde bu modu kullanın.",
        },
        {
          question: "Sonucu Excel'e taşıyabilir miyim?",
          answer: 'Evet. "Sonucu kopyala" ile metni doğrudan Excel\'e yapıştırabilirsiniz.',
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          <Link
            href="/egitimler/temel"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Temel eğitim
          </Link>
          {" · "}
          <Link
            href="/blog/excelde-yuzde-hesaplama"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Yüzde rehberi
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-md sm:px-6 sm:py-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Hesaplama türü
            </span>
            <div className="relative flex rounded-2xl bg-gray-200/70 p-1">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl shadow-sm transition-transform duration-300 ease-out"
                style={{
                  background: ACCENT,
                  transform:
                    mod === "a_b_yuzde"
                      ? "translateX(calc(100% + 0.5rem))"
                      : "translateX(0)",
                }}
              />
              <button
                type="button"
                onClick={() => setMod("x_yuzde")}
                className={`relative z-10 flex-1 whitespace-nowrap rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition sm:text-sm ${
                  mod === "x_yuzde" ? "text-white" : "text-gray-600 hover:bg-white/60"
                }`}
              >
                X&apos;in Y%&apos;si kaç?
              </button>
              <button
                type="button"
                onClick={() => setMod("a_b_yuzde")}
                className={`relative z-10 flex-1 whitespace-nowrap rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition sm:text-sm ${
                  mod === "a_b_yuzde" ? "text-white" : "text-gray-600 hover:bg-white/60"
                }`}
              >
                A, B&apos;nin yüzde kaçı?
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {mod === "x_yuzde" ? "Sayı (X)" : "Pay (A)"}
              </label>
              <input
                type="text"
                value={val1}
                onChange={(e) => setVal1(e.target.value)}
                placeholder={mod === "x_yuzde" ? "1000" : "250"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {mod === "x_yuzde" ? "Yüzde (Y)" : "Tüm (B)"}
              </label>
              <input
                type="text"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                placeholder={mod === "x_yuzde" ? "18" : "1000"}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              />
            </div>
          </div>

          <PrimaryButton className="mt-5" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>

          {result && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-4 shadow-sm sm:px-5">
              <p className="text-sm font-medium leading-relaxed text-emerald-950">{result}</p>
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
      </div>
    </ToolLayout>
  );
}
