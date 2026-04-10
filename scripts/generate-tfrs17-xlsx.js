/**
 * public/downloads/tfrs-17-ornek-model.xlsx dosyasını üretir.
 * Çalıştır: node scripts/generate-tfrs17-xlsx.js
 */
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "downloads");
const outFile = path.join(outDir, "tfrs-17-ornek-model.xlsx");

fs.mkdirSync(outDir, { recursive: true });

const wb = XLSX.utils.book_new();

/* --- Sayfa 1: Basit örnek --- */
const basit = [
  ["TFRS 17 — Eğitim amaçlı basit örnek (Ofis Akademi)"],
  [""],
  ["Alan", "Tutar (TL)", "Not"],
  ["Prim (örnek)", 1200, "Hayali; tek risk dönemi"],
  ["Beklenen maliyet (özet)", 960, "Hasar/yükleme vb. tek satırda basitleştirilmiş"],
  ["Başlangıç CSM (beklenen kâr)", null, "Formül: Prim − Beklenen maliyet"],
  ["Hizmet süresi (ay)", 12, "Eşit itfa varsayımı; gerçek TFRS 17 kapsam birimi kullanır"],
  ["Aylık CSM itfası (özet)", null, "Formül: Başlangıç CSM ÷ Ay sayısı"],
  [""],
  ["Ay", "Dönem itfası (TL)", "Kalan CSM dönem sonu (TL)"],
];
let kalan = 240;
for (let ay = 1; ay <= 12; ay++) {
  kalan -= 20;
  basit.push([ay, 20, kalan]);
}
basit.push([""]);
basit.push([
  "Özet",
  "",
  "240 TL beklenen kâr tek seferde gelir yazılmaz; bu örnekte ayda 20 TL olacak şekilde 12 aya yayılır (bilinçli sadeleştirme).",
]);

const ws1 = XLSX.utils.aoa_to_sheet(basit);
ws1["B6"] = { f: "B4-B5", t: "n" };
ws1["B8"] = { f: "B6/B7", t: "n" };
ws1["!cols"] = [{ wch: 28 }, { wch: 14 }, { wch: 52 }];

XLSX.utils.book_append_sheet(wb, ws1, "Basit ornek");

/* --- Sayfa 2: KPI şablonu --- */
const kpi = [
  ["TFRS 17 — KPI takip şablonu (manuel doldurun)"],
  [""],
  ["Bu satırlar şirketinizin raporlama tanımlarına göre doldurulmalıdır. Dosya eğitim amaçlıdır."],
  [""],
  ["Dönem", "CSM dönem başı", "İtfa", "Düzeltme / unlocking (±)", "CSM dönem sonu", "Hizmet sonucu (not)", "Zarar bileşeni (not)"],
  ["Örnek: Q1", "", "", "", "", "", ""],
  ["Örnek: Q2", "", "", "", "", "", ""],
  ["Örnek: Q3", "", "", "", "", "", ""],
  ["Örnek: Q4", "", "", "", "", "", ""],
  [""],
  ["İsteğe bağlı satırlar ekleyebilirsiniz."],
];

const ws2 = XLSX.utils.aoa_to_sheet(kpi);
ws2["!cols"] = [
  { wch: 14 },
  { wch: 16 },
  { wch: 10 },
  { wch: 26 },
  { wch: 16 },
  { wch: 24 },
  { wch: 22 },
];
XLSX.utils.book_append_sheet(wb, ws2, "KPI sablonu");

/* --- Sayfa 3: Feragat --- */
const feragat = [
  [
    "FERAGAT — Bu Excel dosyası Ofis Akademi tarafından eğitim ve illüstrasyon amacıyla sunulmuştur. TMS/TFRS, KGK düzenlemeleri veya şirketinizin muhasebe ve aktüerya politikalarının yerine geçmez. Gösterilen rakamlar hayalidir; gerçek CSM/LRC/LIC ölçümü iskonto, kapsam birimleri, ölçüm modeli (BBA/GM/VFA), zarar bileşeni ve yenileme gibi unsurları kapsar. Profesyonel danışmanlık alınız.",
  ],
];

const ws3 = XLSX.utils.aoa_to_sheet(feragat);
ws3["!cols"] = [{ wch: 100 }];
XLSX.utils.book_append_sheet(wb, ws3, "Feragat");

const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
fs.writeFileSync(outFile, buf);
console.log("Wrote", outFile);
