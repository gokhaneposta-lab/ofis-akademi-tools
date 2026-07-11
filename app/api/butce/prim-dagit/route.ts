import { NextResponse } from "next/server";
import {
  loadMizanRows,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
} from "@/lib/butce/loadData";
import { buildBransTarifeIzleme } from "@/lib/butce/prim/bransDagitimTrace";
import { DagitimMotoru } from "@/lib/butce/prim/dagitimMotoru";
import { BUTCE_PRIM_BRANS_JSON } from "@/lib/butce/paths";
import { writePrivateFile } from "@/lib/butce/storage";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: {
    referansEtiket?: string;
    mizanYedek?: boolean;
    tarifeHedefleri?: Record<string, number>;
    izlemeBrans?: string;
    izlemeTarife?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const satisRows = await loadSatisButceRows();
  const tarifeBransPay = await loadTarifeBransPayRows();
  const tarifeMap = await loadTarifeMapRows();
  const mizan = await loadMizanRows();
  const uretim = await loadUretimRows();

  if (satisRows.length === 0) {
    return NextResponse.json(
      { error: "SATIS_BUTCE verisi yok — önce Bütçe GT dosyasını yükleyin." },
      { status: 400 },
    );
  }
  if (tarifeBransPay.length === 0) {
    return NextResponse.json(
      { error: "Tarife-branş pay verisi yok — geçmiş üretim pay tablosunu yükleyin." },
      { status: 400 },
    );
  }
  const motor = new DagitimMotoru(uretim, tarifeMap, mizan, tarifeBransPay);
  const sonuc = motor.dagit({
    satisRows,
    referansEtiket: body.referansEtiket ?? "2024",
    mizanYedek: body.mizanYedek ?? true,
    tarifeHedefleri: body.tarifeHedefleri,
  });

  const tarifeHedefleri = body.tarifeHedefleri ?? {};
  const hedefler: Record<string, number> = {};
  for (const b of sonuc.bransOzet) hedefler[b.bransKodu] = b.hedefPrim;
  const direkt: Record<string, number> = {};
  const endirekt: Record<string, number> = {};
  for (const b of sonuc.bransDirektEndirekt) {
    direkt[b.bransKodu] = b.direktPrim;
    endirekt[b.bransKodu] = b.endirektPrim;
  }
  await writePrivateFile(
    BUTCE_PRIM_BRANS_JSON,
    JSON.stringify({
      guncellemeIso: new Date().toISOString(),
      referansEtiket: body.referansEtiket ?? "2024",
      tarifeHedefleri,
      hedefler,
      direkt,
      endirekt,
    }),
  );
  const izlemeBrans = body.izlemeBrans ?? "701";
  const izlemeTarife = body.izlemeTarife ?? "YANGIN";
  const izleme = buildBransTarifeIzleme(
    sonuc.detay,
    satisRows,
    tarifeHedefleri,
    izlemeBrans,
    izlemeTarife,
  );

  return NextResponse.json({ ok: true, ...sonuc, izleme });
}
