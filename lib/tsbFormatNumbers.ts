/** TSB dashboard — prim ve tutar gösterimi (Mn ₺ öncelikli). */

const numTr = (decimals: number) =>
  new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });

/** Ham sayı → Mn ₺ (mutlak değer ≥ 1 Mn için). */
export function tsbFormatPrimMn(value: number, decimals?: number): string {
  const abs = Math.abs(value);
  const dec = decimals ?? (abs >= 100_000_000 ? 1 : 2);
  return `${numTr(dec).format(value / 1_000_000)} Mn ₺`;
}

/** Prim tabloları ve KPI — otomatik ölçek. */
export function tsbFormatPrim(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return tsbFormatPrimMn(value);
  if (abs >= 10_000) return `${numTr(1).format(value / 1_000)} bin ₺`;
  return `${numTr(0).format(value)} ₺`;
}

/** Grafik ekseni etiketi (Mn, ₺ işareti opsiyonel). */
export function tsbFormatPrimMnShort(value: number): string {
  const abs = Math.abs(value);
  const dec = abs >= 100_000_000 ? 0 : abs >= 10_000_000 ? 1 : 2;
  return numTr(dec).format(value / 1_000_000);
}
