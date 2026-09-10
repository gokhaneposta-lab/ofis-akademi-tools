import { NextResponse } from "next/server";
import {
  loadMizanRows,
  loadMizanAylikFullRows,
  loadOranAyarPaket,
  butceDataDurumu,
} from "@/lib/butce/loadData";
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
    const tablo = yeniden
      ? servis.tumBranslarTablosu(kalem, servis.bransAyarMizanHesapla(kalem, kalemAyar))
      : servis.tumBranslarTablosu(kalem, kalemAyar);

    return NextResponse.json({
      kalem,
      tablo,
      yillar: servis.yillar,
      yilAgirliklari: servis.kalemAgirlikliYillar(kalem),
      yilAgirlikOzel: Boolean(oranPaket.kalemYilBirlestirme[kalem]?.length),
      referansSecenekleri: servis.yilEtiketleri(),
      aciklama: oranKalemAciklama(kalem),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Oran hesabı başarısız", detail }, { status: 500 });
  }
}
