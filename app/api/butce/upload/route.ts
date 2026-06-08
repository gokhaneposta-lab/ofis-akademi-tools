import { NextResponse } from "next/server";
import { importMizanFromBuffer } from "@/lib/butce/import/mizanImport";
import { BUTCE_META_JSON, BUTCE_MIZAN_JSON } from "@/lib/butce/paths";
import {
  storageDurumu,
  vercelBlobGerekliMesaji,
  writePrivateFile,
} from "@/lib/butce/storage";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const blobUyari = vercelBlobGerekliMesaji();
  if (blobUyari) {
    return NextResponse.json(
      {
        error: "Depolama yapılandırılmamış",
        detail: blobUyari,
      },
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

  if (kind !== "mizan") {
    return NextResponse.json({ error: "kind: mizan (BUTCE_MAP.xlsx)" }, { status: 400 });
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const { rows, meta, log } = importMizanFromBuffer(buf, butceYili);

    await writePrivateFile(BUTCE_MIZAN_JSON, JSON.stringify(rows));
    await writePrivateFile(BUTCE_META_JSON, JSON.stringify(meta, null, 2));

    const storage = storageDurumu();

    return NextResponse.json({
      ok: true,
      kind,
      log,
      meta,
      storage: storage.mode,
      outFile: BUTCE_MIZAN_JSON,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Import başarısız", detail }, { status: 500 });
  }
}
