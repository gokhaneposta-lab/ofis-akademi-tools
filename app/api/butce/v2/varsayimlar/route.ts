import { NextResponse } from "next/server";
import { BUTCE_YILI_VARSAYILAN } from "@/lib/butce/config/constants";
import {
  butceDataDurumu,
  loadBilancoAylikRows,
  loadMizanAylikFullRows,
  loadMizanRows,
  loadSatisButceRows,
  loadV2Varsayimlar,
} from "@/lib/butce/loadData";
import { BUTCE_V2_VARSAYIMLAR_JSON } from "@/lib/butce/paths";
import { tarifeOzetFromSatis } from "@/lib/butce/prim/dagitimMotoru";
import { writePrivateFile } from "@/lib/butce/storage";
import {
  V2_AYLIK_GETIRI_VARSAYILAN,
  V2_FAALIYET_ARTIS_HESAPLARI,
} from "@/lib/butce/v2/maliGelirProxyConfig";
import { faaliyetGiderBazSatirlari } from "@/lib/butce/v2/faaliyetGiderFromMizanArtis";
import type { V2VarsayimlarStore } from "@/lib/butce/v2/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function defaultGetiri(): number[] {
  return Array.from({ length: 12 }, () => V2_AYLIK_GETIRI_VARSAYILAN);
}

function temizFaaliyetButce(raw: unknown): Record<string, number> {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out: Record<string, number> = {};
  for (const hesap of V2_FAALIYET_ARTIS_HESAPLARI) {
    const tutar = Number(source[hesap]);
    if (Number.isFinite(tutar) && tutar >= 0) out[hesap] = tutar;
  }
  return out;
}

export async function GET(request: Request) {
  const durum = await butceDataDurumu();
  const saved = await loadV2Varsayimlar();
  const [satis, mizan, mizanAylikFull, bilancoAylik] = await Promise.all([
    loadSatisButceRows(),
    loadMizanRows(),
    loadMizanAylikFullRows(),
    loadBilancoAylikRows(),
  ]);
  const queryYil = Number(new URL(request.url).searchParams.get("butceYili"));
  const butceYili =
    Number.isInteger(queryYil) && queryYil >= 2000 && queryYil <= 2200
      ? queryYil
      : saved?.butceYili ?? durum.butceYili;
  const ozet = satis.length > 0 ? tarifeOzetFromSatis(satis) : [];
  const excelHedef: Record<string, number> = {};
  for (const r of ozet) excelHedef[r.tarifeGrubu] = r.mevcutHedef;
  const veriYillari = new Set([
    ...mizan.map((r) => r.yil),
    ...bilancoAylik.map((r) => r.yil),
  ]);
  const butceYillari = [
    ...new Set([
      ...[...veriYillari].map((yil) => yil + 1),
      butceYili,
      saved?.butceYili,
      durum.butceYili,
    ].filter((yil): yil is number => Number.isInteger(yil))),
  ].sort((a, b) => a - b);
  const giderBaz = faaliyetGiderBazSatirlari(mizan, butceYili, mizanAylikFull);
  const savedButce =
    saved?.butceYili === butceYili ? temizFaaliyetButce(saved.faaliyetGiderButce) : {};
  const faaliyetGiderSatirlari = giderBaz.map((r) => ({
    ...r,
    butceTutari: savedButce[r.hesap] ?? r.oncekiYilTutari,
  }));

  return NextResponse.json({
    ok: true,
    butceYili,
    butceYillari,
    saved,
    excelTarifeHedefleri: excelHedef,
    tarifeOzet: ozet,
    faaliyetGiderOncekiYil: butceYili - 1,
    faaliyetGiderSatirlari,
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
  const faaliyetGiderButce = temizFaaliyetButce(body.faaliyetGiderButce);
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
    faaliyetGiderButce,
    aylikGetiriOrani,
  };

  await writePrivateFile(BUTCE_V2_VARSAYIMLAR_JSON, JSON.stringify(store));
  return NextResponse.json({ ok: true, store });
}
