import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { BUTCE_YILI_VARSAYILAN } from "./config/constants";
import {
  BUTCE_META_JSON,
  BUTCE_MIZAN_JSON,
  BUTCE_ORAN_AYAR_JSON,
  BUTCE_PRIVATE_DIR,
} from "./paths";
import type { ButceMeta, MizanRow, OranAyarStore } from "./types";

export function loadMizanRows(): MizanRow[] {
  const p = join(BUTCE_PRIVATE_DIR, BUTCE_MIZAN_JSON);
  if (!existsSync(p)) return [];
  const raw = JSON.parse(readFileSync(p, "utf8")) as MizanRow[];
  return raw.map((r) => ({
    yil: Number(r.yil),
    hesap: String(r.hesap).replace(/\.0$/, ""),
    bransKodu: String(r.bransKodu),
    tutar: Number(r.tutar),
  }));
}

export function loadButceMeta(): ButceMeta | null {
  const p = join(BUTCE_PRIVATE_DIR, BUTCE_META_JSON);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as ButceMeta;
}

export function loadOranAyarlar(): OranAyarStore {
  const p = join(BUTCE_PRIVATE_DIR, BUTCE_ORAN_AYAR_JSON);
  if (!existsSync(p)) return {};
  return JSON.parse(readFileSync(p, "utf8")) as OranAyarStore;
}

export function butceDataDurumu() {
  const meta = loadButceMeta();
  const mizan = loadMizanRows();
  return {
    hasMizan: mizan.length > 0,
    mizanSatir: mizan.length,
    butceYili: meta?.butceYili ?? BUTCE_YILI_VARSAYILAN,
    meta,
  };
}
