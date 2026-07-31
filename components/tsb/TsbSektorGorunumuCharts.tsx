"use client";

import type {
  SektorGorunumuDonem,
  SektorGorunumuPool,
  SektorGorunumuSnapshot,
} from "@/lib/tsbSektorGorunumu";

const W = 860;
const H = 350;
const PAD = { l: 78, r: 24, t: 62, b: 48 };
const COLORS = {
  safiTeknik: "#0f766e",
  yatirimGeliri: "#2563eb",
  teknikKar: "#7c3aed",
  netKar: "#e11d48",
  HD: "#0f766e",
  HAYAT_EMEKLILIK: "#38bdf8",
};

const tl = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

function fmtMr(v: number): string {
  return `${tl.format(v / 1e9)} Mr`;
}

function xAt(i: number, n: number): number {
  const inner = W - PAD.l - PAD.r;
  return PAD.l + (n <= 1 ? inner / 2 : (i / (n - 1)) * inner);
}

export function TsbSektorKarBilesenleriChart({
  trend,
  pool,
}: {
  trend: SektorGorunumuDonem[];
  pool: SektorGorunumuPool;
}) {
  const series: {
    key: keyof Pick<SektorGorunumuSnapshot, "safiTeknik" | "yatirimGeliri" | "teknikKar" | "netKar">;
    label: string;
  }[] = [
    { key: "safiTeknik", label: "Safî teknik" },
    { key: "yatirimGeliri", label: "Yatırım geliri" },
    { key: "teknikKar", label: "Teknik kâr" },
    { key: "netKar", label: "Net kâr" },
  ];
  const values = trend.flatMap((p) => series.map((s) => p[pool][s.key]));
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const span = max - min || 1;
  const yAt = (v: number) => PAD.t + ((max - v) / span) * (H - PAD.t - PAD.b);
  const ticks = Array.from({ length: 5 }, (_, i) => min + (span * i) / 4);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[720px] w-full" role="img" aria-label="Kâr bileşenleri trendi">
      <rect width={W} height={H} fill="#fff" />
      <text x={PAD.l} y={24} fontSize={14} fontWeight={700} fill="#0f172a">
        Kâr bileşenleri
      </text>
      <text x={PAD.l} y={42} fontSize={10} fill="#64748b">
        Aynı çeyreğin yıllar arası karşılaştırması · milyar TL
      </text>
      {ticks.map((tick, i) => {
        const y = yAt(tick);
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke={tick === 0 ? "#94a3b8" : "#e2e8f0"} />
            <text x={PAD.l - 9} y={y + 3} textAnchor="end" fontSize={9} fill="#64748b">
              {fmtMr(tick)}
            </text>
          </g>
        );
      })}
      {trend.map((p, i) => (
        <text key={p.donem} x={xAt(i, trend.length)} y={H - 17} textAnchor="middle" fontSize={10} fill="#475569">
          {p.donem}
        </text>
      ))}
      {series.map((s) => {
        const points = trend.map((p, i) => `${xAt(i, trend.length)},${yAt(p[pool][s.key])}`).join(" ");
        return (
          <g key={s.key}>
            <polyline points={points} fill="none" stroke={COLORS[s.key]} strokeWidth={2.5} strokeLinejoin="round" />
            {trend.map((p, i) => (
              <circle key={p.donem} cx={xAt(i, trend.length)} cy={yAt(p[pool][s.key])} r={3.5} fill={COLORS[s.key]}>
                <title>{`${s.label} · ${p.donem}: ${fmtMr(p[pool][s.key])} TL`}</title>
              </circle>
            ))}
          </g>
        );
      })}
      {series.map((s, i) => (
        <g key={`legend-${s.key}`} transform={`translate(${PAD.l + i * 150}, ${H - 2})`}>
          <line x1={0} x2={16} y1={-4} y2={-4} stroke={COLORS[s.key]} strokeWidth={3} />
          <text x={22} y={0} fontSize={10} fill="#475569">
            {s.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function TsbSektorBilançoStackedChart({
  trend,
  metric,
  title,
}: {
  trend: SektorGorunumuDonem[];
  metric: "aktifToplami" | "ozsermaye";
  title: string;
}) {
  const max = Math.max(1, ...trend.map((p) => p.HD[metric] + p.HAYAT_EMEKLILIK[metric]));
  const innerH = H - PAD.t - PAD.b;
  const yAt = (v: number) => PAD.t + innerH - (v / max) * innerH;
  const innerW = W - PAD.l - PAD.r;
  const band = innerW / Math.max(1, trend.length);
  const barW = Math.min(72, band * 0.52);
  const ticks = Array.from({ length: 5 }, (_, i) => (max * i) / 4);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto min-w-[620px] w-full" role="img" aria-label={title}>
      <rect width={W} height={H} fill="#fff" />
      <text x={PAD.l} y={25} fontSize={14} fontWeight={700} fill="#0f172a">
        {title}
      </text>
      <text x={PAD.l} y={43} fontSize={10} fill="#64748b">
        HD + H/E yığılmış görünüm · milyar TL
      </text>
      {ticks.map((tick, i) => {
        const y = yAt(tick);
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#e2e8f0" />
            <text x={PAD.l - 9} y={y + 3} textAnchor="end" fontSize={9} fill="#64748b">
              {fmtMr(tick)}
            </text>
          </g>
        );
      })}
      {trend.map((p, i) => {
        const cx = PAD.l + band * i + band / 2;
        const hdH = innerH - (yAt(p.HD[metric]) - PAD.t);
        const heH = innerH - (yAt(p.HAYAT_EMEKLILIK[metric]) - PAD.t);
        const base = PAD.t + innerH;
        return (
          <g key={p.donem}>
            <rect x={cx - barW / 2} y={base - hdH} width={barW} height={hdH} fill={COLORS.HD} rx={2} />
            <rect
              x={cx - barW / 2}
              y={base - hdH - heH}
              width={barW}
              height={heH}
              fill={COLORS.HAYAT_EMEKLILIK}
              rx={2}
            />
            <text x={cx} y={H - 18} textAnchor="middle" fontSize={10} fill="#475569">
              {p.donem}
            </text>
            <title>{`${p.donem} · HD ${fmtMr(p.HD[metric])} · H/E ${fmtMr(p.HAYAT_EMEKLILIK[metric])}`}</title>
          </g>
        );
      })}
      <g transform={`translate(${PAD.l}, ${H - 2})`}>
        <rect x={0} y={-11} width={12} height={8} fill={COLORS.HD} rx={1} />
        <text x={17} y={-3} fontSize={10} fill="#475569">Hayat dışı</text>
        <rect x={100} y={-11} width={12} height={8} fill={COLORS.HAYAT_EMEKLILIK} rx={1} />
        <text x={117} y={-3} fontSize={10} fill="#475569">Hayat / Emeklilik</text>
      </g>
    </svg>
  );
}
