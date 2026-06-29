import { NextResponse } from "next/server";
import { AYLAR } from "@/lib/butce/config/constants";
import {
  butceDataDurumu,
  loadAylikPrim,
  loadMizanAylikRows,
  loadPrimBransHedef,
} from "@/lib/butce/loadData";
import { aylikOranlariFromMizan } from "@/lib/butce/prim/mizanAylikOranlari";
import {
  createAylikDagilimTablosu,
  normalizeAylikOranlar,
  varsayilanAylikDagilim,
} from "@/lib/butce/prim/primDagilim";
import { BUTCE_AYLIK_PRIM_JSON } from "@/lib/butce/paths";
import { writePrivateFile } from "@/lib/butce/storage";
import type { AylikPrimStore } from "@/lib/butce/types";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET() {
  const durum = await butceDataDurumu();
  const hedefler = await loadPrimBransHedef();
  const saved = await loadAylikPrim();
  const mizanAylik = await loadMizanAylikRows();

  const referansYil = saved?.referansYil ?? durum.meta?.mizanYilMax ?? 2024;
  const oranSonuc = aylikOranlariFromMizan(mizanAylik, [referansYil]);

  return NextResponse.json({
    durum: {
      hasPrimBransHedef: hedefler != null && Object.keys(hedefler).length > 0,
      hasMizanAylik: durum.hasMizanAylik,
      mizanAylikSatir: durum.mizanAylikSatir,
      butceYili: durum.butceYili,
    },
    hedefBransSayisi: hedefler ? Object.values(hedefler).filter((v) => v > 0).length : 0,
    referansYil,
    oranKaynak: oranSonuc.kaynak,
    genelOranlar: saved?.genelOranlar ?? oranSonuc.genelOranlar,
    saved,
  });
}

export async function POST(request: Request) {
  let body: {
    referansYil?: number;
    genelOranlar?: number[];
    mod?: "mizan" | "manuel";
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const hedefler = await loadPrimBransHedef();
  if (!hedefler || Object.keys(hedefler).length === 0) {
    return NextResponse.json(
      { error: "Branş prim hedefi yok — önce Prim hedefi sayfasında A motoru ile dağıtın." },
      { status: 400 },
    );
  }

  const { butceYili, meta } = await butceDataDurumu();
  const referansYil = body.referansYil ?? meta?.mizanYilMax ?? 2024;
  const mizanAylik = await loadMizanAylikRows();
  const oranSonuc = aylikOranlariFromMizan(mizanAylik, [referansYil]);

  let genelOranlar = oranSonuc.genelOranlar;
  let kaynak: AylikPrimStore["kaynak"] = oranSonuc.kaynak;

  if (body.mod === "manuel" && body.genelOranlar?.length === 12) {
    genelOranlar = normalizeAylikOranlar(body.genelOranlar);
    kaynak = "manuel";
  } else if (body.genelOranlar?.length === 12) {
    genelOranlar = normalizeAylikOranlar(body.genelOranlar);
  }

  const satirlar = createAylikDagilimTablosu(
    hedefler,
    oranSonuc.bransOranlari,
    genelOranlar,
  );

  const store: AylikPrimStore = {
    butceYili,
    referansYil,
    kaynak,
    genelOranlar,
    satirlar,
    guncellemeIso: new Date().toISOString(),
  };

  await writePrivateFile(BUTCE_AYLIK_PRIM_JSON, JSON.stringify(store));

  const toplamYillik = satirlar.reduce((a, r) => a + r.toplam, 0);
  const ayToplam = AYLAR.map((_, i) =>
    satirlar.reduce((a, r) => a + r.aylar[i], 0),
  );

  return NextResponse.json({
    ok: true,
    store,
    ozet: {
      bransSayisi: satirlar.length,
      toplamYillik,
      ayToplam,
    },
  });
}
