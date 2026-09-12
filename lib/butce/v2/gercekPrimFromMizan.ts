/**
 * 2026 gerçekleşen mizan → V2 prim girdisi (branş yıllık hedef + aylık desen).
 * mizan-aylik-full GT kodları: 0111 brüt, 0112 endirekt (reasürans devredilen).
 */
import { normalizeBransKodu } from "../textUtils";
import type { AylikPrimStore, MizanAylikRow } from "../types";

export type GercekPrimPaket = {
  primHedefleri: Record<string, number>;
  endirektPrim: Record<string, number>;
  aylikPrim: AylikPrimStore;
  /** Mizanda dolu son ay (1–12). */
  maxAy: number;
  brutToplam: number;
  endirektToplam: number;
};

function kumulByBransGt(
  rows: MizanAylikRow[],
  butceYili: number,
  gtKod: string,
): Map<string, number[]> {
  const raw = new Map<string, number[]>();
  for (const r of rows) {
    if (Number(r.yil) !== butceYili) continue;
    if (String(r.hesap) !== gtKod) continue;
    const b = normalizeBransKodu(r.bransKodu);
    if (!/^7\d{2}$/.test(b)) continue;
    const ay = Number(r.ay);
    if (ay < 1 || ay > 12) continue;
    if (!raw.has(b)) raw.set(b, Array(12).fill(0));
    raw.get(b)![ay - 1] += Number(r.tutar) || 0;
  }
  return raw;
}

function maxAyFromKumul(m: Map<string, number[]>): number {
  let max = 0;
  for (const ser of m.values()) {
    for (let i = 11; i >= 0; i--) {
      if (Math.abs(ser[i] ?? 0) > 1) {
        max = Math.max(max, i + 1);
        break;
      }
    }
  }
  return max;
}

/** YTD kümülatif → aylık artış; veri maxAy'de biter (sonraki aylar 0 kalsın, negatif tail yok). */
function kumulToIncrementalYtd(kumul: number[], maxAy: number): number[] {
  const out = Array(12).fill(0);
  let prev = 0;
  const n = Math.min(Math.max(maxAy, 1), 12);
  for (let i = 0; i < n; i++) {
    const v = kumul[i] ?? 0;
    out[i] = v - prev;
    prev = v;
  }
  return out;
}

/** Gerçekleşen brüt/endirekt prim + aylık desen (Ocak–maxAy mizan, kalan aylar 0). */
export function gercekPrimFromMizan(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
): GercekPrimPaket {
  const brutKumul = kumulByBransGt(mizanAylikFull, butceYili, "0111");
  const endKumul = kumulByBransGt(mizanAylikFull, butceYili, "0112");
  const maxAy = Math.max(maxAyFromKumul(brutKumul), maxAyFromKumul(endKumul), 1);

  const primHedefleri: Record<string, number> = {};
  const endirektPrim: Record<string, number> = {};
  const aylikSatirlar: AylikPrimStore["satirlar"] = [];

  const tumBrans = new Set([...brutKumul.keys(), ...endKumul.keys()]);
  for (const b of tumBrans) {
    const brutSer = brutKumul.get(b) ?? Array(12).fill(0);
    const endSer = endKumul.get(b) ?? Array(12).fill(0);
    const brutAylik = kumulToIncrementalYtd(brutSer, maxAy);
    const endAylik = kumulToIncrementalYtd(endSer, maxAy);
    const brutToplam = brutSer[maxAy - 1] ?? brutAylik.reduce((a, x) => a + x, 0);
    const endToplam = endSer[maxAy - 1] ?? endAylik.reduce((a, x) => a + x, 0);
    if (brutToplam > 0) {
      primHedefleri[b] = brutToplam;
      aylikSatirlar.push({ bransKodu: b, aylar: brutAylik, toplam: brutToplam });
    }
    if (endToplam !== 0) endirektPrim[b] = endToplam;
  }

  const aylikPrim: AylikPrimStore = {
    butceYili,
    referansYil: butceYili,
    kaynak: "mizan_aylik",
    genelOranlar: Array(12).fill(1 / 12),
    satirlar: aylikSatirlar,
    guncellemeIso: new Date().toISOString(),
  };

  return {
    primHedefleri,
    endirektPrim,
    aylikPrim,
    maxAy,
    brutToplam: Object.values(primHedefleri).reduce((a, x) => a + x, 0),
    endirektToplam: Object.values(endirektPrim).reduce((a, x) => a + x, 0),
  };
}
