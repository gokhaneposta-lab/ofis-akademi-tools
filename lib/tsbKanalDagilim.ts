import { tarifeGrubuFromRow, type TsbBranchLookupMap } from "./tsbBranchLookup";
import type { TsbPrimDaraltma, TsbPrimRow, TsbSektorSegment } from "./tsbPrimDashboard";
import {
  isTsbToplamSirketKodu,
  prevYearPeriod,
  rowMatchesPrimDaraltma,
  rowMatchesSegment,
  sektorToplamDegisimYuzde,
} from "./tsbPrimDashboard";

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

export type KanalHubTab = "genel" | "brans" | "sirket" | "liderler";

export const KANAL_HUB_TABS: { id: KanalHubTab; label: string; hint: string }[] = [
  { id: "genel", label: "Genel bakış", hint: "Sektör mix · trend · şirket listesi" },
  { id: "liderler", label: "Kanal liderleri", hint: "Seçili kanalda tüm şirket sırası" },
  { id: "brans", label: "Branş kanal profili", hint: "Seçili branş donut · tüm branşlar" },
  { id: "sirket", label: "Şirket kanalı", hint: "Şirket vs sektör · branş × kanal" },
];

export function emptyKanalKutu(): KanalDagilimKutu {
  return { merkez: 0, acente: 0, banka: 0, broker: 0, diger: 0, genelToplam: 0 };
}

function addRowToKutu(k: KanalDagilimKutu, r: TsbPrimRow): void {
  k.merkez += r.merkez;
  k.acente += r.acente;
  k.banka += r.banka;
  k.broker += r.broker;
  k.diger += r.diger;
}

function finalizeKutu(k: KanalDagilimKutu): KanalDagilimKutu {
  k.genelToplam = k.merkez + k.acente + k.banka + k.broker + k.diger;
  return k;
}

/** Kanal tutarlarını topla (şirket veya tüm sektör) */
export function aggregateKanalDagilim(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  daraltma: TsbPrimDaraltma,
  sirketKodu: number | null,
): KanalDagilimKutu {
  const k = emptyKanalKutu();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, daraltma)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (sirketKodu !== null && r.sirketKodu !== sirketKodu) continue;
    addRowToKutu(k, r);
  }
  return finalizeKutu(k);
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

/** Aynı kanalda: şirket primi / sektör kanal primi (×100). Sektör kanalı 0 ise null. */
export function kanalBazindaSirketSektorPayYuzde(
  sirket: KanalDagilimKutu,
  sektor: KanalDagilimKutu,
): Record<KanalDagilimSatirKey, number | null> {
  const pct = (s: number, t: number): number | null => (t > 0 ? (s / t) * 100 : null);
  return {
    merkez: pct(sirket.merkez, sektor.merkez),
    acente: pct(sirket.acente, sektor.acente),
    banka: pct(sirket.banka, sektor.banka),
    broker: pct(sirket.broker, sektor.broker),
    diger: pct(sirket.diger, sektor.diger),
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
  daraltma: TsbPrimDaraltma,
  sirketKodu: number,
): KanalDagilimKiyas {
  return {
    sirket: aggregateKanalDagilim(rows, donem, segment, daraltma, sirketKodu),
    sektor: aggregateKanalDagilim(rows, donem, segment, daraltma, null),
  };
}

/** Seçilen segment + branşta üretimi olan şirketler (genel toplam prim sırası) */
export function listSirketlerKanalDagilim(
  rows: TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  daraltma: TsbPrimDaraltma,
): { kod: number; ad: string; toplam: number }[] {
  const m = new Map<number, { ad: string; toplam: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, daraltma)) continue;
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

export type KanalSirketSatir = {
  sirketKodu: number;
  sirketAdi: string;
  bu: KanalDagilimKutu;
  onceki: KanalDagilimKutu | null;
  yoy: number | null;
};

/** Genel bakış: şirket bazında kanal kutusu + YoY. */
export function aggregateKanalBySirket(
  rows: readonly TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  daraltma: TsbPrimDaraltma,
): KanalSirketSatir[] {
  const oncekiDonem = prevYearPeriod(donem);
  const buMap = new Map<number, { ad: string; kutu: KanalDagilimKutu }>();
  const ocMap = new Map<number, KanalDagilimKutu>();

  for (const r of rows) {
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, daraltma)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (r.donem === donem) {
      let cur = buMap.get(r.sirketKodu);
      if (!cur) {
        cur = { ad: r.sirketAdi, kutu: emptyKanalKutu() };
        buMap.set(r.sirketKodu, cur);
      }
      addRowToKutu(cur.kutu, r);
      if (r.sirketAdi) cur.ad = r.sirketAdi;
    } else if (oncekiDonem && r.donem === oncekiDonem) {
      let cur = ocMap.get(r.sirketKodu);
      if (!cur) {
        cur = emptyKanalKutu();
        ocMap.set(r.sirketKodu, cur);
      }
      addRowToKutu(cur, r);
    }
  }

  const out: KanalSirketSatir[] = [];
  for (const [kod, { ad, kutu }] of buMap) {
    finalizeKutu(kutu);
    const oncekiRaw = ocMap.get(kod) ?? null;
    const onceki = oncekiRaw ? finalizeKutu(oncekiRaw) : null;
    out.push({
      sirketKodu: kod,
      sirketAdi: ad,
      bu: kutu,
      onceki,
      yoy: onceki ? sektorToplamDegisimYuzde(onceki.genelToplam, kutu.genelToplam) : null,
    });
  }
  out.sort((a, b) => b.bu.genelToplam - a.bu.genelToplam);
  return out;
}

export type KanalBransKirilim = "anaBransH" | "tarifeGrubu";

export type KanalBransSatir = {
  bransKey: string;
  label: string;
  bu: KanalDagilimKutu;
  onceki: KanalDagilimKutu | null;
  yoy: number | null;
};

function bransKeyFromRow(
  r: TsbPrimRow,
  kirilim: KanalBransKirilim,
  lookup: TsbBranchLookupMap | null,
): string {
  if (kirilim === "anaBransH") return r.anaBransH || "Belirtilmemiş";
  return tarifeGrubuFromRow(r.bransKodu, r.tarifeGrubu, lookup);
}

/** Branş veya tarife grubu bazında kanal kutusu (+ YoY). İsteğe bağlı şirket filtresi. */
export function aggregateKanalByBrans(
  rows: readonly TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  kirilim: KanalBransKirilim,
  lookup: TsbBranchLookupMap | null,
  sirketKodu: number | null = null,
): KanalBransSatir[] {
  const oncekiDonem = prevYearPeriod(donem);
  const buMap = new Map<string, KanalDagilimKutu>();
  const ocMap = new Map<string, KanalDagilimKutu>();

  for (const r of rows) {
    if (!rowMatchesSegment(r, segment)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    if (sirketKodu !== null && r.sirketKodu !== sirketKodu) continue;
    const key = bransKeyFromRow(r, kirilim, lookup);
    if (r.donem === donem) {
      let cur = buMap.get(key);
      if (!cur) {
        cur = emptyKanalKutu();
        buMap.set(key, cur);
      }
      addRowToKutu(cur, r);
    } else if (oncekiDonem && r.donem === oncekiDonem) {
      let cur = ocMap.get(key);
      if (!cur) {
        cur = emptyKanalKutu();
        ocMap.set(key, cur);
      }
      addRowToKutu(cur, r);
    }
  }

  const out: KanalBransSatir[] = [];
  for (const [key, kutu] of buMap) {
    finalizeKutu(kutu);
    const oncekiRaw = ocMap.get(key) ?? null;
    const onceki = oncekiRaw ? finalizeKutu(oncekiRaw) : null;
    out.push({
      bransKey: key,
      label: key,
      bu: kutu,
      onceki,
      yoy: onceki ? sektorToplamDegisimYuzde(onceki.genelToplam, kutu.genelToplam) : null,
    });
  }
  out.sort((a, b) => b.bu.genelToplam - a.bu.genelToplam);
  return out;
}

export type KanalTrendNokta = {
  donem: string;
  kutu: KanalDagilimKutu;
};

/** Seçili ayın aynı ayını geçmiş yıllarda karşılaştırır (YTD uyumu). */
export function kanalTrendDonemleri(
  tumDonemler: readonly string[],
  seciliDonem: string,
  yilSayisi = 5,
): string[] {
  const match = seciliDonem.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!match) return [seciliDonem];
  const yil = Number(match[1]);
  const ay = match[2];
  const mevcut = new Set(tumDonemler);
  const out: string[] = [];
  for (let y = yil - yilSayisi + 1; y <= yil; y += 1) {
    const donem = `${y}-${ay}`;
    if (mevcut.has(donem)) out.push(donem);
  }
  return out;
}

export function aggregateKanalTrend(
  rows: readonly TsbPrimRow[],
  donemler: readonly string[],
  segment: TsbSektorSegment,
  daraltma: TsbPrimDaraltma,
): KanalTrendNokta[] {
  return donemler.map((donem) => ({
    donem,
    kutu: aggregateKanalDagilim(rows as TsbPrimRow[], donem, segment, daraltma, null),
  }));
}

export type KanalLiderOzeti = {
  lider: { key: KanalDagilimSatirKey; label: string; tutar: number; pay: number } | null;
  ikinci: { key: KanalDagilimSatirKey; label: string; tutar: number; pay: number } | null;
  aktifSayisi: number;
};

export function kanalLiderOzeti(kutu: KanalDagilimKutu): KanalLiderOzeti {
  const ranked = KANAL_DAGILIM_SATIRLARI.map(({ key, label }) => ({
    key,
    label,
    tutar: kutu[key],
    pay: kutu.genelToplam > 0 ? (kutu[key] / kutu.genelToplam) * 100 : 0,
  }))
    .filter((x) => x.tutar > 0)
    .sort((a, b) => b.tutar - a.tutar);

  return {
    lider: ranked[0] ?? null,
    ikinci: ranked[1] ?? null,
    aktifSayisi: ranked.length,
  };
}

/** Trend noktalarında (aynı ay, farklı yıllar) sondan geriye lider kanal streak’i. */
export function kanalLiderStreakYil(
  trend: readonly KanalTrendNokta[],
): { key: KanalDagilimSatirKey; label: string; yilSayisi: number } | null {
  if (trend.length === 0) return null;
  let key: KanalDagilimSatirKey | null = null;
  let label = "";
  let yilSayisi = 0;
  for (let i = trend.length - 1; i >= 0; i -= 1) {
    const lider = kanalLiderOzeti(trend[i].kutu).lider;
    if (!lider) break;
    if (key === null) {
      key = lider.key;
      label = lider.label;
      yilSayisi = 1;
      continue;
    }
    if (lider.key !== key) break;
    yilSayisi += 1;
  }
  return key ? { key, label, yilSayisi } : null;
}

export type KanalLiderSatir = {
  sirketKodu: number;
  sirketAdi: string;
  primBu: number;
  primOnceki: number;
  yoy: number | null;
  kanalPayi: number | null;
  sira: number;
};

/** Seçili kanalda şirket sıralaması + kanal pazar payı. */
export function rankSirketByKanal(
  rows: readonly TsbPrimRow[],
  donem: string,
  segment: TsbSektorSegment,
  daraltma: TsbPrimDaraltma,
  kanal: KanalDagilimSatirKey,
): { sektorKanalBu: number; satirlar: KanalLiderSatir[] } {
  const oncekiDonem = prevYearPeriod(donem);
  const buMap = new Map<number, { ad: string; prim: number }>();
  const ocMap = new Map<number, number>();

  for (const r of rows) {
    if (!rowMatchesSegment(r, segment)) continue;
    if (!rowMatchesPrimDaraltma(r, daraltma)) continue;
    if (isTsbToplamSirketKodu(r.sirketKodu)) continue;
    const v = r[kanal];
    if (r.donem === donem) {
      const cur = buMap.get(r.sirketKodu);
      if (!cur) buMap.set(r.sirketKodu, { ad: r.sirketAdi, prim: v });
      else {
        cur.prim += v;
        if (r.sirketAdi) cur.ad = r.sirketAdi;
      }
    } else if (oncekiDonem && r.donem === oncekiDonem) {
      ocMap.set(r.sirketKodu, (ocMap.get(r.sirketKodu) ?? 0) + v);
    }
  }

  let sektorKanalBu = 0;
  for (const v of buMap.values()) sektorKanalBu += v.prim;

  const raw = [...buMap.entries()]
    .map(([kod, { ad, prim }]) => {
      const primOnceki = ocMap.get(kod) ?? 0;
      return {
        sirketKodu: kod,
        sirketAdi: ad,
        primBu: prim,
        primOnceki,
        yoy: sektorToplamDegisimYuzde(primOnceki, prim),
        kanalPayi: sektorKanalBu > 0 ? (prim / sektorKanalBu) * 100 : null,
      };
    })
    .filter((x) => x.primBu > 0 || x.primOnceki > 0)
    .sort((a, b) => b.primBu - a.primBu);

  return {
    sektorKanalBu,
    satirlar: raw.map((r, i) => ({ ...r, sira: i + 1 })),
  };
}

export function parseKanalHubTab(raw: string | null | undefined): KanalHubTab {
  if (raw === "brans" || raw === "sirket" || raw === "liderler" || raw === "genel") return raw;
  return "genel";
}
