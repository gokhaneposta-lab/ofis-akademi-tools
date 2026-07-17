import gtHaritaRaw from "../data/gt_excel_harita.json";
import { HAZINE_BRANS_SIRASI } from "../config/brans";
import type { MizanAylikRow, MizanRow, OranAyarStore } from "../types";
import { ORAN_KALEM_MIZAN } from "../oran/oranKalemLoader";
import { MizanOranServisi } from "../oran/mizanOranlar";

/**
 * GT (gelir tablosu) formül-graf motoru.
 *
 * gt_excel_harita.json içindeki Excel hücre formüllerini (F11, F19, F96 …)
 * branş bazında değerlendirir:
 *   - F11 (brüt yazılan prim)  → prim hedefi (dışarıdan verilir)
 *   - F15 (endirekt)           → prim dağıtım split (dışarıdan verilir)
 *   - carpım hücreleri         → baz ifadesi × teknik oran (oran motoru)
 *   - alt toplam / diğer       → hücre referansları üzerinden aritmetik
 *   - dış sayfa / oran hücresi → 0 (3 dosyalı modelde yok) — şeffaf raporlanır
 */

type HaritaCell = {
  satir: number;
  kod: string | null;
  ad: string;
  formul: string | number | null;
  tip: string;
  carpim?: { baz_hucre?: string; baz_ifade?: string; oran_hucre: string };
};

type Harita = { tum_satirlar: HaritaCell[] };

const HARITA = gtHaritaRaw as unknown as Harita;

/** Excel'de dış sayfadan / oran satırından gelen, 3 dosyalı modelde olmayan tipler. */
const DIS_GIRDI_TIP = new Set(["dis_sayfa", "mizan_oran", "oran_birlestirme"]);

/** Formülde dış-sayfa veya oran fonksiyonu işareti → değer 0. */
const DIS_FORMUL = /SUMIFS|IFERROR|ROUND|AVERAGE|'/;

function buildCellByRow(): Map<number, HaritaCell> {
  const m = new Map<number, HaritaCell>();
  for (const c of HARITA.tum_satirlar) m.set(c.satir, c);
  return m;
}

/** Oran hücresi (F295, F320 …) → teknik oran kalem kodu. */
function buildOranHucreToKalem(): Map<string, string> {
  const m = new Map<string, string>();
  for (const [kod, spec] of Object.entries(ORAN_KALEM_MIZAN)) {
    if (spec.gt_hucre) m.set(spec.gt_hucre, kod);
  }
  return m;
}

const CELL_BY_ROW = buildCellByRow();
const ORAN_HUCRE_TO_KALEM = buildOranHucreToKalem();

function hucreSatir(ref: string): number | null {
  const m = /^F\$?(\d+)$/.exec(ref.trim());
  return m ? parseInt(m[1], 10) : null;
}

export type GtEksikGirdi = { satir: number; kod: string | null; ad: string };

export class GelirTablosuMotoru {
  private readonly oranServisi: MizanOranServisi;
  /** oran_hucre → brans → oran */
  private readonly oranByHucreByBrans = new Map<string, Map<string, number>>();
  /** Hesaplama sırasında dış-girdi (0 alınan) hücreler — şeffaflık için. */
  readonly eksikGirdiler = new Map<number, GtEksikGirdi>();

  constructor(
    mizan: MizanRow[],
    butceYili: number,
    oranAyar: OranAyarStore = {},
    mizanAylikFull: MizanAylikRow[] = [],
  ) {
    this.oranServisi = new MizanOranServisi(mizan, butceYili, mizanAylikFull);
    for (const [hucre, kalem] of ORAN_HUCRE_TO_KALEM) {
      const tablo = this.oranServisi.tumBranslarTablosu(kalem, oranAyar[kalem] ?? {});
      const map = new Map<string, number>();
      for (const r of tablo) map.set(r.bransKodu, r.oran);
      this.oranByHucreByBrans.set(hucre, map);
    }
  }

  private oranDeger(hucre: string, brans: string): number {
    const norm = hucre.replace("$", "");
    const map = this.oranByHucreByBrans.get(norm);
    if (!map) return 0;
    return map.get(brans) ?? 0;
  }

  /** satir no → tutar (KPK vb. dış girdiler) */
  hesaplaBrans(
    brans: string,
    brutPrim: number,
    endirektPrim: number,
    disHucreler: Record<number, number> = {},
  ): Map<number, number> {
    const self = this;
    const memo = new Map<number, number>();
    const zincir = new Set<number>();

    function resolve(ref: string): number {
      const satir = hucreSatir(ref);
      if (satir == null) return 0;
      if (CELL_BY_ROW.has(satir) || satir === 11 || satir === 15) return cellValue(satir);
      // GT satır listesinde yoksa oran hücresidir (F295, F320, F436 …)
      return self.oranDeger(ref, brans);
    }

    function cellValue(satir: number): number {
      if (satir in disHucreler) return disHucreler[satir] ?? 0;
      if (satir === 11) return brutPrim;
      if (satir === 15) return endirektPrim;
      if (memo.has(satir)) return memo.get(satir)!;
      if (zincir.has(satir)) return 0;
      zincir.add(satir);

      const def = CELL_BY_ROW.get(satir);
      let val = 0;

      if (!def) {
        val = 0;
      } else if (DIS_GIRDI_TIP.has(def.tip)) {
        val = 0;
        self.kaydetEksik(def);
      } else if (def.carpim) {
        const bazIfade = def.carpim.baz_ifade ?? def.carpim.baz_hucre ?? "0";
        const baz = evalExpr(bazIfade, resolve);
        val = baz * self.oranDeger(def.carpim.oran_hucre, brans);
      } else if (typeof def.formul === "number") {
        val = def.formul;
      } else if (def.formul == null) {
        val = 0;
      } else if (DIS_FORMUL.test(def.formul)) {
        val = 0;
        self.kaydetEksik(def);
      } else {
        val = evalExpr(def.formul.replace(/^=/, ""), resolve);
      }

      zincir.delete(satir);
      memo.set(satir, val);
      return val;
    }

    // F105 (ödenen hasarda reasürör payı) Excel'de F399–F405 manuel split'lerine
    // bağlı; 3 dosyalı modelde yok → doğrudan 0212 oranıyla F96 üzerinden türet.
    // Bu yüzden F105 ve onu kapsayan zincir (F95→F94→F8) memo'ya elle yazılır.
    const f96 = cellValue(96);
    const f105 = f96 * this.oranDeger("F436", brans);
    memo.set(105, f105);
    memo.delete(95);
    memo.delete(94);
    memo.delete(9);
    memo.delete(8);
    memo.delete(220);

    const out = new Map<number, number>();
    for (const c of HARITA.tum_satirlar) out.set(c.satir, cellValue(c.satir));
    return out;
  }

  private kaydetEksik(def: HaritaCell) {
    if (!this.eksikGirdiler.has(def.satir)) {
      this.eksikGirdiler.set(def.satir, { satir: def.satir, kod: def.kod, ad: def.ad });
    }
  }

  bransListesi(): string[] {
    return [...HAZINE_BRANS_SIRASI];
  }
}

/* ----------------------------- formül değerlendirici ----------------------------- */

type Resolver = (ref: string) => number;

/** Basit Excel-alt-kümesi aritmetik değerlendirici: + - * / ( ), SUM(...), hücre ref, sayı. */
export function evalExpr(formul: string, resolve: Resolver): number {
  const tokens = tokenize(formul);
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseExpr(): number {
    let v = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const r = parseTerm();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  function parseTerm(): number {
    let v = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const r = parseFactor();
      v = op === "*" ? v * r : r === 0 ? 0 : v / r;
    }
    return v;
  }

  function parseFactor(): number {
    const t = peek();
    if (t === "+") {
      next();
      return parseFactor();
    }
    if (t === "-") {
      next();
      return -parseFactor();
    }
    if (t === "(") {
      next();
      const v = parseExpr();
      if (peek() === ")") next();
      return v;
    }
    if (t === "SUM") {
      next();
      return parseSum();
    }
    next();
    if (t == null) return 0;
    if (/^F\$?\d+$/.test(t)) return resolve(t);
    const n = Number(t);
    return Number.isFinite(n) ? n : 0;
  }

  function parseSum(): number {
    let total = 0;
    if (peek() === "(") next();
    while (peek() != null && peek() !== ")") {
      const a = next();
      if (a == null || a === ",") continue;
      if (/^F\$?\d+$/.test(a) && peek() === ":") {
        next();
        const b = next();
        if (b != null) total += sumRange(a, b, resolve);
      } else if (/^F\$?\d+$/.test(a)) {
        total += resolve(a);
      } else {
        const n = Number(a);
        if (Number.isFinite(n)) total += n;
      }
    }
    if (peek() === ")") next();
    return total;
  }

  return parseExpr();
}

function sumRange(a: string, b: string, resolve: Resolver): number {
  const sa = hucreSatir(a);
  const sb = hucreSatir(b);
  if (sa == null || sb == null) return 0;
  const lo = Math.min(sa, sb);
  const hi = Math.max(sa, sb);
  let total = 0;
  for (let s = lo; s <= hi; s++) total += resolve(`F${s}`);
  return total;
}

function tokenize(formul: string): string[] {
  const tokens: string[] = [];
  const re = /\s*(SUM|F\$?\d+|\d+\.?\d*|[()+\-*/,:])/gy;
  let m: RegExpExecArray | null;
  while ((m = re.exec(formul)) != null) {
    tokens.push(m[1]);
  }
  return tokens;
}
