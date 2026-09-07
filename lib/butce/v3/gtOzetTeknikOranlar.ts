/**
 * GT_Ozet Excel — tablodaki aylık tutarlardan türetilen teknik oranlar.
 * TSB brüt/net H/P pay–payda tanımı (hayat dışı GT satırları) ile uyumlu.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";

export type GtOzetOranTanim = {
  id: string;
  ad: string;
  formul: string;
  /** Aylık oran (0–1); payda=0 ise null. */
  hesapla: (ser: (satir: number) => number[]) => (number | null)[];
};

function v(ser: (s: number) => number[], satir: number, ay: number): number {
  return ser(satir)[ay] ?? 0;
}

function sumAy(
  ser: (s: number) => number[],
  satirlar: readonly number[],
  ay: number,
): number {
  return satirlar.reduce((a, s) => a + v(ser, s, ay), 0);
}

/** Excel H/P: (pay / payda) × (−1) — gider işaretleri pozitif oran üretir. */
function hpOran(pay: number, payda: number): number | null {
  if (Math.abs(payda) < 1) return null;
  return (pay / payda) * -1;
}

function oranSerisi(
  ser: (s: number) => number[],
  aylikFn: (ay: number) => number | null,
): (number | null)[] {
  const out: (number | null)[] = [];
  for (let ay = 0; ay < 12; ay++) out.push(aylikFn(ay));
  return out;
}

function carpimOran(
  ser: (s: number) => number[],
  paySatirlar: readonly number[],
  bazSatirlar: readonly number[],
): (number | null)[] {
  return oranSerisi(ser, (ay) => {
    const pay = sumAy(ser, paySatirlar, ay);
    const baz = sumAy(ser, bazSatirlar, ay);
    if (Math.abs(baz) < 1) return null;
    return pay / baz;
  });
}

/** Brüt hasar pay (61001 + 611011 + 611012). */
const BRUT_HASAR = [96, 116, 126] as const;
/** Brüt kazanılmış prim paydası — TSB satır 185. */
const BRUT_PRIM = [11, 23, 24, 20, 29, 30, 33, 34] as const;
const DERK_PRIM = [33, 34] as const;
/** Net hasar pay. */
const NET_HASAR = [96, 105, 116, 137, 126, 147] as const;
/** Net kazanılmış prim paydası — TSB satır 186 (GT F karşılıkları). */
const NET_PRIM = [11, 19, 20, 23, 26, 24, 27, 29, 30, 36, 37, 33, 34] as const;

export const GT_OZET_TEKNIK_ORANLAR: readonly GtOzetOranTanim[] = [
  {
    id: "brut_hp",
    ad: "Brüt H/P",
    formul: "(61001+611011+611012) ÷ (60001+60101+60003+60103+60201) × (−1)",
    hesapla: (ser) =>
      oranSerisi(ser, (ay) => {
        const pay = sumAy(ser, BRUT_HASAR, ay);
        const payda = sumAy(ser, BRUT_PRIM, ay);
        return hpOran(pay, payda);
      }),
  },
  {
    id: "net_hp",
    ad: "Net H/P",
    formul: "(61001+61002+61101+61102) ÷ (600+601+602 net kazanılmış) × (−1)",
    hesapla: (ser) =>
      oranSerisi(ser, (ay) => {
        const pay = sumAy(ser, NET_HASAR, ay);
        const payda = sumAy(ser, NET_PRIM, ay);
        return hpOran(pay, payda);
      }),
  },
  {
    id: "brut_hp_derk_haric",
    ad: "Brüt H/P (DERK hariç)",
    formul: "Brüt hasar pay ÷ (brüt kazanılmış prim − 60201)",
    hesapla: (ser) =>
      oranSerisi(ser, (ay) => {
        const pay = sumAy(ser, BRUT_HASAR, ay);
        const payda = sumAy(ser, BRUT_PRIM, ay) - sumAy(ser, DERK_PRIM, ay);
        return hpOran(pay, payda);
      }),
  },
  {
    id: "odenen_prim",
    ad: "Brüt ödenen hasar / prim",
    formul: "61001 (F96) ÷ 60001 (F11)",
    hesapla: (ser) => carpimOran(ser, [96], [11]),
  },
  {
    id: "muallak_brut_prim",
    ad: "Brüt muallak / prim",
    formul: "611011 (F116) ÷ 60001 (F11)",
    hesapla: (ser) => carpimOran(ser, [116], [11]),
  },
  {
    id: "reas_prim",
    ad: "Reasürans devri / prim",
    formul: "60002 (F19) ÷ 60001 (F11)",
    hesapla: (ser) => carpimOran(ser, [19], [11]),
  },
  {
    id: "sgk_prim",
    ad: "SGK aktarılan / prim",
    formul: "60003 (F20) ÷ 60001 (F11)",
    hesapla: (ser) => carpimOran(ser, [20], [11]),
  },
  {
    id: "kpk_cari_prim",
    ad: "KPK cari / prim",
    formul: "601011 (F23) ÷ 60001 (F11)",
    hesapla: (ser) => carpimOran(ser, [23], [11]),
  },
  {
    id: "derk_cari_prim",
    ad: "DERK cari / prim",
    formul: "602011 (F33) ÷ 60001 (F11)",
    hesapla: (ser) => carpimOran(ser, [33], [11]),
  },
  {
    id: "muallak_re_prim",
    ad: "Muallak RE payı / prim",
    formul: "611021 (F137) ÷ 60001 (F11)",
    hesapla: (ser) => carpimOran(ser, [137], [11]),
  },
  {
    id: "rucu",
    ad: "Rücu ve sovtaj / (ödenen+muallak brüt)",
    formul: "605 (F86) ÷ (F96+F116)",
    hesapla: (ser) =>
      oranSerisi(ser, (ay) => {
        const pay = v(ser, 86, ay);
        const baz = v(ser, 96, ay) + v(ser, 116, ay);
        if (Math.abs(baz) < 1) return null;
        return Math.abs(pay / baz);
      }),
  },
];

export function gtOzetOranSatirlari(
  gt: GelirTablosuSonuc,
): Array<{ tanim: GtOzetOranTanim; aylar: (number | null)[]; yillik: number | null }> {
  const ser = (satir: number) => gt.aylikToplam[satir] ?? Array(12).fill(0);
  return GT_OZET_TEKNIK_ORANLAR.map((tanim) => {
    const aylar = tanim.hesapla(ser);
    const payFn = tanim.id;
    let yillik: number | null = null;
    if (payFn === "brut_hp" || payFn === "net_hp" || payFn === "brut_hp_derk_haric") {
      const brutHasarY = BRUT_HASAR.reduce((a, s) => a + ser(s).reduce((x, y) => x + y, 0), 0);
      const netHasarY = NET_HASAR.reduce((a, s) => a + ser(s).reduce((x, y) => x + y, 0), 0);
      const brutPrimY = BRUT_PRIM.reduce((a, s) => a + ser(s).reduce((x, y) => x + y, 0), 0);
      const netPrimY = NET_PRIM.reduce((a, s) => a + ser(s).reduce((x, y) => x + y, 0), 0);
      const derkY = DERK_PRIM.reduce((a, s) => a + ser(s).reduce((x, y) => x + y, 0), 0);
      if (payFn === "brut_hp") yillik = hpOran(brutHasarY, brutPrimY);
      else if (payFn === "net_hp") yillik = hpOran(netHasarY, netPrimY);
      else yillik = hpOran(brutHasarY, brutPrimY - derkY);
    } else {
      const paySat =
        payFn === "odenen_prim" ? [96]
        : payFn === "muallak_brut_prim" ? [116]
        : payFn === "reas_prim" ? [19]
        : payFn === "sgk_prim" ? [20]
        : payFn === "kpk_cari_prim" ? [23]
        : payFn === "derk_cari_prim" ? [33]
        : payFn === "muallak_re_prim" ? [137]
        : payFn === "rucu" ? [86]
        : [];
      const bazSat =
        payFn === "rucu" ? null : [11];
      if (paySat.length && bazSat) {
        const payY = paySat.reduce((a, s) => a + ser(s).reduce((x, y) => x + y, 0), 0);
        const bazY = bazSat.reduce((a, s) => a + ser(s).reduce((x, y) => x + y, 0), 0);
        yillik = payFn === "rucu" ? null : bazY !== 0 ? payY / bazY : null;
      }
      if (payFn === "rucu") {
        const payY = ser(86).reduce((a, x) => a + x, 0);
        const bazY = ser(96).reduce((a, x) => a + x, 0) + ser(116).reduce((a, x) => a + x, 0);
        yillik = Math.abs(bazY) >= 1 ? Math.abs(payY / bazY) : null;
      }
    }
    return { tanim, aylar, yillik };
  });
}
