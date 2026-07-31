"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TsbSektorBilançoStackedChart,
  TsbSektorKarBilesenleriChart,
} from "@/components/tsb/TsbSektorGorunumuCharts";
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
import {
  fetchGelirTidyDonemIndex,
  fetchGelirTidyDonemler,
} from "@/lib/tsbGelirTidyFetch";
import { oncekiYilDonem } from "@/lib/tsbFinansalKarsilastirmaData";
import {
  buildSektorGorunumuPaket,
  sektorGorunumuTrendDonemleri,
  type SektorGorunumuIlk10,
  type SektorGorunumuPool,
  type SektorGorunumuSnapshot,
} from "@/lib/tsbSektorGorunumu";
import type { TsbGelirTidyRowLike } from "@/lib/tsbYatirimGeliriKpi";

const POOL_LABEL: Record<SektorGorunumuPool, string> = {
  SEKTOR: "Toplam (HD + H/E)",
  HD: "Hayat dışı",
  HAYAT_EMEKLILIK: "Hayat / Emeklilik",
};

const tl = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
const pct = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 1 });

function fmtTl(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1e12) return `${tl.format(v / 1e12)} Tr ₺`;
  if (abs >= 1e9) return `${tl.format(v / 1e9)} Mr ₺`;
  if (abs >= 1e6) return `${tl.format(v / 1e6)} Mn ₺`;
  return `${tl.format(v)} ₺`;
}

function fmtPct(v: number | null): string {
  return v === null || !Number.isFinite(v) ? "—" : `%${pct.format(v * 100)}`;
}

function fmtDegisim(bu: number, onceki: number | undefined): { text: string; className: string } {
  if (onceki === undefined || !Number.isFinite(onceki) || onceki === 0) {
    return { text: "Geçen yıl: —", className: "text-slate-400" };
  }
  const d = (bu - onceki) / Math.abs(onceki);
  return {
    text: `${d > 0 ? "+" : ""}${pct.format(d * 100)}% yıllık`,
    className: d > 0 ? "text-emerald-700" : d < 0 ? "text-red-700" : "text-slate-500",
  };
}

type KpiKey = keyof Pick<
  SektorGorunumuSnapshot,
  | "brutPrim"
  | "teknikKar"
  | "safiTeknik"
  | "yatirimGeliri"
  | "netKar"
  | "ozsermaye"
  | "aktifToplami"
>;

const KPI_LIST: { key: KpiKey; label: string; hint: string }[] = [
  { key: "brutPrim", label: "Brüt prim", hint: "Toplam yazılan prim" },
  { key: "teknikKar", label: "Teknik kâr / zarar", hint: "Teknik bölüm sonucu" },
  { key: "safiTeknik", label: "Safî teknik sonuç", hint: "Yatırım etkisi ayrıştırılmış" },
  { key: "yatirimGeliri", label: "Yatırım geliri", hint: "Karşılaştırılabilir yatırım KPI" },
  { key: "netKar", label: "Net dönem kârı", hint: "Dönem net sonucu" },
  { key: "ozsermaye", label: "Özsermaye", hint: "Sektör sermaye tabanı" },
  { key: "aktifToplami", label: "Aktif toplamı", hint: "Toplam bilanço büyüklüğü" },
];

function KpiCard({
  item,
  bu,
  onceki,
}: {
  item: (typeof KPI_LIST)[number];
  bu: { SEKTOR: SektorGorunumuSnapshot; HD: SektorGorunumuSnapshot; HAYAT_EMEKLILIK: SektorGorunumuSnapshot };
  onceki?: SektorGorunumuSnapshot;
}) {
  const degisim = fmtDegisim(bu.SEKTOR[item.key], onceki?.[item.key]);
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.03]">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
      <p className="mt-2 text-xl font-bold tabular-nums tracking-tight text-slate-950">
        {fmtTl(bu.SEKTOR[item.key])}
      </p>
      <p className={cn("mt-1 text-xs font-semibold tabular-nums", degisim.className)}>{degisim.text}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[11px]">
        <div>
          <span className="block text-slate-400">HD</span>
          <strong className="tabular-nums text-slate-700">{fmtTl(bu.HD[item.key])}</strong>
        </div>
        <div>
          <span className="block text-slate-400">H/E</span>
          <strong className="tabular-nums text-sky-700">{fmtTl(bu.HAYAT_EMEKLILIK[item.key])}</strong>
        </div>
      </div>
      <p className="mt-2 text-[10px] leading-snug text-slate-400">{item.hint}</p>
    </article>
  );
}

const RATIO_ROWS: {
  key: keyof Pick<
    SektorGorunumuSnapshot,
    "brutHp" | "netHp" | "safiPrim" | "netKarOzsermaye" | "netKarAktif" | "brutPrimOzsermaye" | "ozsermayeAktif" | "vokOzsermaye"
  >;
  label: string;
}[] = [
  { key: "brutHp", label: "Brüt H/P" },
  { key: "netHp", label: "Net H/P" },
  { key: "safiPrim", label: "Safî teknik / brüt prim" },
  { key: "netKarOzsermaye", label: "Özsermaye kârlılığı (net kâr / özsermaye)" },
  { key: "netKarAktif", label: "Aktif kârlılığı (net kâr / aktif)" },
  { key: "brutPrimOzsermaye", label: "Brüt prim / özsermaye" },
  { key: "ozsermayeAktif", label: "Özsermaye / aktif" },
  { key: "vokOzsermaye", label: "Vergi öncesi kâr / özsermaye" },
];

const GROUP_LABEL: Record<SektorGorunumuIlk10["grup"], string> = {
  ILK_10: "İlk 10 şirket",
  DIGER: "Diğer şirketler",
  TOPLAM: "HD toplam",
};

export default function TsbSektorGorunumuDashboard() {
  const [tumDonemler, setTumDonemler] = useState<string[]>([]);
  const [donem, setDonem] = useState("");
  const [rows, setRows] = useState<TsbGelirTidyRowLike[] | null>(null);
  const [pool, setPool] = useState<SektorGorunumuPool>("SEKTOR");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGelirTidyDonemIndex()
      .then((list) => {
        if (cancelled) return;
        setTumDonemler(list);
        setDonem(list.at(-1) ?? "");
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Dönemler yüklenemedi"));
    return () => {
      cancelled = true;
    };
  }, []);

  const onceki = useMemo(() => (donem ? oncekiYilDonem(donem) : null), [donem]);
  const trendDonemler = useMemo(
    () => (donem ? sektorGorunumuTrendDonemleri(tumDonemler, donem) : []),
    [tumDonemler, donem],
  );

  useEffect(() => {
    if (!donem) return;
    const yuklenecek = [...new Set([...trendDonemler, ...(onceki && tumDonemler.includes(onceki) ? [onceki] : []), donem])];
    let cancelled = false;
    fetchGelirTidyDonemler(yuklenecek)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Sektör verisi yüklenemedi"));
    return () => {
      cancelled = true;
    };
  }, [donem, onceki, trendDonemler, tumDonemler]);

  const paket = useMemo(() => {
    // Dönem seçimi değiştiğinde önceki fetch'in satırlarıyla geçici "0" kartları üretme.
    if (!rows || !donem || !rows.some((row) => row.donem === donem)) return null;
    return buildSektorGorunumuPaket(
      rows,
      donem,
      onceki && tumDonemler.includes(onceki) ? onceki : null,
      trendDonemler,
    );
  }, [rows, donem, onceki, trendDonemler, tumDonemler]);

  if (error) return <TsbError message={error} />;
  if (!paket) return <TsbLoading message="Sektör görünümü hazırlanıyor…" />;

  const oncekiIlk10 = new Map(paket.ilk10Onceki.map((x) => [x.grup, x]));

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <TsbFilterGrid>
          <TsbFilterField label="Finansal dönem" hint="Trend, seçili çeyreğin geçmiş yıllardaki aynı çeyreğini kullanır.">
            <TsbSelect value={donem} onChange={(e) => setDonem(e.target.value)}>
              {[...tumDonemler].reverse().map((d) => <option key={d}>{d}</option>)}
            </TsbSelect>
          </TsbFilterField>
          <div className="sm:col-span-1 lg:col-span-2">
            <span className={tsb.filterLabel}>Kâr trendi görünümü</span>
            <div className={tsb.btnGroup}>
              {(["SEKTOR", "HD", "HAYAT_EMEKLILIK"] as const).map((p) => (
                <TsbToggleButton key={p} variant="segment" pressed={pool === p} onClick={() => setPool(p)}>
                  {POOL_LABEL[p]}
                </TsbToggleButton>
              ))}
            </div>
          </div>
        </TsbFilterGrid>
        <p className={tsb.filterHint}>
          Üst kartlarda her zaman <strong>HD + H/E sektör toplamı</strong>; grafik seçicisi yalnız kâr trendini değiştirir.
          Oranlar tutarların toplamından yeniden hesaplanır, şirket oranlarının ortalaması alınmaz.
        </p>
      </TsbFilterBar>

      <section aria-labelledby="sg-kpi">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="sg-kpi" className="text-lg font-bold text-slate-900">Sigorta sektörü ana göstergeleri</h2>
            <p className="text-sm text-slate-500">{donem} · HD + Hayat/Emeklilik toplamı</p>
          </div>
          <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
            {paket.secili.SEKTOR.sirketSayisi} şirket
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {KPI_LIST.map((item) => (
            <KpiCard
              key={item.key}
              item={item}
              bu={paket.secili}
              onceki={paket.onceki?.SEKTOR}
            />
          ))}
        </div>
      </section>

      <section className={tsb.chartPanel}>
        <div className="min-w-[720px]">
          <TsbSektorKarBilesenleriChart trend={paket.trend} pool={pool} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={tsb.chartPanel}>
          <TsbSektorBilançoStackedChart trend={paket.trend} metric="aktifToplami" title="Aktif büyüklüğü" />
        </div>
        <div className={tsb.chartPanel}>
          <TsbSektorBilançoStackedChart trend={paket.trend} metric="ozsermaye" title="Özsermaye büyüklüğü" />
        </div>
      </section>

      <section className={tsb.dataPanel}>
        <div className={tsb.dataPanelHeader}>
          <h2 className={tsb.dataPanelTitle}>Finansal sağlık oranları</h2>
          <p className="mt-1 text-sm text-slate-500">HD, H/E ve birleşik sektör aynı hesap tabanında.</p>
        </div>
        <TsbTableShell>
          <table className={cn(tsb.table, "min-w-[720px]")}>
            <thead className={tsb.thead}>
              <tr>
                <th className={tsb.thSticky}>Gösterge</th>
                <th className={tsb.th}>Hayat dışı</th>
                <th className={tsb.th}>Hayat / Emeklilik</th>
                <th className={tsb.th}>Toplam (HD + H/E)</th>
                <th className={tsb.th}>Toplam geçen yıl</th>
              </tr>
            </thead>
            <tbody>
              {RATIO_ROWS.map((r) => (
                <tr key={r.key} className={tsb.tbodyRow}>
                  <th scope="row" className={cn(tsb.tdSticky, "text-left font-semibold")}>{r.label}</th>
                  <td className={cn(tsb.td, "text-right")}>{fmtPct(paket.secili.HD[r.key])}</td>
                  <td className={cn(tsb.td, "text-right")}>{fmtPct(paket.secili.HAYAT_EMEKLILIK[r.key])}</td>
                  <td className={cn(tsb.td, "bg-emerald-50/40 text-right font-bold")}>{fmtPct(paket.secili.SEKTOR[r.key])}</td>
                  <td className={cn(tsb.td, "text-right text-slate-500")}>{fmtPct(paket.onceki?.SEKTOR[r.key] ?? null)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TsbTableShell>
      </section>

      <section className={tsb.dataPanel}>
        <div className={tsb.dataPanelHeader}>
          <h2 className={tsb.dataPanelTitle}>Hayat dışı: İlk 10 şirket vs diğerleri</h2>
          <p className="mt-1 text-sm text-slate-500">
            Her dönemde brüt prime göre yeniden sıralanır. Bu kırılım ölçek segmentasyonu değildir.
          </p>
        </div>
        <TsbTableShell>
          <table className={cn(tsb.table, "min-w-[860px]")}>
            <thead className={tsb.thead}>
              <tr>
                <th className={tsb.thSticky}>Grup</th>
                <th className={tsb.th}>Şirket</th>
                <th className={tsb.th}>Brüt prim</th>
                <th className={tsb.th}>Brüt H/P</th>
                <th className={tsb.th}>Özsermaye / aktif</th>
                <th className={tsb.th}>Brüt prim / özsermaye</th>
                <th className={tsb.th}>Net kâr / özsermaye</th>
                <th className={tsb.th}>Önceki yıl H/P</th>
              </tr>
            </thead>
            <tbody>
              {paket.ilk10.map((row) => {
                const prev = oncekiIlk10.get(row.grup);
                return (
                  <tr key={row.grup} className={tsb.tbodyRow}>
                    <th scope="row" className={cn(tsb.tdSticky, "text-left font-semibold")}>{GROUP_LABEL[row.grup]}</th>
                    <td className={cn(tsb.td, "text-right")}>{row.sirketSayisi}</td>
                    <td className={cn(tsb.td, "text-right font-semibold")}>{fmtTl(row.brutPrim)}</td>
                    <td className={cn(tsb.td, "text-right")}>{fmtPct(row.brutHp)}</td>
                    <td className={cn(tsb.td, "text-right")}>{fmtPct(row.ozsermayeAktif)}</td>
                    <td className={cn(tsb.td, "text-right")}>{fmtPct(row.brutPrimOzsermaye)}</td>
                    <td className={cn(tsb.td, "text-right")}>{fmtPct(row.netKarOzsermaye)}</td>
                    <td className={cn(tsb.td, "text-right text-slate-500")}>{fmtPct(prev?.brutHp ?? null)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TsbTableShell>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href={`/sigorta/finansal-karsilastirma?donem=${donem}&pool=SEKTOR`} className={tsb.pillLink}>
          Finansal karşılaştırmada sektörü aç →
        </Link>
        <Link href="/sigorta/ana-brans-tkz" className={tsb.pillLink}>Ana branş TKZ →</Link>
        <Link href="/sigorta/hasar-prim-orani" className={tsb.pillLink}>Hasar / Prim →</Link>
      </div>
    </div>
  );
}
