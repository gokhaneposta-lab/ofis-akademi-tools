import { get } from "@vercel/blob";
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

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const blobUyari = vercelBlobGerekliMesaji();
  if (blobUyari) {
    return NextResponse.json(
      { error: "Depolama yapılandırılmamış", detail: blobUyari },
      { status: 503 },
    );
  }

  let body: { kind?: string; butceYili?: number; pathname?: string };
  try {
    body = (await request.json()) as { kind?: string; butceYili?: number; pathname?: string };
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const kind = String(body.kind ?? "");
  const butceYili = Number(body.butceYili ?? 2027);
  const pathname = String(body.pathname ?? "").trim();

  if (!BUTCE_UPLOAD_KINDS.has(kind as ButceUploadKind)) {
    return NextResponse.json({ error: "Geçersiz yükleme tipi" }, { status: 400 });
  }
  if (!pathname.startsWith("butce-uploads/")) {
    return NextResponse.json({ error: "Geçersiz blob yolu" }, { status: 400 });
  }

  try {
    const blob = await get(pathname, { access: "private" });
    if (!blob || !blob.stream) {
      return NextResponse.json({ error: "Yüklenen dosya okunamadı" }, { status: 404 });
    }
    const buf = await streamToBuffer(blob.stream);
    return NextResponse.json(await runButceUpload(kind as ButceUploadKind, buf, butceYili));
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Blob import başarısız", detail }, { status: 500 });
  }
}
