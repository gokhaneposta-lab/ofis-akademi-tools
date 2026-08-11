import type { MizanAylikRow } from "../types";
import { normalizeBransKodu } from "../textUtils";
import formatRaw from "../data/gt_sirket_format.json";

type FormatRow = { gtKod: string; hesapKodu: string; hesapAdi: string };
const FORMAT7 = (formatRaw as { format7: FormatRow[] }).format7;
const GT_KODLAR = FORMAT7.map((r) => r.gtKod).filter(Boolean);

function dogrudanCocuklar(parent: string): string[] {
  return GT_KODLAR.filter((c) => {
    if (c === parent || !c.startsWith(parent)) return false;
    return !GT_KODLAR.some(
      (e) => e !== parent && e !== c && e.startsWith(parent) && c.startsWith(e) && e.length > parent.length,
    );
  });
}

const COCUKLAR = new Map<string, string[]>();
for (const p of new Set(GT_KODLAR)) {
  const kids = dogrudanCocuklar(p);
  if (kids.length) COCUKLAR.set(p, kids);
}

export type GtCocukPay = Record<string, Record<string, Record<string, number>>>;

/**
 * Önceki yıl sonu (ay=12) mizandan parent→çocuk payı.
 * Branşta yoksa şirket (`*`) karışımı kullanılır.
 */
export function buildGtCocukPay(
  aylik: MizanAylikRow[],
  butceYili: number,
): GtCocukPay {
  const yil = butceYili - 1;
  const tutar = new Map<string, number>();
  for (const r of aylik) {
    if (r.yil !== yil || r.ay !== 12) continue;
    const br = normalizeBransKodu(r.bransKodu);
    const h = String(r.hesap);
    if (!br || !h) continue;
    const k = `${br}|${h}`;
    tutar.set(k, (tutar.get(k) ?? 0) + (Number(r.tutar) || 0));
  }

  const out: GtCocukPay = { "*": {} };
  const branslar = new Set<string>();
  for (const k of tutar.keys()) branslar.add(k.split("|")[0]!);

  const doldur = (br: string) => {
    if (!out[br]) out[br] = {};
    for (const [parent, kids] of COCUKLAR) {
      const absKids = kids.map((c) => {
        const v =
          br === "*"
            ? [...branslar].reduce((s, b) => s + Math.abs(tutar.get(`${b}|${c}`) ?? 0), 0)
            : Math.abs(tutar.get(`${br}|${c}`) ?? 0);
        return { c, v };
      });
      const tot = absKids.reduce((s, x) => s + x.v, 0);
      if (tot < 1) continue;
      const pay: Record<string, number> = {};
      for (const x of absKids) pay[x.c] = x.v / tot;
      out[br]![parent] = pay;
    }
  };

  doldur("*");
  for (const br of branslar) doldur(br);
  return out;
}

export function cocukPaylari(
  pay: GtCocukPay,
  brans: string,
  parent: string,
): Record<string, number> | null {
  return pay[brans]?.[parent] ?? pay["*"]?.[parent] ?? null;
}
