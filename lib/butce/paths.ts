import { join } from "path";
import { tmpdir } from "os";

/** Sunucu tarafı — gitignore (yerel); Vercel'de Blob veya /tmp. */
export const BUTCE_MIZAN_JSON = "mizan-tidy.json";
export const BUTCE_MIZAN_AYLIK_JSON = "mizan-aylik-tidy.json";
export const BUTCE_META_JSON = "meta.json";
export const BUTCE_ORAN_AYAR_JSON = "oran-ayarlar.json";
export const BUTCE_PRIM_BRANS_JSON = "prim-brans-hedef.json";
export const BUTCE_AYLIK_PRIM_JSON = "aylik-prim.json";
export const BUTCE_TARIFE_MAP_JSON = "tarife-map.json";
export const BUTCE_SATIS_BUTCE_JSON = "satis-butce.json";
export const BUTCE_URETIM_JSON = "uretim.json";

/** @deprecated use localPrivateDir() */
export const BUTCE_PRIVATE_DIR = join(process.cwd(), "data", "butce", "private");

export function useBlobStorage(): boolean {
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  // Vercel Blob store projeye bağlandığında STORE_ID de gelir; SDK platform kimliği kullanır
  if (process.env.VERCEL === "1" && process.env.BLOB_STORE_ID?.trim()) return true;
  return false;
}

export function localPrivateDir(): string {
  if (process.env.VERCEL === "1" && !useBlobStorage()) {
    return join(tmpdir(), "ofis-akademi-butce-private");
  }
  return join(process.cwd(), "data", "butce", "private");
}
