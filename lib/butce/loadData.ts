import { BUTCE_YILI_VARSAYILAN } from "./config/constants";
import {
  BUTCE_META_JSON,
  BUTCE_MIZAN_JSON,
  BUTCE_ORAN_AYAR_JSON,
  BUTCE_SATIS_BUTCE_JSON,
  BUTCE_TARIFE_MAP_JSON,
  BUTCE_URETIM_JSON,
} from "./paths";
import { readPrivateFile } from "./storage";
import type {
  ButceMeta,
  MizanRow,
  OranAyarStore,
  SatisButceRow,
  TarifeMapRow,
  UretimRow,
} from "./types";

export async function loadMizanRows(): Promise<MizanRow[]> {
  const raw = await readPrivateFile(BUTCE_MIZAN_JSON);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as MizanRow[];
  return parsed.map((r) => ({
    yil: Number(r.yil),
    hesap: String(r.hesap).replace(/\.0$/, ""),
    bransKodu: String(r.bransKodu),
    tutar: Number(r.tutar),
  }));
}

export async function loadTarifeMapRows(): Promise<TarifeMapRow[]> {
  const raw = await readPrivateFile(BUTCE_TARIFE_MAP_JSON);
  if (!raw) return [];
  return JSON.parse(raw) as TarifeMapRow[];
}

export async function loadSatisButceRows(): Promise<SatisButceRow[]> {
  const raw = await readPrivateFile(BUTCE_SATIS_BUTCE_JSON);
  if (!raw) return [];
  return JSON.parse(raw) as SatisButceRow[];
}

export async function loadUretimRows(): Promise<UretimRow[]> {
  const raw = await readPrivateFile(BUTCE_URETIM_JSON);
  if (!raw) return [];
  return JSON.parse(raw) as UretimRow[];
}

export async function loadButceMeta(): Promise<ButceMeta | null> {
  const raw = await readPrivateFile(BUTCE_META_JSON);
  if (!raw) return null;
  return JSON.parse(raw) as ButceMeta;
}

export async function loadOranAyarlar(): Promise<OranAyarStore> {
  const raw = await readPrivateFile(BUTCE_ORAN_AYAR_JSON);
  if (!raw) return {};
  return JSON.parse(raw) as OranAyarStore;
}

export async function butceDataDurumu() {
  const meta = await loadButceMeta();
  const mizan = await loadMizanRows();
  const tarifeMap = await loadTarifeMapRows();
  const satisButce = await loadSatisButceRows();
  const uretim = await loadUretimRows();
  return {
    hasMizan: mizan.length > 0,
    hasTarifeMap: tarifeMap.length > 0,
    hasSatisButce: satisButce.length > 0,
    hasUretim: uretim.length > 0,
    mizanSatir: mizan.length,
    tarifeMapSatir: tarifeMap.length,
    satisButceSatir: satisButce.length,
    uretimSatir: uretim.length,
    butceYili: meta?.butceYili ?? BUTCE_YILI_VARSAYILAN,
    meta,
  };
}
