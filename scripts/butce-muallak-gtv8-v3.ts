/**
 * GT v8 Excel (GT sayfası) ↔ V3 muallak (611*) — hesap kodu bazlı karşılaştırma.
 * npx tsx scripts/butce-muallak-gtv8-v3.ts "C:/Users/.../Bütçe GT Çalışma_v8.xlsx"
 */
import XLSX from "xlsx";
import formatRaw from "../lib/butce/data/gt_sirket_format.json";
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
import { GT_KOD_TO_SATIR } from "../lib/butce/v3/gtKodHaritasi";
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

type FormatRow = { gtKod: string; hesapKodu: string; hesapAdi: string };
const FORMAT7 = (formatRaw as { format7: FormatRow[] }).format7;

const MUALLAK_HESAP_PREFIX = "611";

function flatten(nodes: V2HesapDugum[]): V2HesapDugum[] {
  const out: V2HesapDugum[] = [];
  for (const n of nodes) {
    out.push(n);
    if (n.children?.length) out.push(...flatten(n.children));
  }
  return out;
}

/** format7: hesap → gtKod (en derin eşleşme). */
function hesapToGtKod(): Map<string, string> {
  const m = new Map<string, string>();
  for (const r of FORMAT7) {
    if (r.hesapKodu?.startsWith(MUALLAK_HESAP_PREFIX) && r.gtKod) {
      m.set(r.hesapKodu, r.gtKod);
    }
  }
  return m;
}

/** GT sayfasından hesap kodu → yıllık TOPLAM. */
function readExcelGtMuallak(xlsxPath: string): Map<string, number> {
  const wb = XLSX.readFile(xlsxPath, { cellDates: false });
  const sheetName =
    wb.SheetNames.find((s) => /^GT$/i.test(String(s).trim())) ??
    wb.SheetNames.find((s) => /GT/i.test(String(s))) ??
    wb.SheetNames[0]!;
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(wb.Sheets[sheetName]!, {
    header: 1,
    defval: null,
  });

  // TOPLAM sütun indeksi: başlık satırında "TOPLAM"
  let toplamCol = -1;
  let headerRow = -1;
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    const r = rows[i] ?? [];
    for (let j = 0; j < r.length; j++) {
      const t = String(r[j] ?? "").trim().toUpperCase();
      if (t === "TOPLAM" || t === "TOPLAM ") {
        toplamCol = j;
        headerRow = i;
        break;
      }
    }
    if (toplamCol >= 0) break;
  }
  if (toplamCol < 0) toplamCol = 4;

  const out = new Map<string, number>();

  for (let i = (headerRow >= 0 ? headerRow + 1 : 0); i < rows.length; i++) {
    const r = rows[i] ?? [];
    // Ana GT ağacı: B=format kodu (022…), C=hesap kodu (611…). Oran/geçmiş blokları atlanır.
    const fmtKod = String(r[1] ?? "").trim();
    const hesap = String(r[2] ?? "").trim();
    if (!/^0\d/.test(fmtKod)) continue;
    if (!hesap.startsWith(MUALLAK_HESAP_PREFIX)) continue;
    const val = r[toplamCol];
    if (typeof val !== "number" || !Number.isFinite(val)) continue;
    out.set(hesap, val);
  }

  return out;
}

/** V3 yıllık tutar — hesap kodu (611*). */
function v3MuallakByHesap(
  gtToplam: Record<number, number>,
  h2Gt: Map<string, string>,
): Map<string, number> {
  const out = new Map<string, number>();

  // v2GtHesapAgac: doğrudan hesap → satir
  for (const n of flatten(V2_HESAP_AGAC)) {
    if (!n.hesap?.startsWith(MUALLAK_HESAP_PREFIX)) continue;
    out.set(n.hesap, gtToplam[n.satir] ?? 0);
  }

  // format7 derin yapraklar: gtKod → satir
  for (const [hesap, gtKod] of h2Gt) {
    if (out.has(hesap)) continue;
    const satir = GT_KOD_TO_SATIR[gtKod];
    if (satir != null) out.set(hesap, gtToplam[satir] ?? 0);
  }

  return out;
}

async function main() {
  const xlsxPath = process.argv[2];
  if (!xlsxPath) {
    console.error("Kullanım: npx tsx scripts/butce-muallak-gtv8-v3.ts <GT_v8.xlsx>");
    process.exit(1);
  }

  const excel = readExcelGtMuallak(xlsxPath);
  console.log(`Excel GT: ${excel.size} adet 611* hesap satırı okundu.\n`);

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

  const v3 = v3MuallakByHesap(sonuc.gt.toplam, hesapToGtKod());

  const allHesap = new Set([...excel.keys(), ...v3.keys()]);
  const rows: Array<{
    hesap: string;
    excel: number | null;
    v3: number | null;
    fark: number | null;
  }> = [];

  for (const h of allHesap) {
    const ex = excel.get(h);
    const v = v3.get(h);
    if (ex == null && v == null) continue;
    const e = ex ?? 0;
    const vv = v ?? 0;
    if (Math.abs(e) < 1 && Math.abs(vv) < 1) continue;
    rows.push({
      hesap: h,
      excel: ex ?? null,
      v3: v ?? null,
      fark: vv - e,
    });
  }

  rows.sort((a, b) => Math.abs(b.fark ?? 0) - Math.abs(a.fark ?? 0));

  console.log("=== MUALLAK (611*) — GT v8 Excel vs V3 (yıllık TOPLAM) ===");
  console.log("Hesap      | Excel GT v8        | V3 motor           | Fark (V3−Excel)");
  console.log("-".repeat(78));
  for (const r of rows) {
    const ex = r.excel == null ? "(yok)" : tl(r.excel).padStart(18);
    const vv = r.v3 == null ? "(yok)" : tl(r.v3).padStart(18);
    const fk = r.fark == null ? "—" : tl(r.fark).padStart(18);
    console.log(`${r.hesap.padEnd(10)} | ${ex} | ${vv} | ${fk}`);
  }

  // Üst hesaplar
  const ust = ["611", "61101", "611011", "611012", "61102", "611021", "611022"];
  console.log("\n=== Üst muallak hesapları ===");
  for (const h of ust) {
    const ex = excel.get(h);
    const vv = v3.get(h);
    console.log(
      `${h}: Excel ${ex == null ? "—" : tl(ex)} | V3 ${vv == null ? "—" : tl(vv)} | Fark ${tl((vv ?? 0) - (ex ?? 0))}`,
    );
  }

  console.log(`\nV3 anchor YTD: ay ${sonuc.ytdAnchorAy ?? "?"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
