/**
 * Faz 2 — 31.12.Y Cari KPK → 01.01.(Y+1) Devreden KPK.
 * Bütçe + mizan kapanış: 01211 Aralık; EYE 2026→2027: motor rollingStok.
 */
import type { KpkDevredenOcak } from "../gelir/kpkDevreden";
import {
  devredenKpkOcakFromMizan,
  devredenKpkOcakFromMizanKapanis,
  hasKpkMizanKapanis,
} from "../gelir/kpkDevreden";
import { normalizeBransKodu } from "../textUtils";
import type {
  AylikPrimStore,
  KpkKapanisTahminStore,
  KpkVadeRow,
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
  TarifeBransPayRow,
  TarifeMapRow,
} from "../types";
import { buildKpkSonuc, type KpkSonuc } from "./buildKpkSonuc";
import { primKaynakForYearEndClose, type KpkPrimKaynakOpts } from "./kpkPrimKaynak";

export { primKaynakForYearEndClose } from "./kpkPrimKaynak";

export type DevredenKpkReconSatir = {
  bransKodu: string;
  motorSatir24: number;
  mizanSatir24: number;
  farkTl: number;
  farkPct: number | null;
};

export type DevredenKpkReconSonuc = {
  satirlar: DevredenKpkReconSatir[];
  uyariKod: "devreden_kpk_recon_warning";
  mesaj: string;
};

/** Önceki yıl 31.12 Cari stok → Ocak devreden GT (F24/F27 işaretleri). */
export function devredenOcakFromPrevYearDec31Cari(kpkPrevYil: KpkSonuc): Map<string, KpkDevredenOcak> {
  const out = new Map<string, KpkDevredenOcak>();
  for (const b of kpkPrevYil.branslar) {
    const cariDec = b.cariStok[12] ?? 0;
    const f23Dec = b.gtAylik[23]?.[11] ?? -cariDec;
    const f26Dec = b.gtAylik[26]?.[11] ?? 0;
    const f29Dec = b.gtAylik[29]?.[11] ?? 0;
    const satir24 = f23Dec;
    const reas = Math.abs(f23Dec) > 1e-9 ? f26Dec / f23Dec : 0;
    const satir27 = -satir24 * reas;
    const satir30 = b.bransKodu === "715" ? -f29Dec : 0;
    if (Math.abs(f23Dec) > 0 || Math.abs(cariDec) > 0 || Math.abs(f29Dec) > 0) {
      out.set(b.bransKodu, { satir24, satir27, satir30 });
    }
  }
  return out;
}

export function buildKpkSonucForYearEndClose(opts: {
  butceYili: number;
  forDevredenIntoYear: number;
  mizan: MizanRow[];
  mizanAylik: MizanAylikRow[];
  mizanAylikFull: MizanAylikRow[];
  tarifeBransPay: TarifeBransPayRow[];
  vadeRows: KpkVadeRow[];
  aylikPrim?: AylikPrimStore | null;
  oranAyar?: OranAyarStore;
  kapanisTahmin?: KpkKapanisTahminStore | null;
  v2Metodoloji?: boolean;
  tarifeMap?: TarifeMapRow[];
  eyeAnchorAy?: number;
}): KpkSonuc {
  const primKaynak = primKaynakForYearEndClose({
    butceYili: opts.butceYili,
    forDevredenIntoYear: opts.forDevredenIntoYear,
    mizanAylikFull: opts.mizanAylikFull,
    tarifeMap: opts.tarifeMap,
    eyeAnchorAy: opts.eyeAnchorAy,
  });
  const yearPrim =
    opts.aylikPrim?.butceYili === opts.butceYili ? opts.aylikPrim : null;
  return buildKpkSonuc({
    butceYili: opts.butceYili,
    mizan: opts.mizan,
    mizanAylik: opts.mizanAylik,
    mizanAylikFull: opts.mizanAylikFull,
    tarifeBransPay: opts.tarifeBransPay,
    vadeRows: opts.vadeRows,
    aylikPrim: yearPrim,
    oranAyar: opts.oranAyar,
    kapanisTahmin:
      opts.kapanisTahmin?.butceYili === opts.butceYili ? opts.kapanisTahmin : null,
    v2Metodoloji: opts.v2Metodoloji,
    primKaynak,
  });
}

export type BuildDevredenZincirOpts = {
  butceYili: number;
  mizan: MizanRow[];
  mizanAylik: MizanAylikRow[];
  mizanAylikFull: MizanAylikRow[];
  tarifeBransPay: TarifeBransPayRow[];
  vadeRows: KpkVadeRow[];
  aylikPrim?: AylikPrimStore | null;
  oranAyar?: OranAyarStore;
  kapanisTahmin?: KpkKapanisTahminStore | null;
  v2Metodoloji?: boolean;
  tarifeMap?: TarifeMapRow[];
  eyeAnchorAy?: number;
};

export type DevredenKpkKaynakModu = "mizan_kapanis" | "motor_yil_sonu";

export type BuildDevredenZincirSonuc = {
  devredenOcak: Map<string, KpkDevredenOcak>;
  prevYearKpk: KpkSonuc;
  recon: DevredenKpkReconSonuc | null;
  kaynakModu: DevredenKpkKaynakModu;
};

/** 2027 bütçe: 2026 EYE motor kapanış — mizan 01211 Aralık kullanılmaz. */
function usesMotorYearEndCloseForDevreden(opts: BuildDevredenZincirOpts): boolean {
  const prevYear = opts.butceYili - 1;
  if (opts.butceYili === 2027 && prevYear === 2026) return true;
  return false;
}

export function resolveDevredenKpkKaynakModu(opts: BuildDevredenZincirOpts): DevredenKpkKaynakModu {
  if (usesMotorYearEndCloseForDevreden(opts)) return "motor_yil_sonu";
  if (hasKpkMizanKapanis(opts.mizanAylikFull, opts.butceYili)) return "mizan_kapanis";
  return "motor_yil_sonu";
}

function emptyPrevYearKpk(butceYili: number): KpkSonuc {
  const prevYear = butceYili - 1;
  return {
    butceYili: prevYear,
    oncekiYil: prevYear - 1,
    sonGercekAy: 12,
    branslar: [],
    toplamGtYillik: {},
    toplamGtAylik: {},
  };
}

/** 31.12.(Y-1) Cari → 01.01.Y Devreden: mizan kapanış veya motor (EYE yıl sonu). */
export function buildDevredenKpkZincir(opts: BuildDevredenZincirOpts): BuildDevredenZincirSonuc {
  const kaynakModu = resolveDevredenKpkKaynakModu(opts);
  const prevYear = opts.butceYili - 1;

  if (kaynakModu === "mizan_kapanis") {
    const devredenOcak = devredenKpkOcakFromMizanKapanis(opts.mizanAylikFull, opts.butceYili);
    return {
      devredenOcak,
      prevYearKpk: emptyPrevYearKpk(opts.butceYili),
      recon: null,
      kaynakModu,
    };
  }

  const prevYearKpk = buildKpkSonucForYearEndClose({
    ...opts,
    butceYili: prevYear,
    forDevredenIntoYear: opts.butceYili,
  });
  const devredenOcak = devredenOcakFromPrevYearDec31Cari(prevYearKpk);
  const mizanSnap = devredenKpkOcakFromMizan(opts.mizanAylikFull, opts.butceYili);
  const recon = reconcileDevredenKpkWithMizan(devredenOcak, mizanSnap);
  return { devredenOcak, prevYearKpk, recon, kaynakModu };
}

export function reconcileDevredenKpkWithMizan(
  motor: Map<string, KpkDevredenOcak>,
  mizan: Map<string, KpkDevredenOcak>,
): DevredenKpkReconSonuc | null {
  const satirlar: DevredenKpkReconSatir[] = [];
  const tumBrans = new Set([...motor.keys(), ...mizan.keys()]);
  for (const b of tumBrans) {
    const m = motor.get(b)?.satir24 ?? 0;
    const z = mizan.get(b)?.satir24 ?? 0;
    if (Math.abs(m) < 1 && Math.abs(z) < 1) continue;
    const farkTl = m - z;
    const farkPct = Math.abs(z) > 1 ? farkTl / Math.abs(z) : null;
    satirlar.push({
      bransKodu: normalizeBransKodu(b),
      motorSatir24: m,
      mizanSatir24: z,
      farkTl,
      farkPct,
    });
  }
  if (satirlar.length === 0) return null;
  const maxAbs = satirlar.reduce((a, s) => Math.max(a, Math.abs(s.farkTl)), 0);
  return {
    satirlar,
    uyariKod: "devreden_kpk_recon_warning",
    mesaj: `Devreden KPK motor vs mizan 01212: ${satirlar.length} branş, max |fark|=${Math.round(maxAbs).toLocaleString("tr-TR")} TL`,
  };
}

/** Şirket toplamı Dec Cari vs Jan Devreden (F23/F24 işaretli GT). */
export function assertDec31CariEqualsJan1Devreden(
  prevYearKpk: KpkSonuc,
  devredenOcak: Map<string, KpkDevredenOcak>,
): boolean {
  let ok = true;
  for (const b of prevYearKpk.branslar) {
    const dev = devredenOcak.get(b.bransKodu);
    if (!dev) continue;
    const f23Dec = b.gtAylik[23]?.[11] ?? -(b.cariStok[12] ?? 0);
    if (Math.abs(f23Dec - dev.satir24) > 0.01) ok = false;
  }
  return ok;
}
