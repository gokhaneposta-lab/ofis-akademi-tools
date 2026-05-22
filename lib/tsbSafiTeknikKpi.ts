/**
 * SAFİ teknik kar/zarar — `docs/tsb-kpi-tanimlari.md` §4.2
 */

import { safiTeknikKzFromLookup } from "./tsbGelirGtOzet";
import type { TsbGelirTidyRowLike } from "./tsbYatirimGeliriKpi";
import { buildGelirTidyDonemLookup } from "./tsbSirketSegmentSkor";

/**
 * SAFİ_TEKNİK = HD (60–603, 61–61402…06) + Hayat (62–63, 63602…06) + Emeklilik (64–65, 65202…06)
 * Tüm `deger` değerleri tidy’deki işaretiyle; satır yoksa ilgili kod **0**.
 */
export function safiTeknikKzFromRows(
  rows: Iterable<TsbGelirTidyRowLike>,
  donem: string,
  sirketKodu: number,
): number {
  return safiTeknikKzFromLookup(buildGelirTidyDonemLookup(rows, donem), sirketKodu);
}
