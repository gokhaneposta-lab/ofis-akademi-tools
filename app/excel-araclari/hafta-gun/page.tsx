"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

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
    <ToolLayout
      title="Hafta Numarası & Gün Adı"
      description="Tarih listesinden ISO hafta numarası ve gün adını hesaplayın."
      path="/excel-araclari/hafta-gun"
      howToSteps={[
        "Tarih sütununu kutuya yapıştırın (DD.MM.YYYY veya YYYY-MM-DD).",
        "Hesapla butonuna tıklayın.",
        "Tabloda hafta numarası ve gün adı görünür.",
      ]}
      faq={[
        { question: "Hafta numarası ISO mu?", answer: "Evet, ISO 8601 Pazartesi hafta başı." },
        { question: "Hangi formatlar çalışır?", answer: "DD.MM.YYYY ve YYYY-MM-DD." },
        { question: "Excel'e nasıl aktarırım?", answer: "Tabloyu Kopyala ile yapıştırın." },
      ]}
      aboutContent={
        <>
          <p className="mb-4 text-sm text-gray-700">
            Tarihlerden ISO hafta numarasını ve gün adını toplu olarak hesaplar. Planlama, raporlama ve haftalık analizlerde işinizi hızlandırır.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
              <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
              <p className="font-mono text-gray-700">2025-03-01</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
              <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
              <p className="text-gray-700">
                Hafta: <span className="font-mono">9</span> · Gün: <span className="font-mono">Cumartesi</span>
              </p>
            </div>
          </div>
        </>
      }
      relatedLinks={
        <Link href="/blog/excelde-hafta-numarasi-ve-gun-adi" className="underline underline-offset-2" style={{ color: ACCENT }}>
          Excel&apos;de hafta numarası ve gün adı
        </Link>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label className="mb-0 block text-sm font-medium text-gray-800">Tarihleri yapıştırın</label>
          <p className="mt-0.5 text-xs text-gray-400">ISO 8601 · Pazartesi hafta başı</p>
          <InputTextarea
            value={input}
            onChange={setInput}
            placeholder={"01.01.2024\n15.03.2024\n2024-12-25"}
            rows={8}
            minHeight="12rem"
            className="!resize-y border-gray-200 bg-white font-mono text-sm"
          />
          <PrimaryButton className="mt-3" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {rows.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[280px] text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-800">Tarih</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-center font-semibold text-gray-800">Hafta No</th>
                    <th className="border-b border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-800">Gün</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-3 py-2.5 font-mono text-gray-900">{r.raw}</td>
                      {r.error ? (
                        <td colSpan={2} className="px-3 py-2.5 text-xs text-amber-700">
                          {r.error}
                        </td>
                      ) : (
                        <>
                          <td className="px-3 py-2.5 text-center tabular-nums text-gray-900">{r.weekNo}</td>
                          <td className="px-3 py-2.5 text-gray-900">{r.dayName}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!rows.length}
                className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition enabled:hover:border-gray-300 enabled:hover:bg-gray-50 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                style={rows.length ? { color: ACCENT } : undefined}
              >
                {copied ? "Kopyalandı" : "Tabloyu Kopyala"}
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
