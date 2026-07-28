import type { OlcekSegmentHarfi } from "./tsbOlcekSegment";
import { olcekSegmentEsleri } from "./tsbOlcekSegment";
import {
  HAYAT_ANA_BRANS_SIRASI,
  HD_ANA_BRANS_SIRASI,
} from "./tsbBransDegisim";
import {
  buildGelirTidyDonemLookup,
  segmentPeerSirketKodlari,
  type GelirTidyDonemLookup,
  type SegmentSkorPool,
} from "./tsbSirketSegmentSkor";
import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";

const GT = "GT";
const HAYAT = "HAYAT";
const EMEKLILIK = "EMEKLİLİK";

type TeknikBlok = {
  gelir: string;
  gider: string;
  prefix: string;
};

export type AnaBransTkzKiyasHedef =
  | { mod: "sektor" }
  | { mod: "olcek" }
  | { mod: "sirket"; sirketKodu: number };

export type AnaBransTkzSatir = {
  anaBransH: string;
  sirketTeknikGelir: number;
  sirketTeknikGider: number;
  sirketTkz: number;
  kiyasTeknikGelir: number;
  kiyasTeknikGider: number;
  kiyasTkz: number;
};

export type AnaBransTkzOzet = {
  donem: string;
  pool: SegmentSkorPool;
  kiyasMod: AnaBransTkzKiyasHedef["mod"];
  peerSayisi: number;
  kiyasOlcekSegment?: OlcekSegmentHarfi;
  satirlar: AnaBransTkzSatir[];
  toplam: AnaBransTkzSatir;
};

type SatirBilesen = {
  teknikGelir: number;
  teknikGider: number;
  tkz: number;
};

const ANA_BRANS_GT_CANDIDATES: Record<string, readonly (readonly string[])[]> = {
  KAZA: [["KAZA"]],
  "HASTALIK SAĞLIK": [["HASTALIK-SAĞLIK", "SAĞLIK", "HASTALIK SAĞLIK"]],
  "KARA ARAÇLARI": [["KARA ARAÇLARI", "KASKO"]],
  "RAYLI ARAÇLARI": [["RAYLI ARAÇLARI", "RAYLI ARAÇLAR"]],
  "HAVA ARAÇLARI": [["HAVA ARAÇLARI"]],
  "SU ARAÇLARI": [["SU ARAÇLARI"]],
  NAKLİYAT: [["NAKLİYAT"]],
  "YANGIN DOĞAL AFET": [["YANGIN VE DOĞAL AFETLER"]],
  "GENEL ZARARLAR": [["GENEL ZARARLAR"]],
  "KARA ARAÇLARI SORUMLULUK": [["KARA ARAÇLARI SORUMLULUK", "TRAFİK", "TRAFIK"]],
  "HAVA ARAÇLARI SORUMLULUK": [["HAVA ARAÇLARI SORUMLULUK"]],
  "SU ARAÇLARI SORUMLULUK": [["SU ARAÇLARI SORUMLULUK"]],
  "GENEL SORUMLULUK": [["GENEL SORUMLULUK"]],
  KREDİ: [["KREDİ"]],
  KEFALET: [["KEFALET"]],
  "FİNANSAL KAYIP": [["FİNANSAL KAYIPLAR", "FİNANSAL KAYIP"]],
  "HUKUKSAL KORUMA": [["HUKUKSAL KORUMA"]],
  DESTEK: [["DESTEK"]],
  HAYAT: [["HAYAT"], [EMEKLILIK]],
};

function teknikBlokForBransAp(bransAp: string): TeknikBlok {
  if (bransAp === HAYAT) return { gelir: "62", gider: "63", prefix: "636" };
  if (bransAp === EMEKLILIK) return { gelir: "64", gider: "65", prefix: "652" };
  return { gelir: "60", gider: "61", prefix: "614" };
}

function gtCell(
  lookup: GelirTidyDonemLookup,
  sirketKodu: number,
  bransAp: string,
  hesapKodu: string | number,
): number {
  const key = `${GT}|${bransAp}|${String(hesapKodu).trim()}`;
  return lookup.get(sirketKodu)?.get(key) ?? 0;
}

function availableGtBransSet(rows: Iterable<TsbGelirTidyRowLike>, donem: string): Set<string> {
  const out = new Set<string>();
  for (const r of rows) {
    if (r.donem !== donem || r.tabloTip !== GT) continue;
    if (!r.bransAp) continue;
    out.add(r.bransAp);
  }
  return out;
}

function resolveGtBranslari(anaBransH: string, mevcut: Set<string>): string[] {
  const groups = ANA_BRANS_GT_CANDIDATES[anaBransH] ?? [[anaBransH]];
  const resolved: string[] = [];
  for (const group of groups) {
    const hit = group.find((x) => mevcut.has(x));
    if (hit) resolved.push(hit);
  }
  return resolved;
}

function listAnaBranslarForPool(rows: Iterable<TsbGelirTidyRowLike>, donem: string, pool: SegmentSkorPool) {
  const mevcut = availableGtBransSet(rows, donem);
  const sira = pool === "HD" ? HD_ANA_BRANS_SIRASI : HAYAT_ANA_BRANS_SIRASI;
  return sira
    .map((anaBransH) => ({ anaBransH, gtBranslari: resolveGtBranslari(anaBransH, mevcut) }))
    .filter((x) => x.gtBranslari.length > 0);
}

function bilesenForBranslar(
  lookup: GelirTidyDonemLookup,
  sirketKodlari: readonly number[],
  gtBranslari: readonly string[],
  ortalama: boolean,
): SatirBilesen {
  if (sirketKodlari.length === 0 || gtBranslari.length === 0) {
    return { teknikGelir: 0, teknikGider: 0, tkz: 0 };
  }

  let teknikGelir = 0;
  let teknikGider = 0;
  for (const kod of sirketKodlari) {
    for (const bransAp of gtBranslari) {
      const blok = teknikBlokForBransAp(bransAp);
      const altGider =
        gtCell(lookup, kod, bransAp, `${blok.prefix}02`) +
        gtCell(lookup, kod, bransAp, `${blok.prefix}03`) +
        gtCell(lookup, kod, bransAp, `${blok.prefix}04`) +
        gtCell(lookup, kod, bransAp, `${blok.prefix}05`) +
        gtCell(lookup, kod, bransAp, `${blok.prefix}06`);
      teknikGelir += gtCell(lookup, kod, bransAp, blok.gelir) - gtCell(lookup, kod, bransAp, "603");
      teknikGider += gtCell(lookup, kod, bransAp, blok.gider) - altGider;
    }
  }

  if (ortalama) {
    teknikGelir /= sirketKodlari.length;
    teknikGider /= sirketKodlari.length;
  }
  return { teknikGelir, teknikGider, tkz: teknikGelir + teknikGider };
}

function satirFromBilesen(
  anaBransH: string,
  sirket: SatirBilesen,
  kiyas: SatirBilesen,
): AnaBransTkzSatir {
  return {
    anaBransH,
    sirketTeknikGelir: sirket.teknikGelir,
    sirketTeknikGider: sirket.teknikGider,
    sirketTkz: sirket.tkz,
    kiyasTeknikGelir: kiyas.teknikGelir,
    kiyasTeknikGider: kiyas.teknikGider,
    kiyasTkz: kiyas.tkz,
  };
}

function toplamSatir(satirlar: AnaBransTkzSatir[], etiket: string): AnaBransTkzSatir {
  return satirlar.reduce<AnaBransTkzSatir>(
    (acc, satir) => ({
      anaBransH: etiket,
      sirketTeknikGelir: acc.sirketTeknikGelir + satir.sirketTeknikGelir,
      sirketTeknikGider: acc.sirketTeknikGider + satir.sirketTeknikGider,
      sirketTkz: acc.sirketTkz + satir.sirketTkz,
      kiyasTeknikGelir: acc.kiyasTeknikGelir + satir.kiyasTeknikGelir,
      kiyasTeknikGider: acc.kiyasTeknikGider + satir.kiyasTeknikGider,
      kiyasTkz: acc.kiyasTkz + satir.kiyasTkz,
    }),
    {
      anaBransH: etiket,
      sirketTeknikGelir: 0,
      sirketTeknikGider: 0,
      sirketTkz: 0,
      kiyasTeknikGelir: 0,
      kiyasTeknikGider: 0,
      kiyasTkz: 0,
    },
  );
}

export function buildAnaBransTkzOzet(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
  pool: SegmentSkorPool,
  kiyasHedef: AnaBransTkzKiyasHedef = { mod: "sektor" },
): AnaBransTkzOzet {
  const lookup = buildGelirTidyDonemLookup(rows, donem);
  const satirTanimi = listAnaBranslarForPool(rows, donem, pool);
  const sektorKodlari = segmentPeerSirketKodlari(rows, donem, pool);

  let kiyasKodlari: number[] = [];
  let peerSayisi = sektorKodlari.length;
  let kiyasOlcekSegment: OlcekSegmentHarfi | undefined;
  let ortalama = false;

  if (kiyasHedef.mod === "sektor") {
    kiyasKodlari = sektorKodlari;
  } else if (kiyasHedef.mod === "olcek") {
    const es = olcekSegmentEsleri(rows, donem, pool, sirketKodu);
    kiyasKodlari = es.kodlar;
    kiyasOlcekSegment = es.segment ?? undefined;
    peerSayisi = es.kodlar.length;
    ortalama = es.kodlar.length > 0;
  } else {
    kiyasKodlari = [kiyasHedef.sirketKodu];
    peerSayisi = 1;
  }

  const satirlar = satirTanimi
    .map(({ anaBransH, gtBranslari }) =>
      satirFromBilesen(
        anaBransH,
        bilesenForBranslar(lookup, [sirketKodu], gtBranslari, false),
        bilesenForBranslar(lookup, kiyasKodlari, gtBranslari, ortalama),
      ),
    )
    .filter(
      (satir) =>
        satir.sirketTeknikGelir !== 0 ||
        satir.sirketTeknikGider !== 0 ||
        satir.kiyasTeknikGelir !== 0 ||
        satir.kiyasTeknikGider !== 0,
    );

  const toplam = toplamSatir(
    satirlar,
    pool === "HD" ? "HAYATDIŞI TOPLAM" : "HAYAT & EMEKLİLİK TOPLAM",
  );

  return {
    donem,
    pool,
    kiyasMod: kiyasHedef.mod,
    peerSayisi,
    kiyasOlcekSegment,
    satirlar,
    toplam,
  };
}
