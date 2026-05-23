/**
 * TSB hub — Sektör Özeti leaderboard verisi (sunucu tarafı).
 * Kaynak: gelir-tidy çeyrekleri + prim-tidy aylık; HD havuzu.
 */

import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  hamOlcumFromLookup,
  listSirketleriGelirDonemForPool,
  oncekiYilDonem,
} from "./tsbFinansalKarsilastirmaData";
import { hasarPrimOranlariFromLookup } from "./tsbHasarPrimOrani";
import { hpPpFark } from "./tsbHasarPrimHpDashboard";
import {
  isHayatdisiSirket,
  prevYearPeriod,
  type TsbPrimRow,
} from "./tsbPrimDashboard";
import { buildGelirTidyDonemLookup, hamMetrikFromLookup } from "./tsbSirketSegmentSkor";
import { loadTsbVeriDurumu } from "./tsbVeriDurumu";
import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";

const GELIR_DIR = join("public", "data", "tsb", "gelir-tidy");
const PRIM_REL = join("public", "data", "tsb", "prim-tidy.json");
const HAYATDISI = "HAYATDISI";

const pf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export type SektorOzetiDegerTon = "notr" | "iyi" | "kotu";

export type SektorOzetiSatir = {
  sira: number;
  sirketKodu: number;
  sirketAdi: string;
  degerMetin: string;
  ton: SektorOzetiDegerTon;
};

export type SektorOzetiListe = {
  id: string;
  baslik: string;
  satirlar: SektorOzetiSatir[];
};

export type SektorOzetiSekmeId = "karlilik" | "teknik" | "buyume" | "pazar";

export type SektorOzetiSekme = {
  id: SektorOzetiSekmeId;
  label: string;
  listeler: SektorOzetiListe[];
};

export type SektorOzetiData = {
  finDonem: string;
  finDonemOnceki: string | null;
  primDonem: string;
  primDonemOnceki: string | null;
  sekmeler: SektorOzetiSekme[];
};

type HamSatir = { kod: number; ad: string; v: number };

function readGelirDonem(donem: string): TsbGelirTidyRowLike[] {
  const abs = join(process.cwd(), GELIR_DIR, `${donem}.json`);
  if (!existsSync(abs)) return [];
  try {
    const data = JSON.parse(readFileSync(abs, "utf8")) as unknown;
    return Array.isArray(data) ? (data as TsbGelirTidyRowLike[]) : [];
  } catch {
    return [];
  }
}

function readPrimRows(): TsbPrimRow[] {
  const abs = join(process.cwd(), PRIM_REL);
  if (!existsSync(abs)) return [];
  try {
    const data = JSON.parse(readFileSync(abs, "utf8")) as unknown;
    return Array.isArray(data) ? (data as TsbPrimRow[]) : [];
  } catch {
    return [];
  }
}

function yoyYuzde(onceki: number, bu: number): number | null {
  if (!Number.isFinite(onceki) || !Number.isFinite(bu)) return null;
  if (onceki === 0) return bu === 0 ? 0 : null;
  return ((bu - onceki) / Math.abs(onceki)) * 100;
}

function fmtYuzde(v: number): string {
  const sign = v > 0 ? "+" : "";
  return `${sign}${pf.format(v)}%`;
}

function fmtOran(v: number): string {
  return `${pf.format(v * 100)}%`;
}

function fmtPp(v: number): string {
  const sign = v > 0 ? "+" : "";
  return `${sign}${pf.format(v)} pp`;
}

function tonFromYoy(v: number): SektorOzetiDegerTon {
  if (v > 0) return "iyi";
  if (v < 0) return "kotu";
  return "notr";
}

function tonFromHpPp(v: number): SektorOzetiDegerTon {
  if (v < 0) return "iyi";
  if (v > 0) return "kotu";
  return "notr";
}

function toSatirlar(
  items: HamSatir[],
  opts: {
    desc?: boolean;
    ton?: (v: number) => SektorOzetiDegerTon;
    fmt: (v: number) => string;
    limit?: number;
  },
): SektorOzetiSatir[] {
  const sorted = [...items].sort((a, b) => (opts.desc !== false ? b.v - a.v : a.v - b.v));
  const limit = opts.limit ?? 5;
  const tonFn = opts.ton ?? (() => "notr" as const);
  return sorted.slice(0, limit).map((item, i) => ({
    sira: i + 1,
    sirketKodu: item.kod,
    sirketAdi: item.ad,
    degerMetin: opts.fmt(item.v),
    ton: tonFn(item.v),
  }));
}

function competitionRanks(primByKod: Map<number, number>): Map<number, number> {
  const ranked = [...primByKod.entries()].filter(([, p]) => p > 0).sort((a, b) => b[1] - a[1]);
  const ranks = new Map<number, number>();
  let rank = 1;
  for (let i = 0; i < ranked.length; i++) {
    const [, prim] = ranked[i];
    if (i > 0 && prim < ranked[i - 1][1]) rank = i + 1;
    ranks.set(ranked[i][0], rank);
  }
  return ranks;
}

function hdPrimByCompany(rows: TsbPrimRow[], donem: string): Map<number, { ad: string; prim: number }> {
  const m = new Map<number, { ad: string; prim: number }>();
  for (const r of rows) {
    if (r.donem !== donem) continue;
    if (!isHayatdisiSirket(r)) continue;
    const ad = (r.sirketAdi ?? "").trim() || `Şirket ${r.sirketKodu}`;
    const cur = m.get(r.sirketKodu) ?? { ad, prim: 0 };
    cur.prim += r.genelToplam;
    if (!cur.ad && ad) cur.ad = ad;
    m.set(r.sirketKodu, cur);
  }
  return m;
}

function buildKarlilik(
  peers: { kod: number; ad: string }[],
  lookupBu: ReturnType<typeof buildGelirTidyDonemLookup>,
  lookupOnce: ReturnType<typeof buildGelirTidyDonemLookup> | null,
): SektorOzetiListe[] {
  const vokOz: HamSatir[] = [];
  const netKarYoy: HamSatir[] = [];
  const teknikKarYoy: HamSatir[] = [];
  const ozsermayeYoy: HamSatir[] = [];

  for (const { kod, ad } of peers) {
    const skor = hamMetrikFromLookup(lookupBu, kod);
    if (skor.oranVokOzsermaye !== null && Number.isFinite(skor.oranVokOzsermaye)) {
      vokOz.push({ kod, ad, v: skor.oranVokOzsermaye });
    }

    if (!lookupOnce) continue;
    const hamBu = hamOlcumFromLookup(lookupBu, kod);
    const hamOnce = hamOlcumFromLookup(lookupOnce, kod);
    if (!hamBu || !hamOnce) continue;

    const nY = yoyYuzde(hamOnce.donemNetKar692, hamBu.donemNetKar692);
    if (nY !== null) netKarYoy.push({ kod, ad, v: nY });

    const tY = yoyYuzde(hamOnce.teknikKarZarar, hamBu.teknikKarZarar);
    if (tY !== null) teknikKarYoy.push({ kod, ad, v: tY });

    const oY = yoyYuzde(hamOnce.ozsermaye, hamBu.ozsermaye);
    if (oY !== null) ozsermayeYoy.push({ kod, ad, v: oY });
  }

  return [
    {
      id: "vok_oz",
      baslik: "En yüksek VÖK / Özsermaye",
      satirlar: toSatirlar(vokOz, { desc: true, fmt: fmtOran }),
    },
    {
      id: "net_kar_yoy",
      baslik: "En yüksek net kar artışı",
      satirlar: toSatirlar(netKarYoy, { desc: true, fmt: fmtYuzde, ton: tonFromYoy }),
    },
    {
      id: "teknik_kar_yoy",
      baslik: "En yüksek teknik kar artışı",
      satirlar: toSatirlar(teknikKarYoy, { desc: true, fmt: fmtYuzde, ton: tonFromYoy }),
    },
    {
      id: "ozsermaye_yoy",
      baslik: "En yüksek özsermaye büyümesi",
      satirlar: toSatirlar(ozsermayeYoy, { desc: true, fmt: fmtYuzde, ton: tonFromYoy }),
    },
  ];
}

function buildTeknik(
  peers: { kod: number; ad: string }[],
  lookupBu: ReturnType<typeof buildGelirTidyDonemLookup>,
  lookupOnce: ReturnType<typeof buildGelirTidyDonemLookup> | null,
): SektorOzetiListe[] {
  const brutHp: HamSatir[] = [];
  const netHp: HamSatir[] = [];
  const hpIyilestirme: HamSatir[] = [];
  const hpKotulesme: HamSatir[] = [];

  for (const { kod, ad } of peers) {
    const hpBu = hasarPrimOranlariFromLookup(lookupBu, kod, { bransAp: HAYATDISI });
    if (hpBu.brutHasarPrimOrani !== null && Number.isFinite(hpBu.brutHasarPrimOrani)) {
      brutHp.push({ kod, ad, v: hpBu.brutHasarPrimOrani });
    }
    if (hpBu.netHasarPrimOrani !== null && Number.isFinite(hpBu.netHasarPrimOrani)) {
      netHp.push({ kod, ad, v: hpBu.netHasarPrimOrani });
    }

    if (!lookupOnce) continue;
    const hpOnce = hasarPrimOranlariFromLookup(lookupOnce, kod, { bransAp: HAYATDISI });
    const pp = hpPpFark(hpBu.brutHasarPrimOrani, hpOnce.brutHasarPrimOrani);
    if (pp === null) continue;
    hpIyilestirme.push({ kod, ad, v: pp });
    hpKotulesme.push({ kod, ad, v: pp });
  }

  return [
    {
      id: "brut_hp_dusuk",
      baslik: "En düşük brüt H/P",
      satirlar: toSatirlar(brutHp, { desc: false, fmt: fmtOran }),
    },
    {
      id: "net_hp_dusuk",
      baslik: "En düşük net H/P",
      satirlar: toSatirlar(netHp, { desc: false, fmt: fmtOran }),
    },
    {
      id: "hp_iyilestiren",
      baslik: "H/P oranını en çok iyileştirenler",
      satirlar: toSatirlar(hpIyilestirme, { desc: false, fmt: fmtPp, ton: tonFromHpPp }),
    },
    {
      id: "hp_kotulesen",
      baslik: "H/P oranı en çok bozulanlar",
      satirlar: toSatirlar(hpKotulesme, { desc: true, fmt: fmtPp, ton: tonFromHpPp }),
    },
  ];
}

function buildBuyume(
  peers: { kod: number; ad: string }[],
  lookupBu: ReturnType<typeof buildGelirTidyDonemLookup>,
  lookupOnce: ReturnType<typeof buildGelirTidyDonemLookup> | null,
): SektorOzetiListe[] {
  const empty = (id: string, baslik: string): SektorOzetiListe => ({ id, baslik, satirlar: [] });

  if (!lookupOnce) {
    return [
      empty("brut_prim_yoy", "Brüt prim büyümesi"),
      empty("trafik_haric_yoy", "Trafik hariç prim büyümesi"),
      empty("teknik_karsilik_yoy", "Teknik karşılık büyümesi"),
      empty("yatirim_yoy", "Yatırım geliri büyümesi"),
    ];
  }

  const brutPrim: HamSatir[] = [];
  const trafikHaric: HamSatir[] = [];
  const teknikKarsilik: HamSatir[] = [];
  const yatirim: HamSatir[] = [];

  for (const { kod, ad } of peers) {
    const hamBu = hamOlcumFromLookup(lookupBu, kod);
    const hamOnce = hamOlcumFromLookup(lookupOnce, kod);
    if (!hamBu || !hamOnce) continue;

    const b = yoyYuzde(hamOnce.brutPrim, hamBu.brutPrim);
    if (b !== null) brutPrim.push({ kod, ad, v: b });

    const t = yoyYuzde(hamOnce.primTrafikHaric, hamBu.primTrafikHaric);
    if (t !== null) trafikHaric.push({ kod, ad, v: t });

    const tk = yoyYuzde(hamOnce.teknikKarsilik3545, hamBu.teknikKarsilik3545);
    if (tk !== null) teknikKarsilik.push({ kod, ad, v: tk });

    const y = yoyYuzde(hamOnce.yatirimSegment, hamBu.yatirimSegment);
    if (y !== null) yatirim.push({ kod, ad, v: y });
  }

  const yoyOpts = { desc: true, fmt: fmtYuzde, ton: tonFromYoy };
  return [
    { id: "brut_prim_yoy", baslik: "Brüt prim büyümesi", satirlar: toSatirlar(brutPrim, yoyOpts) },
    { id: "trafik_haric_yoy", baslik: "Trafik hariç prim büyümesi", satirlar: toSatirlar(trafikHaric, yoyOpts) },
    { id: "teknik_karsilik_yoy", baslik: "Teknik karşılık büyümesi", satirlar: toSatirlar(teknikKarsilik, yoyOpts) },
    { id: "yatirim_yoy", baslik: "Yatırım geliri büyümesi", satirlar: toSatirlar(yatirim, yoyOpts) },
  ];
}

function buildPazarPayi(primRows: TsbPrimRow[], primDonem: string, primOnce: string | null): SektorOzetiListe[] {
  const empty = (id: string, baslik: string): SektorOzetiListe => ({ id, baslik, satirlar: [] });

  if (!primOnce) {
    return [
      empty("pay_kazanan", "Pazar payı kazananlar"),
      empty("pay_kaybeden", "Pazar payı kaybedenler"),
      empty("sira_yukselen", "Sıralamada yükselenler"),
      empty("sira_dusen", "Sıralamada gerileyenler"),
    ];
  }

  const buMap = hdPrimByCompany(primRows, primDonem);
  const onceMap = hdPrimByCompany(primRows, primOnce);

  let sektorBu = 0;
  for (const { prim } of buMap.values()) sektorBu += prim;
  let sektorOnce = 0;
  for (const { prim } of onceMap.values()) sektorOnce += prim;

  const payDelta: HamSatir[] = [];
  const rankDelta: HamSatir[] = [];

  const primBuRank = competitionRanks(new Map([...buMap.entries()].map(([k, v]) => [k, v.prim])));
  const primOnceRank = competitionRanks(new Map([...onceMap.entries()].map(([k, v]) => [k, v.prim])));

  for (const [kod, bu] of buMap) {
    const once = onceMap.get(kod);
    if (!once || sektorBu <= 0 || sektorOnce <= 0) continue;

    const payBu = (bu.prim / sektorBu) * 100;
    const payOnce = (once.prim / sektorOnce) * 100;
    payDelta.push({ kod, ad: bu.ad, v: payBu - payOnce });

    const rBu = primBuRank.get(kod);
    const rOnce = primOnceRank.get(kod);
    if (rBu !== undefined && rOnce !== undefined) {
      rankDelta.push({ kod, ad: bu.ad, v: rBu - rOnce });
    }
  }

  const fmtSiraDelta = (v: number) => {
    const n = Math.round(v);
    if (n === 0) return "0";
    return n > 0 ? `+${n}` : String(n);
  };
  const tonSira = (v: number): SektorOzetiDegerTon => (v < 0 ? "iyi" : v > 0 ? "kotu" : "notr");

  return [
    {
      id: "pay_kazanan",
      baslik: "Pazar payı kazananlar",
      satirlar: toSatirlar(payDelta, { desc: true, fmt: fmtPp, ton: tonFromYoy }),
    },
    {
      id: "pay_kaybeden",
      baslik: "Pazar payı kaybedenler",
      satirlar: toSatirlar(payDelta, { desc: false, fmt: fmtPp, ton: tonFromYoy }),
    },
    {
      id: "sira_yukselen",
      baslik: "Sıralamada yükselenler",
      satirlar: toSatirlar(rankDelta, { desc: false, fmt: fmtSiraDelta, ton: tonSira }),
    },
    {
      id: "sira_dusen",
      baslik: "Sıralamada gerileyenler",
      satirlar: toSatirlar(rankDelta, { desc: true, fmt: fmtSiraDelta, ton: tonSira }),
    },
  ];
}

/** Hub Sektör Özeti — build/SSR; veri meta.json dönemlerinden türetilir. */
export function loadSektorOzeti(): SektorOzetiData {
  const meta = loadTsbVeriDurumu();
  const finDonem = meta.sonFinansalDonem !== "—" ? meta.sonFinansalDonem : "";
  const primDonem = meta.sonPrimDonem !== "—" ? meta.sonPrimDonem : "";
  const finOnce = finDonem ? oncekiYilDonem(finDonem) : null;
  const primOnce = primDonem ? prevYearPeriod(primDonem) : null;

  const gelirBu = finDonem ? readGelirDonem(finDonem) : [];
  const gelirOnce = finOnce ? readGelirDonem(finOnce) : [];
  const allGelir = [...gelirBu, ...gelirOnce];

  const peers = finDonem ? listSirketleriGelirDonemForPool(allGelir, finDonem, "HD") : [];

  const lookupBu = buildGelirTidyDonemLookup(gelirBu, finDonem);
  const lookupOnce = finOnce && gelirOnce.length > 0 ? buildGelirTidyDonemLookup(gelirOnce, finOnce) : null;

  const primRows = readPrimRows();

  return {
    finDonem: finDonem || "—",
    finDonemOnceki: finOnce,
    primDonem: primDonem || "—",
    primDonemOnceki: primOnce,
    sekmeler: [
      { id: "karlilik", label: "Karlılık", listeler: buildKarlilik(peers, lookupBu, lookupOnce) },
      { id: "teknik", label: "Teknik", listeler: buildTeknik(peers, lookupBu, lookupOnce) },
      { id: "buyume", label: "Büyüme", listeler: buildBuyume(peers, lookupBu, lookupOnce) },
      {
        id: "pazar",
        label: "Pazar Payı",
        listeler: buildPazarPayi(primRows, primDonem, primOnce),
      },
    ],
  };
}
