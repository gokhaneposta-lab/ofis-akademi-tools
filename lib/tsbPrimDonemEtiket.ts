/** Prim dönemi (YYYY-MM) → YTD aralık etiketleri (Ocak–Mayıs vb.). */

const PRIM_AY_ADLARI = [
  "",
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

export function parsePrimDonem(donem: string): { yil: string; ayNo: number; ayAd: string } | null {
  const m = donem.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!m) return null;
  const ayNo = Number(m[2]);
  return { yil: m[1], ayNo, ayAd: PRIM_AY_ADLARI[ayNo] };
}

/** Örn. 2026-05 → `2026 (Ocak–Mayıs)` */
export function formatPrimYtdAralik(donem: string): string {
  const p = parsePrimDonem(donem);
  if (!p) return donem;
  if (p.ayNo === 1) return `${p.yil} (Ocak)`;
  return `${p.yil} (Ocak–${p.ayAd})`;
}

/** Örn. 2026-05 → `Ocak–Mayıs` */
export function formatPrimYtdAralikKisa(donem: string): string {
  const p = parsePrimDonem(donem);
  if (!p) return donem;
  if (p.ayNo === 1) return "Ocak";
  return `Ocak–${p.ayAd}`;
}

/** Örn. 2026-05 → `2026 (01–05)` */
export function formatPrimYtdAralikSayi(donem: string): string {
  const p = parsePrimDonem(donem);
  if (!p) return donem;
  const ayStr = String(p.ayNo).padStart(2, "0");
  if (p.ayNo === 1) return `${p.yil} (01)`;
  return `${p.yil} (01–${ayStr})`;
}
