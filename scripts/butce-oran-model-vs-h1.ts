/**
 * Teknik oran varsayımı (excel_gt / YE ağırlıklı) vs 2026 H1 (ay=6) mizan.
 * İşaretli tutar — Math.abs yok.
 * Kullanım: npx tsx scripts/butce-oran-model-vs-h1.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { HAZINE_BRANS_SIRASI } from "../lib/butce/config/brans";
import { MizanOranServisi, oranKalemListesi } from "../lib/butce/oran/mizanOranlar";
import { ORAN_KALEM_MIZAN } from "../lib/butce/oran/oranKalemLoader";
import type { MizanAylikRow, MizanRow } from "../lib/butce/types";

const BUTCE_YILI = 2026;
const H1_YIL = 2026;
const H1_AY = 6;

/** Aylık GT kodu → mizan hesap (BRIDGE_SINGLE tersi + komisyon yaprakları). */
const GT_TO_MIZAN: Record<string, string> = {
  "0111": "60001",
  "01111": "600011",
  "01112": "600012",
  "0112": "60002",
  "0113": "60003",
  "011": "600",
  "0121": "60101",
  "0131": "60201",
  "0141": "60301",
  "0211": "61001",
  "0212": "61002",
  "0221": "61101",
  "0222": "61102",
  "022": "611",
  "02211": "611011",
  "02212": "611012",
  "02221": "611021",
  "02222": "611022",
  "016": "605",
  "0252": "61402",
  "0258": "61408",
  "0259": "61409",
  "0251": "61401",
  "02571": "614071",
  // YE recon ile doğrulanmış yapraklar
  "0251101010101": "6140110101",
  "0251101010102": "6140110102",
  "0251199": "61401199",
  "02511": "614011",
};

const mizan = JSON.parse(readFileSync("data/butce/private/mizan-tidy.json", "utf8")) as MizanRow[];
const aylik = JSON.parse(
  readFileSync("data/butce/private/mizan-aylik-full.json", "utf8"),
) as MizanAylikRow[];

/** 2026 ay-6 kümülatif → mizan kodlu sentetik yıl satırları */
function h1MizanRows(): MizanRow[] {
  const out: MizanRow[] = [];
  for (const r of aylik) {
    if (r.yil !== H1_YIL || r.ay !== H1_AY) continue;
    const gt = String(r.hesap);
    const mizanHesap = GT_TO_MIZAN[gt];
    if (!mizanHesap) continue;
    out.push({
      yil: H1_YIL,
      hesap: mizanHesap,
      bransKodu: r.bransKodu,
      tutar: Number(r.tutar) || 0,
    });
  }
  // brans_gt kalemleri (F300): GT suffix olduğu gibi
  for (const r of aylik) {
    if (r.yil !== H1_YIL || r.ay !== H1_AY) continue;
    const h = String(r.hesap);
    if (h === "02571" || h === "0112") {
      out.push({
        yil: H1_YIL,
        hesap: h,
        bransKodu: r.bransKodu,
        tutar: Number(r.tutar) || 0,
      });
    }
  }
  return out;
}

const h1Rows = h1MizanRows();
const servisModel = new MizanOranServisi(mizan, BUTCE_YILI, aylik);
// H1 ölçümü: yalnız 2026 ay-6 satırları (önceki yıllar yok → yilOlcum 2026 için)
const servisH1 = new MizanOranServisi(h1Rows, H1_YIL + 1, []);

function companyYilFixed(
  servis: MizanOranServisi,
  kalem: string,
  yil: number,
): { pay: number; baz: number; oran: number | null } {
  const spec = ORAN_KALEM_MIZAN[kalem];
  if (!spec) return { pay: 0, baz: 0, oran: null };

  if (spec.baz_toplam_sirket) {
    let pay = 0;
    let baz = 0;
    let bazSet = false;
    for (const br of HAZINE_BRANS_SIRASI) {
      const o = servis.yilOlcum(kalem, br, yil);
      if (!o) continue;
      pay += o.pay;
      if (!bazSet) {
        baz = o.baz;
        bazSet = true;
      }
    }
    return { pay, baz, oran: Math.abs(baz) > 1 ? pay / baz : null };
  }

  let pay = 0;
  let baz = 0;
  for (const br of HAZINE_BRANS_SIRASI) {
    const o = servis.yilOlcum(kalem, br, yil);
    if (!o) continue;
    pay += o.pay;
    baz += o.baz;
  }
  return { pay, baz, oran: Math.abs(baz) > 1 ? pay / baz : null };
}

/** Model: kalemin yil_birlestirme ağırlıklarıyla şirket YE oranları */
function modelOran(kalem: string): {
  oran: number | null;
  detay: { yil: number; w: number; oran: number | null; pay: number; baz: number }[];
} {
  const spec = ORAN_KALEM_MIZAN[kalem];
  if (!spec) return { oran: null, detay: [] };
  const weights = spec.yil_birlestirme?.length
    ? spec.yil_birlestirme
    : ([[1, 1]] as [number, number][]);

  const detay: { yil: number; w: number; oran: number | null; pay: number; baz: number }[] = [];
  let num = 0;
  let den = 0;
  for (const [ofset, w] of weights) {
    const yil = BUTCE_YILI - ofset;
    const o = companyYilFixed(servisModel, kalem, yil);
    detay.push({ yil, w, oran: o.oran, pay: o.pay, baz: o.baz });
    if (o.oran == null) continue;
    num += o.oran * w;
    den += w;
  }
  return { oran: den > 0 ? num / den : null, detay };
}

/** Prim-hacmi ağırlıklı branş excel_gt (UI'ya daha yakın) */
function modelBransAgirlikli(kalem: string): number | null {
  let num = 0;
  let den = 0;
  for (const br of HAZINE_BRANS_SIRASI) {
    let oran: number;
    try {
      oran = servisModel.bransOrani(kalem, br, "excel_gt");
    } catch {
      continue;
    }
    // ağırlık: son YE baz (2025)
    const olc = servisModel.yilOlcum(kalem, br, 2025);
    const w = olc ? Math.abs(olc.baz) : 0;
    if (w < 1) continue;
    num += oran * w;
    den += w;
  }
  return den > 0 ? num / den : null;
}

type Row = {
  kod: string;
  ad: string;
  gt: string;
  modelSirket: number | null;
  modelBransW: number | null;
  h1: number | null;
  farkPp: number | null;
  h1PayMn: number | null;
  h1BazMn: number | null;
  modelPayImpliedMn: number | null;
  gapMn: number | null;
  not: string;
};

const rows: Row[] = [];

for (const { kod, ad } of oranKalemListesi()) {
  if (!(kod in ORAN_KALEM_MIZAN)) continue;
  const spec = ORAN_KALEM_MIZAN[kod];
  const m = modelOran(kod);
  const mBr = modelBransAgirlikli(kod);
  const h1 = companyYilFixed(servisH1, kod, H1_YIL);

  // H1 bazıyla model payı (işaretli)
  const modelOr = m.oran;
  const modelPayImplied =
    modelOr != null && h1.baz !== 0 ? modelOr * h1.baz : null;
  const gap = modelPayImplied != null ? modelPayImplied - h1.pay : null;

  let not = "";
  if (["F353", "F358", "0251", "F363", "0251199"].includes(kod)) {
    not = "komisyon GT yaprak eşlemesi";
  }
  if (spec.baz_toplam_sirket) not = (not ? not + "; " : "") + "şirket-baz";
  if (spec.hesap_eslesme === "brans_gt") not = (not ? not + "; " : "") + "brans_gt";

  rows.push({
    kod,
    ad,
    gt: spec.gt_hucre ?? "",
    modelSirket: m.oran,
    modelBransW: mBr,
    h1: h1.oran,
    farkPp:
      m.oran != null && h1.oran != null ? (m.oran - h1.oran) * 100 : null,
    h1PayMn: h1.oran != null ? h1.pay / 1e6 : null,
    h1BazMn: h1.oran != null ? h1.baz / 1e6 : null,
    modelPayImpliedMn: modelPayImplied != null ? modelPayImplied / 1e6 : null,
    gapMn: gap != null ? gap / 1e6 : null,
    not,
  });
}

rows.sort((a, b) => Math.abs(b.farkPp ?? 0) - Math.abs(a.farkPp ?? 0));

function pct(x: number | null) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${(x * 100).toFixed(1)}%`;
}
function pp(x: number | null) {
  if (x == null) return "—";
  const s = x >= 0 ? "+" : "";
  return `${s}${x.toFixed(1)} pp`;
}
function mn(x: number | null) {
  if (x == null) return "—";
  return `${Math.round(x).toLocaleString("tr-TR")} Mn`;
}

const md: string[] = [
  "# Teknik oranlar: Model (excel_gt) vs 2026 H1 mizan",
  "",
  "İşaretli tutar (KPK eksi kalır). Model = geçmiş YE ağırlıklı şirket pay/baz.",
  "H1 = 2026 ay-6 kümülatif (GT→mizan köprüsü).",
  "",
  "| Kod | Ad | Model | H1 2026 | Fark | H1 baz | Model−H1 tutar* |",
  "| --- | --- | ---: | ---: | ---: | ---: | ---: |",
];

for (const r of rows) {
  md.push(
    `| ${r.kod} | ${r.ad.slice(0, 40)} | ${pct(r.modelSirket)} | ${pct(r.h1)} | ${pp(r.farkPp)} | ${mn(r.h1BazMn)} | ${mn(r.gapMn)} |`,
  );
}
md.push("");
md.push("\\* Model−H1 tutar = (model oran × H1 baz) − H1 pay. Aynı baz üzerinde oran farkının tutar etkisi.");

writeFileSync("public/exports/teknik-oranlar-model-vs-h1-2026.md", md.join("\n"), "utf8");
writeFileSync(
  "public/exports/teknik-oranlar-model-vs-h1-2026.json",
  JSON.stringify({ generatedAt: new Date().toISOString(), butceYili: BUTCE_YILI, h1: `${H1_YIL}-${H1_AY}`, rows }, null, 2),
  "utf8",
);

console.log(md.join("\n"));
