/**
 * V3 H2 (anchor+1 … Aralık): KPK + DERK + muallak + SGK motor projeksiyonu branş aylık serilerine.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { buildKpkSonuc } from "../kpk/buildKpkSonuc";
import { DERK_GT_SATIRLARI, hesaplaDerkPortfoy } from "../kpk/derkMotoru";
import { buildOncekiYilPrimSerisi } from "../kpk/oncekiYilPrimTahmin";
import { MizanOranServisi } from "../oran/mizanOranlar";
import type {
  AylikPrimStore,
  KpkKapanisTahminStore,
  KpkVadeRow,
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
  TarifeBransPayRow,
} from "../types";
import { extractMizanGtAylik } from "./mizanGtExtract";
import { geriYukleMizanYtdTam, yenidenTuretUstFormuller, yenileToplamlarH2 } from "./gtUstRollup";
import { MIZAN_DISI_SATIRLAR } from "./ytdOverlay";

/** KPK yaprak — H2'de yalnızca cari satırlar motorla; devreden mizan gibi Ocak dışı 0. */
const KPK_H2_CARI_YAPRAK = [23, 26, 29] as const;

/** Devreden KPK/RE/SGK — yıl içinde mizan: hareket yalnızca Ocak (YTD kilit). H2 = 0. */
const KPK_DEVREDEN_SATIRLARI = [24, 27, 30] as const;

/** Muallak yaprak — H2 oran motorundan (GT kodları; F451 vb. MizanOranServisi'nde 0 döner). */
const H2_ORAN_SATIRLARI = [116, 126, 137, 147] as const;

const ORAN_BY_SATIR: Partial<Record<number, string>> = {
  116: "02211",
  126: "02212",
  137: "02221",
  147: "02222",
};

/** H2 sonrası şirket toplamını branş serilerinden yenile. */
const H2_YENILE_SATIRLAR: readonly number[] = [
  10, 11, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31, 32, 33, 34, 35, 36, 37,
  114, 115, 116, 126, 136, 137, 147,
  164, 165, 166, 167, 168, 169, 170, 173,
];

function f349Oranlari(
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  mizanAylikFull: MizanAylikRow[],
): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, true);
  const tablo = servis.tumBranslarTablosu("F349", oranAyar["F349"] ?? {}, { ay: 12 });
  const out: Record<string, number> = {};
  for (const r of tablo) out[r.bransKodu] = Math.abs(r.oran);
  return out;
}

function reasurOranlari(
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  mizanAylikFull: MizanAylikRow[],
): Record<string, number> {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, true);
  const tablo = servis.tumBranslarTablosu("0112", oranAyar["0112"] ?? {});
  const out: Record<string, number> = {};
  for (const r of tablo) out[r.bransKodu] = Math.abs(r.oran);
  return out;
}

function yazH2Ser(
  gt: GelirTablosuSonuc,
  bransKodu: string,
  satir: number,
  motorSer: number[],
  anchor: number,
): void {
  const ab = gt.aylikBrans[bransKodu] ?? {};
  const ser = [...(ab[satir] ?? Array(12).fill(0))];
  for (let ay = anchor; ay < 12; ay++) ser[ay] = motorSer[ay] ?? 0;
  ab[satir] = ser;
  gt.aylikBrans[bransKodu] = ab;
  const b = gt.branslar.find((x) => x.bransKodu === bransKodu);
  if (b) b.degerler[satir] = ser.reduce((a, x) => a + x, 0);
}

/** Devreden KPK/RE/SGK — H2 aylarında 0 (Ocak hariç hareket yok; YTD mizandan). */
function sifirlaH2Devreden(
  gt: GelirTablosuSonuc,
  anchor: number,
  satirlar: readonly number[],
): void {
  for (const b of gt.branslar) {
    const ab = gt.aylikBrans[b.bransKodu] ?? {};
    for (const satir of satirlar) {
      const ser = [...(ab[satir] ?? Array(12).fill(0))];
      for (let ay = anchor; ay < 12; ay++) ser[ay] = 0;
      ab[satir] = ser;
    }
    gt.aylikBrans[b.bransKodu] = ab;
  }
}

function oranH2Satir(
  gt: GelirTablosuSonuc,
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  mizanAylikFull: MizanAylikRow[],
  anchor: number,
  satirlar: readonly number[],
  oranMap: Partial<Record<number, string>>,
  isaret: (satir: number, prim: number, oran: number) => number,
): void {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, true);
  for (const b of gt.branslar) {
    const primSer = gt.aylikBrans[b.bransKodu]?.[11];
    if (!primSer) continue;
    for (const satir of satirlar) {
      const kalem = oranMap[satir];
      if (!kalem) continue;
      const motorSer = Array.from({ length: 12 }, (_, ay) => {
        const tablo = servis.tumBranslarTablosu(kalem, oranAyar[kalem] ?? {}, { ay: ay + 1 });
        const row = tablo.find((r) => r.bransKodu === b.bransKodu);
        const oran = row?.oran ?? 0;
        const prim = primSer[ay] ?? 0;
        return isaret(satir, prim, oran);
      });
      yazH2Ser(gt, b.bransKodu, satir, motorSer, anchor);
    }
  }
}

/** 60003 / F20 — brüt prim × 0113 (SGK aktarılan primler). */
function sgkH2Satir(
  gt: GelirTablosuSonuc,
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  mizanAylikFull: MizanAylikRow[],
  anchor: number,
): void {
  oranH2Satir(
    gt,
    mizan,
    butceYili,
    oranAyar,
    mizanAylikFull,
    anchor,
    [20],
    { 20: "0113" },
    (_satir, prim, oran) => prim * oran,
  );
}

export function uygulaH2KpkDerkMuallak(
  gt: GelirTablosuSonuc,
  opts: {
    anchorAy: number;
    butceYili: number;
    mizan: MizanRow[];
    mizanAylik: MizanAylikRow[];
    mizanAylikFull: MizanAylikRow[];
    tarifeBransPay: TarifeBransPayRow[];
    kpkVade: KpkVadeRow[];
    oranAyar: OranAyarStore;
    aylikPrim: AylikPrimStore;
    kapanisTahmin: KpkKapanisTahminStore | null;
  },
): { uyarilar: string[] } {
  const uyarilar: string[] = [];
  const anchor = Math.min(Math.max(opts.anchorAy, 1), 11);
  if (anchor >= 12) return { uyarilar };

  const kpk = buildKpkSonuc({
    butceYili: opts.butceYili,
    mizan: opts.mizan,
    mizanAylik: opts.mizanAylik,
    mizanAylikFull: opts.mizanAylikFull,
    tarifeBransPay: opts.tarifeBransPay,
    vadeRows: opts.kpkVade,
    aylikPrim: opts.aylikPrim,
    oranAyar: opts.oranAyar,
    kapanisTahmin: opts.kapanisTahmin,
    v2Metodoloji: true,
  });

  const onceki = buildOncekiYilPrimSerisi({
    butceYili: opts.butceYili,
    mizanAylik: opts.mizanAylik,
    tarifeBransPay: opts.tarifeBransPay,
    kapanisTahmin:
      opts.kapanisTahmin?.butceYili === opts.butceYili ? opts.kapanisTahmin : null,
  });

  const cariPrim: Record<string, number[]> = {};
  for (const r of opts.aylikPrim.satirlar) {
    cariPrim[r.bransKodu] = r.aylar;
  }

  const derk = hesaplaDerkPortfoy({
    cariPrim,
    oncekiYilPrim: onceki.bransAylik,
    f349Oranlari: f349Oranlari(
      opts.mizan,
      opts.butceYili,
      opts.oranAyar,
      opts.mizanAylikFull,
    ),
    reasurOranlari: reasurOranlari(
      opts.mizan,
      opts.butceYili,
      opts.oranAyar,
      opts.mizanAylikFull,
    ),
  });

  // KPK H2: yalnızca cari yapraklar + DERK
  for (const kb of kpk.branslar) {
    for (const satir of KPK_H2_CARI_YAPRAK) {
      const ser = kb.gtAylik[satir];
      if (ser) yazH2Ser(gt, kb.bransKodu, satir, ser, anchor);
    }
  }

  for (const db of derk) {
    for (const satir of DERK_GT_SATIRLARI) {
      const ser = db.gtAylik[satir];
      if (ser) yazH2Ser(gt, db.bransKodu, satir, ser, anchor);
    }
  }

  const mizanGt = extractMizanGtAylik(opts.mizanAylikFull, opts.butceYili);
  geriYukleMizanYtdTam(gt, mizanGt, anchor, MIZAN_DISI_SATIRLAR);

  sifirlaH2Devreden(gt, anchor, KPK_DEVREDEN_SATIRLARI);

  oranH2Satir(
    gt,
    opts.mizan,
    opts.butceYili,
    opts.oranAyar,
    opts.mizanAylikFull,
    anchor,
    H2_ORAN_SATIRLARI,
    ORAN_BY_SATIR,
    (satir, prim, oran) => (satir === 116 || satir === 147 ? -prim * oran : prim * oran),
  );

  sgkH2Satir(
    gt,
    opts.mizan,
    opts.butceYili,
    opts.oranAyar,
    opts.mizanAylikFull,
    anchor,
  );

  yenidenTuretUstFormuller(gt);
  yenileToplamlarH2(gt, H2_YENILE_SATIRLAR, anchor);
  geriYukleMizanYtdTam(gt, mizanGt, anchor, MIZAN_DISI_SATIRLAR);

  uyarilar.push(
    `H2 motor: KPK cari + DERK + muallak + SGK (60003) ${anchor + 1}–12. ay; devreden KPK Ağu+ = 0.`,
  );
  return { uyarilar };
}
