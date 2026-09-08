/**
 * GT_Ozet Excel — GTV8 GT sayfasındaki oran geçmişi (mizan yıl × ağırlık birleştirme).
 */
import { HAZINE_BRANS_SIRASI } from "../config/brans";
import { ORAN_REFERANS_VARSAYILAN } from "../config/constants";
import { MizanOranServisi } from "../oran/mizanOranlar";
import { ORAN_KALEM_MIZAN } from "../oran/oranKalemLoader";
import { oranKalemAciklama } from "../oran/oranKalemAciklama";
import type { MizanAylikRow, MizanRow, OranAyarStore } from "../types";
import { GT_MOTOR_ORAN_KALEMLER } from "../v2/v2GtOranTablo";

export type GtOzetOranGecmisiYil = {
  yil: number;
  oran: number | null;
  agirlikli: boolean;
  agirlik: number | null;
};

export type GtOzetOranGecmisiBlok = {
  kalem: string;
  ad: string;
  gtHucre?: string;
  payPayda: string;
  agirlikMetni: string;
  sistemOran: number | null;
  yillar: GtOzetOranGecmisiYil[];
};

function kalemAy(kalem: string, ay: number): number {
  return kalem === "F349" ? 12 : ay;
}

function yilAgirlikCiftleri(kalem: string, yillar: number[]): Array<[number, number]> {
  const spec = ORAN_KALEM_MIZAN[kalem];
  if (!spec?.yil_birlestirme.length || yillar.length === 0) return [];
  const maxY = yillar[yillar.length - 1]!;
  const out: Array<[number, number]> = [];
  for (const [ofset, agirlik] of spec.yil_birlestirme) {
    const y = maxY - (ofset - 1);
    if (yillar.includes(y)) out.push([y, agirlik]);
  }
  return out;
}

function agirlikMetni(kalem: string, yillar: number[]): string {
  const cift = yilAgirlikCiftleri(kalem, yillar);
  if (cift.length === 0) return "—";
  return cift
    .map(([y, w]) => `${y}×${w.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    .join(" + ");
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

export function buildGtOzetOranGecmisi(opts: {
  mizan: MizanRow[];
  butceYili: number;
  mizanAylikFull: MizanAylikRow[];
  oranAyar: OranAyarStore;
  ay?: number;
}): GtOzetOranGecmisiBlok[] {
  const ay = opts.ay ?? 12;
  const servis = new MizanOranServisi(
    opts.mizan,
    opts.butceYili,
    opts.mizanAylikFull,
    true,
  );
  const kodlar = [...HAZINE_BRANS_SIRASI];
  const gosterilecekYillar = servis.yillar.slice(-4);
  const agirlikMap = new Map<number, number>();

  const bloklar: GtOzetOranGecmisiBlok[] = [];

  for (const kalem of GT_MOTOR_ORAN_KALEMLER) {
    if (!(kalem in ORAN_KALEM_MIZAN)) continue;
    const aciklama = oranKalemAciklama(kalem);
    if (!aciklama) continue;

    agirlikMap.clear();
    for (const [y, w] of yilAgirlikCiftleri(kalem, servis.yillar)) {
      agirlikMap.set(y, w);
    }

    const oranAy = kalemAy(kalem, ay);
    const sistemOran = round6(
      servis.grupOrani(kalem, kodlar, ORAN_REFERANS_VARSAYILAN, oranAy),
    );

    const yillar: GtOzetOranGecmisiYil[] = [];
    for (const yil of [...gosterilecekYillar].sort((a, b) => b - a)) {
      const olcum = servis.grupYilOlcum(kalem, kodlar, yil, 12);
      yillar.push({
        yil,
        oran: olcum?.oran == null ? null : round6(olcum.oran),
        agirlikli: agirlikMap.has(yil),
        agirlik: agirlikMap.get(yil) ?? null,
      });
    }

    bloklar.push({
      kalem,
      ad: aciklama.ad,
      gtHucre: aciklama.gtHucre,
      payPayda: aciklama.mizanOranFormul,
      agirlikMetni: agirlikMetni(kalem, servis.yillar),
      sistemOran,
      yillar,
    });
  }

  return bloklar;
}

export function gtOzetOranGecmisiExcelSatirlari(
  bloklar: GtOzetOranGecmisiBlok[],
): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [];
  const fmtCell = (n: number | null) =>
    n == null || !Number.isFinite(n) ? "" : Math.round(n * 1e6) / 1e6;
  const fmtTr = (n: number | null) =>
    n == null || !Number.isFinite(n)
      ? "—"
      : n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  for (const b of bloklar) {
    const hucre = b.gtHucre ? ` (${b.gtHucre})` : "";
    const sistem = b.sistemOran == null ? "" : ` → sistem ${fmtTr(b.sistemOran)}`;
    rows.push([
      "",
      "",
      `${b.ad}${hucre} — birleştirme: ${b.agirlikMetni}${sistem}`,
    ]);
    rows.push(["", "", `Pay ÷ payda: ${b.payPayda}`]);
    for (const y of b.yillar) {
      const ag =
        y.agirlikli && y.agirlik != null
          ? ` (ağırlık ${y.agirlik.toLocaleString("tr-TR", { style: "percent", maximumFractionDigits: 1 })})`
          : "";
      rows.push(["", "", `${y.yil} = ${fmtTr(y.oran)}${ag}`, fmtCell(y.oran)]);
    }
    rows.push([]);
  }
  return rows;
}
