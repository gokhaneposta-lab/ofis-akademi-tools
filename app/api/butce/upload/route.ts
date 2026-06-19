import { NextResponse } from "next/server";
import { importMizanFromBuffer } from "@/lib/butce/import/mizanImport";
import { importSatisButceFromBuffer } from "@/lib/butce/import/satisButceImport";
import { importTarifeMapFromBuffer } from "@/lib/butce/import/tarifeMapImport";
import { importUretimFromBuffer } from "@/lib/butce/import/uretimImport";
import {
  BUTCE_META_JSON,
  BUTCE_MIZAN_JSON,
  BUTCE_SATIS_BUTCE_JSON,
  BUTCE_TARIFE_MAP_JSON,
  BUTCE_URETIM_JSON,
} from "@/lib/butce/paths";
import { loadButceMeta } from "@/lib/butce/loadData";
import type { ButceMeta } from "@/lib/butce/types";
import {
  storageDurumu,
  vercelBlobGerekliMesaji,
  writePrivateFile,
} from "@/lib/butce/storage";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const KINDS = new Set(["mizan", "butce_map", "tarife_map", "satis_butce", "uretim"]);

export async function POST(request: Request) {
  const blobUyari = vercelBlobGerekliMesaji();
  if (blobUyari) {
    return NextResponse.json(
      { error: "Depolama yapılandırılmamış", detail: blobUyari },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch (e) {
    return NextResponse.json(
      { error: "Form okunamadı", detail: e instanceof Error ? e.message : String(e) },
      { status: 400 },
    );
  }

  const kind = String(form.get("kind") ?? "");
  const file = form.get("file");
  const butceYili = parseInt(String(form.get("butceYili") ?? "2027"), 10);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  }

  if (!KINDS.has(kind)) {
    return NextResponse.json(
      { error: "kind: mizan | butce_map | tarife_map | satis_butce | uretim" },
      { status: 400 },
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
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
    if (kind === "butce_map" || kind === "tarife_map") outFiles.push(BUTCE_TARIFE_MAP_JSON);
    if (kind === "satis_butce") outFiles.push(BUTCE_SATIS_BUTCE_JSON);
    if (kind === "uretim") outFiles.push(BUTCE_URETIM_JSON);

    return NextResponse.json({
      ok: true,
      kind,
      log: logs.join("; "),
      meta,
      storage: storage.mode,
      outFiles,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Import başarısız", detail }, { status: 500 });
  }
}
