"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildSon12AyPrimTrend,
  kumulatifSeridenAylikUretim,
  type PrimTrend12Nokta,
  type PrimTrendAylikNokta,
  type PrimTrendFiltreModu,
  type PrimTrendFilter,
} from "@/lib/tsbPrimTrend12";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import {
  ANA_BRANS_FILTER_TRAFIK_HARIC,
  ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL,
  isTsbToplamSirketKodu,
  listSirketlerSegmentDonem,
  resolveDefaultSirketKodu,
  sirketSegmentFromKodu,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariForSegment,
} from "@/lib/tsbPrimDashboard";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
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

const KANALLAR: { value: TsbKanalField; label: string }[] = [
  { value: "genelToplam", label: "Tüm kanallar" },
  { value: "acente", label: "Acente" },
  { value: "banka", label: "Banka" },
  { value: "broker", label: "Broker" },
  { value: "diger", label: "Diğer" },
  { value: "merkez", label: "Merkez" },
];

const nfMn = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0, minimumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

const COL_SEKTOR = tsbChart.sektor;
const COL_SIRKET = tsbChart.sirketBrut;

const CHART_W = 800;
const CHART_H = 400;

function fmtMnLab(v: number): string {
  return nfMn.format(v / 1e6);
}

function logYScale(
  values: number[],
  innerH: number,
  padT: number,
): { yAt: (v: number) => number; tickVals: number[] } {
  const pos = values.filter((x) => x > 0);
  const maxRaw = Math.max(...values, 1);
  const floor = pos.length ? Math.min(...pos) * 0.28 : 1e6;
  const ceil = Math.max(maxRaw, floor * 5);
  const lo = Math.log10(Math.max(floor, 100));
  const hiL = Math.log10(Math.max(ceil, floor + 1));
  const span = hiL - lo || 1e-9;
  const yAt = (v: number) => {
    const vv = v <= 0 ? floor * 0.45 : Math.max(v, floor * 0.45);
    return padT + innerH - ((Math.log10(vv) - lo) / span) * innerH;
  };
  const tickVals = [0, 1 / 3, 2 / 3, 1].map((t) => Math.pow(10, lo + (hiL - lo) * t));
  return { yAt, tickVals };
}

function labelYAbove(y: number, padT: number, preferredOffset = 9): number {
  return y - preferredOffset < padT + 4 ? y + 13 : y - preferredOffset;
}

function TrendSvg({
  seri,
  sirketAdi,
  logOlcek,
}: {
  seri: PrimTrend12Nokta[];
  sirketAdi: string;
  logOlcek: boolean;
}) {
  const pad = { l: 76, r: 20, t: 56, b: 72 };
  const innerW = CHART_W - pad.l - pad.r;
  const innerH = CHART_H - pad.t - pad.b;

  const allRaw = seri.flatMap((p) => [p.sektor, p.sirket]);
  const maxRaw = Math.max(...allRaw, 1);

  let yAt: (v: number) => number;
  let tickVals: number[];

  if (!logOlcek) {
    const hi = maxRaw * 1.1;
    tickVals = [0, 1 / 3, 2 / 3, 1].map((t) => hi * t);
    yAt = (v: number) => pad.t + innerH - (Math.min(Math.max(v, 0), hi) / hi) * innerH;
  } else {
    ({ yAt, tickVals } = logYScale(allRaw, innerH, pad.t));
  }

  const n = seri.length;
  const xAt = (i: number) => pad.l + (i / Math.max(n - 1, 1)) * innerW;

  function bandBounds(i: number): [number, number] {
    if (n <= 1) return [pad.l, pad.l + innerW];
    const xi = xAt(i);
    const left = i === 0 ? pad.l : (xAt(i - 1) + xi) / 2;
    const right = i === n - 1 ? pad.l + innerW : (xi + xAt(i + 1)) / 2;
    return [left, right];
  }

  const ptsSektor = seri.map((p, i) => `${xAt(i)},${yAt(p.sektor)}`).join(" ");
  const ptsSirket = seri.map((p, i) => `${xAt(i)},${yAt(p.sirket)}`).join(" ");

  const adKisa = sirketAdi.length > 40 ? `${sirketAdi.slice(0, 38)}…` : sirketAdi;
  const plotClip = "prim-trend-plot-clip";

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="h-auto w-full max-w-full overflow-hidden"
      role="img"
      aria-label="Kümülatif prim trendi"
    >
      <defs>
        <clipPath id={plotClip}>
          <rect x={pad.l} y={pad.t} width={innerW} height={innerH} />
        </clipPath>
      </defs>
      <rect width={CHART_W} height={CHART_H} fill="#fafafa" />
      <text x={pad.l} y={22} fill="#374151" fontSize={12} fontWeight={600}>
        Kümülatif prim (Mn ₺){logOlcek ? " · logaritmik eksen" : " · doğrusal eksen"}
      </text>
      <text x={pad.l} y={38} fontSize={9}>
        <tspan fill={COL_SEKTOR} fontWeight={700}>
          Sektör
        </tspan>
        <tspan fill="#64748b"> — gri · </tspan>
        <tspan fill={COL_SIRKET} fontWeight={700}>
          {adKisa}
        </tspan>
        <tspan fill="#64748b"> — yeşil (üstte Mn ₺, altta pay %). Yıl içi kümülatif.</tspan>
      </text>

      {seri.map((p, i) => {
        const [left, right] = bandBounds(i);
        const w = Math.max(right - left, 0);
        const stripe = i % 2 === 0 ? "#fcfdfe" : "#f7f9fb";
        return (
          <rect
            key={`band-${p.donem}`}
            x={left}
            y={pad.t}
            width={w}
            height={innerH}
            fill={stripe}
            stroke="#eef2f6"
            strokeWidth={0.5}
          />
        );
      })}

      <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} stroke="#94a3b8" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#94a3b8" strokeWidth={1} />

      {tickVals.map((tv, ti) => {
        const y = yAt(tv);
        return (
          <g key={`tg-${ti}`}>
            <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} stroke="#eef2f6" strokeWidth={1} />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize={9}>
              {fmtMnLab(tv)}
            </text>
          </g>
        );
      })}

      <g clipPath={`url(#${plotClip})`}>
        <polyline fill="none" stroke={COL_SEKTOR} strokeWidth={2.2} points={ptsSektor} strokeLinejoin="round" />
        <polyline fill="none" stroke={COL_SIRKET} strokeWidth={2.2} points={ptsSirket} strokeLinejoin="round" />
        {seri.map((p, i) => (
          <g key={p.donem}>
            <circle cx={xAt(i)} cy={yAt(p.sektor)} r={3.25} fill={COL_SEKTOR} stroke="#fff" strokeWidth={1} />
            <circle cx={xAt(i)} cy={yAt(p.sirket)} r={3.25} fill={COL_SIRKET} stroke="#fff" strokeWidth={1} />
          </g>
        ))}
      </g>

      {seri.map((p, i) => {
        const xs = xAt(i);
        const ys = yAt(p.sektor);
        const yk = yAt(p.sirket);
        const payY = Math.min(yk + 16, pad.t + innerH + 28);
        return (
          <g key={`lab-${p.donem}`}>
            <text x={xs} y={labelYAbove(ys, pad.t)} textAnchor="middle" fill={COL_SEKTOR} fontSize={9} fontWeight={700}>
              {fmtMnLab(p.sektor)}
            </text>
            <text x={xs} y={labelYAbove(yk, pad.t)} textAnchor="middle" fill={COL_SIRKET} fontSize={9} fontWeight={700}>
              {fmtMnLab(p.sirket)}
            </text>
            <text x={xs} y={payY} textAnchor="middle" fill="#065f46" fontSize={9} fontWeight={600}>
              %{pf.format(p.payYuzde)}
            </text>
          </g>
        );
      })}

      {seri.map((p, i) => (
        <text key={`lx-${p.donem}`} x={xAt(i)} y={CHART_H - 16} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={600}>
          {p.donem}
        </text>
      ))}
    </svg>
  );
}

function AylikUretimBarSvg({ seri, sirketAdi }: { seri: PrimTrendAylikNokta[]; sirketAdi: string }) {
  const pad = { l: 76, r: 20, t: 52, b: 56 };
  const innerW = CHART_W - pad.l - pad.r;
  const innerH = CHART_H - pad.t - pad.b;
  const n = seri.length;
  const bandW = innerW / Math.max(n, 1);
  const barW = Math.min(bandW * 0.32, 22);
  const gap = 3;

  const allRaw = seri.flatMap((p) => [Math.max(p.sektorAylik, 0), Math.max(p.sirketAylik, 0)]);
  const { yAt, tickVals } = logYScale(allRaw, innerH, pad.t);
  const baseline = pad.t + innerH;

  const adKisa = sirketAdi.length > 40 ? `${sirketAdi.slice(0, 38)}…` : sirketAdi;

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="h-auto w-full max-w-full overflow-hidden"
      role="img"
      aria-label="Aylık prim üretimi"
    >
      <rect width={CHART_W} height={CHART_H} fill="#fafafa" />
      <text x={pad.l} y={22} fill="#374151" fontSize={12} fontWeight={600}>
        Aylık üretim (Mn ₺) · logaritmik eksen
      </text>
      <text x={pad.l} y={38} fontSize={9}>
        <tspan fill={COL_SEKTOR} fontWeight={700}>
          Sektör
        </tspan>
        <tspan fill="#64748b"> — gri sütun · </tspan>
        <tspan fill={COL_SIRKET} fontWeight={700}>
          {adKisa}
        </tspan>
        <tspan fill="#64748b"> — yeşil sütun. Kümülatif fark = o ayın primi (Ocak / yıl başı ayrı).</tspan>
      </text>

      <line x1={pad.l} y1={baseline} x2={pad.l + innerW} y2={baseline} stroke="#94a3b8" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={baseline} stroke="#94a3b8" strokeWidth={1} />

      {tickVals.map((tv, ti) => {
        const y = yAt(tv);
        return (
          <g key={`tg-bar-${ti}`}>
            <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} stroke="#eef2f6" strokeWidth={1} />
            <text x={pad.l - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize={9}>
              {fmtMnLab(tv)}
            </text>
          </g>
        );
      })}

      {seri.map((p, i) => {
        const cx = pad.l + bandW * i + bandW / 2;
        const xSek = cx - barW - gap / 2;
        const xSir = cx + gap / 2;
        const hSek = Math.max(baseline - yAt(Math.max(p.sektorAylik, 0)), p.sektorAylik > 0 ? 2 : 0);
        const hSir = Math.max(baseline - yAt(Math.max(p.sirketAylik, 0)), p.sirketAylik > 0 ? 2 : 0);
        const ySek = baseline - hSek;
        const ySir = baseline - hSir;
        return (
          <g key={p.donem}>
            <rect x={xSek} y={ySek} width={barW} height={hSek} fill={COL_SEKTOR} rx={1.5} opacity={0.92} />
            <rect x={xSir} y={ySir} width={barW} height={hSir} fill={COL_SIRKET} rx={1.5} opacity={0.92} />
            {p.sektorAylik > 0 && hSek > 14 && (
              <text x={xSek + barW / 2} y={ySek - 4} textAnchor="middle" fill={COL_SEKTOR} fontSize={8} fontWeight={700}>
                {fmtMnLab(p.sektorAylik)}
              </text>
            )}
            {p.sirketAylik > 0 && hSir > 14 && (
              <text x={xSir + barW / 2} y={ySir - 4} textAnchor="middle" fill={COL_SIRKET} fontSize={8} fontWeight={700}>
                {fmtMnLab(p.sirketAylik)}
              </text>
            )}
            <text x={cx} y={CHART_H - 16} textAnchor="middle" fill="#334155" fontSize={9} fontWeight={600}>
              {p.donem}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function TsbPrimTrend12Dashboard() {
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<TsbSektorSegment>("hayatdisi");
  const [donemBitis, setDonemBitis] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [anaBrans, setAnaBrans] = useState("");
  const [filtreModu, setFiltreModu] = useState<PrimTrendFiltreModu>("anaBransH");
  const [tarifeSecim, setTarifeSecim] = useState("");
  const branchLookup = useTsbBranchLookupFetch();
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [logOlcek, setLogOlcek] = useState(true);

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
  const secilenBitis = donemBitis || sonDonem;

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [segment]);

  useEffect(() => {
    setAnaBrans("");
    setTarifeSecim("");
  }, [filtreModu]);

  const anaBransSecenekleri = useMemo(() => {
    if (!rows || !secilenBitis) return [];
    return uniqueAnaBransForSegment(rows, secilenBitis, segment);
  }, [rows, secilenBitis, segment]);

  const anaFiltre = anaBrans === "" ? null : anaBrans;

  const tarifeSecenekleri = useMemo(() => {
    if (!rows || !secilenBitis) return [];
    return uniqueTarifeGruplariForSegment(rows, secilenBitis, segment, branchLookup);
  }, [rows, secilenBitis, segment, branchLookup]);

  useEffect(() => {
    if (filtreModu !== "tarifeGrubu" || tarifeSecim === "") return;
    if (tarifeSecim === TARIFE_GRUBU_FILTER_TRAFIK_HARIC) return;
    if (!tarifeSecenekleri.includes(tarifeSecim)) setTarifeSecim("");
  }, [filtreModu, tarifeSecim, tarifeSecenekleri]);

  const trendFilter = useMemo((): PrimTrendFilter => {
    if (filtreModu === "anaBransH") return { kind: "anaBransH", anaBransH: anaFiltre };
    return { kind: "tarifeGrubu", tarifeGrubu: tarifeSecim === "" ? null : tarifeSecim, lookup: branchLookup };
  }, [filtreModu, anaFiltre, tarifeSecim, branchLookup]);

  const sirketler = useMemo(() => {
    if (!rows || !secilenBitis) return [];
    return listSirketlerSegmentDonem(rows, secilenBitis, kanal, segment, trendFilter);
  }, [rows, secilenBitis, kanal, segment, trendFilter]);

  useEffect(() => {
    if (sirketler.length === 0) return;
    if (sirketKodu === "" || !sirketler.some((s) => s.kod === sirketKodu)) {
      const kod = resolveDefaultSirketKodu(sirketler, segment);
      if (kod !== null) setSirketKodu(kod);
    }
  }, [sirketler, sirketKodu, segment]);

  const effectiveSirket = useMemo(() => {
    if (sirketler.length === 0) return null;
    if (sirketKodu !== "" && sirketler.some((s) => s.kod === sirketKodu)) return sirketKodu as number;
    return resolveDefaultSirketKodu(sirketler, segment);
  }, [sirketler, sirketKodu, segment]);

  const sirketAdi = useMemo(() => {
    if (effectiveSirket === null) return "";
    return sirketler.find((s) => s.kod === effectiveSirket)?.ad ?? "";
  }, [sirketler, effectiveSirket]);

  const primSegment =
    rows && effectiveSirket !== null ? sirketSegmentFromKodu(rows, effectiveSirket) : segment;
  const { kayit: olcekKayit, finDonem: olcekFinDonem, yukleniyor: olcekYukleniyor } = useOlcekSegmentKayit(
    effectiveSirket !== null && secilenBitis
      ? {
          kaynak: "prim",
          donem: secilenBitis,
          segment: primSegment,
          sirketKodu: effectiveSirket,
          sirketAdi,
        }
      : null,
  );

  const seri = useMemo(() => {
    if (!rows || effectiveSirket === null) return null;
    return buildSon12AyPrimTrend(rows, donemler, secilenBitis, kanal, segment, effectiveSirket, trendFilter);
  }, [rows, donemler, secilenBitis, kanal, segment, effectiveSirket, trendFilter]);

  const seriAylik = useMemo(() => (seri && seri.length > 0 ? kumulatifSeridenAylikUretim(seri) : null), [seri]);

  const tumBransLabel =
    segment === "hayatdisi" ? "Tüm ana branşlar (hayat dışı)" : "Tüm ana branşlar (hayat–emeklilik)";
  const tumTarifeLabel = "Tüm tarife grupları";

  if (error) return <TsbError message={error} />;
  if (!rows) return <TsbLoading />;

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
        <p className={tsb.filterSectionLabel}>Branş filtresi türü</p>
        <div className={cn(tsb.btnGroup, "mb-3")}>
          <TsbToggleButton pressed={filtreModu === "anaBransH"} onClick={() => setFiltreModu("anaBransH")}>
            Ana branş (TSB)
          </TsbToggleButton>
          <TsbToggleButton pressed={filtreModu === "tarifeGrubu"} onClick={() => setFiltreModu("tarifeGrubu")}>
            Tarife grubu
          </TsbToggleButton>
        </div>
        <p className={tsb.filterSectionLabel}>Eksen</p>
        <div className={cn(tsb.btnGroup, "mb-2")}>
          <TsbToggleButton pressed={logOlcek} onClick={() => setLogOlcek(true)}>
            Logaritmik (önerilen)
          </TsbToggleButton>
          <TsbToggleButton pressed={!logOlcek} onClick={() => setLogOlcek(false)}>
            Doğrusal
          </TsbToggleButton>
        </div>
        <p className={tsb.filterHint}>
          Seçtiğiniz <strong>bitiş ayına</strong> kadar geriye dönük en fazla <strong>12 ay</strong>. Üst grafik{" "}
          <strong>yıl içi kümülatif</strong> prim; alt grafik <strong>aylık üretim</strong> (ardışık aylar arası fark).
          Sektör <strong className="text-slate-600">gri</strong>, şirket{" "}
          <strong className="text-emerald-700">yeşil</strong>.
        </p>
      </TsbFilterBar>

      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField label="Bitiş ayı (pencerenin sonu)">
            <TsbSelect value={secilenBitis} onChange={(e) => setDonemBitis(e.target.value)}>
              {donemler.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Kanal">
            <TsbSelect value={kanal} onChange={(e) => setKanal(e.target.value as TsbKanalField)}>
              {KANALLAR.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label={filtreModu === "anaBransH" ? "Ana branş filtresi" : "Tarife grubu filtresi"}>
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
                <option value="">{tumTarifeLabel}</option>
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
          <TsbFilterField label="Şirket (yeşil çizgi)" className="sm:col-span-2 lg:col-span-4">
            <TsbSelect
              className={tsb.selectWide}
              value={effectiveSirket !== null ? String(effectiveSirket) : ""}
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

      {sirketAdi ? (
        <TsbOlcekSegmentRozeti sirketAdi={sirketAdi} kayit={olcekKayit} finDonem={olcekFinDonem} yukleniyor={olcekYukleniyor} />
      ) : null}

      {seri && seri.length > 0 && seriAylik && sirketAdi && (
        <>
          <div className={tsb.chartPanel}>
            <TrendSvg seri={seri} sirketAdi={sirketAdi} logOlcek={logOlcek} />
          </div>
          <div className={tsb.chartPanel}>
            <AylikUretimBarSvg seri={seriAylik} sirketAdi={sirketAdi} />
          </div>
          <TsbTableShell>
            <table className={cn(tsb.table, "min-w-[720px]")}>
              <thead className={tsb.thead}>
                <tr>
                  <th className={tsb.th}>Dönem</th>
                  <th className={tsb.thRight}>Sektör küm. (Mn ₺)</th>
                  <th className={tsb.thRight}>Şirket küm. (Mn ₺)</th>
                  <th className={tsb.thRight}>Pay % (küm.)</th>
                  <th className={tsb.thRight}>Sektör aylık (Mn ₺)</th>
                  <th className={tsb.thRight}>Şirket aylık (Mn ₺)</th>
                  <th className={tsb.thRight}>Pay % (aylık)</th>
                </tr>
              </thead>
              <tbody>
                {seri.map((p, i) => {
                  const a = seriAylik[i];
                  return (
                    <tr key={p.donem} className={tsb.tbodyRow}>
                      <td className={cn(tsb.td, "font-medium")}>{p.donem}</td>
                      <td className={cn(tsb.td, "text-right text-slate-600")}>{nfMn.format(p.sektor / 1e6)}</td>
                      <td className={cn(tsb.td, "text-right text-emerald-800")}>{nfMn.format(p.sirket / 1e6)}</td>
                      <td className={cn(tsb.td, "text-right")}>{pf.format(p.payYuzde)}</td>
                      <td className={cn(tsb.td, "text-right text-slate-600")}>{nfMn.format(a.sektorAylik / 1e6)}</td>
                      <td className={cn(tsb.td, "text-right text-emerald-800")}>{nfMn.format(a.sirketAylik / 1e6)}</td>
                      <td className={cn(tsb.td, "text-right")}>{pf.format(a.payYuzde)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TsbTableShell>
        </>
      )}
    </div>
  );
}
