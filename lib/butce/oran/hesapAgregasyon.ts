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

/** GT branş kodu + GT satır kodu → mizan hesap no (ör. 701 + 02571 → 70102571). */
export function bransGtHesapNo(bransKodu: string, gtSuffix: string): string {
  const br = String(bransKodu).replace(/\D/g, "");
  const suf = normHesapKodu(gtSuffix);
  return `${br}${suf}`;
}

/**
 * GT branşlı mizan hesabı için aday kodlar (önce 7xx02571, yoksa UNPIVOT karşılığı).
 * @see oran_kalem F300 — Alınan reasürans komisyon oranı
 */
export const BRANS_GT_LEGACY_HESAP: Readonly<Record<string, readonly string[]>> = {
  "0112": ["60002"],
  "02571": ["61407101", "614071"],
};

export function bransGtHesapAdaylari(bransKodu: string, gtSuffix: string): string[] {
  const suf = normHesapKodu(gtSuffix);
  const adaylar = [bransGtHesapNo(bransKodu, suf)];
  // Bazı mizan exportlarında sondaki sıfır düşer (7012571).
  const sufKisa = suf.replace(/^0+/, "") || suf;
  if (sufKisa !== suf) adaylar.push(bransGtHesapNo(bransKodu, sufKisa));
  for (const leg of BRANS_GT_LEGACY_HESAP[suf] ?? []) {
    if (!adaylar.includes(leg)) adaylar.push(leg);
  }
  return adaylar;
}

/**
 * Branş GT / UNPIVOT mizandan tutar — 70102571, 701…02571 kuyruk, 61407101 yedek.
 */
export function bransGtTutar(
  rows: { hesap: string; tutar: number }[],
  bransKodu: string,
  gtSuffix: string,
): number {
  if (rows.length === 0) return 0;

  for (const aday of bransGtHesapAdaylari(bransKodu, gtSuffix)) {
    const t = toplaHesapTutarlari(rows, [aday], { prefix: true });
    if (Math.abs(t) > 0) return t;
  }

  const br = String(bransKodu).replace(/\D/g, "");
  const suf = normHesapKodu(gtSuffix);
  const sufKisa = suf.replace(/^0+/, "") || suf;

  let tailSum = 0;
  for (const r of rows) {
    const h = normHesapKodu(r.hesap);
    if (!h) continue;
    const bransli =
      h.startsWith(br) && (h.endsWith(suf) || h.endsWith(sufKisa) || h === `${br}${sufKisa}`);
    const sadeceSuffix = h === suf || h === sufKisa;
    if (bransli || sadeceSuffix) tailSum += Number(r.tutar) || 0;
  }
  return tailSum;
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
