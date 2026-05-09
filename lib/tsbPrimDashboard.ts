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

/** Dashboard: hayat dışı (HD, kod 3… değil) · hayat-emeklilik (kod 3… veya tip H / E) */
export type TsbSektorSegment = "hayatdisi" | "hayat";

/** TSB Excel'deki sektör alt toplam şirket kodları */
export const TSB_TOPLAM_SIRKET_KODLARI = new Set([9000, 9001, 9003]);

/** Şirket seçicilerinde varsayılan: Bereket Sigorta AŞ (hayat dışı · HD) */
export const DEFAULT_BEREKET_SIGORTA_HD_KOD = 1025;

/** Hayat–emeklilik görünümünde varsayılan tercih: Bereket Emeklilik ve Hayat AŞ */
export const DEFAULT_BEREKET_EMEKLILIK_KOD = 3005;

export type TsbDefaultSirketMod = "hayatdisi" | "hayat" | "any";

/** Şirket listesinde Bereket varsayılanını uygula; yoksa listenin ilki */
export function resolveDefaultSirketKodu(liste: { kod: number }[], mod: TsbDefaultSirketMod): number | null {
  if (liste.length === 0) return null;
  if (mod === "hayatdisi") {
    const x = liste.find((s) => s.kod === DEFAULT_BEREKET_SIGORTA_HD_KOD);
    return x?.kod ?? liste[0].kod;
  }
  if (mod === "hayat") {
    const x = liste.find((s) => s.kod === DEFAULT_BEREKET_EMEKLILIK_KOD);
    return x?.kod ?? liste[0].kod;
  }
  const hd = liste.find((s) => s.kod === DEFAULT_BEREKET_SIGORTA_HD_KOD);
  if (hd) return hd.kod;
  const hy = liste.find((s) => s.kod === DEFAULT_BEREKET_EMEKLILIK_KOD);
  return hy?.kod ?? liste[0].kod;
}

export function isTsbToplamSirketKodu(kod: number): boolean {
  return TSB_TOPLAM_SIRKET_KODLARI.has(kod);
}

function normalizedSirketTipi(row: TsbPrimRow): string {
  return String(row.sirketTipi ?? "").trim().toUpperCase();
}

/** Şirket kodu 3 ile başlıyorsa hayat/emeklilik şirketi (TSB kodlaması) */
export function sirketKoduHayatEmeklilikPrefix(kod: number): boolean {
  if (!Number.isFinite(kod)) return false;
  const s = String(Math.trunc(Math.abs(kod)));
  return s.startsWith("3");
}

/** Hayat-emeklilik havuzu: kod 3… veya TSB şirket tipi H (hayat) / E (emeklilik–yaşam, örn. Zurich 2006) */
export function isHayatEmeklilikSirket(row: TsbPrimRow): boolean {
  if (isTsbToplamSirketKodu(row.sirketKodu)) return false;
  if (sirketKoduHayatEmeklilikPrefix(row.sirketKodu)) return true;
  const t = normalizedSirketTipi(row);
  return t === "H" || t === "E";
}

/** Hayat dışı: tip HD ve kod 3… değil (3… satırları hayat-emeklilikte kalır) */
export function isHayatdisiSirket(row: TsbPrimRow): boolean {
  if (isTsbToplamSirketKodu(row.sirketKodu)) return false;
  if (sirketKoduHayatEmeklilikPrefix(row.sirketKodu)) return false;
  return normalizedSirketTipi(row) === "HD";
}

/** Segment + alt toplam satırları hariç */
export function rowMatchesSegment(row: TsbPrimRow, segment: TsbSektorSegment): boolean {
  return segment === "hayat" ? isHayatEmeklilikSirket(row) : isHayatdisiSirket(row);
}

/** Tablo alt toplam satırı için yüzde değişim */
export function sektorToplamDegisimYuzde(primOnceki: number, primBu: number): number | null {
  if (primOnceki === 0) return primBu === 0 ? 0 : null;
  return ((primBu - primOnceki) / Math.abs(primOnceki)) * 100;
}

export function prevYearPeriod(ym: string): string | null {
  const [y, m] = ym.split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null;
  return `${y - 1}-${String(m).padStart(2, "0")}`;
}

/** Kanal alanından prim tutarı (aggregate fonksiyonları için ortak) */
export function channelPremium(row: TsbPrimRow, channel: TsbKanalField): number {
  return channel === "genelToplam" ? row.genelToplam : row[channel];
}

/** Belirtilen dönem + filtreler için şirket bazında kanal prim toplamı */
export function aggregateByCompany(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  anaBransH: string | null,
  segment: TsbSektorSegment,
): Map<number, { sirketAdi: string; toplam: number }> {
  const m = new Map<number, { sirketAdi: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (anaBransH && r.anaBransH !== anaBransH) continue;
    const v = channelPremium(r, channel);
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
  segment: TsbSektorSegment,
): { donemOnceki: string | null; sektorToplamOnceki: number; sektorToplamBu: number; satirlar: SirketKiyaslama[] } {
  const donemOnceki = prevYearPeriod(donemBu);
  const buMap = aggregateByCompany(rows, donemBu, channel, anaBransH, segment);
  const oncekiMap = donemOnceki ? aggregateByCompany(rows, donemOnceki, channel, anaBransH, segment) : new Map();

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

/** Seçilen segmentte, ilgili dönemde üretim olan ana branşlar */
export function uniqueAnaBransForSegment(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    set.add(r.anaBransH);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}
