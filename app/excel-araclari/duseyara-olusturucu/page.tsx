"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import ToolJsonLd from "@/components/ToolJsonLd";

export default function DuseyaraOlusturucuPage() {
  const [aranan, setAranan] = useState("A2");
  const [tablo, setTablo] = useState("Sheet2!A:B");
  const [sutun, setSutun] = useState("2");
  const [tamEslesme, setTamEslesme] = useState(true);
  const [copied, setCopied] = useState(false);

  const howToSteps = [
    "Aranan değer (hücre veya değer), arama tablosu (örn. Sheet2!A:B) ve dönecek sütun numarasını girin.",
    "Tam eşleşme (0) veya yaklaşık eşleşme (1) seçin.",
    "Oluşan formülü kopyalayıp Excel'de ilgili hücreye yapıştırın.",
  ];

  const faq = [
    {
      question: "Tam eşleşme ne zaman?",
      answer: "Listede aradığın değer aynen geçiyorsa 0 seç.",
    },
    {
      question: "Yaklaşık eşleşme ne zaman?",
      answer: "Değerler sıralıysa ve aradığın aralığa en yakın sonucu istiyorsan 1 seç.",
    },
    {
      question: "Excel’e nasıl yapıştırırım?",
      answer: "Oluşan formülü kopyalayıp ilgili hücreye Ctrl+V yap.",
    },
  ];

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
      <ToolJsonLd
        name="DÜŞEYARA Formül Oluşturucu"
        description="Aranan değer, arama tablosu ve sütun numarasından DÜŞEYARA (VLOOKUP) formülü oluşturur. Tam veya yaklaşık eşleşme seçebilirsiniz."
        path="/excel-araclari/duseyara-olusturucu"
        howToSteps={howToSteps}
        faq={faq}
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={howToSteps}
          excelAlternatif={
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Excel&apos;de DÜŞEYARA (VLOOKUP) dört parametre alır: <strong>aranan_değer</strong> (ne arayacağınız), <strong>tablo</strong> (arama yapılacak aralık, örn. E2:F100), <strong>sütun_sayısı</strong> (tablonun kaçıncı sütunundan değer döndürüleceği), <strong>0</strong> (tam eşleşme) veya <strong>1</strong> (yaklaşık eşleşme).
              </p>
              <p>
                Arama her zaman tablonun en sol sütununda yapılır. Tam eşleşme için son parametreyi 0 veya YANLIŞ yazın; listelerde sık kullanılır. Bu araç sizin için doğru formülü oluşturur; kopyalayıp Excel&apos;e yapıştırabilirsiniz.
              </p>
            </div>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            DÜŞEYARA ile tabloda aradığın değeri bulup aynı tablodaki başka bir sütundan sonucu getirmen için formülü otomatik üretir. Tam veya yaklaşık eşleşme seçerek listelerde doğru sonuç alırsın.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">
                Aranan: <span className="font-mono">A2</span> · Tablo: <span className="font-mono">Sheet2!A:B</span> · Sütun: <span className="font-mono">2</span>
              </p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">
                <span className="font-mono">=DÜŞEYARA(A2;Sheet2!A:B;2;0)</span>
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Tam eşleşme ne zaman?</span><br />Listede aradığın değer aynen geçiyorsa <strong>0</strong> seç.</p>
            <p><span className="font-semibold text-gray-900">Yaklaşık eşleşme ne zaman?</span><br />Değerler sıralıysa ve aradığın aralığa en yakın sonucu istiyorsan <strong>1</strong> seç.</p>
            <p><span className="font-semibold text-gray-900">Excel’e nasıl yapıştırırım?</span><br />Oluşan formülü kopyalayıp ilgili hücreye Ctrl+V yap.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/orta" className="underline" style={{ color: THEME.ribbon }}>
              DÜŞEYARA eğitimi
            </Link>{" "}
            ve{" "}
            <Link href="/blog/excel-duseyara-formul-olusturma" className="underline" style={{ color: THEME.ribbon }}>
              rehber yazısı
            </Link>{" "}
            sayfasına bak.
          </div>
        </section>

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
