import { NextResponse } from "next/server";
import {
  butceDataDurumu,
  loadAylikPrim,
  loadFaaliyetGiderRows,
  loadKpkKapanisTahmin,
  loadKpkVadeRows,
  loadMizanAylikFullRows,
  loadMizanAylikRows,
  loadMizanRows,
  loadOranAyarlar,
  loadPrimBransEndirekt,
  loadPrimBransHedef,
  loadTarifeBransPayRows,
} from "@/lib/butce/loadData";
import { buildGelirTablosu } from "@/lib/butce/gelir/gelirTablosu";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  const durum = await butceDataDurumu();
  const hedefler = await loadPrimBransHedef();

  if (!durum.hasMizan) {
    return NextResponse.json(
      { error: "MIZAN verisi yok — önce Aylık GT dosyasını içe aktarın (teknik oranlar için)." },
      { status: 400 },
    );
  }
  if (!hedefler || Object.keys(hedefler).length === 0) {
    return NextResponse.json(
      { error: "Branş prim hedefi yok — önce Prim hedefi sayfasında A motoru ile dağıtın." },
      { status: 400 },
    );
  }

  const [mizan, endirekt, aylikPrim, oranAyar, mizanAylik, mizanAylikFull, tarifeBransPay, kpkVade, kapanisTahmin, faaliyetGider] =
    await Promise.all([
      loadMizanRows(),
      loadPrimBransEndirekt(),
      loadAylikPrim(),
      loadOranAyarlar(),
      loadMizanAylikRows(),
      loadMizanAylikFullRows(),
      loadTarifeBransPayRows(),
      loadKpkVadeRows(),
      loadKpkKapanisTahmin(),
      loadFaaliyetGiderRows(),
    ]);

  const sonuc = buildGelirTablosu({
    mizan,
    butceYili: durum.butceYili,
    primHedefleri: hedefler,
    endirektPrim: endirekt,
    aylikPrim,
    oranAyar,
    mizanAylik,
    mizanAylikFull,
    tarifeBransPay,
    kpkVade,
    kapanisTahmin,
    faaliyetGider,
  });

  return NextResponse.json({
    ok: true,
    hasAylikPrim: aylikPrim != null,
    hasKpkVade: kpkVade.length > 0,
    hasFaaliyetGider: faaliyetGider.length > 0,
    ...sonuc,
  });
}
