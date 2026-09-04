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
  loadV3Varsayimlar,
} from "@/lib/butce/loadData";
import { buildV3GelirTablosu } from "@/lib/butce/v3/buildV3GelirTablosu";
import { toplamPrimFromTarife, v3DefaultsForYear } from "@/lib/butce/v3/defaults";
import { buildGtCocukPay } from "@/lib/butce/v2/gtFormatCocukPay";
import {
  V2_AYLIK_GETIRI_VARSAYILAN,
  V2_FAALIYET_ARTIS_HESAPLARI,
  V2_MALI_GELIR_DISCLAIMER,
  V2_VERGI_DISCLAIMER,
} from "@/lib/butce/v2/maliGelirProxyConfig";
import {
  oneriGenelGider,
  oneriMaliGetiri,
  oneriTarifePrim,
} from "@/lib/butce/v3/motor/oneriMotoru";
import type { V3VarsayimlarStore } from "@/lib/butce/v3/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function temizTarife(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = Number(v);
    if (Number.isFinite(n) && n >= 0) out[k] = n;
  }
  return out;
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

async function runHesapla(body: Partial<V3VarsayimlarStore>) {
  const durum = await butceDataDurumu();
  if (!durum.hasMizan) {
    return NextResponse.json({ error: "MIZAN verisi yok" }, { status: 400 });
  }

  const saved = await loadV3Varsayimlar();
  const butceYili = body.butceYili ?? saved?.butceYili ?? 2026;
  const yilDefaults = v3DefaultsForYear(butceYili);

  const tarifeFromBody = temizTarife(body.tarifeHedefleri);
  const tarifeHedefleri =
    Object.keys(tarifeFromBody).length > 0
      ? tarifeFromBody
      : saved?.tarifeHedefleri ?? yilDefaults?.tarifeHedefleri;

  const tarifeToplam = tarifeHedefleri ? toplamPrimFromTarife(tarifeHedefleri) : 0;
  const toplamPrimHedef =
    Number(body.toplamPrimHedef ?? saved?.toplamPrimHedef ?? tarifeToplam) || tarifeToplam;

  if (!Number.isFinite(toplamPrimHedef) || toplamPrimHedef <= 0) {
    return NextResponse.json({ error: "Prim hedefi gerekli (>0)" }, { status: 400 });
  }

  const faaliyetRaw =
    body.faaliyetGiderButce ?? saved?.faaliyetGiderButce ?? yilDefaults?.faaliyetGiderButce ?? {};
  const faaliyetGiderButce = temizFaaliyetButce(faaliyetRaw);

  let aylikGetiriOrani = Array.isArray(body.aylikGetiriOrani)
    ? body.aylikGetiriOrani.map((x) => Number(x) || 0)
    : saved?.aylikGetiriOrani ??
      yilDefaults?.aylikGetiriOrani ??
      Array.from({ length: 12 }, () => V2_AYLIK_GETIRI_VARSAYILAN);
  if (aylikGetiriOrani.length !== 12) {
    aylikGetiriOrani = Array.from({ length: 12 }, () => V2_AYLIK_GETIRI_VARSAYILAN);
  }

  const varsayimlar: V3VarsayimlarStore = {
    butceYili,
    toplamPrimHedef,
    tarifeHedefleri,
    aylikGetiriOrani,
    faaliyetGiderButce,
    ytdAnchorAy: body.ytdAnchorAy ?? saved?.ytdAnchorAy ?? yilDefaults?.ytdAnchorAy ?? 7,
    referansEtiket: body.referansEtiket ?? saved?.referansEtiket ?? yilDefaults?.referansEtiket,
    yilAgirliklari: body.yilAgirliklari ?? saved?.yilAgirliklari ?? yilDefaults?.yilAgirliklari,
  };

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
    const sonuc = buildV3GelirTablosu({
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

    const ytdAnchorAy = sonuc.v3.ytdAnchorAy;
    const oneriler = [
      ...oneriTarifePrim(
        mizan,
        mizanAylikFull,
        butceYili,
        ytdAnchorAy,
        satisRows,
        varsayimlar.tarifeHedefleri ?? {},
      ),
      ...oneriGenelGider(mizan, mizanAylikFull, butceYili, varsayimlar.faaliyetGiderButce ?? {}),
      ...oneriMaliGetiri(varsayimlar.aylikGetiriOrani ?? [], butceYili),
    ];

    return NextResponse.json({
      ok: true,
      disclaimer: V2_MALI_GELIR_DISCLAIMER,
      vergiNotu: V2_VERGI_DISCLAIMER,
      formatCocukPay: buildGtCocukPay(mizanAylikFull, butceYili),
      gt: sonuc.gt,
      primHedefleri: sonuc.primHedefleri,
      endirektPrim: sonuc.endirektPrim,
      uyarilar: sonuc.uyarilar,
      v3: {
        ...sonuc.v3,
        oneriler,
        metodolojiOzeti: [
          ...sonuc.v3.metodolojiOzeti,
          "Öneri rozetleri: tarife prim CAGR + YTD run-rate, gider CAGR, mali getiri ort.",
        ],
      },
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "V3 hesaplama başarısız", detail }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: Partial<V3VarsayimlarStore> = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  return runHesapla(body);
}

export async function GET() {
  return runHesapla({});
}
