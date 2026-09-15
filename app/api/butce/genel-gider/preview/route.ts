import { NextResponse } from "next/server";

import { parseGenelGiderFromBuffer } from "@/lib/butce/import/genelGiderImportCore";
import { buildGenelGiderImportOzet } from "@/lib/butce/v3/genelGiderSummary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const butceYili = Number(form.get("butceYili") ?? 2026);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  }
  if (!Number.isInteger(butceYili) || butceYili < 2000 || butceYili > 2200) {
    return NextResponse.json({ error: "Geçerli bütceYili gerekli" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const parsed = parseGenelGiderFromBuffer(buf, butceYili);
  const ozet =
    parsed.rows.length > 0 ? buildGenelGiderImportOzet(parsed.rows, butceYili) : null;

  return NextResponse.json({
    ok: parsed.errors.length === 0,
    butceYili,
    satirSayisi: parsed.rows.length,
    errors: parsed.errors,
    warnings: parsed.warnings,
    log: parsed.log,
    ozet,
    ornekSatirlar: parsed.rows.slice(0, 8).map((r) => ({
      butceYili: r.butceYili,
      ay: r.ay,
      altHesapKodu: r.altHesapKodu,
      hesap: r.hesap,
      tutar: r.tutar,
      aciklama: r.hesapAd,
    })),
  });
}
