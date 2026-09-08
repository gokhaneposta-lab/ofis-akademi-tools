/**
 * Branş bazlı muallak (611*) kalem kalem döküm — Trafik / Nakliyat / Mühendislik.
 * npx tsx scripts/butce-muallak-brans-dokum.ts
 * npx tsx scripts/butce-muallak-brans-dokum.ts 715 714
 */
import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
import { extractMizanGtAylik } from "../lib/butce/v3/mizanGtExtract";
import { anaBrans, bransAdi } from "../lib/butce/config/brans";
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

const MUALLAK_SATIRLAR: Array<{ satir: number; hesap: string; ad: string }> = [
  { satir: 114, hesap: "611", ad: "Muallak has. karş. değişim (net)" },
  { satir: 115, hesap: "61101", ad: "Brüt muallak değişim" },
  { satir: 116, hesap: "611011", ad: "Brüt muallak (cari)" },
  { satir: 126, hesap: "611012", ad: "Devreden brüt muallak" },
  { satir: 136, hesap: "61102", ad: "Muallak RE payı değişim (net)" },
  { satir: 137, hesap: "611021", ad: "Muallak RE payı (cari)" },
  { satir: 147, hesap: "611022", ad: "Devreden muallak RE payı" },
];

const ANA_GRUP_FILTRE = ["TRAFİK", "NAKLİYAT", "MÜHENDİSLİK"];

function flattenMuallak(nodes: V2HesapDugum[]): V2HesapDugum[] {
  const out: V2HesapDugum[] = [];
  for (const n of nodes) {
    if (n.hesap?.startsWith("611")) out.push(n);
    if (n.children) out.push(...flattenMuallak(n.children));
  }
  return out;
}

function ytdSer(ser: number[] | undefined, anchor: number): number {
  return (ser ?? []).slice(0, anchor).reduce((a, x) => a + x, 0);
}

function h2Ser(ser: number[] | undefined, anchor: number): number {
  return (ser ?? []).slice(anchor).reduce((a, x) => a + x, 0);
}

function kaynakEtiket(
  satir: number,
  ytdMotor: number,
  ytdMizan: number,
  h2: number,
): string {
  if (satir === 126 || satir === 147) {
    return Math.abs(h2) < 1 ? "YTD mizan (Ocak); H2=0 devreden" : "YTD mizan + H2";
  }
  if (Math.abs(ytdMotor - ytdMizan) < 1000 && Math.abs(ytdMizan) > 1) {
    return Math.abs(h2) > 1 ? "YTD mizan + H2 artık pay" : "YTD mizan kilidi";
  }
  if (Math.abs(h2) > 1) return "YTD mizan + H2 artık pay (F325 residual)";
  if (Math.abs(ytdMotor) > 1) return "YTD mizan";
  return "—";
}

function dokumBrans(
  gt: ReturnType<typeof buildV3GelirTablosu>["gt"],
  mizanBrans: Map<number, number[]> | undefined,
  bransKodu: string,
  anchor: number,
): void {
  const b = gt.branslar.find((x) => x.bransKodu === bransKodu);
  if (!b) {
    console.log(`\nBranş ${bransKodu} bulunamadı.`);
    return;
  }

  const ab = gt.aylikBrans[bransKodu] ?? {};
  const prim = b.degerler[11] ?? 0;

  console.log(`\n${"=".repeat(90)}`);
  console.log(`BRANŞ ${bransKodu} — ${bransAdi(bransKodu)} (${anaBrans(bransKodu)})`);
  console.log(`Brüt prim (60001) yıllık: ${tl(prim)} | Anchor ay: ${anchor}`);
  console.log(`${"=".repeat(90)}`);
  console.log(
    "Hesap".padEnd(8) +
      " | " +
      "Kalem".padEnd(42) +
      " | " +
      "YTD(1-" + String(anchor).padStart(2) +
      ")".padEnd(8) +
      " | " +
      "H2".padStart(14) +
      " | " +
      "Yıllık".padStart(14) +
      " | Kaynak",
  );
  console.log("-".repeat(90));

  for (const { satir, hesap, ad } of MUALLAK_SATIRLAR) {
    const ser = ab[satir];
    const ytd = ytdSer(ser, anchor);
    const h2 = h2Ser(ser, anchor);
    const yillik = b.degerler[satir] ?? ytd + h2;
    const mizYtd = ytdSer(mizanBrans?.get(satir), anchor);
    const kaynak = kaynakEtiket(satir, ytd, mizYtd, h2);
    console.log(
      `${hesap.padEnd(8)} | ${ad.padEnd(42)} | ${tl(ytd).padStart(14)} | ${tl(h2).padStart(14)} | ${tl(yillik).padStart(14)} | ${kaynak}`,
    );
  }

  // Rollup kontrol
  const c61101 = (b.degerler[116] ?? 0) + (b.degerler[126] ?? 0);
  const c611 = (b.degerler[115] ?? 0) + (b.degerler[136] ?? 0);
  console.log("-".repeat(90));
  console.log(
    `Kontrol | 611011+611012 = ${tl(c61101)} vs 61101=${tl(b.degerler[115] ?? 0)} | 61101+61102=${tl(c611)} vs 611=${tl(b.degerler[114] ?? 0)}`,
  );

  // Aylık 611 net
  const ser611 = ab[114];
  if (ser611) {
    console.log(`\nAylık 611 (net): ${ser611.map((x) => tl(x)).join(" | ")}`);
  }
}

function dokumAnaGrup(
  gt: ReturnType<typeof buildV3GelirTablosu>["gt"],
  mizanGt: ReturnType<typeof extractMizanGtAylik>,
  ana: string,
  anchor: number,
): void {
  const kodlar = gt.branslar
    .map((b) => b.bransKodu)
    .filter((k) => anaBrans(k) === ana);

  if (kodlar.length === 0) return;

  console.log(`\n${"#".repeat(90)}`);
  console.log(`ANA GRUP: ${ana} (${kodlar.length} branş: ${kodlar.join(", ")})`);
  console.log(`${"#".repeat(90)}`);

  const toplam: Record<number, { ytd: number; h2: number; yillik: number }> = {};
  for (const s of MUALLAK_SATIRLAR) toplam[s.satir] = { ytd: 0, h2: 0, yillik: 0 };

  for (const kod of kodlar) {
    const b = gt.branslar.find((x) => x.bransKodu === kod)!;
    const ab = gt.aylikBrans[kod] ?? {};
    for (const { satir } of MUALLAK_SATIRLAR) {
      const ser = ab[satir];
      toplam[satir]!.ytd += ytdSer(ser, anchor);
      toplam[satir]!.h2 += h2Ser(ser, anchor);
      toplam[satir]!.yillik += b.degerler[satir] ?? 0;
    }
  }

  console.log(
    "Hesap".padEnd(8) +
      " | " +
      "Kalem".padEnd(42) +
      " | " +
      "YTD toplam".padStart(14) +
      " | " +
      "H2 toplam".padStart(14) +
      " | " +
      "Yıllık".padStart(14),
  );
  console.log("-".repeat(90));
  for (const { satir, hesap, ad } of MUALLAK_SATIRLAR) {
    const t = toplam[satir]!;
    console.log(
      `${hesap.padEnd(8)} | ${ad.padEnd(42)} | ${tl(t.ytd).padStart(14)} | ${tl(t.h2).padStart(14)} | ${tl(t.yillik).padStart(14)}`,
    );
  }

  for (const kod of kodlar) {
    dokumBrans(gt, mizanGt.bransSatir.get(kod), kod, anchor);
  }
}

async function main() {
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
  const mizanGt = extractMizanGtAylik(mizanAylikFull, varsayimlar.butceYili);

  console.log("V3 MUALLAK BRANŞ DÖKÜMÜ — Trafik / Nakliyat / Mühendislik");
  console.log(`TKZ şirket: ${tl(gt.toplam[9003] ?? 0)} | 611 şirket: ${tl(gt.toplam[114] ?? 0)}`);

  const argBrans = process.argv.slice(2);
  if (argBrans.length > 0) {
    for (const kod of argBrans) {
      dokumBrans(gt, mizanGt.bransSatir.get(kod), kod, anchor);
    }
    return;
  }

  for (const ana of ANA_GRUP_FILTRE) {
    dokumAnaGrup(gt, mizanGt, ana, anchor);
  }

  // Tüm branşlar özet — 611 yıllık sıralı
  console.log(`\n${"#".repeat(90)}`);
  console.log("TÜM BRANŞLAR — 611 yıllık (en negatiften)");
  console.log(`${"#".repeat(90)}`);
  const ozet = gt.branslar
    .map((b) => ({
      kod: b.bransKodu,
      ad: bransAdi(b.bransKodu),
      ana: anaBrans(b.bransKodu),
      m611: b.degerler[114] ?? 0,
      m61101: b.degerler[115] ?? 0,
      m611011: b.degerler[116] ?? 0,
      m611012: b.degerler[126] ?? 0,
      m61102: b.degerler[136] ?? 0,
      prim: b.degerler[11] ?? 0,
    }))
    .sort((a, b) => a.m611 - b.m611);

  console.log(
    "Br".padEnd(4) +
      " | " +
      "Branş".padEnd(35) +
      " | " +
      "611".padStart(12) +
      " | " +
      "611011".padStart(12) +
      " | " +
      "611012".padStart(12) +
      " | " +
      "61102".padStart(12),
  );
  console.log("-".repeat(95));
  for (const r of ozet) {
    if (Math.abs(r.m611) < 1000 && Math.abs(r.m61101) < 1000) continue;
    console.log(
      `${r.kod.padEnd(4)} | ${r.ad.slice(0, 35).padEnd(35)} | ${tl(r.m611).padStart(12)} | ${tl(r.m611011).padStart(12)} | ${tl(r.m611012).padStart(12)} | ${tl(r.m61102).padStart(12)}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
