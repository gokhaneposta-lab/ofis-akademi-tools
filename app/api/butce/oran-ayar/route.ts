import { NextResponse } from "next/server";
import { BUTCE_ORAN_AYAR_JSON } from "@/lib/butce/paths";
import { writePrivateFile, readPrivateFile } from "@/lib/butce/storage";
import type { OranAyarStore } from "@/lib/butce/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { ayarlar?: OranAyarStore };
  if (!body.ayarlar || typeof body.ayarlar !== "object") {
    return NextResponse.json({ error: "ayarlar gerekli" }, { status: 400 });
  }

  await writePrivateFile(BUTCE_ORAN_AYAR_JSON, JSON.stringify(body.ayarlar, null, 2));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const raw = await readPrivateFile(BUTCE_ORAN_AYAR_JSON);
  const ayarlar = raw ? (JSON.parse(raw) as OranAyarStore) : {};
  return NextResponse.json({ ayarlar });
}
