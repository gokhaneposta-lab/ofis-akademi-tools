import { join } from "path";
import { tmpdir } from "os";

/** Sunucu tarafı — gitignore (yerel); Vercel'de Blob veya /tmp. */
export const BUTCE_MIZAN_JSON = "mizan-tidy.json";
export const BUTCE_META_JSON = "meta.json";
export const BUTCE_ORAN_AYAR_JSON = "oran-ayarlar.json";

/** @deprecated use localPrivateDir() */
export const BUTCE_PRIVATE_DIR = join(process.cwd(), "data", "butce", "private");

export function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function localPrivateDir(): string {
  if (process.env.VERCEL === "1" && !useBlobStorage()) {
    return join(tmpdir(), "ofis-akademi-butce-private");
  }
  return join(process.cwd(), "data", "butce", "private");
}
