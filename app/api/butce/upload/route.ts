import { NextResponse } from "next/server";
import {
  BUTCE_UPLOAD_KINDS,
  type ButceUploadKind,
  runButceUpload,
} from "@/lib/butce/import/runButceUpload";
import { vercelBlobGerekliMesaji } from "@/lib/butce/storage";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

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

  if (!BUTCE_UPLOAD_KINDS.has(kind as ButceUploadKind)) {
    return NextResponse.json(
      { error: "kind: mizan | butce_map | tarife_map | tarife_brans_pay | aylik_gt_bilanco | kpk_vade | faaliyet_gider | satis_butce | uretim" },
      { status: 400 },
    );
  }

  try {
    const buf = Buffer.from(await file.arrayBuffer());
    return NextResponse.json(await runButceUpload(kind as ButceUploadKind, buf, butceYili));
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Import başarısız", detail }, { status: 500 });
  }
}
