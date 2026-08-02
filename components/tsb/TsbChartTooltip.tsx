/** SVG grafik hover balonu — kompakt, koyu metin. */
export function TsbSvgTooltip({
  x,
  y,
  width = 148,
  lines,
}: {
  x: number;
  y: number;
  width?: number;
  lines: readonly { text: string; accent?: boolean; muted?: boolean }[];
}) {
  const lineH = 14;
  const padX = 8;
  const padY = 7;
  const height = padY * 2 + lines.length * lineH - 2;
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      <rect
        width={width}
        height={height}
        rx={6}
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth={1.25}
        opacity={0.97}
      />
      {lines.map((line, i) => (
        <text
          key={`${i}-${line.text}`}
          x={padX}
          y={padY + 10 + i * lineH}
          fontSize={line.muted ? 10 : 11}
          fontWeight={line.accent ? 800 : line.muted ? 600 : 700}
          fill={line.accent ? "#047857" : line.muted ? "#334155" : "#0f172a"}
        >
          {line.text}
        </text>
      ))}
    </g>
  );
}

const yoyPf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1, minimumFractionDigits: 0 });

/** Önceki yıla göre yüzde — kısa hover. */
export function tsbChartYoyLabel(bu: number, onceki: number | undefined | null): string {
  if (onceki === undefined || onceki === null || !Number.isFinite(onceki) || onceki === 0) {
    return "Artış: —";
  }
  const d = ((bu - onceki) / Math.abs(onceki)) * 100;
  const sign = d > 0 ? "+" : "";
  return `Artış: ${sign}${yoyPf.format(d)}%`;
}
