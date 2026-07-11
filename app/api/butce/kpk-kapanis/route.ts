import { NextResponse } from "next/server";
import {
  butceDataDurumu,
  loadKpkKapanisTahmin,
  loadMizanAylikRows,
  loadTarifeBransPayRows,
} from "@/lib/butce/loadData";
import { buildOncekiYilPrimSerisi } from "@/lib/butce/kpk/oncekiYilPrimTahmin";
import { BUTCE_KPK_KAPANIS_JSON, BUTCE_META_JSON } from "@/lib/butce/paths";
import { readPrivateFile, writePrivateFile } from "@/lib/butce/storage";
import type { ButceMeta, KpkKapanisTahminStore } from "@/lib/butce/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  const durum = await butceDataDurumu();
  const [mizanAylik, tarifeBransPay, saved] = await Promise.all([
    loadMizanAylikRows(),
    loadTarifeBransPayRows(),
    loadKpkKapanisTahmin(),
  ]);

  const oncekiYil = buildOncekiYilPrimSerisi({
    butceYili: durum.butceYili,
    mizanAylik,
    tarifeBransPay,
    kapanisTahmin: saved,
  });

  return NextResponse.json({
    butceYili: durum.butceYili,
    saved,
    oncekiYil,
  });
}

export async function POST(request: Request) {
  let body: {
    sonGercekAy?: number;
    tarifeBuyumeOran?: Record<string, number>;
    tarifeAylikOverride?: Record<string, Record<number, number>>;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const durum = await butceDataDurumu();
  const oncekiYil = durum.butceYili - 1;
  const mizanAylik = await loadMizanAylikRows();

  let sonAy = body.sonGercekAy ?? 0;
  if (!sonAy || sonAy < 1 || sonAy > 11) {
    for (const r of mizanAylik) {
      if (r.yil === oncekiYil && r.tutar > 0 && r.ay > sonAy) sonAy = r.ay;
    }
    if (sonAy < 1) sonAy = 9;
  }

  const store: KpkKapanisTahminStore = {
    butceYili: durum.butceYili,
    oncekiYil,
    sonGercekAy: sonAy,
    tarifeBuyumeOran: body.tarifeBuyumeOran,
    tarifeAylikOverride: body.tarifeAylikOverride,
    guncellemeIso: new Date().toISOString(),
  };

  await writePrivateFile(BUTCE_KPK_KAPANIS_JSON, JSON.stringify(store));

  const metaRaw = await readPrivateFile(BUTCE_META_JSON);
  const meta: ButceMeta = metaRaw
    ? (JSON.parse(metaRaw) as ButceMeta)
    : { schemaVersion: 2, butceYili: durum.butceYili };
  meta.kpkKapanisGuncellemeIso = store.guncellemeIso;
  await writePrivateFile(BUTCE_META_JSON, JSON.stringify(meta, null, 2));

  const tarifeBransPay = await loadTarifeBransPayRows();
  const hesap = buildOncekiYilPrimSerisi({
    butceYili: durum.butceYili,
    mizanAylik,
    tarifeBransPay,
    kapanisTahmin: store,
  });

  return NextResponse.json({ ok: true, store, oncekiYil: hesap });
}
