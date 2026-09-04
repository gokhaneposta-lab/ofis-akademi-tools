import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import {
  V2_HESAP_AGAC,
  dugumEtiket,
  type V2HesapDugum,
} from "../v2/v2GtHesapAgac";
import { appendGtFormatSheets } from "../v2/exportV2GelirTablosu";
import type { GtCocukPay } from "../v2/gtFormatCocukPay";

const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;

function flattenAgac(nodes: V2HesapDugum[]): V2HesapDugum[] {
  const out: V2HesapDugum[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flattenAgac(n.children));
  }
  return out;
}

/** Dashboard GT tablosu ile birebir: F satır × 12 ay + yıllık. */
function appendGtOzetSheet(
  utils: typeof import("xlsx").utils,
  workbook: import("xlsx").WorkBook,
  gt: GelirTablosuSonuc,
): void {
  const header: Array<string | number> = [
    "F Satır",
    "Hesap",
    "Kalem",
    ...AY_ADLARI,
    "Yıllık",
  ];
  const rows: Array<Array<string | number>> = [header];

  for (const node of flattenAgac(V2_HESAP_AGAC)) {
    const ser = gt.aylikToplam[node.satir] ?? Array(12).fill(0);
    const yillik = ser.reduce((a, x) => a + x, 0);
    rows.push([node.satir, node.hesap ?? "", dugumEtiket(node), ...ser, yillik]);
  }

  const sheet = utils.aoa_to_sheet(rows);
  sheet["!cols"] = [
    { wch: 8 },
    { wch: 10 },
    { wch: 48 },
    ...AY_ADLARI.map(() => ({ wch: 14 })),
    { wch: 16 },
  ];
  sheet["!autofilter"] = {
    ref: `A1:${utils.encode_col(header.length - 1)}${rows.length}`,
  };
  utils.book_append_sheet(workbook, sheet, "GT_Ozet");
}

export type V3ExcelExportOpts = {
  ytdAnchorAy?: number;
};

/** V3 GT export — dashboard GT_Ozet + şirket formatı (Tidy, format_7, Format_Grup). */
export async function downloadV3GelirTablosuExcel(
  gt: GelirTablosuSonuc,
  cocukPay: GtCocukPay = {},
  opts: V3ExcelExportOpts = {},
): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  appendGtOzetSheet(XLSX.utils, workbook, gt);
  appendGtFormatSheets(XLSX.utils, workbook, gt, cocukPay);

  const anchor = opts.ytdAnchorAy;
  const anchorEtiket = anchor ? `_YTD${String(anchor).padStart(2, "0")}` : "";
  XLSX.writeFile(
    workbook,
    `Butce_V3_GT_${gt.butceYili}${anchorEtiket}_Sirket_Format.xlsx`,
    { compression: true },
  );
}
