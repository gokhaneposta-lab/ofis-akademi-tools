import { NextResponse } from "next/server";
import { butceDataDurumu, loadMizanRows } from "@/lib/butce/loadData";
import { buildHasarBacktest } from "@/lib/butce/oran/hasarBacktest";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { butceYili } = await butceDataDurumu();
  const defaultYil = Math.min(butceYili - 1, 2025);
  const testYili = Number(searchParams.get("yil") ?? defaultYil);
  const kalem = searchParams.get("kalem") ?? "0211";

  if (!Number.isFinite(testYili) || testYili < 2000 || testYili > 2100) {
    return NextResponse.json({ error: "Geçersiz yıl" }, { status: 400 });
  }

  const mizan = await loadMizanRows();
  if (mizan.length === 0) {
    return NextResponse.json({ error: "MIZAN verisi yok" }, { status: 400 });
  }

  const sonuc = buildHasarBacktest(mizan, testYili, kalem);
  return NextResponse.json({ ok: true, butceYili, ...sonuc });
}
