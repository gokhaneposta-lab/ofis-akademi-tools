/**
 * Segment skoru (HD ve Hayat/Emeklilik ayrı) → Excel.
 * Kullanım (repo kökü): npx --yes tsx scripts/tsb-segment-export-xlsx.ts [donem] [çıktı.xlsx]
 * Varsayılan: donem=2025-4, çıktı=data/tsb/out/segment-skor-2025-4.xlsx
 */

import { readFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import XLSX from "xlsx";
import type { TsbGelirTidyRowLike } from "../lib/tsbYatirimGeliriKpi";
import {
  SEGMENT_SKOR_KPI_VARSAYILAN,
  segmentPeerSirketKodlari,
  sirketSegmentSkoruFromRows,
  tertileSegmentEtiketleri,
  type SegmentSkorPool,
} from "../lib/tsbSirketSegmentSkor";

function kpiLabel(id: string): string {
  const d = SEGMENT_SKOR_KPI_VARSAYILAN.find((x) => x.id === id);
  return d?.labelTr ?? id;
}

function sirketAdi(rows: TsbGelirTidyRowLike[], donem: string, kod: number): string {
  return (
    rows.find((x) => x.donem === donem && x.sirketKodu === kod)?.sirketAdi?.trim() ?? ""
  );
}

function roundNum(x: number, d: number): number {
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

function buildPoolSheets(
  rows: TsbGelirTidyRowLike[],
  donem: string,
  pool: SegmentSkorPool,
): { ozet: (string | number)[][]; kpi: (string | number)[][]; ham: (string | number)[][] } {
  const peers = segmentPeerSirketKodlari(rows, donem, pool);
  const skorlar = peers
    .map((kod) => {
      const son = sirketSegmentSkoruFromRows(rows, donem, kod, { pool });
      return son ? { sirketKodu: kod, segmentSkoru: son.segmentSkoru, son } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const tert = tertileSegmentEtiketleri(skorlar);
  const sirali = [...skorlar].sort((a, b) => b.segmentSkoru - a.segmentSkoru);

  const ozet: (string | number)[][] = [
    [
      "donem",
      "pool",
      "sira",
      "sirketKodu",
      "sirketAdi",
      "segmentSkoru",
      "segmentHarf",
      "segmentAdi",
      "peerSayisi",
      "brutPrim_TL",
      "VOK_TL",
      "safiTeknikKZ_TL",
      "yatirimGeliriSegment_TL",
      "ozsermaye_TL",
      "toplamAktif_TL",
      "yukPasif34_TL",
      "nakitVeFinansal10_11_TL",
    ],
  ];
  for (const { sirketKodu, segmentSkoru, son } of sirali) {
    const t = tert.get(sirketKodu)!;
    const h = son.ham;
    ozet.push([
      donem,
      pool,
      t.sira,
      sirketKodu,
      sirketAdi(rows, donem, sirketKodu),
      Math.round(segmentSkoru * 100) / 100,
      t.harf,
      t.segmentAdiTr,
      son.peerSayisi,
      roundNum(h.brutPrim, 2),
      roundNum(h.vok, 2),
      roundNum(h.safiTeknikKz, 2),
      roundNum(h.yatirimGeliriSegment, 2),
      roundNum(h.ozsermaye, 2),
      roundNum(h.toplamAktif, 2),
      roundNum(h.toplamYukPasif34, 2),
      roundNum(h.nakitVeFinansalAktif10_11, 2),
    ]);
  }

  const ham: (string | number)[][] = [
    [
      "donem",
      "pool",
      "sira",
      "sirketKodu",
      "sirketAdi",
      "segmentSkoru",
      "brutPrim_TL",
      "VOK_TL",
      "safiTeknikKZ_TL",
      "yatirimGeliriSegment_TL",
      "ozsermaye_TL",
      "toplamAktif_TL",
      "yukPasif34_TL",
      "nakitVeFinansal10_11_TL",
      "brutPrim_log10",
      "oran_safi_prim",
      "oran_VOK_ozsermaye",
      "oran_yatirimSegment_ozsermaye",
      "oran_ozsermaye_aktif",
      "oran_yuk_aktif",
      "oran_nakitFin10_11_aktif",
    ],
  ];
  for (const { sirketKodu, segmentSkoru, son } of sirali) {
    const t = tert.get(sirketKodu)!;
    const h = son.ham;
    const or = (x: number | null) => (x === null || !Number.isFinite(x) ? "" : roundNum(x, 8));
    ham.push([
      donem,
      pool,
      t.sira,
      sirketKodu,
      sirketAdi(rows, donem, sirketKodu),
      roundNum(segmentSkoru, 4),
      roundNum(h.brutPrim, 2),
      roundNum(h.vok, 2),
      roundNum(h.safiTeknikKz, 2),
      roundNum(h.yatirimGeliriSegment, 2),
      roundNum(h.ozsermaye, 2),
      roundNum(h.toplamAktif, 2),
      roundNum(h.toplamYukPasif34, 2),
      roundNum(h.nakitVeFinansalAktif10_11, 2),
      roundNum(h.brutPrimLog10, 6),
      or(h.oranSafiPrim),
      or(h.oranVokOzsermaye),
      or(h.oranYatirimOzsermaye),
      or(h.oranOzAktif),
      or(h.oranYukAktif),
      or(h.oranFinAktif),
    ]);
  }

  const kpi: (string | number)[][] = [
    [
      "donem",
      "pool",
      "sirketKodu",
      "sirketAdi",
      "kpiId",
      "kpiAdi",
      "minMaxHamGirdi",
      "minMaxHamGirdi_aciklama",
      "puan0_100",
      "agirlik_pct",
      "skoraKatkisi",
      "aciklama_katkisi",
    ],
  ];

  for (const { sirketKodu, son } of sirali) {
    const ad = sirketAdi(rows, donem, sirketKodu);
    let wKu = 0;
    for (const b of son.bilesenler) {
      if (b.puan !== null && Number.isFinite(b.puan)) wKu += b.agirlik;
    }
    for (const b of son.bilesenler) {
      const puan = b.puan;
      const katki =
        puan !== null && Number.isFinite(puan) && wKu > 0
          ? (b.agirlik / wKu) * puan
          : "";
      const acik =
        puan === null
          ? "Tanımsız ham oran veya peer verisi yok — bu KPI skora dahil edilmedi (ağırlık yeniden dağıtıldı)."
          : wKu > 0
            ? "(agirlik / kullanilan_agirlik_toplami) * puan; satırların skoraKatkisi toplamı ≈ segmentSkoru."
            : "";
      const hamDegerVal = b.hamDeger;
      const hamStr =
        hamDegerVal === null || hamDegerVal === undefined || !Number.isFinite(hamDegerVal)
          ? ""
          : roundNum(hamDegerVal, 10);
      const hamAcik =
        b.kpiId === "prim_olcek_log10"
          ? "min-max girdisi: log10(brutPrim); TL HamMetrik sayfasında."
          : b.kpiId === "safi_prim"
            ? "min-max girdisi: safiTeknikKZ_TL / brutPrim_TL; TL değerler HamMetrik sayfasında."
            : b.kpiId === "vok_ozsermaye"
              ? "min-max girdisi: VOK_TL / ozsermaye_TL; TL HamMetrik sayfasında."
              : b.kpiId === "yatirim_ozsermaye"
                ? "min-max girdisi: yatirimGeliriSegment_TL / ozsermaye_TL; TL HamMetrik sayfasında."
                : b.kpiId === "oz_aktif"
                  ? "min-max girdisi: ozsermaye_TL / toplamAktif_TL; TL HamMetrik sayfasında."
                  : b.kpiId === "yuk_aktif"
                    ? "min-max girdisi: yukPasif34_TL / toplamAktif_TL (düşük iyi); TL HamMetrik sayfasında."
                    : b.kpiId === "fin_aktif"
                      ? "min-max girdisi: nakitVeFinansal10_11_TL / toplamAktif_TL; TL HamMetrik sayfasında."
                      : "";
      kpi.push([
        donem,
        pool,
        sirketKodu,
        ad,
        b.kpiId,
        kpiLabel(b.kpiId),
        hamStr,
        hamAcik,
        puan === null ? "" : Math.round(puan * 100) / 100,
        Math.round(b.agirlik * 10000) / 100,
        katki === "" ? "" : Math.round(Number(katki) * 10000) / 10000,
        acik,
      ]);
    }
  }

  return { ozet, kpi, ham };
}

function main() {
  const root = process.cwd();
  const pathJson = join(root, "public", "data", "tsb", "gelir-tidy.json");
  const rows = JSON.parse(readFileSync(pathJson, "utf8")) as TsbGelirTidyRowLike[];

  let donem = "2025-4";
  let outPath = "";
  for (const a of process.argv.slice(2)) {
    if (/^\d{4}-\d$/.test(a)) donem = a;
    else if (/\.xlsx$/i.test(a)) {
      outPath =
        a.startsWith("/") || /^[A-Za-z]:[\\/]/.test(a) || a.startsWith("\\\\")
          ? a
          : join(root, a);
    }
  }
  if (!outPath) outPath = join(root, "data", "tsb", "out", `segment-skor-${donem}.xlsx`);

  const notlar: (string | number)[][] = [
    ["Segment skoru ve güncelleme notları"],
    [""],
    [
      "Skor 0–100 neden çoğu şirkette 60 üstüne çıkmıyor?",
      "Bu bir hata değil. Her KPI için ham değer (ör. SAFİ/prim), aynı havuzdaki (HD veya Hayat/Emeklilik) tüm şirketler arasında min–max ile 0–100 puana çevriliyor; ardından ağırlıklı ortalama alınıyor. Bir şirketin tüm boyutlarda aynı anda en iyi (100) olması nadirdir; skorlar genelde 35–65 bandında kümelenir. Mutlak 'iyi' için ham oranlara veya sektör dışı eşiğe bakın.",
    ],
    [""],
    [
      "Segment güncelleme sıklığı",
      "İş kuralı: Segment yılda bir kez, yıl sonu (4. çeyrek) TSB tidy verisi geldikten sonra güncellenir. Bu dosya dönemi: " +
        donem +
        ". Bir sonraki planlı güncelleme: 2026-4 verisi yayımlandığında (aynı hesaplama + yeni Excel).",
    ],
    [""],
    ["Segment adı (A/B/C)", "Aynı havuz içinde skora göre sıralama: üst üçte birlik = A, orta = B, alt = C (tertileSegmentEtiketleri)."],
    [""],
    ["Pool HD", "Hayat dışı şirketler (tip HD, kod 3… değil) kendi aralarında."],
    ["Pool HAYAT_EMEKLILIK", "Hayat ve emeklilik şirketleri (tip H/E veya kod 3…) kendi aralarında."],
    [""],
    [
      "HamMetrik_* sayfaları",
      "Her şirket için TSB tidy'den gelen TL tutarlar ve hesaplanan oranlar (VÖK, SAFİ teknik K/Z, brüt prim, bilanço kalemleri). KPI sayfasındaki minMaxHamGirdi bu oranlardan veya log10(brüt prim)'dan türetilir.",
    ],
  ];

  const hd = buildPoolSheets(rows, donem, "HD");
  const he = buildPoolSheets(rows, donem, "HAYAT_EMEKLILIK");

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(notlar), "Notlar");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hd.ozet), "Ozet_HD");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hd.ham), "HamMetrik_HD");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hd.kpi), "KPI_HD");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(he.ozet), "Ozet_HayatEmeklilik");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(he.ham), "HamMetrik_HayatEmeklilik");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(he.kpi), "KPI_HayatEmeklilik");

  mkdirSync(dirname(outPath), { recursive: true });
  XLSX.writeFile(wb, outPath);
  console.log("Yazildi:", outPath);
}

main();
