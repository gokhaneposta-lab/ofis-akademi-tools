import type { FaaliyetGiderRow } from "../types";
import { parseGenelGiderFromBuffer } from "./genelGiderImportCore";

/** Genel gider import — aylık × tam alt hesap (61402–61406). */
export function importFaaliyetGiderFromBuffer(
  buffer: Buffer,
  butceYili: number,
): { rows: FaaliyetGiderRow[]; log: string } {
  const result = parseGenelGiderFromBuffer(buffer, butceYili);
  if (result.warnings.length > 0) {
    console.warn(
      result.warnings.map((w) => `Uyarı satır ${w.satir} [${w.kod}]: ${w.mesaj}`).join("\n"),
    );
  }
  if (result.errors.length > 0) {
    const lines = result.errors
      .slice(0, 20)
      .map((e) => `Satır ${e.satir} [${e.kod}]: ${e.mesaj}`)
      .join("\n");
    const ek = result.errors.length > 20 ? `\n… ve ${result.errors.length - 20} hata daha` : "";
    throw new Error(`Genel gider import reddedildi:\n${lines}${ek}`);
  }
  return { rows: result.rows, log: result.log };
}

export {
  parseGenelGiderFromBuffer,
  parseGenelGiderFromRawRows,
  normalizeAltHesapKodu,
  resolveAnaHesapFromAlt,
  normalizeFaaliyetGiderRow,
  anaHesapAdi,
  type GenelGiderImportIssue,
  type GenelGiderImportParseResult,
} from "./genelGiderImportCore";
