"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
import TsbKiyasModuControls, { kiyasBaslikFromModu } from "@/components/tsb/TsbKiyasModuControls";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
import {
  cn,
  tsb,
  tsbChart,
  TsbError,
  TsbFilterBar,
  TsbFilterField,
  TsbFilterGrid,
  TsbLoading,
  TsbSelect,
  TsbTableShell,
  TsbToggleButton,
} from "@/components/tsb/tsbDashboardUi";
import {
  buildAnaBransTkzOzet,
  buildAnaBransTkzTrend,
  type AnaBransTkzKiyasHedef,
  type AnaBransTkzSatir,
  type AnaBransTkzTrendModu,
  type AnaBransTkzTrendNokta,
} from "@/lib/tsbAnaBransTkz";
import {
  fetchGelirTidyDonemIndex,
  fetchGelirTidyDonemler,
} from "@/lib/tsbGelirTidyFetch";
import type { TsbKiyasModu } from "@/lib/tsbKiyasHedef";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import { listSirketleriGelirDonemForPool } from "@/lib/tsbFinansalKarsilastirmaData";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";

const POOL_LABELS: Record<SegmentSkorPool, string> = {
  HD: "Hayat dışı (HD)",
  HAYAT_EMEKLILIK: "Hayat / Emeklilik",
};
const TREND_TUM_BRANSLAR = "__all";
const COL_GELIR = tsbChart.sirketBrut;
const COL_GIDER = "#dc2626";
const COL_TKZ = tsbChart.sektor;

function defaultSirketModForPool(pool: SegmentSkorPool): "hayatdisi" | "hayat" {
  return pool === "HD" ? "hayatdisi" : "hayat";
}

function formatTl(v: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(v);
}

function shortLabel(mod: TsbKiyasModu, baslik: string): string {
  if (mod === "sektor") return "Sektör toplamı";
  if (mod === "olcek") return baslik.length > 32 ? `${baslik.slice(0, 32)}…` : baslik;
  return baslik.length > 36 ? `${baslik.slice(0, 36)}…` : baslik;
}

function formatMn(v: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(v / 1e6);
}

function chartMaxAbs(seri: AnaBransTkzTrendNokta[], pick: (x: AnaBransTkzTrendNokta) => number[]): number {
  const vals = seri.flatMap(pick).map((v) => Math.abs(v));
  return Math.max(...vals, 1);
}

function spreadLabelYs(entries: Array<{ key: string; y: number; prefer: number }>, minGap = 12) {
  const sorted = [...entries].sort((a, b) => a.y - b.y);
  let prev = -Infinity;
  const placed = new Map<string, number>();
  for (const item of sorted) {
    const nextY = Math.max(item.y + item.prefer, prev + minGap);
    placed.set(item.key, nextY);
    prev = nextY;
  }
  return placed;
}

function TrendChart({
  title,
  subtitle,
  seri,
  side,
  trendModu,
}: {
  title: string;
  subtitle: string;
  seri: AnaBransTkzTrendNokta[];
  side: "sirket" | "kiyas";
  trendModu: AnaBransTkzTrendModu;
}) {
  const w = 860;
  const h = 340;
  const pad = { l: 72, r: 24, t: 48, b: 54 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxAbs = chartMaxAbs(seri, (x) =>
    side === "sirket"
      ? [x.sirketTeknikGelir, x.sirketTeknikGider, x.sirketTkz]
      : [x.kiyasTeknikGelir, x.kiyasTeknikGider, x.kiyasTkz],
  );
  const hi = maxAbs * 1.15;
  const xAt = (i: number) => pad.l + (i / Math.max(seri.length - 1, 1)) * innerW;
  const yAt = (v: number) => pad.t + innerH * (1 - (v + hi) / (2 * hi));
  const zeroY = yAt(0);
  const tickVals = [-hi, -hi / 2, 0, hi / 2, hi];
  const points = (pick: (x: AnaBransTkzTrendNokta) => number) =>
    seri.map((p, i) => `${xAt(i)},${yAt(pick(p))}`).join(" ");
  const gelirPts = points((p) => (side === "sirket" ? p.sirketTeknikGelir : p.kiyasTeknikGelir));
  const giderPts = points((p) => (side === "sirket" ? p.sirketTeknikGider : p.kiyasTeknikGider));
  const tkzPts = points((p) => (side === "sirket" ? p.sirketTkz : p.kiyasTkz));

  return (
    <div className={tsb.chartPanel}>
      <h3 className="mb-1 text-sm font-semibold text-slate-900">{title}</h3>
      <p className={cn(tsb.caption, "mb-4")}>{subtitle}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-full" role="img" aria-label={title}>
        <rect width={w} height={h} fill="#fafafa" />
        <text x={pad.l} y={20} fill="#374151" fontSize={12} fontWeight={600}>
          {trendModu === "kumulatif" ? "Kümülatif tutar (değerler Mn ₺)" : "Çeyreklik akış (değerler Mn ₺)"}
        </text>
        <text x={pad.l} y={36} fontSize={9}>
          <tspan fill={COL_GELIR} fontWeight={700}>Teknik Gelir</tspan>
          <tspan fill="#64748b"> · </tspan>
          <tspan fill={COL_GIDER} fontWeight={700}>Teknik Gider</tspan>
          <tspan fill="#64748b"> · </tspan>
          <tspan fill={COL_TKZ} fontWeight={700}>TKZ</tspan>
        </text>

        {tickVals.map((tv, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yAt(tv)} x2={pad.l + innerW} y2={yAt(tv)} stroke={tv === 0 ? "#94a3b8" : "#e5e7eb"} strokeWidth={1} />
            <text x={pad.l - 8} y={yAt(tv) + 3} textAnchor="end" fill="#64748b" fontSize={9}>
              {formatMn(tv)}
            </text>
          </g>
        ))}

        <line x1={pad.l} y1={zeroY} x2={pad.l + innerW} y2={zeroY} stroke="#94a3b8" strokeWidth={1.2} />
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#94a3b8" strokeWidth={1} />

        <polyline fill="none" stroke={COL_GELIR} strokeWidth={2.4} points={gelirPts} strokeLinejoin="round" />
        <polyline fill="none" stroke={COL_GIDER} strokeWidth={2.4} points={giderPts} strokeLinejoin="round" />
        <polyline fill="none" stroke={COL_TKZ} strokeWidth={2.8} points={tkzPts} strokeLinejoin="round" />

        {seri.map((p, i) => {
          const gelirV = side === "sirket" ? p.sirketTeknikGelir : p.kiyasTeknikGelir;
          const giderV = side === "sirket" ? p.sirketTeknikGider : p.kiyasTeknikGider;
          const tkzV = side === "sirket" ? p.sirketTkz : p.kiyasTkz;
          const gelirY = yAt(gelirV);
          const giderY = yAt(giderV);
          const tkzY = yAt(tkzV);
          const labelYs = spreadLabelYs([
            { key: "gelir", y: gelirY, prefer: -8 },
            { key: "gider", y: giderY, prefer: 14 },
            { key: "tkz", y: tkzY, prefer: -16 },
          ]);
          return (
          <g key={p.donem}>
            <circle cx={xAt(i)} cy={gelirY} r={3} fill={COL_GELIR} />
            <circle cx={xAt(i)} cy={giderY} r={3} fill={COL_GIDER} />
            <circle cx={xAt(i)} cy={tkzY} r={3.2} fill={COL_TKZ} />
            <text
              x={xAt(i)}
              y={labelYs.get("gelir")}
              textAnchor="middle"
              fill={COL_GELIR}
              fontSize={8}
              fontWeight={700}
            >
              {formatMn(gelirV)}
            </text>
            <text
              x={xAt(i)}
              y={labelYs.get("gider")}
              textAnchor="middle"
              fill={COL_GIDER}
              fontSize={8}
              fontWeight={700}
            >
              {formatMn(giderV)}
            </text>
            <text
              x={xAt(i)}
              y={labelYs.get("tkz")}
              textAnchor="middle"
              fill={COL_TKZ}
              fontSize={8}
              fontWeight={800}
            >
              {formatMn(tkzV)}
            </text>
            <text x={xAt(i)} y={h - 16} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={600}>
              {p.donem}
            </text>
          </g>
        )})}
      </svg>
    </div>
  );
}

function Satir({ satir, toplam = false }: { satir: AnaBransTkzSatir; toplam?: boolean }) {
  return (
    <tr className={cn(tsb.tbodyRow, toplam && "bg-slate-100/90 font-semibold")}>
      <td className={cn(tsb.tdSticky, "whitespace-nowrap text-xs", toplam && "bg-slate-100/90")}>
        {satir.anaBransH}
      </td>
      <td className={cn(tsb.td, "text-right")}>{formatTl(satir.sirketTeknikGelir)}</td>
      <td className={cn(tsb.td, "text-right")}>{formatTl(satir.sirketTeknikGider)}</td>
      <td className={cn(tsb.td, "border-r border-slate-200 text-right font-semibold")}>{formatTl(satir.sirketTkz)}</td>
      <td className={cn(tsb.td, "text-right text-slate-700")}>{formatTl(satir.kiyasTeknikGelir)}</td>
      <td className={cn(tsb.td, "text-right text-slate-700")}>{formatTl(satir.kiyasTeknikGider)}</td>
      <td className={cn(tsb.td, "text-right font-semibold text-slate-900")}>{formatTl(satir.kiyasTkz)}</td>
    </tr>
  );
}

export default function TsbAnaBransTkzDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [tumDonemler, setTumDonemler] = useState<string[]>([]);
  const [rows, setRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donem, setDonem] = useState<string>("");
  const [pool, setPool] = useState<SegmentSkorPool>(urlPrefs.pool ?? "HD");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [kiyasModu, setKiyasModu] = useState<TsbKiyasModu>("sektor");
  const [kiyasSirketKodu, setKiyasSirketKodu] = useState<number | "">("");
  const [trendAnaBrans, setTrendAnaBrans] = useState<string>(TREND_TUM_BRANSLAR);
  const [trendModu, setTrendModu] = useState<AnaBransTkzTrendModu>("ceyrek");

  useEffect(() => {
    let cancelled = false;
    fetchGelirTidyDonemIndex()
      .then((donemler) => {
        if (!cancelled) setTumDonemler(donemler);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Dönem listesi yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (tumDonemler.length === 0) return;
    setDonem((prev) => {
      if (prev && tumDonemler.includes(prev)) return prev;
      if (urlPrefs.donem && tumDonemler.includes(urlPrefs.donem)) return urlPrefs.donem;
      return tumDonemler[tumDonemler.length - 1];
    });
  }, [tumDonemler, urlPrefs.donem]);

  const trendDonemler = useMemo(() => {
    if (!donem) return [];
    const idx = tumDonemler.indexOf(donem);
    if (idx < 0) return [];
    return tumDonemler.slice(Math.max(0, idx - 8), idx + 1);
  }, [tumDonemler, donem]);

  useEffect(() => {
    if (trendDonemler.length === 0) return;
    let cancelled = false;
    setRows(null);
    fetchGelirTidyDonemler(trendDonemler)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Veri yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, [trendDonemler]);

  const sirketListesi = useMemo(() => {
    if (!rows || !donem) return [];
    return listSirketleriGelirDonemForPool(rows, donem, pool);
  }, [rows, donem, pool]);

  useEffect(() => {
    if (sirketListesi.length === 0) return;
    applyUrlSirketOrDefault(
      sirketListesi,
      urlPrefs.sirket,
      sirketKodu,
      setSirketKodu,
      defaultSirketModForPool(pool),
    );
  }, [sirketListesi, urlPrefs.sirket, sirketKodu, pool]);

  const kiyasListe = useMemo(
    () => sirketListesi.filter((s) => s.kod !== sirketKodu),
    [sirketListesi, sirketKodu],
  );

  useEffect(() => {
    if (kiyasModu !== "sirket" || kiyasListe.length === 0) return;
    if (kiyasListe.some((s) => s.kod === kiyasSirketKodu)) return;
    setKiyasSirketKodu(kiyasListe[0].kod);
  }, [kiyasListe, kiyasModu, kiyasSirketKodu]);

  const kiyasHedef: AnaBransTkzKiyasHedef = useMemo(() => {
    if (kiyasModu === "sektor") return { mod: "sektor" };
    if (kiyasModu === "olcek") return { mod: "olcek" };
    if (kiyasSirketKodu === "") return { mod: "sektor" };
    return { mod: "sirket", sirketKodu: kiyasSirketKodu };
  }, [kiyasModu, kiyasSirketKodu]);

  const ozet = useMemo(() => {
    if (!rows || !donem || sirketKodu === "") return null;
    return buildAnaBransTkzOzet(rows, donem, sirketKodu, pool, kiyasHedef);
  }, [rows, donem, sirketKodu, pool, kiyasHedef]);

  const trendSecenekleri = useMemo(
    () => [
      { value: TREND_TUM_BRANSLAR, label: "Tüm branşlar" },
      ...(ozet?.satirlar ?? []).map((s) => ({ value: s.anaBransH, label: s.anaBransH })),
    ],
    [ozet],
  );

  useEffect(() => {
    if (trendSecenekleri.some((s) => s.value === trendAnaBrans)) return;
    setTrendAnaBrans(TREND_TUM_BRANSLAR);
  }, [trendSecenekleri, trendAnaBrans]);

  const trend = useMemo(() => {
    if (!rows || !donem || sirketKodu === "" || trendDonemler.length === 0) return [];
    return buildAnaBransTkzTrend(
      rows,
      trendDonemler,
      sirketKodu,
      pool,
      trendAnaBrans === TREND_TUM_BRANSLAR ? null : trendAnaBrans,
      kiyasHedef,
      trendModu,
    );
  }, [rows, donem, sirketKodu, trendDonemler, pool, trendAnaBrans, kiyasHedef, trendModu]);

  const secilenAd =
    sirketListesi.find((s) => s.kod === sirketKodu)?.ad ??
    (sirketKodu === "" ? "" : `Şirket ${sirketKodu}`);

  const { kayit: olcekKayit, finDonem: olcekFinDonem } = useOlcekSegmentKayit(
    rows && donem && sirketKodu !== ""
      ? {
          kaynak: "gelir",
          rows,
          donem,
          pool,
          sirketKodu,
          sirketAdi: secilenAd,
        }
      : null,
  );

  const kiyasBaslik = useMemo(() => {
    if (kiyasModu === "sirket") {
      const ad = kiyasListe.find((s) => s.kod === kiyasSirketKodu)?.ad;
      return ad ?? "Kıyas şirketi";
    }
    return kiyasBaslikFromModu(kiyasModu, {
      sektorPeerSayisi: ozet?.peerSayisi,
      olcekSegment: ozet?.kiyasOlcekSegment,
      olcekPeerSayisi: ozet?.kiyasMod === "olcek" ? ozet.peerSayisi : undefined,
    });
  }, [kiyasListe, kiyasModu, kiyasSirketKodu, ozet]);

  if (error) return <TsbError message={error} />;
  if (tumDonemler.length === 0) return <TsbLoading message="Finansal dönem listesi yükleniyor…" />;
  if (!rows || !donem || sirketKodu === "" || !ozet) return <TsbLoading message="Ana branş TKZ tablosu hazırlanıyor…" />;

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <p className={tsb.filterSectionLabel}>Sektör havuzu</p>
        <div role="tablist" aria-label="Sektör havuzu" className={cn(tsb.btnGroup, "mb-3")}>
          {(["HD", "HAYAT_EMEKLILIK"] as const).map((p) => (
            <TsbToggleButton
              key={p}
              pressed={pool === p}
              variant="segment"
              onClick={() => {
                setPool(p);
                setSirketKodu("");
                setKiyasModu("sektor");
              }}
            >
              {POOL_LABELS[p]}
            </TsbToggleButton>
          ))}
        </div>

        <TsbFilterGrid>
          <TsbFilterField
            label="Finansal dönem"
            hint={
              <>
                Varsayılan son finansal dönemdir; seçim değişince tablo ve trend birlikte güncellenir.
              </>
            }
          >
            <TsbSelect id="tkz-ana-donem" value={donem} onChange={(e) => setDonem(e.target.value)}>
              {[...tumDonemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>

          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <span className={tsb.filterLabel}>Tablo karşılaştırması</span>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
              Sol blok seçili şirket; sağ blok sektör toplamı, benzer ölçek ortalaması veya başka bir şirket.
            </p>
            <div className="mt-2 flex flex-col gap-3 rounded-lg border border-slate-200/90 bg-white/80 p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                  Sol blok — şirket
                </span>
                <TsbSelect
                  id="tkz-ana-sirket"
                  className="mt-1"
                  value={String(sirketKodu)}
                  onChange={(e) => setSirketKodu(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  {sirketListesi.map((s) => (
                    <option key={s.kod} value={s.kod}>
                      {s.ad} ({s.kod})
                    </option>
                  ))}
                </TsbSelect>
              </div>

              <div className="hidden shrink-0 self-center px-1 text-sm font-semibold text-slate-400 sm:block sm:pb-2" aria-hidden>
                vs
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  Sağ blok — kıyas
                </span>
                <TsbKiyasModuControls
                  kiyasModu={kiyasModu}
                  onKiyasModuChange={setKiyasModu}
                  sektorPeerSayisi={ozet.peerSayisi}
                  olcekSegment={ozet.kiyasOlcekSegment}
                  olcekPeerSayisi={ozet.kiyasMod === "olcek" ? ozet.peerSayisi : undefined}
                  kiyasListe={kiyasListe}
                  kiyasSirketKodu={kiyasSirketKodu}
                  onKiyasSirketKoduChange={setKiyasSirketKodu}
                  selectId="tkz-ana-kiyas-sirket"
                />
              </div>
            </div>
          </div>
        </TsbFilterGrid>

        <p className={tsb.filterHint}>
          Satırlar <strong>TSB ana branş</strong> etiketleriyle gösterilir; teknik hesap GT branşlarından türetilir.
        </p>
      </TsbFilterBar>

      {secilenAd ? <TsbOlcekSegmentRozeti sirketAdi={secilenAd} kayit={olcekKayit} finDonem={olcekFinDonem} /> : null}

      <p className={cn(tsb.filterBar, tsb.filterHint, "!mt-0")}>
        <strong>{POOL_LABELS[pool]}</strong> · Teknik gelir = <strong>gelir - 603</strong> · Teknik gider ={" "}
        <strong>gider - 02..06</strong> · TKZ = <strong>teknik gelir + teknik gider</strong>.
      </p>

      <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[860px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th rowSpan={2} className={cn(tsb.thSticky, "min-w-[13rem]")}>
                Ana branş
              </th>
              <th colSpan={3} className="border-l border-slate-200 bg-emerald-50/60 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-emerald-900">
                {secilenAd}
              </th>
              <th colSpan={3} className="border-l border-slate-200 bg-slate-100/80 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-800">
                {shortLabel(kiyasModu, kiyasBaslik)}
              </th>
            </tr>
            <tr>
              <th className={cn(tsb.thRight, "border-l border-slate-100")}>Teknik Gelir</th>
              <th className={tsb.thRight}>Teknik Gider</th>
              <th className={cn(tsb.thRight, "border-r border-slate-200")}>TKZ</th>
              <th className={tsb.thRight}>Teknik Gelir</th>
              <th className={tsb.thRight}>Teknik Gider</th>
              <th className={tsb.thRight}>TKZ</th>
            </tr>
          </thead>
          <tbody>
            {ozet.satirlar.map((satir) => (
              <Satir key={satir.anaBransH} satir={satir} />
            ))}
            <Satir satir={ozet.toplam} toplam />
          </tbody>
        </table>
      </TsbTableShell>

      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField
            label="Trend branşı"
            hint={
              trendModu === "ceyrek"
                ? "Çeyreklik akış: kümülatiften önceki çeyrek düşülerek bulunur."
                : "Kümülatif: seçili çeyreğin tidy’deki tutarı (çıkarma yok)."
            }
          >
            <TsbSelect value={trendAnaBrans} onChange={(e) => setTrendAnaBrans(e.target.value)}>
              {trendSecenekleri.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Trend modu">
            <div className={cn(tsb.btnGroup, "mt-1")}>
              <TsbToggleButton
                pressed={trendModu === "ceyrek"}
                variant="segment"
                onClick={() => setTrendModu("ceyrek")}
              >
                Çeyrek bazlı
              </TsbToggleButton>
              <TsbToggleButton
                pressed={trendModu === "kumulatif"}
                variant="segment"
                onClick={() => setTrendModu("kumulatif")}
              >
                Kümülatif
              </TsbToggleButton>
            </div>
          </TsbFilterField>
        </TsbFilterGrid>
      </TsbFilterBar>

      {trend.length > 0 && (
        <div className="grid gap-4">
          <TrendChart
            title={`Son ${trend.length} çeyrek — ${secilenAd}`}
            subtitle={`${trendAnaBrans === TREND_TUM_BRANSLAR ? "Tüm branşlar" : trendAnaBrans} · ${trendModu === "kumulatif" ? "Kümülatif" : "Çeyrek bazlı"} · Teknik Gelir / Teknik Gider / TKZ`}
            seri={trend}
            side="sirket"
            trendModu={trendModu}
          />
          <TrendChart
            title={`Son ${trend.length} çeyrek — ${shortLabel(kiyasModu, kiyasBaslik)}`}
            subtitle={`${trendAnaBrans === TREND_TUM_BRANSLAR ? "Tüm branşlar" : trendAnaBrans} · ${trendModu === "kumulatif" ? "Kümülatif" : "Çeyrek bazlı"} · Sağ blok kıyas serisi`}
            seri={trend}
            side="kiyas"
            trendModu={trendModu}
          />
        </div>
      )}
    </div>
  );
}
