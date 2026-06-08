import { NextResponse } from "next/server";
import { loadMizanRows, loadOranAyarlar, butceDataDurumu } from "@/lib/butce/loadData";
import { MizanOranServisi, oranKalemListesi } from "@/lib/butce/oran/mizanOranlar";

export const runtime = "nodejs";
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

  const kalemAyar = ayarlar[kalem] ?? {};
  const tablo = yeniden
    ? servis.tumBranslarTablosu(kalem, servis.bransAyarMizanHesapla(kalem, kalemAyar))
    : servis.tumBranslarTablosu(kalem, kalemAyar);

  return NextResponse.json({
    kalem,
    tablo,
    referansSecenekleri: servis.yilEtiketleri(),
  });
}
