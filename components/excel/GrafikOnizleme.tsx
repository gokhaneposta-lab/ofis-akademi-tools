"use client";

import type { ChartPoint, ChartType } from "@/lib/chartData";
import { CHART_COLORS } from "@/lib/chartData";

type Props = {
  points: ChartPoint[];
  type: ChartType;
  title: string;
};

const W = 640;
const H = 360;
const PAD = { top: 48, right: 24, bottom: 56, left: 56 };

function fmt(n: number): string {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
}

function BarChart({ points }: { points: ChartPoint[] }) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...points.map((p) => p.value), 1);
  const barW = Math.min(48, (innerW / points.length) * 0.65);
  const gap = innerW / points.length;

  return (
    <g>
      <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH} stroke="#e5e7eb" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="#e5e7eb" />
      {points.map((p, i) => {
        const h = (p.value / max) * innerH;
        const x = PAD.left + i * gap + (gap - barW) / 2;
        const y = PAD.top + innerH - h;
        const color = CHART_COLORS[i % CHART_COLORS.length];
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} fill={color} rx={3} />
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize={11}
              fill="#374151"
              fontFamily="system-ui, sans-serif"
            >
              {fmt(p.value)}
            </text>
            <text
              x={x + barW / 2}
              y={PAD.top + innerH + 18}
              textAnchor="middle"
              fontSize={11}
              fill="#6b7280"
              fontFamily="system-ui, sans-serif"
            >
              {p.label.length > 10 ? `${p.label.slice(0, 9)}…` : p.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function LineChart({ points }: { points: ChartPoint[] }) {
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = PAD.left + (i / Math.max(points.length - 1, 1)) * innerW;
    const y = PAD.top + innerH - ((p.value - min) / range) * innerH;
    return { x, y, p };
  });

  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");

  return (
    <g>
      <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH} stroke="#e5e7eb" />
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="#e5e7eb" />
      <path d={pathD} fill="none" stroke="#217346" strokeWidth={2.5} strokeLinejoin="round" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={5} fill="#217346" stroke="#fff" strokeWidth={2} />
          <text
            x={c.x}
            y={c.y - 10}
            textAnchor="middle"
            fontSize={11}
            fill="#374151"
            fontFamily="system-ui, sans-serif"
          >
            {fmt(c.p.value)}
          </text>
          <text
            x={c.x}
            y={PAD.top + innerH + 18}
            textAnchor="middle"
            fontSize={11}
            fill="#6b7280"
            fontFamily="system-ui, sans-serif"
          >
            {c.p.label.length > 8 ? `${c.p.label.slice(0, 7)}…` : c.p.label}
          </text>
        </g>
      ))}
    </g>
  );
}

function PieChart({ points }: { points: ChartPoint[] }) {
  const cx = W / 2;
  const cy = H / 2 + 8;
  const r = Math.min(W, H) / 2 - 72;
  const total = points.reduce((s, p) => s + p.value, 0) || 1;
  let angle = -Math.PI / 2;

  const slices = points.map((p, i) => {
    const slice = (p.value / total) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += slice;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = slice > Math.PI ? 1 : 0;
    const mid = angle - slice / 2;
    const lx = cx + (r + 22) * Math.cos(mid);
    const ly = cy + (r + 22) * Math.sin(mid);
    const color = CHART_COLORS[i % CHART_COLORS.length];
    const pct = ((p.value / total) * 100).toFixed(1);
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color, p, lx, ly, pct };
  });

  return (
    <g>
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.d} fill={s.color} stroke="#fff" strokeWidth={1.5} />
          <text
            x={s.lx}
            y={s.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="#374151"
            fontFamily="system-ui, sans-serif"
          >
            {s.p.label.length > 12 ? `${s.p.label.slice(0, 11)}…` : s.p.label} ({s.pct}%)
          </text>
        </g>
      ))}
    </g>
  );
}

export default function GrafikOnizleme({ points, type, title }: Props) {
  if (points.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className="max-w-full"
      role="img"
      aria-label={title || "Grafik önizlemesi"}
    >
      <rect width={W} height={H} fill="#ffffff" />
      {title ? (
        <text
          x={W / 2}
          y={28}
          textAnchor="middle"
          fontSize={16}
          fontWeight={600}
          fill="#111827"
          fontFamily="system-ui, sans-serif"
        >
          {title}
        </text>
      ) : null}
      {type === "bar" ? <BarChart points={points} /> : null}
      {type === "line" ? <LineChart points={points} /> : null}
      {type === "pie" ? <PieChart points={points} /> : null}
    </svg>
  );
}
