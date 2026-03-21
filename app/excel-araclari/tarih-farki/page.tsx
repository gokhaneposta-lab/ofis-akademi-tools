"use client";

import React, { useState } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import InputTextarea from "@/components/InputTextarea";
import PrimaryButton from "@/components/PrimaryButton";

const ACCENT = "#217346";

/** DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD, Excel serial vb. */
function parseDate(s: string): Date | null {
  const t = s.trim();
  if (!t) return null;
  // ISO
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (iso) {
    const d = new Date(+iso[1], +iso[2] - 1, +iso[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  // DD.MM.YYYY veya DD/MM/YYYY
  const dmy = /^(\d{1,2})[./](\d{1,2})[./](\d{4})/.exec(t);
  if (dmy) {
    const d = new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
    return isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(t);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function addYears(d: Date, n: number): Date {
  const r = new Date(d);
  r.setFullYear(r.getFullYear() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

type DiffResult = { yil: number; ay: number; gun: number; toplamGun: number };

function dateDiffCalendar(baslama: Date, bitis: Date): DiffResult {
  if (bitis.getTime() < baslama.getTime()) {
    const ms = baslama.getTime() - bitis.getTime();
    return { yil: 0, ay: 0, gun: 0, toplamGun: -Math.floor(ms / (1000 * 60 * 60 * 24)) };
  }
  const ms = bitis.getTime() - baslama.getTime();
  const toplamGun = Math.floor(ms / (1000 * 60 * 60 * 24));

  let cur = new Date(baslama.getFullYear(), baslama.getMonth(), baslama.getDate());
  const end = new Date(bitis.getFullYear(), bitis.getMonth(), bitis.getDate());

  let yil = 0;
  while (addYears(cur, 1) <= end) {
    yil++;
    cur = addYears(cur, 1);
  }
  let ay = 0;
  while (addMonths(cur, 1) <= end) {
    ay++;
    cur = addMonths(cur, 1);
  }
  let gun = 0;
  if (cur.getTime() < end.getTime()) {
    gun = Math.floor((end.getTime() - cur.getTime()) / (1000 * 60 * 60 * 24));
  }

  return { yil, ay, gun, toplamGun };
}

type RowResult = {
  baslamaStr: string;
  bitisStr: string;
  baslama: Date | null;
  bitis: Date | null;
  diff: DiffResult | null;
  error?: string;
};

export default function TarihFarkiPage() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<RowResult[]>([]);
  const [copied, setCopied] = useState(false);

  function detectSeparator(line: string): string {
    if (line.includes("\t")) return "\t";
    if (line.includes(";")) return ";";
    return ",";
  }

  function handleHesapla() {
    const lines = input
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setRows([]);
      return;
    }

    const results: RowResult[] = lines.map((line) => {
      const sep = detectSeparator(line);
      const parts = line.split(sep).map((p) => p.trim());
      const baslamaStr = parts[0] ?? "";
      const bitisStr = parts[1] ?? "";
      const baslama = parseDate(baslamaStr);
      const bitis = parseDate(bitisStr);

      if (!baslamaStr && !bitisStr) {
        return { baslamaStr: "", bitisStr: "", baslama: null, bitis: null, diff: null, error: "Boş satır" };
      }
      if (!baslama) {
        return { baslamaStr, bitisStr, baslama: null, bitis: null, diff: null, error: "Başlama tarihi geçersiz" };
      }
      if (!bitis) {
        return { baslamaStr, bitisStr, baslama, bitis: null, diff: null, error: "Bitiş tarihi geçersiz" };
      }

      const diff = dateDiffCalendar(baslama, bitis);
      return { baslamaStr, bitisStr, baslama, bitis, diff };
    });

    setRows(results);
    setCopied(false);
  }

  function getCopyText(): string {
    const header = "Başlama Tarihi\tBitiş Tarihi\tYıl\tAy\tGün\tToplam Gün";
    const lines = rows.map((r) => {
      if (r.error) return `${r.baslamaStr}\t${r.bitisStr}\t-\t-\t-\t${r.error}`;
      if (!r.diff) return `${r.baslamaStr}\t${r.bitisStr}\t-\t-\t-\t-`;
      const d = r.diff;
      const toplamStr = d.toplamGun < 0 ? "-" : String(d.toplamGun);
      return `${r.baslamaStr}\t${r.bitisStr}\t${d.yil}\t${d.ay}\t${d.gun}\t${toplamStr}`;
    });
    return [header, ...lines].join("\n");
  }

  async function handleCopy() {
    if (!rows.length) return;
    try {
      await navigator.clipboard.writeText(getCopyText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        İki tarih arasındaki farkı yıl/ay/gün ve toplam gün olarak verir. Vade kontrolü, sözleşme süresi ve yaş hesaplama gibi işlemlerde hızlı ve güvenilir sonuç sağlar.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">01.01.2020 ↵ 01.10.2022</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">2 yıl, 9 ay, 0 gün · Toplam 1004 gün</p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Tarih Farkı (Vade / Gün / Yaş)"
      description="İki tarih arası Yıl, Ay, Gün ve toplam gün."
      path="/excel-araclari/tarih-farki"
      keywords={["tarih farkı hesaplama", "vade hesaplama", "iki tarih arası gün", "Excel tarih farkı", "yıl ay gün farkı", "Excel araçları"]}
      howToSteps={[
        "Başlama ve bitiş tarihlerini yapıştırın.",
        "Hesapla butonuna tıklayın.",
        "Yıl, Ay, Gün ve Toplam Gün görünür.",
      ]}
      faq={[
        { question: "Hangi tarih formatları?", answer: "DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD" },
        { question: "Yaş hesabı?", answer: "Doğum tarihi ve bugünü girerek hesaplayabilirsiniz." },
        { question: "Toplu satır?", answer: "Birden fazla satırı aynı anda hesaplayabilirsiniz." },
      ]}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          <Link
            href="/egitimler/orta"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Orta seviye eğitim
          </Link>
          {" · "}
          <Link
            href="/blog/excelde-tarih-farki-vade-gun-hesaplama"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            Tarih farkı rehberi
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-md sm:px-5">
          <label htmlFor="tarih-farki-input" className="block text-sm font-semibold text-gray-900">
            Başlama ve Bitiş tarihleri
          </label>
          <p className="mt-0.5 text-xs text-gray-400">Her satırda iki tarih (Tab veya ; ile)</p>
          <div className="mt-1.5">
            <InputTextarea
              id="tarih-farki-input"
              value={input}
              onChange={setInput}
              rows={8}
              minHeight="12rem"
              className="font-mono resize-y"
              placeholder={"01.01.2020\t01.10.2022\n15.03.2019\t20.05.2021"}
            />
          </div>
          <PrimaryButton className="mt-3" onClick={handleHesapla}>
            Hesapla
          </PrimaryButton>
        </div>

        {rows.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Başlama</th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Bitiş</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center sm:px-4">Yıl</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center sm:px-4">Ay</th>
                    <th className="whitespace-nowrap px-3 py-3 text-center sm:px-4">Gün</th>
                    <th className="whitespace-nowrap px-3 py-3 text-right sm:px-4">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-b-0">
                      <td className="px-3 py-2.5 font-mono text-gray-800 sm:px-4">{r.baslamaStr || "—"}</td>
                      <td className="px-3 py-2.5 font-mono text-gray-800 sm:px-4">{r.bitisStr || "—"}</td>
                      {r.error ? (
                        <td colSpan={4} className="px-3 py-2.5 text-xs font-medium text-amber-700 sm:px-4">
                          {r.error}
                        </td>
                      ) : r.diff ? (
                        <>
                          <td className="px-3 py-2.5 text-center font-medium text-gray-900 sm:px-4">{r.diff.yil}</td>
                          <td className="px-3 py-2.5 text-center font-medium text-gray-900 sm:px-4">{r.diff.ay}</td>
                          <td className="px-3 py-2.5 text-center font-medium text-gray-900 sm:px-4">{r.diff.gun}</td>
                          <td className="px-3 py-2.5 text-right font-medium tabular-nums text-gray-900 sm:px-4">
                            {r.diff.toplamGun >= 0 ? r.diff.toplamGun.toLocaleString("tr-TR") : "—"}
                          </td>
                        </>
                      ) : (
                        <td colSpan={4} className="px-3 py-2.5 text-gray-400 sm:px-4">
                          —
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!rows.length}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  style={copied ? { borderColor: ACCENT, color: ACCENT } : undefined}
                >
                  {copied ? "Kopyalandı ✓" : "Sonucu kopyala"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
