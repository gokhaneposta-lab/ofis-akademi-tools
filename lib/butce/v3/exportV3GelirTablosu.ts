import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { appendGtFormatSheets } from "../v2/exportV2GelirTablosu";
import { appendGtOzetSheet } from "../v2/gtOzetExport";
import type { GtCocukPay } from "../v2/gtFormatCocukPay";
import type { GtOzetOranGecmisiBlok, OranGecmisiPaket } from "./gtOzetOranGecmisi";

export type V3ExcelExportOpts = {
  ytdAnchorAy?: number;
  oranGecmisi?: GtOzetOranGecmisiBlok[];
  oranPaket?: OranGecmisiPaket;
};

/** V3 GT export — dashboard GT_Ozet + şirket formatı (Tidy, format_7, Format_Grup). */
export async function downloadV3GelirTablosuExcel(
  gt: GelirTablosuSonuc,
  cocukPay: GtCocukPay = {},
  opts: V3ExcelExportOpts = {},
): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  appendGtOzetSheet(XLSX.utils, workbook, gt, opts.oranGecmisi ?? opts.oranPaket?.sirket ?? []);
  appendGtFormatSheets(XLSX.utils, workbook, gt, cocukPay, {
    format7: opts.oranPaket?.format7,
    formatGrup: opts.oranPaket?.formatGrup,
  });

  const anchor = opts.ytdAnchorAy;
  const anchorEtiket = anchor ? `_YTD${String(anchor).padStart(2, "0")}` : "";
  XLSX.writeFile(
    workbook,
    `Butce_V3_GT_${gt.butceYili}${anchorEtiket}_Sirket_Format.xlsx`,
    { compression: true },
  );
}
