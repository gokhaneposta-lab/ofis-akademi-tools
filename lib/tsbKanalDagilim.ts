import type { TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import { isTsbToplamSirketKodu, rowMatchesSegment } from "./tsbPrimDashboard";

export type KanalDagilimKutu = {
  merkez: number;
  acente: number;
  banka: number;
  broker: number;
  diger: number;
  genelToplam: number;
};

export type KanalDagilimSatirKey = "merkez" | "acente" | "banka" | "broker" | "diger";

export const KANAL_DAGILIM_SATIRLARI: { key: KanalDagilimSatirKey; label: string }[] = [
  { key: "merkez", label: "Merkez" },
  { key: "acente", label: "Acente" },
  { key: "banka", label: "Banka" },
  { key: "broker", label: "Broker" },
  { key: "diger", label: "Diğer" },
];

/** Kanal tutarlarını topla (şirket veya tüm sektör) */
export function aggregateKanalDagilim(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  anaBransH: string | null,
  sirketKodu: number | null,
): KanalDagilimKutu {
  let merkez = 0;
  let acente = 0;
  let banka = 0;
  let broker = 0;
  let diger = 0;
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (anaBransH && r.anaBransH !== anaBransH) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (sirketKodu !== null && r.sirketKodu !== sirketKodu) continue;
    merkez += r.merkez;
    acente += r.acente;
    banka += r.banka;
    broker += r.broker;
    diger += r.diger;
  }
  const genelToplam = merkez + acente + banka + broker + diger;
  return { merkez, acente, banka, broker, diger, genelToplam };
}

export function kanalYuzdeleri(k: KanalDagilimKutu): Record<KanalDagilimSatirKey, number> {
  const payda = k.genelToplam > 0 ? 100 / k.genelToplam : 0;
  return {
    merkez: k.merkez * payda,
    acente: k.acente * payda,
    banka: k.banka * payda,
    broker: k.broker * payda,
    diger: k.diger * payda,
  };
}

export type KanalDagilimKiyas = {
  sirket: KanalDagilimKutu;
  sektor: KanalDagilimKutu;
};

export function buildKanalDagilimKiyas(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  anaBransH: string | null,
  sirketKodu: number,
): KanalDagilimKiyas {
  return {
    sirket: aggregateKanalDagilim(rows, donem, segment, anaBransH, sirketKodu),
    sektor: aggregateKanalDagilim(rows, donem, segment, anaBransH, null),
  };
}

/** Seçilen segment + branşta üretimi olan şirketler (genel toplam prim sırası) */
export function listSirketlerKanalDagilim(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  anaBransH: string | null,
): { kod: number; ad: string; toplam: number }[] {
  const m = new Map<number, { ad: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (anaBransH && r.anaBransH !== anaBransH) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    const v = r.genelToplam;
    const cur = m.get(r.sirketKodu);
    if (!cur) {
      m.set(r.sirketKodu, { ad: r.sirketAdi, toplam: v });
    } else {
      cur.toplam += v;
      if (r.sirketAdi) cur.ad = r.sirketAdi;
    }
  }
  const arr = [...m.entries()].map(([kod, { ad, toplam }]) => ({ kod, ad, toplam }));
  arr.sort((a, b) => b.toplam - a.toplam);
  return arr;
}
