/** SVG grafik hover balonu — koyu metin, okunaklı punto. */
export function TsbSvgTooltip({
  x,
  y,
  width = 196,
  lines,
}: {
  x: number;
  y: number;
  width?: number;
  lines: readonly { text: string; accent?: boolean; muted?: boolean }[];
}) {
  const lineH = 20;
  const padX = 12;
  const padY = 12;
  const height = padY * 2 + lines.length * lineH - 4;
  return (
    <g transform={`translate(${x}, ${y})`} pointerEvents="none">
      <rect
        width={width}
        height={height}
        rx={8}
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth={1.5}
        opacity={0.98}
      />
      {lines.map((line, i) => (
        <text
          key={`${i}-${line.text}`}
          x={padX}
          y={padY + 13 + i * lineH}
          fontSize={line.muted ? 12 : 13}
          fontWeight={line.accent ? 800 : line.muted ? 600 : 700}
          fill={line.accent ? "#047857" : line.muted ? "#334155" : "#0f172a"}
        >
          {line.text}
        </text>
      ))}
    </g>
  );
}

const yoyPf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 1 });

/** Önceki yıla göre yüzde değişim — kısa hover metni. */
export function tsbChartYoyLabel(bu: number, onceki: number | undefined | null): string {
  if (onceki === undefined || onceki === null || !Number.isFinite(onceki) || onceki === 0) {
    return "Önceki dönem artışı: —";
  }
  const d = ((bu - onceki) / Math.abs(onceki)) * 100;
  const sign = d > 0 ? "+" : "";
  return `Önceki dönem artışı: ${sign}${yoyPf.format(d)}%`;
}
