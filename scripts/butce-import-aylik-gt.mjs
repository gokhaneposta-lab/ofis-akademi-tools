/**
 * "Aylık GT ve Bilanço.xlsx" → aylık branş GT + bilanço tidy JSON üretir.
 *
 * Dosya tek sayfa (Sayfa1), kolonlar: DÖNEM (Excel seri tarih) | G1 (Sigorta/Emeklilik)
 *   | HESAP NO | HESAP ADI | NET (yıl içi kümülatif).
 * HESAP NO 7xx ise branşlı GT (ilk 3 hane = branş, kalanı = GT satır kodu, örn 7010111 = 701·0111).
 * Diğer ön ekler (1/2/3/4/5/6/9) = bilanço + şirket geneli muhasebe (branşsız).
 *
 * Üretilenler (data/butce/private/ ve/veya Blob):
 *   - mizan-aylik-tidy.json   : aylık dağılım motoru için odak (brüt/direkt/endirekt prim) — küçük
 *   - mizan-aylik-full.json   : tüm branş GT kodları (ileride granül ihtiyaçlar)
 *   - bilanco-aylik-tidy.json : bilanço + şirket muhasebe (ileride bilanço adımı)
 *   - meta.json               : mizanAylik alanları merge edilir
 *
 * Kullanım:
 *   node scripts/butce-import-aylik-gt.mjs ["C:/.../Aylık GT ve Bilanço.xlsx"] [butceYili]
 * Blob'a da yazmak için BLOB_READ_WRITE_TOKEN ortam değişkenini geçin:
 *   $env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."; node scripts/butce-import-aylik-gt.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";
import { reconstructMizanFromGt } from "./butce-gt-bridge.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRIVATE = join(__dirname, "..", "data", "butce", "private");
const BLOB_PREFIX = "butce-private/";

const DEFAULT_XLSX = "C:/Users/g.yildirim/Desktop/Aylık GT ve Bilanço.xlsx";
const SIRKET = "Sigorta";
/** Aylık dağılım için odak kodlar: brüt / direkt / endirekt yazılan prim. */
const PRIM_KODLAR = new Set(["0111", "01111", "01112"]);

function serialYM(serial) {
  const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
  return [d.getUTCFullYear(), d.getUTCMonth() + 1];
}

function isLeafBrans(b) {
  return /^\d{3}$/.test(b) && b[0] === "7";
}

/**
 * Kümülatif (ay → değer) haritasını yıl içi aylık artışa çevirir.
 * Eksik aylar atlanır; son bilinen kümülatif taşınır (Şubat varsa Ocak yoksa
 * Şubat = Şubat kümülatif, mantıklı toplam korunur).
 */
function decumulate(monthMap) {
  const out = [];
  let lastCum = 0;
  for (let m = 1; m <= 12; m++) {
    if (!monthMap.has(m)) continue;
    const cum = monthMap.get(m);
    out.push([m, cum - lastCum]);
    lastCum = cum;
  }
  return out;
}

function importAylikGt(excelPath, butceYili) {
  if (!existsSync(excelPath)) throw new Error(`Excel bulunamadı: ${excelPath}`);
  console.log(`Okunuyor: ${excelPath}`);
  const wb = XLSX.readFile(excelPath, { cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  // Gruplar: key -> Map(year -> Map(month -> cumValue))
  const gtGroups = new Map(); // `${brans}|${kod}`
  const bilGroups = new Map(); // `${hesap}`
  const adMap = new Map(); // kod/hesap -> ad (referans)
  let satirOk = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r[1] !== SIRKET) continue;
    const serial = Number(r[0]);
    if (!Number.isFinite(serial)) continue;
    const hn = String(r[2] ?? "").trim();
    if (!hn) continue;
    const tutar = Number(r[4]) || 0;
    const [yil, ay] = serialYM(serial);
    if (ay < 1 || ay > 12) continue;
    satirOk++;

    if (hn[0] === "7") {
      const brans = hn.slice(0, 3);
      if (!isLeafBrans(brans)) continue; // rollup (7,70..) atla — çift sayım
      const kod = hn.slice(3);
      const key = `${brans}|${kod}`;
      if (!adMap.has(`gt:${kod}`)) adMap.set(`gt:${kod}`, String(r[3] ?? ""));
      let byYear = gtGroups.get(key);
      if (!byYear) gtGroups.set(key, (byYear = new Map()));
      let byMonth = byYear.get(yil);
      if (!byMonth) byYear.set(yil, (byMonth = new Map()));
      byMonth.set(ay, tutar);
    } else {
      const key = hn;
      if (!adMap.has(`bil:${hn}`)) adMap.set(`bil:${hn}`, String(r[3] ?? ""));
      let byYear = bilGroups.get(key);
      if (!byYear) bilGroups.set(key, (byYear = new Map()));
      let byMonth = byYear.get(yil);
      if (!byMonth) byYear.set(yil, (byMonth = new Map()));
      byMonth.set(ay, tutar);
    }
  }

  // GT tidy üret
  const gtFull = [];
  const gtPrim = [];
  for (const [key, byYear] of gtGroups) {
    const [brans, kod] = key.split("|");
    for (const [yil, byMonth] of byYear) {
      for (const [ay, tutar] of decumulate(byMonth)) {
        const row = { yil, ay, hesap: kod, bransKodu: brans, tutar };
        gtFull.push(row);
        if (PRIM_KODLAR.has(kod)) gtPrim.push(row);
      }
    }
  }

  // Bilanço tidy üret
  const bil = [];
  for (const [hesap, byYear] of bilGroups) {
    for (const [yil, byMonth] of byYear) {
      for (const [ay, tutar] of decumulate(byMonth)) {
        bil.push({ yil, ay, hesap, tutar });
      }
    }
  }

  const yillar = [...new Set(gtFull.map((r) => r.yil))].sort((a, b) => a - b);
  return {
    gtFull,
    gtPrim,
    bil,
    yillar,
    satirOk,
    bransSayisi: new Set(gtFull.map((r) => r.bransKodu)).size,
  };
}

function mergeMeta(res, mizan, butceYili) {
  let meta = {};
  const p = join(PRIVATE, "meta.json");
  if (existsSync(p)) {
    try {
      meta = JSON.parse(readFileSync(p, "utf8"));
    } catch {
      meta = {};
    }
  }
  meta.schemaVersion = 2;
  if (butceYili) meta.butceYili = butceYili;
  else if (!meta.butceYili) meta.butceYili = 2027;
  const now = new Date().toISOString();
  // Yıl-sonu mizan (GT'den köprüyle sentezlendi)
  meta.mizanGuncellemeIso = now;
  meta.mizanKaynak = "aylik-gt-koprusu";
  meta.mizanSatirSayisi = mizan.rows.length;
  meta.mizanYilMin = mizan.yillar[0];
  meta.mizanYilMax = mizan.yillar[mizan.yillar.length - 1];
  // Aylık GT
  meta.mizanAylikGuncellemeIso = now;
  meta.mizanAylikSatirSayisi = res.gtPrim.length;
  meta.mizanAylikFullSatirSayisi = res.gtFull.length;
  meta.mizanAylikYilMin = res.yillar[0];
  meta.mizanAylikYilMax = res.yillar[res.yillar.length - 1];
  meta.bilancoAylikSatirSayisi = res.bil.length;
  return meta;
}

async function writeAll(outputs) {
  mkdirSync(PRIVATE, { recursive: true });
  for (const [name, data] of outputs) {
    const content = typeof data === "string" ? data : JSON.stringify(data);
    writeFileSync(join(PRIVATE, name), content, "utf8");
    console.log(`  yerel: data/butce/private/${name} (${(content.length / 1e6).toFixed(2)} MB)`);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    console.log("\nBlob atlandı (BLOB_READ_WRITE_TOKEN yok). Canlıya yazmak için:");
    console.log('  $env:BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."; npm run butce:import-aylik-gt');
    return;
  }
  const { put } = await import("@vercel/blob");
  for (const [name, data] of outputs) {
    const content = typeof data === "string" ? data : JSON.stringify(data);
    await put(`${BLOB_PREFIX}${name}`, content, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token,
    });
    console.log(`  blob: ${BLOB_PREFIX}${name}`);
  }
}

async function main() {
  const excelPath = process.argv[2] ?? DEFAULT_XLSX;
  const butceYili = process.argv[3] ? parseInt(process.argv[3], 10) : null;

  const res = importAylikGt(excelPath, butceYili);
  const mizan = reconstructMizanFromGt(excelPath); // yıl-sonu muhasebe-kodlu mizan
  const meta = mergeMeta(res, mizan, butceYili);

  console.log(
    `\nİşlendi: ${res.satirOk.toLocaleString("tr-TR")} Sigorta satırı | ` +
      `branş ${res.bransSayisi} | yıl ${res.yillar[0]}–${res.yillar[res.yillar.length - 1]}`,
  );
  console.log(
    `Tidy: yıl-sonu mizan ${mizan.rows.length.toLocaleString("tr-TR")} | ` +
      `prim ${res.gtPrim.length.toLocaleString("tr-TR")} | ` +
      `GT full ${res.gtFull.length.toLocaleString("tr-TR")} | ` +
      `bilanço ${res.bil.length.toLocaleString("tr-TR")} satır`,
  );

  await writeAll([
    ["mizan-tidy.json", mizan.rows],
    ["mizan-aylik-tidy.json", res.gtPrim],
    ["mizan-aylik-full.json", res.gtFull],
    ["bilanco-aylik-tidy.json", res.bil],
    ["meta.json", JSON.stringify(meta, null, 2)],
  ]);

  console.log("\nTamam.");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
