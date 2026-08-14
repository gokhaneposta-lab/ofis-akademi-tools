import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { bransAdi } from "../config/brans";
import formatRaw from "../data/gt_sirket_format.json";
import { bransGrubu, GRUP_SIRA } from "./buildGtFormatGrid";

export type V2GtFiltreModu = "tarife" | "yedili";

export { GRUP_SIRA, bransGrubu };

const FORMAT = formatRaw as {
  bransGrup: Array<{ bransKodu: string; grup: string; hazine: string }>;
};

export const YEDILI_SIRA: readonly string[] = FORMAT.bransGrup.map((r) => r.bransKodu);

export type V2YediliSecenek = {
  kod: string;
  ad: string;
  grup: string;
};

function yediliKod(b: { bransKodu: string }): boolean {
  return /^7\d{2}$/.test(b.bransKodu);
}

export function v2YediliSecenekler(gt: GelirTablosuSonuc): V2YediliSecenek[] {
  const byKod = new Map(gt.branslar.filter(yediliKod).map((b) => [b.bransKodu, b]));
  const out: V2YediliSecenek[] = [];
  for (const kod of YEDILI_SIRA) {
    const b = byKod.get(kod);
    if (!b) continue;
    out.push({
      kod,
      ad: b.bransAdi || bransAdi(kod),
      grup: bransGrubu(kod),
    });
  }
  for (const b of gt.branslar) {
    if (!yediliKod(b) || out.some((x) => x.kod === b.bransKodu)) continue;
    out.push({
      kod: b.bransKodu,
      ad: b.bransAdi || bransAdi(b.bransKodu),
      grup: bransGrubu(b.bransKodu),
    });
  }
  return out;
}

export function v2FiltreBransKodlari(
  gt: GelirTablosuSonuc,
  mod: V2GtFiltreModu,
  secim: ReadonlySet<string>,
): string[] | null {
  if (secim.size === 0) return null;
  if (mod === "yedili") {
    return [...secim].filter((k) => /^7\d{2}$/.test(k));
  }
  return gt.branslar
    .filter((b) => yediliKod(b) && secim.has(bransGrubu(b.bransKodu)))
    .map((b) => b.bransKodu);
}

function aylikTopla(aylik: number[] | undefined, ozetAy: number): number {
  if (!aylik?.length) return 0;
  return aylik.slice(0, ozetAy).reduce((t, n) => t + n, 0);
}

export function v2OzetDeger(
  gt: GelirTablosuSonuc,
  satir: number,
  ozetAy: number,
  bransKodlari: string[] | null,
): number {
  if (!bransKodlari || bransKodlari.length === 0) {
    if (gt.aylikToplam[satir]) return aylikTopla(gt.aylikToplam[satir], ozetAy);
    return gt.toplam[satir] ?? 0;
  }
  let toplam = 0;
  for (const kod of bransKodlari) {
    toplam += aylikTopla(gt.aylikBrans[kod]?.[satir], ozetAy);
  }
  return toplam;
}

export function v2FiltreEtiket(
  mod: V2GtFiltreModu,
  secim: ReadonlySet<string>,
  yedili: V2YediliSecenek[],
): string {
  if (secim.size === 0) return "şirket toplam";
  if (mod === "tarife") return [...secim].join(" · ");
  const ad = new Map(yedili.map((b) => [b.kod, b.ad]));
  return [...secim].map((k) => `${k} ${ad.get(k) ?? ""}`.trim()).join(" · ");
}
