import { MIZAN_AYLIK_HESAP_BRUT } from "../config/constants";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type {
  KpkKapanisTahminStore,
  MizanAylikRow,
  TarifeBransPayRow,
} from "../types";
import { kumuldenAylikArtis } from "../prim/primDagilim";

export type TarifeAyPrim = {
  tarifeGrubu: string;
  aylar: number[];
  toplam: number;
  kaynak: ("gercek" | "tahmin")[];
};

export type OncekiYilPrimSonuc = {
  oncekiYil: number;
  sonGercekAy: number;
  tarifeSatirlar: TarifeAyPrim[];
  bransAylik: Record<string, number[]>;
  buyumeOranlari: Record<string, number>;
};

function kumulDizisi(rows: MizanAylikRow[], yil: number, brans: string): number[] {
  const map = new Map<number, number>();
  for (const r of rows) {
    if (r.yil !== yil || normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (String(r.hesap) !== MIZAN_AYLIK_HESAP_BRUT) continue;
    if (r.ay >= 1 && r.ay <= 12) map.set(r.ay, r.tutar);
  }
  return Array.from({ length: 12 }, (_, i) => map.get(i + 1) ?? 0);
}

function bransAylikPrim(rows: MizanAylikRow[], yil: number, brans: string): number[] {
  return kumuldenAylikArtis(kumulDizisi(rows, yil, brans));
}

function sonGercekAy(rows: MizanAylikRow[], yil: number): number {
  let max = 0;
  for (const r of rows) {
    if (r.yil !== yil || String(r.hesap) !== MIZAN_AYLIK_HESAP_BRUT) continue;
    if (r.tutar > 0 && r.ay > max) max = r.ay;
  }
  return max;
}

function tarifeBransPaylari(
  payRows: TarifeBransPayRow[],
  yil: number,
): Map<string, Map<string, number>> {
  const agg = new Map<string, Map<string, number>>();
  for (const r of payRows) {
    if (r.yil !== yil) continue;
    const tarife = normalizeText(r.tarifeGrubu);
    const brans = normalizeBransKodu(r.bransKodu);
    if (!tarife || !brans) continue;
    if (!agg.has(tarife)) agg.set(tarife, new Map());
    const m = agg.get(tarife)!;
    m.set(brans, (m.get(brans) ?? 0) + Math.max(0, r.netPrim));
  }
  return agg;
}

function tarifeAylikFromPay(
  payRows: TarifeBransPayRow[],
  yil: number,
): Map<string, number[]> {
  const out = new Map<string, number[]>();
  const byKey = new Map<string, number>();
  for (const r of payRows) {
    if (r.yil !== yil) continue;
    const tarife = normalizeText(r.tarifeGrubu);
    if (!tarife) continue;
    const key = `${tarife}|${r.ay}`;
    byKey.set(key, (byKey.get(key) ?? 0) + Math.max(0, r.netPrim));
  }
  const tarifeler = new Set<string>();
  for (const k of byKey.keys()) tarifeler.add(k.split("|")[0]!);
  for (const t of tarifeler) {
    out.set(
      t,
      Array.from({ length: 12 }, (_, i) => byKey.get(`${t}|${i + 1}`) ?? 0),
    );
  }
  return out;
}

function buyumeOrani(onceki: number[], guncel: number[], sonAy: number): number {
  let a = 0;
  let b = 0;
  for (let i = 0; i < sonAy; i++) {
    a += guncel[i] ?? 0;
    b += onceki[i] ?? 0;
  }
  if (b <= 0) return a > 0 ? 0.1 : 0;
  return a / b - 1;
}

function dagitTarifeToBrans(
  tarifePrim: number[],
  payMap: Map<string, number>,
): Record<string, number[]> {
  const sum = [...payMap.values()].reduce((a, b) => a + b, 0);
  const out: Record<string, number[]> = {};
  if (sum <= 0) return out;
  for (const [brans, pay] of payMap) {
    out[brans] = tarifePrim.map((p) => (p * pay) / sum);
  }
  return out;
}

/** Önceki bütçe yılı (Y-1) branş × ay brüt prim — mizan + tarife tahmin + manuel override. */
export function buildOncekiYilPrimSerisi(opts: {
  butceYili: number;
  mizanAylik: MizanAylikRow[];
  tarifeBransPay: TarifeBransPayRow[];
  kapanisTahmin?: KpkKapanisTahminStore | null;
}): OncekiYilPrimSonuc {
  const { butceYili, mizanAylik, tarifeBransPay, kapanisTahmin } = opts;
  const oncekiYil = butceYili - 1;
  const ikiYilOnce = butceYili - 2;
  const sonAy = kapanisTahmin?.sonGercekAy ?? sonGercekAy(mizanAylik, oncekiYil);

  const tarifeOnceki = tarifeAylikFromPay(tarifeBransPay, oncekiYil);
  const tarifeIkiOnce = tarifeAylikFromPay(tarifeBransPay, ikiYilOnce);
  const payOnceki = tarifeBransPaylari(tarifeBransPay, oncekiYil);

  const bransAylik: Record<string, number[]> = {};
  const tarifeSatirlar: TarifeAyPrim[] = [];
  const buyumeOranlari: Record<string, number> = {};

  const bransSet = new Set<string>();
  for (const r of mizanAylik) {
    if (r.yil === oncekiYil && String(r.hesap) === MIZAN_AYLIK_HESAP_BRUT) {
      bransSet.add(normalizeBransKodu(r.bransKodu));
    }
  }
  for (const m of payOnceki.values()) {
    for (const b of m.keys()) bransSet.add(b);
  }

  for (const brans of bransSet) {
    bransAylik[brans] = Array.from({ length: 12 }, () => 0);
  }

  const tarifeler = new Set([...tarifeOnceki.keys(), ...tarifeIkiOnce.keys()]);
  for (const tarife of tarifeler) {
    const gercek = tarifeOnceki.get(tarife) ?? Array.from({ length: 12 }, () => 0);
    const ref = tarifeIkiOnce.get(tarife) ?? Array.from({ length: 12 }, () => 0);
    const oran =
      kapanisTahmin?.tarifeBuyumeOran?.[tarife] ??
      buyumeOrani(ref, gercek, Math.max(1, sonAy));
    buyumeOranlari[tarife] = oran;

    const aylar = Array.from({ length: 12 }, () => 0);
    const kaynak: ("gercek" | "tahmin")[] = Array.from({ length: 12 }, () => "tahmin");

    for (let i = 0; i < 12; i++) {
      const ay = i + 1;
      const override = kapanisTahmin?.tarifeAylikOverride?.[tarife]?.[ay];
      if (override != null && Number.isFinite(override)) {
        aylar[i] = override;
        kaynak[i] = "tahmin";
      } else if (ay <= sonAy && gercek[i] > 0) {
        aylar[i] = gercek[i];
        kaynak[i] = "gercek";
      } else {
        aylar[i] = Math.max(0, ref[i] * (1 + oran));
        kaynak[i] = "tahmin";
      }
    }

    tarifeSatirlar.push({
      tarifeGrubu: tarife,
      aylar,
      toplam: aylar.reduce((a, b) => a + b, 0),
      kaynak,
    });

    const payMap = payOnceki.get(tarife);
    if (!payMap || payMap.size === 0) continue;
    const dagit = dagitTarifeToBrans(aylar, payMap);
    for (const [brans, seri] of Object.entries(dagit)) {
      if (!bransAylik[brans]) bransAylik[brans] = Array.from({ length: 12 }, () => 0);
      for (let i = 0; i < 12; i++) bransAylik[brans][i] += seri[i] ?? 0;
    }
  }

  for (const brans of bransSet) {
    const mizanSeri = bransAylikPrim(mizanAylik, oncekiYil, brans);
    const hasMizan = mizanSeri.some((v) => v > 0);
    if (!hasMizan) continue;
    for (let i = 0; i < sonAy; i++) {
      if (mizanSeri[i] > 0) bransAylik[brans][i] = mizanSeri[i];
    }
  }

  return { oncekiYil, sonGercekAy: sonAy, tarifeSatirlar, bransAylik, buyumeOranlari };
}
