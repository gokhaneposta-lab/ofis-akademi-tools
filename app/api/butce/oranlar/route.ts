import { NextResponse } from "next/server";
import {
  loadMizanRows,
  loadMizanAylikFullRows,
  loadOranAyarPaket,
  loadPrimBransHedef,
  butceDataDurumu,
} from "@/lib/butce/loadData";
import { HAZINE_BRANS_SIRASI } from "@/lib/butce/config/brans";
import { MizanOranServisi, oranKalemListesi } from "@/lib/butce/oran/mizanOranlar";
import { parseYilAgirlikParam } from "@/lib/butce/oran/oranAyarPaket";
import { oranKalemAciklama } from "@/lib/butce/oran/oranKalemAciklama";
import type { OranYilBirlestirmeStore } from "@/lib/butce/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kalem = searchParams.get("kalem");
  const yeniden = searchParams.get("yeniden") === "1";
  const kumulAyRaw = searchParams.get("kumulAy");
  const kumulAy = kumulAyRaw
    ? Math.min(12, Math.max(1, parseInt(kumulAyRaw, 10) || 12))
    : 12;

  const mizan = await loadMizanRows();
  if (mizan.length === 0) {
    return NextResponse.json({ error: "MIZAN verisi yok" }, { status: 400 });
  }

  const mizanAylikFull = await loadMizanAylikFullRows();
  const { butceYili } = await butceDataDurumu();
  const baseServis = new MizanOranServisi(mizan, butceYili, mizanAylikFull);
  const oranPaket = await loadOranAyarPaket();
  let ayarlar = baseServis.migrateLegacyBransAyarlar(oranPaket.ayarlar);

  const kalemYilBirlestirme: OranYilBirlestirmeStore = {
    ...oranPaket.kalemYilBirlestirme,
  };
  if (kalem) {
    const preview = parseYilAgirlikParam(searchParams.get("yilAgirlik"), baseServis.yillar);
    if (preview) kalemYilBirlestirme[kalem] = preview;
  }

  const servis = new MizanOranServisi(
    mizan,
    butceYili,
    mizanAylikFull,
    true,
    kalemYilBirlestirme,
  );

  if (!kalem) {
    return NextResponse.json({
      kalemler: oranKalemListesi(),
      yillar: servis.yillar,
      butceYili,
    });
  }

  try {
    const kalemAyar = ayarlar[kalem] ?? {};
    const tabloOpts = { ay: kumulAy };
    const tablo = yeniden
      ? servis.tumBranslarTablosu(
          kalem,
          servis.bransAyarMizanHesapla(kalem, kalemAyar),
          tabloOpts,
        )
      : servis.tumBranslarTablosu(kalem, kalemAyar, tabloOpts);

    const primHedef = (await loadPrimBransHedef()) ?? {};
    const primler: Record<string, number> = {};
    for (const kod of HAZINE_BRANS_SIRASI) {
      primler[kod] = primHedef[kod] ?? 0;
    }

    return NextResponse.json({
      kalem,
      tablo,
      kumulAy,
      yillar: servis.kalemYillar(kumulAy),
      yilAgirliklari: servis.kalemAgirlikliYillar(kalem),
      yilAgirlikOzel: Boolean(oranPaket.kalemYilBirlestirme[kalem]?.length),
      referansSecenekleri: servis.yilEtiketleri(),
      aciklama: oranKalemAciklama(kalem),
      sirketOzeti: servis.sirketOranOzeti(kalem, tablo, primler, kumulAy),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Oran hesabı başarısız", detail }, { status: 500 });
  }
}
