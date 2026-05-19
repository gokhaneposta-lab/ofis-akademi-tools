"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildSon12AyPrimTrend,
  type PrimTrend12Nokta,
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
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC,
  TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL,
  uniqueAnaBransForSegment,
  uniqueSortedPeriods,
  uniqueTarifeGruplariForSegment,
} from "@/lib/tsbPrimDashboard";
import { useTsbBranchLookupFetch } from "@/components/tsb/useTsbBranchLookup";
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

const COL_SEKTOR = "#dc2626";
const COL_SIRKET = "#059669";

function fmtMnLab(v: number): string {
  return nfMn.format(v / 1e6);
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
  const W = 780;
  const H = 380;
  const pad = { l: 60, r: 28, t: 44, b: 62 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const allRaw = seri.flatMap((p) => [p.sektor, p.sirket]);
  const maxRaw = Math.max(...allRaw, 1);

  let yAt: (v: number) => number;
  let tickVals: number[];

  if (!logOlcek) {
    const hi = maxRaw * 1.08;
    tickVals = [0, 1 / 3, 2 / 3, 1].map((t) => hi * t);
    yAt = (v: number) => pad.t + innerH - (Math.min(Math.max(v, 0), hi) / hi) * innerH;
  } else {
    const pos = allRaw.filter((x) => x > 0);
    const floor = pos.length ? Math.min(...pos) * 0.28 : 1e6;
    const ceil = Math.max(maxRaw, floor * 5);
    const lo = Math.log10(Math.max(floor, 100));
    const hiL = Math.log10(Math.max(ceil, floor + 1));
    const span = hiL - lo || 1e-9;
    yAt = (v: number) => {
      const vv = v <= 0 ? floor * 0.45 : Math.max(v, floor * 0.45);
      return pad.t + innerH - (Math.log10(vv) - lo) / span * innerH;
    };
    tickVals = [0, 1 / 3, 2 / 3, 1].map((t) => Math.pow(10, lo + (hiL - lo) * t));
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

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-full" role="img" aria-label="Son dönem prim trendi">
      <rect width={W} height={H} fill="#fafafa" />
      <text x={pad.l} y={24} fill="#374151" fontSize={14} fontWeight={600}>
        Aylık prim (Mn ₺){logOlcek ? " · logaritmik eksen" : " · doğrusal eksen"}
      </text>
      <text x={pad.l} y={40} fontSize={11}>
        <tspan fill={COL_SEKTOR} fontWeight={700}>
          Sektör
        </tspan>
        <tspan fill="#64748b"> — kırmızı çizgi · </tspan>
        <tspan fill={COL_SIRKET} fontWeight={700}>
          {adKisa}
        </tspan>
        <tspan fill="#64748b"> — yeşil çizgi (üstte Mn ₺, altta pay %)</tspan>
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
            <text x={pad.l - 6} y={y + 4} textAnchor="end" fill="#64748b" fontSize={11}>
              {fmtMnLab(tv)}
            </text>
          </g>
        );
      })}

      <polyline fill="none" stroke={COL_SEKTOR} strokeWidth={2.35} points={ptsSektor} strokeLinejoin="round" />
      <polyline fill="none" stroke={COL_SIRKET} strokeWidth={2.35} points={ptsSirket} strokeLinejoin="round" />

      {seri.map((p, i) => (
        <g key={p.donem}>
          <circle cx={xAt(i)} cy={yAt(p.sektor)} r={3.5} fill={COL_SEKTOR} stroke="#fff" strokeWidth={1} />
          <circle cx={xAt(i)} cy={yAt(p.sirket)} r={3.5} fill={COL_SIRKET} stroke="#fff" strokeWidth={1} />
        </g>
      ))}

      {seri.map((p, i) => {
        const xs = xAt(i);
        const ys = yAt(p.sektor);
        const yk = yAt(p.sirket);
        return (
          <g key={`lab-${p.donem}`}>
            <text x={xs} y={ys - 11} textAnchor="middle" fill={COL_SEKTOR} fontSize={10} fontWeight={700}>
              {fmtMnLab(p.sektor)}
            </text>
            <text x={xs} y={yk - 11} textAnchor="middle" fill={COL_SIRKET} fontSize={10} fontWeight={700}>
              {fmtMnLab(p.sirket)}
            </text>
            <text x={xs} y={yk + 15} textAnchor="middle" fill="#065f46" fontSize={10} fontWeight={600}>
              %{pf.format(p.payYuzde)}
            </text>
          </g>
        );
      })}

      {seri.map((p, i) => (
        <text key={`lx-${p.donem}`} x={xAt(i)} y={H - 18} textAnchor="middle" fill="#334155" fontSize={10} fontWeight={600}>
          {p.donem}
        </text>
      ))}
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

  const seri = useMemo(() => {
    if (!rows || effectiveSirket === null) return null;
    return buildSon12AyPrimTrend(rows, donemler, secilenBitis, kanal, segment, effectiveSirket, trendFilter);
  }, [rows, donemler, secilenBitis, kanal, segment, effectiveSirket, trendFilter]);

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
          Seçtiğiniz <strong>bitiş ayına</strong> kadar geriye dönük en fazla <strong>12 ay</strong>. Sektör{" "}
          <strong className="text-red-600">kırmızı</strong>, şirket <strong className="text-emerald-700">yeşil</strong>.
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

      {seri && seri.length > 0 && sirketAdi && (
        <>
          <div className={tsb.chartPanel}>
            <TrendSvg seri={seri} sirketAdi={sirketAdi} logOlcek={logOlcek} />
          </div>
          <TsbTableShell>
            <table className={tsb.table}>
              <thead className={tsb.thead}>
                <tr>
                  <th className={tsb.th}>Dönem</th>
                  <th className={tsb.thRight}>Sektör (Mn ₺)</th>
                  <th className={tsb.thRight}>Şirket (Mn ₺)</th>
                  <th className={tsb.thRight}>Şirket payı (%)</th>
                </tr>
              </thead>
              <tbody>
                {seri.map((p) => (
                  <tr key={p.donem} className={tsb.tbodyRow}>
                    <td className={cn(tsb.td, "font-medium")}>{p.donem}</td>
                    <td className={cn(tsb.td, "text-right text-slate-600")}>{nfMn.format(p.sektor / 1e6)}</td>
                    <td className={cn(tsb.td, "text-right text-emerald-800")}>{nfMn.format(p.sirket / 1e6)}</td>
                    <td className={cn(tsb.td, "text-right")}>{pf.format(p.payYuzde)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TsbTableShell>
        </>
      )}
    </div>
  );
}
