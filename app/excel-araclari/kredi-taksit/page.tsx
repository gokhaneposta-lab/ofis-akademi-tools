"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

export default function KrediTaksitPage() {
  const [anapara, setAnapara] = useState("");
  const [yillikFaiz, setYillikFaiz] = useState("");
  const [vadeAy, setVadeAy] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const P = parseFloat(anapara.replace(/\s/g, "").replace(",", "."));
    const rYillik = parseFloat(yillikFaiz.replace(",", ".")) / 100;
    const n = parseInt(vadeAy.replace(/\s/g, ""), 10);
    const r = rYillik / 12;

    if (Number.isNaN(P) || Number.isNaN(rYillik) || Number.isNaN(n) || P <= 0 || n <= 0) {
      setResult("");
      return;
    }

    let aylikTaksit: number;
    if (r === 0) aylikTaksit = P / n;
    else aylikTaksit = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const toplamGeri = aylikTaksit * n;
    const toplamFaiz = toplamGeri - P;

    const lines = [
      "Kredi tutarı (₺)\t" + P.toLocaleString("tr-TR", { minimumFractionDigits: 2 }),
      "Yıllık faiz oranı (%)\t" + (rYillik * 100).toLocaleString("tr-TR"),
      "Vade (ay)\t" + n,
      "",
      "Aylık taksit (₺)\t" + aylikTaksit.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Toplam geri ödeme (₺)\t" + toplamGeri.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      "Toplam faiz (₺)\t" + toplamFaiz.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ];
    setResult(lines.join("\n"));
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

  const resultRows = useMemo(() => {
    if (!result) return [];
    return result
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const tab = line.indexOf("\t");
        if (tab === -1) return { label: line, value: "" };
        return { label: line.slice(0, tab), value: line.slice(tab + 1) };
      });
  }, [result]);

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Kredi taksitini ve toplam maliyeti anında hesaplar. Farklı banka tekliflerini karşılaştırırken gerçek geri ödeme yükünü net görmenize yardımcı olur.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">Kredi: 100.000 · Faiz: %24 · Vade: 36 ay</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">Aylık taksit + toplam geri ödeme + toplam faiz</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Kredi Taksit Hesaplama"
      description="Kredi tutarı, yıllık faiz oranı ve vadeye göre aylık taksit tutarını hesaplayın. Toplam geri ödeme ve toplam faizi görün."
      path="/excel-araclari/kredi-taksit"
      keywords={["kredi taksit", "pmt", "devresel ödeme", "aylık taksit hesaplama"]}
      howToSteps={[
        "Kredi tutarı (₺), yıllık faiz oranı (%) ve vade (ay) girin.",
        "Hesapla butonuna tıklayın.",
        "Aylık taksit, toplam geri ödeme ve toplam faiz görünür; Sonucu kopyala ile panoya alabilirsiniz.",
      ]}
      faq={[
        {
          question: "Faiz oranı yıllık mı girilmeli?",
          answer: "Evet, yıllık faiz oranını girin; araç bunu aylık döneme çevirerek hesaplar.",
        },
        {
          question: "Vade ay dışında girilebilir mi?",
          answer: "Bu hesaplayıcı vadeyi ay bazında ister. Örneğin 5 yıl için 60 ay girmelisiniz.",
        },
        {
          question: "Toplam faiz nasıl hesaplanır?",
          answer: "Toplam geri ödeme ile anapara farkı olarak gösterilir.",
        },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          <Link
            href="/egitimler/orta"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Orta seviye eğitim
          </Link>
          {" · "}
          <Link
            href="/blog/excelde-kredi-taksit-hesaplama"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Kredi taksit rehberi
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Girdiler
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Kredi tutarı (₺)
              </label>
              <input
                type="text"
                value={anapara}
                onChange={(e) => setAnapara(e.target.value)}
                placeholder="100000"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Yıllık faiz oranı (%)
              </label>
              <input
                type="text"
                value={yillikFaiz}
                onChange={(e) => setYillikFaiz(e.target.value)}
                placeholder="24"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Vade (ay)</label>
              <input
                type="text"
                value={vadeAy}
                onChange={(e) => setVadeAy(e.target.value)}
                placeholder="36"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-400/15"
              />
            </div>
          </div>

          <PrimaryButton className="mt-4" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {result && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-md sm:px-5">
            <h2 className="text-sm font-semibold text-gray-900">Sonuç</h2>

            <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-200/80 bg-white shadow-sm">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className="border-b border-emerald-100 bg-emerald-50/80">
                    <th className="px-3 py-2.5 font-semibold text-gray-800 sm:px-4">Kalem</th>
                    <th className="px-3 py-2.5 font-semibold text-gray-800 sm:px-4">Değer</th>
                  </tr>
                </thead>
                <tbody>
                  {resultRows.map((row, i) => (
                    <tr
                      key={`${row.label}-${i}`}
                      className={i % 2 === 0 ? "bg-white" : "bg-emerald-50/30"}
                    >
                      <td className="px-3 py-2.5 text-gray-700 sm:px-4">{row.label}</td>
                      <td className="px-3 py-2.5 font-medium tabular-nums text-gray-900 sm:px-4">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <label htmlFor="kredi-taksit-result" className="mt-4 block text-xs font-semibold text-gray-600">
              Excel için sekmeyle ayrılmış metin
            </label>
            <textarea
              id="kredi-taksit-result"
              readOnly
              value={result}
              rows={10}
              className="mt-1.5 w-full resize-y rounded-xl border border-emerald-200/80 bg-white px-3 py-3 font-mono text-sm text-gray-900 shadow-sm focus:outline-none"
            />

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
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
