import {
  MIZAN_HESAP_DIREKT,
  MIZAN_HESAP_ENDIREKT,
  REFERANS_YIL_SECENEKLERI,
} from "../config/constants";
import { HAZINE_BRANS_SIRASI, bransAdi, anaBrans } from "../config/brans";
import { uretimWithNorm } from "../import/uretimImport";
import { isEndirektKanal, normalizeBransKodu, normalizeText } from "../textUtils";
import type {
  MizanRow,
  PrimBransOzet,
  PrimDagitimDetay,
  PrimDagitimLog,
  PrimDagitimOzet,
  SatisButceRow,
  TarifeMapRow,
  UretimRow,
} from "../types";

type MizanBransTarife = MizanRow & { tarifeGrubu: string };

type UretimNorm = UretimRow & {
  kanal1Norm: string;
  kanal3Norm: string;
  tarifeNorm: string;
};

export type DagitimInput = {
  satisRows: SatisButceRow[];
  hedefKolon?: keyof Pick<SatisButceRow, "hedefPrim" | "oncekiYil1" | "oncekiYil2" | "tahminYilsonu">;
  referansEtiket?: string;
  mizanYedek?: boolean;
  tarifeHedefleri?: Record<string, number>;
};

export type DagitimSonuc = {
  detay: PrimDagitimDetay[];
  bransOzet: PrimBransOzet[];
  bransDirektEndirekt: Array<{
    bransKodu: string;
    direktPrim: number;
    endirektPrim: number;
    toplamPrim: number;
  }>;
  log: PrimDagitimLog[];
  ozet: PrimDagitimOzet;
};

function payDict(entries: Map<string, number>): Record<string, number> {
  let total = 0;
  for (const v of entries.values()) total += v;
  if (total <= 0) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of entries) {
    if (v > 0) out[normalizeBransKodu(k)] = v / total;
  }
  return out;
}

function ortalamaPaylar(yearShares: Record<string, number>[]): Record<string, number> {
  if (yearShares.length === 0) return {};
  if (yearShares.length === 1) return yearShares[0];
  const allBrans = new Set<string>();
  for (const ys of yearShares) {
    for (const k of Object.keys(ys)) allBrans.add(k);
  }
  const avg: Record<string, number> = {};
  for (const b of allBrans) {
    const vals = yearShares.map((ys) => ys[b] ?? 0);
    avg[b] = vals.reduce((a, x) => a + x, 0) / vals.length;
  }
  const total = Object.values(avg).reduce((a, x) => a + x, 0);
  if (total <= 0) return {};
  const norm: Record<string, number> = {};
  for (const [b, v] of Object.entries(avg)) norm[b] = v / total;
  return norm;
}

function tarifeToBransSet(tarifeMap: TarifeMapRow[]): Record<string, Set<string>> {
  const out: Record<string, Set<string>> = {};
  for (const row of tarifeMap) {
    const tg = row.tarifeGrubu;
    if (!out[tg]) out[tg] = new Set();
    out[tg].add(row.bransKodu);
  }
  return out;
}

function dagitilamamaMesaji(tarife: string, eslesme: string): string {
  const tgn = normalizeText(tarife);
  if (tgn === "HAYAT") return "HAYAT tarifesi hayat dışı GT kapsamında — dağıtılmadı";
  if (eslesme === "eslesme_yok") return "Üretim ve MIZAN eşleşmedi — dağıtılamadı";
  return "Dağıtılamadı";
}

export function hesaplaBransPaylari(
  satisRows: SatisButceRow[],
  referansKolon: keyof Pick<SatisButceRow, "hedefPrim" | "oncekiYil1" | "oncekiYil2" | "tahminYilsonu"> = "hedefPrim",
): Array<SatisButceRow & { pay: number; tarifeToplam: number }> {
  const tarifeToplam: Record<string, number> = {};
  for (const row of satisRows) {
    const ref = Math.max(0, row[referansKolon]);
    tarifeToplam[row.tarifeGrubu] = (tarifeToplam[row.tarifeGrubu] ?? 0) + ref;
  }
  return satisRows.map((row) => {
    const ref = Math.max(0, row[referansKolon]);
    const tot = tarifeToplam[row.tarifeGrubu] ?? 0;
    return {
      ...row,
      tarifeToplam: tot,
      pay: tot > 0 ? ref / tot : 0,
    };
  });
}

export function dagitimHazirla(
  satisRows: SatisButceRow[],
  tarifeHedefleri: Record<string, number>,
): SatisButceRow[] {
  const paylar = hesaplaBransPaylari(satisRows, "hedefPrim");
  return paylar.map((row) => ({
    ...row,
    hedefPrim: (tarifeHedefleri[row.tarifeGrubu] ?? 0) * row.pay,
  }));
}

export class DagitimMotoru {
  private uretim: UretimNorm[];
  private tarifeBrans: Record<string, Set<string>>;
  private mizanBransTarife: MizanBransTarife[];

  constructor(
    uretim: UretimRow[],
    tarifeMap: TarifeMapRow[],
    mizan: MizanRow[],
  ) {
    this.uretim = uretimWithNorm(uretim);
    this.tarifeBrans = tarifeToBransSet(tarifeMap);
    const tarifeByBrans = new Map(tarifeMap.map((r) => [r.bransKodu, r.tarifeGrubu]));
    this.mizanBransTarife = mizan.map((m) => ({
      ...m,
      tarifeGrubu: tarifeByBrans.get(m.bransKodu) ?? "",
    }));
  }

  dagit(input: DagitimInput): DagitimSonuc {
    const {
      satisRows,
      hedefKolon = "hedefPrim",
      referansEtiket = "2024",
      mizanYedek = true,
      tarifeHedefleri,
    } = input;

    let dagitimRows = satisRows;
    if (tarifeHedefleri && Object.keys(tarifeHedefleri).length > 0) {
      dagitimRows = dagitimHazirla(satisRows, tarifeHedefleri);
    }

    const refYears = REFERANS_YIL_SECENEKLERI[referansEtiket] ?? [2024];
    const detay: PrimDagitimDetay[] = [];
    const log: PrimDagitimLog[] = [];

    dagitimRows.forEach((row, idx) => {
      const hedef = row[hedefKolon];
      if (hedef <= 0) return;

      const endirekt = isEndirektKanal(row.kanal1, row.sirket);
      const { shares, kaynak, eslesme } = this.hesaplaPaylar(
        row.kanal1,
        row.kanal2,
        row.tarifeGrubu,
        refYears,
        endirekt,
        mizanYedek,
      );

      if (!shares || Object.keys(shares).length === 0) {
        log.push({
          kanal1: row.kanal1,
          kanal2: row.kanal2,
          tarifeGrubu: row.tarifeGrubu,
          hedefPrim: hedef,
          eslesme,
          mesaj: dagitilamamaMesaji(row.tarifeGrubu, eslesme),
        });
        return;
      }

      for (const [bransKodu, pay] of Object.entries(shares)) {
        if (pay <= 0) continue;
        detay.push({
          satisSatir: idx,
          sirket: row.sirket,
          kanal1: row.kanal1,
          kanal2: row.kanal2,
          tarifeGrubu: row.tarifeGrubu,
          bransKodu,
          hedefPrim: hedef * pay,
          pay,
          primTipi: endirekt ? "endirekt" : "direkt",
          kaynak,
          eslesme,
        });
      }

      if (kaynak === "mizan") {
        log.push({
          kanal1: row.kanal1,
          kanal2: row.kanal2,
          tarifeGrubu: row.tarifeGrubu,
          hedefPrim: hedef,
          eslesme,
          mesaj: "Üretim eşleşmedi — MIZAN yedek kullanıldı",
        });
      } else if (eslesme === "brans_koprusu") {
        log.push({
          kanal1: row.kanal1,
          kanal2: row.kanal2,
          tarifeGrubu: row.tarifeGrubu,
          hedefPrim: hedef,
          eslesme,
          mesaj: "Tarife adı farklı — branş köprüsü ile eşleşti",
        });
      }
    });

    const bransOzet = this.bransOzet(detay);
    const bransDirektEndirekt = this.bransDirektEndirekt(detay);
    const ozet = this.ozetIstatistik(detay, log, referansEtiket);

    return { detay, bransOzet, bransDirektEndirekt, log, ozet };
  }

  private hesaplaPaylar(
    kanal1: string,
    kanal2: string,
    tarife: string,
    refYears: readonly number[],
    endirekt: boolean,
    mizanYedek: boolean,
  ): { shares: Record<string, number>; kaynak: "uretim" | "mizan"; eslesme: string } {
    const k1n = normalizeText(kanal1);
    const k3n = normalizeText(kanal2);
    const tgn = normalizeText(tarife);

    const yearShares: Record<string, number>[] = [];
    let eslesme = "tam";

    for (const yil of refYears) {
      const { shares, matchType } = this.uretimPaylari(k1n, k3n, tgn, yil);
      if (Object.keys(shares).length > 0) {
        yearShares.push(shares);
        if (matchType !== "tam") eslesme = matchType;
      }
    }

    if (yearShares.length > 0) {
      return { shares: ortalamaPaylar(yearShares), kaynak: "uretim", eslesme };
    }

    if (mizanYedek) {
      const hesap = endirekt ? MIZAN_HESAP_ENDIREKT : MIZAN_HESAP_DIREKT;
      const mizShares: Record<string, number>[] = [];
      for (const yil of refYears) {
        const ms = this.mizanPaylari(tgn, yil, hesap);
        if (Object.keys(ms).length > 0) mizShares.push(ms);
      }
      if (mizShares.length > 0) {
        return { shares: ortalamaPaylar(mizShares), kaynak: "mizan", eslesme: "mizan_yedek" };
      }
    }

    return { shares: {}, kaynak: "mizan", eslesme: "eslesme_yok" };
  }

  private uretimPaylari(
    k1n: string,
    k3n: string,
    tgn: string,
    yil: number,
  ): { shares: Record<string, number>; matchType: string } {
    const sub = this.uretim.filter(
      (r) =>
        r.yil === yil &&
        r.kanal1Norm === k1n &&
        r.kanal3Norm === k3n &&
        r.tarifeNorm === tgn,
    );
    const total = sub.reduce((a, r) => a + r.netPrim, 0);
    if (total > 0) {
      const map = new Map<string, number>();
      for (const r of sub) {
        map.set(r.bransKodu, (map.get(r.bransKodu) ?? 0) + r.netPrim);
      }
      return { shares: payDict(map), matchType: "tam" };
    }

    const bransSet = this.tarifeBrans[tgn];
    if (bransSet) {
      const sub2 = this.uretim.filter(
        (r) =>
          r.yil === yil &&
          r.kanal1Norm === k1n &&
          r.kanal3Norm === k3n &&
          bransSet.has(r.bransKodu),
      );
      const total2 = sub2.reduce((a, r) => a + r.netPrim, 0);
      if (total2 > 0) {
        const map = new Map<string, number>();
        for (const r of sub2) {
          map.set(r.bransKodu, (map.get(r.bransKodu) ?? 0) + r.netPrim);
        }
        return { shares: payDict(map), matchType: "brans_koprusu" };
      }
    }

    return { shares: {}, matchType: "yok" };
  }

  private mizanPaylari(tgn: string, yil: number, hesap: string): Record<string, number> {
    const sub = this.mizanBransTarife.filter(
      (r) => r.yil === yil && r.hesap === hesap && r.tarifeGrubu === tgn,
    );
    const total = sub.reduce((a, r) => a + r.tutar, 0);
    if (total <= 0) return {};
    const map = new Map<string, number>();
    for (const r of sub) {
      map.set(r.bransKodu, (map.get(r.bransKodu) ?? 0) + r.tutar);
    }
    return payDict(map);
  }

  private bransOzet(detay: PrimDagitimDetay[]): PrimBransOzet[] {
    const agg = new Map<string, number>();
    for (const d of detay) {
      agg.set(d.bransKodu, (agg.get(d.bransKodu) ?? 0) + d.hedefPrim);
    }
    return HAZINE_BRANS_SIRASI.map((kod) => ({
      bransKodu: kod,
      bransAdi: bransAdi(kod),
      anaBrans: anaBrans(kod),
      hedefPrim: agg.get(kod) ?? 0,
    }));
  }

  private bransDirektEndirekt(detay: PrimDagitimDetay[]) {
    const direkt = new Map<string, number>();
    const endirekt = new Map<string, number>();
    for (const d of detay) {
      if (d.primTipi === "endirekt") {
        endirekt.set(d.bransKodu, (endirekt.get(d.bransKodu) ?? 0) + d.hedefPrim);
      } else {
        direkt.set(d.bransKodu, (direkt.get(d.bransKodu) ?? 0) + d.hedefPrim);
      }
    }
    const rows: Array<{
      bransKodu: string;
      direktPrim: number;
      endirektPrim: number;
      toplamPrim: number;
    }> = [];
    for (const kod of HAZINE_BRANS_SIRASI) {
      const d = direkt.get(kod) ?? 0;
      const e = endirekt.get(kod) ?? 0;
      if (d + e > 0) {
        rows.push({ bransKodu: kod, direktPrim: d, endirektPrim: e, toplamPrim: d + e });
      }
    }
    return rows;
  }

  private ozetIstatistik(
    detay: PrimDagitimDetay[],
    log: PrimDagitimLog[],
    referans: string,
  ): PrimDagitimOzet {
    if (detay.length === 0) {
      return {
        referans,
        toplamHedef: 0,
        dagitilan: 0,
        dagitilamayan: 0,
        uretimSatir: 0,
        mizanSatir: 0,
        bransSayisi: 0,
        uyariSayisi: log.length,
      };
    }
    const dagitilamayan = log
      .filter((r) => r.mesaj.toLowerCase().includes("dağıtılmadı") || r.mesaj.includes("Dağıtılamadı"))
      .reduce((a, r) => a + r.hedefPrim, 0);
    const dagitilan = detay.reduce((a, r) => a + r.hedefPrim, 0);
    const bransSet = new Set(detay.map((d) => d.bransKodu));
    const bransSayisi = [...bransSet].filter((b) => {
      const s = detay.filter((d) => d.bransKodu === b).reduce((a, x) => a + x.hedefPrim, 0);
      return s > 0;
    }).length;
    return {
      referans,
      toplamHedef: dagitilan + dagitilamayan,
      dagitilan,
      dagitilamayan,
      uretimSatir: detay.filter((d) => d.kaynak === "uretim").length,
      mizanSatir: detay.filter((d) => d.kaynak === "mizan").length,
      bransSayisi,
      uyariSayisi: log.length,
    };
  }
}

export function tarifeOzetFromSatis(rows: SatisButceRow[]) {
  const map = new Map<
    string,
    { oncekiYil1: number; oncekiYil2: number; tahminYilsonu: number; mevcutHedef: number }
  >();
  for (const r of rows) {
    const cur = map.get(r.tarifeGrubu) ?? {
      oncekiYil1: 0,
      oncekiYil2: 0,
      tahminYilsonu: 0,
      mevcutHedef: 0,
    };
    cur.oncekiYil1 += r.oncekiYil1;
    cur.oncekiYil2 += r.oncekiYil2;
    cur.tahminYilsonu += r.tahminYilsonu;
    cur.mevcutHedef += r.hedefPrim;
    map.set(r.tarifeGrubu, cur);
  }
  return [...map.entries()].map(([tarifeGrubu, v]) => {
    const gecmisVar = v.oncekiYil1 > 0 || v.oncekiYil2 > 0 || v.tahminYilsonu > 0;
    const yeniHedef = gecmisVar ? v.mevcutHedef * 1.25 : v.mevcutHedef;
    const artisOrani =
      gecmisVar && v.mevcutHedef > 0 ? yeniHedef / v.mevcutHedef - 1 : gecmisVar ? 0.25 : 0;
    return {
      tarifeGrubu,
      oncekiYil1: v.oncekiYil1,
      oncekiYil2: v.oncekiYil2,
      tahminYilsonu: v.tahminYilsonu,
      mevcutHedef: v.mevcutHedef,
      yeniHedef,
      artisOrani,
      sadeExport: !gecmisVar,
    };
  });
}
