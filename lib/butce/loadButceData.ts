import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  BUTCE_GTBL_JSON,
  BUTCE_HEDEF_JSON,
  BUTCE_META_JSON,
  BUTCE_PRIVATE_DIR,
} from "@/lib/butce/paths";
import type { ButceGtBlRow, ButceHedefPrimRow, ButceMeta } from "@/lib/butce/types";

function readJson<T>(fileName: string): T | null {
  const abs = join(BUTCE_PRIVATE_DIR, fileName);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, "utf8")) as T;
  } catch {
    return null;
  }
}

export function loadButceMeta(): ButceMeta | null {
  return readJson<ButceMeta>(BUTCE_META_JSON);
}

export function loadButceGtBlRows(): ButceGtBlRow[] {
  return readJson<ButceGtBlRow[]>(BUTCE_GTBL_JSON) ?? [];
}

export function loadButceHedefRows(): ButceHedefPrimRow[] {
  return readJson<ButceHedefPrimRow[]>(BUTCE_HEDEF_JSON) ?? [];
}

export function butceDataDurumu() {
  const meta = loadButceMeta();
  const gtBl = loadButceGtBlRows();
  const hedef = loadButceHedefRows();
  return {
    meta,
    hasGtBl: gtBl.length > 0,
    hasHedef: hedef.length > 0,
    gtBlSatir: gtBl.length,
    hedefSatir: hedef.length,
  };
}
