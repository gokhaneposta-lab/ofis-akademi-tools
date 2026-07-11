"use client";

import type { PrimTrendAylikNokta } from "@/lib/tsbPrimTrend12";
import { tsbChart } from "@/components/tsb/tsbDashboardUi";

const COL_SEKTOR = tsbChart.sektor;
const COL_SIRKET = tsbChart.sirketBrut;
const CHART_W = 800;
const CHART_H = 400;

const nfMn = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0, minimumFractionDigits: 0 });

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
  const yAt = (v: number) => {
    const vv = v <= 0 ? floor * 0.45 : Math.max(v, floor * 0.45);
    return padT + innerH - ((Math.log10(vv) - lo) / (hiL - lo || 1e-9)) * innerH;
  };
  const tickVals = [0, 1 / 3, 2 / 3, 1].map((t) => Math.pow(10, lo + (hiL - lo) * t));
  return { yAt, tickVals };
}

type Props = {
  seri: PrimTrendAylikNokta[];
  sirketAdi: string;
  className?: string;
};

/** Son 12 ay prim trend — aylık üretim sütun grafiği (Prim Trend 12 ile aynı görsel). */
export default function TsbPrimTrendAylikBarChart({ seri, sirketAdi, className }: Props) {
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
      className={className ?? "h-auto w-full max-w-full overflow-hidden"}
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
        <tspan fill="#64748b"> — yeşil sütun. Kümülatif fark = o ayın primi.</tspan>
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
