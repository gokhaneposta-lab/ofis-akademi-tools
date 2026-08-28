/**
 * TSB read-only script'leri için ortak disk okuma yardımcıları.
 * Yazma yok — yalnızca public/data/tsb ve data/tsb/incoming.
 */

import { existsSync, readFileSync, readdirSync } from "fs";
import { join, normalize, resolve } from "path";
import type { TsbGelirTidyRowLike } from "../../lib/tsbYatirimGeliriKpi";
import type { TsbPrimRow } from "../../lib/tsbPrimDashboard";
import type { TsbVeriDurumuMeta } from "../../lib/tsbVeriDurumu";

export const TSB_INCOMING_REL = join("data", "tsb", "incoming");
export const TSB_META_REL = join("public", "data", "tsb", "meta.json");
export const TSB_PRIM_REL = join("public", "data", "tsb", "prim-tidy.json");
export const TSB_GELIR_DIR_REL = join("public", "data", "tsb", "gelir-tidy");
export const TSB_GELIR_INDEX_REL = join(TSB_GELIR_DIR_REL, "index.json");

export function repoRoot(): string {
  return process.cwd();
}

export function readJsonFile<T>(relPath: string): T | null {
  const abs = join(repoRoot(), relPath);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, "utf8")) as T;
  } catch {
    return null;
  }
}

export function readMeta(): TsbVeriDurumuMeta | null {
  return readJsonFile<TsbVeriDurumuMeta>(TSB_META_REL);
}

export function readGelirIndex(): string[] {
  const raw = readJsonFile<string[]>(TSB_GELIR_INDEX_REL);
  return Array.isArray(raw) ? raw.filter((d) => typeof d === "string") : [];
}

export function readGelirDonem(donem: string): TsbGelirTidyRowLike[] {
  const abs = join(repoRoot(), TSB_GELIR_DIR_REL, `${donem}.json`);
  if (!existsSync(abs)) return [];
  try {
    const data = JSON.parse(readFileSync(abs, "utf8")) as unknown;
    return Array.isArray(data) ? (data as TsbGelirTidyRowLike[]) : [];
  } catch {
    return [];
  }
}

export function readPrimRows(): TsbPrimRow[] {
  const raw = readJsonFile<unknown>(TSB_PRIM_REL);
  return Array.isArray(raw) ? (raw as TsbPrimRow[]) : [];
}

export function latestDonemFromList(donemler: readonly string[]): string {
  let max = "";
  for (const d of donemler) {
    if (typeof d === "string" && d > max) max = d;
  }
  return max;
}

/** Yalnızca data/tsb/incoming altındaki .xlsx / .xlsb dosyalarına izin verir. */
export function resolveIncomingExcelPath(arg: string): string {
  const incomingRoot = resolve(repoRoot(), TSB_INCOMING_REL);
  const trimmed = String(arg ?? "").trim();
  if (!trimmed) {
    throw new Error("Dosya adı gerekli. Örn.: scripts/inspect-excel.ts \"4 Sirketler Gelir Tablosu Özet 2025 4(3).xlsx\"");
  }
  if (trimmed.includes("..") || /^[a-zA-Z]:\\/.test(trimmed) || trimmed.startsWith("/") || trimmed.startsWith("\\")) {
    throw new Error("Yalnızca data/tsb/incoming altındaki dosya adı kabul edilir.");
  }
  const base = trimmed.replace(/^data[\\/]tsb[\\/]incoming[\\/]/i, "");
  const ext = base.toLowerCase();
  if (!ext.endsWith(".xlsx") && !ext.endsWith(".xlsb")) {
    throw new Error("Yalnızca .xlsx veya .xlsb dosyaları desteklenir.");
  }
  const abs = resolve(incomingRoot, base);
  const normalizedIncoming = normalize(incomingRoot);
  const normalizedAbs = normalize(abs);
  if (!normalizedAbs.startsWith(normalizedIncoming)) {
    throw new Error("Path data/tsb/incoming dışına çıkamaz.");
  }
  if (!existsSync(abs)) {
    throw new Error(`Dosya bulunamadı: ${join(TSB_INCOMING_REL, base)}`);
  }
  return abs;
}

export function listIncomingExcelFiles(): string[] {
  const dir = join(repoRoot(), TSB_INCOMING_REL);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(xlsx|xlsb)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, "tr"));
}
