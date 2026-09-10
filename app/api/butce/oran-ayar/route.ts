import { NextResponse } from "next/server";
import { BUTCE_ORAN_AYAR_JSON } from "@/lib/butce/paths";
import {
  parseOranAyarDosya,
  serializeOranAyarDosya,
} from "@/lib/butce/oran/oranAyarPaket";
import { writePrivateFile, readPrivateFile } from "@/lib/butce/storage";
import type { BransOranAyar, OranAyarStore, OranYilBirlestirmeStore } from "@/lib/butce/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PatchSatir = {
  kalem: string;
  bransKodu: string;
  oran: number;
  manuel: boolean;
  referans?: string;
};

async function loadPaket() {
  const raw = await readPrivateFile(BUTCE_ORAN_AYAR_JSON);
  return parseOranAyarDosya(raw ? JSON.parse(raw) : {});
}

async function savePaket(ayarlar: OranAyarStore, kalemYilBirlestirme: OranYilBirlestirmeStore) {
  await writePrivateFile(
    BUTCE_ORAN_AYAR_JSON,
    JSON.stringify(serializeOranAyarDosya({ ayarlar, kalemYilBirlestirme }), null, 2),
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    ayarlar?: OranAyarStore;
    kalemYilBirlestirme?: OranYilBirlestirmeStore;
    patch?: PatchSatir[];
    patchYilBirlestirme?: { kalem: string; yilBirlestirme: [number, number][] | null };
  };

  if (body.patchYilBirlestirme?.kalem) {
    const paket = await loadPaket();
    const kalem = String(body.patchYilBirlestirme.kalem).trim();
    if (body.patchYilBirlestirme.yilBirlestirme?.length) {
      paket.kalemYilBirlestirme[kalem] = body.patchYilBirlestirme.yilBirlestirme;
    } else {
      delete paket.kalemYilBirlestirme[kalem];
    }
    await savePaket(paket.ayarlar, paket.kalemYilBirlestirme);
    return NextResponse.json({ ok: true });
  }

  if (Array.isArray(body.patch) && body.patch.length > 0) {
    const paket = await loadPaket();
    for (const p of body.patch) {
      const kalem = String(p.kalem ?? "").trim();
      const brans = String(p.bransKodu ?? "").trim();
      if (!kalem || !brans) continue;
      const row: BransOranAyar = {
        referans: p.manuel ? "manuel" : (p.referans ?? "excel_gt"),
        oran: Number(p.oran) || 0,
        manuel: Boolean(p.manuel),
      };
      paket.ayarlar[kalem] = { ...(paket.ayarlar[kalem] ?? {}), [brans]: row };
    }
    await savePaket(paket.ayarlar, paket.kalemYilBirlestirme);
    return NextResponse.json({ ok: true });
  }

  if (body.ayarlar && typeof body.ayarlar === "object") {
    const paket = await loadPaket();
    paket.ayarlar = body.ayarlar;
    if (body.kalemYilBirlestirme) {
      paket.kalemYilBirlestirme = body.kalemYilBirlestirme;
    }
    await savePaket(paket.ayarlar, paket.kalemYilBirlestirme);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "ayarlar, patch veya patchYilBirlestirme gerekli" }, { status: 400 });
}

export async function GET() {
  const paket = await loadPaket();
  return NextResponse.json({
    ayarlar: paket.ayarlar,
    kalemYilBirlestirme: paket.kalemYilBirlestirme,
  });
}
