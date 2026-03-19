"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="İç içe EĞER Oluşturucu"
        description="Birden fazla koşul–sonuç satırından iç içe EĞER formülü üretir. Not aralığı (AA, BA, BB…), kademe veya puan dilimi için ideal."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Her satıra bir koşul ve sonuç girin (örn. A1>90 → AA). Üstteki satırlar önceliklidir.",
            "Hiçbir koşul sağlanmazsa dönecek değeri \"Aksi halde\" alanına yazın.",
            "Oluşan iç içe EĞER formülünü kopyalayıp Excel'e yapıştırın.",
          ]}
          excelAlternatif={
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                Excel&apos;de birden fazla koşula göre sonuç vermek için iç içe EĞER kullanılır: her EĞER&apos;in &quot;yanlışsa&quot; kısmına bir sonraki EĞER yazılır. Örnek: not aralığı (0-49 Kaldı, 50-69 Orta, 70+ İyi) veya kademe belirleme.
              </p>
              <p>
                Excel 365&apos;te EĞERLER (IFS) ile koşulları tek fonksiyonda sırayla yazabilirsiniz; okunaklılık artar. Alternatif olarak XLOOKUP veya DÜŞEYARA ile tablo tabanlı eşleştirme de kullanılabilir. Bu araç iç içe EĞER formülünü otomatik üretir.
              </p>
            </div>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Birden fazla koşuldan (örn. puan aralıkları) tek bir sonuç üretmek için iç içe EĞER (nested IF) formülünü hazırlar. Sonuç aralığı, yukarıdan aşağı öncelik sırasıyla çalışır.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">Satırlar: <span className="font-mono">A1&gt;90 → AA</span>, <span className="font-mono">A1&gt;80 → BA</span>, <span className="font-mono">A1&gt;70 → BB</span></p>
              <p className="text-gray-700 mt-2">Aksi halde: <span className="font-mono">CC</span></p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">
                <span className="font-mono">=EĞER(A1&gt;90;&quot;AA&quot;;EĞER(A1&gt;80;&quot;BA&quot;;EĞER(A1&gt;70;&quot;BB&quot;;&quot;CC&quot;))))</span>
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Satır sırası önemli mi?</span><br />Evet. Yukarıdaki koşullar önce değerlendirilir.</p>
            <p><span className="font-semibold text-gray-900">Koşul karşılanmazsa ne olur?</span><br />“Aksi halde” alanındaki değer döner.</p>
            <p><span className="font-semibold text-gray-900">Daha modern alternatif var mı?</span><br />Excel 365’te EĞERLER (IFS) fonksiyonu bazı senaryolarda daha okunaklıdır.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/temel" className="underline" style={{ color: THEME.ribbon }}>
              Temel mantık eğitimlerine
            </Link>{" "}
            göz atabilirsin.
          </div>
        </section>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Koşul → Sonuç</span>
            <button
              type="button"
              onClick={addRow}
              className="text-xs font-medium rounded px-2 py-1 border"
              style={{ borderColor: THEME.ribbon, color: THEME.ribbon }}
            >
              + Satır ekle
            </button>
          </div>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  value={row.kosul}
                  onChange={(e) => updateRow(i, "kosul", e.target.value)}
                  placeholder="A1>90"
                  className="flex-1 min-w-[100px] rounded border p-2 text-sm"
                  style={{ borderColor: THEME.gridLine }}
                />
                <span className="text-gray-500">→</span>
                <input
                  type="text"
                  value={row.sonuc}
                  onChange={(e) => updateRow(i, "sonuc", e.target.value)}
                  placeholder="AA"
                  className="flex-1 min-w-[80px] rounded border p-2 text-sm"
                  style={{ borderColor: THEME.gridLine }}
                />
                <button type="button" onClick={() => removeRow(i)} className="text-red-600 text-xs px-1" aria-label="Kaldır">Kaldır</button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Aksi halde (hiçbiri sağlanmazsa)</label>
          <input
            type="text"
            value={aksiHalde}
            onChange={(e) => setAksiHalde(e.target.value)}
            placeholder="CC"
            className="w-full max-w-[200px] rounded-lg border p-2.5 text-sm bg-white"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        <div className="rounded-lg border p-4 bg-white" style={{ borderColor: THEME.ribbon }}>
          <div className="text-xs font-semibold text-gray-700 mb-2">Oluşan formül</div>
          <code className="block p-3 rounded bg-gray-100 text-sm break-all font-mono whitespace-pre-wrap">{formula}</code>
        </div>
        <CopyButton onClick={handleCopy} copied={copied} label="Formülü Kopyala" copiedLabel="Kopyalandı" />

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/ic-ice-eger-olusturucu" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Mantık & Formül</div>
      </div>
    </div>
  );
}
