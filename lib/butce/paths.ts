import { join } from "path";

/** Sunucu tarafı — gitignore; `public/` altında değil. */
export const BUTCE_PRIVATE_DIR = join(process.cwd(), "data", "butce", "private");

export const BUTCE_GTBL_JSON = "gt-bl-tidy.json";
export const BUTCE_HEDEF_JSON = "hedef-prim.json";
export const BUTCE_META_JSON = "meta.json";
