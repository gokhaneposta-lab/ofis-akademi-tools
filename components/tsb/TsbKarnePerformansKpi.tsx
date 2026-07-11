"use client";

import { useMemo } from "react";
import type { SirketKarnePrimPaket } from "@/lib/tsbSirketKarne";
import { formatPrimYtdAralik } from "@/lib/tsbPrimDonemEtiket";
import {
  finansalKiyaslamaDegisim,
  finansalKiyaslamaSatirSayisal,
  formatFinansalDegisim,
  formatFinansalHucre,
  type FinansalKiyaslamaDonemPaketi,
  type FinansalKiyaslamaSatirFormat,
} from "@/lib/tsbFinansalKarsilastirmaData";
import {
  cn,
  tsb,
  tsbFormatDegisimYuzde,
  tsbFormatPp,
  tsbFormatPrim,
} from "@/components/tsb/tsbDashboardUi";

const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

type KpiRow = { label: string; value: string; bold?: boolean };

type KarnePerformansKpi = {
  title: string;
  donutPct: number;
  donutLabel: string;
  donutColor: string;
  rows: KpiRow[];
};

type FinSatirId = Parameters<typeof finansalKiyaslamaSatirSayisal>[0];

export function formatSiraDegisim(onceki: number | null, bu: number | null): string {
  if (onceki === null || bu === null) return "—";
  const diff = onceki - bu;
  if (diff === 0) return "Sabit";
  if (diff > 0) return `${diff} ↑`;
  return `${Math.abs(diff)} ↓`;
}

function KpiDonut({
  pct,
  centerLabel,
  color,
  size = 76,
  strokeWidth = 9,
}: {
  pct: number;
  centerLabel: string;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const c = 2 * Math.PI * r;
  const arc = (Math.min(Math.max(pct, 0), 100) / 100) * c;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="#e8edf3"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arc} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center px-1 text-center">
        <span className="text-[11px] font-bold leading-tight tabular-nums text-slate-900 sm:text-xs">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

function KarnePerformansCard({ kpi }: { kpi: KarnePerformansKpi }) {
  return (
    <article className={tsb.karnePerformansCard}>
      <h3 className={tsb.karnePerformansTitle}>{kpi.title}</h3>
      <div className="mt-3 flex items-center gap-3 sm:gap-4">
        <KpiDonut pct={kpi.donutPct} centerLabel={kpi.donutLabel} color={kpi.donutColor} />
        <dl className="min-w-0 flex-1 space-y-1.5">
          {kpi.rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-2">
              <dt className={tsb.karnePerformansRowLabel}>{row.label}</dt>
              <dd
                className={cn(
                  tsb.karnePerformansRowValue,
                  row.bold && "font-bold text-slate-900",
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

function KarnePerformansGridSection({
  eyebrow,
  kpis,
}: {
  eyebrow: string;
  kpis: KarnePerformansKpi[];
}) {
  if (kpis.length === 0) return null;
  return (
    <section aria-label={eyebrow}>
      <p className={tsb.karnePerformansEyebrow}>{eyebrow}</p>
      <div className={tsb.karnePerformansGrid}>
        {kpis.map((kpi) => (
          <KarnePerformansCard key={kpi.title} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}

function finSayisal(paket: FinansalKiyaslamaDonemPaketi, id: FinSatirId): number | null {
  return finansalKiyaslamaSatirSayisal(
    id,
    paket.sirketHam,
    paket.kiyasHam,
    paket.sirketSkorHam,
    paket.kiyasOran,
    paket.kiyasSkorHam,
    paket.sirketHp,
    paket.kiyasHp,
  ).sirket;
}

function degisimRenk(deger: number | null): string {
  if (deger === null || !Number.isFinite(deger)) return "#94a3b8";
  return deger >= 0 ? "#f97316" : "#ef4444";
}

function buildFinKpiCard(
  title: string,
  id: FinSatirId,
  format: FinansalKiyaslamaSatirFormat,
  buPaket: FinansalKiyaslamaDonemPaketi,
  oncePaket: FinansalKiyaslamaDonemPaketi | null,
  buDonem: string,
  onceDonem: string | null,
): KarnePerformansKpi {
  const buVal = finSayisal(buPaket, id);
  const onceVal = oncePaket ? finSayisal(oncePaket, id) : null;
  const delta = finansalKiyaslamaDegisim(buVal, onceVal, format);

  if (format === "yuzde" || format === "oran") {
    const donutPct = buVal !== null ? Math.min(buVal * 100, 100) : 0;
    return {
      title,
      donutPct,
      donutLabel: formatFinansalHucre(buVal, format),
      donutColor: "#059669",
      rows: [
        { label: buDonem, value: formatFinansalHucre(buVal, format), bold: true },
        {
          label: onceDonem ?? "Geçen yıl",
          value: formatFinansalHucre(onceVal, format),
        },
        { label: "Değişim", value: formatFinansalDegisim(delta.deger, delta.format) },
      ],
    };
  }

  const donutPct =
    delta.deger !== null && delta.format === "yuzdeDegisim"
      ? Math.min(Math.abs(delta.deger * 100), 100)
      : 0;

  return {
    title,
    donutPct,
    donutLabel: formatFinansalDegisim(delta.deger, delta.format),
    donutColor: degisimRenk(delta.deger),
    rows: [
      { label: buDonem, value: formatFinansalHucre(buVal, format), bold: true },
      {
        label: onceDonem ?? "Geçen yıl",
        value: formatFinansalHucre(onceVal, format),
      },
      { label: "Değişim", value: formatFinansalDegisim(delta.deger, delta.format) },
    ],
  };
}

function buildKarnePrimPerformansKpis(
  primPaket: SirketKarnePrimPaket,
  donem: string,
): KarnePerformansKpi[] {
  const toplamYtd = primPaket.ytd.toplam;
  const topKanal = [...primPaket.kanalSatirlari].sort((a, b) => b.payBuYuzde - a.payBuYuzde)[0];
  const yilBu = donem.slice(0, 4);
  const ytdEtiketBu = formatPrimYtdAralik(donem);
  const ytdEtiketOnceki = formatPrimYtdAralik(primPaket.donemOnceki);
  const degisim = toplamYtd.sirketDegisim;
  const degisimRenk =
    degisim === null || !Number.isFinite(degisim)
      ? "#94a3b8"
      : degisim >= 0
        ? "#f97316"
        : "#ef4444";

  const sira = primPaket.portfoySirasi.sira;
  const katilimci = primPaket.portfoySirasi.katilimci;
  const siraOnceki = primPaket.portfoySirasiOnceki.sira;
  const katilimciOnceki = primPaket.portfoySirasiOnceki.katilimci;
  const siraPct =
    sira !== null && katilimci > 0 ? ((katilimci - sira + 1) / katilimci) * 100 : 0;

  const kanalPay = topKanal?.payBuYuzde ?? 0;
  const pazarPay = toplamYtd.payBuYuzde;
  const pazarPayOnceki = toplamYtd.payOncekiYuzde;
  const payDegisimPp = toplamYtd.payDegisimPp;
  const pazarDonutArc = Math.min((pazarPay / 20) * 100, 100);

  return [
    {
      title: "Kümül prim",
      donutPct: degisim !== null && Number.isFinite(degisim) ? Math.min(Math.abs(degisim), 100) : 0,
      donutLabel:
        degisim !== null && Number.isFinite(degisim) ? tsbFormatDegisimYuzde(degisim) : "—",
      donutColor: degisimRenk,
      rows: [
        {
          label: ytdEtiketBu,
          value: tsbFormatPrim(toplamYtd.sirketPrimBu),
          bold: true,
        },
        {
          label: ytdEtiketOnceki,
          value: tsbFormatPrim(toplamYtd.sirketPrimOnceki),
        },
        {
          label: "Değişim",
          value:
            degisim !== null && Number.isFinite(degisim) ? tsbFormatDegisimYuzde(degisim) : "—",
        },
      ],
    },
    {
      title: "Sektör prim sırası",
      donutPct: siraPct,
      donutLabel: sira !== null ? `${sira}` : "—",
      donutColor: "#059669",
      rows: [
        {
          label: donem,
          value: sira !== null ? `${sira} / ${katilimci}` : "—",
          bold: true,
        },
        {
          label: primPaket.donemOnceki,
          value: siraOnceki !== null ? `${siraOnceki} / ${katilimciOnceki}` : "—",
        },
        {
          label: "Değişim",
          value: formatSiraDegisim(siraOnceki, sira),
        },
      ],
    },
    {
      title: "Önde kanal",
      donutPct: kanalPay,
      donutLabel: topKanal ? `%${pf.format(kanalPay)}` : "—",
      donutColor: "#2563eb",
      rows: [
        {
          label: "Kanal",
          value: topKanal?.label ?? "—",
          bold: true,
        },
        {
          label: `${yilBu} YTD üretim`,
          value: topKanal ? tsbFormatPrim(topKanal.uretimBu) : "—",
        },
        {
          label: "Kanal payı",
          value: topKanal ? `%${pf.format(kanalPay)}` : "—",
        },
      ],
    },
    {
      title: "Kümül pazar payı",
      donutPct: pazarDonutArc,
      donutLabel: `%${pf.format(pazarPay)}`,
      donutColor: "#0891b2",
      rows: [
        {
          label: ytdEtiketBu,
          value: `%${pf.format(pazarPay)}`,
          bold: true,
        },
        {
          label: ytdEtiketOnceki,
          value: `%${pf.format(pazarPayOnceki)}`,
        },
        {
          label: "Değişim",
          value: tsbFormatPp(payDegisimPp),
        },
      ],
    },
  ];
}

function buildFinansalPerformansKpis(
  finPaket: FinansalKiyaslamaDonemPaketi,
  finPaketOnceki: FinansalKiyaslamaDonemPaketi | null,
  finDonem: string,
  finDonemOnceki: string | null,
): KarnePerformansKpi[] {
  const defs: { title: string; id: FinSatirId; format: FinansalKiyaslamaSatirFormat }[] = [
    { title: "Brüt prim", id: "prim", format: "tl" },
    { title: "Safi teknik K/Z", id: "safi_teknik", format: "tl" },
    { title: "Yatırım geliri", id: "yatirim", format: "tl" },
    { title: "Net kar", id: "net_kar", format: "tl" },
  ];
  return defs.map((d) =>
    buildFinKpiCard(d.title, d.id, d.format, finPaket, finPaketOnceki, finDonem, finDonemOnceki),
  );
}

function buildTeknikPerformansKpis(
  finPaket: FinansalKiyaslamaDonemPaketi,
  finPaketOnceki: FinansalKiyaslamaDonemPaketi | null,
  finDonem: string,
  finDonemOnceki: string | null,
): KarnePerformansKpi[] {
  const defs: { title: string; id: FinSatirId; format: FinansalKiyaslamaSatirFormat }[] = [
    { title: "Brüt H/P", id: "brut_hp", format: "yuzde" },
    { title: "Net H/P", id: "net_hp", format: "yuzde" },
    { title: "Teknik K/Z", id: "teknik_kar_zarar", format: "tl" },
    { title: "Safi teknik / prim", id: "oran_safi_prim", format: "yuzde" },
  ];
  return defs.map((d) =>
    buildFinKpiCard(d.title, d.id, d.format, finPaket, finPaketOnceki, finDonem, finDonemOnceki),
  );
}

function buildPazarPerformansKpis(primPaket: SirketKarnePrimPaket): KarnePerformansKpi[] {
  const onceMap = new Map(primPaket.payDilimleriOnceki.map((d) => [d.etiket, d]));
  const top3 = [...primPaket.payDilimleriBu]
    .filter((d) => d.sirketPay > 0.3)
    .sort((a, b) => b.sirketPay - a.sirketPay)
    .slice(0, 3);

  return top3.map((d, i) => {
    const oc = onceMap.get(d.etiket);
    const payOnceki = oc?.sirketPay ?? null;
    const ppDegisim =
      payOnceki !== null && payOnceki !== undefined ? d.sirketPay - payOnceki : null;

    return {
      title: `Branş payı #${i + 1}`,
      donutPct: Math.min(d.sirketPay, 100),
      donutLabel: `%${pf.format(d.sirketPay)}`,
      donutColor: "#0891b2",
      rows: [
        {
          label: primPaket.donemBu,
          value: `${d.etiket} · %${pf.format(d.sirketPay)}`,
          bold: true,
        },
        {
          label: primPaket.donemOnceki,
          value:
            payOnceki !== null && payOnceki !== undefined
              ? `%${pf.format(payOnceki)}`
              : "—",
        },
        {
          label: "Değişim",
          value: tsbFormatPp(ppDegisim),
        },
      ],
    };
  });
}

export function KarnePrimPerformansGrid({
  primPaket,
  donem,
}: {
  primPaket: SirketKarnePrimPaket;
  donem: string;
}) {
  const kpis = useMemo(() => buildKarnePrimPerformansKpis(primPaket, donem), [primPaket, donem]);
  return <KarnePerformansGridSection eyebrow="Performans özeti" kpis={kpis} />;
}

export function KarneFinansalPerformansGrid({
  finPaket,
  finPaketOnceki,
  finDonem,
  finDonemOnceki,
}: {
  finPaket: FinansalKiyaslamaDonemPaketi;
  finPaketOnceki: FinansalKiyaslamaDonemPaketi | null;
  finDonem: string;
  finDonemOnceki: string | null;
}) {
  const kpis = useMemo(
    () => buildFinansalPerformansKpis(finPaket, finPaketOnceki, finDonem, finDonemOnceki),
    [finPaket, finPaketOnceki, finDonem, finDonemOnceki],
  );
  return <KarnePerformansGridSection eyebrow="Finansal özet" kpis={kpis} />;
}

export function KarneTeknikPerformansGrid({
  finPaket,
  finPaketOnceki,
  finDonem,
  finDonemOnceki,
}: {
  finPaket: FinansalKiyaslamaDonemPaketi;
  finPaketOnceki: FinansalKiyaslamaDonemPaketi | null;
  finDonem: string;
  finDonemOnceki: string | null;
}) {
  const kpis = useMemo(
    () => buildTeknikPerformansKpis(finPaket, finPaketOnceki, finDonem, finDonemOnceki),
    [finPaket, finPaketOnceki, finDonem, finDonemOnceki],
  );
  return <KarnePerformansGridSection eyebrow="Teknik özet" kpis={kpis} />;
}

export function KarnePazarPerformansGrid({ primPaket }: { primPaket: SirketKarnePrimPaket }) {
  const kpis = useMemo(() => buildPazarPerformansKpis(primPaket), [primPaket]);
  return <KarnePerformansGridSection eyebrow="Pazar özeti" kpis={kpis} />;
}
