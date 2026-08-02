"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

type Mod = "hariç" | "dahil";

function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function fmt(n: number): string {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function KdvHesaplaPage() {
  const [mod, setMod] = useState<Mod>("hariç");
  const [tutar, setTutar] = useState("");
  const [oran, setOran] = useState("20");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const t = parseNum(tutar);
    const o = parseNum(oran);
    if (t === null || o === null || o < 0) {
      setResult("");
      return;
    }
    let matrah: number;
    let kdv: number;
    let toplam: number;
    if (mod === "hariç") {
      matrah = t;
      kdv = (t * o) / 100;
      toplam = matrah + kdv;
    } else {
      toplam = t;
      matrah = t / (1 + o / 100);
      kdv = toplam - matrah;
    }
    setResult(
      [
        `Matrah: ${fmt(matrah)} TL`,
        `KDV (%${o}): ${fmt(kdv)} TL`,
        `Toplam: ${fmt(toplam)} TL`,
      ].join("\n"),
    );
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
    <ToolLayout
      title="KDV Hesaplama"
      description="KDV hariç tutardan KDV ekleyin veya KDV dahil tutardan matrahı ayırın. %1 / %10 / %20 ve özel oran."
      path="/excel-araclari/kdv-hesapla"
      keywords={["kdv hesaplama", "kdv dahil hariç", "kdv hesaplayıcı", "%20 kdv"]}
      howToSteps={[
        "Girişin KDV hariç mi dahil mi olduğunu seçin.",
        "Tutarı ve oranı girin (hızlı seçenek: %1, %10, %20).",
        "Hesapla’ya basın; matrah, KDV ve toplamı kopyalayın.",
      ]}
      faq={[
        {
          question: "KDV dahil ne demek?",
          answer: "Girdiğiniz tutar KDV’yi içerir; araç matrahı geri hesaplar.",
        },
        {
          question: "Özel oran girebilir miyim?",
          answer: "Evet. Oran alanına istediğiniz yüzdeyi yazın.",
        },
      ]}
      aboutContent={
        <p className="text-sm text-gray-700">
          Fatura, teklif ve e-ticaret hesaplarında sık kullanılan KDV dahil/hariç ayrımını tek ekranda yapar.
        </p>
      }
      relatedLinks={
        <span className="text-gray-600">
          <Link href="/excel-araclari/yuzde-hesaplama" className="font-medium underline" style={{ color: ACCENT }}>
            Yüzde hesaplama
          </Link>
          {" · "}
          <Link href="/excel-araclari/sayi-yaziya" className="font-medium underline" style={{ color: ACCENT }}>
            Sayıyı yazıya
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-md sm:px-6">
          <div className="relative flex rounded-2xl bg-gray-200/70 p-1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-xl shadow-sm transition-transform duration-300"
              style={{
                background: ACCENT,
                transform: mod === "dahil" ? "translateX(calc(100% + 0.5rem))" : "translateX(0)",
              }}
            />
            <button
              type="button"
              onClick={() => setMod("hariç")}
              className={`relative z-10 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold ${
                mod === "hariç" ? "text-white" : "text-gray-600"
              }`}
            >
              KDV hariç → ekle
            </button>
            <button
              type="button"
              onClick={() => setMod("dahil")}
              className={`relative z-10 flex-1 rounded-xl px-2 py-2.5 text-sm font-semibold ${
                mod === "dahil" ? "text-white" : "text-gray-600"
              }`}
            >
              KDV dahil → ayır
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {mod === "hariç" ? "Tutar (KDV hariç)" : "Tutar (KDV dahil)"}
              </label>
              <input
                value={tutar}
                onChange={(e) => setTutar(e.target.value)}
                placeholder="1000"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">KDV oranı (%)</label>
              <input
                value={oran}
                onChange={(e) => setOran(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm focus:border-emerald-400 focus:bg-white focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["1", "10", "20"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setOran(r)}
                    className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-emerald-400"
                  >
                    %{r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <PrimaryButton className="mt-5" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>

          {result ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-4">
              <pre className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-emerald-950">{result}</pre>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:bg-gray-50"
                  style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
                >
                  {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}
