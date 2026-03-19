"use client";

import React, { useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import ExcelFormulBlok from "@/components/ExcelFormulBlok";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { parseNumbers, mean, std, variance } from "@/lib/istatistik";

function mode(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const counts = new Map<number, number>();
  for (const v of arr) counts.set(v, (counts.get(v) ?? 0) + 1);
  const maxCount = Math.max(...counts.values());
  return [...counts.entries()].filter(([, c]) => c === maxCount).map(([v]) => v);
}

function median(arr: number[]): number {
  if (arr.length === 0) return NaN;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export default function BetimselIstatistikPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<Record<string, number | string> | null>(null);
  const [copied, setCopied] = useState(false);

  function handleHesapla() {
    const arr = parseNumbers(input);
    if (arr.length === 0) {
      setResult(null);
      return;
    }
    const ort = mean(arr);
    const modlar = mode(arr);
    setResult({
      "Veri sayısı (n)": arr.length,
      "Ortalama (aritmetik)": ort,
      Medyan: median(arr),
      Mod: modlar.length ? (modlar.length <= 3 ? modlar.join(", ") : `${modlar.slice(0, 2).join(", ")} ...`) : "—",
      "Standart sapma (s)": std(arr, false),
      "Varyans (s²)": variance(arr, false),
      Minimum: Math.min(...arr),
      Maksimum: Math.max(...arr),
      Açıklık: Math.max(...arr) - Math.min(...arr),
    });
    setCopied(false);
  }

  function copyText(): string {
    if (!result) return "";
    return Object.entries(result)
      .map(([k, v]) => `${k}\t${typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(4)) : v}`)
      .join("\n");
  }

  async function handleCopy() {
    const t = copyText();
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Ortalama, Medyan, Standart Sapma Hesaplama"
        description="Betimsel istatistik: ortalama, medyan, mod, standart sapma, varyans, min, max. Sayı listesinden tek seferde. Excel'den yapıştırın."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-2xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Sayıları virgül, boşluk veya satır sonu ile ayrılmış şekilde aşağıdaki kutuya yapıştırın (Excel'den sütun kopyalayabilirsiniz).",
            "Hesapla butonuna tıklayın.",
            "Ortalama, medyan, mod, standart sapma, varyans, min, max ve açıklık görünür; Sonucu Kopyala ile alabilirsiniz.",
          ]}
          excelAlternatif={
            <>
              <p className="text-sm text-gray-700 mb-2">
                Excel&apos;de betimsel istatistik (ortalama, medyan, standart sapma, varyans, min, max) tek fonksiyonlarla hesaplanır. A:A veya A1:A100 gibi sayı aralığını kullanın.
              </p>
              <ExcelFormulBlok
                baslik="Sık kullanılan fonksiyonlar:"
                formül="=ORTALAMA(A:A)"
                aciklama="ORTALAMA (AVERAGE) aritmetik ortalama, MEDYAN (MEDIAN) ortanca değer, STDSAPMA.S (STDEV.S) örnek standart sapması, VAR.S (VAR.S) örnek varyansı, MİN (MIN) minimum, MAKS (MAX) maksimum. Mod için =MOD.SNÇ(A:A) veya =MODE.SNGL. Tümünü tek seferde almak için Veri Analizi eklentisindeki Betimsel İstatistik kullanabilirsiniz."
              />
            </>
          }
        />

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-gray-700">
            Sayı listesinin özetini tek seferde çıkarır: <span className="font-semibold">ortalama</span>, <span className="font-semibold">medyan</span>, <span className="font-semibold">mod</span>, <span className="font-semibold">standart sapma</span>, <span className="font-semibold">varyans</span>, <span className="font-semibold">min</span>, <span className="font-semibold">max</span> ve açıklık.
          </p>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Örnek girdi / çıktı</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Girdi:</span> <span className="font-mono">10, 20, 30</span> (veya satır/boşlukla aynı format).
            </p>
            <p>
              <span className="font-semibold">Çıktı:</span> merkez ve yayılım özetleri + min/max değerleri tablosu.
            </p>
            <p className="text-xs text-gray-500">Sonucu kopyalayınca Excel veya rapora yapıştırabilirsin.</p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5" style={{ borderColor: THEME.gridLine }}>
          <h2 className="text-sm font-semibold text-gray-900">Sık sorulan sorular</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Mod neyi gösterir?</span>
              <br />
              En sık tekrar eden değer(ler)i.
            </p>
            <p>
              <span className="font-semibold">Standart sapma neyi anlatır?</span>
              <br />
              Verinin ortalamadan ne kadar yayıldığını gösterir.
            </p>
            <p>
              <span className="font-semibold">Sonucu Excel’e nasıl taşırım?</span>
              <br />
              “Sonucu Kopyala” ile panoya alıp Ctrl+V yap.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-600">
            Daha fazla detay için{" "}
            <Link
              href="/blog/excel-ortalama-medyan-standart-sapma"
              className="underline"
              style={{ color: THEME.ribbon }}
            >
              betimsel istatistik rehberine
            </Link>{" "}
            bakabilirsin.
          </p>
        </section>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sayılar (virgül, boşluk veya satır sonu ile ayrılmış)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="10, 20, 30&#10;40 50 60"
            rows={6}
            className="w-full rounded-lg border p-3 text-sm bg-white font-mono resize-y"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={handleHesapla}
            className="inline-flex min-w-[140px] justify-center rounded px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: THEME.ribbon }}
          >
            Hesapla
          </button>
          <CopyButton onClick={handleCopy} disabled={!result} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
        </div>
        {result && (
          <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: THEME.gridLine }}>
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(result).map(([key, val]) => (
                  <tr key={key} className="border-b last:border-b-0" style={{ borderColor: THEME.gridLine }}>
                    <td className="px-3 py-2 font-medium text-gray-700">{key}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {typeof val === "number" ? (Number.isInteger(val) ? val.toLocaleString("tr-TR") : val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })) : val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/betimsel-istatistik" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · İstatistik araçları</div>
      </div>
    </div>
  );
}
