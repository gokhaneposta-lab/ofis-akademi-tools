/**
 * Parent/child çift sayımını önleyen hesap toplama.
 *
 * - Tam eşleşme (prefix: false): yalnız `hesap === hedef`
 * - Prefix modu: hedef kod satırı varsa yalnız o (rollup); yoksa prefix altındaki
 *   en derin yaprakların toplamı. 60001 + 600011 + 600012 birlikte toplanmaz.
 */

export function normHesapKodu(hesap: string): string {
  return String(hesap).replace(/\D/g, "");
}

/** Verilen hesap setinde başka bir kodun ebeveyni olanları eler. */
export function enDerinYaprakKodlar(kodlar: Iterable<string>): string[] {
  const codes = [...new Set([...kodlar].map(normHesapKodu).filter(Boolean))];
  return codes.filter((h) => !codes.some((o) => o !== h && o.startsWith(h)));
}

/**
 * Satırlardaki tutarları hedef hesaplara göre toplar.
 * `prefix: true` iken önce tam kod; yoksa alt yapraklar.
 */
export function toplaHesapTutarlari(
  rows: { hesap: string; tutar: number }[],
  hesaplar: string[],
  opts: { prefix?: boolean } = {},
): number {
  const { prefix = false } = opts;
  const targets = hesaplar.map(normHesapKodu).filter(Boolean);
  if (targets.length === 0 || rows.length === 0) return 0;

  const byHesap = new Map<string, number>();
  for (const r of rows) {
    const h = normHesapKodu(r.hesap);
    if (!h) continue;
    byHesap.set(h, (byHesap.get(h) ?? 0) + (Number(r.tutar) || 0));
  }

  let toplam = 0;
  for (const hedef of targets) {
    if (!prefix || byHesap.has(hedef)) {
      toplam += byHesap.get(hedef) ?? 0;
      continue;
    }
    // Prefix: hedef satır yok → alt hesapların yaprak toplamı
    const alt = [...byHesap.entries()].filter(
      ([h]) => h !== hedef && h.startsWith(hedef),
    );
    const leaves = enDerinYaprakKodlar(alt.map(([h]) => h));
    for (const h of leaves) toplam += byHesap.get(h) ?? 0;
  }
  return toplam;
}
