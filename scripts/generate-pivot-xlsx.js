/**
 * public/downloads/pivot-ornegi.xlsx dosyasını üretir.
 * Çalıştır: node scripts/generate-pivot-xlsx.js
 *
 * Not: xlsx (Community) kütüphanesi "canlı" Pivot objesi üretemez.
 * Bu yüzden 'Veri' sayfasına hazır tablo, 'Pivot' sayfasına elle hazırlanmış
 * özet + kısa talimat koyuyoruz. Kullanıcı Ekle > PivotTable ile saniyeler
 * içinde kendi Pivot'unu oluşturabilir.
 */
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "downloads");
const outFile = path.join(outDir, "pivot-ornegi.xlsx");
fs.mkdirSync(outDir, { recursive: true });

const wb = XLSX.utils.book_new();

/* --- Sayfa 1: Veri --- */
const departmanlar = ["Satış", "Pazarlama", "Finans", "Operasyon"];
const urunler = ["A-100", "A-200", "B-100", "B-200"];
const bolgeler = ["İstanbul", "Ankara", "İzmir", "Bursa"];
const birimFiyat = { "A-100": 3000, "A-200": 3000, "B-100": 1500, "B-200": 1500 };

const veri = [["Tarih", "Departman", "Ürün", "Bölge", "Adet", "Ciro"]];

let seed = 42;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

for (let m = 1; m <= 6; m++) {
  for (let i = 0; i < 10; i++) {
    const gun = Math.floor(rand() * 27) + 1;
    const dep = departmanlar[Math.floor(rand() * departmanlar.length)];
    const urn = urunler[Math.floor(rand() * urunler.length)];
    const bol = bolgeler[Math.floor(rand() * bolgeler.length)];
    const adet = Math.floor(rand() * 18) + 3;
    const ciro = adet * birimFiyat[urn];
    const tarih = new Date(2026, m - 1, gun);
    veri.push([tarih, dep, urn, bol, adet, ciro]);
  }
}

const wsVeri = XLSX.utils.aoa_to_sheet(veri, { cellDates: true });
wsVeri["!cols"] = [
  { wch: 12 },
  { wch: 14 },
  { wch: 10 },
  { wch: 12 },
  { wch: 8 },
  { wch: 12 },
];
// Format Tarih sütununu
for (let r = 1; r < veri.length; r++) {
  const ref = XLSX.utils.encode_cell({ c: 0, r });
  if (wsVeri[ref]) wsVeri[ref].z = "yyyy-mm-dd";
}
XLSX.utils.book_append_sheet(wb, wsVeri, "Veri");

/* --- Sayfa 2: Pivot ornek (manuel özet) --- */
// Departman × Ay pivot özeti (Ciro TOPLA)
const ozet = {};
for (let r = 1; r < veri.length; r++) {
  const [tarih, dep, , , , ciro] = veri[r];
  const ay = `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(2, "0")}`;
  ozet[dep] = ozet[dep] || {};
  ozet[dep][ay] = (ozet[dep][ay] || 0) + ciro;
}
const aylar = Array.from({ length: 6 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`);

const pivot = [
  ["Excel Pivot Table — örnek özet (Ciro, TOPLA)"],
  [""],
  ["Bu sayfadaki tablo, 'Veri' sayfasındaki kayıtlardan TOPLA yöntemi ile elle üretilmiştir. Kendi Pivot'unuzu oluşturmak için 'Veri' sayfasına dönün, herhangi bir hücreye tıklayın ve Ekle > PivotTable menüsünü kullanın."],
  [""],
  ["Departman \\ Ay", ...aylar, "Genel Toplam"],
];
let grand = 0;
for (const dep of departmanlar) {
  const row = [dep];
  let rowSum = 0;
  for (const ay of aylar) {
    const v = (ozet[dep] && ozet[dep][ay]) || 0;
    row.push(v);
    rowSum += v;
  }
  row.push(rowSum);
  grand += rowSum;
  pivot.push(row);
}
const genel = ["Genel Toplam"];
for (const ay of aylar) {
  let s = 0;
  for (const dep of departmanlar) s += (ozet[dep] && ozet[dep][ay]) || 0;
  genel.push(s);
}
genel.push(grand);
pivot.push(genel);
pivot.push([""]);
pivot.push(["Kendi Pivot'unuzu hazırlama — hızlı adımlar"]);
pivot.push(["1) 'Veri' sayfasında herhangi bir hücreye tıklayın."]);
pivot.push(["2) Ekle > PivotTable. Aralık otomatik gelir; Tamam deyin."]);
pivot.push(["3) Sağ panel: Satırlar = Departman, Sütunlar = Ürün, Değerler = Ciro (TOPLA)."]);
pivot.push(["4) Analiz > Dilimleyici ile Bölge ve Ay için dilimleyici ekleyin."]);
pivot.push(["5) Tasarım > Alt Toplamlar, Grand Totals ve Rapor Düzeni ile görünümü özelleştirin."]);

const wsPivot = XLSX.utils.aoa_to_sheet(pivot);
wsPivot["!cols"] = [{ wch: 22 }, ...Array(7).fill({ wch: 14 })];
XLSX.utils.book_append_sheet(wb, wsPivot, "Pivot");

/* --- Sayfa 3: Feragat --- */
const feragat = [[
  "FERAGAT — Bu dosya Ofis Akademi tarafından eğitim ve illüstrasyon amacıyla sunulmuştur. Rakamlar hayalidir. Veriler herhangi bir şirketi temsil etmez. Kendi analizinizde kaynak veriyi doğrulayın ve Pivot yapılarını kurumsal şablonlarınıza uyarlayın.",
]];
const wsFeragat = XLSX.utils.aoa_to_sheet(feragat);
wsFeragat["!cols"] = [{ wch: 100 }];
XLSX.utils.book_append_sheet(wb, wsFeragat, "Feragat");

const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
fs.writeFileSync(outFile, buf);
console.log("Wrote", outFile);
