"use client";

import React, { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

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

  async function handleCopy() {
    if (!explanationText) return;
    try {
      await navigator.clipboard.writeText(explanationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Excel Formül Açıklayıcı"
        description="Yapıştırdığınız Excel formülünü Türkçe olarak adım adım açıklar. EĞER, DÜŞEYARA ve diğer yaygın formüller desteklenir."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Excel'den kopyaladığınız formülü (örn. =EĞER(A1>50;\"Geçti\";\"Kaldı\")) aşağıdaki kutuya yapıştırın.",
            "Açıklama otomatik oluşur. EĞER ve DÜŞEYARA formülleri ayrıntılı açıklanır.",
            "İsterseniz açıklamayı kopyalayıp not veya eğitim materyalinde kullanın.",
          ]}
          excelAlternatif={
            <>Excel&apos;de formül çubuğunda formülü seçip F9 ile parça parça hesaplatabilirsiniz. Bu araç ise formülü Türkçe cümlelerle açıklar.</>
          }
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Excel formülü (yapıştırın)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="=EĞER(A1>50;&quot;Geçti&quot;;&quot;Kaldı&quot;)"
            rows={5}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        {input.trim() && (
          <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs font-semibold text-gray-700 mb-2">{explained.title}</div>
            <ul className="space-y-1.5 text-sm text-gray-800">
              {explained.lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            <div className="mt-3"><CopyButton onClick={handleCopy} copied={copied} label="Açıklamayı Kopyala" copiedLabel="Kopyalandı" /></div>
          </div>
        )}

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/formul-aciklayici" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Mantık & Formül</div>
      </div>
    </div>
  );
}
