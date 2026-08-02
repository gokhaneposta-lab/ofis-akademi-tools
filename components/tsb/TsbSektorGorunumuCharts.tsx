"use client";

import { useState } from "react";
import type {
  SektorGorunumuDonem,
  SektorGorunumuPool,
  SektorGorunumuSnapshot,
  SektorPrimSnapshot,
} from "@/lib/tsbSektorGorunumu";
import { TsbSvgTooltip, tsbChartYoyLabel } from "@/components/tsb/TsbChartTooltip";

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

type KarHover = {
  series: keyof Pick<SektorGorunumuSnapshot, "safiTeknik" | "yatirimGeliri" | "teknikKar" | "netKar">;
  label: string;
  i: number;
} | null;

export function TsbSektorKarBilesenleriChart({
  trend,
  pool,
}: {
  trend: SektorGorunumuDonem[];
  pool: SektorGorunumuPool;
}) {
  const [hover, setHover] = useState<KarHover>(null);
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

  const tip =
    hover !== null
      ? (() => {
          const p = trend[hover.i];
          const onceki = hover.i > 0 ? trend[hover.i - 1] : null;
          const bu = p[pool][hover.series];
          const onc = onceki ? onceki[pool][hover.series] : null;
          return {
            x: Math.min(W - 210, Math.max(PAD.l, xAt(hover.i, trend.length) + 12)),
            y: Math.max(8, yAt(bu) - 56),
            lines: [
              { text: `${hover.label} · ${p.donem}` },
              { text: fmtMr(bu), muted: true },
              {
                text: onceki ? tsbChartYoyLabel(bu, onc) : "YoY: — (önceki yok)",
                accent: true,
              },
            ],
          };
        })()
      : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto min-w-[720px] w-full"
      role="img"
      aria-label="Kâr bileşenleri trendi"
      onMouseLeave={() => setHover(null)}
    >
      <rect width={W} height={H} fill="#fff" />
      <text x={PAD.l} y={24} fontSize={14} fontWeight={700} fill="#0f172a">
        Kâr bileşenleri
      </text>
      <text x={PAD.l} y={42} fontSize={10} fill="#64748b">
        Aynı çeyreğin yıllar arası karşılaştırması · milyar TL · hover = YoY
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
              <circle
                key={p.donem}
                cx={xAt(i, trend.length)}
                cy={yAt(p[pool][s.key])}
                r={hover?.series === s.key && hover.i === i ? 6 : 4}
                fill={COLORS[s.key]}
                className="cursor-pointer"
                onMouseEnter={() => setHover({ series: s.key, label: s.label, i })}
              />
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
      {tip ? <TsbSvgTooltip x={tip.x} y={tip.y} width={200} lines={tip.lines} /> : null}
    </svg>
  );
}

type PrimHover = { i: number; key: "HD" | "HE" } | null;

/** Prim üretimi — yıllar arası gruplu bar (HD | H/E); tüm etiketler + hover YoY. */
export function TsbSektorPrimUretimChart({
  trend,
  seciliDonem,
}: {
  trend: SektorPrimSnapshot[];
  seciliDonem: string;
}) {
  const [hover, setHover] = useState<PrimHover>(null);
  const max = Math.max(1, ...trend.flatMap((p) => [p.HD, p.HAYAT_EMEKLILIK]));
  const chartH = H + 8;
  const padB = 56;
  const padT = PAD.t + 8;
  const innerH = chartH - padT - padB;
  const yAt = (v: number) => padT + innerH - (v / max) * innerH;
  const innerW = W - PAD.l - PAD.r;
  const band = innerW / Math.max(1, trend.length);
  const gap = 4;
  const barW = Math.min(28, (band * 0.62 - gap) / 2);
  const ticks = Array.from({ length: 5 }, (_, i) => (max * i) / 4);
  const lastIdx = trend.length - 1;

  const tip =
    hover !== null
      ? (() => {
          const p = trend[hover.i];
          const onceki = hover.i > 0 ? trend[hover.i - 1] : null;
          const bu = hover.key === "HD" ? p.HD : p.HAYAT_EMEKLILIK;
          const onc = onceki ? (hover.key === "HD" ? onceki.HD : onceki.HAYAT_EMEKLILIK) : null;
          const label = hover.key === "HD" ? "Hayat dışı" : "Hayat / Emeklilik";
          const cx = PAD.l + band * hover.i + band / 2;
          return {
            x: Math.min(W - 210, Math.max(PAD.l, cx + 16)),
            y: padT + 4,
            lines: [
              { text: `${label} · ${p.donem}` },
              { text: fmtMr(bu), muted: true },
              {
                text: onceki
                  ? `${tsbChartYoyLabel(bu, onc)} vs ${onceki.donem}`
                  : "YoY: — (önceki yıl yok)",
                accent: true,
              },
            ],
          };
        })()
      : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${chartH}`}
      className="h-auto min-w-[620px] w-full"
      role="img"
      aria-label="Prim üretimi — hayat dışı ve hayat/emeklilik"
      onMouseLeave={() => setHover(null)}
    >
      <rect width={W} height={chartH} fill="#fff" />
      <text x={PAD.l} y={25} fontSize={14} fontWeight={700} fill="#0f172a">
        Prim üretimi
      </text>
      <text x={PAD.l} y={43} fontSize={10} fill="#64748b">
        Aynı ayın yıllar arası seyri · etiket = tutar · hover = YoY
      </text>
      <g transform={`translate(${W - PAD.r - 220}, 18)`}>
        <rect x={0} y={0} width={12} height={8} fill={COLORS.HD} rx={1} />
        <text x={17} y={8} fontSize={10} fill="#475569">
          Hayat dışı
        </text>
        <rect x={100} y={0} width={12} height={8} fill={COLORS.HAYAT_EMEKLILIK} rx={1} />
        <text x={117} y={8} fontSize={10} fill="#475569">
          Hayat / Emeklilik
        </text>
      </g>
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
        const isSecili = p.donem === seciliDonem;
        const isIlk = i === 0;
        const isSon = i === lastIdx;
        const base = padT + innerH;
        const hdH = Math.max(0, base - yAt(p.HD));
        const heH = Math.max(0, base - yAt(p.HAYAT_EMEKLILIK));
        const hdX = cx - gap / 2 - barW;
        const heX = cx + gap / 2;
        const labelFill = isSecili ? "#0f172a" : "#334155";
        const hdActive = hover?.i === i && hover.key === "HD";
        const heActive = hover?.i === i && hover.key === "HE";
        return (
          <g key={p.donem}>
            {isSecili ? (
              <rect
                x={cx - band * 0.42}
                y={padT - 6}
                width={band * 0.84}
                height={innerH + 14}
                fill="#ecfdf5"
                rx={6}
              />
            ) : null}
            <rect
              x={hdX}
              y={base - hdH}
              width={barW}
              height={hdH}
              fill={COLORS.HD}
              fillOpacity={isSecili || hdActive ? 1 : 0.78}
              rx={2}
              stroke={isSecili || hdActive ? "#134e4a" : "none"}
              strokeWidth={isSecili || hdActive ? 1.5 : 0}
              className="cursor-pointer"
              onMouseEnter={() => setHover({ i, key: "HD" })}
            />
            <rect
              x={heX}
              y={base - heH}
              width={barW}
              height={heH}
              fill={COLORS.HAYAT_EMEKLILIK}
              fillOpacity={isSecili || heActive ? 1 : 0.78}
              rx={2}
              stroke={isSecili || heActive ? "#0369a1" : "none"}
              strokeWidth={isSecili || heActive ? 1.5 : 0}
              className="cursor-pointer"
              onMouseEnter={() => setHover({ i, key: "HE" })}
            />
            <text
              x={hdX + barW / 2}
              y={base - hdH - 6}
              textAnchor="middle"
              fontSize={isSecili ? 10 : 9}
              fontWeight={700}
              fill={COLORS.HD}
            >
              {fmtMr(p.HD)}
            </text>
            <text
              x={heX + barW / 2}
              y={base - heH - 6}
              textAnchor="middle"
              fontSize={isSecili ? 10 : 9}
              fontWeight={700}
              fill="#0284c7"
            >
              {fmtMr(p.HAYAT_EMEKLILIK)}
            </text>
            <text
              x={cx}
              y={chartH - 28}
              textAnchor="middle"
              fontSize={isSecili ? 11 : 10}
              fontWeight={isSecili ? 700 : 500}
              fill={labelFill}
            >
              {p.donem}
            </text>
            {isIlk || isSon ? (
              <text
                x={cx}
                y={chartH - 14}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fill={isSon ? "#047857" : "#64748b"}
              >
                {isIlk ? "← başlangıç" : "son dönem →"}
              </text>
            ) : null}
          </g>
        );
      })}
      {tip ? <TsbSvgTooltip x={tip.x} y={tip.y} width={208} lines={tip.lines} /> : null}
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
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const max = Math.max(1, ...trend.map((p) => p.HD[metric] + p.HAYAT_EMEKLILIK[metric]));
  const innerH = H - PAD.t - PAD.b;
  const yAt = (v: number) => PAD.t + innerH - (v / max) * innerH;
  const innerW = W - PAD.l - PAD.r;
  const band = innerW / Math.max(1, trend.length);
  const barW = Math.min(72, band * 0.52);
  const ticks = Array.from({ length: 5 }, (_, i) => (max * i) / 4);

  const tip =
    hoverIdx !== null
      ? (() => {
          const p = trend[hoverIdx];
          const onceki = hoverIdx > 0 ? trend[hoverIdx - 1] : null;
          const bu = p.HD[metric] + p.HAYAT_EMEKLILIK[metric];
          const onc = onceki ? onceki.HD[metric] + onceki.HAYAT_EMEKLILIK[metric] : null;
          const cx = PAD.l + band * hoverIdx + band / 2;
          return {
            x: Math.min(W - 220, Math.max(PAD.l, cx + 12)),
            y: PAD.t,
            lines: [
              { text: p.donem },
              { text: `HD ${fmtMr(p.HD[metric])} · H/E ${fmtMr(p.HAYAT_EMEKLILIK[metric])}`, muted: true },
              {
                text: onceki ? `${tsbChartYoyLabel(bu, onc)} vs ${onceki.donem}` : "YoY: — (önceki yok)",
                accent: true,
              },
            ],
          };
        })()
      : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto min-w-[620px] w-full"
      role="img"
      aria-label={title}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <rect width={W} height={H} fill="#fff" />
      <text x={PAD.l} y={25} fontSize={14} fontWeight={700} fill="#0f172a">
        {title}
      </text>
      <text x={PAD.l} y={43} fontSize={10} fill="#64748b">
        HD + H/E yığılmış · milyar TL · hover = YoY
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
        const active = hoverIdx === i;
        return (
          <g key={p.donem} className="cursor-pointer" onMouseEnter={() => setHoverIdx(i)}>
            <rect
              x={cx - barW / 2}
              y={base - hdH}
              width={barW}
              height={hdH}
              fill={COLORS.HD}
              fillOpacity={active ? 1 : 0.85}
              rx={2}
            />
            <rect
              x={cx - barW / 2}
              y={base - hdH - heH}
              width={barW}
              height={heH}
              fill={COLORS.HAYAT_EMEKLILIK}
              fillOpacity={active ? 1 : 0.85}
              rx={2}
            />
            <text x={cx} y={H - 18} textAnchor="middle" fontSize={10} fill="#334155" fontWeight={active ? 700 : 400}>
              {p.donem}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${PAD.l}, ${H - 2})`}>
        <rect x={0} y={-11} width={12} height={8} fill={COLORS.HD} rx={1} />
        <text x={17} y={-3} fontSize={10} fill="#475569">
          Hayat dışı
        </text>
        <rect x={100} y={-11} width={12} height={8} fill={COLORS.HAYAT_EMEKLILIK} rx={1} />
        <text x={117} y={-3} fontSize={10} fill="#475569">
          Hayat / Emeklilik
        </text>
      </g>
      {tip ? <TsbSvgTooltip x={tip.x} y={tip.y} width={214} lines={tip.lines} /> : null}
    </svg>
  );
}
