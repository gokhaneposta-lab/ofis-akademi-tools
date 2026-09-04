import { readFileSync } from "fs";
import { extractMizanGtAylik, ytdToplam } from "../lib/butce/v3/mizanGtExtract";
import { GT_KOD_TO_SATIR } from "../lib/butce/v3/gtKodHaritasi";

const full = JSON.parse(readFileSync("data/butce/private/mizan-aylik-full.json", "utf8"));
const y2026 = full.filter((r: { yil: number }) => Number(r.yil) === 2026);
console.log("2026 rows", y2026.length);
const kodlu = y2026.filter((r: { hesap: string }) => String(r.hesap).length > 0);
console.log("2026 kodlu rows", kodlu.length);
console.log("sample kodlu", kodlu[0]);
const hesaplar = new Set(kodlu.map((r: { hesap: string }) => String(r.hesap)));
console.log("unique hesap", hesaplar.size, "sample", [...hesaplar].slice(0, 10));
import { yaprakGtKodlari } from "../lib/butce/v3/gtKodHaritasi";

const kodSet = new Set<string>();
for (const r of kodlu) kodSet.add(String(r.hesap));
const yapraklar = yaprakGtKodlari(kodSet);
console.log("yaprak count", yapraklar.size, "has 0111", yapraklar.has("0111"), "has 01111", yapraklar.has("01111"));

let sum01111 = 0;
for (const r of kodlu) {
  if (String(r.hesap) === "01111" && r.ay === 7) sum01111 += r.tutar;
}
console.log("701 01111 ay7 kumul sample sum branches", sum01111);

const m = extractMizanGtAylik(full, 2026);
console.log("bransGt size", m.bransGt.size);
console.log("701 gt keys", m.bransGt.get("701") ? [...m.bransGt.get("701")!.keys()].slice(0,5) : "none");
const tl = (n: number) => Math.round(n).toLocaleString("tr-TR");

console.log("GT_KOD_TO_SATIR 012", GT_KOD_TO_SATIR["012"]);
console.log("GT_KOD_TO_SATIR 022", GT_KOD_TO_SATIR["022"]);
console.log("GT_KOD_TO_SATIR 021", GT_KOD_TO_SATIR["021"]);

for (const s of [9, 10, 11, 21, 22, 94, 114, 115, 136, 166, 177]) {
  console.log(`F${s}`, tl(ytdToplam(m.sirketSatir.get(s), 7)));
}

console.log("sirketSatir keys count", m.sirketSatir.size);
console.log("012 incremental ytd", tl(ytdToplam(m.sirketGt.get("012"), 7)));
console.log("022 incremental ytd", tl(ytdToplam(m.sirketGt.get("022"), 7)));
console.log("0111 incremental ytd", tl(ytdToplam(m.sirketGt.get("0111"), 7)));
