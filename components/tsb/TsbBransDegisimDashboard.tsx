"use client";

import { useEffect, useMemo, useState } from "react";
import type { BransDegisimSatir } from "@/lib/tsbBransDegisim";
import { buildBransDegisimTablosu, listSirketlerBransDashboard } from "@/lib/tsbBransDegisim";
import type { TsbKanalField, TsbPrimRow } from "@/lib/tsbPrimDashboard";
import { isTsbToplamSirketKodu, prevYearPeriod, uniqueSortedPeriods } from "@/lib/tsbPrimDashboard";

const KANALLAR: { value: TsbKanalField; label: string }[] = [
  { value: "genelToplam", label: "Tüm kanallar" },
  { value: "acente", label: "Acente" },
  { value: "banka", label: "Banka" },
  { value: "broker", label: "Broker" },
  { value: "diger", label: "Diğer" },
  { value: "merkez", label: "Merkez" },
];

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function sirketDegisimRenk(satir: BransDegisimSatir): string {
  const a = satir.sirketDegisim;
  const b = satir.sektorDegisim;
  if (a === null || b === null) return "text-gray-900";
  if (a >= b) return "text-emerald-700 font-semibold";
  return "text-red-600 font-semibold";
}

function SatirHucresi({
  satir,
  araToplam,
}: {
  satir: BransDegisimSatir;
  araToplam?: boolean;
}) {
  const rowCls = araToplam ? "bg-slate-100 font-semibold" : "bg-white";
  return (
    <tr className={`border-b border-gray-200 ${rowCls}`}>
      <td className={`sticky left-0 z-10 whitespace-nowrap border-r border-gray-200 px-2 py-2 text-xs ${araToplam ? "bg-slate-100" : "bg-white"}`}>
        {satir.anaBransH}
      </td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-800">{nf.format(satir.sirketPrimOnceki)}</td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-800">{nf.format(satir.sirketPrimBu)}</td>
      <td className={`px-2 py-2 text-right text-[11px] tabular-nums ${sirketDegisimRenk(satir)}`}>
        {satir.sirketDegisim === null ? "—" : `${pf.format(satir.sirketDegisim)}%`}
      </td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-700">{nf.format(satir.sektorPrimOnceki)}</td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-700">{nf.format(satir.sektorPrimBu)}</td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-700">
        {satir.sektorDegisim === null ? "—" : `${pf.format(satir.sektorDegisim)}%`}
      </td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-700">{pf.format(satir.payOncekiYuzde)}%</td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-700">{pf.format(satir.payBuYuzde)}%</td>
      <td className="px-2 py-2 text-right text-[11px] tabular-nums text-gray-700">{pf.format(satir.payDegisimPp)} pp</td>
    </tr>
  );
}

export default function TsbBransDegisimDashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donem, setDonem] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tsb/prim-tidy.json")
      .then((r) => {
        if (!r.ok) throw new Error(`Veri yüklenemedi (${r.status})`);
        return r.json();
      })
      .then((data: TsbPrimRow[]) => {
        if (cancelled) return;
        if (!Array.isArray(data)) throw new Error("Geçersiz veri formatı");
        setRows(data.filter((row) => !isTsbToplamSirketKodu(row.sirketKodu)));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Yükleme hatası");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const donemler = useMemo(() => (rows ? uniqueSortedPeriods(rows) : []), [rows]);
  const sonDonem = donemler.length ? donemler[donemler.length - 1] : "";
  const secilenDonem = donem || sonDonem;

  const sirketler = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return listSirketlerBransDashboard(rows, secilenDonem, kanal);
  }, [rows, secilenDonem, kanal]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    if (sirketKodu === "" || !sirketler.some((s) => s.kod === sirketKodu)) {
      setSirketKodu(sirketler[0].kod);
    }
  }, [sirketler, sirketKodu]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return sirketler[0].kod;
  }, [sirketler, sirketKodu]);

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return null;
    return buildBransDegisimTablosu(rows, secilenDonem, kanal, effectiveSirketKodu);
  }, [rows, secilenDonem, kanal, effectiveSirketKodu]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
    );
  }

  if (!rows) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
        Veri yükleniyor…
      </div>
    );
  }

  if (sirketler.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        Bu kanal ve dönem için hayat dışı şirket verisi bulunamadı; şirket seçilemiyor.
      </div>
    );
  }

  if (!tablo) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        Seçilen dönem için bir önceki yılın aynı ayı bulunamadığından tablo oluşturulamıyor.
      </div>
    );
  }

  const secilenAd = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-gray-700">Kanal</span>
          <select
            value={kanal}
            onChange={(e) => setKanal(e.target.value as TsbKanalField)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {KANALLAR.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-gray-700">Şirket</span>
          <select
            value={effectiveSirketKodu !== null ? String(effectiveSirketKodu) : ""}
            onChange={(e) => setSirketKodu(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {sirketler.map((s) => (
              <option key={s.kod} value={s.kod}>
                {s.ad} ({s.kod})
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-3">
          <span className="mb-1.5 block font-medium text-gray-700">Dönem (karşılaştırma ayı)</span>
          <select
            value={secilenDonem}
            onChange={(e) => setDonem(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {donemler.map((d) => (
              <option key={d} value={d}>
                {d} · önceki yıl {prevYearPeriod(d) ?? "—"}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-500">
            Tablo her zaman <strong>{tablo.donemOnceki}</strong> ile <strong>{tablo.donemBu}</strong> arasında
            yıllık değişimi gösterir.
          </p>
        </label>
      </div>

      <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-600">
        <strong>Şirket değişim (%)</strong> hücreleri: sektörün aynı branştaki değişim oranına göre renklendirilir —
        şirket oranı sektörün üstündeyse yeşil, altındaysa kırmızı (Excel&apos;deki mantığa paralel).
        <strong className="ml-1">Pazar payı</strong> sütunları şirket priminin sektör primine oranını (%) gösterir;
        son sütun pay değişimi yüzde puan (pp) farkıdır.
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-[920px] w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-gray-300 bg-slate-800 text-white">
              <th rowSpan={2} className="sticky left-0 z-20 border-r border-slate-600 px-2 py-2 font-semibold bg-slate-800">
                Branş
              </th>
              <th colSpan={3} className="border-r border-slate-600 px-2 py-2 text-center font-semibold">
                {secilenAd.slice(0, 42)}
                {secilenAd.length > 42 ? "…" : ""}
              </th>
              <th colSpan={3} className="border-r border-slate-600 px-2 py-2 text-center font-semibold">
                Sektör prim
              </th>
              <th colSpan={3} className="px-2 py-2 text-center font-semibold">
                Pazar payı
              </th>
            </tr>
            <tr className="border-b border-gray-300 bg-slate-700 text-white">
              <th className="px-2 py-1.5 text-right font-medium">{tablo.donemOnceki}</th>
              <th className="px-2 py-1.5 text-right font-medium">{tablo.donemBu}</th>
              <th className="border-r border-slate-600 px-2 py-1.5 text-right font-medium">Değişim %</th>
              <th className="px-2 py-1.5 text-right font-medium">{tablo.donemOnceki}</th>
              <th className="px-2 py-1.5 text-right font-medium">{tablo.donemBu}</th>
              <th className="border-r border-slate-600 px-2 py-1.5 text-right font-medium">Değişim %</th>
              <th className="px-2 py-1.5 text-right font-medium">{tablo.donemOnceki}</th>
              <th className="px-2 py-1.5 text-right font-medium">{tablo.donemBu}</th>
              <th className="px-2 py-1.5 text-right font-medium">Δ pp</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-emerald-50">
              <td
                colSpan={10}
                className="sticky left-0 bg-emerald-50 px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-emerald-900"
              >
                Hayat dışı branşları
              </td>
            </tr>
            {tablo.hayatdisiBranslar.map((s) => (
              <SatirHucresi key={`hd-${s.anaBransH}`} satir={s} />
            ))}
            <SatirHucresi satir={tablo.hayatdisiToplam} araToplam />
            <tr className="bg-sky-50">
              <td colSpan={10} className="px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-sky-900">
                Hayat &amp; emeklilik branşları (TSB ana branş satırları)
              </td>
            </tr>
            {tablo.hayatBranslar.map((s) => (
              <SatirHucresi key={`hy-${s.anaBransH}`} satir={s} />
            ))}
            <SatirHucresi satir={tablo.hayatToplam} araToplam />
            <SatirHucresi satir={tablo.genelToplam} araToplam />
          </tbody>
        </table>
      </div>
    </div>
  );
}
