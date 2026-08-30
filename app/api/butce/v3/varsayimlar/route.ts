import { NextResponse } from "next/server";

import {
  butceDataDurumu,
  loadMizanAylikFullRows,
  loadMizanRows,
  loadSatisButceRows,
  loadV3Varsayimlar,
  loadV3VarsayimlarFromDisk,
} from "@/lib/butce/loadData";
import { BUTCE_V3_VARSAYIMLAR_JSON } from "@/lib/butce/paths";
import { tarifeOzetFromSatis } from "@/lib/butce/prim/dagitimMotoru";
import { writePrivateFile } from "@/lib/butce/storage";
import { V2_FAALIYET_ARTIS_HESAPLARI } from "@/lib/butce/v2/maliGelirProxyConfig";
import { faaliyetGiderBazSatirlari } from "@/lib/butce/v2/faaliyetGiderFromMizanArtis";
import {
  lookupTarifeHedef,
  tarifeSatirlariFromDefaults,
  toplamPrimFromTarife,
  v3DefaultsForYear,
  v3DefaultsStore2026,
  V3_FAALIYET_GIDER_ONCEKI_2026,
} from "@/lib/butce/v3/defaults";
import { V3_DEFAULT_YTD_ANCHOR, V3_V2_SORUN_OZETI } from "@/lib/butce/v3/metodoloji";
import { normalizeText } from "@/lib/butce/textUtils";
import type { V3VarsayimlarStore } from "@/lib/butce/v3/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function defaultGetiri(): number[] {
  return v3DefaultsStore2026().aylikGetiriOrani;
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

function temizTarifeHedefleri(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const tutar = Number(v);
    if (Number.isFinite(tutar) && tutar >= 0) out[k] = tutar;
  }
  return out;
}

function mergeTarifeOzet(
  ozetSatis: Array<{ tarifeGrubu: string; mevcutHedef: number }>,
  defaultHedef: Record<string, number>,
  savedHedef: Record<string, number>,
): Array<{ tarifeGrubu: string; mevcutHedef: number; yeniHedef: number }> {
  const used = new Set<string>();
  const out: Array<{ tarifeGrubu: string; mevcutHedef: number; yeniHedef: number }> = [];

  const defaultNames = Object.keys(defaultHedef);
  const names =
    defaultNames.length > 0
      ? defaultNames
      : ozetSatis.map((r) => r.tarifeGrubu);

  for (const name of names) {
    const match = ozetSatis.find((r) => normalizeText(r.tarifeGrubu) === normalizeText(name));
    const tarifeGrubu = match?.tarifeGrubu ?? name;
    const mevcutHedef = match?.mevcutHedef ?? 0;
    if (match) used.add(match.tarifeGrubu);
    const yeni =
      lookupTarifeHedef(savedHedef, tarifeGrubu) ??
      lookupTarifeHedef(defaultHedef, tarifeGrubu) ??
      lookupTarifeHedef(defaultHedef, name) ??
      mevcutHedef;
    out.push({ tarifeGrubu, mevcutHedef, yeniHedef: yeni });
  }

  for (const r of ozetSatis) {
    if (used.has(r.tarifeGrubu)) continue;
    const yeni =
      lookupTarifeHedef(savedHedef, r.tarifeGrubu) ??
      lookupTarifeHedef(defaultHedef, r.tarifeGrubu) ??
      r.mevcutHedef;
    out.push({ tarifeGrubu: r.tarifeGrubu, mevcutHedef: r.mevcutHedef, yeniHedef: yeni });
  }

  return out;
}

export async function GET(request: Request) {
  const durum = await butceDataDurumu();
  let saved = await loadV3VarsayimlarFromDisk();
  const [satis, mizan, mizanAylikFull] = await Promise.all([
    loadSatisButceRows(),
    loadMizanRows(),
    loadMizanAylikFullRows(),
  ]);
  const queryYil = Number(new URL(request.url).searchParams.get("butceYili"));
  const butceYili =
    Number.isInteger(queryYil) && queryYil >= 2000 && queryYil <= 2200
      ? queryYil
      : saved?.butceYili ?? 2026;

  const yilDefaults = v3DefaultsForYear(butceYili);

  if (!saved && butceYili === 2026 && yilDefaults) {
    const store: V3VarsayimlarStore = {
      ...yilDefaults,
      guncellemeIso: new Date().toISOString(),
    };
    try {
      await writePrivateFile(BUTCE_V3_VARSAYIMLAR_JSON, JSON.stringify(store));
      saved = store;
    } catch {
      saved = store;
    }
  }

  // Disk yoksa / seed yazılamadıysa in-memory defaults (loadData fallback)
  if (!saved) {
    saved = await loadV3Varsayimlar(butceYili);
  }

  const ozetSatis = satis.length > 0 ? tarifeOzetFromSatis(satis) : [];
  const defaultHedef = yilDefaults?.tarifeHedefleri ?? {};
  const savedHedef =
    saved?.butceYili === butceYili ? temizTarifeHedefleri(saved.tarifeHedefleri) : {};

  const tarifeOzet =
    ozetSatis.length > 0 || Object.keys(defaultHedef).length > 0
      ? mergeTarifeOzet(
          ozetSatis.length > 0
            ? ozetSatis
            : tarifeSatirlariFromDefaults(defaultHedef).map((r) => ({
                tarifeGrubu: r.tarifeGrubu,
                mevcutHedef: r.mevcutHedef,
              })),
          defaultHedef,
          savedHedef,
        )
      : [];

  const giderBaz = faaliyetGiderBazSatirlari(mizan, butceYili, mizanAylikFull);
  const savedButce =
    saved?.butceYili === butceYili ? temizFaaliyetButce(saved.faaliyetGiderButce) : {};
  const defaultGider = yilDefaults?.faaliyetGiderButce ?? {};
  const oncekiYilOverride =
    butceYili === 2026 ? V3_FAALIYET_GIDER_ONCEKI_2026 : undefined;

  const faaliyetGiderSatirlari = giderBaz.map((r) => ({
    ...r,
    oncekiYilTutari: oncekiYilOverride?.[r.hesap] ?? r.oncekiYilTutari,
    butceTutari: savedButce[r.hesap] ?? defaultGider[r.hesap] ?? r.oncekiYilTutari,
  }));

  const veriYillari = new Set(mizan.map((r) => r.yil));
  const butceYillari = [
    ...new Set(
      [...[...veriYillari].map((y) => y + 1), butceYili, saved?.butceYili, durum.butceYili, 2026].filter(
        (y): y is number => Number.isInteger(y),
      ),
    ),
  ].sort((a, b) => a - b);

  const aylikGetiriOrani =
    saved?.butceYili === butceYili && saved.aylikGetiriOrani?.length === 12
      ? saved.aylikGetiriOrani
      : yilDefaults?.aylikGetiriOrani ?? defaultGetiri();

  return NextResponse.json({
    ok: true,
    butceYili,
    butceYillari,
    saved,
    tarifeOzet,
    faaliyetGiderOncekiYil: butceYili - 1,
    faaliyetGiderSatirlari,
    aylikGetiriOrani,
    ytdAnchorAy: saved?.ytdAnchorAy ?? yilDefaults?.ytdAnchorAy ?? V3_DEFAULT_YTD_ANCHOR,
    referansEtiket:
      saved?.referansEtiket ?? yilDefaults?.referansEtiket ?? "Son 2 Yıl Ortalaması (2024-2025)",
    yilAgirliklari: saved?.yilAgirliklari ?? yilDefaults?.yilAgirliklari ?? [0.5, 0.5],
    v2SorunOzeti: V3_V2_SORUN_OZETI,
    dataDurumu: durum,
  });
}

export async function POST(request: Request) {
  let body: Partial<V3VarsayimlarStore>;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const durum = await butceDataDurumu();
  const butceYili = body.butceYili ?? durum.butceYili ?? 2026;
  const tarifeHedefleri = temizTarifeHedefleri(body.tarifeHedefleri);
  const tarifeToplam = toplamPrimFromTarife(tarifeHedefleri);
  const toplamPrimHedef = Number(body.toplamPrimHedef) || tarifeToplam;
  const faaliyetGiderButce = temizFaaliyetButce(body.faaliyetGiderButce);
  let aylikGetiriOrani = Array.isArray(body.aylikGetiriOrani)
    ? body.aylikGetiriOrani.map((x) => Number(x) || 0)
    : defaultGetiri();
  if (aylikGetiriOrani.length !== 12) aylikGetiriOrani = defaultGetiri();

  if (!Number.isFinite(toplamPrimHedef) || toplamPrimHedef <= 0) {
    return NextResponse.json({ error: "Prim hedefi gerekli (tarife veya toplam)" }, { status: 400 });
  }

  const store: V3VarsayimlarStore = {
    guncellemeIso: new Date().toISOString(),
    butceYili,
    toplamPrimHedef,
    tarifeHedefleri: Object.keys(tarifeHedefleri).length > 0 ? tarifeHedefleri : undefined,
    aylikGetiriOrani,
    faaliyetGiderButce,
    ytdAnchorAy: body.ytdAnchorAy ?? V3_DEFAULT_YTD_ANCHOR,
    referansEtiket: body.referansEtiket,
    yilAgirliklari: body.yilAgirliklari,
  };

  await writePrivateFile(BUTCE_V3_VARSAYIMLAR_JSON, JSON.stringify(store));
  return NextResponse.json({ ok: true, store });
}
