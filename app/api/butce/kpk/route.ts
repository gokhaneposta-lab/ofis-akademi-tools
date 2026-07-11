import { NextResponse } from "next/server";
import {
  butceDataDurumu,
  loadAylikPrim,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarlar,
  loadTarifeBransPayRows,
} from "@/lib/butce/loadData";
import { buildKpkSonuc } from "@/lib/butce/kpk/buildKpkSonuc";
import { buildOncekiYilPrimSerisi } from "@/lib/butce/kpk/oncekiYilPrimTahmin";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  const durum = await butceDataDurumu();
  const [mizan, mizanAylik, tarifeBransPay, kpkVade, aylikPrim, oranAyar, kapanisTahmin] =
    await Promise.all([
      loadMizanRows(),
      loadMizanAylikRows(),
      loadTarifeBransPayRows(),
      loadKpkVadeRows(),
      loadAylikPrim(),
      loadOranAyarlar(),
      loadKpkKapanisTahmin(),
    ]);

  if (kpkVade.length === 0) {
    return NextResponse.json({ error: "KPK vade tablosu yok." }, { status: 400 });
  }

  const oncekiYil = buildOncekiYilPrimSerisi({
    butceYili: durum.butceYili,
    mizanAylik,
    tarifeBransPay,
    kapanisTahmin,
  });

  const sonuc = buildKpkSonuc({
    butceYili: durum.butceYili,
    mizan,
    mizanAylik,
    tarifeBransPay,
    vadeRows: kpkVade,
    aylikPrim,
    oranAyar,
    kapanisTahmin,
  });

  return NextResponse.json({
    ok: true,
    durum: {
      butceYili: durum.butceYili,
      hasAylikPrim: aylikPrim != null,
      kpkVadeKaynak: durum.kpkVadeKaynak,
    },
    oncekiYil,
    sonuc,
  });
}
