"use client";

import React, { useState } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

export default function DuseyaraOlusturucuPage() {
  const [aranan, setAranan] = useState("A2");
  const [tablo, setTablo] = useState("Sheet2!A:B");
  const [sutun, setSutun] = useState("2");
  const [tamEslesme, setTamEslesme] = useState(true);
  const [copied, setCopied] = useState(false);

  const sutunNum = parseInt(sutun, 10) || 1;
  const formula = `=DÜŞEYARA(${aranan.trim() || "A2"};${tablo.trim() || "Sheet2!A:B"};${Math.max(1, sutunNum)};${tamEslesme ? "0" : "1"})`;

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
        title="DÜŞEYARA Formül Oluşturucu"
        description="Aranan değer, arama tablosu ve sütun numarasından DÜŞEYARA (VLOOKUP) formülü oluşturur. Tam veya yaklaşık eşleşme seçebilirsiniz."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Aranan değer (hücre veya değer), arama tablosu (örn. Sheet2!A:B) ve dönecek sütun numarasını girin.",
            "Tam eşleşme (0) veya yaklaşık eşleşme (1) seçin.",
            "Oluşan formülü kopyalayıp Excel'de ilgili hücreye yapıştırın.",
          ]}
          excelAlternatif={
            <>Excel&apos;de DÜŞEYARA dört parametre alır: <strong>aranan_değer</strong>, <strong>tablo</strong>, <strong>sütun_sayısı</strong>, <strong>0</strong> (tam) veya <strong>1</strong> (yaklaşık). Tablo sol sütununda arama yapılır.</>
          }
        />
        <div className="grid gap-4 sm:grid-cols-1">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Aranan değer (hücre veya değer)</label>
            <input
              type="text"
              value={aranan}
              onChange={(e) => setAranan(e.target.value)}
              placeholder="A2"
              className="w-full rounded-lg border p-2.5 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Arama tablosu</label>
            <input
              type="text"
              value={tablo}
              onChange={(e) => setTablo(e.target.value)}
              placeholder="Sheet2!A:B"
              className="w-full rounded-lg border p-2.5 text-sm bg-white"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Dönecek sütun numarası</label>
            <input
              type="text"
              value={sutun}
              onChange={(e) => setSutun(e.target.value)}
              placeholder="2"
              className="w-full rounded-lg border p-2.5 text-sm max-w-[120px]"
              style={{ borderColor: THEME.gridLine }}
            />
          </div>
          <div>
            <span className="block text-xs font-medium text-gray-600 mb-2">Eşleşme türü</span>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={tamEslesme} onChange={() => setTamEslesme(true)} className="rounded-full" />
              <span className="text-sm">Tam eşleşme (0)</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer ml-4">
              <input type="radio" checked={!tamEslesme} onChange={() => setTamEslesme(false)} className="rounded-full" />
              <span className="text-sm">Yaklaşık eşleşme (1)</span>
            </label>
          </div>
        </div>

        <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
          <div className="text-xs font-semibold text-gray-700 mb-2">Oluşan formül</div>
          <code className="block p-3 rounded bg-gray-100 text-sm break-all font-mono">{formula}</code>
          <ul className="mt-3 text-xs text-gray-600 space-y-1">
            <li><strong>{aranan.trim() || "A2"}</strong> → aranan değer</li>
            <li><strong>{tablo.trim() || "Sheet2!A:B"}</strong> → tablo</li>
            <li><strong>{Math.max(1, sutunNum)}</strong> → dönecek sütun</li>
            <li><strong>{tamEslesme ? "0" : "1"}</strong> → {tamEslesme ? "tam eşleşme" : "yaklaşık eşleşme"}</li>
          </ul>
        </div>
        <CopyButton onClick={handleCopy} copied={copied} label="Formülü Kopyala" copiedLabel="Kopyalandı" />

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/duseyara-olusturucu" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Mantık & Formül</div>
      </div>
    </div>
  );
}
