/**
 * V2 backtest: bütçe prim vs gerçekleşen mizan prim → GT vs mizan (V3 yok).
 * npx tsx scripts/butce-v2-gercek-prim-backtest.ts
 */
import { existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import XLSX from "xlsx";
import { referansYilAgirliklari } from "../lib/butce/config/constants";
import { buildV2GelirTablosu } from "../lib/butce/v2/buildV2GelirTablosu";
import { gercekPrimFromMizan } from "../lib/butce/v2/gercekPrimFromMizan";
import {
  gtYtdHesap,
  gtYtdSatir,
  mizanYtdHesapFromFull,
} from "../lib/butce/v2/gtHesapYtd";
import { alignTarifeHedefleri, v3DefaultsStore2026 } from "../lib/butce/v3/defaults";
import { primHedefFromTarifeAna } from "../lib/butce/v3/primFromToplam";
import { syntheticSatisFromTarife } from "../lib/butce/v3/syntheticSatis";
import { DagitimMotoru } from "../lib/butce/prim/dagitimMotoru";
import { FORMAT7_SATIRLAR } from "../lib/butce/v3/mizanFormatHarita";
import type { MizanAylikRow } from "../lib/butce/types";
import {
  loadBilancoAylikRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarPaket,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
  loadV2Varsayimlar,
} from "../lib/butce/loadData";

const BUTCE_YILI = 2026;
const ANCHOR_AYLAR = [3, 7] as const;
const OUT_DIR = join(process.cwd(), "data", "butce", "out");
const OUT_XLSX = join(OUT_DIR, "v2-gercek-prim-backtest-2026.xlsx");
const LOCAL_MIZAN_FULL = join(process.cwd(), "data", "butce", "private", "mizan-aylik-full.json");

function loadMizanFullLocal(): MizanAylikRow[] {
  if (!existsSync(LOCAL_MIZAN_FULL)) return [];
  const raw = JSON.parse(readFileSync(LOCAL_MIZAN_FULL, "utf8")) as MizanAylikRow[];
  return raw.map((r) => ({
    yil: Number(r.yil),
    ay: Number(r.ay),
    hesap: String(r.hesap),
    bransKodu: String(r.bransKodu),
    tutar: Number(r.tutar),
  }));
}

const SENTETIK_HESAPLAR = [
  { hesapKodu: "9001", ad: "TEKNİK GELİR (sentetik)" },
  { hesapKodu: "9002", ad: "TEKNİK GİDER (sentetik)" },
  { hesapKodu: "9003", ad: "SAFİ TKZ (sentetik)" },
  { hesapKodu: "9005", ad: "TKZ (sentetik)" },
] as const;

type KarsilastirmaSatir = {
  hesapKodu: string;
  hesapAdi: string;
  gtKod: string;
  anchorAy: number;
  mizanYtd: number;
  v2ButceYtd: number;
  v2GercekPrimYtd: number;
  deltaButce: number;
  deltaGercekPrim: number;
  iyilestme: number;
  sapmaGercekPct: number | null;
};

function resolveButcePrim(
  v3def: ReturnType<typeof v3DefaultsStore2026>,
  satis: Awaited<ReturnType<typeof loadSatisButceRows>>,
  uretim: Awaited<ReturnType<typeof loadUretimRows>>,
  tarifeMap: Awaited<ReturnType<typeof loadTarifeMapRows>>,
  tarifeBransPay: Awaited<ReturnType<typeof loadTarifeBransPayRows>>,
  mizan: Awaited<ReturnType<typeof loadMizanRows>>,
  v2Saved: Awaited<ReturnType<typeof loadV2Varsayimlar>>,
) {
  const tarifeHedefleri = alignTarifeHedefleri(
    v2Saved?.tarifeHedefleri ?? v3def.tarifeHedefleri,
    satis,
  );
  let satisRows = satis;
  if (satisRows.length === 0 && Object.keys(tarifeHedefleri).length > 0) {
    satisRows = syntheticSatisFromTarife(tarifeHedefleri);
  }
  const referansEtiket = v2Saved?.referansEtiket ?? v3def.referansEtiket ?? "Son 2 Yıl Ortalaması (2024-2025)";
  const yilAgirliklari = referansYilAgirliklari(
    referansEtiket,
    v2Saved?.yilAgirliklari ?? v3def.yilAgirliklari,
  );
  let primHedefleri: Record<string, number> = {};
  let endirektPrim: Record<string, number> = {};
  if (Object.keys(tarifeHedefleri).length > 0) {
    const motor = new DagitimMotoru(uretim, tarifeMap, mizan, tarifeBransPay);
    const dagitim = motor.dagit({
      satisRows,
      referansEtiket,
      mizanYedek: true,
      tarifeHedefleri,
      yilAgirliklari,
    });
    if (dagitim.ozet.dagitilan > 0) {
      for (const b of dagitim.bransOzet) primHedefleri[b.bransKodu] = b.hedefPrim;
      for (const b of dagitim.bransDirektEndirekt) endirektPrim[b.bransKodu] = b.endirektPrim;
    } else {
      const fb = primHedefFromTarifeAna(tarifeHedefleri, mizan, BUTCE_YILI);
      primHedefleri = fb.primHedefleri;
      endirektPrim = fb.endirektPrim;
    }
  }
  return {
    varsayimlar: {
      butceYili: BUTCE_YILI,
      tarifeHedefleri,
      referansEtiket,
      yilAgirliklari,
      giderArtisOrani: v2Saved?.giderArtisOrani ?? 0,
      faaliyetGiderButce: v2Saved?.faaliyetGiderButce ?? v3def.faaliyetGiderButce,
      aylikGetiriOrani: v2Saved?.aylikGetiriOrani ?? v3def.aylikGetiriOrani,
    },
    satisRows,
    primHedefleri,
    endirektPrim,
  };
}

function hesapSatirlari(): Array<{ hesapKodu: string; hesapAdi: string; gtKod: string }> {
  const seen = new Set<string>();
  const rows: Array<{ hesapKodu: string; hesapAdi: string; gtKod: string }> = [];
  for (const r of FORMAT7_SATIRLAR) {
    if (!r.hesapKodu || seen.has(r.hesapKodu)) continue;
    seen.add(r.hesapKodu);
    rows.push({ hesapKodu: r.hesapKodu, hesapAdi: r.hesapAdi, gtKod: r.gtKod });
  }
  for (const s of SENTETIK_HESAPLAR) {
    rows.push({ hesapKodu: s.hesapKodu, hesapAdi: s.ad, gtKod: "" });
  }
  return rows;
}

function sentetikGtYtd(
  gt: ReturnType<typeof buildV2GelirTablosu>["gt"],
  hesapKodu: string,
  anchorAy: number,
): number {
  const n = Number(hesapKodu);
  if (Number.isFinite(n)) return gtYtdSatir(gt, n, anchorAy);
  return 0;
}

async function main() {
  const [
    satis, uretim, tarifeMap, tarifeBransPay, mizan, mizanAylik, mizanAylikFull,
    bilancoAylik, oranPaket, kpkVade, kapanisTahmin, v2Saved,
  ] = await Promise.all([
    loadSatisButceRows(), loadUretimRows(), loadTarifeMapRows(), loadTarifeBransPayRows(),
    loadMizanRows(), loadMizanAylikRows(), loadMizanAylikFullRows(), loadBilancoAylikRows(),
    loadOranAyarPaket(), loadKpkVadeRows(), loadKpkKapanisTahmin(), loadV2Varsayimlar(),
  ]);

  const mizanFullLocal = loadMizanFullLocal();
  const mizanFull =
    mizanFullLocal.filter((r) => r.yil === BUTCE_YILI).length > 0
      ? mizanFullLocal
      : mizanAylikFull;

  const v3def = v3DefaultsStore2026();
  const butce = resolveButcePrim(v3def, satis, uretim, tarifeMap, tarifeBransPay, mizan, v2Saved);
  const gercek = gercekPrimFromMizan(mizanFull, BUTCE_YILI);

  const buildOpts = {
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanAylikFull: mizanFull,
    bilancoAylik,
    oranAyar: oranPaket.ayarlar,
    kalemYilBirlestirme: oranPaket.kalemYilBirlestirme,
    kpkVade,
    kapanisTahmin,
  };

  const v2Butce = buildV2GelirTablosu({
    varsayimlar: butce.varsayimlar,
    satisRows: butce.satisRows,
    ...buildOpts,
    primHedefleriOverride: butce.primHedefleri,
    endirektPrimOverride: butce.endirektPrim,
  });

  const v2Gercek = buildV2GelirTablosu({
    varsayimlar: butce.varsayimlar,
    satisRows: butce.satisRows,
    ...buildOpts,
    primHedefleriOverride: gercek.primHedefleri,
    endirektPrimOverride: gercek.endirektPrim,
    aylikPrimOverride: gercek.aylikPrim,
  });

  const hesaplar = hesapSatirlari();
  const karsilastirma: KarsilastirmaSatir[] = [];

  function mizanSafiTkz(anchorAy: number): number {
    const gelir = (["600", "601", "602", "604", "605"] as const).reduce(
      (s, h) => s + mizanYtdHesapFromFull(mizanFull, BUTCE_YILI, h, anchorAy),
      0,
    );
    const gider = (["610", "611", "612", "613", "614", "615"] as const).reduce(
      (s, h) => s + mizanYtdHesapFromFull(mizanFull, BUTCE_YILI, h, anchorAy),
      0,
    );
    return gelir + gider;
  }

  for (const anchorAy of ANCHOR_AYLAR) {
    for (const h of hesaplar) {
      let mizanYtd = 0;
      if (h.hesapKodu === "9003") mizanYtd = mizanSafiTkz(anchorAy);
      else if (!h.hesapKodu.startsWith("900")) {
        mizanYtd = mizanYtdHesapFromFull(mizanFull, BUTCE_YILI, h.hesapKodu, anchorAy);
      }

      const v2b =
        h.hesapKodu.startsWith("900")
          ? sentetikGtYtd(v2Butce.gt, h.hesapKodu, anchorAy)
          : gtYtdHesap(v2Butce.gt, h.hesapKodu, anchorAy);
      const v2g =
        h.hesapKodu.startsWith("900")
          ? sentetikGtYtd(v2Gercek.gt, h.hesapKodu, anchorAy)
          : gtYtdHesap(v2Gercek.gt, h.hesapKodu, anchorAy);

      const deltaButce = v2b - mizanYtd;
      const deltaGercek = v2g - mizanYtd;
      karsilastirma.push({
        hesapKodu: h.hesapKodu,
        hesapAdi: h.hesapAdi,
        gtKod: h.gtKod,
        anchorAy,
        mizanYtd,
        v2ButceYtd: v2b,
        v2GercekPrimYtd: v2g,
        deltaButce,
        deltaGercekPrim: deltaGercek,
        iyilestme: Math.abs(deltaButce) - Math.abs(deltaGercek),
        sapmaGercekPct: mizanYtd !== 0 ? (deltaGercek / Math.abs(mizanYtd)) * 100 : null,
      });
    }
  }

  const butceBrut = Object.values(butce.primHedefleri).reduce((a, x) => a + x, 0);
  const bransPrimRows = Object.keys({
    ...butce.primHedefleri,
    ...gercek.primHedefleri,
  }).sort().map((b) => ({
    bransKodu: b,
    v2ButceBrut: butce.primHedefleri[b] ?? 0,
    gercekBrut: gercek.primHedefleri[b] ?? 0,
    fark: (gercek.primHedefleri[b] ?? 0) - (butce.primHedefleri[b] ?? 0),
  }));

  const tol = 50_000;
  const sapma = karsilastirma
    .filter((r) => Math.abs(r.deltaGercekPrim) > tol)
    .sort((a, b) => Math.abs(b.deltaGercekPrim) - Math.abs(a.deltaGercekPrim));

  const ozetRows: Record<string, string | number>[] = [];
  for (const ay of ANCHOR_AYLAR) {
    const safi = karsilastirma.find((r) => r.hesapKodu === "9003" && r.anchorAy === ay)!;
    const kpk = karsilastirma.filter((r) => r.anchorAy === ay && /^60101[12]|60103[12]$/.test(r.hesapKodu));
    const kom = karsilastirma.filter((r) => r.anchorAy === ay && r.hesapKodu === "61401");
    const f08 = karsilastirma.filter((r) => r.anchorAy === ay && r.hesapKodu === "61408");
    const mua = karsilastirma.filter((r) => r.anchorAy === ay && r.hesapKodu.startsWith("611"));
    ozetRows.push({
      anchorAy: ay,
      mizanSafiTkz: safi.mizanYtd,
      v2ButceSafiTkz: safi.v2ButceYtd,
      v2GercekPrimSafiTkz: safi.v2GercekPrimYtd,
      deltaButceSafi: safi.deltaButce,
      deltaGercekSafi: safi.deltaGercekPrim,
      iyilestmeSafi: safi.iyilestme,
      butceBrutPrim: butceBrut,
      gercekBrutPrimYtd: gercek.brutToplam,
      mizanMaxAy: gercek.maxAy,
    });
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const wb = XLSX.utils.book_new();

  const readme = [
    ["V2 Gerçekleşen Prim Backtest — 2026"],
    [""],
    ["Amaç", "Bütçe prim hedefi yerine mizan gerçekleşen brüt/endirekt prim + aylık desen ile V2 GT çalıştır; mizan GT ile karşılaştır."],
    ["V3", "Dahil değil"],
    ["Motor", "Bütçe V2 (oranlar, KPK, faaliyet gider artışı aynı)"],
    ["Prim girdisi A", "Tarife bütçe hedefi (mevcut V2)"],
    ["Prim girdisi B", "2026 mizan-aylik-full 0111/0112 branş aylık artış"],
    ["Anchor aylar", "3 (Mart), 7 (Temmuz) YTD"],
    [""],
    ["Yorum", "Gerçek prim sonrası kalan sapma → teknik oran / KPK modeli / faaliyet varsayımı"],
    ["Yorum", "Gerçek prim ile düzelen sapma → üretim deseni / bütçe prim farkı"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(readme), "README");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ozetRows), "Ozet");

  for (const ay of ANCHOR_AYLAR) {
    const rows = karsilastirma
      .filter((r) => r.anchorAy === ay)
      .map((r) => ({
        hesapKodu: r.hesapKodu,
        hesapAdi: r.hesapAdi,
        gtKod: r.gtKod,
        mizanYTD: Math.round(r.mizanYtd),
        v2ButceYTD: Math.round(r.v2ButceYtd),
        v2GercekPrimYTD: Math.round(r.v2GercekPrimYtd),
        deltaButce: Math.round(r.deltaButce),
        deltaGercekPrim: Math.round(r.deltaGercekPrim),
        iyilestmeTL: Math.round(r.iyilestme),
        sapmaGercekPct: r.sapmaGercekPct != null ? Number(r.sapmaGercekPct.toFixed(1)) : null,
      }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), ay === 3 ? "Hesap_Mart_YTD" : "Hesap_Temmuz_YTD");
  }

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      bransPrimRows.map((r) => ({
        ...r,
        v2ButceBrut: Math.round(r.v2ButceBrut),
        gercekBrut: Math.round(r.gercekBrut),
        fark: Math.round(r.fark),
      })),
    ),
    "Brans_Prim",
  );

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      sapma.map((r) => ({
        anchorAy: r.anchorAy,
        hesapKodu: r.hesapKodu,
        hesapAdi: r.hesapAdi,
        mizanYTD: Math.round(r.mizanYtd),
        v2GercekPrimYTD: Math.round(r.v2GercekPrimYtd),
        deltaGercekPrim: Math.round(r.deltaGercekPrim),
        deltaButce: Math.round(r.deltaButce),
        iyilestmeTL: Math.round(r.iyilestme),
      })),
    ),
    "Sapma_GercekPrim",
  );

  XLSX.writeFile(wb, OUT_XLSX);

  // Konsol özeti
  console.log("=== V2 Gerçekleşen Prim Backtest ===");
  console.log(`Excel: ${OUT_XLSX}`);
  console.log(`Bütçe brüt prim: ${Math.round(butceBrut).toLocaleString("tr-TR")}`);
  console.log(`Gerçek brüt prim (YTD ${gercek.maxAy} ay): ${Math.round(gercek.brutToplam).toLocaleString("tr-TR")}`);
  for (const ay of ANCHOR_AYLAR) {
    const safi = karsilastirma.find((r) => r.hesapKodu === "9003" && r.anchorAy === ay)!;
    console.log(`\n--- Ay ${ay} Safi TKZ ---`);
    console.log(`  Mizan:           ${Math.round(safi.mizanYtd).toLocaleString("tr-TR")}`);
    console.log(`  V2 bütçe prim:   ${Math.round(safi.v2ButceYtd).toLocaleString("tr-TR")}  Δ=${Math.round(safi.deltaButce).toLocaleString("tr-TR")}`);
    console.log(`  V2 gerçek prim:  ${Math.round(safi.v2GercekPrimYtd).toLocaleString("tr-TR")}  Δ=${Math.round(safi.deltaGercekPrim).toLocaleString("tr-TR")}`);
    console.log(`  İyileşme (|Δ|):   ${Math.round(safi.iyilestme).toLocaleString("tr-TR")}`);
  }

  const hedefHesaplar = ["601011", "601012", "601031", "601032", "61401", "61408", "611"];
  console.log("\n--- Kilit hesaplar (Temmuz, gerçek prim sonrası |Δ|) ---");
  for (const h of hedefHesaplar) {
    const row = karsilastirma.find((r) => r.hesapKodu === h && r.anchorAy === 7)
      ?? karsilastirma.find((r) => r.hesapKodu.startsWith(h) && r.anchorAy === 7);
    if (!row) continue;
    console.log(
      `  ${row.hesapKodu.padEnd(8)} mizan=${Math.round(row.mizanYtd).toLocaleString("tr-TR").padStart(14)}  v2G=${Math.round(row.v2GercekPrimYtd).toLocaleString("tr-TR").padStart(14)}  |Δ|=${Math.round(Math.abs(row.deltaGercekPrim)).toLocaleString("tr-TR")}`,
    );
  }

  const tutmayan = sapma.filter((r) => r.anchorAy === 7).length;
  console.log(`\nTemmuz YTD: ${tutmayan} hesap |Δ| > 50k (gerçek prim senaryosu)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
