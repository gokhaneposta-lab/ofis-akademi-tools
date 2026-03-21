"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

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

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm transition-all focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.10)] focus:outline-none";

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        DÜŞEYARA ile tabloda aradığın değeri bulup aynı tablodaki başka bir sütundan sonucu getirmen için formülü otomatik üretir. Tam veya yaklaşık eşleşme seçerek listelerde doğru sonuç alırsın.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">
            Aranan: <span className="font-mono">A2</span> · Tablo: <span className="font-mono">Sheet2!A:B</span> · Sütun:{" "}
            <span className="font-mono">2</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">
            <span className="font-mono">=DÜŞEYARA(A2;Sheet2!A:B;2;0)</span>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="DÜŞEYARA Formül Oluşturucu"
      description="Aranan değer, arama tablosu ve sütun numarasından DÜŞEYARA (VLOOKUP) formülü oluşturur. Tam veya yaklaşık eşleşme seçebilirsiniz."
      path="/excel-araclari/duseyara-olusturucu"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          <Link
            href="/egitimler/orta"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            DÜŞEYARA eğitimi
          </Link>
          {" · "}
          <Link
            href="/blog/excel-duseyara-formul-olusturma"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            rehber yazısı
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-md sm:px-6 sm:py-6">
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Aranan değer (hücre veya değer)</label>
              <input
                type="text"
                value={aranan}
                onChange={(e) => setAranan(e.target.value)}
                placeholder="A2"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Arama tablosu</label>
              <input
                type="text"
                value={tablo}
                onChange={(e) => setTablo(e.target.value)}
                placeholder="Sheet2!A:B"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Dönecek sütun numarası</label>
              <input
                type="text"
                value={sutun}
                onChange={(e) => setSutun(e.target.value)}
                placeholder="2"
                className={`max-w-[140px] ${inputClass}`}
              />
            </div>
            <div>
              <span className="mb-2 block text-xs font-medium text-gray-600">Eşleşme türü</span>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    checked={tamEslesme}
                    onChange={() => setTamEslesme(true)}
                    className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-800">Tam eşleşme (0)</span>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    checked={!tamEslesme}
                    onChange={() => setTamEslesme(false)}
                    className="h-4 w-4 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-800">Yaklaşık eşleşme (1)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-200/90 bg-emerald-50/70 p-4 shadow-sm sm:p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">Oluşan formül</div>
            <code className="mt-2 block break-all rounded-xl bg-white/90 px-3 py-3 font-mono text-sm text-emerald-950 shadow-inner">
              {formula}
            </code>
            <ul className="mt-3 space-y-1 text-xs text-emerald-900/75">
              <li>
                <strong>{aranan.trim() || "A2"}</strong> → aranan değer
              </li>
              <li>
                <strong>{tablo.trim() || "Sheet2!A:B"}</strong> → tablo
              </li>
              <li>
                <strong>{Math.max(1, sutunNum)}</strong> → dönecek sütun
              </li>
              <li>
                <strong>{tamEslesme ? "0" : "1"}</strong> → {tamEslesme ? "tam eşleşme" : "yaklaşık eşleşme"}
              </li>
            </ul>
          </div>

          <div className="mt-5">
            <PrimaryButton onClick={handleCopy}>{copied ? "Kopyalandı" : "Formülü Kopyala"}</PrimaryButton>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
