import { NextResponse } from "next/server";
import {
  butceDataDurumu,
  loadBilancoAylikRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarlar,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
  loadV2Varsayimlar,
} from "@/lib/butce/loadData";
import { buildV2GelirTablosu } from "@/lib/butce/v2/buildV2GelirTablosu";
import {
  V2_AYLIK_GETIRI_VARSAYILAN,
  V2_MALI_GELIR_DISCLAIMER,
  V2_VERGI_DISCLAIMER,
} from "@/lib/butce/v2/maliGelirProxyConfig";
import type { V2VarsayimlarStore } from "@/lib/butce/v2/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Partial<V2VarsayimlarStore> = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const durum = await butceDataDurumu();
  if (!durum.hasMizan) {
    return NextResponse.json({ error: "MIZAN verisi yok" }, { status: 400 });
  }
  if (!durum.hasSatisButce) {
    return NextResponse.json({ error: "SATIS_BUTCE yok" }, { status: 400 });
  }
  if (!durum.hasTarifeBransPay) {
    return NextResponse.json({ error: "Tarife-branş pay tablosu yok" }, { status: 400 });
  }

  const saved = await loadV2Varsayimlar();
  const varsayimlar: V2VarsayimlarStore = {
    butceYili: body.butceYili ?? saved?.butceYili ?? durum.butceYili,
    tarifeHedefleri: body.tarifeHedefleri ?? saved?.tarifeHedefleri ?? {},
    referansEtiket: body.referansEtiket ?? saved?.referansEtiket,
    yilAgirliklari: body.yilAgirliklari ?? saved?.yilAgirliklari,
    giderArtisOrani:
      body.giderArtisOrani ?? saved?.giderArtisOrani ?? 0,
    aylikGetiriOrani:
      body.aylikGetiriOrani ??
      saved?.aylikGetiriOrani ??
      Array.from({ length: 12 }, () => V2_AYLIK_GETIRI_VARSAYILAN),
  };

  if (Object.keys(varsayimlar.tarifeHedefleri).length === 0) {
    return NextResponse.json(
      { error: "Tarife hedefleri boş — V2 formunda hedef girin." },
      { status: 400 },
    );
  }

  const [
    satisRows,
    uretim,
    tarifeMap,
    tarifeBransPay,
    mizan,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    oranAyar,
    kpkVade,
    kapanisTahmin,
  ] = await Promise.all([
    loadSatisButceRows(),
    loadUretimRows(),
    loadTarifeMapRows(),
    loadTarifeBransPayRows(),
    loadMizanRows(),
    loadMizanAylikRows(),
    loadMizanAylikFullRows(),
    loadBilancoAylikRows(),
    loadOranAyarlar(),
    loadKpkVadeRows(),
    loadKpkKapanisTahmin(),
  ]);

  try {
    const sonuc = buildV2GelirTablosu({
      varsayimlar,
      satisRows,
      uretim,
      tarifeMap,
      tarifeBransPay,
      mizan,
      mizanAylik,
      mizanAylikFull,
      bilancoAylik,
      oranAyar,
      kpkVade,
      kapanisTahmin,
    });

    return NextResponse.json({
      ok: true,
      disclaimer: V2_MALI_GELIR_DISCLAIMER,
      vergiNotu: V2_VERGI_DISCLAIMER,
      ...sonuc,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "V2 hesaplama başarısız", detail }, { status: 500 });
  }
}
