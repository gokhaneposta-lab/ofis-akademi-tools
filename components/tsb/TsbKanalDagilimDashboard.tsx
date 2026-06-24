"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildKanalDagilimKiyas,
  kanalBazindaSirketSektorPayYuzde,
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
  sirketSegmentFromKodu,
  resolveDefaultSirketKodu,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariForSegment,
} from "@/lib/tsbPrimDashboard";
import { TsbSirketSektorGrafikLegend } from "@/components/tsb/TsbRenkAciklama";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
import {
  TSB_TUM_BRANS_LABEL,
} from "@/lib/tsbKirilimSozluk";
import {
  cn,
  tsb,
  TsbError,
  TsbFilterBar,
  TsbFilterField,
  TsbFilterGrid,
  TsbLoading,
  TsbSelect,
  TsbTableShell,
  TsbToggleButton,
  tsbDeltaRenk,
  tsbFormatPp,
} from "@/components/tsb/tsbDashboardUi";

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const KANAL_RENK_SIRKET: Record<KanalDagilimSatirKey, string> = {
  merkez: "bg-emerald-600",
  acente: "bg-sky-600",
  banka: "bg-violet-600",
  broker: "bg-amber-600",
  diger: "bg-rose-600",
};

const KANAL_RENK_SEKTOR: Record<KanalDagilimSatirKey, string> = {
  merkez: "bg-emerald-300",
  acente: "bg-sky-300",
  banka: "bg-violet-300",
  broker: "bg-amber-300",
  diger: "bg-rose-300",
};

const KANAL_GRADIENT: Record<KanalDagilimSatirKey, string> = {
  merkez: "from-emerald-50/90 via-emerald-50/40 to-white",
  acente: "from-sky-50/90 via-sky-50/40 to-white",
  banka: "from-violet-50/90 via-violet-50/40 to-white",
  broker: "from-amber-50/90 via-amber-50/40 to-white",
  diger: "from-rose-50/90 via-rose-50/40 to-white",
};

/** Kanal başına gradyan zemin; sol koyu = şirket, sağ açık = sektör (aynı renk ailesi). */
function KanalYuzdeGroupedBars({
  ys,
  yk,
  kanalSektorPayi,
}: {
  ys: Record<KanalDagilimSatirKey, number>;
  yk: Record<KanalDagilimSatirKey, number>;
  kanalSektorPayi: Record<KanalDagilimSatirKey, number | null>;
}) {
  const H = 168;
  return (
    <div className="mt-3">
      <div className="mb-2 flex justify-center gap-8 text-[10px] font-medium text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0 w-0 border-y-[5px] border-r-[6px] border-y-transparent border-r-slate-700" aria-hidden />
          Sol · şirket (koyu)
        </span>
        <span className="inline-flex items-center gap-1.5">
          Sağ · sektör (açık)
          <span className="inline-block h-0 w-0 border-y-[5px] border-l-[6px] border-y-transparent border-l-slate-400" aria-hidden />
        </span>
      </div>
      <div className="flex flex-wrap justify-between gap-0 sm:flex-nowrap">
      {KANAL_DAGILIM_SATIRLARI.map(({ key, label }, index) => (
        <div
          key={key}
          className={cn(
            "flex min-w-[4.75rem] flex-1 flex-col items-center bg-gradient-to-b px-2 py-2.5 sm:px-2.5",
            KANAL_GRADIENT[key],
            index > 0 && "border-l border-slate-200/90",
            index === 0 && "rounded-l-lg",
            index === KANAL_DAGILIM_SATIRLARI.length - 1 && "rounded-r-lg",
          )}
        >
          <div className="flex h-[188px] w-full items-end justify-center gap-2.5 border-b border-slate-200/70 px-0.5 pb-0.5">
            <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold tabular-nums text-gray-900">
                <span className={`inline-block h-2 w-2 shrink-0 rounded-sm ${KANAL_RENK_SIRKET[key]}`} aria-hidden />
                {pf.format(ys[key])}%
              </span>
              <div
                className={`w-full max-w-[2.25rem] rounded-t ${KANAL_RENK_SIRKET[key]}`}
                style={{
                  height: `${ys[key] <= 0 ? 0 : Math.max(4, (ys[key] / 100) * H)}px`,
                }}
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
              <span className="inline-flex items-center gap-1 text-[10px] tabular-nums text-gray-700">
                <span className={`inline-block h-2 w-2 shrink-0 rounded-sm ${KANAL_RENK_SEKTOR[key]}`} aria-hidden />
                {pf.format(yk[key])}%
              </span>
              <div
                className={`w-full max-w-[2.25rem] rounded-t ${KANAL_RENK_SEKTOR[key]}`}
                style={{
                  height: `${yk[key] <= 0 ? 0 : Math.max(4, (yk[key] / 100) * H)}px`,
                }}
              />
            </div>
          </div>
          <p className="mt-2 max-w-[6.5rem] text-center text-[10px] font-medium leading-tight text-gray-800">{label}</p>
          <p className="mt-0.5 text-center text-[9px] tabular-nums text-slate-600">
            Kanalda{" "}
            {kanalSektorPayi[key] !== null ? (
              <span className="font-semibold text-slate-800">{pf.format(kanalSektorPayi[key]!)}%</span>
            ) : (
              "—"
            )}
          </p>
        </div>
      ))}
      </div>
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

  const secilenAd = sirketler.find((s) => s.kod === effectiveSirketKodu)?.ad ?? "";
  const primSegment =
    rows && effectiveSirketKodu !== null ? sirketSegmentFromKodu(rows, effectiveSirketKodu) : segment;
  const { kayit: olcekKayit, finDonem: olcekFinDonem, yukleniyor: olcekYukleniyor } = useOlcekSegmentKayit(
    effectiveSirketKodu !== null && secilenDonem
      ? {
          kaynak: "prim",
          donem: secilenDonem,
          segment: primSegment,
          sirketKodu: effectiveSirketKodu,
          sirketAdi: secilenAd,
        }
      : null,
  );

  if (error) return <TsbError message={error} />;
  if (!rows) return <TsbLoading />;
  if (sirketler.length === 0) {
    return <p className={tsb.alertWarn}>Bu dönem ve filtreye göre şirket bulunamadı.</p>;
  }

  if (!kiyas) {
    return null;
  }

  const ys = kanalYuzdeleri(kiyas.sirket);
  const yk = kanalYuzdeleri(kiyas.sektor);
  const kanalSektorPayi = kanalBazindaSirketSektorPayYuzde(kiyas.sirket, kiyas.sektor);
  const genelKanalPayi =
    kiyas.sektor.genelToplam > 0 ? (kiyas.sirket.genelToplam / kiyas.sektor.genelToplam) * 100 : null;

  const tumBransLabel = TSB_TUM_BRANS_LABEL[segment];

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <p className={tsb.filterSectionLabel}>Görünüm</p>
        <div className={cn(tsb.btnGroup, "mb-3")}>
          <TsbToggleButton pressed={segment === "hayatdisi"} variant="segment" onClick={() => setSegment("hayatdisi")}>
            Hayat dışı
          </TsbToggleButton>
          <TsbToggleButton pressed={segment === "hayat"} variant="segment" onClick={() => setSegment("hayat")}>
            Hayat &amp; emeklilik
          </TsbToggleButton>
        </div>
        <p className={tsb.filterSectionLabel}>Daraltma türü</p>
        <div className={tsb.btnGroup}>
          <TsbToggleButton pressed={filtreModu === "anaBransH"} onClick={() => setFiltreModu("anaBransH")}>
            Ana branş (TSB)
          </TsbToggleButton>
          <TsbToggleButton pressed={filtreModu === "tarifeGrubu"} onClick={() => setFiltreModu("tarifeGrubu")}>
            Tarife grubu
          </TsbToggleButton>
        </div>
      </TsbFilterBar>

      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField label="Dönem" className="sm:col-span-2">
            <TsbSelect
              value={secilenDonem}
              onChange={(e) => {
                setDonem(e.target.value);
                setAnaBrans("");
                setTarifeSecim("");
              }}
            >
              {donemler.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField
            label={filtreModu === "anaBransH" ? "Ana branş" : "Tarife grubu"}
            className="sm:col-span-2"
          >
            {filtreModu === "anaBransH" ? (
              <TsbSelect value={anaBrans} onChange={(e) => setAnaBrans(e.target.value)}>
                <option value="">{tumBransLabel}</option>
                {segment === "hayatdisi" && (
                  <option value={ANA_BRANS_FILTER_TRAFIK_HARIC}>{ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL}</option>
                )}
                {anaBransSecenekleri.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </TsbSelect>
            ) : (
              <TsbSelect value={tarifeSecim} onChange={(e) => setTarifeSecim(e.target.value)}>
                <option value="">Tüm tarife grupları</option>
                {segment === "hayatdisi" && (
                  <option value={TARIFE_GRUBU_FILTER_TRAFIK_HARIC}>{TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL}</option>
                )}
                {tarifeSecenekleri.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </TsbSelect>
            )}
          </TsbFilterField>
          <TsbFilterField label="Şirket" className="sm:col-span-2 lg:col-span-4">
            <TsbSelect
              className={tsb.selectWide}
              value={effectiveSirketKodu !== null ? String(effectiveSirketKodu) : ""}
              onChange={(e) => setSirketKodu(Number(e.target.value))}
            >
              {sirketler.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.ad} ({s.kod})
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
        </TsbFilterGrid>
      </TsbFilterBar>

      {secilenAd ? (
        <TsbOlcekSegmentRozeti sirketAdi={secilenAd} kayit={olcekKayit} finDonem={olcekFinDonem} yukleniyor={olcekYukleniyor} />
      ) : null}

      <div className={tsb.chartPanel}>
        <p className="text-xs font-semibold text-slate-800">Kanal payları — yüzde (yan yana)</p>
        <TsbSirketSektorGrafikLegend sirketAdi={secilenAd} />
        <p className={cn(tsb.caption, "mt-2")}>
          Her kanalda iki çubuk: kendi toplam primine göre kanal payı (%). Alttaki{" "}
          <strong>Kanalda %</strong> = o kanaldaki şirket primi ÷ sektör primi (pazar payı).
        </p>
        <KanalYuzdeGroupedBars ys={ys} yk={yk} kanalSektorPayi={kanalSektorPayi} />
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-slate-100 pt-3 text-[11px] text-slate-600">
          <span>
            Şirket toplam prim:{" "}
            <strong className="tabular-nums text-slate-900">{nf.format(kiyas.sirket.genelToplam)}</strong> ₺
          </span>
          <span>
            Sektör toplam prim:{" "}
            <strong className="tabular-nums text-slate-900">{nf.format(kiyas.sektor.genelToplam)}</strong> ₺
          </span>
        </div>
      </div>

      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[820px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th className={tsb.th}>Kanal</th>
              <th className={tsb.thRight}>Şirket ₺</th>
              <th className={tsb.thRight}>Şirket %</th>
              <th className={tsb.thRight}>Sektör ₺</th>
              <th className={tsb.thRight}>Sektör %</th>
              <th className={tsb.thRight}>Kanalda sektör payı</th>
              <th className={tsb.thRight}>Fark (pp)</th>
            </tr>
          </thead>
          <tbody>
            {KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => {
              const ps = ys[key];
              const pk = yk[key];
              const pp = ps - pk;
              const kp = kanalSektorPayi[key];
              return (
                <tr key={key} className={tsb.tbodyRow}>
                  <td className={cn(tsb.td, "font-medium")}>{label}</td>
                  <td className={cn(tsb.td, "text-right")}>{nf.format(kiyas.sirket[key])}</td>
                  <td className={cn(tsb.td, "text-right text-slate-600")}>{pf.format(ps)}%</td>
                  <td className={cn(tsb.td, "text-right text-slate-600")}>{nf.format(kiyas.sektor[key])}</td>
                  <td className={cn(tsb.td, "text-right text-slate-500")}>{pf.format(pk)}%</td>
                  <td className={cn(tsb.td, "text-right font-medium text-emerald-900")}>
                    {kp !== null ? `${pf.format(kp)}%` : "—"}
                  </td>
                  <td className={cn(tsb.td, "text-right font-medium", tsbDeltaRenk(pp))}>{tsbFormatPp(pp)}</td>
                </tr>
              );
            })}
            <tr className={cn(tsb.tbodyRow, "border-t-2 border-slate-200 bg-slate-50/80 font-semibold")}>
              <td className={tsb.td}>Genel toplam</td>
              <td className={cn(tsb.td, "text-right")}>{nf.format(kiyas.sirket.genelToplam)}</td>
              <td className={cn(tsb.td, "text-right")}>100,00%</td>
              <td className={cn(tsb.td, "text-right")}>{nf.format(kiyas.sektor.genelToplam)}</td>
              <td className={cn(tsb.td, "text-right")}>100,00%</td>
              <td className={cn(tsb.td, "text-right text-emerald-900")}>
                {genelKanalPayi !== null ? `${pf.format(genelKanalPayi)}%` : "—"}
              </td>
              <td className={cn(tsb.td, "text-right")}>—</td>
            </tr>
          </tbody>
        </table>
      </TsbTableShell>

      <p className={tsb.caption}>
        <strong>Şirket %</strong> ve <strong>Sektör %</strong>, seçilen kapsamda kanal primlerinin{" "}
        <strong>kendi genel toplamlarına</strong> oranıdır. <strong>Kanalda sektör payı</strong>, aynı kanal için şirket
        ₺ ÷ sektör ₺.
      </p>
    </div>
  );
}
