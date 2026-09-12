/**
 * KPK GT tutarlılık — push öncesi ve geliştirme sırasında saçma 601011 yakalar.
 * Örn. ay sonu stok seviyelerinin Ocak–Temmuz toplanması → 76 milyar hatası.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { KPK_SEVIYE_OKUMA_SATIRLARI, KPK_STOK_SEVIYE_SATIRLARI, kpkStokYtd } from "./kpkMotoru";
import { gtYtdSatir } from "../v2/gtHesapYtd";
import { v2OzetDeger } from "../v2/v2GtFiltre";

export type KpkGtTutarlilikSonuc = {
  ok: boolean;
  hatalar: string[];
  uyarilar: string[];
};

export type KpkGtTutarlilikOpts = {
  /** Branş → F320 (0211); verilirse F96 = (F11+F22+F32)×F320 zinciri doğrulanır. */
  f320ByBrans?: Record<string, number>;
};

const KPK_STOK = new Set<number>(KPK_STOK_SEVIYE_SATIRLARI as unknown as number[]);
const KPK_SEVIYE = new Set<number>(KPK_SEVIYE_OKUMA_SATIRLARI as unknown as number[]);

/** |601011| / brüt prim YTD — normalde ~0.5–1.2; 2 üzeri şüpheli. */
const KPK_BRUT_ORAN_UST = 2;

function mn(n: number): string {
  return `${(n / 1e6).toFixed(1)} mn`;
}

function aylikSum(ser: number[] | undefined, anchorAy: number): number {
  if (!ser?.length) return 0;
  return ser.slice(0, Math.min(Math.max(anchorAy, 1), 12)).reduce((a, x) => a + x, 0);
}

/**
 * Tam V2 GT üzerinde KPK dashboard + stok seviyesi tutarlılığı.
 * @throws Error hata varsa (prepush)
 */
export function dogrulaKpkGtTutarlilik(
  gt: GelirTablosuSonuc,
  anchorAy: number,
  opts?: KpkGtTutarlilikOpts,
): KpkGtTutarlilikSonuc {
  const hatalar: string[] = [];
  const uyarilar: string[] = [];

  const brutPrimYtd = v2OzetDeger(gt, 11, anchorAy, null);
  const f23Ozet = v2OzetDeger(gt, 23, anchorAy, null);
  const f23Ser = gt.aylikToplam[23];
  const f23Sum = aylikSum(f23Ser, anchorAy);
  const f23Stok = kpkStokYtd(f23Ser, anchorAy);

  if (Math.abs(f23Ozet - f23Stok) > 1) {
    hatalar.push(
      `601011 dashboard (${mn(f23Ozet)}) ≠ stok seviyesi (${mn(f23Stok)}) — v2OzetDeger / kpkStokYtd uyumsuz`,
    );
  }

  if (Math.abs(f23Ozet - gtYtdSatir(gt, 23, anchorAy)) > 1) {
    hatalar.push(`601011 v2OzetDeger (${mn(f23Ozet)}) ≠ gtYtdSatir (${mn(gtYtdSatir(gt, 23, anchorAy))})`);
  }

  // 76 milyar sınıfı: dashboard Ocak–anchor stok seviyelerini topladı (ozet ≈ sum).
  if (
    anchorAy >= 2 &&
    Math.abs(f23Ozet - f23Sum) < Math.max(Math.abs(f23Ozet) * 0.001, 1e3) &&
    Math.abs(f23Sum) > Math.abs(f23Stok) * 1.2
  ) {
    hatalar.push(
      `601011 TOPLAM HATASI: dashboard ${mn(f23Ozet)} ≈ aylık seri toplamı (${mn(f23Sum)}) — ` +
        `stok seviyeleri toplanmış; anchor sonu tek seviye ${mn(f23Stok)} olmalı`,
    );
  }
  if (anchorAy >= 2 && Math.abs(f23Ozet - f23Sum) < 1 && Math.abs(f23Sum - f23Stok) > 1) {
    hatalar.push(
      `601011 okuma hatası: v2OzetDeger aylık toplam kullanıyor (${mn(f23Sum)}), stok ${mn(f23Stok)} olmalı`,
    );
  }

  if (f23Ozet > 0) {
    hatalar.push(`601011 işareti pozitif (${mn(f23Ozet)}) — stok seviyesi negatif olmalı`);
  }

  if (brutPrimYtd > 1e8 && Math.abs(f23Ozet) > brutPrimYtd * KPK_BRUT_ORAN_UST) {
    hatalar.push(
      `601011 (${mn(Math.abs(f23Ozet))}) brüt prim YTD'nin ${KPK_BRUT_ORAN_UST} katını aşıyor ` +
        `(brüt prim YTD ${mn(brutPrimYtd)}) — rolling stok / okuma hatası`,
    );
  }

  for (const satir of KPK_STOK) {
    const ser = gt.aylikToplam[satir];
    if (!ser?.length) continue;
    const ozet = v2OzetDeger(gt, satir, anchorAy, null);
    const stok = kpkStokYtd(ser, anchorAy);
    if (Math.abs(ozet - stok) > 1) {
      hatalar.push(`F${satir} dashboard ${mn(ozet)} ≠ stok seviyesi ${mn(stok)}`);
    }
  }

  for (const satir of KPK_SEVIYE) {
    const ser = gt.aylikToplam[satir];
    if (!ser?.length) continue;
    const ozet = v2OzetDeger(gt, satir, anchorAy, null);
    const stok = kpkStokYtd(ser, anchorAy);
    if (Math.abs(ozet - stok) > 1) {
      hatalar.push(`F${satir} dashboard ${mn(ozet)} ≠ anchor stok ${mn(stok)} (toplam hatası?)`);
    }
  }

  const f22Ozet = v2OzetDeger(gt, 22, anchorAy, null);
  const f24Ozet = v2OzetDeger(gt, 24, anchorAy, null);
  const f26Ozet = v2OzetDeger(gt, 26, anchorAy, null);
  const f27Ozet = v2OzetDeger(gt, 27, anchorAy, null);
  const f22Beklenen = f23Ozet + f24Ozet;
  const f25Beklenen = f26Ozet + f27Ozet;
  const f21Beklenen = f22Beklenen + f25Beklenen + v2OzetDeger(gt, 28, anchorAy, null);
  if (Math.abs(f22Ozet - f22Beklenen) > Math.max(Math.abs(f22Beklenen) * 0.01, 1e6)) {
    hatalar.push(`60101 (F22) ${mn(f22Ozet)} ≠ F23+F24 (${mn(f22Beklenen)})`);
  }
  const f25Ozet = v2OzetDeger(gt, 25, anchorAy, null);
  if (Math.abs(f25Ozet - f25Beklenen) > Math.max(Math.abs(f25Beklenen) * 0.01, 1e6)) {
    hatalar.push(`60102 (F25) ${mn(f25Ozet)} ≠ F26+F27 (${mn(f25Beklenen)})`);
  }
  const f21Ozet = v2OzetDeger(gt, 21, anchorAy, null);
  if (Math.abs(f21Ozet - f21Beklenen) > Math.max(Math.abs(f21Beklenen) * 0.01, 1e6)) {
    hatalar.push(`601 (F21) ${mn(f21Ozet)} ≠ F22+F25+F28 (${mn(f21Beklenen)})`);
  }

  const f320Map = opts?.f320ByBrans;
  if (f320Map) {
    for (const b of gt.branslar) {
      const f320 = f320Map[b.bransKodu];
      if (f320 == null || !Number.isFinite(f320)) continue;
      const kod = [b.bransKodu];
      const f11 = v2OzetDeger(gt, 11, anchorAy, kod);
      const f22 = v2OzetDeger(gt, 22, anchorAy, kod);
      const f32 = v2OzetDeger(gt, 32, anchorAy, kod);
      const f96 = v2OzetDeger(gt, 96, anchorAy, kod);
      const beklenen = (f11 + f22 + f32) * f320;
      const esik = Math.max(Math.abs(beklenen) * 0.001, 100);
      if (Math.abs(f96 - beklenen) > esik) {
        hatalar.push(
          `F96 branş ${b.bransKodu}: ${mn(f96)} ≠ (F11+F22+F32)×F320 (${mn(beklenen)}) — hesap F22=${mn(f22)}`,
        );
      }
    }
  }

  return { ok: hatalar.length === 0, hatalar, uyarilar };
}

export function assertKpkGtTutarlilik(
  gt: GelirTablosuSonuc,
  anchorAy: number,
  opts?: KpkGtTutarlilikOpts,
): void {
  const r = dogrulaKpkGtTutarlilik(gt, anchorAy, opts);
  for (const u of r.uyarilar) console.warn("  ⚠ KPK:", u);
  if (!r.ok) {
    throw new Error(r.hatalar.join("\n"));
  }
}
