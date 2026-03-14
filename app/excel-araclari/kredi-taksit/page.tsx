"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Kredi Taksit Hesaplama"
        description="Kredi tutarı, yıllık faiz oranı ve vadeye göre aylık taksit tutarını hesaplayın. Toplam geri ödeme ve toplam faizi görün."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kredi tutarı (₺)</label>
            <input
              type="text"
              value={anapara}
              onChange={(e) => setAnapara(e.target.value)}
              placeholder="100000"
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Yıllık faiz oranı (%)</label>
            <input
              type="text"
              value={yillikFaiz}
              onChange={(e) => setYillikFaiz(e.target.value)}
              placeholder="24"
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vade (ay)</label>
            <input
              type="text"
              value={vadeAy}
              onChange={(e) => setVadeAy(e.target.value)}
              placeholder="36"
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleHesapla}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Hesapla
          </button>
          <CopyButton onClick={handleCopy} disabled={!result} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
        </div>

        {result && (
          <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs font-semibold text-gray-700 mb-2">Sonuç:</div>
            <textarea readOnly value={result} rows={10} className="w-full rounded border p-3 text-sm resize-y bg-gray-50 font-mono" style={{ borderColor: THEME.gridLine }} />
          </div>
        )}

        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
