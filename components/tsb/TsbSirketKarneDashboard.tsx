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
} from "@/lib/tsbFinansalKarsilastirmaData";
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
import type { PrimTrendAylikNokta } from "@/lib/tsbPrimTrend12";

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const SEGMENT_LABEL: Record<TsbSektorSegment, string> = {
  hayatdisi: "Hayat dışı",
  hayat: "Hayat & emeklilik",
};

const POOL_FOR_SEGMENT: Record<TsbSektorSegment, SegmentSkorPool> = {
  hayatdisi: "HD",
  hayat: "HAYAT_EMEKLILIK",
};

function fmtPrim(v: number): string {
  return `${nf.format(v)} TL`;
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
    <section className={cn(tsb.dataPanel, "overflow-hidden p-0")}>
      <div className="border-b border-teal-900/10 bg-gradient-to-r from-teal-800 to-teal-700 px-4 py-3 text-white">
        <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-[11px] text-teal-100/90">{subtitle}</p> : null}
      </div>
      <div className="p-3">{children}</div>
    </section>
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
    <TsbTableShell>
      <table className={cn(tsb.table, "min-w-[720px] text-xs")}>
        <thead className={tsb.thead}>
          <tr>
            <th className={cn(tsb.thSticky, "text-left")}>Ana branş</th>
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
                <td className={cn(tsb.tdSticky, toplam && "bg-slate-50")}>{s.anaBransH}</td>
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
  );
}

const BRANS_PAY_RENK = [
  "#0d9488",
  "#0891b2",
  "#0284c7",
  "#2563eb",
  "#4f46e5",
  "#7c3aed",
  "#9333ea",
  "#c026d3",
  "#db2777",
  "#e11d48",
  "#ea580c",
  "#ca8a04",
  "#65a30d",
  "#16a34a",
  "#64748b",
];

function BransPayGrafik({
  bu: dilimBu,
  onceki: dilimOnceki,
  yilBu,
  yilOnceki,
}: {
  bu: BransPayDilim[];
  onceki: BransPayDilim[];
  yilBu: string;
  yilOnceki: string;
}) {
  const topBu = dilimBu.slice(0, 12);
  const topOnceki = dilimOnceki.slice(0, 12);

  function Bar({ dilimler, label }: { dilimler: BransPayDilim[]; label: string }) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-10 shrink-0 text-[10px] font-semibold text-slate-600">{label}</span>
        <div className="flex h-7 min-w-0 flex-1 overflow-hidden rounded-md border border-slate-200">
          {dilimler.map((d, i) =>
            d.sirketPay > 0.5 ? (
              <div
                key={d.etiket}
                title={`${d.etiket}: ${pf.format(d.sirketPay)}%`}
                style={{ width: `${d.sirketPay}%`, backgroundColor: BRANS_PAY_RENK[i % BRANS_PAY_RENK.length] }}
                className="min-w-[2px]"
              />
            ) : null,
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Bar dilimler={topOnceki} label={yilOnceki} />
      <Bar dilimler={topBu} label={yilBu} />
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
        {topBu.map((d, i) => (
          <span key={d.etiket} className="inline-flex items-center gap-1 text-[10px] text-slate-600">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: BRANS_PAY_RENK[i % BRANS_PAY_RENK.length] }}
            />
            {d.etiket} ({pf.format(d.sirketPay)}%)
          </span>
        ))}
      </div>
    </div>
  );
}

function KanalTablo({ satirlar, donemBu, donemOnceki }: { satirlar: KarneKanalSatir[]; donemBu: string; donemOnceki: string }) {
  return (
    <TsbTableShell>
      <table className={cn(tsb.table, "min-w-[680px] text-xs")}>
        <thead className={tsb.thead}>
          <tr>
            <th className={cn(tsb.thSticky, "text-left")}>Kanal</th>
            <th className={cn(tsb.th, "text-right")}>Üretim {donemBu}</th>
            <th className={cn(tsb.th, "text-right")}>Pay (%)</th>
            <th className={cn(tsb.th, "text-right")}>Δ vs {donemOnceki}</th>
            <th className={cn(tsb.th, "text-right")}>Kanalda sektör payı</th>
            <th className={cn(tsb.th, "text-right")}>Δ pay (pp)</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map((s) => (
            <tr key={s.key} className={tsb.tbodyRow}>
              <td className={tsb.tdSticky}>{s.label}</td>
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
  );
}

function TrendMiniChart({ seri, sirketAdi }: { seri: PrimTrendAylikNokta[]; sirketAdi: string }) {
  const W = 720;
  const H = 220;
  const pad = { l: 48, r: 16, t: 36, b: 48 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const maxV = Math.max(...seri.flatMap((p) => [p.sektorAylik, p.sirketAylik]), 1);
  const n = seri.length;
  const xAt = (i: number) => pad.l + (i / Math.max(n - 1, 1)) * innerW;
  const yAt = (v: number) => pad.t + innerH - (v / maxV) * innerH;
  const ptsSektor = seri.map((p, i) => `${xAt(i)},${yAt(p.sektorAylik)}`).join(" ");
  const ptsSirket = seri.map((p, i) => `${xAt(i)},${yAt(p.sirketAylik)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Son 12 ay aylık prim trendi">
      <rect width={W} height={H} fill="#fafafa" />
      <text x={pad.l} y={20} fill="#374151" fontSize={11} fontWeight={600}>
        Aylık prim üretimi (son {n} ay)
      </text>
      <text x={pad.l} y={32} fontSize={9} fill="#64748b">
        Kırmızı: sektör · Yeşil: {sirketAdi.length > 28 ? `${sirketAdi.slice(0, 26)}…` : sirketAdi}
      </text>
      <polyline fill="none" stroke="#dc2626" strokeWidth={2} points={ptsSektor} />
      <polyline fill="none" stroke="#059669" strokeWidth={2} points={ptsSirket} />
      {seri.map((p, i) => (
        <text
          key={p.donem}
          x={xAt(i)}
          y={H - 12}
          textAnchor="middle"
          fontSize={8}
          fill="#64748b"
          transform={`rotate(-35 ${xAt(i)} ${H - 12})`}
        >
          {p.donem.slice(5)}
        </text>
      ))}
    </svg>
  );
}

function TrendPayTablo({ seri }: { seri: PrimTrendAylikNokta[] }) {
  return (
    <TsbTableShell>
      <table className={cn(tsb.table, "min-w-[480px] text-xs")}>
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
  );
}

export default function TsbSirketKarneDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const { cache: olcekCache } = useOlcekSegmentCache();
  const [primRows, setPrimRows] = useState<TsbPrimRow[] | null>(null);
  const [gelirRows, setGelirRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [gelirDonemler, setGelirDonemler] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
  const [donem, setDonem] = useState("");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;
    fetch("/data/tsb/prim-tidy.json")
      .then((r) => r.json())
      .then((data: TsbPrimRow[]) => {
        if (!cancelled) {
          setPrimRows(data);
          const periods = uniqueSortedPeriods(data);
          if (periods.length > 0) {
            setDonem((prev) => {
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
  }, [urlPrefs.donem]);

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
    if (sirketler.length === 0) return;
    applyUrlSirketOrDefault(sirketler, urlPrefs.sirket, sirketKodu, setSirketKodu, segment);
  }, [sirketler, segment, sirketKodu, urlPrefs.sirket]);

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

      {secilenAd && primPaket ? (
        <>
          <div className={cn(tsb.dataPanel, "overflow-hidden border-teal-200 bg-gradient-to-br from-teal-900 to-teal-800 p-4 text-white")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-200/90">Şirket karne</p>
                <h2 className="mt-1 text-lg font-bold">{secilenAd}</h2>
                <p className="mt-1 text-xs text-teal-100/90">
                  {SEGMENT_LABEL[segment]} · Prim {donem} vs {primPaket.donemOnceki}
                  {finDonem ? ` · Fin ${finDonem}` : ""}
                </p>
                {primPaket.portfoySirasi.sira !== null ? (
                  <p className="mt-2 inline-block rounded-md bg-white/15 px-2 py-1 text-xs font-semibold">
                    Sektör prim sırası: {primPaket.portfoySirasi.sira} / {primPaket.portfoySirasi.katilimci}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <TsbOlcekSegmentRozeti
            sirketAdi={secilenAd}
            kayit={olcekKayit}
            finDonem={olcekFinDonem}
            yukleniyor={olcekYukleniyor}
          />

          <KarneSection
            title="Prim tablosu — aylık üretim ve pazar payı"
            subtitle={`Ana branş (TSB) · ${donem} vs ${primPaket.donemOnceki}`}
          >
            <PrimTablo
              satirlar={primPaket.aylikSatirlar}
              donemBu={donem}
              donemOnceki={primPaket.donemOnceki}
              showSirasi
            />
          </KarneSection>

          <KarneSection
            title="Kümülatif prim üretim ve pay"
            subtitle={`YTD Ocak–${donem.slice(5)} · ${yilBu} vs ${yilOnceki}`}
          >
            <PrimTablo
              satirlar={primPaket.ytdSatirlar}
              donemBu={`${yilBu} YTD`}
              donemOnceki={`${yilOnceki} YTD`}
              showSirasi={false}
            />
          </KarneSection>

          <KarneSection title="Kümülatif prim — branş pay dağılımı" subtitle="Şirket portföyü içindeki branş ağırlıkları (%)">
            <BransPayGrafik
              bu={primPaket.payDilimleriBu}
              onceki={primPaket.payDilimleriOnceki}
              yilBu={yilBu}
              yilOnceki={yilOnceki}
            />
          </KarneSection>

          {finPaketBu && finDonem ? (
            <KarneSection
              title="Finansal tablo"
              subtitle={`Çeyrek ${finDonem}${finPaketOnceki ? ` vs ${finDonemOnceki}` : ""} · yalnızca odak şirket`}
            >
              <TsbTableShell>
                <table className={cn(tsb.table, "min-w-[640px] text-xs")}>
                  <thead className={tsb.thead}>
                    <tr>
                      <th className={cn(tsb.thSticky, "text-left")}>KPI</th>
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
                      const delta = finansalKiyaslamaDegisim(buDeg.sirket, onceDeg.sirket, tanim.format);
                      return (
                        <tr key={tanim.id} className={tsb.tbodyRow}>
                          <td className={tsb.tdSticky}>{tanim.label}</td>
                          {finPaketOnceki ? (
                            <td className={cn(tsb.td, "text-right tabular-nums")}>
                              {formatFinansalHucre(onceDeg.sirket, tanim.format)}
                            </td>
                          ) : null}
                          {finPaketOnceki ? (
                            <td className={cn(tsb.td, "text-right tabular-nums", tsbDeltaRenk(delta.deger))}>
                              {formatFinansalDegisim(delta.deger, delta.format)}
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
            </KarneSection>
          ) : finDonem ? (
            <TsbLoading message="Finansal veri yükleniyor…" />
          ) : null}

          <KarneSection title="Kanala göre üretim dağılımı" subtitle="Tüm kanallar · kanalda sektör payı">
            <KanalTablo
              satirlar={primPaket.kanalSatirlari}
              donemBu={donem}
              donemOnceki={primPaket.donemOnceki}
            />
          </KarneSection>

          {primPaket.trendAylik && primPaket.trendAylik.length > 0 ? (
            <KarneSection title="Son 12 ay aylık prim trendi" subtitle="Sektör payı = şirket aylık primi ÷ sektör aylık primi">
              <TrendMiniChart seri={primPaket.trendAylik} sirketAdi={secilenAd} />
              <div className="mt-3">
                <TrendPayTablo seri={primPaket.trendAylik} />
              </div>
            </KarneSection>
          ) : null}
        </>
      ) : sirketKodu === "" ? (
        <p className={tsb.filterHint}>Karneyi görmek için şirket seçin.</p>
      ) : (
        <TsbLoading message="Karne hesaplanıyor…" />
      )}
    </div>
  );
}
