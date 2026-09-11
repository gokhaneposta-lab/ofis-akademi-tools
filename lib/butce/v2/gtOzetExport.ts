import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { KPK_STOK_SEVIYE_SATIRLARI, kpkStokYtd } from "../kpk/kpkMotoru";
import { gtOzetOranSatirlari } from "../v3/gtOzetTeknikOranlar";
import {
  gtOzetOranGecmisiExcelSatirlari,
  type GtOzetOranGecmisiBlok,
} from "../v3/gtOzetOranGecmisi";
import { V2_HESAP_AGAC, dugumEtiket, type V2HesapDugum } from "./v2GtHesapAgac";

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

/** Dashboard GT tablosu ile birebir: F satır × 12 ay + yıllık (9001 Teknik gelir …). */
export function appendGtOzetSheet(
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

  const kpkStokSeviye = new Set<number>(KPK_STOK_SEVIYE_SATIRLARI as unknown as number[]);
  for (const node of flattenAgac(V2_HESAP_AGAC)) {
    const ser = gt.aylikToplam[node.satir] ?? Array(12).fill(0);
    const yillik = kpkStokSeviye.has(node.satir)
      ? kpkStokYtd(ser, 12)
      : ser.reduce((a, x) => a + x, 0);
    rows.push([node.satir, node.hesap ?? "", dugumEtiket(node), ...ser, yillik]);
  }

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
