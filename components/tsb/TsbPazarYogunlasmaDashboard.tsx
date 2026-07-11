"use client";

import { useEffect, useMemo, useState } from "react";
import { useTsbDashboardUrlPrefs } from "@/components/tsb/useTsbDashboardUrlPrefs";
import {
  anaBransSecenekleri,
  buildPazarYogunlasmaPaket,
  hhiYorum,
  varsayilanAnaBrans,
  type PazarHhiTrendNokta,
} from "@/lib/tsbPazarYogunlasma";
import type { TsbKanalField, TsbPrimRow, TsbSektorSegment } from "@/lib/tsbPrimDashboard";
import { isTsbToplamSirketKodu, uniqueSortedPeriods } from "@/lib/tsbPrimDashboard";
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

const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const hhiFmt = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

function HhiTrendChart({ trend }: { trend: PazarHhiTrendNokta[] }) {
  if (trend.length === 0) return null;
  const maxHhi = Math.max(...trend.map((t) => t.hhi), 2500);
  const H = 140;
  return (
    <div className={cn(tsb.dataPanel, "p-4")}>
      <p className="text-sm font-semibold text-slate-800">HHI trendi (son {trend.length} ay)</p>
      <p className="mt-0.5 text-xs text-slate-600">Yüksek değer = daha yoğun pazar</p>
      <div className="mt-4 flex items-end justify-between gap-1 overflow-x-auto pb-1">
        {trend.map((t) => {
          const h = Math.max(4, (t.hhi / maxHhi) * H);
          const renk =
            t.hhi >= 2500 ? "bg-rose-500" : t.hhi >= 1500 ? "bg-amber-500" : "bg-emerald-500";
          return (
            <div key={t.donem} className="flex min-w-[2.5rem] flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-semibold tabular-nums text-slate-700">
                {hhiFmt.format(t.hhi)}
              </span>
              <div className={cn("w-full max-w-[2rem] rounded-t", renk)} style={{ height: `${h}px` }} />
              <span className="text-[9px] font-medium text-slate-500">{t.donem.slice(5)}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-600">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-500" /> &lt; 1.500 düşük
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-amber-500" /> 1.500–2.500 orta
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-rose-500" /> ≥ 2.500 yüksek
        </span>
      </div>
    </div>
  );
}

export default function TsbPazarYogunlasmaDashboard() {
  const urlPrefs = useTsbDashboardUrlPrefs();
  const [rows, setRows] = useState<TsbPrimRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState<TsbSektorSegment>(urlPrefs.segment ?? "hayatdisi");
  const [donem, setDonem] = useState("");
  const [kanal, setKanal] = useState<TsbKanalField>("genelToplam");
  const [anaBransH, setAnaBransH] = useState("");

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

  useEffect(() => {
    if (donemler.length === 0 || donem) return;
    if (urlPrefs.donem && donemler.includes(urlPrefs.donem)) {
      setDonem(urlPrefs.donem);
    }
  }, [donemler, donem, urlPrefs.donem]);

  const bransSecenekleri = useMemo(
    () => (rows && secilenDonem ? anaBransSecenekleri(rows, secilenDonem, segment) : []),
    [rows, secilenDonem, segment],
  );

  useEffect(() => {
    if (bransSecenekleri.length === 0) return;
    if (!anaBransH || !bransSecenekleri.includes(anaBransH)) {
      setAnaBransH(varsayilanAnaBrans(bransSecenekleri));
    }
  }, [bransSecenekleri, anaBransH]);

  const paket = useMemo(() => {
    if (!rows || !secilenDonem || !anaBransH) return null;
    return buildPazarYogunlasmaPaket(rows, donemler, secilenDonem, anaBransH, segment, kanal);
  }, [rows, donemler, secilenDonem, anaBransH, segment, kanal]);

  const yorumDetay = paket ? hhiYorum(paket.hhi) : null;
  const vurguSirket = urlPrefs.sirket;

  if (error) return <TsbError message={error} />;
  if (!rows) return <TsbLoading message="Prim verisi yükleniyor…" />;

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <p className={tsb.filterSectionLabel}>Şirket grubu</p>
        <div className={cn(tsb.btnGroup, "mb-3")}>
          <TsbToggleButton pressed={segment === "hayatdisi"} variant="segment" onClick={() => setSegment("hayatdisi")}>
            Hayat dışı
          </TsbToggleButton>
          <TsbToggleButton pressed={segment === "hayat"} variant="segment" onClick={() => setSegment("hayat")}>
            Hayat &amp; emeklilik
          </TsbToggleButton>
        </div>
        <TsbFilterGrid>
          <TsbFilterField label="Prim dönemi (ay)">
            <TsbSelect value={secilenDonem} onChange={(e) => setDonem(e.target.value)}>
              {[...donemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField label="Ana branş">
            <TsbSelect value={anaBransH} onChange={(e) => setAnaBransH(e.target.value)}>
              {bransSecenekleri.map((b) => (
                <option key={b} value={b}>
                  {b}
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
        </TsbFilterGrid>
      </TsbFilterBar>

      {!paket ? (
        <p className={tsb.filterHint}>Seçili filtreler için pazar yoğunlaşması hesaplanamadı.</p>
      ) : (
        <>
          <div className={tsb.kpiGrid}>
            <div className={tsb.kpiCard}>
              <p className={tsb.kpiLabel}>HHI</p>
              <p className={tsb.kpiValue}>{hhiFmt.format(paket.hhi)}</p>
              <p className={tsb.kpiHint}>{yorumDetay?.etiket}</p>
            </div>
            <div className={tsb.kpiCard}>
              <p className={tsb.kpiLabel}>Katılımcı şirket</p>
              <p className={tsb.kpiValue}>{paket.katilimci}</p>
              <p className={tsb.kpiHint}>{secilenDonem} aylık üretim</p>
            </div>
            <div className={tsb.kpiCard}>
              <p className={tsb.kpiLabel}>Sektör primi</p>
              <p className={tsb.kpiValue}>{nf.format(paket.sektorPrim)} TL</p>
              <p className={tsb.kpiHint}>{anaBransH}</p>
            </div>
            <div className={tsb.kpiCard}>
              <p className={tsb.kpiLabel}>Top-5 pay</p>
              <p className={tsb.kpiValue}>
                {pf.format(paket.top5.reduce((s, x) => s + x.payYuzde, 0))}%
              </p>
              <p className={tsb.kpiHint}>İlk 5 şirketin toplam payı</p>
            </div>
          </div>

          {yorumDetay ? (
            <p className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700">
              {yorumDetay.aciklama}
            </p>
          ) : null}

          <HhiTrendChart trend={paket.trend} />

          <TsbTableShell>
            <p className="mb-2 text-sm font-semibold text-slate-800">
              {anaBransH} — şirket payları ({secilenDonem})
            </p>
            <table className={tsb.table}>
              <thead>
                <tr>
                  <th className={tsb.th}>Sıra</th>
                  <th className={tsb.th}>Şirket</th>
                  <th className={cn(tsb.th, "text-right")}>Aylık prim (TL)</th>
                  <th className={cn(tsb.th, "text-right")}>Pay %</th>
                </tr>
              </thead>
              <tbody>
                {paket.tumSirketler.map((s, i) => {
                  const vurgu = vurguSirket != null && s.sirketKodu === vurguSirket;
                  return (
                    <tr
                      key={s.sirketKodu}
                      className={cn(tsb.tbodyRow, vurgu && "bg-emerald-50/70 font-medium")}
                    >
                      <td className={tsb.td}>{i + 1}</td>
                      <td className={tsb.td}>
                        {s.sirketAdi}
                        {vurgu ? (
                          <span className="ml-1.5 rounded bg-emerald-100 px-1 py-0.5 text-[10px] font-semibold text-emerald-800">
                            odak
                          </span>
                        ) : null}
                      </td>
                      <td className={cn(tsb.td, "text-right tabular-nums")}>{nf.format(s.prim)}</td>
                      <td className={cn(tsb.td, "text-right tabular-nums")}>{pf.format(s.payYuzde)}%</td>
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
