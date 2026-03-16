"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

function escapeForFormula(s: string): string {
  const t = s.trim();
  if (!t) return '""';
  if (/^[A-Za-z0-9_.]+$/.test(t) && !/^\d+$/.test(t)) return t;
  return `"${t.replace(/"/g, '""')}"`;
}

export default function EgerOlusturucuPage() {
  const [kosul, setKosul] = useState("A1>50");
  const [dogruysa, setDogruysa] = useState("Geçti");
  const [yanlissa, setYanlissa] = useState("Kaldı");
  const [copied, setCopied] = useState(false);

  const formula = `=EĞER(${kosul.trim() || "A1>50"};${escapeForFormula(dogruysa)};${escapeForFormula(yanlissa)})`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="EĞER Formül Oluşturucu"
        description="Koşul, doğruysa ve yanlışsa değerlerinden EĞER (IF) formülü oluşturur. Kopyalayıp Excel'e yapıştırın."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Koşulu girin (örn. A1>50, B2=\"Evet\").",
            "Koşul doğruysa dönecek metin veya formülü, yanlışsa dönecek değeri yazın.",
            "Oluşan EĞER formülünü kopyalayıp Excel'de hücreye yapıştırın.",
          ]}
          excelAlternatif={
            <>Excel&apos;de <code className="bg-gray-100 px-1 rounded text-xs">=EĞER(koşul;doğruysa;yanlışsa)</code> — koşul doğruysa ikinci, yanlışsa üçüncü değer döner. Metinler tırnak içinde yazılır.</>
          }
        />
        <div className="grid gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Koşul</label>
            <input
              type="text"
              value={kosul}
              onChange={(e) => setKosul(e.target.value)}
              placeholder="A1>50"
              className="w-full rounded-lg border p-2.5 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Doğruysa (koşul sağlanırsa)</label>
            <input
              type="text"
              value={dogruysa}
              onChange={(e) => setDogruysa(e.target.value)}
              placeholder="Geçti"
              className="w-full rounded-lg border p-2.5 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Yanlışsa (koşul sağlanmazsa)</label>
            <input
              type="text"
              value={yanlissa}
              onChange={(e) => setYanlissa(e.target.value)}
              placeholder="Kaldı"
              className="w-full rounded-lg border p-2.5 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
          <div className="text-xs font-semibold text-gray-700 mb-2">Oluşan formül</div>
          <code className="block p-3 rounded bg-gray-100 text-sm break-all font-mono">{formula}</code>
        </div>
        <CopyButton onClick={handleCopy} copied={copied} label="Formülü Kopyala" copiedLabel="Kopyalandı" />

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/eger-olusturucu" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Mantık & Formül</div>
      </div>
    </div>
  );
}
