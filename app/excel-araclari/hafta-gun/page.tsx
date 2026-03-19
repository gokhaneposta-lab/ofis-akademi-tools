"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

const GUN_ADLARI = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function parseDate(s: string): Date | null {
  const t = s.trim();
  if (!t) return null;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  const dmy = /^(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(t);
  if (dmy) {
    const d = new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
    return isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(t);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/** ISO 8601 hafta numarası (Pazartesi hafta başı) */
function getISOWeek(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 4);
  yearStart.setDate(4 - ((yearStart.getDay() + 6) % 7));
  const weekNo = 1 + Math.round(((thursday.getTime() - yearStart.getTime()) / 86400000 - 3) / 7);
  return weekNo;
}

function getDayName(d: Date): string {
  return GUN_ADLARI[d.getDay()];
}

type RowResult = { raw: string; date: Date | null; weekNo: number | null; dayName: string; error?: string };

export default function HaftaGunPage() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<RowResult[]>([]);
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setRows([]);
      return;
    }

    const results: RowResult[] = lines.map((raw) => {
      const date = parseDate(raw);
      if (!date) {
        return { raw, date: null, weekNo: null, dayName: "", error: "Geçersiz tarih" };
      }
      return {
        raw,
        date,
        weekNo: getISOWeek(date),
        dayName: getDayName(date),
      };
    });
    setRows(results);
    setCopied(false);
  }

  function copyText(): string {
    const header = "Tarih\tHafta No\tGün";
    const lines = rows.map((r) => {
      if (r.error) return `${r.raw}\t-\t${r.error}`;
      return `${r.raw}\t${r.weekNo}\t${r.dayName}`;
    });
    return [header, ...lines].join("\n");
  }

  async function handleCopy() {
    if (!rows.length) return;
    try {
      await navigator.clipboard.writeText(copyText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Hafta Numarası & Gün Adı"
        description="Tarih listesinden ISO hafta numarası ve gün adını (Pazartesi, Salı…) hesaplayın. Excel'den yapıştırın."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Tarih sütununu Excel'den kopyalayıp aşağıdaki kutuya yapıştırın (her satıra bir tarih; DD.MM.YYYY veya YYYY-MM-DD).",
            "Hesapla butonuna tıklayın.",
            "Tabloda hafta numarası (ISO) ve gün adı görünür; Sonucu Kopyala ile Excel'e yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de tarihten ISO hafta numarası ve gün adı almak için aşağıdaki formülleri kullanabilirsiniz. A1 tarih hücresidir.
              </p>
              <ExcelFormulBlok
                baslik="Hafta numarası (ISO 8601) için:"
                formül="=ISOHAFTASAY(A1)"
                aciklama="ISOHAFTASAY (İngilizce: ISOWEEKNUM) fonksiyonu tarihin yıl içindeki ISO hafta numarasını verir; hafta Pazartesi başlar. Raporlama ve planlama için sık kullanılır."
              />
              <ExcelFormulBlok
                baslik="Gün adı (Pazartesi = 1) için:"
                formül="=HAFTANINGÜNÜ(A1;2)"
                aciklama="HAFTANINGÜNÜ (WEEKDAY) ikinci parametre 2 ise Pazartesi 1, Pazar 7 olur. Sonucu sayı yerine metin göstermek için özel sayı biçimi 'gggg' kullanın veya CHOOSE ile =SEÇ(HAFTANINGÜNÜ(A1;2);'Pazartesi';'Salı';...) yazabilirsiniz."
              />
            </>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Tarihlerden ISO hafta numarasını ve gün adını toplu olarak hesaplar. Planlama, raporlama ve haftalık analizlerde işinizi hızlandırır.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Girdi</p>
              <p className="text-gray-700"><span className="font-mono">2025-03-01</span></p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Çıktı</p>
              <p className="text-gray-700">Hafta: <span className="font-mono">9</span> · Gün: <span className="font-mono">Cumartesi</span></p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold text-gray-900">Hafta numarası ISO mu?</span>
              <br />
              Evet. ISO 8601 (Pazartesi hafta başı) mantığıyla hesaplar.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Hangi formatlar çalışır?</span>
              <br />
              <span className="font-mono">DD.MM.YYYY</span> ve <span className="font-mono">YYYY-MM-DD</span>.
            </p>
            <p>
              <span className="font-semibold text-gray-900">Excel’e nasıl aktarırım?</span>
              <br />
              “Tabloyu Kopyala” ile Excel’e yapıştır.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Detaylı açıklama için{" "}
            <Link href="/blog/excelde-hafta-numarasi-ve-gun-adi" className="underline" style={{ color: THEME.ribbon }}>
              hafta numarası rehberini
            </Link>{" "}
            inceleyebilirsin.
          </p>
        </section>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Tarihler (her satıra bir tarih — DD.MM.YYYY veya YYYY-MM-DD)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="01.01.2024\n15.03.2024\n2024-12-25"
            rows={8}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
          <p className="text-xs text-gray-500 mt-1">Hafta numarası ISO 8601 (Pazartesi hafta başı).</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleHesapla}
            className="inline-flex min-w-[140px] justify-center rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Hesapla
          </button>
          <CopyButton onClick={handleCopy} disabled={!rows.length} copied={copied} label="Tabloyu Kopyala" copiedLabel="Kopyalandı" />
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                  <th className="border-b border-r px-3 py-2 text-left font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Tarih</th>
                  <th className="border-b border-r px-3 py-2 text-center font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Hafta No</th>
                  <th className="border-b px-3 py-2 text-left font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Gün</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-b-0" style={{ borderColor: THEME.gridLine }}>
                    <td className="border-r px-3 py-2 font-mono" style={{ borderColor: THEME.gridLine }}>{r.raw}</td>
                    {r.error ? (
                      <td colSpan={2} className="px-3 py-2 text-amber-700 text-xs">{r.error}</td>
                    ) : (
                      <>
                        <td className="border-r px-3 py-2 text-center tabular-nums" style={{ borderColor: THEME.gridLine }}>{r.weekNo}</td>
                        <td className="px-3 py-2">{r.dayName}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/hafta-gun" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Tarih araçları</div>
      </div>
    </div>
  );
}
