/**
 * 7xx branş kodları → Ana Branş / GT bransAp / Tarife Grubu eşleme tablosu (Excel).
 * Kullanım: node scripts/tsb-export-brans-esleme-xlsx.mjs [çıktı.xlsx]
 * Varsayılan: public/data/tsb/out/brans-esleme-7xx.xlsx
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const HP_TARIFE_TO_BRANS_AP = {
  KASKO: "KASKO",
  TRAFİK: "TRAFİK",
  YANGIN: "YANGIN VE DOĞAL AFETLER",
  DASK: "YANGIN VE DOĞAL AFETLER",
  NAKLİYAT: "NAKLİYAT",
  "FERDİ KAZA": "KAZA",
  "DİĞER KAZA": "KAZA",
  SAĞLIK: "HASTALIK-SAĞLIK",
  HAYAT: "HAYAT",
  MÜHENDİSLİK: "MÜHENDİSLİK SİGORTALARI",
  TARSİM: "DEV. DEST. TARIM SİGORTALARI",
};

const ANA_TO_GT_FALLBACK = {
  KAZA: "KAZA",
  "HASTALIK SAĞLIK": "HASTALIK-SAĞLIK",
  "KARA ARAÇLARI": "KARA ARAÇLARI",
  "RAYLI ARAÇLAR": "KARA ARAÇLARI",
  "HAVA ARAÇLARI": "HAVA ARAÇLARI",
  "SU ARAÇLARI": "SU ARAÇLARI",
  NAKLİYAT: "NAKLİYAT",
  "YANGIN DOĞAL AFET": "YANGIN VE DOĞAL AFETLER",
  "GENEL ZARARLAR": "GENEL ZARARLAR",
  "KARA ARAÇLARI SORUMLULUK": "KARA ARAÇLARI SORUMLULUK",
  "HAVA ARAÇLARI SORUMLULUK": "HAVA ARAÇLARI SORUMLULUK",
  "SU ARAÇLARI SORUMLULUK": "SU ARAÇLARI SORUMLULUK",
  "GENEL SORUMLULUK": "GENEL SORUMLULUK",
  KREDİ: "KREDİ",
  KEFALET: "KEFALET",
  "FİNANSAL KAYIP": "FİNANSAL KAYIPLAR",
  "HUKUKSAL KORUMA": "HUKUKSAL KORUMA",
  DESTEK: "DESTEK",
  HAYAT: "HAYAT",
};

function gtBransApUygulama(tarifeGrubu, anaBrans) {
  if (tarifeGrubu && HP_TARIFE_TO_BRANS_AP[tarifeGrubu]) {
    return HP_TARIFE_TO_BRANS_AP[tarifeGrubu];
  }
  return ANA_TO_GT_FALLBACK[anaBrans] ?? "";
}

function norm(s) {
  return String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase()
    .replace(/İ/g, "I")
    .replace(/Ş/g, "S")
    .replace(/Ğ/g, "G")
    .replace(/Ü/g, "U")
    .replace(/Ö/g, "O")
    .replace(/Ç/g, "C");
}

function gtEslesme(hazineGt, uygulamaGt) {
  if (!hazineGt && !uygulamaGt) return "";
  if (norm(hazineGt) === norm(uygulamaGt)) return "UYUMLU";
  return "FARKLI";
}

function anaBransFromHazineGroups(anaGroups, kod) {
  for (const [grup, kodlar] of Object.entries(anaGroups)) {
    if (kodlar.includes(kod)) return grup;
  }
  return "";
}

function main() {
  const outArg = process.argv[2];
  const outPath = outArg
    ? path.resolve(outArg)
    : path.join(ROOT, "public", "data", "tsb", "out", "brans-esleme-7xx.xlsx");

  const lookup = JSON.parse(
    fs.readFileSync(path.join(ROOT, "public/data/tsb/branch-lookup.json"), "utf8"),
  );
  const bransJson = JSON.parse(
    fs.readFileSync(path.join(ROOT, "lib/butce/data/brans.json"), "utf8"),
  );
  const prim = JSON.parse(
    fs.readFileSync(path.join(ROOT, "public/data/tsb/prim-tidy.json"), "utf8"),
  );

  const primByKod = new Map();
  for (const r of prim) {
    if (!primByKod.has(r.bransKodu)) {
      primByKod.set(r.bransKodu, {
        anaBransH: r.anaBransH ?? "",
        bransAd: r.bransAd ?? "",
        tarifeGrubu: r.tarifeGrubu ?? "",
      });
    }
  }

  const gelirDonem = "2026-1";
  const gelirPath = path.join(ROOT, "public/data/tsb/gelir-tidy", `${gelirDonem}.json`);
  const gelirRows = fs.existsSync(gelirPath)
    ? JSON.parse(fs.readFileSync(gelirPath, "utf8"))
    : [];
  const gtBransApSet = new Set();
  for (const r of gelirRows) {
    if (r.tabloTip === "GT" && r.bransAp) gtBransApSet.add(r.bransAp);
  }

  const anaBransPrimSet = new Set();
  const tarifePrimSet = new Set();
  for (const r of prim) {
    if (r.anaBransH) anaBransPrimSet.add(r.anaBransH);
    if (r.tarifeGrubu) tarifePrimSet.add(r.tarifeGrubu);
  }

  const kodlar = [
    ...new Set([
      ...Object.keys(lookup),
      ...Object.keys(bransJson.brans ?? {}),
      ...[...primByKod.keys()].map(String),
    ]),
  ]
    .map(Number)
    .filter((k) => (k >= 700 && k < 800) || k === 903)
    .sort((a, b) => a - b);

  const header = [
    "bransKodu",
    "bransAdi",
    "anaBrans_mevcut",
    "anaBrans_primVerisi",
    "anaBrans_hazine",
    "tarifeGrubu_mevcut",
    "tarifeGrubu_primVerisi",
    "tarifeGrubu_hazine",
    "gtBransAp_hazine",
    "gtBransAp_uygulama",
    "gt_eslesme",
    "anaBrans_DUZELT",
    "tarifeGrubu_DUZELT",
    "gtBransAp_DUZELT",
    "not",
  ];

  const rows = [header];

  for (const kod of kodlar) {
    const key = String(kod);
    const lk = lookup[key] ?? {};
    const hz = bransJson.brans?.[key];
    const pm = primByKod.get(kod);

    const anaMevcut = lk.anaBrans ?? "";
    const anaPrim = pm?.anaBransH ?? "";
    const anaHazine = anaBransFromHazineGroups(bransJson.ana ?? {}, key);

    const tarMevcut = lk.tarifeGrubu ?? "";
    const tarPrim = pm?.tarifeGrubu ?? "";
    const tarHazine = hz?.[2] ?? "";

    const gtHazine = hz?.[0] ?? "";
    const gtUygulama = gtBransApUygulama(tarMevcut || tarPrim, anaMevcut || anaPrim);

    rows.push([
      kod,
      pm?.bransAd ?? hz?.[1] ?? "",
      anaMevcut,
      anaPrim,
      anaHazine,
      tarMevcut,
      tarPrim,
      tarHazine,
      gtHazine,
      gtUygulama,
      gtEslesme(gtHazine, gtUygulama),
      "",
      "",
      "",
      "",
    ]);
  }

  const wb = XLSX.utils.book_new();

  const wsMain = XLSX.utils.aoa_to_sheet(rows);
  wsMain["!cols"] = [
    { wch: 10 },
    { wch: 42 },
    { wch: 28 },
    { wch: 28 },
    { wch: 28 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 32 },
    { wch: 32 },
    { wch: 10 },
    { wch: 28 },
    { wch: 16 },
    { wch: 32 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMain, "BransEsleme");

  const refGt = [["gtBransAp (gelir-tidy GT sayfalari)"], ...[...gtBransApSet].sort((a, b) => a.localeCompare(b, "tr")).map((x) => [x])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(refGt), "Ref_GT_BransAp");

  const refAna = [["anaBransH (prim-tidy)"], ...[...anaBransPrimSet].sort((a, b) => a.localeCompare(b, "tr")).map((x) => [x])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(refAna), "Ref_AnaBrans");

  const refTar = [["tarifeGrubu (prim-tidy)"], ...[...tarifePrimSet].sort((a, b) => a.localeCompare(b, "tr")).map((x) => [x])];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(refTar), "Ref_TarifeGrubu");

  const aciklama = [
    ["TSB Brans Esleme — duzenleme kilavuzu"],
    [""],
    ["Amac", "7xx brans kodlari icin Ana Branş (prim), GT BransAp (gelir tablosu) ve Tarife Grubu eslemesini netlestirmek."],
    [""],
    ["Mevcut kolonlar"],
    ["anaBrans_mevcut", "Uygulamadaki branch-lookup.json (prim panelleri)"],
    ["anaBrans_primVerisi", "prim-tidy.json icindeki anaBransH alani"],
    ["anaBrans_hazine", "butce brans.json ana grup etiketi"],
    ["tarifeGrubu_mevcut", "branch-lookup.json"],
    ["tarifeGrubu_primVerisi", "prim-tidy tarifeGrubu"],
    ["tarifeGrubu_hazine", "butce brans.json 3. alan"],
    ["gtBransAp_hazine", "butce brans.json 1. alan — GT sayfa adi referansi"],
    ["gtBransAp_uygulama", "Hasar/prim panelinde tarife→GT eslemesi (tsbHpTarifeBrans.ts)"],
    ["gt_eslesme", "UYUMLU / FARKLI — hazine GT ile uygulama GT karsilastirmasi"],
    [""],
    ["Sizin dolduracaginiz kolonlar (sari alan mantigi)"],
    ["anaBrans_DUZELT", "Olmasi gereken Ana Branş — bos birakirsaniz mevcut kalir"],
    ["tarifeGrubu_DUZELT", "Olmasi gereken Tarife Grubu"],
    ["gtBransAp_DUZELT", "Olmasi gereken GT bransAp — Ref_GT_BransAp sayfasindaki tam ad"],
    ["not", "Aciklama / istisna"],
    [""],
    ["Yukledikten sonra", "Exceli projeye geri yukleyin; branch-lookup.json ve HP eslemesi guncellenecek."],
    ["Uretim", new Date().toISOString()],
    ["Brans sayisi", String(kodlar.length)],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aciklama), "Aciklama");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  XLSX.writeFile(wb, outPath);
  console.log("Yazildi:", outPath);
  console.log("Satir:", kodlar.length);
  const farkli = rows.slice(1).filter((r) => r[10] === "FARKLI").length;
  console.log("GT FARKLI:", farkli);
}

main();
