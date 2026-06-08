import { join } from "path";

/** Sunucu tarafı — gitignore; `public/` altında değil. */
export const BUTCE_PRIVATE_DIR = join(process.cwd(), "data", "butce", "private");

export const BUTCE_MIZAN_JSON = "mizan-tidy.json";
export const BUTCE_META_JSON = "meta.json";
export const BUTCE_ORAN_AYAR_JSON = "oran-ayarlar.json";
