"use client";

import { useMemo } from "react";
import type { SirketKarnePrimPaket } from "@/lib/tsbSirketKarne";
import { formatPrimYtdAralik } from "@/lib/tsbPrimDonemEtiket";
import {
  cn,
  tsb,
  tsbFormatDegisimYuzde,
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

function buildKarnePrimPerformansKpis(
  primPaket: SirketKarnePrimPaket,
  donem: string,
): KarnePerformansKpi[] {
  const toplamYtd = primPaket.ytd.toplam;
  const topKanal = [...primPaket.kanalSatirlari].sort((a, b) => b.payBuYuzde - a.payBuYuzde)[0];
  const yilBu = donem.slice(0, 4);
  const yilOnceki = primPaket.donemOnceki.slice(0, 4);
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
  const siraPct =
    sira !== null && katilimci > 0 ? ((katilimci - sira + 1) / katilimci) * 100 : 0;

  const kanalPay = topKanal?.payBuYuzde ?? 0;
  const pazarPay = toplamYtd.payBuYuzde;
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
          label: "Sıra",
          value: sira !== null ? `${sira} / ${katilimci}` : "—",
          bold: true,
        },
        {
          label: "Katılımcı",
          value: katilimci > 0 ? String(katilimci) : "—",
        },
        {
          label: `${yilBu} YTD prim`,
          value: tsbFormatPrim(toplamYtd.sirketPrimBu),
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
          label: "Pazar payı",
          value: `%${pf.format(pazarPay)}`,
          bold: true,
        },
        {
          label: `${yilBu} şirket`,
          value: tsbFormatPrim(toplamYtd.sirketPrimBu),
        },
        {
          label: `${yilBu} sektör`,
          value: tsbFormatPrim(toplamYtd.sektorPrimBu),
        },
      ],
    },
  ];
}

export function KarnePrimPerformansGrid({
  primPaket,
  donem,
}: {
  primPaket: SirketKarnePrimPaket;
  donem: string;
}) {
  const kpis = useMemo(() => buildKarnePrimPerformansKpis(primPaket, donem), [primPaket, donem]);
  return (
    <section aria-label="Performans özeti">
      <p className={tsb.karnePerformansEyebrow}>Performans özeti</p>
      <div className={tsb.karnePerformansGrid}>
        {kpis.map((kpi) => (
          <KarnePerformansCard key={kpi.title} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}
