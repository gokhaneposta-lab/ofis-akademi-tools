import { NextResponse } from "next/server";
import { BUTCE_YILI_VARSAYILAN } from "@/lib/butce/config/constants";
import { butceDataDurumu, loadSatisButceRows, loadV2Varsayimlar } from "@/lib/butce/loadData";
import { BUTCE_V2_VARSAYIMLAR_JSON } from "@/lib/butce/paths";
import { tarifeOzetFromSatis } from "@/lib/butce/prim/dagitimMotoru";
import { writePrivateFile } from "@/lib/butce/storage";
import { V2_AYLIK_GETIRI_VARSAYILAN } from "@/lib/butce/v2/maliGelirProxyConfig";
import type { V2VarsayimlarStore } from "@/lib/butce/v2/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function defaultGetiri(): number[] {
  return Array.from({ length: 12 }, () => V2_AYLIK_GETIRI_VARSAYILAN);
}

export async function GET() {
  const durum = await butceDataDurumu();
  const saved = await loadV2Varsayimlar();
  const satis = await loadSatisButceRows();
  const ozet = satis.length > 0 ? tarifeOzetFromSatis(satis) : [];
  const excelHedef: Record<string, number> = {};
  for (const r of ozet) excelHedef[r.tarifeGrubu] = r.mevcutHedef;

  return NextResponse.json({
    ok: true,
    butceYili: durum.butceYili,
    saved,
    excelTarifeHedefleri: excelHedef,
    tarifeOzet: ozet,
  });
}

export async function POST(request: Request) {
  let body: Partial<V2VarsayimlarStore>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const durum = await butceDataDurumu();
  const butceYili = body.butceYili ?? durum.butceYili ?? BUTCE_YILI_VARSAYILAN;
  const tarifeHedefleri = body.tarifeHedefleri ?? {};
  const giderArtisOrani = Number(body.giderArtisOrani);
  let aylikGetiriOrani = Array.isArray(body.aylikGetiriOrani)
    ? body.aylikGetiriOrani.map((x) => Number(x) || 0)
    : defaultGetiri();
  if (aylikGetiriOrani.length !== 12) {
    aylikGetiriOrani = defaultGetiri();
  }

  if (!Number.isFinite(giderArtisOrani)) {
    return NextResponse.json({ error: "giderArtisOrani gerekli" }, { status: 400 });
  }

  const store: V2VarsayimlarStore = {
    guncellemeIso: new Date().toISOString(),
    butceYili,
    tarifeHedefleri,
    referansEtiket: body.referansEtiket,
    yilAgirliklari: body.yilAgirliklari,
    giderArtisOrani,
    aylikGetiriOrani,
  };

  await writePrivateFile(BUTCE_V2_VARSAYIMLAR_JSON, JSON.stringify(store));
  return NextResponse.json({ ok: true, store });
}
