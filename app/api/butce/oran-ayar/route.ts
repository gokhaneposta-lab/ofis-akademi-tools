import { NextResponse } from "next/server";
import { BUTCE_ORAN_AYAR_JSON } from "@/lib/butce/paths";
import { writePrivateFile, readPrivateFile } from "@/lib/butce/storage";
import type { BransOranAyar, OranAyarStore } from "@/lib/butce/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PatchSatir = {
  kalem: string;
  bransKodu: string;
  oran: number;
  manuel: boolean;
  referans?: string;
};

async function loadAyarlar(): Promise<OranAyarStore> {
  const raw = await readPrivateFile(BUTCE_ORAN_AYAR_JSON);
  return raw ? (JSON.parse(raw) as OranAyarStore) : {};
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    ayarlar?: OranAyarStore;
    patch?: PatchSatir[];
  };

  if (Array.isArray(body.patch) && body.patch.length > 0) {
    const ayarlar = await loadAyarlar();
    for (const p of body.patch) {
      const kalem = String(p.kalem ?? "").trim();
      const brans = String(p.bransKodu ?? "").trim();
      if (!kalem || !brans) continue;
      const row: BransOranAyar = {
        referans: p.manuel ? "manuel" : (p.referans ?? "excel_gt"),
        oran: Number(p.oran) || 0,
        manuel: Boolean(p.manuel),
      };
      ayarlar[kalem] = { ...(ayarlar[kalem] ?? {}), [brans]: row };
    }
    await writePrivateFile(BUTCE_ORAN_AYAR_JSON, JSON.stringify(ayarlar, null, 2));
    return NextResponse.json({ ok: true });
  }

  if (!body.ayarlar || typeof body.ayarlar !== "object") {
    return NextResponse.json({ error: "ayarlar veya patch gerekli" }, { status: 400 });
  }

  await writePrivateFile(BUTCE_ORAN_AYAR_JSON, JSON.stringify(body.ayarlar, null, 2));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const ayarlar = await loadAyarlar();
  return NextResponse.json({ ayarlar });
}
