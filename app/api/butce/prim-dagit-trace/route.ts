import { NextResponse } from "next/server";
import {
  loadMizanRows,
  loadPrimBransHedefStore,
  loadSatisButceRows,
  loadTarifeBransPayRows,
  loadTarifeMapRows,
  loadUretimRows,
} from "@/lib/butce/loadData";
import { buildBransTarifeIzleme } from "@/lib/butce/prim/bransDagitimTrace";
import { DagitimMotoru, tarifeOzetFromSatis } from "@/lib/butce/prim/dagitimMotoru";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brans = searchParams.get("brans") ?? "701";
  const tarife = searchParams.get("tarife") ?? "YANGIN";
  const referans = searchParams.get("referans") ?? undefined;

  const satisRows = await loadSatisButceRows();
  const tarifeBransPay = await loadTarifeBransPayRows();
  const mizan = await loadMizanRows();
  const tarifeMap = await loadTarifeMapRows();
  const uretim = await loadUretimRows();
  const store = await loadPrimBransHedefStore();

  if (satisRows.length === 0 || tarifeBransPay.length === 0) {
    return NextResponse.json({ error: "Veri eksik — SATIS_BUTCE ve tarife-branş pay tablosu gerekli." }, { status: 400 });
  }

  let tarifeHedefleri: Record<string, number> = store?.tarifeHedefleri ?? {};
  if (Object.keys(tarifeHedefleri).length === 0) {
    for (const r of tarifeOzetFromSatis(satisRows)) {
      tarifeHedefleri[r.tarifeGrubu] = r.yeniHedef;
    }
  }

  const motor = new DagitimMotoru(uretim, tarifeMap, mizan, tarifeBransPay);
  const sonuc = motor.dagit({
    satisRows,
    referansEtiket: referans ?? store?.referansEtiket ?? "2024",
    mizanYedek: true,
    tarifeHedefleri,
  });

  const izleme = buildBransTarifeIzleme(sonuc.detay, satisRows, tarifeHedefleri, brans, tarife);

  return NextResponse.json({
    ok: true,
    izleme,
    kayitliBransHedef: store?.hedefler?.[brans] ?? null,
  });
}
