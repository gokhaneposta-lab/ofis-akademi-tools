"use client";

import React, { useState } from "react";
import CopyButton from "../../../components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Yüzde Hesaplama"
        description="X'in Y%'si kaç? A, B'nin yüzde kaçı? KDV, komisyon, kar marjı ve oran hesaplamaları için."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-7"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Hesaplama türü</span>
          <div className="inline-flex rounded-lg border p-1 gap-1" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
            <button
              type="button"
              onClick={() => setMod("x_yuzde")}
              className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${mod === "x_yuzde" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
              style={mod === "x_yuzde" ? { background: THEME.ribbon } : undefined}
            >
              X'in Y%'si kaç?
            </button>
            <button
              type="button"
              onClick={() => setMod("a_b_yuzde")}
              className={`whitespace-nowrap rounded px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${mod === "a_b_yuzde" ? "text-white" : "text-gray-700 hover:bg-gray-200"}`}
              style={mod === "a_b_yuzde" ? { background: THEME.ribbon } : undefined}
            >
              A, B'nin yüzde kaçı?
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {mod === "x_yuzde" ? "Sayı (X)" : "Pay (A)"}
            </label>
            <input
              type="text"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              placeholder={mod === "x_yuzde" ? "1000" : "250"}
              className="w-full rounded-lg border p-3 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {mod === "x_yuzde" ? "Yüzde (Y)" : "Tüm (B)"}
            </label>
            <input
              type="text"
              value={val2}
              onChange={(e) => setVal2(e.target.value)}
              placeholder={mod === "x_yuzde" ? "18" : "1000"}
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
            <div className="text-sm font-medium text-gray-800">{result}</div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
