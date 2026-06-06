import { bransApForGmTarifeGrup } from "@/lib/butce/tarifeGrupMap";
import type { ButceHedefPrimRow } from "@/lib/butce/types";

export type HedefBransOzet = {
  bransAp: string;
  toplam: number;
  tarifeGruplari: { tarifeGrupNorm: string; toplam: number }[];
};

export type HedefTarifeOzet = {
  tarifeGrupNorm: string;
  bransAp: string | null;
  toplam: number;
};

/** GM tarife hedeflerini GT branş dilimine toplar (kanal ayrımı düşülür). */
export function hedefToplamByBransAp(
  rows: ButceHedefPrimRow[],
  opts?: { sirketKodu?: string; excludeHavuz?: boolean },
): HedefBransOzet[] {
  const excludeHavuz = opts?.excludeHavuz !== false;
  const m = new Map<string, { toplam: number; tarife: Map<string, number> }>();

  for (const r of rows) {
    if (opts?.sirketKodu && r.sirketKodu !== opts.sirketKodu) continue;
    if (excludeHavuz && r.sirketKodu.toUpperCase() === "HAVUZ") continue;
    const brans = r.bransAp ?? bransApForGmTarifeGrup(r.tarifeGrupAdi);
    if (!brans) continue;
    let bucket = m.get(brans);
    if (!bucket) {
      bucket = { toplam: 0, tarife: new Map() };
      m.set(brans, bucket);
    }
    bucket.toplam += r.hedefTutar;
    bucket.tarife.set(r.tarifeGrupNorm, (bucket.tarife.get(r.tarifeGrupNorm) ?? 0) + r.hedefTutar);
  }

  return [...m.entries()]
    .map(([bransAp, v]) => ({
      bransAp,
      toplam: v.toplam,
      tarifeGruplari: [...v.tarife.entries()]
        .map(([tarifeGrupNorm, toplam]) => ({ tarifeGrupNorm, toplam }))
        .sort((a, b) => b.toplam - a.toplam),
    }))
    .sort((a, b) => b.toplam - a.toplam);
}

export function hedefToplamByTarife(rows: ButceHedefPrimRow[]): HedefTarifeOzet[] {
  const m = new Map<string, { bransAp: string | null; toplam: number }>();
  for (const r of rows) {
    const key = r.tarifeGrupNorm;
    const cur = m.get(key) ?? { bransAp: r.bransAp, toplam: 0 };
    cur.toplam += r.hedefTutar;
    m.set(key, cur);
  }
  return [...m.entries()]
    .map(([tarifeGrupNorm, v]) => ({
      tarifeGrupNorm,
      bransAp: v.bransAp,
      toplam: v.toplam,
    }))
    .sort((a, b) => b.toplam - a.toplam);
}
