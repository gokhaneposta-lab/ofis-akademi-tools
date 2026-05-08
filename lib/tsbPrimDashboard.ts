/** TSB prim tidy JSON satırı (scripts/tsb-import-prim.mjs çıktısı ile uyumlu) */
export type TsbPrimRow = {
  donem: string;
  sirketTipi: string;
  sirketKodu: number;
  anaBransH: string;
  sirketAdi: string;
  bransKodu: number;
  bransAd: string;
  acente: number;
  banka: number;
  broker: number;
  diger: number;
  merkez: number;
  genelToplam: number;
  tarifeGrubu: string;
  sirketBransTrafikEk: number;
};

export type TsbKanalField = "genelToplam" | "acente" | "banka" | "broker" | "diger" | "merkez";

export function prevYearPeriod(ym: string): string | null {
  const [y, m] = ym.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
  return `${y - 1}-${String(m).padStart(2, "0")}`;
}

export function isHayatdisiTarife(row: TsbPrimRow): boolean {
  return row.tarifeGrubu !== "HAYAT";
}

function channelValue(row: TsbPrimRow, channel: TsbKanalField): number {
  return channel === "genelToplam" ? row.genelToplam : row[channel];
}

/** Belirtilen dönem + filtreler için şirket bazında kanal prim toplamı */
export function aggregateByCompany(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  anaBransH: string | null,
): Map<number, { sirketAdi: string; toplam: number }> {
  const m = new Map<number, { sirketAdi: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!isHayatdisiTarife(r)) continue;
    if (anaBransH && r.anaBransH !== anaBransH) continue;
    const v = channelValue(r, channel);
    if (v === 0) continue;
    const cur = m.get(r.sirketKodu);
    if (!cur) {
      m.set(r.sirketKodu, { sirketAdi: r.sirketAdi, toplam: v });
    } else {
      cur.toplam += v;
      if (r.sirketAdi) cur.sirketAdi = r.sirketAdi;
    }
  }
  return m;
}

export type SirketKiyaslama = {
  sirketKodu: number;
  sirketAdi: string;
  primOnceki: number;
  primBu: number;
  payOncekiYuzde: number;
  payBuYuzde: number;
  degisimYuzde: number | null;
  siraOnceki: number;
  siraBu: number;
};

export function buildKiyaslamaTablosu(
  rows: TsbPrimRow[],
  donemBu: string,
  channel: TsbKanalField,
  anaBransH: string | null,
): { donemOnceki: string | null; sektorToplamOnceki: number; sektorToplamBu: number; satirlar: SirketKiyaslama[] } {
  const donemOnceki = prevYearPeriod(donemBu);
  const buMap = aggregateByCompany(rows, donemBu, channel, anaBransH);
  const oncekiMap = donemOnceki ? aggregateByCompany(rows, donemOnceki, channel, anaBransH) : new Map();

  let sektorToplamBu = 0;
  for (const v of buMap.values()) sektorToplamBu += v.toplam;
  let sektorToplamOnceki = 0;
  for (const v of oncekiMap.values()) sektorToplamOnceki += v.toplam;

  const allKodlar = new Set<number>([...buMap.keys(), ...oncekiMap.keys()]);

  const raw: Omit<SirketKiyaslama, "siraOnceki" | "siraBu">[] = [];
  for (const kod of allKodlar) {
    const bu = buMap.get(kod);
    const o = oncekiMap.get(kod);
    const primBu = bu?.toplam ?? 0;
    const primOnceki = o?.toplam ?? 0;
    if (primBu === 0 && primOnceki === 0) continue;
    const sirketAdi = bu?.sirketAdi || o?.sirketAdi || "";
    const payBuYuzde = sektorToplamBu > 0 ? (primBu / sektorToplamBu) * 100 : 0;
    const payOncekiYuzde = sektorToplamOnceki > 0 ? (primOnceki / sektorToplamOnceki) * 100 : 0;
    let degisimYuzde: number | null = null;
    if (primOnceki !== 0) degisimYuzde = ((primBu - primOnceki) / Math.abs(primOnceki)) * 100;
    else if (primBu !== 0) degisimYuzde = null;
    raw.push({
      sirketKodu: kod,
      sirketAdi,
      primOnceki,
      primBu,
      payOncekiYuzde,
      payBuYuzde,
      degisimYuzde,
    });
  }

  const sortedBu = [...raw].sort((a, b) => b.primBu - a.primBu);
  const rankBu = new Map<number, number>();
  sortedBu.forEach((r, i) => rankBu.set(r.sirketKodu, i + 1));

  const sortedOnceki = [...raw].sort((a, b) => b.primOnceki - a.primOnceki);
  const rankOnceki = new Map<number, number>();
  sortedOnceki.forEach((r, i) => rankOnceki.set(r.sirketKodu, i + 1));

  const satirlar: SirketKiyaslama[] = raw.map((r) => ({
    ...r,
    siraBu: rankBu.get(r.sirketKodu) ?? 0,
    siraOnceki: rankOnceki.get(r.sirketKodu) ?? 0,
  }));

  satirlar.sort((a, b) => b.primBu - a.primBu);

  return { donemOnceki, sektorToplamOnceki, sektorToplamBu, satirlar };
}

export function uniqueSortedPeriods(rows: TsbPrimRow[]): string[] {
  const s = new Set(rows.map((r) => r.donem));
  return [...s].sort();
}

export function uniqueAnaBransForHayatdisi(rows: TsbPrimRow[], donem: string): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!isHayatdisiTarife(r)) continue;
    set.add(r.anaBransH);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}
