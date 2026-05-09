import type { TsbBranchLookupMap } from "./tsbBranchLookup";
import { tarifeGrubuFromRow } from "./tsbBranchLookup";

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

/** Zorunlu trafik (MTPL) ana branşı — TSB `anaBransH` */
export const TSB_ANA_BRANS_TRAFIK_SORUMLULUK = "KARA ARAÇLARI SORUMLULUK";

/** Ana branş seçim değeri: tüm ana branşlar bu satır hariç */
export const ANA_BRANS_FILTER_TRAFIK_HARIC = "__trafikHaric";

export const ANA_BRANS_FILTER_TRAFIK_HARIC_LABEL =
  "Trafik hariç toplam (Kara Araçları Sorumluluk dışında)";

/** Tarife grubu seçim değeri: TRAFİK satırı hariç (hayat dışı kırılımda) */
export const TARIFE_GRUBU_FILTER_TRAFIK_HARIC = "__tarifeTrafikHaric";

export const TARIFE_GRUBU_FILTER_TRAFIK_HARIC_LABEL =
  "Trafik hariç toplam (TRAFİK tarife grubu dışında)";

/** Prim tidy verisinde hayat dışı zorunlu trafik üretiminin tarife grubu adı */
export const TSB_TARIFE_GRUBU_TRAFIK = "TRAFİK";

/** `anaBransH`: null/"" = tümü; `ANA_BRANS_FILTER_TRAFIK_HARIC` = trafik ana branşı hariç */
export function rowMatchesAnaBransFilter(row: TsbPrimRow, anaBransH: string | null): boolean {
  if (anaBransH === null || anaBransH === "") return true;
  if (anaBransH === ANA_BRANS_FILTER_TRAFIK_HARIC) {
    return row.anaBransH !== TSB_ANA_BRANS_TRAFIK_SORUMLULUK;
  }
  return row.anaBransH === anaBransH;
}

/** Tüm TSB panellerinde ortak: ana branş (TSB) veya tarife grubu ile daraltma */
export type TsbPrimDaraltmaModu = "anaBransH" | "tarifeGrubu";

export type TsbPrimDaraltma =
  | { kind: "anaBransH"; anaBransH: string | null }
  | { kind: "tarifeGrubu"; tarifeGrubu: string | null; lookup: TsbBranchLookupMap | null };

export function rowMatchesPrimDaraltma(r: TsbPrimRow, f: TsbPrimDaraltma): boolean {
  if (f.kind === "anaBransH") return rowMatchesAnaBransFilter(r, f.anaBransH);
  const tg = tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, f.lookup);
  if (f.tarifeGrubu === null) return true;
  if (f.tarifeGrubu === TARIFE_GRUBU_FILTER_TRAFIK_HARIC) {
    return tg !== TSB_TARIFE_GRUBU_TRAFIK;
  }
  return tg === f.tarifeGrubu;
}

export function daraltmaFromUiState(
  mod: TsbPrimDaraltmaModu,
  anaSecim: string,
  tarifeSecim: string,
  lookup: TsbBranchLookupMap | null,
): TsbPrimDaraltma {
  if (mod === "anaBransH") return { kind: "anaBransH", anaBransH: anaSecim === "" ? null : anaSecim };
  return { kind: "tarifeGrubu", tarifeGrubu: tarifeSecim === "" ? null : tarifeSecim, lookup };
}

/** Segmentte, ilgili dönemde görünen tarife grupları */
export function uniqueTarifeGruplariForSegment(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  lookup: TsbBranchLookupMap | null,
): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    set.add(tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup));
  }
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}

/** Dönemde görünen tarife grupları (çok segmentli paneller için) */
export function uniqueTarifeGruplariDonem(
  rows: TsbPrimRow[],
  donem: string,
  lookup: TsbBranchLookupMap | null,
): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    set.add(tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup));
  }
  return [...set].sort((a, b) => a.localeCompare(b, "tr"));
}

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

/** Bir önceki takvim ayı (YYYY-MM) */
export function prevMonthPeriod(ym: string): string | null {
  const [yStr, mStr] = ym.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) return null;
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, "0")}`;
}

/** Kanal alanından prim tutarı (aggregate fonksiyonları için ortak) */
export function channelPremium(row: TsbPrimRow, channel: TsbKanalField): number {
  return channel === "genelToplam" ? row.genelToplam : row[channel];
}

/** Şirketin tek segmentteki kanal prim toplamı (daraltma yok). Trafik/trafik hariç anlamı yalnızca hayat dışı segmentte geçerlidir. */
export function sirketSegmentPrimToplam(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  sirketKodu: number,
): number {
  let s = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (r.sirketKodu !== sirketKodu) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    s += channelPremium(r, channel);
  }
  return s;
}

/** Belirtilen dönem + filtreler için şirket bazında kanal prim toplamı */
export function aggregateByCompany(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  daraltma: TsbPrimDaraltma,
  segment: TsbSektorSegment,
): Map<number, { sirketAdi: string; toplam: number }> {
  const m = new Map<number, { sirketAdi: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, daraltma)) continue;
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
  daraltma: TsbPrimDaraltma,
  segment: TsbSektorSegment,
): { donemOnceki: string | null; sektorToplamOnceki: number; sektorToplamBu: number; satirlar: SirketKiyaslama[] } {
  const donemOnceki = prevYearPeriod(donemBu);
  const buMap = aggregateByCompany(rows, donemBu, channel, daraltma, segment);
  const oncekiMap = donemOnceki ? aggregateByCompany(rows, donemOnceki, channel, daraltma, segment) : new Map();

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

/** Seçilen segmentte, ilgili dönem + kanalda üretimi olan şirketler (sıralı liste) */
export function listSirketlerSegmentDonem(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  segment: TsbSektorSegment,
  daraltma: TsbPrimDaraltma,
): { kod: number; ad: string; toplam: number }[] {
  const m = new Map<number, { ad: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, daraltma)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    const v = channelPremium(r, channel);
    const cur = m.get(r.sirketKodu);
    if (!cur) {
      m.set(r.sirketKodu, { ad: r.sirketAdi, toplam: v });
    } else {
      cur.toplam += v;
      if (r.sirketAdi) cur.ad = r.sirketAdi;
    }
  }
  const arr = [...m.entries()].map(([kod, { ad, toplam }]) => ({ kod, ad, toplam }));
  arr.sort((a, b) => b.toplam - a.toplam);
  return arr;
}
