import { BUTCE_YILI_VARSAYILAN } from "./config/constants";
import {
  BUTCE_META_JSON,
  BUTCE_MIZAN_JSON,
  BUTCE_ORAN_AYAR_JSON,
  readPrivateFile,
} from "./storage";
import type { ButceMeta, MizanRow, OranAyarStore } from "./types";

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
  return {
    hasMizan: mizan.length > 0,
    mizanSatir: mizan.length,
    butceYili: meta?.butceYili ?? BUTCE_YILI_VARSAYILAN,
    meta,
  };
}
