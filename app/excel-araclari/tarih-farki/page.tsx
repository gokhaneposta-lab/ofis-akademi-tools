"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import JsonLdTool from "@/components/JsonLd";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

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

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <JsonLdTool
        name="Tarih Farkı (Vade / Gün / Yaş) — Ücretsiz Excel Aracı"
        description="İki tarih arası vade, gün veya yaş hesaplama. Yıl, ay, gün ve toplam gün. Doğum tarihinden bugüne yaş hesaplama. Excel'den çok satır yapıştırın. Ücretsiz."
        path="/excel-araclari/tarih-farki"
        keywords={["tarih farkı hesaplama", "vade hesaplama", "iki tarih arası gün", "Excel tarih farkı", "yıl ay gün farkı", "Excel araçları"]}
      />
      <PageRibbon
        title="Tarih Farkı (Vade / Gün / Yaş)"
        description="İki tarih arası Yıl, Ay, Gün ve toplam gün hesaplar. Vade farkı veya yaş hesaplama (doğum tarihi → bugün) için kullanın. Excel'den çok satır yapıştırabilirsiniz."
      />

      <div
        className="mx-auto mt-2 mb-6 max-w-4xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Excel'de başlama ve bitiş tarihlerinin olduğu 2 sütunu kopyalayıp aşağıdaki kutuya yapıştırın (her satırda iki tarih; Tab veya noktalı virgül ile ayrılmış).",
            "Hesapla butonuna tıklayın.",
            "Tabloda Yıl, Ay, Gün ve Toplam Gün görünür; Sonucu Kopyala ile Excel'e yapıştırın.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de iki tarih arasındaki farkı gün, yıl veya ay olarak hesaplamak için aşağıdaki yöntemleri kullanabilirsiniz. A2 başlangıç, B2 bitiş tarihi olsun.
              </p>
              <ExcelFormulBlok
                baslik="İki tarih arası gün sayısı için:"
                formül="=B2-A2"
                aciklama="Tarih hücreleri Excel&apos;de sayı olarak saklanır; iki tarihi çıkardığınızda aradaki gün sayısı elde edilir. Vade farkı veya yaş hesaplama (doğum tarihi ile bugün) için sık kullanılır."
              />
              <ExcelFormulBlok
                baslik="Yıl, ay ve gün ayrı ayrı (Excel 365):"
                formül="=TARİHFARKI(A2;B2;'Y')"
                aciklama="TARİHFARKI (DATEDIF) üçüncü parametrede 'Y' (yıl), 'YM' (ay farkı), 'MD' (gün farkı) alabilir. Tam yaş veya vade için yıl ve kalan ay/gün ayrı hesaplanabilir. Eski sürümlerde =DATEDIF(A2;B2;'Y') kullanın."
              />
            </>
          }
        />
        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            İki tarih arasındaki farkı yıl/ay/gün ve toplam gün olarak verir. Vade kontrolü, sözleşme süresi ve yaş hesaplama gibi işlemlerde hızlı ve güvenilir sonuç sağlar.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek girdi</p>
              <p className="text-gray-700">01.01.2020 ↵ 01.10.2022</p>
            </div>
            <div className="rounded-lg border p-3 text-xs" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
              <p className="font-semibold text-gray-800 mb-1">Örnek çıktı</p>
              <p className="text-gray-700">2 yıl, 9 ay, 0 gün · Toplam 1004 gün</p>
            </div>
          </div>
        </section>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Başlama ve Bitiş tarihleri (Excel'den 2 sütun kopyalayıp yapıştırın)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"01.01.2020\t01.10.2022\n15.03.2019\t20.05.2021"}
            rows={8}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Her satırda iki değer: Başlama tarihi ve Bitiş tarihi. Sütun ayırıcı: Tab veya noktalı virgül. Örnek: 01.01.2020 — 01.10.2022 → 2 Yıl, 9 Ay, 0 Gün
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleHesapla}
            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Hesapla
          </button>
          <CopyButton onClick={handleCopy} disabled={!rows.length} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
        </div>

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                  <th className="border-b border-r px-3 py-2 text-left font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Başlama Tarihi</th>
                  <th className="border-b border-r px-3 py-2 text-left font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Bitiş Tarihi</th>
                  <th className="border-b border-r px-3 py-2 text-center font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Yıl</th>
                  <th className="border-b border-r px-3 py-2 text-center font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Ay</th>
                  <th className="border-b border-r px-3 py-2 text-center font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Gün</th>
                  <th className="border-b px-3 py-2 text-right font-semibold text-gray-700" style={{ borderColor: THEME.gridLine }}>Toplam Gün</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: THEME.gridLine }}>
                    <td className="border-r px-3 py-2 font-mono text-gray-800" style={{ borderColor: THEME.gridLine }}>{r.baslamaStr || "—"}</td>
                    <td className="border-r px-3 py-2 font-mono text-gray-800" style={{ borderColor: THEME.gridLine }}>{r.bitisStr || "—"}</td>
                    {r.error ? (
                      <td colSpan={4} className="px-3 py-2 text-amber-700 text-xs">{r.error}</td>
                    ) : r.diff ? (
                      <>
                        <td className="border-r px-3 py-2 text-center font-medium" style={{ borderColor: THEME.gridLine }}>{r.diff.yil}</td>
                        <td className="border-r px-3 py-2 text-center font-medium" style={{ borderColor: THEME.gridLine }}>{r.diff.ay}</td>
                        <td className="border-r px-3 py-2 text-center font-medium" style={{ borderColor: THEME.gridLine }}>{r.diff.gun}</td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums" style={{ borderColor: THEME.gridLine }}>{r.diff.toplamGun >= 0 ? r.diff.toplamGun.toLocaleString("tr-TR") : "—"}</td>
                      </>
                    ) : (
                      <td colSpan={4} className="px-3 py-2 text-gray-400">—</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-3 text-sm text-gray-700">
            <p><span className="font-semibold text-gray-900">Hangi tarih formatlarını kabul eder?</span><br />`DD.MM.YYYY`, `DD/MM/YYYY`, `YYYY-MM-DD` ve Excel&apos;den yapıştırılan tab ayrımlı tarihleri destekler.</p>
            <p><span className="font-semibold text-gray-900">Yaş hesabı için kullanılabilir mi?</span><br />Evet. Doğum tarihi ve bugünün tarihini girerek yaş farkını görebilirsiniz.</p>
            <p><span className="font-semibold text-gray-900">Toplu satır desteği var mı?</span><br />Evet. Birden fazla satırı aynı anda hesaplayıp tablo halinde sonuç alabilirsiniz.</p>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Devam etmek için{" "}
            <Link href="/egitimler/orta" className="underline" style={{ color: THEME.ribbon }}>
              orta seviye eğitim
            </Link>
            {" "}ve{" "}
            <Link href="/blog/excelde-tarih-farki-vade-gun-hesaplama" className="underline" style={{ color: THEME.ribbon }}>
              tarih farkı rehberi
            </Link>
            {" "}sayfasına bakın.
          </div>
        </section>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/tarih-farki" />
        </div>
        <div className="text-xs text-gray-500 mt-1">Ofis Akademi · Excel & Veri Analizi</div>
      </div>
    </div>
  );
}
