import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import formatRaw from "../data/gt_sirket_format.json";
import { bransAdi } from "../config/brans";
import type { GtCocukPay } from "./gtFormatCocukPay";
import { cocukPaylari } from "./gtFormatCocukPay";

type FormatRow = { gtKod: string; hesapKodu: string; hesapAdi: string };
type FormatFile = {
  format7: FormatRow[];
  formatGrup: FormatRow[];
  bransGrup: Array<{ bransKodu: string; grup: string; hazine: string }>;
  grupSira: string[];
};

const FORMAT = formatRaw as FormatFile;
export const FORMAT7_SATIRLAR = FORMAT.format7;
export const FORMAT_GRUP_SATIRLAR = FORMAT.formatGrup;
export const GRUP_SIRA = FORMAT.grupSira;

const BRANS_GRUP: Record<string, string> = {};
for (const r of FORMAT.bransGrup) BRANS_GRUP[r.bransKodu] = r.grup;

export function bransGrubu(kod: string): string {
  return BRANS_GRUP[kod] ?? "DİĞER KAZA";
}

/** GT gösterim satırı → format GT kodu. Komisyon 0251199'a yığılır. */
const GT_SATIR_KOD: Readonly<Record<number, string>> = {
  11: "0111",
  19: "0112",
  20: "0113",
  21: "012",
  22: "0121",
  23: "01211",
  24: "01212",
  25: "0122",
  26: "01221",
  27: "01222",
  28: "0123",
  29: "01231",
  30: "01232",
  31: "0131",
  38: "014",
  86: "016",
  96: "0211",
  105: "0212",
  114: "022",
  177: "0251199",
  190: "0252",
  191: "0253",
  192: "0254",
  193: "0255",
  194: "0256",
  196: "02571",
  200: "0258",
  201: "0259",
  202: "026",
};

const KILITLI = new Set(Object.values(GT_SATIR_KOD));

function idxByGt(): Map<string, number> {
  const m = new Map<string, number>();
  FORMAT7_SATIRLAR.forEach((r, i) => {
    if (r.gtKod && !m.has(r.gtKod)) m.set(r.gtKod, i);
  });
  return m;
}

function idxByHesap(): Map<string, number> {
  const m = new Map<string, number>();
  FORMAT7_SATIRLAR.forEach((r, i) => {
    if (r.hesapKodu && !m.has(r.hesapKodu)) m.set(r.hesapKodu, i);
  });
  return m;
}

const IDX_GT = idxByGt();
const IDX_HESAP = idxByHesap();

function gtCocuklar(parent: string): string[] {
  const all = FORMAT7_SATIRLAR.map((r) => r.gtKod).filter(Boolean);
  return all.filter((c) => {
    if (c === parent || !c.startsWith(parent)) return false;
    return !all.some(
      (e) => e !== parent && e !== c && e.startsWith(parent) && c.startsWith(e) && e.length > parent.length,
    );
  });
}

function hesapCocuklar(parent: string): string[] {
  const all = FORMAT7_SATIRLAR.map((r) => r.hesapKodu).filter(Boolean);
  return [...new Set(all)].filter((c) => {
    if (c === parent || !c.startsWith(parent)) return false;
    return !all.some(
      (e) => e !== parent && e !== c && e.startsWith(parent) && c.startsWith(e) && e.length > parent.length,
    );
  });
}

const GT_COCUK = new Map<string, string[]>();
for (const r of FORMAT7_SATIRLAR) {
  if (!r.gtKod) continue;
  const k = gtCocuklar(r.gtKod);
  if (k.length) GT_COCUK.set(r.gtKod, k);
}

const HESAP_COCUK = new Map<string, string[]>();
for (const r of FORMAT7_SATIRLAR) {
  if (!r.hesapKodu) continue;
  const k = hesapCocuklar(r.hesapKodu);
  if (k.length) HESAP_COCUK.set(r.hesapKodu, k);
}

function pushDown(vals: number[], brans: string, pay: GtCocukPay) {
  const kodlar = [...GT_COCUK.keys()].sort((a, b) => a.length - b.length);
  for (const parent of kodlar) {
    const pi = IDX_GT.get(parent);
    if (pi == null) continue;
    const parentVal = vals[pi] ?? 0;
    if (parentVal === 0) continue;
    const kids = GT_COCUK.get(parent) ?? [];
    const emptyKids = kids.filter((c) => {
      const i = IDX_GT.get(c);
      return i != null && (vals[i] ?? 0) === 0 && !KILITLI.has(c);
    });
    if (emptyKids.length === 0) continue;
    const shares = cocukPaylari(pay, brans, parent);
    const totShare = emptyKids.reduce((s, c) => s + (shares?.[c] ?? 0), 0);
    if (totShare > 0) {
      for (const c of emptyKids) {
        const i = IDX_GT.get(c)!;
        vals[i] = parentVal * ((shares?.[c] ?? 0) / totShare);
      }
    }
  }
}

function rollUp(vals: number[]) {
  const parents = [...HESAP_COCUK.keys()].sort((a, b) => b.length - a.length);
  for (const parent of parents) {
    const pi = IDX_HESAP.get(parent);
    if (pi == null) continue;
    const gt = FORMAT7_SATIRLAR[pi]?.gtKod;
    if (gt && KILITLI.has(gt)) continue;
    const kids = HESAP_COCUK.get(parent) ?? [];
    let sum = 0;
    let any = false;
    for (const c of kids) {
      const i = IDX_HESAP.get(c);
      if (i == null) continue;
      any = true;
      sum += vals[i] ?? 0;
    }
    if (any) vals[pi] = sum;
  }
}

function doldurAy(
  gt: GelirTablosuSonuc,
  bransKodu: string,
  ayIdx: number,
  pay: GtCocukPay,
): number[] {
  const vals = FORMAT7_SATIRLAR.map(() => 0);
  const aylik = gt.aylikBrans[bransKodu] ?? {};
  for (const [satirStr, kod] of Object.entries(GT_SATIR_KOD)) {
    const satir = Number(satirStr);
    const i = IDX_GT.get(kod);
    if (i == null) continue;
    vals[i] = aylik[satir]?.[ayIdx] ?? 0;
  }
  pushDown(vals, bransKodu, pay);
  rollUp(vals);
  return vals;
}

export type GtFormatTidyRow = {
  satirIdx: number;
  yil: number;
  ay: number;
  ayAd: string;
  bransKodu: string;
  bransAdi: string;
  grup: string;
  gtKod: string;
  hesapKodu: string;
  bransHesap: string;
  hesapAdi: string;
  tutar: number;
};

const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;

export function buildGtFormatTidy(
  gt: GelirTablosuSonuc,
  pay: GtCocukPay,
): GtFormatTidyRow[] {
  const branslar = gt.branslar.filter((b) => /^7\d{2}$/.test(b.bransKodu));
  const out: GtFormatTidyRow[] = [];
  for (const br of branslar) {
    const grup = bransGrubu(br.bransKodu);
    const ad = br.bransAdi || bransAdi(br.bransKodu);
    for (let ay = 0; ay < 12; ay++) {
      const vals = doldurAy(gt, br.bransKodu, ay, pay);
      FORMAT7_SATIRLAR.forEach((satir, i) => {
        const tutar = vals[i] ?? 0;
        if (!satir.hesapKodu && !satir.gtKod) return;
        out.push({
          satirIdx: i,
          yil: gt.butceYili,
          ay: ay + 1,
          ayAd: AY_ADLARI[ay]!,
          bransKodu: br.bransKodu,
          bransAdi: ad,
          grup,
          gtKod: satir.gtKod,
          hesapKodu: satir.hesapKodu,
          bransHesap: satir.gtKod && /^7\d{2}$/.test(br.bransKodu)
            ? `${br.bransKodu}${satir.gtKod}`
            : "",
          hesapAdi: satir.hesapAdi,
          tutar,
        });
      });
    }
  }
  return out;
}

export function yilToplamByBrans(
  tidy: GtFormatTidyRow[],
): Map<string, Map<number, number>> {
  const m = new Map<string, Map<number, number>>();
  for (const r of tidy) {
    let byRow = m.get(r.bransKodu);
    if (!byRow) {
      byRow = new Map();
      m.set(r.bransKodu, byRow);
    }
    byRow.set(r.satirIdx, (byRow.get(r.satirIdx) ?? 0) + r.tutar);
  }
  return m;
}
