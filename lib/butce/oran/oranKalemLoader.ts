import oranKalemRaw from "../data/oran_kalem_excel.json";
import {
  CARPIM_BRUT_PRIM,
  CARPIM_DIREKT_PRIM,
  CARPIM_ENDIREKT_PRIM,
  CARPIM_HASAR_BAZ,
} from "../config/constants";

type KalemRaw = {
  kalem_kodu: string;
  ad?: string;
  pay?: string[];
  baz?: string[];
  yil_birlestirme?: number[][];
  oran_hucre?: string;
  tahmin?: { formul?: string };
};

type OranKalemSpec = {
  ad: string;
  pay: string[];
  baz: string[];
  yil_birlestirme: [number, number][];
  gt_hucre?: string;
  excel_carpim?: string;
  carpim?: string;
  hesap_eslesme?: string;
  baz_toplam_sirket?: boolean;
  torpu?: { yil_disi_max?: number; oran_min?: number; oran_max?: number };
  excel_kalem_kodu?: string;
  bilesenler?: BilesenSpec[];
};

type BilesenSpec = {
  id: string;
  ad: string;
  pay: string[];
  baz: string[];
  agirlik: number;
  hesap_eslesme?: string;
  baz_toplam_sirket?: boolean;
};

export type OranBazliKalem = {
  ad: string;
  varsayilan_oran: number;
  gt_hucre?: string;
  ust_kod?: string;
};

/** Teknik oranlar listesinde hesaplanmayan kalemler (Excel gt_hucre / kalem_kodu). */
const DISLANAN_ORAN_KALEM = new Set(["F373", "F378", "F393"]);

const KOD_GT: Record<string, string> = {
  F436: "0212",
  F398: "014",
};

const MANUEL: Record<string, Partial<OranKalemSpec>> = {
  "016": {
    pay: ["605"],
    baz: ["61001", "611011"],
    carpim: CARPIM_HASAR_BAZ,
    excel_carpim: "(F96+F116)*F315",
  },
  "0251199": {
    pay: ["61401199"],
    baz: ["60001"],
    carpim: CARPIM_ENDIREKT_PRIM,
    excel_carpim: "F15*F431",
  },
  F431: {
    pay: ["61401199"],
    baz: ["60001"],
    carpim: CARPIM_ENDIREKT_PRIM,
  },
  F353: { pay: ["6140110101"], baz: ["614011"], carpim: CARPIM_DIREKT_PRIM },
  F358: { pay: ["6140110102"], baz: ["614011"], carpim: CARPIM_DIREKT_PRIM },
  F348: { pay: ["61301101"], baz: ["60001"] },
  F441: { pay: ["61102"], baz: ["60001"] },
  F368: {
    pay: ["61402"],
    baz: ["61402"],
    baz_toplam_sirket: true,
  },
  "014": {
    pay: ["60301"],
    baz: ["60301"],
    baz_toplam_sirket: true,
    gt_hucre: "F398",
    carpim: CARPIM_BRUT_PRIM,
  },
  "0251": {
    pay: ["6140110101", "61401199"],
    baz: ["60001"],
    carpim: CARPIM_DIREKT_PRIM,
    excel_carpim: "F12*F275",
  },
};

const CARPIM_MAP: Record<string, string> = {
  "0112": CARPIM_BRUT_PRIM,
  "0211": CARPIM_HASAR_BAZ,
  "016": CARPIM_HASAR_BAZ,
  "0251": CARPIM_DIREKT_PRIM,
  "0251199": CARPIM_ENDIREKT_PRIM,
  "0258": CARPIM_BRUT_PRIM,
  "0259": CARPIM_BRUT_PRIM,
  "014": CARPIM_BRUT_PRIM,
  F398: CARPIM_BRUT_PRIM,
};

const VARSAYILAN_ORAN: Record<string, number> = {
  "0112": -0.6,
  "0113": -0.02,
  "0211": -0.45,
  "0212": -0.15,
  "016": 0,
  "02211": -0.1,
  "02212": 0.1,
  "02221": 0.04,
  "02222": 0.02,
  "0251": -0.12,
  "0258": -0.005,
  "0259": -0.012,
  "014": 0.08,
};

function carpimFor(kod: string, tahmin?: { formul?: string }): string {
  if (kod in CARPIM_MAP) return CARPIM_MAP[kod];
  if (MANUEL[kod]?.carpim) return MANUEL[kod].carpim!;
  const f = tahmin?.formul ?? "";
  if (f.includes("F12")) return CARPIM_DIREKT_PRIM;
  if (f.includes("F15")) return CARPIM_ENDIREKT_PRIM;
  if (f.includes("F11+F22") || f.includes("F96+F116")) return CARPIM_HASAR_BAZ;
  return CARPIM_BRUT_PRIM;
}

function kalemlerRaw(): KalemRaw[] {
  return (oranKalemRaw as unknown as { kalemler: KalemRaw[] }).kalemler;
}

export function buildOranKalemMizan(): Record<string, OranKalemSpec> {
  const out: Record<string, OranKalemSpec> = {};

  for (const k of kalemlerRaw()) {
    const raw = k.kalem_kodu;
    const gtHucre = k.oran_hucre ?? (k as { gt_hucre?: string }).gt_hucre;
    if (DISLANAN_ORAN_KALEM.has(raw) || (gtHucre && DISLANAN_ORAN_KALEM.has(gtHucre))) {
      continue;
    }
    const kod = KOD_GT[raw] ?? raw;
    const man = MANUEL[kod] ?? MANUEL[raw] ?? {};
    const pay = man.pay ?? k.pay ?? [];
    const baz = man.baz ?? k.baz ?? [];
    if (pay.length === 0 && baz.length === 0) continue;

    const spec: OranKalemSpec = {
      ad: k.ad ?? kod,
      pay: [...pay],
      baz: [...baz],
      yil_birlestirme: (k.yil_birlestirme ?? []).map((x) => [x[0], x[1]] as [number, number]),
      gt_hucre: k.oran_hucre,
      excel_carpim: man.excel_carpim,
      carpim: carpimFor(kod, k.tahmin),
    };

    if (man.hesap_eslesme) spec.hesap_eslesme = man.hesap_eslesme;
    if (man.baz_toplam_sirket) spec.baz_toplam_sirket = true;
    else if (kod === "014" || kod === "F398" || kod === "F368" || (JSON.stringify(pay) === JSON.stringify(baz) && pay[0] === "60301")) {
      spec.baz_toplam_sirket = true;
    }

    if (kod.startsWith("022") || kod === "0211" || kod === "016") {
      spec.torpu = { yil_disi_max: 1.2, oran_min: -1, oran_max: 0.5 };
    }
    if (kod.startsWith("0222") || kod === "F461") {
      spec.torpu = { yil_disi_max: 2, oran_min: -0.5, oran_max: 0.5 };
    }
    if (kod === "0211") spec.yil_birlestirme = [[1, 0.8], [2, 0.005], [3, 0.15]];
    if (kod === "0212") spec.yil_birlestirme = [[1, 0.95], [2, 0.05]];
    if (raw !== kod) spec.excel_kalem_kodu = raw;

    out[kod] = spec;
  }

  out["0113"] = {
    ad: "SGK'ya Aktarılan Primler",
    pay: ["60003"],
    baz: ["60001"],
    yil_birlestirme: [[1, 0.5], [2, 0.25], [3, 0.15], [4, 0.1]],
  };

  return out;
}

export function buildOranBazliKalemler(): Record<string, OranBazliKalem> {
  const mizan = buildOranKalemMizan();
  const ust: Record<string, string> = {
    "02211": "0221",
    "02212": "0221",
    "02221": "0222",
    "02222": "0222",
  };
  const out: Record<string, OranBazliKalem> = {};

  for (const [kod, spec] of Object.entries(mizan)) {
    const row: OranBazliKalem = {
      ad: `${spec.ad}${spec.gt_hucre ? ` (${spec.gt_hucre})` : ""}`,
      varsayilan_oran: VARSAYILAN_ORAN[kod] ?? 0,
      gt_hucre: spec.gt_hucre,
    };
    if (kod in ust) row.ust_kod = ust[kod];
    out[kod] = row;
  }

  return out;
}

export const ORAN_KALEM_MIZAN = buildOranKalemMizan();
export const ORAN_BAZLI_KALEMLER = buildOranBazliKalemler();

export type { OranKalemSpec, BilesenSpec };
