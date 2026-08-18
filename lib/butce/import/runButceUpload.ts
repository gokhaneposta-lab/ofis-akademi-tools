import { importAylikGtBilancoFromBuffer } from "@/lib/butce/import/aylikGtBilancoImport";
import { importFaaliyetGiderFromBuffer } from "@/lib/butce/import/faaliyetGiderImport";
import { importKpkVadeFromBuffer } from "@/lib/butce/import/kpkVadeImport";
import { importMizanFromBuffer } from "@/lib/butce/import/mizanImport";
import { importMizanAylikFromBuffer } from "@/lib/butce/import/mizanAylikImport";
import { importSatisButceFromBuffer } from "@/lib/butce/import/satisButceImport";
import { importTarifeBransPayFromBuffer } from "@/lib/butce/import/tarifeBransPayImport";
import { importTarifeMapFromBuffer } from "@/lib/butce/import/tarifeMapImport";
import { importUretimFromBuffer } from "@/lib/butce/import/uretimImport";
import { loadButceMeta } from "@/lib/butce/loadData";
import {
  BUTCE_BILANCO_AYLIK_JSON,
  BUTCE_FAALIYET_GIDER_JSON,
  BUTCE_KPK_VADE_JSON,
  BUTCE_META_JSON,
  BUTCE_MIZAN_AYLIK_FULL_JSON,
  BUTCE_MIZAN_AYLIK_JSON,
  BUTCE_MIZAN_JSON,
  BUTCE_SATIS_BUTCE_JSON,
  BUTCE_TARIFE_BRANS_PAY_JSON,
  BUTCE_TARIFE_MAP_JSON,
  BUTCE_URETIM_JSON,
} from "@/lib/butce/paths";
import { storageDurumu, writePrivateFile } from "@/lib/butce/storage";
import type { ButceMeta } from "@/lib/butce/types";

export const BUTCE_UPLOAD_KINDS = new Set([
  "mizan",
  "butce_map",
  "tarife_map",
  "tarife_brans_pay",
  "aylik_gt_bilanco",
  "kpk_vade",
  "faaliyet_gider",
  "satis_butce",
  "uretim",
] as const);

export type ButceUploadKind =
  | "mizan"
  | "butce_map"
  | "tarife_map"
  | "tarife_brans_pay"
  | "aylik_gt_bilanco"
  | "kpk_vade"
  | "faaliyet_gider"
  | "satis_butce"
  | "uretim";

export async function runButceUpload(
  kind: ButceUploadKind,
  buf: Buffer,
  butceYili: number,
) {
  const prevMeta = (await loadButceMeta()) ?? {
    schemaVersion: 2 as const,
    butceYili,
  };
  const logs: string[] = [];
  let meta: ButceMeta = { ...prevMeta, butceYili };

  if (kind === "mizan" || kind === "butce_map") {
    const { rows, meta: mizanMeta, log } = importMizanFromBuffer(buf, butceYili);
    await writePrivateFile(BUTCE_MIZAN_JSON, JSON.stringify(rows));
    meta = { ...meta, ...mizanMeta };
    logs.push(log);

    const aylik = importMizanAylikFromBuffer(buf);
    if (aylik.rows.length > 0) {
      await writePrivateFile(BUTCE_MIZAN_AYLIK_JSON, JSON.stringify(aylik.rows));
      meta.mizanAylikGuncellemeIso = new Date().toISOString();
      meta.mizanAylikSatirSayisi = aylik.rows.length;
      logs.push(aylik.log);
    }
  }

  if (kind === "butce_map" || kind === "tarife_map") {
    const { rows, log } = importTarifeMapFromBuffer(buf);
    await writePrivateFile(BUTCE_TARIFE_MAP_JSON, JSON.stringify(rows));
    meta.tarifeMapGuncellemeIso = new Date().toISOString();
    meta.tarifeMapSatirSayisi = rows.length;
    logs.push(log);
  }

  if (kind === "satis_butce") {
    const { rows, log } = importSatisButceFromBuffer(buf);
    await writePrivateFile(BUTCE_SATIS_BUTCE_JSON, JSON.stringify(rows));
    meta.satisButceGuncellemeIso = new Date().toISOString();
    meta.satisButceSatirSayisi = rows.length;
    logs.push(log);
  }

  if (kind === "tarife_brans_pay") {
    const { rows, log } = importTarifeBransPayFromBuffer(buf);
    await writePrivateFile(BUTCE_TARIFE_BRANS_PAY_JSON, JSON.stringify(rows));
    const yillar = rows.map((r) => r.yil);
    meta.tarifeBransPayGuncellemeIso = new Date().toISOString();
    meta.tarifeBransPaySatirSayisi = rows.length;
    meta.tarifeBransPayYilMin = Math.min(...yillar);
    meta.tarifeBransPayYilMax = Math.max(...yillar);
    logs.push(log);
  }

  if (kind === "aylik_gt_bilanco") {
    const { mizan, mizanAylik, mizanAylikFull, bilancoAylik, yillar, log } =
      importAylikGtBilancoFromBuffer(buf);
    await writePrivateFile(BUTCE_MIZAN_JSON, JSON.stringify(mizan));
    await writePrivateFile(BUTCE_MIZAN_AYLIK_JSON, JSON.stringify(mizanAylik));
    await writePrivateFile(BUTCE_MIZAN_AYLIK_FULL_JSON, JSON.stringify(mizanAylikFull));
    await writePrivateFile(BUTCE_BILANCO_AYLIK_JSON, JSON.stringify(bilancoAylik));
    const now = new Date().toISOString();
    meta.mizanGuncellemeIso = now;
    meta.mizanKaynak = "aylik-gt-koprusu";
    meta.mizanSatirSayisi = mizan.length;
    meta.mizanYilMin = yillar[0];
    meta.mizanYilMax = yillar[yillar.length - 1];
    meta.mizanAylikGuncellemeIso = now;
    meta.mizanAylikSatirSayisi = mizanAylik.length;
    meta.mizanAylikFullSatirSayisi = mizanAylikFull.length;
    meta.mizanAylikYilMin = yillar[0];
    meta.mizanAylikYilMax = yillar[yillar.length - 1];
    meta.bilancoAylikSatirSayisi = bilancoAylik.length;
    logs.push(log);
  }

  if (kind === "kpk_vade") {
    const { rows, log } = importKpkVadeFromBuffer(buf);
    await writePrivateFile(BUTCE_KPK_VADE_JSON, JSON.stringify(rows));
    meta.kpkVadeGuncellemeIso = new Date().toISOString();
    meta.kpkVadeSatirSayisi = rows.length;
    logs.push(log);
  }

  if (kind === "faaliyet_gider") {
    const { rows, log } = importFaaliyetGiderFromBuffer(buf, butceYili);
    await writePrivateFile(BUTCE_FAALIYET_GIDER_JSON, JSON.stringify(rows));
    meta.faaliyetGiderGuncellemeIso = new Date().toISOString();
    meta.faaliyetGiderSatirSayisi = rows.length;
    logs.push(log);
  }

  if (kind === "uretim") {
    const { rows, log } = importUretimFromBuffer(buf);
    await writePrivateFile(BUTCE_URETIM_JSON, JSON.stringify(rows));
    meta.uretimGuncellemeIso = new Date().toISOString();
    meta.uretimSatirSayisi = rows.length;
    logs.push(log);
  }

  await writePrivateFile(BUTCE_META_JSON, JSON.stringify(meta, null, 2));

  const storage = storageDurumu();
  const outFiles: string[] = [];
  if (kind === "mizan" || kind === "butce_map") outFiles.push(BUTCE_MIZAN_JSON);
  if (kind === "butce_map" && meta.mizanAylikSatirSayisi) outFiles.push(BUTCE_MIZAN_AYLIK_JSON);
  if (kind === "butce_map" || kind === "tarife_map") outFiles.push(BUTCE_TARIFE_MAP_JSON);
  if (kind === "tarife_brans_pay") outFiles.push(BUTCE_TARIFE_BRANS_PAY_JSON);
  if (kind === "aylik_gt_bilanco") {
    outFiles.push(
      BUTCE_MIZAN_JSON,
      BUTCE_MIZAN_AYLIK_JSON,
      BUTCE_MIZAN_AYLIK_FULL_JSON,
      BUTCE_BILANCO_AYLIK_JSON,
    );
  }
  if (kind === "kpk_vade") outFiles.push(BUTCE_KPK_VADE_JSON);
  if (kind === "faaliyet_gider") outFiles.push(BUTCE_FAALIYET_GIDER_JSON);
  if (kind === "satis_butce") outFiles.push(BUTCE_SATIS_BUTCE_JSON);
  if (kind === "uretim") outFiles.push(BUTCE_URETIM_JSON);

  return {
    ok: true as const,
    kind,
    log: logs.join("; "),
    meta,
    storage: storage.mode,
    outFiles,
  };
}
