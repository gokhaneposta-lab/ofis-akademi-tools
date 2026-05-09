"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildKanalDagilimKiyas,
  kanalYuzdeleri,
  KANAL_DAGILIM_SATIRLARI,
  listSirketlerKanalDagilim,
  type KanalDagilimSatirKey,
} from "@/lib/tsbKanalDagilim";
import type { TsbPrimDaraltmaModu, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  daraltmaFromUiState,
  isTsbToplamSirketKodu,
  resolveDefaultSirketKodu,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariForSegment,
} from "@/lib/tsbPrimDashboard";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const KANAL_RENK: Record<KanalDagilimSatirKey, string> = {
  merkez: "bg-emerald-500",
  acente: "bg-sky-500",
  banka: "bg-violet-500",
  broker: "bg-amber-500",
  diger: "bg-rose-500",
};

/** Kanal başına yan yana iki sütun: sol şirket, sağ sektör; aynı kanal rengi (sektör daha soluk). */
function KanalYuzdeGroupedBars({
  ys,
  yk,
}: {
  ys: Record<KanalDagilimSatirKey, number>;
  yk: Record<KanalDagilimSatirKey, number>;
}) {
  const H = 168;
  return (
    <div className="mt-4 flex flex-wrap justify-between gap-4 sm:flex-nowrap sm:gap-2">
      {KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => (
        <div key={key} className="flex min-w-[4.75rem] flex-1 flex-col items-center">
          <div className="flex h-[188px] w-full items-end justify-center gap-1.5 border-b border-gray-200 px-0.5 pb-0.5">
            <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-semibold tabular-nums text-gray-900">{pf.format(ys[key])}%</span>
              <div
                className={`w-full max-w-[2rem] rounded-t ${KANAL_RENK[key]}`}
                style={{
                  height: `${ys[key] <= 0 ? 0 : Math.max(4, (ys[key] / 100) * H)}px`,
                }}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] tabular-nums text-gray-500">{pf.format(yk[key])}%</span>
              <div
                className={`w-full max-w-[2rem] rounded-t ${KANAL_RENK[key]} opacity-[0.52]`}
                style={{
                  height: `${yk[key] <= 0 ? 0 : Math.max(4, (yk[key] / 100) * H)}px`,
                }}
              />
            </div>
          </div>
          <p className="mt-2 max-w-[6.5rem] text-center text-[10px] font-medium leading-tight text-gray-800">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function TsbKanalDagilimDashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donem, setDonem] = useState("");
  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
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

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueAnaBransForSegment(rows, secilenDonem, segment);
  }, [rows, secilenDonem, segment]);

  const tarifeSecenekleri = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return uniqueTarifeGruplariForSegment(rows, secilenDonem, segment, branchLookup);
  }, [rows, secilenDonem, segment, branchLookup]);

  const daraltma = useMemo(
    () => daraltmaFromUiState(filtreModu, anaBrans, tarifeSecim, branchLookup),
    [filtreModu, anaBrans, tarifeSecim, branchLookup],
  );

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

  const sirketler = useMemo(() => {
    if (!rows || !secilenDonem) return [];
    return listSirketlerKanalDagilim(rows, secilenDonem, segment, daraltma);
  }, [rows, secilenDonem, segment, daraltma]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    if (sirketKodu === "" || !sirketler.some((s) => s.kod === sirketKodu)) {
      const kod = resolveDefaultSirketKodu(sirketler, segment);
      if (kod !== null) setSirketKodu(kod);
    }
  }, [sirketler, sirketKodu, segment]);

  const effectiveSirketKodu = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, segment);
  }, [sirketler, sirketKodu, segment]);

  const kiyas = useMemo(() => {
    if (!rows || !secilenDonem || effectiveSirketKodu === null) return null;
    return buildKanalDagilimKiyas(rows, secilenDonem, segment, daraltma, effectiveSirketKodu);
  }, [rows, secilenDonem, segment, daraltma, effectiveSirketKodu]);

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
        Bu dönem ve filtreye göre şirket bulunamadı.
      </div>
    );
  }

  if (!kiyas) {
    return null;
  }

  const ys = kanalYuzdeleri(kiyas.sirket);
  const yk = kanalYuzdeleri(kiyas.sektor);
  const secilenAd = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";

  const tumBransLabel =
    segment === "hayatdisi"
      ? "Tüm ana branşlar (hayat dışı)"
      : "Tüm ana branşlar (hayat–emeklilik)";

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Görünüm</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={segment === "hayatdisi"}
            onClick={() => setSegment("hayatdisi")}
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
            onClick={() => setSegment("hayat")}
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm lg:col-span-2">
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
        <label className="block text-sm lg:col-span-2">
          <span className="mb-1.5 block font-medium text-gray-700">
            {filtreModu === "anaBransH" ? "Ana branş" : "Tarife grubu"}
          </span>
          {filtreModu === "anaBransH" ? (
            <select
              value={anaBrans}
              onChange={(e) => setAnaBrans(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="">{tumBransLabel}</option>
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
        <label className="block text-sm lg:col-span-4">
          <span className="mb-1.5 block font-medium text-gray-700">Şirket</span>
          <select
            value={effectiveSirketKodu !== null ? String(effectiveSirketKodu) : ""}
            onChange={(e) => setSirketKodu(Number(e.target.value))}
            className="w-full max-w-2xl rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {sirketler.map((s) => (
              <option key={s.kod} value={s.kod}>
                {s.ad} ({s.kod})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-800">Kanal payları — yüzde (yan yana)</p>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-600">
          Her kanal için <strong>sol sütun</strong> seçilen şirket (<span className="text-gray-800">{secilenAd}</span>),
          <strong className="ml-1">sağ sütun</strong> aynı filtredeki sektör toplamıdır. Aynı kanal her iki tarafta da{" "}
          <strong>aynı renk</strong>; sektör sütunu daha soluktur.
        </p>
        <KanalYuzdeGroupedBars ys={ys} yk={yk} />
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-gray-100 pt-3 text-[11px] text-gray-600">
          <span>
            Şirket toplam prim: <strong className="tabular-nums text-gray-900">{nf.format(kiyas.sirket.genelToplam)}</strong>{" "}
            ₺
          </span>
          <span>
            Sektör toplam prim: <strong className="tabular-nums text-gray-900">{nf.format(kiyas.sektor.genelToplam)}</strong>{" "}
            ₺
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-[720px] w-full border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-gray-300 bg-slate-800 text-white">
              <th className="px-3 py-2 font-semibold">Kanal</th>
              <th className="px-3 py-2 text-right font-semibold">Şirket ₺</th>
              <th className="px-3 py-2 text-right font-semibold">Şirket %</th>
              <th className="px-3 py-2 text-right font-semibold">Sektör ₺</th>
              <th className="px-3 py-2 text-right font-semibold">Sektör %</th>
              <th className="px-3 py-2 text-right font-semibold">Fark (pp)</th>
            </tr>
          </thead>
          <tbody>
            {KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => {
              const ps = ys[key];
              const pk = yk[key];
              const pp = ps - pk;
              return (
                <tr key={key} className="border-b border-gray-100 bg-white">
                  <td className="px-3 py-2 font-medium text-gray-900">{label}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-800">{nf.format(kiyas.sirket[key])}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700">{pf.format(ps)}%</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-700">{nf.format(kiyas.sektor[key])}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-600">{pf.format(pk)}%</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-900">{pf.format(pp)}</td>
                </tr>
              );
            })}
            <tr className="border-t-2 border-gray-300 bg-slate-50 font-semibold">
              <td className="px-3 py-2">Genel toplam</td>
              <td className="px-3 py-2 text-right tabular-nums">{nf.format(kiyas.sirket.genelToplam)}</td>
              <td className="px-3 py-2 text-right tabular-nums">100,00%</td>
              <td className="px-3 py-2 text-right tabular-nums">{nf.format(kiyas.sektor.genelToplam)}</td>
              <td className="px-3 py-2 text-right tabular-nums">100,00%</td>
              <td className="px-3 py-2 text-right tabular-nums">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-[11px] leading-relaxed text-gray-500">
        Paylar, seçilen kapsamda <strong>kanal primlerinin toplamına</strong> oranlanır (merkez + acente + banka + broker +
        diğer). Sektör satırı TSB toplam şirket kodları hariç tüm şirketlerin aynı filtredeki toplamıdır.
      </p>
    </div>
  );
}
