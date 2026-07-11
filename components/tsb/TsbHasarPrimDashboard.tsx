"use client";

import { useEffect, useMemo, useState } from "react";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";
import type { SegmentSkorPool } from "@/lib/tsbSirketSegmentSkor";
import { listSirketleriGelirDonemForPool, oncekiYilDonem } from "@/lib/tsbFinansalKarsilastirmaData";
import {
  buildHasarPrimTablosu,
  buildHasarPrimTrend,
  buildHasarPrimSektorTrend,
  hasarPrimKiyasOzet,
  hpPpFark,
  listHpBransApForPool,
  sonNCeyrekDonemler,
  type HasarPrimKirisum,
  type HasarPrimKiyasHedef,
  type HasarPrimTabloSatir,
} from "@/lib/tsbHasarPrimHpDashboard";
import {
  hpTarifeNotu,
  listHpTarifeGrubuForPool,
  type HpKirisumModu,
} from "@/lib/tsbHpTarifeBrans";
import { hasarPrimOranlariDetayFromLookup } from "@/lib/tsbHasarPrimOrani";
import { buildGelirTidyDonemLookup } from "@/lib/tsbSirketSegmentSkor";
import { fetchGelirTidyDonemIndex, fetchGelirTidyDonemler } from "@/lib/tsbGelirTidyFetch";
import {
  applyUrlSirketOrDefault,
  useTsbDashboardUrlPrefs,
} from "@/components/tsb/useTsbDashboardUrlPrefs";
import TsbKiyasModuControls from "@/components/tsb/TsbKiyasModuControls";
import TsbOlcekSegmentRozeti from "@/components/tsb/TsbOlcekSegmentRozeti";
import { useOlcekSegmentKayit } from "@/components/tsb/useOlcekSegmentKayit";
import { kiyasHedefFromModu, type TsbKiyasModu } from "@/lib/tsbKiyasHedef";
import {
  cn,
  tsb,
  tsbChart,
  TsbError,
  TsbFilterBar,
  TsbFilterField,
  TsbFilterGrid,
  TsbInsights,
  type TsbInsightItem,
  TsbLoading,
  TsbSelect,
  TsbTableShell,
  TsbToggleButton,
  tsbFormatPp,
  tsbHpDeltaRenk,
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

function fmtHp(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return `${pf.format(v * 100)}%`;
}

function HpHucre({ v, vurgu }: { v: number | null; vurgu?: boolean }) {
  return (
    <td className={cn(tsb.td, "text-right tabular-nums whitespace-nowrap", vurgu && "font-semibold text-slate-900")}>
      {fmtHp(v)}
    </td>
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

const COL_BRUT = tsbChart.sirketBrut;
const COL_NET = tsbChart.sirketNet;
const COL_SEKTOR = tsbChart.sektor;

function fmtHpKisa(v: number): string {
  return `${pf.format(v * 100)}%`;
}

type HpTrendSeriNokta = { donem: string; v: number | null };

function HpTrendGrafik({
  donemler,
  sirketBrut,
  sirketNet,
  sektorBrut,
  kirisumAd,
}: {
  donemler: string[];
  sirketBrut: HpTrendSeriNokta[];
  sirketNet: HpTrendSeriNokta[];
  sektorBrut: HpTrendSeriNokta[];
  kirisumAd: string;
}) {
  const n = donemler.length;
  if (n < 2) return null;

  const tumDegerler: number[] = [];
  for (const seri of [sirketBrut, sirketNet, sektorBrut]) {
    for (const p of seri) {
      if (p.v !== null && Number.isFinite(p.v)) tumDegerler.push(p.v * 100);
    }
  }
  if (tumDegerler.length < 2) return null;

  const rawMin = Math.min(...tumDegerler);
  const rawMax = Math.max(...tumDegerler);
  const padY = Math.max(3, (rawMax - rawMin) * 0.1 || 3);
  const minV = Math.max(0, rawMin - padY);
  const maxV = rawMax + padY;
  const span = maxV - minV || 1;

  const perGroup = 88;
  const w = Math.max(720, n * perGroup + 72);
  const h = 260;
  const pad = { l: 48, r: 24, t: 24, b: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const yBase = pad.t + innerH;

  const groupW = innerW / n;
  const barW = Math.min(30, Math.max(14, groupW * 0.32));
  const barGap = 4;
  const pairW = barW * 2 + barGap;

  const groupCenterX = (i: number) => pad.l + (i + 0.5) * groupW;
  const yAtPct = (pct: number) => pad.t + innerH - ((pct - minV) / span) * innerH;
  const yAt = (v: number) => yAtPct(v * 100);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => minV + span * t);

  function deger(donem: string, seri: HpTrendSeriNokta[]): number | null {
    const v = seri.find((p) => p.donem === donem)?.v ?? null;
    return v !== null && Number.isFinite(v) ? v : null;
  }

  function Sutun({
    i,
    v,
    kind,
    fill,
  }: {
    i: number;
    v: number;
    kind: "brut" | "net";
    fill: string;
  }) {
    const cx = groupCenterX(i);
    const x = kind === "brut" ? cx - pairW / 2 : cx - pairW / 2 + barW + barGap;
    const yTop = yAt(v);
    const barH = Math.max(0, yBase - yTop);
    const labelInside = barH >= 18;
    const labelY = labelInside ? yTop + barH / 2 + 3 : yTop - 5;
    const labelCls = labelInside
      ? "fill-white text-[8px] font-bold tabular-nums"
      : "fill-slate-800 text-[8px] font-semibold tabular-nums";

    return (
      <g>
        <rect x={x} y={yTop} width={barW} height={barH} fill={fill} rx={2.5} opacity={0.92} />
        <text x={x + barW / 2} y={labelY} textAnchor="middle" className={labelCls}>
          {fmtHpKisa(v)}
        </text>
      </g>
    );
  }

  const sektorNoktalar = donemler
    .map((donem, i) => {
      const v = deger(donem, sektorBrut);
      if (v === null) return null;
      return { donem, i, x: groupCenterX(i), y: yAt(v), v };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const sektorPolyline = sektorNoktalar.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="H/P trend grafiği">
        {yTicks.map((tick) => {
          const y = yAtPct(tick);
          return (
            <g key={tick}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#e2e8f0" strokeWidth={1} />
              <text x={pad.l - 6} y={y + 3} textAnchor="end" className="fill-slate-500 text-[9px] tabular-nums">
                {pf.format(tick)}%
              </text>
            </g>
          );
        })}

        {donemler.map((donem, i) => {
          const bv = deger(donem, sirketBrut);
          const nv = deger(donem, sirketNet);
          return (
            <g key={donem}>
              {bv !== null && <Sutun i={i} v={bv} kind="brut" fill={COL_BRUT} />}
              {nv !== null && <Sutun i={i} v={nv} kind="net" fill={COL_NET} />}
            </g>
          );
        })}

        {sektorPolyline && (
          <polyline
            fill="none"
            stroke={COL_SEKTOR}
            strokeWidth={2.5}
            strokeDasharray="7 5"
            points={sektorPolyline}
          />
        )}
        {sektorNoktalar.map((p) => (
          <circle key={p.donem} cx={p.x} cy={p.y} r={4} fill="#fff" stroke={COL_SEKTOR} strokeWidth={2} />
        ))}

        {donemler.map((donem, i) => (
          <text
            key={`lbl-${donem}`}
            x={groupCenterX(i)}
            y={h - 10}
            textAnchor="middle"
            className="fill-slate-600 text-[10px] font-medium"
          >
            {donem}
          </text>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-emerald-600" aria-hidden />
          Şirket · brüt H/P (DERK dahil)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-blue-600" aria-hidden />
          Şirket · net H/P (DERK dahil)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0 w-5 border-t-2 border-dashed border-slate-500" aria-hidden />
          Sektör · brüt H/P ({kirisumAd})
        </span>
      </div>
    </div>
  );
}

export default function TsbHasarPrimDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [tumDonemler, setTumDonemler] = useState<string[]>([]);
  const [rows, setRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<SegmentSkorPool>(urlPrefs.pool ?? "HD");
  const [donem, setDonem] = useState("");
  const [kirisumModu, setKirisumModu] = useState<HpKirisumModu>("bransAp");
  const [bransAp, setBransAp] = useState(HAYATDISI);
  const [tarifeSecim, setTarifeSecim] = useState("");
  const [sirketKodu, setSirketKodu] = useState<number | "">("");
  const [kiyasModu, setKiyasModu] = useState<TsbKiyasModu>("sektor");
  const [kiyasSirketKodu, setKiyasSirketKodu] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;
    fetchGelirTidyDonemIndex()
      .then((d) => {
        if (cancelled) return;
        setTumDonemler(d);
        if (d.length > 0) {
          setDonem((prev) => {
            if (prev && d.includes(prev)) return prev;
            if (urlPrefs.donem && d.includes(urlPrefs.donem)) return urlPrefs.donem;
            return d[d.length - 1];
          });
        }
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

  const tarifeSecenekleri = useMemo(() => {
    if (!rows || !donem) return [];
    return listHpTarifeGrubuForPool(rows, donem, pool);
  }, [rows, donem, pool]);

  useEffect(() => {
    if (bransSecenekleri.length === 0) return;
    if (bransSecenekleri.some((b) => b.value === bransAp)) return;
    const varsayilan = bransSecenekleri.find((b) => b.value === HAYATDISI)?.value ?? bransSecenekleri[0].value;
    setBransAp(varsayilan);
  }, [bransSecenekleri, bransAp, pool]);

  useEffect(() => {
    if (tarifeSecenekleri.length === 0) return;
    if (tarifeSecenekleri.some((t) => t.value === tarifeSecim)) return;
    const varsayilan =
      tarifeSecenekleri.find((t) => t.value === "KASKO")?.value ?? tarifeSecenekleri[0].value;
    setTarifeSecim(varsayilan);
  }, [tarifeSecenekleri, tarifeSecim, pool]);

  useEffect(() => {
    setBransAp(pool === "HD" ? HAYATDISI : "HAYAT");
    setTarifeSecim("");
  }, [pool]);

  const kirisum: HasarPrimKirisum = useMemo(() => {
    if (kirisumModu === "bransAp") {
      const label = bransSecenekleri.find((b) => b.value === bransAp)?.label ?? bransAp;
      return { mod: "bransAp", bransAp, gorunenAd: label };
    }
    const sec = tarifeSecenekleri.find((t) => t.value === tarifeSecim);
    return {
      mod: "tarifeGrubu",
      bransAp: sec?.bransAp ?? bransAp,
      gorunenAd: sec?.label ?? tarifeSecim,
    };
  }, [kirisumModu, bransAp, bransSecenekleri, tarifeSecim, tarifeSecenekleri]);

  const tarifeNot = useMemo(
    () => (kirisumModu === "tarifeGrubu" ? hpTarifeNotu(tarifeSecim) : null),
    [kirisumModu, tarifeSecim],
  );

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
  }, [sirketListesi, pool, sirketKodu, urlPrefs.sirket]);

  const kiyasListe = useMemo(
    () => sirketListesi.filter((s) => s.kod !== sirketKodu),
    [sirketListesi, sirketKodu],
  );

  const kiyasHedef: HasarPrimKiyasHedef = useMemo(
    () => kiyasHedefFromModu(kiyasModu, kiyasSirketKodu),
    [kiyasModu, kiyasSirketKodu],
  );

  useEffect(() => {
    if (kiyasModu !== "sirket" || kiyasListe.length === 0) return;
    if (kiyasListe.some((s) => s.kod === kiyasSirketKodu)) return;
    setKiyasSirketKodu(kiyasListe[0].kod);
  }, [kiyasModu, kiyasListe, kiyasSirketKodu]);

  const tablo = useMemo(() => {
    if (!rows || !donem) return [];
    return buildHasarPrimTablosu(rows, donem, pool, kirisum.bransAp);
  }, [rows, donem, pool, kirisum.bransAp]);

  const secilenSatir = useMemo(
    () => tablo.find((s) => s.sirketKodu === sirketKodu),
    [tablo, sirketKodu],
  );

  const kiyasOzet = useMemo(() => {
    if (!rows || !donem || sirketKodu === "") return null;
    return hasarPrimKiyasOzet(rows, donem, pool, kirisum.bransAp, kiyasHedef, sirketListesi, sirketKodu);
  }, [rows, donem, pool, kirisum.bransAp, kiyasHedef, sirketListesi, sirketKodu]);

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

  const onceYilVarMi = !!(donemOnceki && tumDonemler.includes(donemOnceki));

  const trend = useMemo(() => {
    if (!rows || sirketKodu === "" || trendDonemler.length === 0) return [];
    return buildHasarPrimTrend(rows, trendDonemler, sirketKodu, kirisum.bransAp);
  }, [rows, sirketKodu, trendDonemler, kirisum.bransAp]);

  const sektorTrend = useMemo(() => {
    if (!rows || trendDonemler.length === 0) return [];
    return buildHasarPrimSektorTrend(rows, trendDonemler, pool, kirisum.bransAp);
  }, [rows, trendDonemler, pool, kirisum.bransAp]);

  const odakYoy = useMemo(() => {
    if (!onceYilVarMi || !donemOnceki || !rows || sirketKodu === "" || !secilenSatir) return null;
    const lookup = buildGelirTidyDonemLookup(rows, donemOnceki);
    const once = hasarPrimOranlariDetayFromLookup(lookup, sirketKodu, { bransAp: kirisum.bransAp });
    return hpPpFark(secilenSatir.hp.brutHasarPrimOrani, once.brutHasarPrimOrani);
  }, [onceYilVarMi, donemOnceki, rows, sirketKodu, secilenSatir, kirisum.bransAp]);

  const hpInsights = useMemo((): readonly TsbInsightItem[] => {
    const items: TsbInsightItem[] = [];
    if (!secilenSatir || !kiyasOzet) return items;

    const sirketHp = secilenSatir.hp.brutHasarPrimOrani;
    const kiyasHp = kiyasOzet.hp.brutHasarPrimOrani;
    if (sirketHp !== null && kiyasHp !== null && Number.isFinite(sirketHp) && Number.isFinite(kiyasHp)) {
      const fark = hpPpFark(sirketHp, kiyasHp);
      if (fark !== null && fark > 0.5) {
        items.push({
          text: (
            <>
              Brüt H/P ({kirisum.gorunenAd}), {kiyasOzet.baslik.toLowerCase()}ndan{" "}
              <strong>{tsbFormatPp(fark)}</strong> yüksek — sektör ortalamasının üzerinde teknik maliyet baskısı
              işareti olabilir.
            </>
          ),
        });
      }
    }

    if (odakYoy !== null && odakYoy > 0.5) {
      items.push({
        text: (
          <>
            Brüt H/P önceki yılın aynı çeyreğine göre <strong>{tsbFormatPp(odakYoy)}</strong> arttı — kötüleşme
            yönünde.
          </>
        ),
      });
    }

    return items;
  }, [secilenSatir, kiyasOzet, kirisum.gorunenAd, odakYoy]);

  if (error) return <TsbError message={error} />;
  if (!rows || !donem || sirketKodu === "") return <TsbLoading message="Hasar / prim verisi yükleniyor…" />;

  return (
    <div className={tsb.dashboardStack}>
      <TsbInsights items={hpInsights} />

      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField label="Havuz">
            <div className={tsb.btnGroup}>
              {(["HD", "HAYAT_EMEKLILIK"] as const).map((p) => (
                <TsbToggleButton key={p} pressed={pool === p} variant="segment" onClick={() => setPool(p)}>
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
          <TsbFilterField label="Kırılım">
            <div className={tsb.btnGroup}>
              <TsbToggleButton pressed={kirisumModu === "bransAp"} variant="segment" onClick={() => setKirisumModu("bransAp")}>
                Branş (GT)
              </TsbToggleButton>
              <TsbToggleButton pressed={kirisumModu === "tarifeGrubu"} variant="segment" onClick={() => setKirisumModu("tarifeGrubu")}>
                Tarife grubu
              </TsbToggleButton>
            </div>
          </TsbFilterField>
          {kirisumModu === "bransAp" ? (
            <TsbFilterField label="Branş (gelir tablosu)">
              <TsbSelect className={tsb.selectWide} value={bransAp} onChange={(e) => setBransAp(e.target.value)}>
                {bransSecenekleri.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </TsbSelect>
            </TsbFilterField>
          ) : (
            <TsbFilterField label="Tarife grubu" hint={tarifeNot ?? undefined}>
              <TsbSelect className={tsb.selectWide} value={tarifeSecim} onChange={(e) => setTarifeSecim(e.target.value)}>
                {tarifeSecenekleri.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </TsbSelect>
            </TsbFilterField>
          )}
          <TsbFilterField label="Odak şirket">
            <TsbSelect className={tsb.selectWide} value={String(sirketKodu)} onChange={(e) => setSirketKodu(Number(e.target.value))}>
              {sirketListesi.map((s) => (
                <option key={s.kod} value={s.kod}>
                  {s.kod} — {s.ad}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Sağ blok kıyası" className="sm:col-span-2">
            <TsbKiyasModuControls
              kiyasModu={kiyasModu}
              onKiyasModuChange={setKiyasModu}
              sektorPeerSayisi={
                kiyasModu === "sektor" && rows && donem
                  ? listSirketleriGelirDonemForPool(rows, donem, pool).length
                  : undefined
              }
              olcekSegment={kiyasOzet?.olcekSegment}
              olcekPeerSayisi={kiyasModu === "olcek" ? kiyasOzet?.peerSayisi : undefined}
              kiyasListe={kiyasListe}
              kiyasSirketKodu={kiyasSirketKodu}
              onKiyasSirketKoduChange={setKiyasSirketKodu}
              selectId="hp-kiyas-sirket"
            />
          </TsbFilterField>
        </TsbFilterGrid>
      </TsbFilterBar>

      {secilenAd ? <TsbOlcekSegmentRozeti sirketAdi={secilenAd} kayit={olcekKayit} finDonem={olcekFinDonem} /> : null}

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

      {trend.length >= 2 && (
        <div className={tsb.chartPanel}>
          <h3 className="mb-1 text-sm font-semibold text-slate-900">
            Son {trendDonemler.length} çeyrek — {secilenAd}
          </h3>
          <p className={cn(tsb.caption, "mb-4")}>
            {kirisum.gorunenAd} kırılımında şirket brüt/net H/P (DERK dahil) sütunlar; kesik çizgi sektör brüt H/P.
          </p>
          <HpTrendGrafik
            donemler={trendDonemler}
            sirketBrut={trend.map((t) => ({ donem: t.donem, v: t.brutDerkDahil }))}
            sirketNet={trend.map((t) => ({ donem: t.donem, v: t.netDerkDahil }))}
            sektorBrut={sektorTrend.map((t) => ({ donem: t.donem, v: t.brutDerkDahil }))}
            kirisumAd={kirisum.gorunenAd}
          />
        </div>
      )}

      <div className={tsb.dataPanel}>
        <div className={tsb.dataPanelHeader}>
          <h3 className={tsb.dataPanelTitle}>
            Sektör sıralaması — {POOL_LABELS[pool]} · {kirisum.gorunenAd}
            {kirisum.mod === "tarifeGrubu" ? " (tarife)" : ""} · {donem}
          </h3>
          <p className={tsb.caption}>Sıra brüt H/P (DERK dahil), düşükten yükseğe.</p>
        </div>
        <TsbTableShell>
        <table className={cn(tsb.table, "min-w-[960px]")}>
          <thead className={tsb.thead}>
            <tr>
              <th className={cn(tsb.th, "w-9 text-center")}>Sıra</th>
              <th className={cn(tsb.th, "w-12 text-center")}>Kod</th>
              <th className={cn(tsb.th, "min-w-[7rem] max-w-[8.5rem]")}>Şirket</th>
              <th className={cn(tsb.thRight, "min-w-[6.5rem] whitespace-nowrap")}>Kaz. prim (brüt)</th>
              <th className={cn(tsb.thRight, "min-w-[6.5rem] whitespace-nowrap")}>Gerç. hasar (brüt)</th>
              <th className={tsb.thRight} colSpan={2}>
                DERK dahil
              </th>
              <th className={tsb.thRight} colSpan={2}>
                DERK hariç
              </th>
              {onceYilVarMi && (
                <th className={cn(tsb.thRight, "min-w-[4rem]")} title="Önceki yıl aynı çeyrek · brüt DERK dahil">
                  YoY Δ
                </th>
              )}
            </tr>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className={tsb.th} colSpan={5} />
              <th className={cn(tsb.thRight, "whitespace-nowrap")}>Brüt</th>
              <th className={cn(tsb.thRight, "whitespace-nowrap")}>Net</th>
              <th className={cn(tsb.thRight, "whitespace-nowrap")}>Brüt</th>
              <th className={cn(tsb.thRight, "whitespace-nowrap")}>Net</th>
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
                bransAp={kirisum.bransAp}
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
      <td className={cn(tsb.td, "text-center tabular-nums text-slate-600")}>{satir.sira}</td>
      <td className={cn(tsb.td, "text-center tabular-nums whitespace-nowrap text-slate-600")}>{satir.sirketKodu}</td>
      <td className={cn(tsb.td, "max-w-[8.5rem]", vurgu && "font-medium")}>
        <div className="truncate" title={satir.sirketAdi}>
          {satir.sirketAdi}
        </div>
      </td>
      <td className={cn(tsb.td, "text-right tabular-nums whitespace-nowrap text-slate-600")}>
        {nf.format(satir.hp.kazanilmisPrimBrut)}
      </td>
      <td className={cn(tsb.td, "text-right tabular-nums whitespace-nowrap text-slate-600")}>
        {nf.format(-satir.hp.gerceklesenHasarBrut)}
      </td>
      <HpHucre v={satir.hp.brutHasarPrimOrani} vurgu={vurgu} />
      <HpHucre v={satir.hp.netHasarPrimOrani} />
      <HpHucre v={satir.hp.brutDerkHaric} />
      <HpHucre v={satir.hp.netDerkHaric} />
      {onceYilVarMi && (
        <td className={cn(tsb.td, "text-right tabular-nums whitespace-nowrap", tsbHpDeltaRenk(yoy))}>{tsbFormatPp(yoy)}</td>
      )}
    </tr>
  );
}
