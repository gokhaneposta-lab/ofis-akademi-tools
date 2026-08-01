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
import { formatPrimYtdAralik } from "@/lib/tsbPrimDonemEtiket";
import {
  isTsbToplamSirketKodu,
  uniqueSortedPeriods,
  type TsbPrimRow,
} from "@/lib/tsbPrimDashboard";
import {
  buildSektorGorunumuPaket,
  buildSektorPrimPaket,
  sektorGorunumuTrendDonemleri,
  type SektorGorunumuDonem,
  type SektorGorunumuIlk10,
  type SektorGorunumuPool,
  type SektorGorunumuSnapshot,
  type SektorPrimSnapshot,
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
    return { text: "—", className: "text-slate-400" };
  }
  const d = (bu - onceki) / Math.abs(onceki);
  return {
    text: `${d > 0 ? "+" : ""}${pct.format(d * 100)}%`,
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
  { key: "brutPrim", label: "Brüt prim (finansal GT)", hint: "Gelir tablosu yazılan prim · çeyrek" },
  { key: "teknikKar", label: "Teknik kâr / zarar", hint: "Teknik bölüm sonucu" },
  { key: "safiTeknik", label: "Safî teknik sonuç", hint: "Yatırım etkisi ayrıştırılmış" },
  { key: "yatirimGeliri", label: "Yatırım geliri", hint: "Karşılaştırılabilir yatırım KPI" },
  { key: "netKar", label: "Net dönem kârı", hint: "Dönem net sonucu" },
  { key: "ozsermaye", label: "Özsermaye", hint: "Sektör sermaye tabanı" },
  { key: "aktifToplami", label: "Aktif toplamı", hint: "Toplam bilanço büyüklüğü" },
];

function PrimUretimTable({
  donem,
  paket,
}: {
  donem: string;
  paket: { secili: SektorPrimSnapshot; onceki: SektorPrimSnapshot | null; trend: SektorPrimSnapshot[] };
}) {
  const yilKolonlari = paket.trend.filter((p) => p.donem !== donem);
  const degisim = fmtDegisim(paket.secili.SEKTOR, paket.onceki?.SEKTOR);
  return (
    <TsbTableShell>
      <table className={cn(tsb.table, "min-w-[980px]")}>
        <thead className={tsb.thead}>
          <tr>
            <th className={tsb.thSticky}>Gösterge</th>
            {yilKolonlari.map((p) => (
              <th key={p.donem} className={tsb.th}>{p.donem}</th>
            ))}
            <th className={tsb.th}>{donem}</th>
            <th className={tsb.th}>Yıllık değişim</th>
            <th className={tsb.th}>{donem} · HD</th>
            <th className={tsb.th}>{donem} · H/E</th>
          </tr>
        </thead>
        <tbody>
          <tr className={tsb.tbodyRow}>
            <th scope="row" className={cn(tsb.tdSticky, "text-left")}>
              <span className="block font-semibold text-slate-900">Brüt prim üretimi</span>
              <span className="block text-[11px] font-normal text-slate-400">
                prim-tidy · {formatPrimYtdAralik(donem)} · YTD
              </span>
            </th>
            {yilKolonlari.map((p) => (
              <td key={p.donem} className={cn(tsb.td, "text-right text-slate-500")}>
                {fmtTl(p.SEKTOR)}
              </td>
            ))}
            <td className={cn(tsb.td, "bg-emerald-50/40 text-right font-bold")}>
              {fmtTl(paket.secili.SEKTOR)}
            </td>
            <td className={cn(tsb.td, "text-right font-semibold", degisim.className)}>{degisim.text}</td>
            <td className={cn(tsb.td, "text-right")}>{fmtTl(paket.secili.HD)}</td>
            <td className={cn(tsb.td, "text-right text-sky-700")}>{fmtTl(paket.secili.HAYAT_EMEKLILIK)}</td>
          </tr>
        </tbody>
      </table>
    </TsbTableShell>
  );
}

function KpiTable({
  donem,
  trend,
  secili,
  onceki,
}: {
  donem: string;
  trend: SektorGorunumuDonem[];
  secili: SektorGorunumuDonem;
  onceki: SektorGorunumuDonem | null;
}) {
  const yilKolonlari = trend.filter((p) => p.donem !== donem);
  return (
    <TsbTableShell>
      <table className={cn(tsb.table, "min-w-[980px]")}>
        <thead className={tsb.thead}>
          <tr>
            <th className={tsb.thSticky}>Gösterge</th>
            {yilKolonlari.map((p) => (
              <th key={p.donem} className={tsb.th}>{p.donem}</th>
            ))}
            <th className={tsb.th}>{donem}</th>
            <th className={tsb.th}>Yıllık değişim</th>
            <th className={tsb.th}>{donem} · HD</th>
            <th className={tsb.th}>{donem} · H/E</th>
          </tr>
        </thead>
        <tbody>
          {KPI_LIST.map((item) => {
            const degisim = fmtDegisim(secili.SEKTOR[item.key], onceki?.SEKTOR[item.key]);
            return (
              <tr key={item.key} className={tsb.tbodyRow}>
                <th scope="row" className={cn(tsb.tdSticky, "text-left")}>
                  <span className="block font-semibold text-slate-900">{item.label}</span>
                  <span className="block text-[11px] font-normal text-slate-400">{item.hint}</span>
                </th>
                {yilKolonlari.map((p) => (
                  <td key={p.donem} className={cn(tsb.td, "text-right text-slate-500")}>
                    {fmtTl(p.SEKTOR[item.key])}
                  </td>
                ))}
                <td className={cn(tsb.td, "bg-emerald-50/40 text-right font-bold")}>
                  {fmtTl(secili.SEKTOR[item.key])}
                </td>
                <td className={cn(tsb.td, "text-right font-semibold", degisim.className)}>{degisim.text}</td>
                <td className={cn(tsb.td, "text-right")}>{fmtTl(secili.HD[item.key])}</td>
                <td className={cn(tsb.td, "text-right text-sky-700")}>
                  {fmtTl(secili.HAYAT_EMEKLILIK[item.key])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TsbTableShell>
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
  const [pool, setPool] = useState<SektorGorunumuPool>("SEKTOR");

  const [primDonemler, setPrimDonemler] = useState<string[]>([]);
  const [primDonem, setPrimDonem] = useState("");
  const [primRows, setPrimRows] = useState<TsbPrimRow[] | null>(null);

  const [finansalDonemler, setFinansalDonemler] = useState<string[]>([]);
  const [finansalDonem, setFinansalDonem] = useState("");
  const [finansalRows, setFinansalRows] = useState<TsbGelirTidyRowLike[] | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/data/tsb/prim-tidy.json").then(async (r) => {
        if (!r.ok) throw new Error("Prim verisi yüklenemedi");
        return (await r.json()) as TsbPrimRow[];
      }),
      fetchGelirTidyDonemIndex(),
    ])
      .then(([primData, finList]) => {
        if (cancelled) return;
        const primFiltered = primData.filter((row) => !isTsbToplamSirketKodu(row.sirketKodu));
        const pDonemler = uniqueSortedPeriods(primFiltered);
        setPrimRows(primFiltered);
        setPrimDonemler(pDonemler);
        setPrimDonem(pDonemler.at(-1) ?? "");
        setFinansalDonemler(finList);
        setFinansalDonem(finList.at(-1) ?? "");
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Veriler yüklenemedi"));
    return () => {
      cancelled = true;
    };
  }, []);

  const oncekiFinansal = useMemo(
    () => (finansalDonem ? oncekiYilDonem(finansalDonem) : null),
    [finansalDonem],
  );
  const trendFinansal = useMemo(
    () => (finansalDonem ? sektorGorunumuTrendDonemleri(finansalDonemler, finansalDonem) : []),
    [finansalDonemler, finansalDonem],
  );

  useEffect(() => {
    if (!finansalDonem) return;
    const yuklenecek = [
      ...new Set([
        ...trendFinansal,
        ...(oncekiFinansal && finansalDonemler.includes(oncekiFinansal) ? [oncekiFinansal] : []),
        finansalDonem,
      ]),
    ];
    let cancelled = false;
    fetchGelirTidyDonemler(yuklenecek)
      .then((data) => {
        if (!cancelled) setFinansalRows(data);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Finansal veri yüklenemedi"));
    return () => {
      cancelled = true;
    };
  }, [finansalDonem, oncekiFinansal, trendFinansal, finansalDonemler]);

  const primPaket = useMemo(() => {
    if (!primRows || !primDonem || !primDonemler.includes(primDonem)) return null;
    return buildSektorPrimPaket(primRows, primDonem, primDonemler);
  }, [primRows, primDonem, primDonemler]);

  const finansalPaket = useMemo(() => {
    if (!finansalRows || !finansalDonem || !finansalRows.some((row) => row.donem === finansalDonem)) {
      return null;
    }
    return buildSektorGorunumuPaket(
      finansalRows,
      finansalDonem,
      oncekiFinansal && finansalDonemler.includes(oncekiFinansal) ? oncekiFinansal : null,
      trendFinansal,
    );
  }, [finansalRows, finansalDonem, oncekiFinansal, trendFinansal, finansalDonemler]);

  if (error) return <TsbError message={error} />;
  if (!primPaket || !finansalPaket) return <TsbLoading message="Sektör görünümü hazırlanıyor…" />;

  const oncekiIlk10 = new Map(finansalPaket.ilk10Onceki.map((x) => [x.grup, x]));

  return (
    <div className={tsb.dashboardStack}>
      <TsbFilterBar>
        <div className="mb-3">
          <span className={tsb.filterLabel}>Sektör havuzu</span>
          <div className={tsb.btnGroup}>
            {(["SEKTOR", "HD", "HAYAT_EMEKLILIK"] as const).map((p) => (
              <TsbToggleButton key={p} variant="segment" pressed={pool === p} onClick={() => setPool(p)}>
                {POOL_LABEL[p]}
              </TsbToggleButton>
            ))}
          </div>
        </div>
        <TsbFilterGrid>
          <TsbFilterField
            label="Prim dönemi"
            hint="Aylık prim-tidy (YTD). Finansal dönemden bağımsızdır."
          >
            <TsbSelect value={primDonem} onChange={(e) => setPrimDonem(e.target.value)}>
              {[...primDonemler].reverse().map((d) => (
                <option key={d} value={d}>
                  {d} · {formatPrimYtdAralik(d)}
                </option>
              ))}
            </TsbSelect>
          </TsbFilterField>
          <TsbFilterField
            label="Finansal dönem"
            hint="Çeyreklik gelir/bilanço. Prim döneminden bağımsızdır."
          >
            <TsbSelect value={finansalDonem} onChange={(e) => setFinansalDonem(e.target.value)}>
              {[...finansalDonemler].reverse().map((d) => (
                <option key={d}>{d}</option>
              ))}
            </TsbSelect>
          </TsbFilterField>
        </TsbFilterGrid>
        <p className={tsb.filterHint}>
          Prim üretimi aylık, finansallar çeyrekliktir; dönemleri ayrı seçebilirsiniz.
          Tablolar her zaman <strong>HD + H/E sektör toplamını</strong> gösterir; havuz seçici yalnız kâr trendini değiştirir.
          Oranlar tutarların toplamından yeniden hesaplanır.
        </p>
      </TsbFilterBar>

      <section className={tsb.dataPanel} aria-labelledby="sg-prim">
        <div className={cn(tsb.dataPanelHeader, "flex flex-wrap items-end justify-between gap-2")}>
          <div>
            <h2 id="sg-prim" className={tsb.dataPanelTitle}>Prim üretimi</h2>
            <p className="mt-1 text-sm text-slate-500">
              {primDonem} · {formatPrimYtdAralik(primDonem)} · aynı ayın yıllar arası seyri
            </p>
          </div>
          <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
            {primPaket.secili.sirketSayisi} şirket
          </span>
        </div>
        <PrimUretimTable donem={primDonem} paket={primPaket} />
      </section>

      <section className={tsb.dataPanel} aria-labelledby="sg-kpi">
        <div className={cn(tsb.dataPanelHeader, "flex flex-wrap items-end justify-between gap-2")}>
          <div>
            <h2 id="sg-kpi" className={tsb.dataPanelTitle}>Finansal ana göstergeler</h2>
            <p className="mt-1 text-sm text-slate-500">
              {finansalDonem} · HD + Hayat/Emeklilik toplamı · aynı çeyreğin yıllar arası seyri
            </p>
          </div>
          <span className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
            {finansalPaket.secili.SEKTOR.sirketSayisi} şirket
          </span>
        </div>
        <KpiTable
          donem={finansalDonem}
          trend={finansalPaket.trend}
          secili={finansalPaket.secili}
          onceki={finansalPaket.onceki}
        />
      </section>

      <section className={tsb.chartPanel}>
        <div className="min-w-[720px]">
          <TsbSektorKarBilesenleriChart trend={finansalPaket.trend} pool={pool} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={tsb.chartPanel}>
          <TsbSektorBilançoStackedChart trend={finansalPaket.trend} metric="aktifToplami" title="Aktif büyüklüğü" />
        </div>
        <div className={tsb.chartPanel}>
          <TsbSektorBilançoStackedChart trend={finansalPaket.trend} metric="ozsermaye" title="Özsermaye büyüklüğü" />
        </div>
      </section>

      <section className={tsb.dataPanel}>
        <div className={tsb.dataPanelHeader}>
          <h2 className={tsb.dataPanelTitle}>Finansal sağlık oranları</h2>
          <p className="mt-1 text-sm text-slate-500">
            {finansalDonem} · HD, H/E ve birleşik sektör aynı hesap tabanında.
          </p>
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
                  <td className={cn(tsb.td, "text-right")}>{fmtPct(finansalPaket.secili.HD[r.key])}</td>
                  <td className={cn(tsb.td, "text-right")}>{fmtPct(finansalPaket.secili.HAYAT_EMEKLILIK[r.key])}</td>
                  <td className={cn(tsb.td, "bg-emerald-50/40 text-right font-bold")}>
                    {fmtPct(finansalPaket.secili.SEKTOR[r.key])}
                  </td>
                  <td className={cn(tsb.td, "text-right text-slate-500")}>
                    {fmtPct(finansalPaket.onceki?.SEKTOR[r.key] ?? null)}
                  </td>
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
            {finansalDonem} · her dönemde brüt prime göre yeniden sıralanır. Bu kırılım ölçek segmentasyonu değildir.
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
              {finansalPaket.ilk10.map((row) => {
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
        <Link href={`/sigorta/finansal-karsilastirma?donem=${finansalDonem}&pool=SEKTOR`} className={tsb.pillLink}>
          Finansal karşılaştırmada sektörü aç →
        </Link>
        <Link href="/sigorta/prim?panel=kanal-prim" className={tsb.pillLink}>Kanal prim detayı →</Link>
        <Link href="/sigorta/ana-brans-tkz" className={tsb.pillLink}>Ana branş TKZ →</Link>
        <Link href="/sigorta/hasar-prim-orani" className={tsb.pillLink}>Hasar / Prim →</Link>
      </div>
    </div>
  );
}
