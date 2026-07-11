"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
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
  tsbChart,
  tsbFormatPrim,
} from "@/components/tsb/tsbDashboardUi";
import type { BransPayDilim } from "@/lib/tsbBransDegisim";
import { fetchGelirTidyDonemIndex, fetchGelirTidyDonemler } from "@/lib/tsbGelirTidyFetch";
import {
  FINANSAL_KIYASLAMA_SATIRLARI,
  finansalKiyaslamaDegisim,
  finansalKiyaslamaDonemPaketi,
  finansalKiyaslamaSatirSayisal,
  formatFinansalDegisim,
  formatFinansalHucre,
  oncekiYilDonem,
  type FinansalKiyaslamaDonemPaketi,
  type FinansalKiyaslamaSatirTanim,
} from "@/lib/tsbFinansalKarsilastirmaData";
import { formatPrimYtdAralikKisa } from "@/lib/tsbPrimDonemEtiket";
import { olcekFinDonemForPrimDonem } from "@/lib/tsbOlcekSegmentCache";
import { useOlcekSegmentCache } from "@/components/tsb/useOlcekSegmentCache";
import {
  buildSirketKarnePrimPaket,
  type KarneKanalSatir,
  type KarnePrimSatir,
} from "@/lib/tsbSirketKarne";
import type { TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import { listSirketlerSegmentDonem, uniqueSortedPeriods } from "@/lib/tsbPrimDashboard";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import TsbPrimTrendAylikBarChart from "@/components/tsb/TsbPrimTrendAylikBarChart";
import { TsbPrimSirketSektorLegend } from "@/components/tsb/TsbRenkAciklama";

const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const SEGMENT_LABEL: Record<TsbSektorSegment, string> = {
  hayatdisi: "Hayat dışı",
  hayat: "Hayat & emeklilik",
};

const POOL_FOR_SEGMENT: Record<TsbSektorSegment, SegmentSkorPool> = {
  hayatdisi: "HD",
  hayat: "HAYAT_EMEKLILIK",
};

export type TsbSirketKarneOzetControlled = {
  segment: TsbSektorSegment;
  donem: string;
  sirketKodu: number | "";
  setSegment: (s: TsbSektorSegment) => void;
  setDonem: (d: string) => void;
  setSirketKodu: (k: number | "") => void;
};

export type TsbSirketKarneOzetProps = {
  /** Üst bileşen filtreleri yönetiyorsa */
  controlled?: TsbSirketKarneOzetControlled;
  hideFilters?: boolean;
  hideHero?: boolean;
};

function fmtPrim(v: number): string {
  return tsbFormatPrim(v);
}

function fmtPct(v: number | null): string {
  if (v === null) return "—";
  return `${pf.format(v)}%`;
}

function fmtPp(v: number): string {
  const sign = v > 0 ? "+" : "";
  return `${sign}${pf.format(v)} pp`;
}

function KarneSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className={tsb.dataPanel}>
      <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="min-w-0 p-4 sm:p-5">{children}</div>
    </section>
  );
}

/** İkincil bloklar — varsayılan kapalı, sayfayı boğmaz. */
function KarneSectionFold({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <details className={cn(tsb.dataPanel, "[&_summary::-webkit-details-marker]:hidden")}>
      <summary className="cursor-pointer list-none border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50/80 sm:px-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <span className="mt-1 shrink-0 text-xs font-semibold text-emerald-700">Göster</span>
        </div>
      </summary>
      <div className="min-w-0 p-4 sm:p-5">{children}</div>
    </details>
  );
}

/** Geniş tablolar — mobilde yatay kaydırma ipucu + taşma düzeltmesi. */
function KarneTableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[11px] font-medium text-slate-400 sm:hidden">
        Tabloyu yatay kaydırarak tüm sütunları görebilirsiniz →
      </p>
      <div className="-mx-4 overflow-x-auto overscroll-x-contain px-4 sm:mx-0 sm:px-0">
        {children}
      </div>
    </div>
  );
}

const thMobil = "max-sm:static max-sm:z-auto max-sm:border-r-0 max-sm:bg-slate-50/95";
const tdMobil =
  "max-sm:static max-sm:z-auto max-sm:border-r-0 max-sm:bg-transparent max-sm:even:bg-transparent max-sm:group-hover:bg-transparent";

function finansalKarneSatirHesap(
  tanim: FinansalKiyaslamaSatirTanim,
  finPaketBu: FinansalKiyaslamaDonemPaketi,
  finPaketOnceki: FinansalKiyaslamaDonemPaketi | null,
) {
  if (tanim.kind === "spacer") return null;
  const buDeg = finansalKiyaslamaSatirSayisal(
    tanim.id,
    finPaketBu.sirketHam,
    finPaketBu.kiyasHam,
    finPaketBu.sirketSkorHam,
    finPaketBu.kiyasOran,
    finPaketBu.kiyasSkorHam,
    finPaketBu.sirketHp,
    finPaketBu.kiyasHp,
  );
  const onceDeg = finPaketOnceki
    ? finansalKiyaslamaSatirSayisal(
        tanim.id,
        finPaketOnceki.sirketHam,
        finPaketOnceki.kiyasHam,
        finPaketOnceki.sirketSkorHam,
        finPaketOnceki.kiyasOran,
        finPaketOnceki.kiyasSkorHam,
        finPaketOnceki.sirketHp,
        finPaketOnceki.kiyasHp,
      )
    : { sirket: null, kiyas: null };
  const delta = finPaketOnceki
    ? finansalKiyaslamaDegisim(buDeg.sirket, onceDeg.sirket, tanim.format)
    : null;
  return { tanim, buDeg, onceDeg, delta };
}

function FinansalKarneTablo({
  finPaketBu,
  finPaketOnceki,
  finDonem,
  finDonemOnceki,
}: {
  finPaketBu: FinansalKiyaslamaDonemPaketi;
  finPaketOnceki: FinansalKiyaslamaDonemPaketi | null;
  finDonem: string;
  finDonemOnceki: string | null;
}) {
  return (
    <>
      <div className="space-y-2 sm:hidden">
        {FINANSAL_KIYASLAMA_SATIRLARI.map((tanim) => {
          if (tanim.kind === "spacer") {
            return <div key={tanim.id} className="h-1" aria-hidden />;
          }
          const satir = finansalKarneSatirHesap(tanim, finPaketBu, finPaketOnceki);
          if (!satir) return null;
          const { buDeg, onceDeg, delta } = satir;
          return (
            <div
              key={tanim.id}
              className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 ring-1 ring-slate-900/[0.03]"
            >
              <p className="text-[11px] font-bold uppercase leading-snug tracking-wide text-slate-700">
                {tanim.label}
              </p>
              <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2">
                {finPaketOnceki && finDonemOnceki ? (
                  <>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        {finDonemOnceki}
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium tabular-nums text-slate-800">
                        {formatFinansalHucre(onceDeg.sirket, tanim.format)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Δ</dt>
                      <dd
                        className={cn(
                          "mt-0.5 inline-block rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums",
                          tsbDeltaRenk(delta?.deger),
                        )}
                      >
                        {delta ? formatFinansalDegisim(delta.deger, delta.format) : "—"}
                      </dd>
                    </div>
                  </>
                ) : null}
                <div className={finPaketOnceki ? "col-span-2 border-t border-slate-200/80 pt-2" : "col-span-2"}>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">{finDonem}</dt>
                  <dd className="mt-0.5 text-base font-bold tabular-nums text-slate-900">
                    {formatFinansalHucre(buDeg.sirket, tanim.format)}
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block">
        <KarneTableScroll>
          <TsbTableShell>
            <table className={cn(tsb.table, "min-w-[640px]")}>
            <thead className={tsb.thead}>
              <tr>
                <th className={cn(tsb.thSticky, thMobil, "text-left")}>KPI</th>
                {finPaketOnceki ? (
                  <th className={cn(tsb.th, "text-right")}>{finDonemOnceki}</th>
                ) : null}
                {finPaketOnceki ? <th className={cn(tsb.th, "text-right")}>Δ %</th> : null}
                <th className={cn(tsb.th, "text-right")}>{finDonem}</th>
              </tr>
            </thead>
            <tbody>
              {FINANSAL_KIYASLAMA_SATIRLARI.map((tanim) => {
                if (tanim.kind === "spacer") {
                  return (
                    <tr key={tanim.id} className="h-2">
                      <td colSpan={finPaketOnceki ? 4 : 2} />
                    </tr>
                  );
                }
                const satir = finansalKarneSatirHesap(tanim, finPaketBu, finPaketOnceki);
                if (!satir) return null;
                const { buDeg, onceDeg, delta } = satir;
                return (
                  <tr key={tanim.id} className={tsb.tbodyRow}>
                    <td className={cn(tsb.tdSticky, tdMobil)}>{tanim.label}</td>
                    {finPaketOnceki ? (
                      <td className={cn(tsb.td, "text-right tabular-nums")}>
                        {formatFinansalHucre(onceDeg.sirket, tanim.format)}
                      </td>
                    ) : null}
                    {finPaketOnceki ? (
                      <td className={cn(tsb.td, "text-right tabular-nums", tsbDeltaRenk(delta?.deger))}>
                        {delta ? formatFinansalDegisim(delta.deger, delta.format) : "—"}
                      </td>
                    ) : null}
                    <td className={cn(tsb.td, "text-right tabular-nums font-medium")}>
                      {formatFinansalHucre(buDeg.sirket, tanim.format)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </TsbTableShell>
        </KarneTableScroll>
      </div>
    </>
  );
}

function PrimTablo({
  satirlar,
  donemBu,
  donemOnceki,
  showSirasi,
}: {
  satirlar: KarnePrimSatir[];
  donemBu: string;
  donemOnceki: string;
  showSirasi: boolean;
}) {
  return (
    <KarneTableScroll>
      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[720px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th className={cn(tsb.thSticky, thMobil, "text-left")}>Ana branş</th>
            <th className={cn(tsb.th, "text-right")}>Prim {donemBu}</th>
            <th className={cn(tsb.th, "text-right")}>Δ vs {donemOnceki}</th>
            <th className={cn(tsb.th, "text-right")}>Pazar payı</th>
            <th className={cn(tsb.th, "text-right")}>Δ pay (pp)</th>
            {showSirasi ? <th className={cn(tsb.th, "text-center")}>Branş sırası</th> : null}
          </tr>
        </thead>
        <tbody>
          {satirlar.map((s) => {
            const toplam = s.anaBransH.includes("TOPLAM") || s.anaBransH.includes("PORTFÖY");
            return (
              <tr key={s.anaBransH} className={cn(tsb.tbodyRow, toplam && "bg-slate-50 font-semibold")}>
                <td className={cn(tsb.tdSticky, tdMobil, toplam && "max-sm:bg-slate-50 bg-slate-50")}>{s.anaBransH}</td>
                <td className={cn(tsb.td, "text-right tabular-nums")}>{fmtPrim(s.sirketPrimBu)}</td>
                <td className={cn(tsb.td, "text-right tabular-nums", tsbDeltaRenk(s.sirketDegisim))}>
                  {fmtPct(s.sirketDegisim)}
                </td>
                <td className={cn(tsb.td, "text-right tabular-nums")}>{pf.format(s.payBuYuzde)}%</td>
                <td className={cn(tsb.td, "text-right tabular-nums", tsbDeltaRenk(s.payDegisimPp))}>
                  {fmtPp(s.payDegisimPp)}
                </td>
                {showSirasi ? (
                  <td className={cn(tsb.td, "text-center tabular-nums")}>{s.bransSirasi}</td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
        </table>
      </TsbTableShell>
    </KarneTableScroll>
  );
}

const COL_BU = tsbChart.sirketBrut;
const COL_ONCEKI = tsbChart.onceki;

/** Seçili ayın aylık üretiminde branş payı — gruplu dikey sütunlar (okunabilir). */
function BransPayBarGrafik({
  bu,
  onceki,
  donemBu,
  donemOnceki,
}: {
  bu: BransPayDilim[];
  onceki: BransPayDilim[];
  donemBu: string;
  donemOnceki: string;
}) {
  const etiketler = [...new Set([...bu.map((d) => d.etiket), ...onceki.map((d) => d.etiket)])]
    .map((etiket) => ({
      etiket,
      payBu: bu.find((d) => d.etiket === etiket)?.sirketPay ?? 0,
      payOc: onceki.find((d) => d.etiket === etiket)?.sirketPay ?? 0,
    }))
    .filter((d) => d.payBu > 0.3 || d.payOc > 0.3)
    .sort((a, b) => b.payBu - a.payBu)
    .slice(0, 10);

  if (etiketler.length === 0) {
    return <p className={tsb.filterHint}>Seçili ay için branş payı hesaplanamadı.</p>;
  }

  const maxPay = Math.max(...etiketler.flatMap((d) => [d.payBu, d.payOc]), 1);
  const barMaxH = 160;

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-4 text-[10px] text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COL_BU }} />
          {donemBu} aylık pay
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COL_ONCEKI }} />
          {donemOnceki} aylık pay
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex min-w-[640px] items-end gap-3 pb-6 pt-2" style={{ minHeight: barMaxH + 48 }}>
          {etiketler.map(({ etiket, payBu, payOc }) => {
            const hBu = (payBu / maxPay) * barMaxH;
            const hOc = (payOc / maxPay) * barMaxH;
            return (
              <div key={etiket} className="flex min-w-[56px] flex-1 flex-col items-center">
                <div className="flex h-[168px] items-end justify-center gap-1">
                  <div className="flex flex-col items-center justify-end" title={`${donemOnceki}: ${pf.format(payOc)}%`}>
                    <span className="mb-0.5 text-[9px] tabular-nums text-slate-500">{pf.format(payOc)}%</span>
                    <div className="w-5 rounded-t-sm" style={{ height: Math.max(hOc, payOc > 0 ? 3 : 0), backgroundColor: COL_ONCEKI }} />
                  </div>
                  <div className="flex flex-col items-center justify-end" title={`${donemBu}: ${pf.format(payBu)}%`}>
                    <span className="mb-0.5 text-[9px] font-semibold tabular-nums text-emerald-800">{pf.format(payBu)}%</span>
                    <div className="w-5 rounded-t-sm" style={{ height: Math.max(hBu, payBu > 0 ? 3 : 0), backgroundColor: COL_BU }} />
                  </div>
                </div>
                <span className="mt-2 max-w-[72px] text-center text-[9px] leading-tight text-slate-700">{etiket}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KanalTablo({ satirlar, donemBu, donemOnceki }: { satirlar: KarneKanalSatir[]; donemBu: string; donemOnceki: string }) {
  return (
    <KarneTableScroll>
      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[680px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th className={cn(tsb.thSticky, thMobil, "text-left")}>Kanal</th>
            <th className={cn(tsb.th, "text-right")}>YTD prim {donemBu}</th>
            <th className={cn(tsb.th, "text-right")}>Pay (%)</th>
            <th className={cn(tsb.th, "text-right")}>Δ vs {donemOnceki}</th>
            <th className={cn(tsb.th, "text-right")}>Kanalda sektör payı</th>
            <th className={cn(tsb.th, "text-right")}>Δ pay (pp)</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map((s) => (
            <tr key={s.key} className={tsb.tbodyRow}>
              <td className={cn(tsb.tdSticky, tdMobil)}>{s.label}</td>
              <td className={cn(tsb.td, "text-right tabular-nums")}>{fmtPrim(s.uretimBu)}</td>
              <td className={cn(tsb.td, "text-right tabular-nums")}>{pf.format(s.payBuYuzde)}%</td>
              <td className={cn(tsb.td, "text-right tabular-nums", tsbDeltaRenk(s.degisimYuzde))}>
                {fmtPct(s.degisimYuzde)}
              </td>
              <td className={cn(tsb.td, "text-right tabular-nums")}>
                {s.kanaldaSektorPayBu !== null ? `${pf.format(s.kanaldaSektorPayBu)}%` : "—"}
              </td>
              <td className={cn(tsb.td, "text-right tabular-nums", tsbDeltaRenk(s.kanaldaPayDegisimPp))}>
                {s.kanaldaPayDegisimPp !== null ? fmtPp(s.kanaldaPayDegisimPp) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </TsbTableShell>
    </KarneTableScroll>
  );
}

function TrendPayTablo({ seri }: { seri: import("@/lib/tsbPrimTrend12").PrimTrendAylikNokta[] }) {
  return (
    <KarneTableScroll>
      <TsbTableShell>
      <table className={cn(tsb.table, "min-w-[480px]")}>
        <thead className={tsb.thead}>
          <tr>
            <th className={cn(tsb.th, "text-left")}>Ay</th>
            <th className={cn(tsb.th, "text-right")}>Şirket aylık prim</th>
            <th className={cn(tsb.th, "text-right")}>Sektör aylık prim</th>
            <th className={cn(tsb.th, "text-right")}>Sektör payı (%)</th>
          </tr>
        </thead>
        <tbody>
          {seri.map((p) => (
            <tr key={p.donem} className={tsb.tbodyRow}>
              <td className={tsb.td}>{p.donem}</td>
              <td className={cn(tsb.td, "text-right tabular-nums")}>{fmtPrim(p.sirketAylik)}</td>
              <td className={cn(tsb.td, "text-right tabular-nums")}>{fmtPrim(p.sektorAylik)}</td>
              <td className={cn(tsb.td, "text-right tabular-nums")}>{pf.format(p.payYuzde)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      </TsbTableShell>
    </KarneTableScroll>
  );
}

export default function TsbSirketKarneOzet({
  controlled,
  hideFilters = false,
  hideHero = false,
}: TsbSirketKarneOzetProps = {}) {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const { cache: olcekCache } = useOlcekSegmentCache();
  const [primRows, setPrimRows] = useState<TsbPrimRow[] | null>(null);
  const [gelirRows, setGelirRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [gelirDonemler, setGelirDonemler] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [segmentInternal, setSegmentInternal] = useState<TsbSektorSegment>(
    urlPrefs.segment ?? "hayatdisi",
  );
  const [donemInternal, setDonemInternal] = useState("");
  const [sirketKoduInternal, setSirketKoduInternal] = useState<number | "">("");

  const segment = controlled?.segment ?? segmentInternal;
  const donem = controlled?.donem ?? donemInternal;
  const sirketKodu = controlled?.sirketKodu ?? sirketKoduInternal;
  const setSegment = controlled?.setSegment ?? setSegmentInternal;
  const setDonem = controlled?.setDonem ?? setDonemInternal;
  const setSirketKodu = controlled?.setSirketKodu ?? setSirketKoduInternal;
  const syncUrlSirket = !controlled;

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tsb/prim-tidy.json")
      .then((r) => r.json())
      .then((data: TsbPrimRow[]) => {
        if (!cancelled) {
          setPrimRows(data);
          const periods = uniqueSortedPeriods(data);
          if (periods.length > 0) {
            setDonemInternal((prev) => {
              if (controlled?.donem && periods.includes(controlled.donem)) return controlled.donem;
              if (prev && periods.includes(prev)) return prev;
              if (urlPrefs.donem && periods.includes(urlPrefs.donem)) return urlPrefs.donem;
              return periods[periods.length - 1];
            });
          }
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Prim verisi yüklenemedi");
      });
    fetchGelirTidyDonemIndex()
      .then((d) => {
        if (!cancelled) setGelirDonemler(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [urlPrefs.donem, controlled?.donem]);

  const sortedPrimDonemler = useMemo(
    () => (primRows ? uniqueSortedPeriods(primRows) : []),
    [primRows],
  );

  const finDonem = useMemo(
    () => (donem && olcekCache ? olcekFinDonemForPrimDonem(olcekCache, donem) : null),
    [donem, olcekCache],
  );
  const finDonemOnceki = useMemo(
    () => (finDonem ? oncekiYilDonem(finDonem) : null),
    [finDonem],
  );

  useEffect(() => {
    if (!finDonem || gelirDonemler.length === 0) return;
    const yuklenecek = [finDonem];
    if (finDonemOnceki && gelirDonemler.includes(finDonemOnceki)) yuklenecek.push(finDonemOnceki);
    let cancelled = false;
    setGelirRows(null);
    fetchGelirTidyDonemler(yuklenecek)
      .then((data) => {
        if (!cancelled) setGelirRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Finansal veri yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, [finDonem, finDonemOnceki, gelirDonemler]);

  const sirketler = useMemo(() => {
    if (!primRows || !donem) return [];
    return listSirketlerSegmentDonem(primRows, donem, "genelToplam", segment, {
      kind: "anaBransH",
      anaBransH: null,
    });
  }, [primRows, donem, segment]);

  useEffect(() => {
    if (!syncUrlSirket || sirketler.length === 0) return;
    applyUrlSirketOrDefault(sirketler, urlPrefs.sirket, sirketKodu, setSirketKodu, segment);
  }, [sirketler, segment, sirketKodu, urlPrefs.sirket, syncUrlSirket, setSirketKodu]);

  const secilenAd = sirketler.find((s) => s.kod === sirketKodu)?.ad ?? "";
  const pool = POOL_FOR_SEGMENT[segment];

  const primPaket = useMemo(() => {
    if (!primRows || !donem || sirketKodu === "") return null;
    return buildSirketKarnePrimPaket(
      primRows,
      sortedPrimDonemler,
      donem,
      segment,
      sirketKodu,
      { kind: "anaBransH", anaBransH: null },
      "genelToplam",
    );
  }, [primRows, sortedPrimDonemler, donem, segment, sirketKodu]);

  const finPaketBu = useMemo(() => {
    if (!gelirRows || !finDonem || sirketKodu === "") return null;
    return finansalKiyaslamaDonemPaketi(gelirRows, finDonem, sirketKodu, pool, { mod: "sektor" });
  }, [gelirRows, finDonem, sirketKodu, pool]);

  const finPaketOnceki = useMemo(() => {
    if (!gelirRows || !finDonemOnceki || sirketKodu === "" || !gelirDonemler.includes(finDonemOnceki))
      return null;
    return finansalKiyaslamaDonemPaketi(gelirRows, finDonemOnceki, sirketKodu, pool, { mod: "sektor" });
  }, [gelirRows, finDonemOnceki, sirketKodu, pool, gelirDonemler]);

  const { kayit: olcekKayit, finDonem: olcekFinDonem, yukleniyor: olcekYukleniyor } = useOlcekSegmentKayit(
    primRows && donem && sirketKodu !== ""
      ? {
          kaynak: "prim",
          donem,
          segment,
          sirketKodu,
          sirketAdi: secilenAd,
          cache: olcekCache,
        }
      : null,
  );

  const yilBu = donem.slice(0, 4);
  const yilOnceki = primPaket?.donemOnceki.slice(0, 4) ?? "";

  if (error) return <TsbError message={error} />;
  if (!primRows) return <TsbLoading message="Prim verisi yükleniyor…" />;

  return (
    <div className={tsb.dashboardStack}>
      {!hideFilters ? (
        <TsbFilterBar>
        <p className={tsb.filterSectionLabel}>Şirket grubu</p>
        <div className={cn(tsb.btnGroup, "mb-3")}>
          <TsbToggleButton
            pressed={segment === "hayatdisi"}
            variant="segment"
            onClick={() => {
              setSegment("hayatdisi");
              setSirketKodu("");
            }}
          >
            Hayat dışı
          </TsbToggleButton>
          <TsbToggleButton
            pressed={segment === "hayat"}
            variant="segment"
            onClick={() => {
              setSegment("hayat");
              setSirketKodu("");
            }}
          >
            Hayat &amp; emeklilik
          </TsbToggleButton>
        </div>
        <TsbFilterGrid>
          <TsbFilterField
            label="Prim dönemi (ay)"
            hint={
              finDonem ? (
                <>
                  Finansal çeyrek: <strong>{finDonem}</strong>
                  {primPaket ? (
                    <>
                      {" "}
                      · Karşılaştırma: <strong>{donem}</strong> vs <strong>{primPaket.donemOnceki}</strong>
                    </>
                  ) : null}
                </>
              ) : (
                "Finansal çeyrek eşlemesi yükleniyor…"
              )
            }
          >
            <TsbSelect value={donem} onChange={(e) => setDonem(e.target.value)}>
              {[...sortedPrimDonemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Şirket">
            <TsbSelect
              value={sirketKodu === "" ? "" : String(sirketKodu)}
              onChange={(e) => setSirketKodu(e.target.value === "" ? "" : Number(e.target.value))}
            >
              <option value="">Seçin…</option>
              {sirketler.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.ad} ({s.kod})
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
        </TsbFilterGrid>
      </TsbFilterBar>
      ) : null}

      {secilenAd && primPaket ? (
        <>
          {!hideHero ? (
          <div className={tsb.heroCard}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={tsb.heroEyebrow}>Şirket karne</p>
                <h2 className={tsb.heroTitle}>{secilenAd}</h2>
                <p className={tsb.heroMeta}>
                  {SEGMENT_LABEL[segment]} · Prim {donem} vs {primPaket.donemOnceki}
                  {finDonem ? ` · Fin ${finDonem}` : ""}
                </p>
                {primPaket.portfoySirasi.sira !== null ? (
                  <p className={tsb.heroBadge}>
                    Sektör prim sırası: {primPaket.portfoySirasi.sira} / {primPaket.portfoySirasi.katilimci}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          ) : null}

          {!hideHero ? (
          <TsbOlcekSegmentRozeti
            sirketAdi={secilenAd}
            kayit={olcekKayit}
            finDonem={olcekFinDonem}
            yukleniyor={olcekYukleniyor}
          />
          ) : null}

          <KarneSection
            title="Kümülatif prim üretim ve pay"
            subtitle={`YTD ${formatPrimYtdAralikKisa(donem)} · ${yilBu} vs ${yilOnceki}`}
          >
            <PrimTablo
              satirlar={primPaket.ytdSatirlar}
              donemBu={`${yilBu} YTD`}
              donemOnceki={`${yilOnceki} YTD`}
              showSirasi={false}
            />
          </KarneSection>

          <KarneSectionFold
            title="Prim tablosu — aylık üretim ve pazar payı"
            subtitle={`${donem} vs ${primPaket.donemOnceki}`}
          >
            <PrimTablo
              satirlar={primPaket.aylikSatirlar}
              donemBu={donem}
              donemOnceki={primPaket.donemOnceki}
              showSirasi
            />
          </KarneSectionFold>

          <KarneSection
            title="Aylık prim — branş pay dağılımı"
            subtitle={`${donem} vs ${primPaket.donemOnceki} · branş payları (%)`}
          >
            <BransPayBarGrafik
              bu={primPaket.payDilimleriBu}
              onceki={primPaket.payDilimleriOnceki}
              donemBu={donem}
              donemOnceki={primPaket.donemOnceki}
            />
          </KarneSection>

          {finPaketBu && finDonem ? (
            <KarneSection
              title="Finansal tablo"
              subtitle={`Çeyrek ${finDonem}${finPaketOnceki ? ` vs ${finDonemOnceki}` : ""}`}
            >
              <FinansalKarneTablo
                finPaketBu={finPaketBu}
                finPaketOnceki={finPaketOnceki}
                finDonem={finDonem}
                finDonemOnceki={finDonemOnceki}
              />
            </KarneSection>
          ) : finDonem ? (
            <TsbLoading message="Finansal veri yükleniyor…" />
          ) : null}

          <KarneSectionFold
            title="Kanala göre üretim dağılımı"
            subtitle={`${donem} yıl başından kümülatif · kanal payı · kanalda sektör payı`}
          >
            <KanalTablo
              satirlar={primPaket.kanalSatirlari}
              donemBu={donem}
              donemOnceki={primPaket.donemOnceki}
            />
          </KarneSectionFold>

          {primPaket.trendAylik && primPaket.trendAylik.length > 0 ? (
            <KarneSection
              title="Son 12 ay aylık prim trendi"
              subtitle="Son 12 ay aylık prim ve sektör payı"
            >
              <div className={tsb.chartPanel}>
                <TsbPrimSirketSektorLegend sirketAdi={secilenAd} />
                <div className="mt-2">
                  <TsbPrimTrendAylikBarChart seri={primPaket.trendAylik} sirketAdi={secilenAd} />
                </div>
              </div>
              <div className="mt-3">
                <TrendPayTablo seri={primPaket.trendAylik} />
              </div>
            </KarneSection>
          ) : null}
        </>
      ) : sirketKodu === "" && !hideFilters ? (
        <p className={tsb.filterHint}>Karneyi görmek için şirket seçin.</p>
      ) : sirketKodu === "" ? null : (
        <TsbLoading message="Karne hesaplanıyor…" />
      )}
    </div>
  );
}
