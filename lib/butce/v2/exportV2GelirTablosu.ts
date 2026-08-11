import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import {
  FORMAT7_SATIRLAR,
  FORMAT_GRUP_SATIRLAR,
  GRUP_SIRA,
  bransGrubu,
  buildGtFormatTidy,
  yilToplamByBrans,
} from "./buildGtFormatGrid";
import type { GtCocukPay } from "./gtFormatCocukPay";

function aktifBransKodlari(gt: GelirTablosuSonuc): string[] {
  return gt.branslar.filter((b) => /^7\d{2}$/.test(b.bransKodu)).map((b) => b.bransKodu);
}

/** V2 GT — şirket formatı: tidy (ay × branş × hesap) + format_7 + Format_Grup. */
export async function downloadV2GelirTablosuExcel(
  gt: GelirTablosuSonuc,
  cocukPay: GtCocukPay = {},
): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const tidy = buildGtFormatTidy(gt, cocukPay);
  const yil = yilToplamByBrans(tidy);
  const branslar = aktifBransKodlari(gt);

  const uzun: Array<Array<string | number>> = [
    [
      "Bütçe Yılı", "Ay No", "Ay", "Branş Kodu", "Branş Adı", "Grup",
      "GT Kod", "Hesap", "Branş Hesap", "Hesap Adı", "Tutar",
    ],
  ];
  for (const r of tidy) {
    uzun.push([
      r.yil, r.ay, r.ayAd, r.bransKodu, r.bransAdi, r.grup,
      r.gtKod, r.hesapKodu, r.bransHesap, r.hesapAdi, r.tutar,
    ]);
  }
  const uzunSheet = XLSX.utils.aoa_to_sheet(uzun);
  uzunSheet["!cols"] = [
    { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 24 }, { wch: 18 },
    { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 52 }, { wch: 16 },
  ];
  uzunSheet["!autofilter"] = { ref: `A1:K${uzun.length}` };
  XLSX.utils.book_append_sheet(workbook, uzunSheet, "Tidy_Aylik");

  const f7: Array<Array<string | number>> = [
    [
      "Branş Hesap", "HESAP KODU", "HESAP ADI", "TOPLAM",
      ...branslar.map((k) => Number(k) || k),
    ],
  ];
  FORMAT7_SATIRLAR.forEach((satir, idx) => {
    const cols = branslar.map((k) => yil.get(k)?.get(idx) ?? 0);
    const toplam = cols.reduce((a, b) => a + b, 0);
    f7.push([satir.gtKod, satir.hesapKodu, satir.hesapAdi, toplam, ...cols]);
  });
  const f7Sheet = XLSX.utils.aoa_to_sheet(f7);
  f7Sheet["!cols"] = [
    { wch: 12 }, { wch: 12 }, { wch: 52 }, { wch: 16 },
    ...branslar.map(() => ({ wch: 14 })),
  ];
  f7Sheet["!autofilter"] = {
    ref: `A1:${XLSX.utils.encode_col(branslar.length + 3)}${f7.length}`,
  };
  XLSX.utils.book_append_sheet(workbook, f7Sheet, "format_7");

  const grupKolon = GRUP_SIRA;
  const grupToplam = new Map<string, number[]>();
  for (const g of grupKolon) grupToplam.set(g, FORMAT7_SATIRLAR.map(() => 0));
  for (const kod of branslar) {
    const g = bransGrubu(kod);
    const acc = grupToplam.get(g) ?? FORMAT7_SATIRLAR.map(() => 0);
    const byIdx = yil.get(kod);
    if (byIdx) {
      for (const [idx, v] of byIdx) acc[idx] = (acc[idx] ?? 0) + v;
    }
    grupToplam.set(g, acc);
  }

  const hesapToIdx = new Map<string, number>();
  FORMAT7_SATIRLAR.forEach((s, i) => {
    if (s.hesapKodu && !hesapToIdx.has(s.hesapKodu)) hesapToIdx.set(s.hesapKodu, i);
  });

  const fg: Array<Array<string | number>> = [
    ["HESAP KODU", "HESAP ADI", "TOPLAM", ...grupKolon],
  ];
  for (const satir of FORMAT_GRUP_SATIRLAR) {
    const idx = satir.hesapKodu ? hesapToIdx.get(satir.hesapKodu) : undefined;
    const grupVals = grupKolon.map((g) => (idx == null ? 0 : grupToplam.get(g)?.[idx] ?? 0));
    const toplam = grupVals.reduce((a, b) => a + b, 0);
    fg.push([satir.hesapKodu, satir.hesapAdi, toplam, ...grupVals]);
  }
  const fgSheet = XLSX.utils.aoa_to_sheet(fg);
  fgSheet["!cols"] = [
    { wch: 12 }, { wch: 62 }, { wch: 16 },
    ...grupKolon.map(() => ({ wch: 16 })),
  ];
  fgSheet["!autofilter"] = {
    ref: `A1:${XLSX.utils.encode_col(grupKolon.length + 2)}${fg.length}`,
  };
  XLSX.utils.book_append_sheet(workbook, fgSheet, "Format_Grup");

  XLSX.writeFile(workbook, `Butce_V2_GT_${gt.butceYili}_Sirket_Format.xlsx`, {
    compression: true,
  });
}
