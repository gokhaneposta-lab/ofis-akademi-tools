/**
 * GT v8 Excel (GT sayfası) ↔ V3 motor yıllık toplam karşılaştırması.
 * Kullanım:
 *   npx tsx scripts/butce-gt-v8-v3-karsilastir.ts [GT_v8.xlsx yolu]
 * xlsx verilmezse yalnızca V3 şirket toplamları yazılır.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import XLSX from "xlsx";
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
import { mizanV3Recon, reconTutmayanListe } from "../lib/butce/v3/mizanV3Recon";
import { V2_HESAP_AGAC, type V2HesapDugum } from "../lib/butce/v2/v2GtHesapAgac";
import {
  loadBilancoAylikRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarlar,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
  loadV3Varsayimlar,
} from "../lib/butce/loadData";

const tl = (n: number) => Math.round(n).toLocaleString("tr-TR");

function flatten(nodes: V2HesapDugum[]): V2HesapDugum[] {
  const out: V2HesapDugum[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flatten(n.children));
  }
  return out;
}

/** GT sayfası: şirket toplam sütunu (genelde son sütun veya TOPLAM başlıklı). */
function readGtV8Sheet(xlsxPath: string): Map<number, number> {
  const wb = XLSX.readFile(xlsxPath, { cellDates: false });
  const sheetName =
    wb.SheetNames.find((s) => /^GT$/i.test(s.trim())) ??
    wb.SheetNames.find((s) => /GT/i.test(s)) ??
    wb.SheetNames[0]!;
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(wb.Sheets[sheetName]!, {
    header: 1,
    defval: null,
  });
  const out = new Map<number, number>();

  // F satır no + tutar: satırda "F123" veya ilk sütunda 123 aralığı
  for (const row of rows) {
    if (!row?.length) continue;
    const texts = row.map((c) => String(c ?? "").trim());
    let fSatir: number | null = null;
    for (const t of texts) {
      const m = /^F(\d+)$/i.exec(t);
      if (m) {
        fSatir = parseInt(m[1]!, 10);
        break;
      }
    }
    if (fSatir == null) {
      const n = Number(texts[0]);
      if (Number.isFinite(n) && n >= 8 && n <= 250) fSatir = n;
    }
    if (fSatir == null) continue;
    // Son sayısal sütun = toplam
    let val: number | null = null;
    for (let i = row.length - 1; i >= 0; i--) {
      const x = row[i];
      if (typeof x === "number" && Number.isFinite(x) && Math.abs(x) > 1) {
        val = x;
        break;
      }
    }
    if (val != null) out.set(fSatir, val);
  }
  return out;
}

/** Hesap kodu kök toplamları (format ağacından F satır toplamları). */
function v3HesapKokToplam(
  gtToplam: Record<number, number>,
): Map<string, number> {
  const m = new Map<string, number>();
  for (const node of flatten(V2_HESAP_AGAC)) {
    if (!node.hesap || node.children?.length) continue;
    const h = node.hesap.replace(/\D/g, "").slice(0, 3);
    if (h.length < 3) continue;
    const v = gtToplam[node.satir] ?? 0;
    m.set(h, (m.get(h) ?? 0) + v);
  }
  const ustSatir: Record<string, number> = {
    "600": 10,
    "601": 21,
    "602": 31,
    "605": 86,
    "610": 95,
    "611": 114,
    "613": 166,
  };
  const hesapMap = new Map<string, number>();
  for (const [hesap, f] of Object.entries(ustSatir)) {
    hesapMap.set(hesap, gtToplam[f] ?? 0);
  }
  return hesapMap;
}

async function main() {
  const xlsxArg = process.argv[2];
  let excelGt: Map<number, number> | null = null;
  if (xlsxArg && fs.existsSync(xlsxArg)) {
    excelGt = readGtV8Sheet(xlsxArg);
    console.log(`Excel GT okundu: ${xlsxArg} (${excelGt.size} F satır)\n`);
  } else if (xlsxArg) {
    console.warn(`Excel bulunamadı: ${xlsxArg}\n`);
  }

  const defaults2026 = v3DefaultsStore2026();
  const saved = await loadV3Varsayimlar();
  const varsayimlar = saved?.butceYili === 2026 ? { ...defaults2026, ...saved } : defaults2026;

  const [
    satisRows,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    kpkVade,
    kapanisTahmin,
    tarifeBransPay,
    tarifeMap,
    uretim,
    oranAyar,
  ] = await Promise.all([
    loadSatisButceRows(),
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadBilancoAylikRows(),
    loadKpkVadeRows(),
    loadKpkKapanisTahmin(),
    loadTarifeBransPayRows(),
    loadTarifeMapRows(),
    loadUretimRows(),
    loadOranAyarlar(),
  ]);

  const sonuc = buildV3GelirTablosu({
    varsayimlar,
    satisRows,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    kpkVade,
    kapanisTahmin,
    tarifeBransPay,
    tarifeMap,
    uretim,
    oranAyar,
  });

  const gt = sonuc.gt;
  const anchor = sonuc.ytdAnchorAy ?? 7;
  const v3 = gt.toplam;
  const hesapV3 = v3HesapKokToplam(v3);

  console.log("\n=== V3 yıllık F üst satırlar (Excel GT karşılığı) ===");
  for (const [hesap, f] of [
    ["600→F10", 10],
    ["601→F21", 21],
    ["602→F31", 31],
    ["610→F95", 95],
    ["611→F114", 114],
    ["9003 Safi TKZ", 9003],
  ] as const) {
    console.log(`  ${hesap}: ${tl(v3[f] ?? 0)}`);
  }

  console.log("\n=== V3 yıllık şirket toplam (GT hesap kökleri) ===");
  for (const h of ["600", "601", "602", "605", "610", "611", "613", "614"]) {
    console.log(`  ${h}: ${tl(hesapV3.get(h) ?? 0)}`);
  }

  console.log("\n=== Muallak / hasar F satırları (V3 yıllık) ===");
  const muallakSatirlar = [95, 96, 105, 114, 115, 116, 117, 126, 127, 136, 137, 147, 157];
  for (const s of muallakSatirlar) {
    const node = flatten(V2_HESAP_AGAC).find((n) => n.satir === s);
    console.log(`  F${s} ${node?.hesap ?? ""}: ${tl(v3[s] ?? 0)}`);
  }

  if (excelGt) {
    console.log("\n=== Excel GT vs V3 (|fark| büyükten) ===");
    const diffs: Array<{ satir: number; excel: number; v3: number; fark: number; pct: number | null }> = [];
    const allSatir = new Set([...excelGt.keys(), ...Object.keys(v3).map(Number)]);
    for (const s of allSatir) {
      const ex = excelGt.get(s) ?? 0;
      const v = v3[s] ?? 0;
      const fark = v - ex;
      if (Math.abs(fark) < 1000 && Math.abs(ex) < 1000) continue;
      diffs.push({
        satir: s,
        excel: ex,
        v3: v,
        fark,
        pct: ex !== 0 ? (fark / ex) * 100 : null,
      });
    }
    diffs.sort((a, b) => Math.abs(b.fark) - Math.abs(a.fark));
    console.log("F Sat | Excel | V3 | Fark | Sapma%");
    for (const d of diffs.slice(0, 35)) {
      const pct = d.pct == null ? "—" : `${d.pct.toFixed(1)}%`;
      console.log(
        `F${String(d.satir).padStart(3)} | ${tl(d.excel).padStart(18)} | ${tl(d.v3).padStart(18)} | ${tl(d.fark).padStart(18)} | ${pct}`,
      );
    }

    console.log("\n=== Hesap kök (601, 602 …) Excel vs V3 ===");
    const excelHesap = new Map<string, number>();
    for (const [hesap, satirlar] of Object.entries({
      "600": [10, 11, 19, 20],
      "601": [21],
      "602": [31],
      "610": [95],
      "611": [114],
    })) {
      excelHesap.set(hesap, satirlar.reduce((s, f) => s + (excelGt!.get(f) ?? 0), 0));
    }
    for (const h of ["600", "601", "602", "610", "611"]) {
      const ex = excelHesap.get(h) ?? 0;
      const v = hesapV3.get(h) ?? 0;
      const fark = v - ex;
      console.log(
        `  ${h}: Excel ${tl(ex)} | V3 ${tl(v)} | Fark ${tl(fark)}`,
      );
    }
  }

  if (mizanAylikFull?.length) {
    const recon = mizanV3Recon({
      gt,
      mizanAylikFull,
      butceYili: varsayimlar.butceYili,
      anchorAy: anchor,
    });
    const tutmayan = reconTutmayanListe(recon).filter((r) =>
      r.hesapKodu.startsWith("611") || r.hesapKodu.startsWith("610") || r.hesapKodu.startsWith("601"),
    );
    console.log(`\n=== YTD (anchor=${anchor}) mizan tutmayan — muallak/KPK (${tutmayan.length}) ===`);
    for (const r of tutmayan.slice(0, 25)) {
      console.log(
        `  ${r.hesapKodu} F${r.satir ?? "?"}: mizan ${tl(r.mizanYtd)} | V3 ${tl(r.v3Ytd)} | fark ${tl(r.fark)}`,
      );
    }
  }

  console.log("\n=== Özet uyarılar ===");
  for (const u of sonuc.uyarilar.slice(0, 8)) console.log(`  - ${u}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
