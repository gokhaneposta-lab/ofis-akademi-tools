"use client";

import React, { useState } from "react";
import Link from "next/link";
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
          showEnhancedSections={false}
          steps={[
            "Koşulu girin (örn. A1>50, B2=\"Evet\").",
            "Koşul doğruysa dönecek metin veya formülü, yanlışsa dönecek değeri yazın.",
            "Oluşan EĞER formülünü kopyalayıp Excel'de hücreye yapıştırın.",
          ]}
          excelAlternatif={
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Excel&apos;de EĞER (IF) fonksiyonu üç parametre alır: <strong>koşul</strong> (mantıksal ifade, örn. A1&gt;10), <strong>doğruysa</strong> (koşul doğru olduğunda dönecek değer), <strong>yanlışsa</strong> (koşul yanlış olduğunda dönecek değer). Metinler çift tırnak içinde yazılır.
              </p>
              <p>
                Örnek: =EĞER(B2&gt;=50;&quot;Geçti&quot;;&quot;Kaldı&quot;). Koşulda karşılaştırma operatörleri (&gt;, &lt;, =, &lt;&gt;, &gt;=, &lt;=) ve AND/OR (VE/VEYA) kullanılabilir. Bu araç sizin için EĞER formülünü adım adım oluşturur.
              </p>
            </div>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Koşul doğruysa “doğruysa”, değilse “yanlışsa” değerini kullanarak EĞER (IF) formülünü otomatik oluşturur. Not, geçti/kaldı, kontrol ve sınıflandırma senaryolarında hız sağlar.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">Koşul: <span className="font-mono">A1&gt;50</span> · Doğruysa: Geçti · Yanlışsa: Kaldı</p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700"><span className="font-mono">=EĞER(A1&gt;50;&quot;Geçti&quot;;&quot;Kaldı&quot;)</span></p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Metinleri tırnak içine almalı mıyım?</span><br />Evet. Araç doğru formatta ekler. Örn. &quot;Geçti&quot; gibi.</p>
            <p><span className="font-semibold text-gray-900">Koşulda AND/OR var mı?</span><br />Evet. Koşul ifaden içinde VE/VEYA kullanabilirsin (örn. A1&gt;50 VE B1&gt;80).</p>
            <p><span className="font-semibold text-gray-900">Sonuç olarak sayı mı dönebilir?</span><br />Evet. “Doğruysa/Yanlışsa” alanlarına sayı yazabilirsin.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/temel" className="underline" style={{ color: THEME.ribbon }}>
              Temel EĞER eğitimi
            </Link>{" "}
            ve{" "}
            <Link href="/blog/excel-eger-formul-olusturma" className="underline" style={{ color: THEME.ribbon }}>
              rehber yazısı
            </Link>{" "}
            sayfasına bak.
          </div>
        </section>
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
