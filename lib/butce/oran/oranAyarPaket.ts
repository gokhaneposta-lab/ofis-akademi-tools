import type { OranAyarStore, OranYilBirlestirmeStore } from "../types";

export const ORAN_META_YIL_BIRLESTIRME = "_kalemYilBirlestirme";

export type OranAyarPaket = {
  ayarlar: OranAyarStore;
  kalemYilBirlestirme: OranYilBirlestirmeStore;
};

/** oran-ayarlar.json — branş ayarları + kalem yıl birleştirme meta. */
export function parseOranAyarDosya(raw: unknown): OranAyarPaket {
  if (!raw || typeof raw !== "object") {
    return { ayarlar: {}, kalemYilBirlestirme: {} };
  }
  const obj = raw as Record<string, unknown>;
  const kalemYilBirlestirme = normalizeYilBirlestirmeStore(
    obj[ORAN_META_YIL_BIRLESTIRME],
  );
  const ayarlar: OranAyarStore = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === ORAN_META_YIL_BIRLESTIRME) continue;
    if (v && typeof v === "object") ayarlar[k] = v as OranAyarStore[string];
  }
  return { ayarlar, kalemYilBirlestirme };
}

export function serializeOranAyarDosya(paket: OranAyarPaket): Record<string, unknown> {
  const out: Record<string, unknown> = { ...paket.ayarlar };
  if (Object.keys(paket.kalemYilBirlestirme).length > 0) {
    out[ORAN_META_YIL_BIRLESTIRME] = paket.kalemYilBirlestirme;
  }
  return out;
}

function normalizeYilBirlestirmeStore(raw: unknown): OranYilBirlestirmeStore {
  if (!raw || typeof raw !== "object") return {};
  const out: OranYilBirlestirmeStore = {};
  for (const [kalem, rows] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(rows)) continue;
    const parsed: [number, number][] = [];
    for (const row of rows) {
      if (!Array.isArray(row) || row.length < 2) continue;
      const ofset = Number(row[0]);
      const agirlik = Number(row[1]);
      if (!Number.isFinite(ofset) || !Number.isFinite(agirlik) || agirlik < 0) continue;
      parsed.push([ofset, agirlik]);
    }
    if (parsed.length) out[kalem] = parsed;
  }
  return out;
}

/** Takvim yılı ağırlıkları → offset formatı (maxY = son MIZAN yılı). */
export function yilAgirlikToOffset(
  yilAgirliklari: Array<{ yil: number; agirlik: number }>,
  yillar: number[],
): [number, number][] {
  if (yillar.length === 0) return [];
  const maxY = yillar[yillar.length - 1]!;
  return yilAgirliklari
    .filter((a) => yillar.includes(a.yil) && a.agirlik > 0)
    .map(({ yil, agirlik }) => [maxY - yil + 1, agirlik] as [number, number])
    .sort((a, b) => a[0] - b[0]);
}

/** URL/query: `2022:0.1,2023:0.15` */
export function parseYilAgirlikParam(
  raw: string | null,
  yillar: number[],
): [number, number][] | null {
  if (!raw?.trim() || yillar.length === 0) return null;
  const list: Array<{ yil: number; agirlik: number }> = [];
  for (const part of raw.split(",")) {
    const [yStr, wStr] = part.split(":");
    const yil = Number(yStr);
    const agirlik = Number(wStr);
    if (!Number.isFinite(yil) || !Number.isFinite(agirlik)) continue;
    list.push({ yil, agirlik });
  }
  const offset = yilAgirlikToOffset(list, yillar);
  return offset.length ? offset : null;
}
