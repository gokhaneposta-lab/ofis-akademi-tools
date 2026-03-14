/**
 * Excel'den yapıştırılan metinden sayı listesi çıkarır.
 * Virgül, noktalı virgül, tab, satır sonu ile ayrılmış; ondalık ayracı virgül veya nokta.
 */
export function parseNumbers(text: string): number[] {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/,/g, ".");
  const tokens = normalized.split(/[\s\t\n;]+/).filter((s) => s.length > 0);
  const out: number[] = [];
  for (const t of tokens) {
    const n = parseFloat(t);
    if (!Number.isNaN(n)) out.push(n);
  }
  return out;
}

/** İki sütun (X, Y) — satır veya tab/semicolon ile ayrılmış */
export function parseTwoColumns(text: string): { x: number[]; y: number[] } {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const x: number[] = [];
  const y: number[] = [];
  const sep = /[\t;]/;
  for (const line of lines) {
    const parts = line.split(sep).map((p) => parseFloat(p.replace(/,/g, ".").trim()));
    if (parts.length >= 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
      x.push(parts[0]);
      y.push(parts[1]);
    }
  }
  return { x, y };
}

export function mean(arr: number[]): number {
  if (arr.length === 0) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function std(arr: number[], usePopulation = false): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const n = usePopulation ? arr.length : arr.length - 1;
  const sumSq = arr.reduce((s, v) => s + (v - m) ** 2, 0);
  return Math.sqrt(sumSq / n);
}

export function variance(arr: number[], usePopulation = false): number {
  const s = std(arr, usePopulation);
  return s * s;
}

/** Sıralı dizide p yüzdesi (0..1). Linear interpolation (Excel PERCENTILE.INC benzeri) */
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = p * (sorted.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  if (i >= sorted.length - 1) return sorted[sorted.length - 1];
  return sorted[i] * (1 - f) + sorted[i + 1] * f;
}

export function quartile(arr: number[], q: 0 | 1 | 2 | 3 | 4): number {
  if (arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  if (q === 0) return sorted[0];
  if (q === 4) return sorted[sorted.length - 1];
  return percentile(sorted, q * 0.25);
}

/** Pearson korelasyon katsayısı */
export function pearson(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return NaN;
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sumXY += dx * dy;
    sumX2 += dx * dx;
    sumY2 += dy * dy;
  }
  const den = Math.sqrt(sumX2 * sumY2);
  return den === 0 ? NaN : sumXY / den;
}

/** Basit doğrusal regresyon: y = a + b*x. b = eğim, a = kesişim */
export function linearRegression(x: number[], y: number[]): { a: number; b: number; r2: number } {
  if (x.length !== y.length || x.length < 2) return { a: NaN, b: NaN, r2: NaN };
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0,
    sxx = 0,
    syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  const b = sxx === 0 ? NaN : sxy / sxx;
  const a = Number.isNaN(b) ? NaN : my - b * mx;
  const r = pearson(x, y);
  const r2 = Number.isNaN(r) ? NaN : r * r;
  return { a, b, r2 };
}
