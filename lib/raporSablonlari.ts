"use client";

import * as XLSX from "xlsx";

/** Formül hücresi: SheetJS için f (formül, = olmadan) ve v (önceden hesaplanmış değer) */
function formulaCell(formula: string, value: number): XLSX.CellObject {
  return { t: "n", v: value, f: formula };
}

/** Haftalık satış raporu şablonu: örnek veri + Adet*Birim Fiyat, TOPLA, ORTALAMA */
export function buildHaftalikSatisSablonu(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  // Başlık: Tarih, Ürün, Adet, Birim Fiyat, Tutar
  // Örnek 7 satır + özet satırı
  const data: (string | number | XLSX.CellObject)[][] = [
    ["Tarih", "Ürün", "Adet", "Birim Fiyat", "Tutar"],
    ["06.01.2025", "Ürün A", 10, 150, formulaCell("C2*D2", 1500)],
    ["07.01.2025", "Ürün B", 5, 320, formulaCell("C3*D3", 1600)],
    ["08.01.2025", "Ürün A", 8, 150, formulaCell("C4*D4", 1200)],
    ["09.01.2025", "Ürün C", 12, 85, formulaCell("C5*D5", 1020)],
    ["10.01.2025", "Ürün B", 3, 320, formulaCell("C6*D6", 960)],
    ["11.01.2025", "Ürün A", 15, 150, formulaCell("C7*D7", 2250)],
    ["12.01.2025", "Ürün C", 6, 85, formulaCell("C8*D8", 510)],
    [],
    ["Özet", "", "", "Toplam:", formulaCell("SUM(E2:E8)", 9040)],
    ["", "", "", "Ortalama satış:", formulaCell("AVERAGE(E2:E8)", 1291.43)],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Haftalik Satis");
  return wb;
}

/** Stok özeti şablonu: Ürün, Stok, Min Stok, Durum (EĞER) + özet */
export function buildStokOzetiSablonu(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  // Ürün, Stok, Min Stok, Durum (EĞER: Stok<Min ise "Sipariş ver", "Yeterli")
  const data: (string | number | XLSX.CellObject)[][] = [
    ["Ürün", "Stok", "Min Stok", "Durum"],
    ["Ürün A", 45, 30, { t: "s", v: "Yeterli", f: 'IF(B2>=C2,"Yeterli","Siparis ver")' }],
    ["Ürün B", 12, 25, { t: "s", v: "Siparis ver", f: 'IF(B3>=C3,"Yeterli","Siparis ver")' }],
    ["Ürün C", 88, 20, { t: "s", v: "Yeterli", f: 'IF(B4>=C4,"Yeterli","Siparis ver")' }],
    ["Ürün D", 5, 15, { t: "s", v: "Siparis ver", f: 'IF(B5>=C5,"Yeterli","Siparis ver")' }],
    ["Ürün E", 32, 40, { t: "s", v: "Siparis ver", f: 'IF(B6>=C6,"Yeterli","Siparis ver")' }],
    [],
    ["Toplam stok", formulaCell("SUM(B2:B6)", 182), "", ""],
    ["Kritik (Sipariş ver) adedi", { t: "n", v: 2, f: 'COUNTIF(D2:D6,"Siparis ver")' }, "", ""],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Stok Ozeti");
  return wb;
}

/** Performans raporu şablonu: Kişi, Hedef, Gerçekleşen, Oran + özet */
export function buildPerformansSablonu(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const data: (string | number | XLSX.CellObject)[][] = [
    ["Kisi / Ekip", "Hedef", "Gerceklesen", "Oran %"],
    ["Ahmet", 100, 95, formulaCell("IF(B2=0,0,C2/B2*100)", 95)],
    ["Ayse", 100, 110, formulaCell("IF(B3=0,0,C3/B3*100)", 110)],
    ["Mehmet", 80, 72, formulaCell("IF(B4=0,0,C4/B4*100)", 90)],
    ["Fatma", 120, 125, formulaCell("IF(B5=0,0,C5/B5*100)", 104.17)],
    ["Can", 90, 88, formulaCell("IF(B6=0,0,C6/B6*100)", 97.78)],
    [],
    ["Toplam hedef", formulaCell("SUM(B2:B6)", 490), "", ""],
    ["Toplam gerceklesen", formulaCell("SUM(C2:C6)", 490), "", ""],
    ["Ort. oran %", formulaCell("AVERAGE(D2:D6)", 99.39), "", ""],
    ["Hedefi asan kisi sayisi", { t: "n", v: 2, f: 'COUNTIF(D2:D6,">=100")' }, "", ""],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Performans");
  return wb;
}

/** Tüm şablonları tek kitapta birleştirir (Tek tuşla indir) */
export function buildTumSablonlarTekKitap(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const satis = XLSX.utils.aoa_to_sheet([
    ["Tarih", "Urun", "Adet", "Birim Fiyat", "Tutar"],
    ["06.01.2025", "Urun A", 10, 150, formulaCell("C2*D2", 1500)],
    ["07.01.2025", "Urun B", 5, 320, formulaCell("C3*D3", 1600)],
    ["08.01.2025", "Urun A", 8, 150, formulaCell("C4*D4", 1200)],
    ["09.01.2025", "Urun C", 12, 85, formulaCell("C5*D5", 1020)],
    ["10.01.2025", "Urun B", 3, 320, formulaCell("C6*D6", 960)],
    [],
    ["Toplam", "", "", "", formulaCell("SUM(E2:E6)", 6280)],
  ]);
  const stok = XLSX.utils.aoa_to_sheet([
    ["Urun", "Stok", "Min Stok", "Durum"],
    ["Urun A", 45, 30, { t: "s", v: "Yeterli", f: 'IF(B2>=C2,"Yeterli","Siparis ver")' }],
    ["Urun B", 12, 25, { t: "s", v: "Siparis ver", f: 'IF(B3>=C3,"Yeterli","Siparis ver")' }],
    ["Urun C", 88, 20, { t: "s", v: "Yeterli", f: 'IF(B4>=C4,"Yeterli","Siparis ver")' }],
    [],
    ["Toplam stok", formulaCell("SUM(B2:B4)", 145), "", ""],
  ]);
  const perf = XLSX.utils.aoa_to_sheet([
    ["Kisi", "Hedef", "Gerceklesen", "Oran %"],
    ["Ahmet", 100, 95, formulaCell("IF(B2=0,0,C2/B2*100)", 95)],
    ["Ayse", 100, 110, formulaCell("IF(B3=0,0,C3/B3*100)", 110)],
    ["Mehmet", 80, 72, formulaCell("IF(B4=0,0,C4/B4*100)", 90)],
    [],
    ["Ort. oran %", formulaCell("AVERAGE(D2:D4)", 98.33), "", ""],
  ]);
  XLSX.utils.book_append_sheet(wb, satis, "Haftalik Satis");
  XLSX.utils.book_append_sheet(wb, stok, "Stok Ozeti");
  XLSX.utils.book_append_sheet(wb, perf, "Performans");
  return wb;
}
