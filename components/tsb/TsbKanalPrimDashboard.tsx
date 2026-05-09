"use client";

import { useEffect, useMemo, useState } from "react";
import type { TsbKanalField, TsbPrimDaraltmaModu, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  buildKiyaslamaTablosu,
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  sektorToplamDegisimYuzde,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariForSegment,
} from "@/lib/tsbPrimDashboard";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";

const KANALLAR: { value: TsbKanalField; label: string }[] = [
  { value: "genelToplam", label: "Genel toplam (tüm kanallar)" },
  { value: "acente", label: "Acente" },
  { value: "banka", label: "Banka" },
  { value: "broker", label: "Broker" },
  { value: "diger", label: "Diğer" },
  { value: "merkez", label: "Merkez" },
];

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

/** Düşük sıra numarası = daha iyi. Bu yıl sırası önceki yıla göre kötüleştiyse kırmızı, iyileştiyse yeşil, aynıysa sarı. */
function buYilSiraRenk(siraOnceki: number, siraBu: number): string {
  if (siraOnceki <= 0 || siraBu <= 0) return "text-gray-900 font-medium tabular-nums";
  if (siraBu > siraOnceki) return "text-red-600 font-semibold tabular-nums";
  if (siraBu < siraOnceki) return "text-emerald-600 font-semibold tabular-nums";
  return "text-amber-500 font-semibold tabular-nums";
}

export default function TsbKanalPrimDashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
  const [donem, setDonem] = useState<string>("");
  const [anaBrans, setAnaBrans] = useState<string>("");
  const [filtreModu, setFiltreModu] = useState<TsbPrimDaraltmaModu>("anaBransH");
  const [tarifeSecim, setTarifeSecim] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");

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
        const cleaned = data.filter((row) => !isTsbToplamSirketKodu(row.sirketKodu));
        setRows(cleaned);
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

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueAnaBransForSegment(rows, secilenDonem, segment);
  }, [rows, secilenDonem, segment]);

  const tarifeSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueTarifeGruplariForSegment(rows, secilenDonem, segment, branchLookup);
  }, [rows, secilenDonem, segment, branchLookup]);

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [segment]);

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [filtreModu]);

  useEffect(() => {
    if (filtreModu !== "tarifeGrubu" || tarifeSecim === "") return;
    if (tarifeSecim === TARIFE_GRUBU_FILTER_TRAFIK_HARIC) return;
    if (!tarifeSecenekleri.includes(tarifeSecim)) setTarifeSecim("");
  }, [filtreModu, tarifeSecim, tarifeSecenekleri]);

  const daraltma = useMemo(
    () => daraltmaFromUiState(filtreModu, anaBrans, tarifeSecim, branchLookup),
    [filtreModu, anaBrans, tarifeSecim, branchLookup],
  );

  const tablo = useMemo(() => {
    if (!rows || !secilenDonem) return null;
    return buildKiyaslamaTablosu(rows, secilenDonem, kanal, daraltma, segment);
  }, [rows, secilenDonem, kanal, daraltma, segment]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!rows) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
        Veri yükleniyor…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
        Gösterilecek prim verisi bulunamadı.
      </div>
    );
  }

  const tumAnaBransLabel =
    segment === "hayatdisi"
      ? "Tümü (hayat dışı · HD, kod 3… hariç)"
      : "Tümü (hayat-emeklilik · kod 3… veya tip H / E)";

  const toplamDegisim =
    tablo !== null
      ? sektorToplamDegisimYuzde(tablo.sektorToplamOnceki, tablo.sektorToplamBu)
      : null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Sektör görünümü</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={segment === "hayatdisi"}
            onClick={() => {
              setSegment("hayatdisi");
              setAnaBrans("");
              setTarifeSecim("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              segment === "hayatdisi"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hayat dışı
          </button>
          <button
            type="button"
            aria-pressed={segment === "hayat"}
            onClick={() => {
              setSegment("hayat");
              setAnaBrans("");
              setTarifeSecim("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              segment === "hayat"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Hayat &amp; emeklilik
          </button>
        </div>
        <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-gray-500">Daraltma türü</p>
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
        <p className="mt-3 text-[12px] leading-relaxed text-gray-600">
          Hayat ve hayat dışı şirketler ayrı gruplanmıştır; <strong>ana branş</strong> veya <strong>tarife grubu</strong> ile
          daraltıp dönem ve kanalla tabloyu güncelleyebilirsiniz.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-gray-700">Dönem</span>
          <select
            value={secilenDonem}
            onChange={(e) => {
              setDonem(e.target.value);
              setAnaBrans("");
              setTarifeSecim("");
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {donemler.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block font-medium text-gray-700">
            {filtreModu === "anaBransH" ? "Ana branş" : "Tarife grubu"}
          </span>
          {filtreModu === "anaBransH" ? (
            <select
              value={anaBrans}
              onChange={(e) => setAnaBrans(e.target.value)}
              className="w-full max-w-xl rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">{tumAnaBransLabel}</option>
              {segment === "hayatdisi" && (
                <option value={ANA_BRANS_FILTER_TRAFIK_HARIC}>{ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL}</option>
              )}
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
              {segment === "hayatdisi" && (
                <option value={TARIFE_GRUBU_FILTER_TRAFIK_HARIC}>{TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL}</option>
              )}
              {tarifeSecenekleri.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </label>
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
      </div>

      {tablo && (
        <>
          <p className="text-xs text-gray-500">
            Önceki yıl: <strong>{tablo.donemOnceki ?? "—"}</strong>. Alt satırda seçili filtrelere göre toplam prim;
            pay sütunları en fazla %100.
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-[800px] w-full table-fixed border-collapse text-left text-[13px]">
              <colgroup>
                <col className="w-[4.75rem]" />
                <col className="w-[4.75rem]" />
                <col className="w-[4.25rem]" />
                <col className="w-[135px]" />
                <col />
                <col className="w-[4.5rem]" />
                <col />
                <col className="w-[4.5rem]" />
                <col className="min-w-[5.25rem]" />
              </colgroup>
              <thead>
                <tr className="min-h-11 border-b border-gray-200 bg-gray-50 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                  <th className="px-2 py-2 align-middle text-center leading-snug whitespace-normal">
                    Önceki yıl
                    <br />
                    sıra
                  </th>
                  <th className="px-2 py-2 align-middle text-center leading-snug whitespace-normal">
                    Bu yıl
                    <br />
                    sıra
                  </th>
                  <th className="px-2 py-2 align-middle text-center whitespace-normal">Şirket kodu</th>
                  <th className="px-2 py-2 align-middle leading-snug">Şirket adı</th>
                  <th className="px-2 py-2 text-right align-middle whitespace-nowrap leading-snug">
                    {tablo.donemOnceki ?? "Önceki"} prim
                  </th>
                  <th className="px-1.5 py-2 text-right align-middle whitespace-normal leading-snug">
                    Önceki
                    <br />
                    pay %
                  </th>
                  <th className="px-2 py-2 text-right align-middle whitespace-nowrap leading-snug">
                    {secilenDonem} prim
                  </th>
                  <th className="px-1.5 py-2 text-right align-middle whitespace-normal leading-snug">
                    Bu yıl
                    <br />
                    pay %
                  </th>
                  <th className="px-2 py-2 text-right align-middle whitespace-nowrap leading-snug">Değişim %</th>
                </tr>
              </thead>
              <tbody>
                {tablo.satirlar.map((s) => (
                  <tr key={s.sirketKodu} className="h-11 border-b border-gray-100 hover:bg-gray-50/80">
                    <td className="px-2 align-middle text-center tabular-nums text-gray-600">{s.siraOnceki}</td>
                    <td className={`px-2 align-middle text-center tabular-nums ${buYilSiraRenk(s.siraOnceki, s.siraBu)}`}>
                      {s.siraBu}
                    </td>
                    <td className="px-2 align-middle tabular-nums whitespace-nowrap text-center">{s.sirketKodu}</td>
                    <td className="max-w-[135px] px-2 align-middle">
                      <div className="truncate text-gray-900" title={s.sirketAdi}>
                        {s.sirketAdi}
                      </div>
                    </td>
                    <td className="px-2 align-middle text-right tabular-nums whitespace-nowrap">
                      {nf.format(s.primOnceki)}
                    </td>
                    <td className="px-1.5 align-middle text-right tabular-nums text-gray-600 whitespace-nowrap">
                      {pf.format(s.payOncekiYuzde)}
                    </td>
                    <td className="px-2 align-middle text-right tabular-nums font-medium whitespace-nowrap">
                      {nf.format(s.primBu)}
                    </td>
                    <td className="px-1.5 align-middle text-right tabular-nums whitespace-nowrap">
                      {pf.format(s.payBuYuzde)}
                    </td>
                    <td
                      className={`px-2 align-middle text-right tabular-nums font-medium whitespace-nowrap ${
                        s.degisimYuzde === null
                          ? "text-gray-500"
                          : s.degisimYuzde < 0
                            ? "text-red-600"
                            : "text-emerald-700"
                      }`}
                    >
                      {s.degisimYuzde === null ? "—" : `${pf.format(s.degisimYuzde)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="h-11 border-t-2 border-emerald-600 bg-emerald-50/95 font-semibold text-gray-900">
                  <td className="px-2 align-middle text-center text-gray-500">—</td>
                  <td className="px-2 align-middle text-center text-gray-500">—</td>
                  <td className="px-2 align-middle text-center text-gray-500">—</td>
                  <td className="px-2 align-middle">TOPLAM</td>
                  <td className="px-2 align-middle text-right tabular-nums whitespace-nowrap">
                    {nf.format(tablo.sektorToplamOnceki)}
                  </td>
                  <td className="px-1.5 align-middle text-right tabular-nums text-emerald-900 whitespace-nowrap">
                    {pf.format(100)}
                  </td>
                  <td className="px-2 align-middle text-right tabular-nums whitespace-nowrap">
                    {nf.format(tablo.sektorToplamBu)}
                  </td>
                  <td className="px-1.5 align-middle text-right tabular-nums text-emerald-900 whitespace-nowrap">
                    {pf.format(100)}
                  </td>
                  <td
                    className={`px-2 align-middle text-right tabular-nums whitespace-nowrap ${
                      toplamDegisim === null
                        ? "text-gray-600"
                        : toplamDegisim < 0
                          ? "text-red-700"
                          : "text-emerald-800"
                    }`}
                  >
                    {toplamDegisim === null ? "—" : pf.format(toplamDegisim)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
