export type ChartPoint = { label: string; value: number };

export type ChartType = "bar" | "line" | "pie";

/** Excel'den yapıştırılan etiket + değer sütunlarını ayrıştırır (tab veya noktalı virgül). */
export function parseLabelValues(text: string): ChartPoint[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sep = /[\t;]/;
  const out: ChartPoint[] = [];

  for (const line of lines) {
    const parts = line.split(sep).map((p) => p.trim());
    if (parts.length < 2) continue;

    const label = parts[0];
    const raw = parts[1];
    const normalized = raw
      .replace(/\s/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "")
      .replace(",", ".");
    const value = parseFloat(normalized);
    if (!label || Number.isNaN(value)) continue;
    out.push({ label, value });
  }

  return out;
}

/** İlk satır başlık gibi görünüyorsa atla. */
export function parseLabelValuesSkipHeader(text: string): ChartPoint[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const firstParts = lines[0].split(/[\t;]/).map((p) => p.trim());
  if (firstParts.length >= 2) {
    const maybeNum = firstParts[1]
      .replace(/\s/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "")
      .replace(",", ".");
    if (Number.isNaN(parseFloat(maybeNum))) {
      return parseLabelValues(lines.slice(1).join("\n"));
    }
  }
  return parseLabelValues(text);
}

export const CHART_COLORS = [
  "#217346",
  "#2563eb",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#0d9488",
  "#ea580c",
];
