/**
 * Excel GT_Ozet vs format_7 vs motor rollup tutarlılık kontrolü.
 * npx tsx scripts/butce-excel-tutarlilik.ts
 */
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
import { buildGtFormatTidy, yilToplamByBrans, FORMAT7_SATIRLAR } from "../lib/butce/v2/buildGtFormatGrid";
import { buildGtCocukPay } from "../lib/butce/v2/gtFormatCocukPay";
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

async function main() {
  const defaults2026 = v3DefaultsStore2026();
  const saved = await loadV3Varsayimlar();
  const v = saved?.butceYili === 2026 ? { ...defaults2026, ...saved } : defaults2026;
  const [s, m, ma, maf, ba, kv, kt, tbp, tm, u, oa] = await Promise.all([
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
    varsayimlar: v,
    satisRows: s,
    mizan: m,
    mizanAylik: ma,
    mizanAylikFull: maf,
    bilancoAylik: ba,
    kpkVade: kv,
    kapanisTahmin: kt,
    tarifeBransPay: tbp,
    tarifeMap: tm,
    uretim: u,
    oranAyar: oa,
  });
  const gt = sonuc.gt;
  const cocukPay = buildGtCocukPay(maf, v.butceYili);
  const tidy = buildGtFormatTidy(gt, cocukPay);
  const yil = yilToplamByBrans(tidy);

  const branslar = gt.branslar.filter((b) => /^7\d{2}$/.test(b.bransKodu)).map((b) => b.bransKodu);

  // format_7 TOPLAM by satirIdx
  const f7Toplam = new Map<number, number>();
  for (const idx of FORMAT7_SATIRLAR.keys()) {
    let t = 0;
    for (const kod of branslar) t += yil.get(kod)?.get(idx) ?? 0;
    f7Toplam.set(idx, t);
  }

  const muallakSatirlar = [
    [114, "611"],
    [115, "61101"],
    [116, "611011"],
    [126, "611012"],
    [136, "61102"],
    [137, "611021"],
    [147, "611022"],
  ] as const;

  console.log("=== GT_Ozet (aylikToplam yıllık) vs format_7 TOPLAM ===\n");
  console.log("Hesap | GT_Ozet | format_7 TOPLAM | Fark");
  console.log("-".repeat(65));

  for (const [satir, hesap] of muallakSatirlar) {
    const gtOzet = (gt.aylikToplam[satir] ?? []).reduce((a, x) => a + x, 0);
    const fmtRow = FORMAT7_SATIRLAR.findIndex((r) => r.hesapKodu === hesap);
    const f7 = fmtRow >= 0 ? (f7Toplam.get(fmtRow) ?? 0) : 0;
    const fark = gtOzet - f7;
    const flag = Math.abs(fark) > 1000 ? " ***" : "";
    console.log(`${hesap.padEnd(6)} | ${tl(gtOzet).padStart(14)} | ${tl(f7).padStart(14)} | ${tl(fark).padStart(14)}${flag}`);
  }

  console.log("\n=== GT_Ozet iç rollup (611 ağacı) ===\n");
  for (const [satir, hesap] of muallakSatirlar) {
    const y = (gt.aylikToplam[satir] ?? []).reduce((a, x) => a + x, 0);
    console.log(`F${satir} ${hesap}: ${tl(y)}`);
  }
  const s116 = (gt.aylikToplam[116] ?? []).reduce((a, x) => a + x, 0);
  const s126 = (gt.aylikToplam[126] ?? []).reduce((a, x) => a + x, 0);
  const s115 = (gt.aylikToplam[115] ?? []).reduce((a, x) => a + x, 0);
  const s137 = (gt.aylikToplam[137] ?? []).reduce((a, x) => a + x, 0);
  const s147 = (gt.aylikToplam[147] ?? []).reduce((a, x) => a + x, 0);
  const s136 = (gt.aylikToplam[136] ?? []).reduce((a, x) => a + x, 0);
  const s114 = (gt.aylikToplam[114] ?? []).reduce((a, x) => a + x, 0);
  console.log(`61101 = 611011+611012? ${tl(s115)} vs ${tl(s116 + s126)} fark ${tl(s115 - s116 - s126)}`);
  console.log(`61102 = 611021+611022? ${tl(s136)} vs ${tl(s137 + s147)} fark ${tl(s136 - s137 - s147)}`);
  console.log(`611 = 61101+61102? ${tl(s114)} vs ${tl(s115 + s136)} fark ${tl(s114 - s115 - s136)}`);

  console.log("\n=== format_7 iç rollup (611 ağacı) ===\n");
  const idx = (h: string) => FORMAT7_SATIRLAR.findIndex((r) => r.hesapKodu === h);
  const f = (h: string) => f7Toplam.get(idx(h)) ?? 0;
  console.log(`61101 = 611011+611012? ${tl(f("61101"))} vs ${tl(f("611011") + f("611012"))} fark ${tl(f("61101") - f("611011") - f("611012"))}`);
  console.log(`61102 = 611021+611022? ${tl(f("61102"))} vs ${tl(f("611021") + f("611022"))} fark ${tl(f("61102") - f("611021") - f("611022"))}`);
  console.log(`611 = 61101+61102? ${tl(f("611"))} vs ${tl(f("61101") + f("61102"))} fark ${tl(f("611") - f("61101") - f("61102"))}`);

  // 715 branch
  const kod = "715";
  const byIdx = yil.get(kod);
  const b115 = gt.branslar.find((b) => b.bransKodu === kod)?.degerler[115] ?? 0;
  const b116 = gt.branslar.find((b) => b.bransKodu === kod)?.degerler[116] ?? 0;
  console.log(`\n=== Branş 715: motor vs format_7 ===`);
  console.log(`61101 motor satir115: ${tl(b115)} | format_7: ${tl(byIdx?.get(idx("61101")) ?? 0)}`);
  console.log(`611011 motor satir116: ${tl(b116)} | format_7: ${tl(byIdx?.get(idx("611011")) ?? 0)}`);
}

main().catch(console.error);
