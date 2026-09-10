import type { V2TeknikOranSatir } from "./v2GtOranTablo";

/** GT satır → teknik oran kalemi (prim × oran) veya devreden mizan. */
export type V2CarpimSatirTanim = {
  oranKalem: string;
  oranHucre: string;
  /** Baz GT satırı (genelde F11 brüt prim). */
  bazSatir: number;
  /** Devreden muallak: mizandan, prim×oran değil. */
  devredenMizan?: boolean;
};

export const V2_MUALLAK_CARPIM: Record<number, V2CarpimSatirTanim> = {
  116: { oranKalem: "02211", oranHucre: "F451", bazSatir: 11 },
  126: { oranKalem: "02212", oranHucre: "F456", bazSatir: 11, devredenMizan: true },
  137: { oranKalem: "02221", oranHucre: "F466", bazSatir: 11 },
  147: { oranKalem: "02222", oranHucre: "F471", bazSatir: 11, devredenMizan: true },
};

export type V2CarpimAciklama = {
  satir: number;
  metin: string;
  oran: number | null;
  baz: number | null;
  hesaplanan: number | null;
  gosterilen: number;
};

const tl = (n: number) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n);

const pct = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function oranSatirBul(satirlar: V2TeknikOranSatir[], kalem: string): V2TeknikOranSatir | undefined {
  return satirlar.find((s) => s.kalem === kalem);
}

export function v2CarpimAciklamalari(
  oranSatirlar: V2TeknikOranSatir[],
  ozetDeger: (satir: number) => number,
  ozetAy: number,
  butceYili = 2026,
): V2CarpimAciklama[] {
  const out: V2CarpimAciklama[] = [];
  for (const [satirStr, tanim] of Object.entries(V2_MUALLAK_CARPIM)) {
    const satir = Number(satirStr);
    const gosterilen = ozetDeger(satir);
    const baz = ozetDeger(tanim.bazSatir);
    const oranRow = oranSatirBul(oranSatirlar, tanim.oranKalem);
    const oran = oranRow?.uygulanan ?? null;

    if (tanim.devredenMizan) {
      const metin =
        Math.abs(gosterilen) >= 1
          ? `${butceYili - 1} Aralık mizan → Ocak hareketi · ${tanim.oranHucre}×prim kullanılmaz`
          : `${butceYili - 1} Aralık mizan yok — ${tanim.oranHucre}×prim yedek (Ocak)`;
      out.push({
        satir,
        metin: `${metin} · Tablo: ${tl(gosterilen)}`,
        oran,
        baz,
        hesaplanan: oran != null && baz > 0 ? baz * oran : null,
        gosterilen,
      });
      continue;
    }

    const hesaplanan = oran != null && baz > 0 ? baz * oran : null;
    let metin: string;
    if (baz <= 0) {
      metin = `Brüt prim (F${tanim.bazSatir}) = 0`;
    } else if (oran == null) {
      metin = `${tl(baz)} × ? (${tanim.oranHucre} oranı yok)`;
    } else if (Math.abs(oran) < 1e-9) {
      metin = `${tl(baz)} × ${pct(0)} = 0 · ${tanim.oranHucre} (GT ay ${String(ozetAy).padStart(2, "0")} birleştirme = 0)`;
    } else {
      metin = `${tl(baz)} × ${pct(oran)} = ${tl(hesaplanan ?? 0)} · ${tanim.oranHucre}`;
    }
    if (hesaplanan != null && Math.abs(hesaplanan - gosterilen) > 1) {
      metin += ` · Tablo: ${tl(gosterilen)}`;
    }
    out.push({ satir, metin, oran, baz, hesaplanan, gosterilen });
  }
  return out;
}

export function v2CarpimAciklamaMap(
  aciklamalar: V2CarpimAciklama[],
): Map<number, V2CarpimAciklama> {
  return new Map(aciklamalar.map((a) => [a.satir, a]));
}
