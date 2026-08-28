/**
 * TSB veri özeti (stdout, read-only).
 *   npx --yes tsx scripts/tsb-read-meta.ts
 */

import { statSync } from "fs";
import { join } from "path";
import {
  readGelirIndex,
  readMeta,
  readPrimRows,
  repoRoot,
  TSB_GELIR_DIR_REL,
  TSB_META_REL,
  TSB_PRIM_REL,
} from "./lib/tsb-readonly-helpers";

function fileMtimeIso(rel: string): string | null {
  try {
    return statSync(join(repoRoot(), rel)).mtime.toISOString();
  } catch {
    return null;
  }
}

function primDonemler(rows: ReturnType<typeof readPrimRows>): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (typeof r.donem === "string" && r.donem) set.add(r.donem);
  }
  return [...set].sort();
}

function main() {
  const meta = readMeta();
  const gelirIndex = readGelirIndex();
  const primRows = readPrimRows();
  const primDonem = primDonemler(primRows);

  const out = {
    meta: meta ?? { error: "meta.json okunamadı" },
    gelirTidy: {
      donemSayisi: gelirIndex.length,
      ilkDonem: gelirIndex[0] ?? null,
      sonDonem: gelirIndex[gelirIndex.length - 1] ?? null,
      donemler: gelirIndex,
      indexMtime: fileMtimeIso(TSB_GELIR_DIR_REL + "/index.json"),
    },
    primTidy: {
      satirSayisi: primRows.length,
      donemSayisi: primDonem.length,
      ilkDonem: primDonem[0] ?? null,
      sonDonem: primDonem[primDonem.length - 1] ?? null,
      mtime: fileMtimeIso(TSB_PRIM_REL),
    },
    metaMtime: fileMtimeIso(TSB_META_REL),
  };

  console.log(JSON.stringify(out, null, 2));
}

main();
