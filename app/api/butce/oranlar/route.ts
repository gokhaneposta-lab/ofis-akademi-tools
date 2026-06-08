import { NextResponse } from "next/server";
import { loadMizanRows, loadOranAyarlar, butceDataDurumu } from "@/lib/butce/loadData";
import { MizanOranServisi, oranKalemListesi } from "@/lib/butce/oran/mizanOranlar";

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

  const { butceYili } = await butceDataDurumu();
  const servis = new MizanOranServisi(mizan, butceYili);
  let ayarlar = await loadOranAyarlar();
  ayarlar = servis.migrateLegacyBransAyarlar(ayarlar);

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
      referansSecenekleri: servis.yilEtiketleri(),
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Oran hesabı başarısız", detail }, { status: 500 });
  }
}
