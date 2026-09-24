/** Devreden muallak: önceki yıl cari kapanış → ters işaretle yalnızca Ocak. */
import { normalizeBransKodu } from "../textUtils";
import { MizanOranServisi } from "../oran/mizanOranlar";
import type {
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
  OranYilBirlestirmeStore,
} from "../types";

export type MuallakDevredenOcak = {
  /** GT F126 — 611012 devreden muallak (Ocak hareketi). */
  satir126: number;
  /** GT F147 — 611022 devreden RE payı (Ocak hareketi). */
  satir147: number;
};

const GT_KAPANIS_CARI = [
  { gtKod: "02211", key: "satir126" as const },
  { gtKod: "02221", key: "satir147" as const },
] as const;

/**
 * 31.12.(Y−1) cari → 01.01.Y devreden:
 * 611012 = −611011, 611022 = −611021.
 */
export function devredenMuallakOcakFromMizan(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
): Map<string, MuallakDevredenOcak> {
  const oncekiYil = butceYili - 1;
  const raw = new Map<string, Partial<MuallakDevredenOcak>>();

  for (const { gtKod, key } of GT_KAPANIS_CARI) {
    for (const r of mizanAylikFull) {
      if (Number(r.yil) !== oncekiYil) continue;
      if (Number(r.ay) !== 12) continue;
      if (String(r.hesap) !== gtKod) continue;
      const b = normalizeBransKodu(r.bransKodu);
      if (!/^7\d{2}$/.test(b)) continue;
      if (!raw.has(b)) raw.set(b, {});
      const row = raw.get(b)!;
      row[key] = (row[key] ?? 0) + (Number(r.tutar) || 0);
    }
  }

  const out = new Map<string, MuallakDevredenOcak>();
  for (const [b, v] of raw) {
    out.set(b, {
      satir126: -(v.satir126 ?? 0),
      satir147: -(v.satir147 ?? 0),
    });
  }
  return out;
}

export function hasMuallakMizanKapanis(
  mizanAylikFull: MizanAylikRow[],
  butceYili: number,
): boolean {
  const oncekiYil = butceYili - 1;
  return mizanAylikFull.some(
    (r) =>
      Number(r.yil) === oncekiYil &&
      Number(r.ay) === 12 &&
      String(r.hesap) === "02211" &&
      /^7\d{2}$/.test(normalizeBransKodu(r.bransKodu)) &&
      Math.abs(Number(r.tutar) || 0) > 1,
  );
}

export type MuallakDevredenKaynakModu = "mizan_kapanis" | "eye_yil_sonu";

/**
 * Açık önceki yıl için EYE:
 * son gerçek ay 0111 YTD yıllıklaştırılır, geçmiş yılsonu F451/F466 oranıyla
 * 611011/611021 kapanışı tahmin edilir; ardından işaret ters çevrilir.
 */
export function buildDevredenMuallakZincir(opts: {
  butceYili: number;
  mizan: MizanRow[];
  mizanAylikFull: MizanAylikRow[];
  oranAyar: OranAyarStore;
  kalemYilBirlestirme?: OranYilBirlestirmeStore;
}): {
  devredenOcak: Map<string, MuallakDevredenOcak>;
  kaynakModu: MuallakDevredenKaynakModu;
  eyeAnchorAy: number | null;
} {
  if (hasMuallakMizanKapanis(opts.mizanAylikFull, opts.butceYili)) {
    return {
      devredenOcak: devredenMuallakOcakFromMizan(opts.mizanAylikFull, opts.butceYili),
      kaynakModu: "mizan_kapanis",
      eyeAnchorAy: 12,
    };
  }

  const oncekiYil = opts.butceYili - 1;
  const eyeAnchorAy = opts.mizanAylikFull.reduce(
    (max, r) => Number(r.yil) === oncekiYil && String(r.hesap) === "0111"
      ? Math.max(max, Number(r.ay) || 0)
      : max,
    0,
  );
  if (eyeAnchorAy < 1) {
    return { devredenOcak: new Map(), kaynakModu: "eye_yil_sonu", eyeAnchorAy: null };
  }

  // butceYili=oncekiYil: açık yılı tarihsel oran eğitiminden çıkarır.
  const servis = new MizanOranServisi(
    opts.mizan,
    oncekiYil,
    opts.mizanAylikFull,
    true,
    opts.kalemYilBirlestirme ?? {},
  );
  const f451 = new Map(
    servis.tumBranslarTablosu("02211", opts.oranAyar["02211"] ?? {}, { ay: 12 })
      .map((r) => [r.bransKodu, r.oran]),
  );
  const f466 = new Map(
    servis.tumBranslarTablosu("02221", opts.oranAyar["02221"] ?? {}, { ay: 12 })
      .map((r) => [r.bransKodu, r.oran]),
  );
  const primYtd = new Map<string, number>();
  for (const r of opts.mizanAylikFull) {
    if (Number(r.yil) !== oncekiYil || Number(r.ay) !== eyeAnchorAy) continue;
    if (String(r.hesap) !== "0111") continue;
    const brans = normalizeBransKodu(r.bransKodu);
    if (!/^7\d{2}$/.test(brans)) continue;
    primYtd.set(brans, (primYtd.get(brans) ?? 0) + (Number(r.tutar) || 0));
  }

  const devredenOcak = new Map<string, MuallakDevredenOcak>();
  for (const [brans, ytd] of primYtd) {
    const annualPrim = Math.abs(ytd) * (12 / eyeAnchorAy);
    const eye611011 = annualPrim * (f451.get(brans) ?? 0);
    const eye611021 = annualPrim * (f466.get(brans) ?? 0);
    devredenOcak.set(brans, {
      satir126: -eye611011,
      satir147: -eye611021,
    });
  }
  return { devredenOcak, kaynakModu: "eye_yil_sonu", eyeAnchorAy };
}

export function devredenMuallakOcakOzet(map: Map<string, MuallakDevredenOcak>): {
  satir126Toplam: number;
  satir147Toplam: number;
  bransSayisi: number;
} {
  let satir126Toplam = 0;
  let satir147Toplam = 0;
  for (const v of map.values()) {
    satir126Toplam += v.satir126;
    satir147Toplam += v.satir147;
  }
  return { satir126Toplam, satir147Toplam, bransSayisi: map.size };
}
