"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
          showEnhancedSections={false}
          steps={[
            "Excel'den kopyaladığınız formülü (örn. =EĞER(A1>50;\"Geçti\";\"Kaldı\")) aşağıdaki kutuya yapıştırın.",
            "Açıklama otomatik oluşur. EĞER ve DÜŞEYARA formülleri ayrıntılı açıklanır.",
            "İsterseniz açıklamayı kopyalayıp not veya eğitim materyalinde kullanın.",
          ]}
          excelAlternatif={
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Excel&apos;de formül çubuğunda formülün bir kısmını seçip <strong>F9</strong> tuşuna basarak o parçanın hesaplanmış değerini görebilirsiniz; adım adım debug için kullanışlıdır.
              </p>
              <p>
                Bu araç ise yapıştırdığınız Excel formülünü Türkçe cümlelerle açıklar: hangi fonksiyon ne parametre alıyor, mantık nasıl işliyor. Başkasının yazdığı formülü anlamak veya eğitim amaçlı kullanmak için uygundur.
              </p>
            </div>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Yapıştırdığın Excel formülünü Türkçe cümlelerle özetleyip adım adım açıklamaya yardımcı olur. Özellikle <span className="font-mono">EĞER</span> ve <span className="font-mono">DÜŞEYARA</span> gibi yaygın fonksiyonlarda daha net bilgi verir.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Girdi</p>
              <p className="font-mono text-gray-700"><span>=EĞER(A1&gt;50;&quot;Geçti&quot;;&quot;Kaldı&quot;)</span></p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Çıktı (özet)</p>
              <p className="text-gray-700">
                <span className="font-semibold">A1&gt;50</span> koşulu kontrol edilir. Koşul doğruysa <span className="font-semibold">Geçti</span>, yanlışsa <span className="font-semibold">Kaldı</span> döner.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Her formül açıklanır mı?</span><br />Temel olarak desteklenen yaygın fonksiyonlarda daha detaylı açıklama sağlar; çok karmaşık formüllerde genel özet sunar.</p>
            <p><span className="font-semibold text-gray-900">Dil nasıl?</span><br />Açıklamalar Türkçe üretilir.</p>
            <p><span className="font-semibold text-gray-900">Çıktıyı kullanabilir miyim?</span><br />Evet. Kutuda görünene göre kopyalayarak ders notuna veya metne ekleyebilirsin.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/temel" className="underline" style={{ color: THEME.ribbon }}>
              temel eğitim içeriklerine
            </Link>{" "}
            göz at.
          </div>
        </section>
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
