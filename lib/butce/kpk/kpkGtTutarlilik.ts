/**
 * KPK GT tutarlılık — push öncesi ve geliştirme sırasında saçma 601011 yakalar.
 * Örn. ay sonu stok seviyelerinin Ocak–Temmuz toplanması → 76 milyar hatası.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { KPK_STOK_SEVIYE_SATIRLARI, kpkStokYtd } from "./kpkMotoru";
import { gtYtdSatir } from "../v2/gtHesapYtd";
import { v2OzetDeger } from "../v2/v2GtFiltre";

export type KpkGtTutarlilikSonuc = {
  ok: boolean;
  hatalar: string[];
  uyarilar: string[];
};

const KPK_STOK = new Set<number>(KPK_STOK_SEVIYE_SATIRLARI as unknown as number[]);

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
): KpkGtTutarlilikSonuc {
  const hatalar: string[] = [];
  const uyarilar: string[] = [];

  const brutPrimYtd = v2OzetDeger(gt, 11, anchorAy);
  const f23Ozet = v2OzetDeger(gt, 23, anchorAy);
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
    const ozet = v2OzetDeger(gt, satir, anchorAy);
    const stok = kpkStokYtd(ser, anchorAy);
    if (Math.abs(ozet - stok) > 1) {
      hatalar.push(`F${satir} dashboard ${mn(ozet)} ≠ stok seviyesi ${mn(stok)}`);
    }
  }

  const f22Ozet = v2OzetDeger(gt, 22, anchorAy);
  const f24Ozet = v2OzetDeger(gt, 24, anchorAy);
  const f22Beklenen = f23Ozet + f24Ozet;
  if (Math.abs(f22Ozet - f22Beklenen) > Math.max(Math.abs(f22Beklenen) * 0.01, 1e6)) {
    uyarilar.push(
      `60101 (F22) ${mn(f22Ozet)} ≈ F23+F24 (${mn(f22Beklenen)}) sapması — üst satır rollup kontrol edin`,
    );
  }

  return { ok: hatalar.length === 0, hatalar, uyarilar };
}

export function assertKpkGtTutarlilik(gt: GelirTablosuSonuc, anchorAy: number): void {
  const r = dogrulaKpkGtTutarlilik(gt, anchorAy);
  for (const u of r.uyarilar) console.warn("  ⚠ KPK:", u);
  if (!r.ok) {
    throw new Error(r.hatalar.join("\n"));
  }
}
