"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

function escapeVal(s: string): string {
  const t = s.trim();
  if (!t) return '""';
  if (/^[A-Za-z0-9_.]+$/.test(t) && !/^\d+$/.test(t)) return t;
  return `"${t.replace(/"/g, '""')}"`;
}

type Row = { kosul: string; sonuc: string };

export default function IcIceEgerOlusturucuPage() {
  const [rows, setRows] = useState<Row[]>([
    { kosul: "A1>90", sonuc: "AA" },
    { kosul: "A1>80", sonuc: "BA" },
    { kosul: "A1>70", sonuc: "BB" },
  ]);
  const [aksiHalde, setAksiHalde] = useState("CC");
  const [copied, setCopied] = useState(false);

  function addRow() {
    setRows((r) => [...r, { kosul: "", sonuc: "" }]);
  }
  function removeRow(i: number) {
    setRows((r) => r.filter((_, j) => j !== i));
  }
  function updateRow(i: number, field: "kosul" | "sonuc", value: string) {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [field]: value } : row)));
  }

  const validRows = rows.filter((r) => r.kosul.trim());
  let formula = escapeVal(aksiHalde);
  for (const row of validRows.reverse()) {
    formula = `EĞER(${row.kosul.trim()};${escapeVal(row.sonuc)};${formula})`;
  }
  formula = "=" + formula;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formula);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  const howToSteps = [
    "Her satıra bir koşul ve sonuç girin (örn. A1>90 → AA). Üstteki satırlar önceliklidir.",
    "Hiçbir koşul sağlanmazsa dönecek değeri \"Aksi halde\" alanına yazın.",
    "Oluşan iç içe EĞER formülünü kopyalayıp Excel'e yapıştırın.",
  ];

  const faq = [
    {
      question: "Satır sırası önemli mi?",
      answer: "Evet. Yukarıdaki koşullar önce değerlendirilir.",
    },
    {
      question: "Koşul karşılanmazsa ne olur?",
      answer: "“Aksi halde” alanındaki değer döner.",
    },
    {
      question: "Daha modern alternatif var mı?",
      answer: "Excel 365’te EĞERLER (IFS) fonksiyonu bazı senaryolarda daha okunaklıdır.",
    },
  ];

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Birden fazla koşuldan (örn. puan aralıkları) tek bir sonuç üretmek için iç içe EĞER (nested IF) formülünü hazırlar. Sonuç aralığı, yukarıdan aşağı öncelik sırasıyla çalışır.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">
            Satırlar: <span className="font-mono">A1&gt;90 → AA</span>, <span className="font-mono">A1&gt;80 → BA</span>,{" "}
            <span className="font-mono">A1&gt;70 → BB</span>
          </p>
          <p className="mt-2 text-gray-700">
            Aksi halde: <span className="font-mono">CC</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">
            <span className="font-mono break-all">
              =EĞER(A1&gt;90;&quot;AA&quot;;EĞER(A1&gt;80;&quot;BA&quot;;EĞER(A1&gt;70;&quot;BB&quot;;&quot;CC&quot;))))
            </span>
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs text-gray-700">
        <p className="font-semibold text-gray-800">Excel&apos;de iç içe EĞER</p>
        <p className="mt-2">
          Birden fazla koşula göre sonuç vermek için iç içe EĞER kullanılır: her EĞER&apos;in &quot;yanlışsa&quot; kısmına bir sonraki EĞER yazılır. Örnek: not aralığı (0-49 Kaldı, 50-69 Orta, 70+ İyi) veya kademe belirleme.
        </p>
        <p className="mt-2">
          Excel 365&apos;te EĞERLER (IFS) ile koşulları tek fonksiyonda sırayla yazabilirsiniz; okunaklılık artar. Alternatif olarak XLOOKUP veya DÜŞEYARA ile tablo tabanlı eşleştirme de kullanılabilir. Bu araç iç içe EĞER formülünü otomatik üretir.
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
        Temel mantık eğitimlerine
      </Link>{" "}
      göz atabilirsin.
    </span>
  );

  return (
    <ToolLayout
      title="İç içe EĞER Oluşturucu"
      description="Birden fazla koşul–sonuç satırından iç içe EĞER formülü üretir. Not aralığı (AA, BA, BB…), kademe veya puan dilimi için ideal."
      path="/excel-araclari/ic-ice-eger-olusturucu"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={relatedLinks}
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-md sm:px-6 sm:py-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Koşul → Sonuç</h2>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 active:scale-[0.98] sm:w-auto"
              style={{ color: ACCENT }}
            >
              + Satır ekle
            </button>
          </div>

          <div className="space-y-3">
            {rows.map((row, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-200 bg-gray-50/50 p-3 shadow-sm sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600">Koşul</label>
                    <input
                      type="text"
                      value={row.kosul}
                      onChange={(e) => updateRow(i, "kosul", e.target.value)}
                      placeholder="A1>90"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div className="hidden shrink-0 pb-3 text-gray-400 sm:block" aria-hidden>
                    →
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs font-medium text-gray-600">Sonuç</label>
                    <input
                      type="text"
                      value={row.sonuc}
                      onChange={(e) => updateRow(i, "sonuc", e.target.value)}
                      placeholder="AA"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex sm:shrink-0 sm:pb-0.5">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="w-full rounded-xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 active:scale-[0.98] sm:w-auto sm:px-3"
                      aria-label="Kaldır"
                    >
                      Kaldır
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Aksi halde (hiçbiri sağlanmazsa)
            </label>
            <input
              type="text"
              value={aksiHalde}
              onChange={(e) => setAksiHalde(e.target.value)}
              placeholder="CC"
              className="w-full max-w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:outline-none sm:max-w-xs"
            />
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-4 shadow-sm sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">Oluşan formül</p>
            <code className="mt-2 block break-all font-mono text-sm whitespace-pre-wrap text-gray-900">{formula}</code>
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
