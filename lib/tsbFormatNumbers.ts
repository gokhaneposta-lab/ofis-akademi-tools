/** TSB dashboard — prim ve tutar gösterimi (Mn ₺ öncelikli). */

const numTr = (decimals: number) =>
  new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });

/** Ham sayı → Mn ₺ (küsüratsız; ₺ satır kırılmaz). */
export function tsbFormatPrimMn(value: number, decimals?: number): string {
  const dec = decimals ?? 0;
  return `${numTr(dec).format(value / 1_000_000)}\u00A0Mn\u00A0₺`;
}

/** Prim tabloları ve KPI — otomatik ölçek (küsüratsız). */
export function tsbFormatPrim(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return tsbFormatPrimMn(value, 0);
  if (abs >= 10_000) return `${numTr(0).format(value / 1_000)}\u00A0bin\u00A0₺`;
  return `${numTr(0).format(value)}\u00A0₺`;
}

/** Grafik ekseni etiketi (Mn, ₺ işareti opsiyonel). */
export function tsbFormatPrimMnShort(value: number): string {
  const abs = Math.abs(value);
  const dec = abs >= 100_000_000 ? 0 : abs >= 10_000_000 ? 1 : 2;
  return numTr(dec).format(value / 1_000_000);
}
