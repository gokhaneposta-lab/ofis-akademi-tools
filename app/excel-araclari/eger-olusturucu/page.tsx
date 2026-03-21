"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

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

  const howToSteps = [
    "Koşulu girin (örn. A1>50, B2=\"Evet\").",
    "Koşul doğruysa dönecek metin veya formülü, yanlışsa dönecek değeri yazın.",
    "Oluşan EĞER formülünü kopyalayıp Excel'de hücreye yapıştırın.",
  ];

  const faq = [
    {
      question: "Metinleri tırnak içine almalı mıyım?",
      answer: "Evet. Araç doğru formatta ekler (örn. \"Geçti\" gibi).",
    },
    {
      question: "Koşulda AND/OR var mı?",
      answer: "Evet. Koşul ifaden içinde VE/VEYA kullanabilirsin (örn. A1>50 VE B1>80).",
    },
    {
      question: "Sonuç olarak sayı mı dönebilir?",
      answer: "Evet. Doğruysa/Yanlışsa alanlarına sayı yazabilirsin.",
    },
  ];

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

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Koşul doğruysa “doğruysa”, değilse “yanlışsa” değerini kullanarak EĞER (IF) formülünü otomatik oluşturur. Not, geçti/kaldı, kontrol ve sınıflandırma senaryolarında hız sağlar.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">
            Koşul: <span className="font-mono">A1&gt;50</span> · Doğruysa: Geçti · Yanlışsa: Kaldı
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">
            <span className="font-mono">=EĞER(A1&gt;50;&quot;Geçti&quot;;&quot;Kaldı&quot;)</span>
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs text-gray-700">
        <p className="font-semibold text-gray-800">Excel&apos;de EĞER (IF)</p>
        <p className="mt-2">
          Üç parametre alır: <strong>koşul</strong> (mantıksal ifade, örn. A1&gt;10), <strong>doğruysa</strong> (koşul doğru olduğunda dönecek değer), <strong>yanlışsa</strong> (koşul yanlış olduğunda dönecek değer). Metinler çift tırnak içinde yazılır.
        </p>
        <p className="mt-2">
          Örnek: =EĞER(B2&gt;=50;&quot;Geçti&quot;;&quot;Kaldı&quot;). Koşulda karşılaştırma operatörleri (&gt;, &lt;, =, &lt;&gt;, &gt;=, &lt;=) ve AND/OR (VE/VEYA) kullanılabilir. Bu araç sizin için EĞER formülünü adım adım oluşturur.
        </p>
      </div>
    </>
  );

  const relatedLinks = (
    <span className="text-gray-600">
      Devam etmek için{" "}
      <Link
        href="/egitimler/temel"
        className="font-medium underline underline-offset-2"
        style={{ color: ACCENT }}
      >
        Temel EĞER eğitimi
      </Link>
      {" · "}
      <Link
        href="/blog/excel-eger-formul-olusturma"
        className="font-medium underline underline-offset-2"
        style={{ color: ACCENT }}
      >
        rehber yazısı
      </Link>
      {" "}
      sayfasına bak.
    </span>
  );

  return (
    <ToolLayout
      title="EĞER Formül Oluşturucu"
      description="Koşul, doğruysa ve yanlışsa değerlerinden EĞER (IF) formülü oluşturur. Kopyalayıp Excel'e yapıştırın."
      path="/excel-araclari/eger-olusturucu"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={relatedLinks}
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-md sm:px-6 sm:py-6">
          <div className="grid gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Koşul</label>
              <input
                type="text"
                value={kosul}
                onChange={(e) => setKosul(e.target.value)}
                placeholder="A1>50"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Doğruysa (koşul sağlanırsa)
              </label>
              <input
                type="text"
                value={dogruysa}
                onChange={(e) => setDogruysa(e.target.value)}
                placeholder="Geçti"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Yanlışsa (koşul sağlanmazsa)
              </label>
              <input
                type="text"
                value={yanlissa}
                onChange={(e) => setYanlissa(e.target.value)}
                placeholder="Kaldı"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-sm sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">
              Oluşan formül
            </p>
            <code className="mt-2 block break-all font-mono text-sm text-gray-900">{formula}</code>
            <div className="mt-4">
              <PrimaryButton onClick={handleCopy}>
                {copied ? "Kopyalandı ✓" : "Formülü kopyala"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
