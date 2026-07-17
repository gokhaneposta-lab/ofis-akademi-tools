import { existsSync, readFileSync } from "fs";
import { BUTCE_YILI_VARSAYILAN } from "./config/constants";
import {
  BUTCE_AYLIK_PRIM_JSON,
  BUTCE_KPK_KAPANIS_JSON,
  BUTCE_KPK_VADE_DEFAULT_JSON,
  BUTCE_KPK_VADE_JSON,
  BUTCE_META_JSON,
  BUTCE_MIZAN_AYLIK_FULL_JSON,
  BUTCE_MIZAN_AYLIK_JSON,
  BUTCE_MIZAN_JSON,
  BUTCE_ORAN_AYAR_JSON,
  BUTCE_PRIM_BRANS_JSON,
  BUTCE_SATIS_BUTCE_JSON,
  BUTCE_TARIFE_BRANS_PAY_JSON,
  BUTCE_TARIFE_MAP_JSON,
  BUTCE_URETIM_JSON,
  BUTCE_FAALIYET_GIDER_JSON,
  BUTCE_BILANCO_AYLIK_JSON,
  BUTCE_V2_VARSAYIMLAR_JSON,
} from "./paths";
import { readPrivateFile } from "./storage";
import type {
  AylikPrimStore,
  BilancoAylikRow,
  ButceMeta,
  KpkKapanisTahminStore,
  KpkVadeRow,
  FaaliyetGiderRow,
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
  PrimBransHedefStore,
  SatisButceRow,
  TarifeBransPayRow,
  TarifeMapRow,
  UretimRow,
} from "./types";
import type { V2VarsayimlarStore } from "./v2/types";

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

/** Tüm GT kodları (02571, 0112 …) — teknik oranlar için yılsonu snapshot kaynağı. */
export async function loadMizanAylikFullRows(): Promise<MizanAylikRow[]> {
  const raw = await readPrivateFile(BUTCE_MIZAN_AYLIK_FULL_JSON);
  if (!raw) return loadMizanAylikRows();
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
  const store = await loadPrimBransHedefStore();
  return store?.hedefler ?? null;
}

export type PrimBransHedefFile = {
  guncellemeIso?: string;
  referansEtiket?: string;
  /** Referans yılları sırasıyla üretim payı ağırlıkları (toplam ≈ 1). */
  yilAgirliklari?: number[];
  tarifeHedefleri?: Record<string, number>;
  hedefler?: PrimBransHedefStore;
  direkt?: Record<string, number>;
  endirekt?: Record<string, number>;
};

export async function loadPrimBransHedefStore(): Promise<PrimBransHedefFile | null> {
  const raw = await readPrivateFile(BUTCE_PRIM_BRANS_JSON);
  if (!raw) return null;
  return JSON.parse(raw) as PrimBransHedefFile;
}

/** Prim dağıtımından kaydedilen direkt/endirekt branş kırılımı (gelir tablosu F12/F15). */
export async function loadPrimBransEndirekt(): Promise<Record<string, number>> {
  const store = await loadPrimBransHedefStore();
  return store?.endirekt ?? {};
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

export async function loadTarifeBransPayRows(): Promise<TarifeBransPayRow[]> {
  const raw = await readPrivateFile(BUTCE_TARIFE_BRANS_PAY_JSON);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as TarifeBransPayRow[];
  return parsed.map((r) => ({
    sirket: String(r.sirket ?? ""),
    tarifeGrubu: String(r.tarifeGrubu),
    bransKodu: String(r.bransKodu),
    hazineBransAd: String(r.hazineBransAd ?? ""),
    yil: Number(r.yil),
    ay: Number(r.ay),
    netPrim: Number(r.netPrim),
  }));
}

export async function loadKpkVadeRows(): Promise<KpkVadeRow[]> {
  const raw = await readPrivateFile(BUTCE_KPK_VADE_JSON);
  if (raw) return JSON.parse(raw) as KpkVadeRow[];

  if (existsSync(BUTCE_KPK_VADE_DEFAULT_JSON)) {
    return JSON.parse(readFileSync(BUTCE_KPK_VADE_DEFAULT_JSON, "utf8")) as KpkVadeRow[];
  }

  return [];
}

export async function kpkVadeKaynagi(): Promise<"yuklu" | "varsayilan" | null> {
  const raw = await readPrivateFile(BUTCE_KPK_VADE_JSON);
  if (raw) return "yuklu";
  if (existsSync(BUTCE_KPK_VADE_DEFAULT_JSON)) return "varsayilan";
  return null;
}

export async function loadKpkKapanisTahmin(): Promise<KpkKapanisTahminStore | null> {
  const raw = await readPrivateFile(BUTCE_KPK_KAPANIS_JSON);
  if (!raw) return null;
  return JSON.parse(raw) as KpkKapanisTahminStore;
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

export async function loadFaaliyetGiderRows(): Promise<FaaliyetGiderRow[]> {
  const raw = await readPrivateFile(BUTCE_FAALIYET_GIDER_JSON);
  if (!raw) return [];
  return JSON.parse(raw) as FaaliyetGiderRow[];
}

export async function loadBilancoAylikRows(): Promise<BilancoAylikRow[]> {
  const raw = await readPrivateFile(BUTCE_BILANCO_AYLIK_JSON);
  if (!raw) return [];
  return JSON.parse(raw) as BilancoAylikRow[];
}

export async function loadV2Varsayimlar(): Promise<V2VarsayimlarStore | null> {
  const raw = await readPrivateFile(BUTCE_V2_VARSAYIMLAR_JSON);
  if (!raw) return null;
  return JSON.parse(raw) as V2VarsayimlarStore;
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
  const tarifeBransPay = await loadTarifeBransPayRows();
  const kpkVade = await loadKpkVadeRows();
  const kpkVadeKaynak = await kpkVadeKaynagi();
  const kpkVadeBransSayisi = new Set(kpkVade.map((r) => r.bransKodu)).size;
  const satisButce = await loadSatisButceRows();
  const uretim = await loadUretimRows();
  const faaliyetGider = await loadFaaliyetGiderRows();
  return {
    hasMizan: mizan.length > 0,
    hasMizanAylik: mizanAylik.length > 0,
    hasTarifeMap: tarifeMap.length > 0,
    hasTarifeBransPay: tarifeBransPay.length > 0,
    hasKpkVade: kpkVade.length > 0,
    kpkVadeKaynak,
    kpkVadeBransSayisi,
    hasSatisButce: satisButce.length > 0,
    hasUretim: uretim.length > 0,
    hasFaaliyetGider: faaliyetGider.length > 0,
    hasPrimBransHedef: (await loadPrimBransHedef()) != null,
    mizanSatir: mizan.length,
    mizanAylikSatir: mizanAylik.length,
    tarifeMapSatir: tarifeMap.length,
    tarifeBransPaySatir: tarifeBransPay.length,
    kpkVadeSatir: kpkVade.length,
    satisButceSatir: satisButce.length,
    uretimSatir: uretim.length,
    faaliyetGiderSatir: faaliyetGider.length,
    faaliyetGiderHesapSayisi: new Set(faaliyetGider.map((r) => r.hesap)).size,
    butceYili: meta?.butceYili ?? BUTCE_YILI_VARSAYILAN,
    meta,
  };
}
