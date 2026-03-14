"use client";

import * as XLSX from "xlsx";

const MIN_ROWS = 40;

/** Formül hücresi: SheetJS için f (formül, = olmadan) ve v (önceden hesaplanmış değer) */
function formulaCell(formula: string, value: number): XLSX.CellObject {
  return { t: "n", v: value, f: formula };
}

/** Haftalık satış raporu şablonu: en az 40 satır örnek veri + Adet*Birim Fiyat, TOPLA, ORTALAMA */
export function buildHaftalikSatisSablonu(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const urunler = ["Ürün A", "Ürün B", "Ürün C", "Ürün D", "Ürün E"];
  const birimFiyatlar: Record<string, number> = { "Ürün A": 150, "Ürün B": 320, "Ürün C": 85, "Ürün D": 210, "Ürün E": 95 };
  const data: (string | number | XLSX.CellObject)[][] = [
    ["Tarih", "Ürün", "Adet", "Birim Fiyat", "Tutar"],
  ];
  const startDate = new Date(2025, 0, 6); // 06.01.2025
  let toplamTutar = 0;
  for (let i = 0; i < MIN_ROWS; i++) {
    const row = i + 2;
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const tarihStr = date.getDate().toString().padStart(2, "0") + "." + (date.getMonth() + 1).toString().padStart(2, "0") + "." + date.getFullYear();
    const urun = urunler[i % urunler.length];
    const adet = 3 + (i % 18);
    const birimFiyat = birimFiyatlar[urun];
    const tutar = adet * birimFiyat;
    toplamTutar += tutar;
    data.push([
      tarihStr,
      urun,
      adet,
      birimFiyat,
      formulaCell(`C${row}*D${row}`, tutar),
    ]);
  }
  data.push([]);
  data.push(["Özet", "", "", "Toplam:", formulaCell(`SUM(E2:E${MIN_ROWS + 1})`, toplamTutar)]);
  data.push(["", "", "", "Ortalama satış:", formulaCell(`AVERAGE(E2:E${MIN_ROWS + 1})`, toplamTutar / MIN_ROWS)]);
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Haftalik Satis");
  return wb;
}

/** Stok özeti şablonu: en az 40 satır Ürün, Stok, Min Stok, Durum (EĞER) + özet */
export function buildStokOzetiSablonu(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const data: (string | number | XLSX.CellObject)[][] = [
    ["Ürün", "Stok", "Min Stok", "Durum"],
  ];
  let toplamStok = 0;
  let kritikCount = 0;
  for (let i = 0; i < MIN_ROWS; i++) {
    const row = i + 2;
    const stok = 5 + (i * 3) % 90;
    const minStok = 15 + (i * 2) % 45;
    const durum = stok >= minStok ? "Yeterli" : "Sipariş ver";
    if (durum === "Sipariş ver") kritikCount++;
    toplamStok += stok;
    data.push([
      `Ürün ${i + 1}`,
      stok,
      minStok,
      { t: "s", v: durum, f: `IF(B${row}>=C${row},"Yeterli","Siparis ver")` },
    ]);
  }
  data.push([]);
  data.push(["Toplam stok", formulaCell(`SUM(B2:B${MIN_ROWS + 1})`, toplamStok), "", ""]);
  data.push(["Kritik (Sipariş ver) adedi", { t: "n", v: kritikCount, f: `COUNTIF(D2:D${MIN_ROWS + 1},"Siparis ver")` }, "", ""]);
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Stok Ozeti");
  return wb;
}

/** Performans raporu şablonu: en az 40 satır Kişi, Hedef, Gerçekleşen, Oran + özet */
const PERFORMANS_ISIMLER = [
  "Ahmet", "Ayşe", "Mehmet", "Fatma", "Can", "Ali", "Zeynep", "Mustafa", "Elif", "Emre",
  "Deniz", "Selin", "Burak", "Ceren", "Efe", "Melis", "Kaan", "Defne", "Arda", "Ece",
  "Mert", "Asya", "Barış", "Dilara", "Onur", "Pınar", "Serkan", "Yasemin", "Volkan", "Burcu",
  "Cem", "Gamze", "Berk", "Seda", "Koray", "Tuğçe", "Oğuz", "Leyla", "Oğun", "İrem",
];

export function buildPerformansSablonu(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const data: (string | number | XLSX.CellObject)[][] = [
    ["Kisi / Ekip", "Hedef", "Gerceklesen", "Oran %"],
  ];
  let toplamHedef = 0;
  let toplamGerceklesen = 0;
  const oranlar: number[] = [];
  for (let i = 0; i < MIN_ROWS; i++) {
    const row = i + 2;
    const isim = PERFORMANS_ISIMLER[i] ?? `Kisi ${i + 1}`;
    const hedef = 70 + (i * 7) % 61;
    const gerceklesen = Math.round(hedef * (0.85 + (i % 25) / 100));
    const oran = hedef === 0 ? 0 : (gerceklesen / hedef) * 100;
    toplamHedef += hedef;
    toplamGerceklesen += gerceklesen;
    oranlar.push(oran);
    data.push([
      isim,
      hedef,
      gerceklesen,
      formulaCell(`IF(B${row}=0,0,C${row}/B${row}*100)`, oran),
    ]);
  }
  const ortOran = oranlar.reduce((a, b) => a + b, 0) / oranlar.length;
  const hedefiAsan = oranlar.filter((o) => o >= 100).length;
  data.push([]);
  data.push(["Toplam hedef", formulaCell(`SUM(B2:B${MIN_ROWS + 1})`, toplamHedef), "", ""]);
  data.push(["Toplam gerceklesen", formulaCell(`SUM(C2:C${MIN_ROWS + 1})`, toplamGerceklesen), "", ""]);
  data.push(["Ort. oran %", formulaCell(`AVERAGE(D2:D${MIN_ROWS + 1})`, ortOran), "", ""]);
  data.push(["Hedefi asan kisi sayisi", { t: "n", v: hedefiAsan, f: `COUNTIF(D2:D${MIN_ROWS + 1},">=100")` }, "", ""]);
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Performans");
  return wb;
}

/** Tüm şablonları tek kitapta birleştirir (en az 40 satır örnek her sayfada) */
export function buildTumSablonlarTekKitap(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const urunler = ["Urun A", "Urun B", "Urun C", "Urun D", "Urun E"];
  const birimFiyatlar: Record<string, number> = { "Urun A": 150, "Urun B": 320, "Urun C": 85, "Urun D": 210, "Urun E": 95 };
  const satisData: (string | number | XLSX.CellObject)[][] = [
    ["Tarih", "Urun", "Adet", "Birim Fiyat", "Tutar"],
  ];
  const startDate = new Date(2025, 0, 6);
  let toplamTutar = 0;
  for (let i = 0; i < MIN_ROWS; i++) {
    const row = i + 2;
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const tarihStr = date.getDate().toString().padStart(2, "0") + "." + (date.getMonth() + 1).toString().padStart(2, "0") + "." + date.getFullYear();
    const urun = urunler[i % urunler.length];
    const adet = 3 + (i % 18);
    const birimFiyat = birimFiyatlar[urun];
    const tutar = adet * birimFiyat;
    toplamTutar += tutar;
    satisData.push([tarihStr, urun, adet, birimFiyat, formulaCell(`C${row}*D${row}`, tutar)]);
  }
  satisData.push([]);
  satisData.push(["Toplam", "", "", "", formulaCell(`SUM(E2:E${MIN_ROWS + 1})`, toplamTutar)]);
  const satis = XLSX.utils.aoa_to_sheet(satisData);

  const stokData: (string | number | XLSX.CellObject)[][] = [["Urun", "Stok", "Min Stok", "Durum"]];
  let toplamStok = 0;
  let kritikCount = 0;
  for (let i = 0; i < MIN_ROWS; i++) {
    const row = i + 2;
    const stok = 5 + (i * 3) % 90;
    const minStok = 15 + (i * 2) % 45;
    const durum = stok >= minStok ? "Yeterli" : "Siparis ver";
    if (durum === "Siparis ver") kritikCount++;
    toplamStok += stok;
    stokData.push([
      `Urun ${i + 1}`,
      stok,
      minStok,
      { t: "s", v: durum, f: `IF(B${row}>=C${row},"Yeterli","Siparis ver")` },
    ]);
  }
  stokData.push([]);
  stokData.push(["Toplam stok", formulaCell(`SUM(B2:B${MIN_ROWS + 1})`, toplamStok), "", ""]);
  stokData.push(["Kritik adedi", { t: "n", v: kritikCount, f: `COUNTIF(D2:D${MIN_ROWS + 1},"Siparis ver")` }, "", ""]);
  const stok = XLSX.utils.aoa_to_sheet(stokData);

  const perfData: (string | number | XLSX.CellObject)[][] = [["Kisi", "Hedef", "Gerceklesen", "Oran %"]];
  const oranlar: number[] = [];
  for (let i = 0; i < MIN_ROWS; i++) {
    const row = i + 2;
    const isim = PERFORMANS_ISIMLER[i] ?? `Kisi ${i + 1}`;
    const hedef = 70 + (i * 7) % 61;
    const gerceklesen = Math.round(hedef * (0.85 + (i % 25) / 100));
    const oran = hedef === 0 ? 0 : (gerceklesen / hedef) * 100;
    oranlar.push(oran);
    perfData.push([isim, hedef, gerceklesen, formulaCell(`IF(B${row}=0,0,C${row}/B${row}*100)`, oran)]);
  }
  const ortOran = oranlar.reduce((a, b) => a + b, 0) / oranlar.length;
  perfData.push([]);
  perfData.push(["Ort. oran %", formulaCell(`AVERAGE(D2:D${MIN_ROWS + 1})`, ortOran), "", ""]);
  const perf = XLSX.utils.aoa_to_sheet(perfData);

  XLSX.utils.book_append_sheet(wb, satis, "Haftalik Satis");
  XLSX.utils.book_append_sheet(wb, stok, "Stok Ozeti");
  XLSX.utils.book_append_sheet(wb, perf, "Performans");
  return wb;
}
