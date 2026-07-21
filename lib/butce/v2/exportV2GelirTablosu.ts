import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";

const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
] as const;

function gorunenSatirlar(gt: GelirTablosuSonuc) {
  return gt.satirlar.filter((satir) => !satir.gizli);
}

function aktifBranslar(gt: GelirTablosuSonuc) {
  return gt.branslar.filter((brans) => /^7\d{2}$/.test(brans.bransKodu));
}

/** V2 GT'yi ay × 7xx branş bazında, pivot-dostu ve aylık matris sayfalarıyla indirir. */
export async function downloadV2GelirTablosuExcel(gt: GelirTablosuSonuc): Promise<void> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const satirlar = gorunenSatirlar(gt);
  const branslar = aktifBranslar(gt);

  const uzun: Array<Array<string | number>> = [
    ["Bütçe Yılı", "Ay No", "Ay", "Branş Kodu", "Branş Adı", "Satır", "Kalem", "Tutar"],
  ];
  for (let ay = 0; ay < 12; ay++) {
    for (const brans of branslar) {
      const aylik = gt.aylikBrans[brans.bransKodu] ?? {};
      for (const satir of satirlar) {
        uzun.push([
          gt.butceYili,
          ay + 1,
          AY_ADLARI[ay]!,
          brans.bransKodu,
          brans.bransAdi,
          satir.kod ?? `F${satir.satir}`,
          satir.ad,
          aylik[satir.satir]?.[ay] ?? 0,
        ]);
      }
    }
  }
  const uzunSheet = XLSX.utils.aoa_to_sheet(uzun);
  uzunSheet["!cols"] = [
    { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 12 },
    { wch: 28 }, { wch: 10 }, { wch: 42 }, { wch: 18 },
  ];
  uzunSheet["!autofilter"] = { ref: `A1:H${uzun.length}` };
  XLSX.utils.book_append_sheet(workbook, uzunSheet, "Aylik_Brans_Uzun");

  for (let ay = 0; ay < 12; ay++) {
    const matris: Array<Array<string | number>> = [
      [
        "Satır",
        "Kalem",
        ...branslar.map((brans) => `${brans.bransKodu} ${brans.bransAdi}`),
        "Şirket Toplam",
      ],
    ];
    for (const satir of satirlar) {
      matris.push([
        satir.kod ?? `F${satir.satir}`,
        satir.ad,
        ...branslar.map(
          (brans) => gt.aylikBrans[brans.bransKodu]?.[satir.satir]?.[ay] ?? 0,
        ),
        gt.aylikToplam[satir.satir]?.[ay] ?? 0,
      ]);
    }
    const sheet = XLSX.utils.aoa_to_sheet(matris);
    sheet["!cols"] = [
      { wch: 10 },
      { wch: 42 },
      ...branslar.map(() => ({ wch: 18 })),
      { wch: 18 },
    ];
    sheet["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(branslar.length + 2)}${matris.length}` };
    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      `${String(ay + 1).padStart(2, "0")}_${AY_ADLARI[ay]}`.slice(0, 31),
    );
  }

  XLSX.writeFile(workbook, `Butce_V2_GT_${gt.butceYili}_Aylik_Brans.xlsx`, {
    compression: true,
  });
}
