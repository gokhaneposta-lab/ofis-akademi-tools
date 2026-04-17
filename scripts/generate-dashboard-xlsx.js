/**
 * public/downloads/dashboard-ornegi.xlsx dosyasını üretir.
 * Çalıştır: node scripts/generate-dashboard-xlsx.js
 */
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "downloads");
const outFile = path.join(outDir, "dashboard-ornegi.xlsx");
fs.mkdirSync(outDir, { recursive: true });

const wb = XLSX.utils.book_new();

/* --- Sayfa 1: Veri --- */
const urunler = ["A-100", "A-200", "B-100", "B-200", "C-100"];
const bolgeler = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
const birimFiyat = { "A-100": 3000, "A-200": 3000, "B-100": 1500, "B-200": 1500, "C-100": 2000 };

const veri = [["Tarih", "Ürün", "Bölge", "Adet", "Ciro", "Maliyet", "Kâr"]];
let seed = 42;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
for (let m = 1; m <= 12; m++) {
  const kayit = 8 + Math.floor(rand() * 6);
  for (let i = 0; i < kayit; i++) {
    const gun = Math.floor(rand() * 27) + 1;
    const urn = urunler[Math.floor(rand() * urunler.length)];
    const bol = bolgeler[Math.floor(rand() * bolgeler.length)];
    const adet = Math.floor(rand() * 20) + 3;
    const ciro = adet * birimFiyat[urn];
    const maliyet = Math.round(ciro * (0.55 + rand() * 0.15));
    const kar = ciro - maliyet;
    veri.push([new Date(2026, m - 1, gun), urn, bol, adet, ciro, maliyet, kar]);
  }
}
const wsVeri = XLSX.utils.aoa_to_sheet(veri, { cellDates: true });
wsVeri["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
for (let r = 1; r < veri.length; r++) {
  const ref = XLSX.utils.encode_cell({ c: 0, r });
  if (wsVeri[ref]) wsVeri[ref].z = "yyyy-mm-dd";
}
XLSX.utils.book_append_sheet(wb, wsVeri, "Veri");

/* --- Sayfa 2: KPI kartları --- */
let toplamCiro = 0, toplamMaliyet = 0, toplamAdet = 0;
for (let r = 1; r < veri.length; r++) {
  toplamCiro += veri[r][4];
  toplamMaliyet += veri[r][5];
  toplamAdet += veri[r][3];
}
const toplamKar = toplamCiro - toplamMaliyet;
const marj = toplamKar / toplamCiro;

const kpi = [
  ["Finans Dashboard — KPI kartları (otomatik özet)"],
  [""],
  ["Bu sayfa, 'Veri' sayfasındaki kayıtlardan elle hesaplanmış KPI özetlerini içerir. Veriyi değiştirirseniz formüller otomatik güncellenir."],
  [""],
  ["KPI", "Değer", "Açıklama"],
  ["Toplam Ciro (TL)", { f: "SUM(Veri!E2:E1000)" }, "Veri sayfası E sütunu toplamı"],
  ["Toplam Maliyet (TL)", { f: "SUM(Veri!F2:F1000)" }, "Veri sayfası F sütunu toplamı"],
  ["Toplam Kâr (TL)", { f: "B6-B7" }, "Ciro − Maliyet"],
  ["Kâr Marjı", { f: "B8/B6", z: "0.0%" }, "Toplam Kâr ÷ Toplam Ciro"],
  ["Toplam Adet", { f: "SUM(Veri!D2:D1000)" }, "Veri sayfası D sütunu toplamı"],
  ["Ortalama Birim Fiyat", { f: "B6/B10", z: "#,##0.00" }, "Ciro ÷ Adet"],
  [""],
  ["Önerilen kullanım"],
  ["1) KPI kartlarını bu sayfadaki hücrelerden referans alarak yeni bir 'Dashboard' sayfasında büyük font ile gösterin."],
  ["2) Veriye yeni satır eklerken E:F sütun formülleri 1000. satıra kadar açıktır; daha uzun veri için aralığı genişletin (örn. E2:E10000)."],
  ["3) Kendi KPI'larınızı eklemek için aynı şablonu kullanın: etiket, formül, açıklama."],
];
const wsKpi = XLSX.utils.aoa_to_sheet(kpi);
// Apply formula cells
const applyFormula = (cell, spec) => {
  if (spec && typeof spec === "object" && spec.f) {
    wsKpi[cell] = { t: "n", f: spec.f };
    if (spec.z) wsKpi[cell].z = spec.z;
  }
};
applyFormula("B6", kpi[5][1]);
applyFormula("B7", kpi[6][1]);
applyFormula("B8", kpi[7][1]);
applyFormula("B9", kpi[8][1]);
applyFormula("B10", kpi[9][1]);
applyFormula("B11", kpi[10][1]);
wsKpi["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 44 }];
XLSX.utils.book_append_sheet(wb, wsKpi, "KPI");

/* --- Sayfa 3: Pivot ornek özet (Bölge × Ay) --- */
const aylar = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`);
const ozet = {};
for (let r = 1; r < veri.length; r++) {
  const [tarih, , bol, , ciro] = veri[r];
  const ay = `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, "0")}`;
  ozet[bol] = ozet[bol] || {};
  ozet[bol][ay] = (ozet[bol][ay] || 0) + ciro;
}
const pivot = [
  ["Dashboard — Bölge × Ay özet (Ciro, TL)"],
  [""],
  ["Bu tablo 'Veri' sayfasından elle özetlenmiştir. Kendi Pivot'unuzu Ekle > PivotTable ile kurabilirsiniz."],
  [""],
  ["Bölge \\ Ay", ...aylar, "Toplam"],
];
for (const b of bolgeler) {
  const row = [b];
  let s = 0;
  for (const ay of aylar) {
    const v = (ozet[b] && ozet[b][ay]) || 0;
    row.push(v);
    s += v;
  }
  row.push(s);
  pivot.push(row);
}
const wsPivot = XLSX.utils.aoa_to_sheet(pivot);
wsPivot["!cols"] = [{ wch: 16 }, ...Array(13).fill({ wch: 11 })];
XLSX.utils.book_append_sheet(wb, wsPivot, "Pivot");

/* --- Sayfa 4: Feragat --- */
const feragat = [[
  "FERAGAT — Bu dosya Ofis Akademi tarafından eğitim ve illüstrasyon amacıyla sunulmuştur. Rakamlar hayalidir. Veriler herhangi bir şirketi temsil etmez. Kendi dashboard'unuzda kaynak veriyi doğrulayın; formülleri kurumsal standartlarınıza göre düzenleyin.",
]];
const wsFeragat = XLSX.utils.aoa_to_sheet(feragat);
wsFeragat["!cols"] = [{ wch: 100 }];
XLSX.utils.book_append_sheet(wb, wsFeragat, "Feragat");

const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
fs.writeFileSync(outFile, buf);
console.log("Wrote", outFile);
console.log("Totals — Ciro:", toplamCiro.toLocaleString("tr-TR"), "TL · Kâr:", toplamKar.toLocaleString("tr-TR"), "TL · Marj:", (marj * 100).toFixed(1) + "%");
