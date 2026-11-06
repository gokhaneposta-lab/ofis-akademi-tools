/**
 * TSB finansal dönem kodu (`YYYY-Q`) → arayüz etiketi.
 * Çeyrek sonu itibarıyla kümülatif (YTD) aralık: Q1 Ocak–Mart, Q2 Ocak–Haziran, …
 */

const CEYREK_SON_AY = ["", "Mart", "Haziran", "Eylül", "Aralık"] as const;

export function parseFinansalDonem(donem: string): { yil: string; ceyrek: 1 | 2 | 3 | 4 } | null {
  const m = donem.match(/^(\d{4})-([1-4])$/);
  if (!m) return null;
  const ceyrek = Number(m[2]) as 1 | 2 | 3 | 4;
  if (ceyrek < 1 || ceyrek > 4) return null;
  return { yil: m[1], ceyrek };
}

/** Örn. `2026-3` → `2026 Q3` (grafik ekseni / kompakt) */
export function formatFinansalDonemKisa(donem: string): string {
  const p = parseFinansalDonem(donem);
  if (!p) return donem;
  return `${p.yil} Q${p.ceyrek}`;
}

/** Örn. `2026-3` → `2026 Q3 (Ocak–Eylül)` */
export function formatFinansalDonemEtiket(donem: string): string {
  const p = parseFinansalDonem(donem);
  if (!p) return donem;
  const sonAy = CEYREK_SON_AY[p.ceyrek];
  return `${p.yil} Q${p.ceyrek} (Ocak–${sonAy})`;
}
