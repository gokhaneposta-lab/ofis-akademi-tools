import { buildV3GelirTablosu } from "../lib/butce/v3/buildV3GelirTablosu";
import { v3DefaultsStore2026 } from "../lib/butce/v3/defaults2026";
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
} from "../lib/butce/loadData";

const tl = (n: number) => Math.round(n).toLocaleString("tr-TR");
const ytd = (ser: number[] | undefined) => (ser ?? []).slice(0, 7).reduce((a, x) => a + x, 0);

async function main() {
  const [
    satis, uretim, tarifeMap, tarifeBransPay, mizan, mizanAylik, mizanAylikFull,
    bilancoAylik, oranAyar, kpkVade, kapanisTahmin,
  ] = await Promise.all([
    loadSatisButceRows(), loadUretimRows(), loadTarifeMapRows(), loadTarifeBransPayRows(),
    loadMizanRows(), loadMizanAylikRows(), loadMizanAylikFullRows(), loadBilancoAylikRows(),
    loadOranAyarlar(), loadKpkVadeRows(), loadKpkKapanisTahmin(),
  ]);

  const sonuc = buildV3GelirTablosu({
    varsayimlar: v3DefaultsStore2026(),
    satisRows: satis, uretim, tarifeMap, tarifeBransPay, mizan, mizanAylik, mizanAylikFull,
    bilancoAylik, oranAyar, kpkVade, kapanisTahmin,
  });

  const gt = sonuc.gt;
  for (const sat of [9, 94, 9001, 9002, 9003, 190, 191, 192, 193, 194, 9004, 9006, 176]) {
    console.log(`F${sat} YTD`, tl(ytd(gt.aylikToplam[sat])));
  }
  console.log("F9+F94", tl(ytd(gt.aylikToplam[9]) + ytd(gt.aylikToplam[94])));
  console.log("9001+9002", tl(ytd(gt.aylikToplam[9001]) + ytd(gt.aylikToplam[9002])));
  console.log("recon mizan safi", tl(sonuc.v3.mizanRecon?.safiTkzMizan ?? 0));
  console.log("recon v3 safi", tl(sonuc.v3.mizanRecon?.safiTkzV3 ?? 0));
}

main();
