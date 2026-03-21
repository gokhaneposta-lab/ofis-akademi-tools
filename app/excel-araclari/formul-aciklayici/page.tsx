"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";

const ACCENT = "#217346";

function explainFormula(formula: string): { title: string; lines: string[] } {
  const f = formula.trim().replace(/^=/, "");
  const upper = f.toUpperCase();

  if (upper.startsWith("EĞER(") || upper.startsWith("IF(")) {
    const inner = f.slice(f.indexOf("(") + 1);
    let depth = 1;
    let i = 0;
    const parts: string[] = [];
    let cur = "";
    for (; i < inner.length && depth > 0; i++) {
      const c = inner[i];
      if (c === "(") depth++;
      else if (c === ")") depth--;
      else if ((c === ";" || c === ",") && depth === 1) {
        parts.push(cur.trim());
        cur = "";
        continue;
      }
      cur += c;
    }
    if (cur.trim()) parts.push(cur.trim());
    if (parts.length >= 3) {
      const [cond, thenVal, elseVal] = parts;
      const condStr = cond.replace(/^["']|["']$/g, "");
      const thenStr = thenVal.replace(/^["']|["']$/g, "");
      const elseStr = elseVal.replace(/^["']|["']$/g, "");
      return {
        title: "EĞER formülü",
        lines: [
          `${condStr} koşulunu kontrol eder.`,
          `Koşul doğruysa → ${thenStr}`,
          `Koşul yanlışsa → ${elseStr}`,
        ],
      };
    }
  }

  if (upper.startsWith("DÜŞEYARA(") || upper.startsWith("VLOOKUP(")) {
    const inner = f.slice(f.indexOf("(") + 1);
    let depth = 1;
    let i = 0;
    const parts: string[] = [];
    let cur = "";
    for (; i < inner.length && depth > 0; i++) {
      const c = inner[i];
      if (c === "(") depth++;
      else if (c === ")") depth--;
      else if ((c === ";" || c === ",") && depth === 1) {
        parts.push(cur.trim());
        cur = "";
        continue;
      }
      cur += c;
    }
    if (cur.trim()) parts.push(cur.trim());
    if (parts.length >= 4) {
      return {
        title: "DÜŞEYARA formülü",
        lines: [
          `${parts[0]} → Aranan değer (bu değer tabloda sol sütunda aranır).`,
          `${parts[1]} → Arama tablosu.`,
          `${parts[2]} → Döndürülecek sütun numarası.`,
          `${parts[3]} → 0 = tam eşleşme, 1 = yaklaşık eşleşme.`,
        ],
      };
    }
  }

  const known: Record<string, string> = {
    "TOPLA": "Seçilen hücrelerin toplamını hesaplar.",
    "ORTALAMA": "Seçilen hücrelerin ortalamasını alır.",
    "MAK": "Maksimum değeri döndürür.",
    "MİN": "Minimum değeri döndürür.",
    "EĞERSAY": "Koşula uyan hücre sayısını verir.",
    "TOPLA.ÇARPIM": "İki dizinin karşılıklı çarpımlarının toplamı.",
  };
  for (const [key, desc] of Object.entries(known)) {
    if (upper.startsWith(key + "(")) {
      return { title: key + " formülü", lines: [desc] };
    }
  }

  const parts = f.split(/[;(,)]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 0) {
    return {
      title: "Formül yapısı",
      lines: parts.length <= 8 ? parts.map((p, i) => `Parça ${i + 1}: ${p}`) : ["Bu formül çok parçalı. EĞER veya DÜŞEYARA için yukarıdaki açıklamalar kullanılır; diğer formüllerde Excel yardımından yararlanabilirsiniz."],
    };
  }

  return { title: "Açıklama", lines: ["Geçerli bir formül girin (örn. =EĞER(A1>50;\"Geçti\";\"Kaldı\") veya =DÜŞEYARA(A2;Sheet2!A:B;2;0))."] };
}

export default function FormulAciklayiciPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const explained = useMemo(() => explainFormula(input), [input]);
  const explanationText = [explained.title, ...explained.lines].join("\n");

  const handleCopy = useCallback(async () => {
    if (!explanationText) return;
    try {
      await navigator.clipboard.writeText(explanationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }, [explanationText]);

  return (
    <ToolLayout
      title="Excel Formül Açıklayıcı"
      description="Yapıştırdığınız Excel formülünü Türkçe olarak adım adım açıklar."
      path="/excel-araclari/formul-aciklayici"
      howToSteps={[
        "Excel formülünü (örn. =EĞER(A1>50;\"Geçti\";\"Kaldı\")) kutuya yapıştırın.",
        "Açıklama otomatik oluşur.",
        "Kopyala ile açıklamayı alabilirsiniz.",
      ]}
      faq={[
        { question: "Her formül açıklanır mı?", answer: "Yaygın fonksiyonlarda detaylı açıklama; karmaşık formüllerde genel özet." },
        { question: "Dil nasıl?", answer: "Açıklamalar Türkçe üretilir." },
        { question: "Çıktıyı kullanabilir miyim?", answer: "Evet, kopyalayıp ders notuna ekleyebilirsiniz." },
      ]}
      aboutContent={
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            Yapıştırdığınız Excel formülünü Türkçe cümlelerle özetleyip adım adım açıklamaya yardımcı olur. Özellikle{" "}
            <span className="font-mono text-gray-900">EĞER</span> ve <span className="font-mono text-gray-900">DÜŞEYARA</span> gibi yaygın
            fonksiyonlarda daha net bilgi verir.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
              <p className="mb-1 text-xs font-semibold text-gray-800">Girdi</p>
              <p className="break-all font-mono text-xs text-gray-700">
                <span>=EĞER(A1&gt;50;&quot;Geçti&quot;;&quot;Kaldı&quot;)</span>
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3">
              <p className="mb-1 text-xs font-semibold text-gray-800">Çıktı (özet)</p>
              <p className="text-xs text-gray-700">
                <span className="font-semibold">A1&gt;50</span> koşulu kontrol edilir. Koşul doğruysa{" "}
                <span className="font-semibold">Geçti</span>, yanlışsa <span className="font-semibold">Kaldı</span> döner.
              </p>
            </div>
          </div>
        </div>
      }
      relatedLinks={
        <Link href="/egitimler/temel" className="font-medium underline underline-offset-2" style={{ color: ACCENT }}>
          Temel eğitim içerikleri
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-800">Excel formülünü yapıştırın</span>
            <InputTextarea
              value={input}
              onChange={setInput}
              rows={4}
              minHeight="6.5rem"
              placeholder='=EĞER(A1>50;"Geçti";"Kaldı")'
              className="font-mono text-sm"
            />
          </label>

          {input.trim() ? (
            <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-4 shadow-sm sm:px-5">
              <p className="text-base font-bold text-gray-900">{explained.title}</p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-gray-800">
                {explained.lines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98] sm:w-auto"
                style={{ backgroundColor: ACCENT }}
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Kopyala
                  </>
                )}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </ToolLayout>
  );
}
