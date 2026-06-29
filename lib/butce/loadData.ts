import { BUTCE_YILI_VARSAYILAN } from "./config/constants";
import {
  BUTCE_AYLIK_PRIM_JSON,
  BUTCE_META_JSON,
  BUTCE_MIZAN_AYLIK_JSON,
  BUTCE_MIZAN_JSON,
  BUTCE_ORAN_AYAR_JSON,
  BUTCE_PRIM_BRANS_JSON,
  BUTCE_SATIS_BUTCE_JSON,
  BUTCE_TARIFE_MAP_JSON,
  BUTCE_URETIM_JSON,
} from "./paths";
import { readPrivateFile } from "./storage";
import type {
  AylikPrimStore,
  ButceMeta,
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
  PrimBransHedefStore,
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

export async function loadMizanAylikRows(): Promise<MizanAylikRow[]> {
  const raw = await readPrivateFile(BUTCE_MIZAN_AYLIK_JSON);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as MizanAylikRow[];
  return parsed.map((r) => ({
    yil: Number(r.yil),
    ay: Number(r.ay),
    hesap: String(r.hesap).replace(/\.0$/, ""),
    bransKodu: String(r.bransKodu),
    tutar: Number(r.tutar),
  }));
}

export async function loadPrimBransHedef(): Promise<PrimBransHedefStore | null> {
  const raw = await readPrivateFile(BUTCE_PRIM_BRANS_JSON);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { hedefler?: PrimBransHedefStore };
  return parsed.hedefler ?? null;
}

export async function loadAylikPrim(): Promise<AylikPrimStore | null> {
  const raw = await readPrivateFile(BUTCE_AYLIK_PRIM_JSON);
  if (!raw) return null;
  return JSON.parse(raw) as AylikPrimStore;
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
  const mizanAylik = await loadMizanAylikRows();
  const tarifeMap = await loadTarifeMapRows();
  const satisButce = await loadSatisButceRows();
  const uretim = await loadUretimRows();
  return {
    hasMizan: mizan.length > 0,
    hasMizanAylik: mizanAylik.length > 0,
    hasTarifeMap: tarifeMap.length > 0,
    hasSatisButce: satisButce.length > 0,
    hasUretim: uretim.length > 0,
    hasPrimBransHedef: (await loadPrimBransHedef()) != null,
    mizanSatir: mizan.length,
    mizanAylikSatir: mizanAylik.length,
    tarifeMapSatir: tarifeMap.length,
    satisButceSatir: satisButce.length,
    uretimSatir: uretim.length,
    butceYili: meta?.butceYili ?? BUTCE_YILI_VARSAYILAN,
    meta,
  };
}
