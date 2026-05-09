"use client";

import { useEffect, useMemo, useState } from "react";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import type { BransDegisimSatir } from "@/lib/tsbBransDegisim";
import { buildBransDegisimTablosu, listSirketlerBransDashboard } from "@/lib/tsbBransDegisim";
import type { TsbKanalField, TsbPrimDaraltmaModu, TsbPrimRow } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  prevYearPeriod,
  resolveDefaultSirketKodu,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariDonem,
} from "@/lib/tsbPrimDashboard";

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
  const [anaBrans, setAnaBrans] = useState("");
  const [filtreModu, setFiltreModu] = useState<TsbPrimDaraltmaModu>("anaBransH");
  const [tarifeSecim, setTarifeSecim] = useState("");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");

  const branchLookup = useTsbBranchLookupFetch();

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

  const daraltma = useMemo(
    () => daraltmaFromUiState(filtreModu, anaBrans, tarifeSecim, branchLookup),
    [filtreModu, anaBrans, tarifeSecim, branchLookup],
  );

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [filtreModu]);

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    const hd = uniqueAnaBransForSegment(rows, secilenDonem, "hayatdisi");
    const hy = uniqueAnaBransForSegment(rows, secilenDonem, "hayat");
    return [...new Set([...hd, ...hy])].sort((a, b) => a.localeCompare(b, "tr"));
  }, [rows, secilenDonem]);

  const tarifeSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueTarifeGruplariDonem(rows, secilenDonem, branchLookup);
  }, [rows, secilenDonem, branchLookup]);

  useEffect(() => {
    if (filtreModu !== "tarifeGrubu" || tarifeSecim === "") return;
    if (tarifeSecim === TARIFE_GRUBU_FILTER_TRAFIK_HARIC) return;
    if (!tarifeSecenekleri.includes(tarifeSecim)) setTarifeSecim("");
  }, [filtreModu, tarifeSecim, tarifeSecenekleri]);

  const sirketler = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return listSirketlerBransDashboard(rows, secilenDonem, kanal, daraltma);
  }, [rows, secilenDonem, kanal, daraltma]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    if (sirketKodu === "" || !sirketler.some((s) => s.kod === sirketKodu)) {
      const kod = resolveDefaultSirketKodu(sirketler, "hayatdisi");
      if (kod !== null) setSirketKodu(kod);
    }
  }, [sirketler, sirketKodu]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, "hayatdisi");
  }, [sirketler, sirketKodu]);

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return null;
    return buildBransDegisimTablosu(rows, secilenDonem, kanal, effectiveSirketKodu, daraltma);
  }, [rows, secilenDonem, kanal, effectiveSirketKodu, daraltma]);

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
  const kolonBaslik =
    tablo.kirisumModu === "anaBransH" ? "Branş" : "Tarife grubu";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Daraltma türü</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={filtreModu === "anaBransH"}
            onClick={() => setFiltreModu("anaBransH")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filtreModu === "anaBransH"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Ana branş (TSB)
          </button>
          <button
            type="button"
            aria-pressed={filtreModu === "tarifeGrubu"}
            onClick={() => setFiltreModu("tarifeGrubu")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filtreModu === "tarifeGrubu"
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tarife grubu
          </button>
        </div>
        <p className="mt-2 text-[11px] text-gray-600">
          Tablo satırları seçtiğiniz kırılıma göre değişir; hayat dışı bölümünde{" "}
          <strong>TRAFİK HARİÇ TOPLAM</strong> satırı hem ana branş hem tarife görünümünde listelenir.
        </p>
      </div>

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
            onChange={(e) => {
              setDonem(e.target.value);
              setAnaBrans("");
              setTarifeSecim("");
            }}
            className="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {donemler.map((d) => (
              <option key={d} value={d}>
                {d} · önceki yıl {prevYearPeriod(d) ?? "—"}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-gray-500">
            Tablo her zaman <strong>{tablo.donemOnceki}</strong> ile <strong>{tablo.donemBu}</strong> arasında yıllık
            değişimi gösterir.
          </p>
        </label>
        <label className="block text-sm sm:col-span-3">
          <span className="mb-1.5 block font-medium text-gray-700">
            {filtreModu === "anaBransH" ? "Ana branş filtresi (tablo satırları)" : "Tarife grubu filtresi"}
          </span>
          {filtreModu === "anaBransH" ? (
            <select
              value={anaBrans}
              onChange={(e) => setAnaBrans(e.target.value)}
              className="w-full max-w-xl rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">Tüm ana branşlar</option>
              <option value={ANA_BRANS_FILTER_TRAFIK_HARIC}>{ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL}</option>
              {anaBransSecenekleri.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={tarifeSecim}
              onChange={(e) => setTarifeSecim(e.target.value)}
              className="w-full max-w-xl rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">Tüm tarife grupları</option>
              <option value={TARIFE_GRUBU_FILTER_TRAFIK_HARIC}>{TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL}</option>
              {tarifeSecenekleri.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>

      <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-600">
        <strong>Şirket değişim (%)</strong> hücreleri, aynı satırda <strong>sektörün yıllık değişim oranı</strong> ile
        karşılaştırılarak renklendirilir: şirket oranı sektörün üstündeyse yeşil, altındaysa kırmızı.
        <strong className="ml-1">Pazar payı</strong> sütunları, şirket priminin o satırdaki sektör primine oranını (%)
        gösterir; son sütun iki dönem arasındaki yüzde puan (pp) farkıdır.
      </p>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-[920px] w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-gray-300 bg-slate-800 text-white">
              <th rowSpan={2} className="sticky left-0 z-20 border-r border-slate-600 px-2 py-2 font-semibold bg-slate-800">
                {kolonBaslik}
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
                Hayat dışı {tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "branşları"}
              </td>
            </tr>
            {tablo.hayatdisiBranslar.map((s) => (
              <SatirHucresi key={`hd-${s.anaBransH}`} satir={s} />
            ))}
            {tablo.hayatdisiTrafikHaricToplam && (
              <SatirHucresi satir={tablo.hayatdisiTrafikHaricToplam} araToplam />
            )}
            <SatirHucresi satir={tablo.hayatdisiToplam} araToplam />
            <tr className="bg-sky-50">
              <td colSpan={10} className="px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-sky-900">
                Hayat &amp; emeklilik {tablo.kirisumModu === "tarifeGrubu" ? "(tarife)" : "(TSB ana branş)"}
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
