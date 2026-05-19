/**
 * Tarayıcı: `public/data/tsb/gelir-tidy/index.json` + `{donem}.json` (B′ bölünmüş ham veri).
 */

import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";

const GELIR_TIDY_BASE = "/data/tsb/gelir-tidy";

function donemSortKey(d: string): number {
  const m = d.match(/^(\d{4})-([1-4])$/);
  if (!m) return 0;
  return Number(m[1]) * 10 + Number(m[2]);
}

export function sortGelirDonemler(donemler: string[]): string[] {
  return [...donemler].sort((a, b) => donemSortKey(a) - donemSortKey(b));
}

/** Mevcut çeyrek listesi (`index.json`). */
export async function fetchGelirTidyDonemIndex(): Promise<string[]> {
  const r = await fetch(`${GELIR_TIDY_BASE}/index.json`);
  if (!r.ok) {
    throw new Error(
      `Dönem listesi yüklenemedi (${r.status}). Lütfen daha sonra tekrar deneyin.`,
    );
  }
  const data: unknown = await r.json();
  if (!Array.isArray(data)) {
    throw new Error("index.json geçersiz (dizi bekleniyor)");
  }
  return sortGelirDonemler(data.filter((d): d is string => typeof d === "string" && d.length > 0));
}

/** Tek çeyrek ham satırları. */
export async function fetchGelirTidyDonem(donem: string): Promise<TsbGelirTidyRowLike[]> {
  const r = await fetch(`${GELIR_TIDY_BASE}/${encodeURIComponent(donem)}.json`);
  if (!r.ok) {
    throw new Error(`Dönem verisi yüklenemedi: ${donem} (${r.status})`);
  }
  const data: unknown = await r.json();
  if (!Array.isArray(data)) {
    throw new Error(`Geçersiz dönem dosyası: ${donem}`);
  }
  return data as TsbGelirTidyRowLike[];
}

/** Birden fazla çeyreği birleştirir (yinelenen dönemler tek fetch). */
export async function fetchGelirTidyDonemler(donemler: string[]): Promise<TsbGelirTidyRowLike[]> {
  const uniq = [...new Set(donemler.filter(Boolean))];
  if (uniq.length === 0) return [];
  const parts = await Promise.all(uniq.map((d) => fetchGelirTidyDonem(d)));
  return parts.flat();
}
