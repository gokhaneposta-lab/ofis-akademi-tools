import { NextResponse } from "next/server";
import {
  loadMizanRows,
  loadSatisButceRows,
  loadTarifeMapRows,
  loadUretimRows,
} from "@/lib/butce/loadData";
import { DagitimMotoru } from "@/lib/butce/prim/dagitimMotoru";
import { BUTCE_PRIM_BRANS_JSON } from "@/lib/butce/paths";
import { writePrivateFile } from "@/lib/butce/storage";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    referansEtiket?: string;
    mizanYedek?: boolean;
    tarifeHedefleri?: Record<string, number>;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const satisRows = await loadSatisButceRows();
  const tarifeMap = await loadTarifeMapRows();
  const mizan = await loadMizanRows();
  const uretim = await loadUretimRows();

  if (satisRows.length === 0) {
    return NextResponse.json(
      { error: "SATIS_BUTCE verisi yok — önce Bütçe GT dosyasını yükleyin." },
      { status: 400 },
    );
  }
  if (tarifeMap.length === 0) {
    return NextResponse.json(
      { error: "TARIFE_MAP verisi yok — BUTCE_MAP.xlsx yükleyin (MIZAN + TARIFE_MAP)." },
      { status: 400 },
    );
  }
  if (mizan.length === 0) {
    return NextResponse.json(
      { error: "MIZAN verisi yok — önce BUTCE_MAP MIZAN yükleyin." },
      { status: 400 },
    );
  }

  const motor = new DagitimMotoru(uretim, tarifeMap, mizan);
  const sonuc = motor.dagit({
    satisRows,
    referansEtiket: body.referansEtiket ?? "2024",
    mizanYedek: body.mizanYedek ?? true,
    tarifeHedefleri: body.tarifeHedefleri,
  });

  const hedefler: Record<string, number> = {};
  for (const b of sonuc.bransOzet) hedefler[b.bransKodu] = b.hedefPrim;
  await writePrivateFile(
    BUTCE_PRIM_BRANS_JSON,
    JSON.stringify({
      guncellemeIso: new Date().toISOString(),
      referansEtiket: body.referansEtiket ?? "2024",
      hedefler,
    }),
  );

  return NextResponse.json({ ok: true, ...sonuc });
}
