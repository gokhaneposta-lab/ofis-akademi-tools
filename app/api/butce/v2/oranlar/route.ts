import { NextResponse } from "next/server";
import {
  butceDataDurumu,
  loadMizanAylikFullRows,
  loadMizanRows,
  loadOranAyarlar,
} from "@/lib/butce/loadData";
import { MizanOranServisi } from "@/lib/butce/oran/mizanOranlar";
import { buildV2TeknikOranTablo } from "@/lib/butce/v2/v2GtOranTablo";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bransRaw = String(searchParams.get("brans") ?? "").trim();
  const kodlar = bransRaw.split(/[+,]/).map((s) => s.trim()).filter((k) => /^7\d{2}$/.test(k));
  const ayRaw = Number(searchParams.get("ay") ?? 12);
  const ay = Number.isFinite(ayRaw) ? Math.min(12, Math.max(1, Math.round(ayRaw))) : 12;

  if (kodlar.length === 0) {
    return NextResponse.json({ error: "7'li branş kodu gerekli" }, { status: 400 });
  }

  const mizan = await loadMizanRows();
  if (mizan.length === 0) {
    return NextResponse.json({ error: "MIZAN verisi yok" }, { status: 400 });
  }

  const { butceYili } = await butceDataDurumu();
  const mizanAylikFull = await loadMizanAylikFullRows();
  const servis = new MizanOranServisi(mizan, butceYili, mizanAylikFull);
  let ayarlar = await loadOranAyarlar();
  ayarlar = servis.migrateLegacyBransAyarlar(ayarlar);

  return NextResponse.json(buildV2TeknikOranTablo(servis, kodlar, ayarlar, ay));
}
