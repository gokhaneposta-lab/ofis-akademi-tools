/**
 * 2027 Budget Reference Loader — veri sözleşmesi seviyesinde.
 * 2026 EYE snapshot'tan oran referansı okur; prim hedefi OTOMATİK türetilmez.
 */
import { readFileSync } from "fs";
import type { EyeSnapshotV1 } from "./types";

export type BudgetReference2027 = {
  /** Kaynak snapshot dosya yolu veya id. */
  kaynakSnapshot: string;
  /** 2026 EYE yıllık oran girdileri (60001, 60101, 61001 …). */
  oranGirdisi2026Eye: Record<string, number>;
  /** 2027 prim hedefi — yalnızca ayrı kullanıcı girdisi; null = henüz yok. */
  hedef2027: EyeSnapshotV1["hedef2027"];
  /** Snapshot kalite bayrakları (proxy satırlar). */
  quality: EyeSnapshotV1["quality"];
  meta: EyeSnapshotV1["meta"];
};

/** JSON snapshot dosyasını yükle ve 2027 referans sözleşmesine dönüştür. */
export function loadBudgetReferenceFromEyeSnapshot(filePath: string): BudgetReference2027 {
  const raw = readFileSync(filePath, "utf8");
  const snapshot = JSON.parse(raw) as EyeSnapshotV1;

  if (snapshot.meta.schemaVersion !== "eye-v1") {
    throw new Error(`Desteklenmeyen snapshot schema: ${snapshot.meta.schemaVersion}`);
  }

  return {
    kaynakSnapshot: filePath,
    oranGirdisi2026Eye: snapshot.oranGirdisi["2026EyeYillik"] ?? {},
    hedef2027: snapshot.hedef2027 ?? null,
    quality: snapshot.quality,
    meta: snapshot.meta,
  };
}

/** Bellekteki snapshot'tan referans (API/ test). */
export function budgetReferenceFromSnapshot(snapshot: EyeSnapshotV1): BudgetReference2027 {
  return {
    kaynakSnapshot: "inline",
    oranGirdisi2026Eye: snapshot.oranGirdisi["2026EyeYillik"] ?? {},
    hedef2027: snapshot.hedef2027 ?? null,
    quality: snapshot.quality,
    meta: snapshot.meta,
  };
}
