import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import {
  V2_HESAP_AGAC,
  dugumEtiket,
  type V2HesapDugum,
} from "../v2/v2GtHesapAgac";
import { appendGtFormatSheets } from "../v2/exportV2GelirTablosu";
import type { GtCocukPay } from "../v2/gtFormatCocukPay";
import { gtOzetOranSatirlari } from "./gtOzetTeknikOranlar";
import {
  gtOzetOranGecmisiExcelSatirlari,
  type GtOzetOranGecmisiBlok,
  type OranGecmisiPaket,
} from "./gtOzetOranGecmisi";

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
  oranGecmisi: GtOzetOranGecmisiBlok[] = [],
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

  // TKZ (son satır) sonrası — teknik oranlar (GT tutarlarından)
  rows.push([], [], []);
  rows.push(["", "", "TEKNİK ORANLAR (GT tutarlarından)", ...AY_ADLARI.map(() => ""), "Yıllık"]);
  for (const { tanim, aylar, yillik } of gtOzetOranSatirlari(gt)) {
    const fmt = (n: number | null) =>
      n == null || !Number.isFinite(n) ? "" : Math.round(n * 1e6) / 1e6;
    rows.push([
      "",
      "",
      `${tanim.ad} — ${tanim.formul}`,
      ...aylar.map(fmt),
      fmt(yillik),
    ]);
  }

  if (oranGecmisi.length > 0) {
    rows.push([], [], []);
    rows.push([
      "",
      "",
      "ORAN GEÇMİŞİ (mizan — şirket Σpay÷Σpayda, GTV8 GT birleştirme)",
      ...AY_ADLARI.map(() => ""),
      "",
    ]);
    rows.push(...gtOzetOranGecmisiExcelSatirlari(oranGecmisi));
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
