import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { BUTCE_PRIVATE_DIR, BUTCE_ORAN_AYAR_JSON } from "@/lib/butce/paths";
import type { OranAyarStore } from "@/lib/butce/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { ayarlar?: OranAyarStore };
  if (!body.ayarlar || typeof body.ayarlar !== "object") {
    return NextResponse.json({ error: "ayarlar gerekli" }, { status: 400 });
  }

  mkdirSync(BUTCE_PRIVATE_DIR, { recursive: true });
  writeFileSync(
    join(BUTCE_PRIVATE_DIR, BUTCE_ORAN_AYAR_JSON),
    JSON.stringify(body.ayarlar, null, 2),
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { loadOranAyarlar } = await import("@/lib/butce/loadData");
  return NextResponse.json({ ayarlar: loadOranAyarlar() });
}
