"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveDefaultSirketKodu } from "@/lib/tsbPrimDashboard";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import { listSirketleriGelirDonemForPool, oncekiYilDonem } from "@/lib/tsbFinansalKarsilastirmaData";
import {
  buildHasarPrimTablosu,
  buildHasarPrimTrend,
  hasarPrimKiyasOzet,
  hpPpFark,
  listHpBransApForPool,
  sonNCeyrekDonemler,
  type HasarPrimKiyasHedef,
  type HasarPrimTabloSatir,
} from "@/lib/tsbHasarPrimHpDashboard";
import { hasarPrimOranlariDetayFromLookup } from "@/lib/tsbHasarPrimOrani";
import { buildGelirTidyDonemLookup } from "@/lib/tsbSirketSegmentSkor";
import { fetchGelirTidyDonemIndex, fetchGelirTidyDonemler } from "@/lib/tsbGelirTidyFetch";
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
  tsbFormatPp,
} from "@/components/tsb/tsbDashboardUi";

const POOL_LABELS: Record<SegmentSkorPool, string> = {
  HD: "Hayat dışı (HD)",
  HAYAT_EMEKLILIK: "Hayat / Emeklilik",
};

const HAYATDISI = "HAYATDISI";

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function defaultSirketModForPool(pool: SegmentSkorPool): "hayatdisi" | "hayat" {
  return pool === "HD" ? "hayatdisi" : "hayat";
}

/** H/P artışı kötü (kırmızı), düşüşü iyi (yeşil). */
function hpDeltaRenk(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "text-slate-400";
  if (v < 0) return "text-emerald-800 font-semibold bg-emerald-50";
  if (v > 0) return "text-red-700 font-semibold bg-red-50";
  return "text-amber-700 font-semibold bg-amber-50";
}

function fmtHp(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return `${pf.format(v * 100)}%`;
}

function HpHucre({ v, vurgu }: { v: number | null; vurgu?: boolean }) {
  return (
    <td className={cn(tsb.td, "text-right tabular-nums", vurgu && "font-semibold text-slate-900")}>{fmtHp(v)}</td>
  );
}

function OzetKart({
  baslik,
  brutDahil,
  netDahil,
  brutHaric,
  netHaric,
  vurgu,
}: {
  baslik: string;
  brutDahil: number | null;
  netDahil: number | null;
  brutHaric: number | null;
  netHaric: number | null;
  vurgu?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border px-3 py-2.5", vurgu ? "border-emerald-200 bg-emerald-50/40" : "border-slate-200 bg-white")}>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{baslik}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span className="text-slate-500">Brüt · DERK dahil</span>
        <span className="text-right font-medium tabular-nums">{fmtHp(brutDahil)}</span>
        <span className="text-slate-500">Net · DERK dahil</span>
        <span className="text-right font-medium tabular-nums">{fmtHp(netDahil)}</span>
        <span className="text-slate-500">Brüt · DERK hariç</span>
        <span className="text-right font-medium tabular-nums">{fmtHp(brutHaric)}</span>
        <span className="text-slate-500">Net · DERK hariç</span>
        <span className="text-right font-medium tabular-nums">{fmtHp(netHaric)}</span>
      </div>
    </div>
  );
}

function TrendCizgi({
  noktalar,
  alan,
  renk,
}: {
  noktalar: { donem: string; v: number | null }[];
  alan: string;
  renk: string;
}) {
  const gecerli = noktalar.filter((n) => n.v !== null && Number.isFinite(n.v));
  if (gecerli.length < 2) return null;
  const w = 640;
  const h = 160;
  const pad = { l: 44, r: 12, t: 16, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const vals = gecerli.map((n) => n.v!);
  const minV = Math.min(...vals) * 100;
  const maxV = Math.max(...vals) * 100;
  const span = maxV - minV || 1;
  const pts = gecerli.map((n, i) => {
    const x = pad.l + (i / (gecerli.length - 1)) * innerW;
    const y = pad.t + innerH - ((n.v! * 100 - minV) / span) * innerH;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-2xl" aria-label={`${alan} trend`}>
      <polyline fill="none" stroke={renk} strokeWidth={2} points={pts.join(" ")} />
      {gecerli.map((n, i) => {
        const x = pad.l + (i / (gecerli.length - 1)) * innerW;
        const y = pad.t + innerH - ((n.v! * 100 - minV) / span) * innerH;
        return (
          <g key={n.donem}>
            <circle cx={x} cy={y} r={3} fill={renk} />
            <text x={x} y={h - 6} textAnchor="middle" className="fill-slate-500 text-[9px]">
              {n.donem}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function TsbHasarPrimDashboard() {
  const [tumDonemler, setTumDonemler] = useState<string[]>([]);
  const [rows, setRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<SegmentSkorPool>("HD");
  const [donem, setDonem] = useState("");
  const [bransAp, setBransAp] = useState(HAYATDISI);
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [kiyasModu, setKiyasModu] = useState<"sektor" | "sirket">("sektor");
  const [kiyasSirketKodu, setKiyasSirketKodu] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;
    fetchGelirTidyDonemIndex()
      .then((d) => {
        if (cancelled) return;
        setTumDonemler(d);
        if (d.length > 0) setDonem((prev) => (prev && d.includes(prev) ? prev : d[d.length - 1]));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Dönem listesi yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trendDonemler = useMemo(
    () => (donem ? sonNCeyrekDonemler(tumDonemler, donem, 8) : []),
    [tumDonemler, donem],
  );

  const donemOnceki = useMemo(() => (donem ? oncekiYilDonem(donem) : null), [donem]);

  useEffect(() => {
    if (!donem || tumDonemler.length === 0) return;
    const yuklenecek = [...new Set([...trendDonemler, donem, donemOnceki].filter(Boolean) as string[])];
    let cancelled = false;
    setRows(null);
    fetchGelirTidyDonemler(yuklenecek)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Veri yüklenemedi");
      });
    return () => {
      cancelled = true;
    };
  }, [donem, donemOnceki, trendDonemler, tumDonemler]);

  const bransSecenekleri = useMemo(() => {
    if (!rows || !donem) return [];
    return listHpBransApForPool(rows, donem, pool);
  }, [rows, donem, pool]);

  useEffect(() => {
    if (bransSecenekleri.length === 0) return;
    if (bransSecenekleri.some((b) => b.value === bransAp)) return;
    const varsayilan = bransSecenekleri.find((b) => b.value === HAYATDISI)?.value ?? bransSecenekleri[0].value;
    setBransAp(varsayilan);
  }, [bransSecenekleri, bransAp, pool]);

  useEffect(() => {
    setBransAp(pool === "HD" ? HAYATDISI : "HAYAT");
  }, [pool]);

  const sirketListesi = useMemo(() => {
    if (!rows || !donem) return [];
    return listSirketleriGelirDonemForPool(rows, donem, pool);
  }, [rows, donem, pool]);

  useEffect(() => {
    if (sirketListesi.length === 0) return;
    const halaListede = sirketListesi.some((s) => s.kod === sirketKodu);
    if (halaListede) return;
    const kod = resolveDefaultSirketKodu(sirketListesi, defaultSirketModForPool(pool));
    if (kod !== null) setSirketKodu(kod);
  }, [sirketListesi, pool, sirketKodu]);

  const kiyasListe = useMemo(
    () => sirketListesi.filter((s) => s.kod !== sirketKodu),
    [sirketListesi, sirketKodu],
  );

  const kiyasHedef: HasarPrimKiyasHedef = useMemo(() => {
    if (kiyasModu === "sektor") return { mod: "sektor" };
    if (kiyasSirketKodu === "") return { mod: "sektor" };
    return { mod: "sirket", sirketKodu: kiyasSirketKodu };
  }, [kiyasModu, kiyasSirketKodu]);

  useEffect(() => {
    if (kiyasModu !== "sirket" || kiyasListe.length === 0) return;
    if (kiyasListe.some((s) => s.kod === kiyasSirketKodu)) return;
    setKiyasSirketKodu(kiyasListe[0].kod);
  }, [kiyasModu, kiyasListe, kiyasSirketKodu]);

  const tablo = useMemo(() => {
    if (!rows || !donem) return [];
    return buildHasarPrimTablosu(rows, donem, pool, bransAp);
  }, [rows, donem, pool, bransAp]);

  const secilenSatir = useMemo(
    () => tablo.find((s) => s.sirketKodu === sirketKodu),
    [tablo, sirketKodu],
  );

  const kiyasOzet = useMemo(() => {
    if (!rows || !donem) return null;
    return hasarPrimKiyasOzet(rows, donem, pool, bransAp, kiyasHedef, sirketListesi);
  }, [rows, donem, pool, bransAp, kiyasHedef, sirketListesi]);

  const secilenAd =
    sirketListesi.find((s) => s.kod === sirketKodu)?.ad ??
    (sirketKodu === "" ? "" : `Şirket ${sirketKodu}`);

  const onceYilVarMi = !!(donemOnceki && tumDonemler.includes(donemOnceki));

  const trend = useMemo(() => {
    if (!rows || sirketKodu === "" || trendDonemler.length === 0) return [];
    return buildHasarPrimTrend(rows, trendDonemler, sirketKodu, bransAp);
  }, [rows, sirketKodu, trendDonemler, bransAp]);

  if (error) return <TsbError message={error} />;
  if (!rows || !donem || sirketKodu === "") return <TsbLoading message="Hasar / prim verisi yükleniyor…" />;

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField label="Havuz">
            <div className={tsb.btnGroup}>
              {(["HD", "HAYAT_EMEKLILIK"] as const).map((p) => (
                <TsbToggleButton key={p} pressed={pool === p} onClick={() => setPool(p)}>
                  {POOL_LABELS[p]}
                </TsbToggleButton>
              ))}
            </div>
          </TsbFilterField>
          <TsbFilterField label="Dönem (çeyrek)">
            <TsbSelect value={donem} onChange={(e) => setDonem(e.target.value)}>
              {[...tumDonemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Branş">
            <TsbSelect className={tsb.selectWide} value={bransAp} onChange={(e) => setBransAp(e.target.value)}>
              {bransSecenekleri.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Odak şirket">
            <TsbSelect className={tsb.selectWide} value={String(sirketKodu)} onChange={(e) => setSirketKodu(Number(e.target.value))}>
              {sirketListesi.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.kod} — {s.ad}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
        </TsbFilterGrid>
        <p className={tsb.filterHint}>
          TSB H/P pivotu ile uyumlu: <strong>Genel (hayat dışı)</strong> = Excel GENEL sayfası; branş seçimi tek{" "}
          <code className="text-[10px]">bransAp</code> dilimidir (branşları toplamayın). Dört oran: brüt/net × DERK dahil/hariç.
        </p>
      </TsbFilterBar>

      {secilenSatir && kiyasOzet && (
        <div className="grid gap-3 lg:grid-cols-2">
          <OzetKart
            baslik={secilenAd}
            brutDahil={secilenSatir.hp.brutHasarPrimOrani}
            netDahil={secilenSatir.hp.netHasarPrimOrani}
            brutHaric={secilenSatir.hp.brutDerkHaric}
            netHaric={secilenSatir.hp.netDerkHaric}
            vurgu
          />
          <OzetKart
            baslik={kiyasOzet.baslik}
            brutDahil={kiyasOzet.hp.brutHasarPrimOrani}
            netDahil={kiyasOzet.hp.netHasarPrimOrani}
            brutHaric={kiyasOzet.hp.brutDerkHaric}
            netHaric={kiyasOzet.hp.netDerkHaric}
          />
        </div>
      )}

      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField label="Sağ blok kıyası">
            <div className={tsb.btnGroup}>
              <TsbToggleButton pressed={kiyasModu === "sektor"} onClick={() => setKiyasModu("sektor")}>
                Sektör toplamı
              </TsbToggleButton>
              <TsbToggleButton pressed={kiyasModu === "sirket"} onClick={() => setKiyasModu("sirket")}>
                Diğer şirket
              </TsbToggleButton>
            </div>
          </TsbFilterField>
          {kiyasModu === "sirket" && (
            <TsbFilterField label="Kıyas şirketi">
              <TsbSelect className={tsb.selectWide} value={String(kiyasSirketKodu)} onChange={(e) => setKiyasSirketKodu(Number(e.target.value))}>
                {kiyasListe.map((s) => (
                  <option key={s.kod} value={s.kod}>
                    {s.kod} — {s.ad}
                  </option>
                ))}
              </TsbSelect>
            </TsbFilterField>
          )}
        </TsbFilterGrid>
      </TsbFilterBar>

      {trend.length >= 2 && (
        <div className={tsb.chartPanel}>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Son {trend.length} çeyrek — {secilenAd} · brüt H/P (DERK dahil)
          </h3>
          <TrendCizgi
            noktalar={trend.map((t) => ({ donem: t.donem, v: t.brutDerkDahil }))}
            alan="Brüt H/P"
            renk="#059669"
          />
        </div>
      )}

      <div className={tsb.dataPanel}>
        <div className={tsb.dataPanelHeader}>
          <h3 className={tsb.dataPanelTitle}>
            Sektör sıralaması — {POOL_LABELS[pool]} ·{" "}
            {bransSecenekleri.find((b) => b.value === bransAp)?.label ?? bransAp} · {donem}
          </h3>
          <p className={tsb.caption}>Sıra brüt H/P (DERK dahil), düşükten yükseğe.</p>
        </div>
        <TsbTableShell>
        <table className={tsb.tableDense}>
          <thead className={tsb.thead}>
            <tr>
              <th className={cn(tsb.thSticky, "w-10")}>Sıra</th>
              <th className={cn(tsb.thSticky, "min-w-[11rem]")}>Şirket</th>
              <th className={tsb.thRight}>Kaz. prim (brüt)</th>
              <th className={tsb.thRight}>Gerç. hasar (brüt)</th>
              <th className={tsb.thRight} colSpan={2}>
                DERK dahil
              </th>
              <th className={tsb.thRight} colSpan={2}>
                DERK hariç
              </th>
              {onceYilVarMi && (
                <th className={tsb.thRight} title="Önceki yıl aynı çeyrek · brüt DERK dahil">
                  YoY Δ
                </th>
              )}
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className={tsb.thSticky} colSpan={4} />
              <th className={tsb.thRight}>Brüt</th>
              <th className={tsb.thRight}>Net</th>
              <th className={tsb.thRight}>Brüt</th>
              <th className={tsb.thRight}>Net</th>
              {onceYilVarMi && <th className={tsb.thRight}>pp</th>}
            </tr>
          </thead>
          <tbody>
            {tablo.map((satir) => (
              <TabloSatiri
                key={satir.sirketKodu}
                satir={satir}
                vurgu={satir.sirketKodu === sirketKodu}
                onceYilVarMi={onceYilVarMi}
                rows={rows}
                donemOnceki={donemOnceki}
                bransAp={bransAp}
              />
            ))}
          </tbody>
        </table>
        </TsbTableShell>
      </div>
    </div>
  );
}

function TabloSatiri({
  satir,
  vurgu,
  onceYilVarMi,
  rows,
  donemOnceki,
  bransAp,
}: {
  satir: HasarPrimTabloSatir;
  vurgu: boolean;
  onceYilVarMi: boolean;
  rows: TsbGelirTidyRowLike[];
  donemOnceki: string | null;
  bransAp: string;
}) {
  const yoy = useMemo(() => {
    if (!onceYilVarMi || !donemOnceki) return null;
    const lookup = buildGelirTidyDonemLookup(rows, donemOnceki);
    const once = hasarPrimOranlariDetayFromLookup(lookup, satir.sirketKodu, { bransAp });
    return hpPpFark(satir.hp.brutHasarPrimOrani, once.brutHasarPrimOrani);
  }, [onceYilVarMi, donemOnceki, rows, satir, bransAp]);

  const rowCls = vurgu ? "bg-emerald-50/60 ring-1 ring-inset ring-emerald-200/80" : "";

  return (
    <tr className={cn(tsb.tbodyRowDense, rowCls)}>
      <td className={cn(tsb.tdSticky, "tabular-nums", vurgu && "bg-emerald-50/60")}>{satir.sira}</td>
      <td className={cn(tsb.tdSticky, "whitespace-nowrap", vurgu && "bg-emerald-50/60 font-medium")}>
        <span className="text-slate-500">{satir.sirketKodu}</span> {satir.sirketAdi}
      </td>
      <td className={cn(tsb.td, "text-right tabular-nums text-slate-600")}>{nf.format(satir.hp.kazanilmisPrimBrut)}</td>
      <td className={cn(tsb.td, "text-right tabular-nums text-slate-600")}>{nf.format(-satir.hp.gerceklesenHasarBrut)}</td>
      <HpHucre v={satir.hp.brutHasarPrimOrani} vurgu={vurgu} />
      <HpHucre v={satir.hp.netHasarPrimOrani} />
      <HpHucre v={satir.hp.brutDerkHaric} />
      <HpHucre v={satir.hp.netDerkHaric} />
      {onceYilVarMi && (
        <td className={cn(tsb.td, "text-right tabular-nums", hpDeltaRenk(yoy))}>{tsbFormatPp(yoy)}</td>
      )}
    </tr>
  );
}
