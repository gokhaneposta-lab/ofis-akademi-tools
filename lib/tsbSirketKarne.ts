/**
 * Şirket karne dashboard — mevcut prim/finansal panellerden türetilmiş özet paket.
 */

import type { BransDegisimOzet, BransDegisimSatir, BransPayDilim } from "./tsbBransDegisim";
import {
  buildBransDegisimAylikTablosu,
  buildBransDegisimTablosu,
  buildBransPaySnapshotKarsilastirma,
} from "./tsbBransDegisim";
import type { BransSiraOzet, BransSiraSatir } from "./tsbBransSira";
import { buildBransSiraTablosu, listSirketlerSiraOzeti } from "./tsbBransSira";
import { buildSon12AyPrimTrend, kumulatifSeridenAylikUretim, type PrimTrendAylikNokta } from "./tsbPrimTrend12";
import {
  aggregateKanalDagilim,
  kanalBazindaSirketSektorPayYuzde,
  kanalYuzdeleri,
  KANAL_DAGILIM_SATIRLARI,
  type KanalDagilimSatirKey,
} from "./tsbKanalDagilim";
import type { TsbKanalField, TsbPrimDaraltma, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import { prevYearPeriod, sirketSegmentFromKodu } from "./tsbPrimDashboard";

export type KarnePrimSirasi = {
  sira: number | null;
  katilimci: number;
  prim: number;
};

export type KarnePrimSatir = BransDegisimSatir & {
  bransSirasi: string;
};

export type KarneKanalSatir = {
  key: KanalDagilimSatirKey;
  label: string;
  uretimBu: number;
  uretimOnceki: number;
  degisimYuzde: number | null;
  payBuYuzde: number;
  kanaldaSektorPayBu: number | null;
  kanaldaSektorPayOnceki: number | null;
  kanaldaPayDegisimPp: number | null;
};

export type SirketKarnePrimPaket = {
  donemBu: string;
  donemOnceki: string;
  aylik: BransDegisimOzet;
  ytd: BransDegisimOzet;
  aylikSatirlar: KarnePrimSatir[];
  ytdSatirlar: KarnePrimSatir[];
  portfoySirasi: KarnePrimSirasi;
  payDilimleriBu: BransPayDilim[];
  payDilimleriOnceki: BransPayDilim[];
  kanalSatirlari: KarneKanalSatir[];
  trendAylik: PrimTrendAylikNokta[] | null;
};

function degisimYuzde(onceki: number, bu: number): number | null {
  if (onceki === 0) return bu === 0 ? 0 : null;
  return ((bu - onceki) / Math.abs(onceki)) * 100;
}

export function portfoyPrimSirasi(
  liste: { kod: number; toplam: number }[],
  sirketKodu: number,
): KarnePrimSirasi {
  const positive = liste.filter((s) => s.toplam > 0);
  let rank = 1;
  for (let i = 0; i < positive.length; i++) {
    if (i > 0 && positive[i].toplam < positive[i - 1].toplam) rank = i + 1;
    if (positive[i].kod === sirketKodu) {
      return { sira: rank, katilimci: positive.length, prim: positive[i].toplam };
    }
  }
  const prim = liste.find((s) => s.kod === sirketKodu)?.toplam ?? 0;
  return { sira: null, katilimci: positive.length, prim };
}

function bransSirasiMetin(s: BransSiraSatir | undefined): string {
  if (!s || s.siraBu === null) return "—";
  return `${s.siraBu} / ${s.katilimciBu}`;
}

function siraSatirlariForSegment(sira: BransSiraOzet, segment: TsbSektorSegment): BransSiraSatir[] {
  if (segment === "hayatdisi") return sira.hayatdisiBranslar;
  return sira.hayatBranslar;
}

function listPortfoySirasi(
  rows: TsbPrimRow[],
  donem: string,
  channel: TsbKanalField,
  daraltma: TsbPrimDaraltma,
  segment: TsbSektorSegment,
): { kod: number; toplam: number }[] {
  return listSirketlerSiraOzeti(rows, donem, channel, daraltma)
    .filter((s) => sirketSegmentFromKodu(rows, s.kod) === segment)
    .map((s) => ({ kod: s.kod, toplam: s.toplam }));
}

function buildKanalSatirlari(
  rows: TsbPrimRow[],
  donemBu: string,
  donemOnceki: string,
  segment: TsbSektorSegment,
  daraltma: TsbPrimDaraltma,
  sirketKodu: number,
): KarneKanalSatir[] {
  // TSB prim tidy yıl içi kümülatif — Kanal dağılım paneli ile aynı mantık.
  // Önceki aydan fark almak, TSB revizyonlarında sahte negatif "aylık üretim" üretir.
  const sirketBu = aggregateKanalDagilim(rows, donemBu, segment, daraltma, sirketKodu);
  const sirketOc = aggregateKanalDagilim(rows, donemOnceki, segment, daraltma, sirketKodu);
  const sektorBu = aggregateKanalDagilim(rows, donemBu, segment, daraltma, null);
  const sektorOc = aggregateKanalDagilim(rows, donemOnceki, segment, daraltma, null);
  const payBu = kanalYuzdeleri(sirketBu);
  const payKanalBu = kanalBazindaSirketSektorPayYuzde(sirketBu, sektorBu);
  const payKanalOc = kanalBazindaSirketSektorPayYuzde(sirketOc, sektorOc);

  return KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => {
    const uretimBu = sirketBu[key];
    const uretimOnceki = sirketOc[key];
    const kb = payKanalBu[key];
    const ko = payKanalOc[key];
    return {
      key,
      label,
      uretimBu,
      uretimOnceki,
      degisimYuzde: degisimYuzde(uretimOnceki, uretimBu),
      payBuYuzde: payBu[key],
      kanaldaSektorPayBu: kb,
      kanaldaSektorPayOnceki: ko,
      kanaldaPayDegisimPp: kb !== null && ko !== null ? kb - ko : null,
    };
  });
}

/** Prim verisi + ana branş daraltması ile karne prim paketi. */
export function buildSirketKarnePrimPaket(
  rows: TsbPrimRow[],
  sortedDonemler: string[],
  donemBu: string,
  segment: TsbSektorSegment,
  sirketKodu: number,
  daraltma: TsbPrimDaraltma = { kind: "anaBransH", anaBransH: null },
  channel: TsbKanalField = "genelToplam",
): SirketKarnePrimPaket | null {
  const donemOnceki = prevYearPeriod(donemBu);
  if (!donemOnceki) return null;

  const kiyas = { mod: "sektor" as const };
  const aylik = buildBransDegisimAylikTablosu(rows, donemBu, channel, sirketKodu, daraltma, kiyas);
  const ytd = buildBransDegisimTablosu(rows, donemBu, channel, sirketKodu, daraltma, kiyas);
  if (!aylik || !ytd) return null;

  const sira = buildBransSiraTablosu(rows, donemBu, channel, sirketKodu, daraltma);
  if (!sira) return null;

  const liste = listPortfoySirasi(rows, donemBu, channel, daraltma, segment);
  const portfoySirasi = portfoyPrimSirasi(liste, sirketKodu);

  const siraMap = new Map(
    siraSatirlariForSegment(sira, aylik.tabloHavuzu).map((s) => [s.anaBransH, s]),
  );

  function mapSatirlar(tablo: BransDegisimOzet, withSirasi: boolean): KarnePrimSatir[] {
    const out: KarnePrimSatir[] = tablo.branslar.map((b) => ({
      ...b,
      bransSirasi: withSirasi ? bransSirasiMetin(siraMap.get(b.anaBransH)) : "—",
    }));
    if (tablo.trafikHaricToplam) {
      out.push({ ...tablo.trafikHaricToplam, bransSirasi: "—" });
    }
    const portfoySira = withSirasi
      ? portfoySirasi.sira !== null
        ? `${portfoySirasi.sira} / ${portfoySirasi.katilimci}`
        : "—"
      : "—";
    out.push({ ...tablo.toplam, bransSirasi: portfoySira });
    return out;
  }

  const paySnap = buildBransPaySnapshotKarsilastirma(aylik);

  const trend = buildSon12AyPrimTrend(rows, sortedDonemler, donemBu, channel, segment, sirketKodu, daraltma);
  const trendAylik = trend ? kumulatifSeridenAylikUretim(trend) : null;

  return {
    donemBu,
    donemOnceki,
    aylik,
    ytd,
    aylikSatirlar: mapSatirlar(aylik, true),
    ytdSatirlar: mapSatirlar(ytd, false),
    portfoySirasi,
    payDilimleriBu: paySnap.bu,
    payDilimleriOnceki: paySnap.onceki,
    kanalSatirlari: buildKanalSatirlari(rows, donemBu, donemOnceki, segment, daraltma, sirketKodu),
    trendAylik,
  };
}
