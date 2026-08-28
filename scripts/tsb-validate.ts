/**
 * TSB veri tutarlılık kontrolleri (read-only).
 *
 * Not: Prim aylık, finansal çeyrekliktir — farklı yayın ritimleri hata değildir.
 * Dosya mtime veya “hangi set daha yeni?” kriteri kullanılmaz.
 *
 *   npx --yes tsx scripts/tsb-validate.ts
 */

import { existsSync } from "fs";
import { join } from "path";
import { isTsbToplamSirketKodu } from "../lib/tsbPrimDashboard";
import { finansalPeerSirketKodlari } from "../lib/tsbFinansalKarsilastirmaData";
import { buildGelirTidyDonemLookup } from "../lib/tsbSirketSegmentSkor";
import { buildSektorGorunumuDonem, buildSektorPrimDonem } from "../lib/tsbSektorGorunumu";
import type { TsbPrimRow } from "../lib/tsbPrimDashboard";
import {
  latestDonemFromList,
  readGelirDonem,
  readGelirIndex,
  readMeta,
  readPrimRows,
  repoRoot,
  TSB_GELIR_DIR_REL,
} from "./lib/tsb-readonly-helpers";

type Check = { id: string; pass: boolean; detail: string };

const results: Check[] = [];

function record(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id}: ${detail}`);
}

function info(detail: string) {
  console.log(`INFO ${detail}`);
}

function warn(detail: string) {
  console.log(`WARN ${detail}`);
}

function primDonemlerFromRows(rows: TsbPrimRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) {
    if (typeof r.donem === "string" && r.donem) set.add(r.donem);
  }
  return [...set];
}

/** Finansal çeyrek `YYYY-Q` → kıyaslanabilir prim ayı `YYYY-MM` (çeyrek son ayı). */
function primAyForFinCeyrek(finDonem: string): string | null {
  const m = finDonem.match(/^(\d{4})-([1-4])$/);
  if (!m) return null;
  const q = Number(m[2]);
  const month = q * 3;
  return `${m[1]}-${String(month).padStart(2, "0")}`;
}

function relativeDiff(a: number, b: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const denom = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) / denom;
}

function main() {
  const meta = readMeta();
  const gelirIndex = readGelirIndex();
  const primRows = readPrimRows();
  const primDonemler = primDonemlerFromRows(primRows);
  const sonPrimVeri = latestDonemFromList(primDonemler);
  const sonFinVeri = latestDonemFromList(gelirIndex);

  record("meta-exists", meta !== null, meta ? `schema v${meta.schemaVersion}` : "meta.json yok");

  if (meta) {
    record(
      "meta-finansal-in-index",
      gelirIndex.includes(meta.sonFinansalDonem),
      `meta.sonFinansalDonem=${meta.sonFinansalDonem}`,
    );

    record(
      "meta-finansal-latest",
      meta.sonFinansalDonem === sonFinVeri,
      `meta=${meta.sonFinansalDonem}, gelir-tidy son=${sonFinVeri}`,
    );

    record(
      "meta-prim-in-data",
      primDonemler.includes(meta.sonPrimDonem),
      `meta.sonPrimDonem=${meta.sonPrimDonem}`,
    );

    record(
      "meta-prim-latest",
      meta.sonPrimDonem === sonPrimVeri,
      `meta=${meta.sonPrimDonem}, prim-tidy son=${sonPrimVeri}`,
    );

    info(
      `prim-fin-ritim: prim=${meta.sonPrimDonem}, finansal=${meta.sonFinansalDonem} — farklı yayın takvimi normaldir; hata sayılmaz`,
    );
  }

  const missingFiles = gelirIndex.filter(
    (d) => !existsSync(join(repoRoot(), TSB_GELIR_DIR_REL, `${d}.json`)),
  );
  record(
    "gelir-index-files",
    missingFiles.length === 0,
    missingFiles.length === 0
      ? `${gelirIndex.length} dönem dosyası mevcut`
      : `eksik: ${missingFiles.join(", ")}`,
  );

  const finDonem = meta?.sonFinansalDonem ?? sonFinVeri;
  if (finDonem) {
    const rows = readGelirDonem(finDonem);
    const lookup = buildGelirTidyDonemLookup(rows, finDonem);
    const hdPeers = finansalPeerSirketKodlari(rows, finDonem, "HD");
    const hePeers = finansalPeerSirketKodlari(rows, finDonem, "HAYAT_EMEKLILIK");
    const toplamInPeers = [...hdPeers, ...hePeers].filter((k) => isTsbToplamSirketKodu(k));

    record(
      "peer-no-tsb-total",
      toplamInPeers.length === 0,
      toplamInPeers.length === 0
        ? `${finDonem}: peer kümesinde 9000/9001/9003 yok`
        : `TSB toplam kodları peer'da: ${toplamInPeers.join(", ")}`,
    );

    const hdWithData = hdPeers.filter((k) => lookup.has(k)).length;
    const heWithData = hePeers.filter((k) => lookup.has(k)).length;

    if (meta) {
      record(
        "meta-hd-count",
        hdWithData === meta.sirketSayisiHd,
        `beklenen HD=${meta.sirketSayisiHd}, lookup=${hdWithData}`,
      );
      record(
        "meta-he-count",
        heWithData === meta.sirketSayisiHayatEmeklilik,
        `beklenen H/E=${meta.sirketSayisiHayatEmeklilik}, lookup=${heWithData}`,
      );
    }

    record(
      "gelir-donem-nonempty",
      rows.length > 0,
      `${finDonem}: ${rows.length} satır`,
    );

    const kiyasPrimAy = primAyForFinCeyrek(finDonem);
    if (kiyasPrimAy && primDonemler.includes(kiyasPrimAy) && gelirIndex.includes(finDonem)) {
      const primSektor = buildSektorPrimDonem(primRows, kiyasPrimAy).SEKTOR;
      const finSektor = buildSektorGorunumuDonem(rows, finDonem).SEKTOR.brutPrim;
      const diff = relativeDiff(primSektor, finSektor);
      const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
      const detail = `prim ${kiyasPrimAy}=${fmt(primSektor)} TL vs fin GT ${finDonem}=${fmt(finSektor)} TL`;
      if (diff !== null && diff > 0.05) {
        warn(
          `brut-prim-cross: ${detail} — kaynaklar arasında %${(diff * 100).toFixed(1)} fark; bu hata kanıtı değildir (dönem/kapsam/tanım farkı olabilir, incelenmeli)`,
        );
      } else {
        info(`brut-prim-cross: ${detail} — kıyaslanabilir dönem, fark kabul edilebilir`);
      }
    } else if (kiyasPrimAy) {
      info(
        `brut-prim-cross: ${finDonem} ↔ ${kiyasPrimAy} kıyası atlandı (prim veya finansal dönem eksik)`,
      );
    }
  }

  record(
    "prim-nonempty",
    primRows.length > 0,
    `${primRows.length} prim satırı, ${primDonemler.length} dönem`,
  );

  const failed = results.filter((r) => !r.pass).length;
  console.log("");
  if (failed > 0) {
    console.error(`Sonuç: ${failed}/${results.length} kontrol başarısız`);
    process.exit(1);
  }
  console.log(`Sonuç: ${results.length} kontrol geçti`);
}

main();
