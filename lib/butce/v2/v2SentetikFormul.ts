/** V2 sentetik GT satırları — özet okuma aylık seri toplamı değil, bileşen formülü. */

export const V2_SENTETIK = {
  teknikGelirSafi: 9001,
  teknikGiderSafi: 9002,
  safiTkz: 9003,
  genelGiderler: 9004,
  tkz: 9005,
  teknikFaaliyetGideri: 9006,
} as const;

export type V2FormulTerm = { satir: number; carpan: number };
export type V2Formul = readonly V2FormulTerm[];

const GENEL_GIDER_SATIRLARI = [190, 191, 192, 193, 194] as const;

/** GT F satır: 600→10, 601→21, 602→31, 604→83, 605→86 (603/F38 hariç). */
export const TEKNIK_GELIR_BILESENLERI = [10, 21, 31, 83, 86] as const;

const TEKNIK_GIDER_BILESENLERI = [95, 114, 157, 164] as const;

export const V2_SENTETIK_FORMULLER: ReadonlyArray<[number, V2Formul]> = [
  [V2_SENTETIK.teknikGelirSafi, TEKNIK_GELIR_BILESENLERI.map((satir) => ({ satir, carpan: 1 }))],
  [
    V2_SENTETIK.teknikFaaliyetGideri,
    [{ satir: 176, carpan: 1 }, ...GENEL_GIDER_SATIRLARI.map((satir) => ({ satir, carpan: -1 }))],
  ],
  [
    V2_SENTETIK.teknikGiderSafi,
    [
      ...TEKNIK_GIDER_BILESENLERI.map((satir) => ({ satir, carpan: 1 })),
      { satir: V2_SENTETIK.teknikFaaliyetGideri, carpan: 1 },
      { satir: 202, carpan: 1 },
    ],
  ],
  [
    V2_SENTETIK.safiTkz,
    [
      { satir: V2_SENTETIK.teknikGelirSafi, carpan: 1 },
      { satir: V2_SENTETIK.teknikGiderSafi, carpan: 1 },
    ],
  ],
  [V2_SENTETIK.genelGiderler, GENEL_GIDER_SATIRLARI.map((satir) => ({ satir, carpan: 1 }))],
  [
    V2_SENTETIK.tkz,
    [
      { satir: V2_SENTETIK.safiTkz, carpan: 1 },
      { satir: 38, carpan: 1 },
      { satir: V2_SENTETIK.genelGiderler, carpan: 1 },
    ],
  ],
];

const FORMUL_BY_SATIR = new Map<number, V2Formul>(V2_SENTETIK_FORMULLER);

export const V2_SENTETIK_SATIRLARI = new Set<number>(V2_SENTETIK_FORMULLER.map(([s]) => s));

export function v2SentetikFormul(satir: number): V2Formul | undefined {
  return FORMUL_BY_SATIR.get(satir);
}
