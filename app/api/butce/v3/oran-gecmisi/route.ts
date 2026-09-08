import { NextResponse } from "next/server";

import {
  butceDataDurumu,
  loadMizanAylikFullRows,
  loadMizanRows,
  loadOranAyarlar,
} from "@/lib/butce/loadData";
import { buildOranGecmisiPaket } from "@/lib/butce/v3/gtOzetOranGecmisi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const durum = await butceDataDurumu();
  if (!durum.hasMizan) {
    return NextResponse.json({ error: "MIZAN verisi yok" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const butceYili = Math.min(Math.max(Number(searchParams.get("yil") ?? 2026), 2020), 2035);
  const ay = Math.min(Math.max(Number(searchParams.get("ay") ?? 12), 1), 12);
  const bransParam = searchParams.get("branslar");
  const aktifBranslar = bransParam
    ? bransParam.split(",").map((s) => s.trim()).filter((k) => /^7\d{2}$/.test(k))
    : [];

  const [mizan, mizanAylikFull, oranAyar] = await Promise.all([
    loadMizanRows(),
    loadMizanAylikFullRows(),
    loadOranAyarlar(),
  ]);

  const paket = buildOranGecmisiPaket(
    { mizan, butceYili, mizanAylikFull, oranAyar, ay },
    aktifBranslar,
  );

  return NextResponse.json({
    ok: true,
    ay,
    butceYili,
    oranGecmisi: paket.sirket,
    oranPaket: paket,
  });
}
