/**
 * Branş × tarife dağılım izi — terminal çıktısı.
 * Kullanım: node --env-file=.env.local scripts/butce-trace-brans-tarife.mjs 701 YANGIN
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// .env.local yükle (node --env-file yoksa)
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath) && !process.env.BLOB_READ_WRITE_TOKEN) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = /^([^#=]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const brans = process.argv[2] ?? "701";
const tarife = process.argv[3] ?? "YANGIN";

const { loadMizanRows, loadSatisButceRows, loadTarifeMapRows, loadUretimRows, loadPrimBransHedef } =
  await import("../lib/butce/loadData.ts");
const { DagitimMotoru, tarifeOzetFromSatis } = await import("../lib/butce/prim/dagitimMotoru.ts");
const { buildBransTarifeIzleme } = await import("../lib/butce/prim/bransDagitimTrace.ts");

const satisRows = await loadSatisButceRows();
const mizan = await loadMizanRows();
const tarifeMap = await loadTarifeMapRows();
const uretim = await loadUretimRows();

if (!satisRows.length) {
  console.error("SATIS_BUTCE yok — Blob token veya yerel data gerekli.");
  process.exit(1);
}

const tarifeOzet = tarifeOzetFromSatis(satisRows);
const tarifeHedefleri = {};
for (const r of tarifeOzet) tarifeHedefleri[r.tarifeGrubu] = r.yeniHedef;

const yanginHedef = tarifeHedefleri[tarife];
console.log(`\n=== ${brans} / ${tarife} dağılım izi ===`);
console.log(`${tarife} tarife hedefi (SATIS_BUTCE yeniHedef): ${fmt(yanginHedef)} TL\n`);

const motor = new DagitimMotoru(uretim, tarifeMap, mizan);
const sonuc = motor.dagit({
  satisRows,
  referansEtiket: "2024",
  mizanYedek: true,
  tarifeHedefleri,
});

const iz = buildBransTarifeIzleme(sonuc.detay, satisRows, tarifeHedefleri, brans, tarife);
const hedef701 = (await loadPrimBransHedef())?.[brans];

console.log(
  "Kolonlar: Kanal1 | Kanal2 | tarifeSatirPay | satirHedef | bransPay | bransTutar | kaynak",
);
console.log("-".repeat(100));

for (const r of iz.satirlar) {
  console.log(
    [
      r.kanal1.padEnd(14),
      r.kanal2.padEnd(16),
      pct(r.tarifeSatirPayi).padStart(8),
      fmt(r.satirHedef).padStart(14),
      pct(r.bransPayi).padStart(8),
      fmt(r.bransHedef).padStart(14),
      r.kaynak,
    ].join(" | "),
  );
  console.log(
    `  → ${fmt(yanginHedef)} × ${pct(r.tarifeSatirPayi)} × ${pct(r.bransPayi)} = ${fmt(r.bransHedef)}`,
  );
}

console.log("-".repeat(100));
console.log(`${brans} TOPLAM: ${fmt(iz.toplamBransHedef)} TL (${pct(iz.tarifeIcindeOran)} ${tarife})`);
if (hedef701 != null) {
  console.log(`Kayıtlı prim-brans-hedef ${brans}: ${fmt(hedef701)} TL`);
}
console.log(`Dağıtılan genel toplam: ${fmt(sonuc.ozet.dagitilan)} | Dağıtılamayan: ${fmt(sonuc.ozet.dagitilamayan)}\n`);

function fmt(n) {
  return Math.round(n).toLocaleString("tr-TR");
}
function pct(n) {
  return `${(n * 100).toFixed(2)}%`;
}
