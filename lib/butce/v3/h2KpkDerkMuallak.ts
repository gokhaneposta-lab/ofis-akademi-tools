/**
 * V3 H2 (anchor+1 … Aralık): KPK + DERK motor projeksiyonu branş aylık serilerine.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { buildKpkSonuc } from "../kpk/buildKpkSonuc";
import { KPK_GT_SATIRLARI } from "../kpk/kpkMotoru";
import { hesaplaDerkPortfoy, DERK_GT_SATIRLARI } from "../kpk/derkMotoru";
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
import { geriYukleMizanYtdTam, yenidenTuretUstFormuller } from "./gtUstRollup";
import { MIZAN_DISI_SATIRLAR } from "./ytdOverlay";

/** Muallak yaprak — H2 oran motorundan. */
const H2_ORAN_SATIRLARI = [116, 126, 137, 147] as const;

const ORAN_BY_SATIR: Partial<Record<number, string>> = {
  116: "F451",
  126: "F456",
  137: "F466",
  147: "F471",
};

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

function oranH2Satir(
  gt: GelirTablosuSonuc,
  mizan: MizanRow[],
  butceYili: number,
  oranAyar: OranAyarStore,
  mizanAylikFull: MizanAylikRow[],
  anchor: number,
): void {
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull, true);
  for (const b of gt.branslar) {
    const primSer = gt.aylikBrans[b.bransKodu]?.[11];
    if (!primSer) continue;
    for (const satir of H2_ORAN_SATIRLARI) {
      const kalem = ORAN_BY_SATIR[satir];
      if (!kalem) continue;
      const motorSer = Array.from({ length: 12 }, (_, ay) => {
        const tablo = servis.tumBranslarTablosu(kalem, oranAyar[kalem] ?? {}, { ay: ay + 1 });
        const row = tablo.find((r) => r.bransKodu === b.bransKodu);
        const oran = row?.oran ?? 0;
        const prim = primSer[ay] ?? 0;
        if (satir === 116 || satir === 147) return -prim * oran;
        return prim * oran;
      });
      yazH2Ser(gt, b.bransKodu, satir, motorSer, anchor);
    }
  }
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

  for (const kb of kpk.branslar) {
    for (const satir of KPK_GT_SATIRLARI) {
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

  oranH2Satir(
    gt,
    opts.mizan,
    opts.butceYili,
    opts.oranAyar,
    opts.mizanAylikFull,
    anchor,
  );

  yenidenTuretUstFormuller(gt);

  // YTD (Ocak–anchor): rollup üst satırları ezmesin — mizandan tekrar kilitle
  const mizanGt = extractMizanGtAylik(opts.mizanAylikFull, opts.butceYili);
  geriYukleMizanYtdTam(gt, mizanGt, anchor, MIZAN_DISI_SATIRLAR);

  uyarilar.push(
    `H2 motor: KPK (601) + DERK (602) + muallak yaprakları ${anchor + 1}–12. ay için projekte edildi.`,
  );
  return { uyarilar };
}
