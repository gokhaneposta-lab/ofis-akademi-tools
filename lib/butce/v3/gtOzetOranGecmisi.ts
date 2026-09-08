/**
 * GT_Ozet / format_7 / Format_Grup Excel — oran geçmişi (mizan yıl × ağırlık birleştirme).
 */
import { HAZINE_BRANS_SIRASI } from "../config/brans";
import { ORAN_REFERANS_VARSAYILAN } from "../config/constants";
import { MizanOranServisi } from "../oran/mizanOranlar";
import { ORAN_KALEM_MIZAN } from "../oran/oranKalemLoader";
import { oranKalemAciklama } from "../oran/oranKalemAciklama";
import type { MizanAylikRow, MizanRow, OranAyarStore } from "../types";
import { GRUP_SIRA, bransGrubu } from "../v2/buildGtFormatGrid";
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

export type FormatOranGecmisiKolon = {
  id: string;
  sistemOran: number | null;
  yillar: GtOzetOranGecmisiYil[];
};

export type FormatOranGecmisiBlok = {
  kalem: string;
  ad: string;
  gtHucre?: string;
  payPayda: string;
  agirlikMetni: string;
  toplamSistem: number | null;
  toplamYillar: GtOzetOranGecmisiYil[];
  kolonlar: FormatOranGecmisiKolon[];
};

export type FormatOranGecmisiSheet = {
  kolonIds: string[];
  bloklar: FormatOranGecmisiBlok[];
};

export type OranGecmisiPaket = {
  sirket: GtOzetOranGecmisiBlok[];
  format7: FormatOranGecmisiSheet;
  formatGrup: FormatOranGecmisiSheet;
};

export type FormatOranSheetLayout = {
  labelCol: number;
  toplamCol: number;
  dataCol: number;
  colCount: number;
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

function yilSatirlari(
  servis: MizanOranServisi,
  kalem: string,
  kodlar: readonly string[],
  gosterilecekYillar: number[],
  agirlikMap: Map<number, number>,
): GtOzetOranGecmisiYil[] {
  const out: GtOzetOranGecmisiYil[] = [];
  for (const yil of [...gosterilecekYillar].sort((a, b) => b - a)) {
    const olcum = servis.grupYilOlcum(kalem, kodlar, yil, 12);
    out.push({
      yil,
      oran: olcum?.oran == null ? null : round6(olcum.oran),
      agirlikli: agirlikMap.has(yil),
      agirlik: agirlikMap.get(yil) ?? null,
    });
  }
  return out;
}

type OranKolonTanim = { id: string; kodlar: string[] };

function buildFormatSheet(
  servis: MizanOranServisi,
  kolonTanimlari: OranKolonTanim[],
  sirketKodlar: string[],
  ay: number,
): FormatOranGecmisiSheet {
  const gosterilecekYillar = servis.yillar.slice(-4);
  const agirlikMap = new Map<number, number>();
  const bloklar: FormatOranGecmisiBlok[] = [];

  for (const kalem of GT_MOTOR_ORAN_KALEMLER) {
    if (!(kalem in ORAN_KALEM_MIZAN)) continue;
    const aciklama = oranKalemAciklama(kalem);
    if (!aciklama) continue;

    agirlikMap.clear();
    for (const [y, w] of yilAgirlikCiftleri(kalem, servis.yillar)) {
      agirlikMap.set(y, w);
    }

    const oranAy = kalemAy(kalem, ay);
    const kolonlar: FormatOranGecmisiKolon[] = kolonTanimlari.map(({ id, kodlar }) => ({
      id,
      sistemOran: round6(
        servis.grupOrani(kalem, kodlar, ORAN_REFERANS_VARSAYILAN, oranAy),
      ),
      yillar: yilSatirlari(servis, kalem, kodlar, gosterilecekYillar, agirlikMap),
    }));

    bloklar.push({
      kalem,
      ad: aciklama.ad,
      gtHucre: aciklama.gtHucre,
      payPayda: aciklama.mizanOranFormul,
      agirlikMetni: agirlikMetni(kalem, servis.yillar),
      toplamSistem: round6(
        servis.grupOrani(kalem, sirketKodlar, ORAN_REFERANS_VARSAYILAN, oranAy),
      ),
      toplamYillar: yilSatirlari(
        servis,
        kalem,
        sirketKodlar,
        gosterilecekYillar,
        agirlikMap,
      ),
      kolonlar,
    });
  }

  return {
    kolonIds: kolonTanimlari.map((k) => k.id),
    bloklar,
  };
}

export function buildOranGecmisiPaket(
  opts: {
    mizan: MizanRow[];
    butceYili: number;
    mizanAylikFull: MizanAylikRow[];
    oranAyar: OranAyarStore;
    ay?: number;
  },
  aktifBranslar: string[],
): OranGecmisiPaket {
  const ay = opts.ay ?? 12;
  const servis = new MizanOranServisi(
    opts.mizan,
    opts.butceYili,
    opts.mizanAylikFull,
    true,
  );
  const sirketKodlar = [...HAZINE_BRANS_SIRASI];
  const gosterilecekYillar = servis.yillar.slice(-4);
  const agirlikMap = new Map<number, number>();
  const sirket: GtOzetOranGecmisiBlok[] = [];

  for (const kalem of GT_MOTOR_ORAN_KALEMLER) {
    if (!(kalem in ORAN_KALEM_MIZAN)) continue;
    const aciklama = oranKalemAciklama(kalem);
    if (!aciklama) continue;

    agirlikMap.clear();
    for (const [y, w] of yilAgirlikCiftleri(kalem, servis.yillar)) {
      agirlikMap.set(y, w);
    }

    const oranAy = kalemAy(kalem, ay);
    sirket.push({
      kalem,
      ad: aciklama.ad,
      gtHucre: aciklama.gtHucre,
      payPayda: aciklama.mizanOranFormul,
      agirlikMetni: agirlikMetni(kalem, servis.yillar),
      sistemOran: round6(
        servis.grupOrani(kalem, sirketKodlar, ORAN_REFERANS_VARSAYILAN, oranAy),
      ),
      yillar: yilSatirlari(servis, kalem, sirketKodlar, gosterilecekYillar, agirlikMap),
    });
  }

  const format7Kolonlar: OranKolonTanim[] = aktifBranslar.map((k) => ({
    id: k,
    kodlar: [k],
  }));

  const formatGrupKolonlar: OranKolonTanim[] = GRUP_SIRA.map((grup) => ({
    id: grup,
    kodlar: aktifBranslar.filter((k) => bransGrubu(k) === grup),
  }));

  return {
    sirket,
    format7: buildFormatSheet(servis, format7Kolonlar, sirketKodlar, ay),
    formatGrup: buildFormatSheet(servis, formatGrupKolonlar, sirketKodlar, ay),
  };
}

export function buildGtOzetOranGecmisi(opts: {
  mizan: MizanRow[];
  butceYili: number;
  mizanAylikFull: MizanAylikRow[];
  oranAyar: OranAyarStore;
  ay?: number;
}): GtOzetOranGecmisiBlok[] {
  return buildOranGecmisiPaket(opts, []).sirket;
}

const fmtCell = (n: number | null) =>
  n == null || !Number.isFinite(n) ? "" : Math.round(n * 1e6) / 1e6;

const fmtTr = (n: number | null) =>
  n == null || !Number.isFinite(n)
    ? "—"
    : n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 });

function bosSatir(colCount: number): Array<string | number> {
  return Array(colCount).fill("");
}

function doldurSatir(
  row: Array<string | number>,
  labelCol: number,
  toplamCol: number,
  dataCol: number,
  label: string,
  toplam: number | null,
  kolonDegerleri: Array<number | null>,
): void {
  row[labelCol] = label;
  row[toplamCol] = fmtCell(toplam);
  kolonDegerleri.forEach((v, i) => {
    row[dataCol + i] = fmtCell(v);
  });
}

export function gtOzetOranGecmisiExcelSatirlari(
  bloklar: GtOzetOranGecmisiBlok[],
): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [];

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

export function formatSheetOranGecmisiExcelSatirlari(
  sheet: FormatOranGecmisiSheet,
  layout: FormatOranSheetLayout,
  baslik: string,
): Array<Array<string | number>> {
  const { labelCol, toplamCol, dataCol, colCount } = layout;
  const rows: Array<Array<string | number>> = [];

  const baslikRow = bosSatir(colCount);
  baslikRow[labelCol] = baslik;
  rows.push(baslikRow);

  for (const b of sheet.bloklar) {
    const hucre = b.gtHucre ? ` (${b.gtHucre})` : "";
    const kolonSistem = b.kolonlar.map((k) => k.sistemOran);

    const headerRow = bosSatir(colCount);
    doldurSatir(
      headerRow,
      labelCol,
      toplamCol,
      dataCol,
      `${b.ad}${hucre} — birleştirme: ${b.agirlikMetni}`,
      b.toplamSistem,
      kolonSistem,
    );
    rows.push(headerRow);

    const payRow = bosSatir(colCount);
    payRow[labelCol] = `Pay ÷ payda: ${b.payPayda}`;
    rows.push(payRow);

    const yilSet = new Set<number>();
    for (const y of b.toplamYillar) yilSet.add(y.yil);
    for (const k of b.kolonlar) for (const y of k.yillar) yilSet.add(y.yil);
    const yilSirasi = [...yilSet].sort((a, b) => b - a);

    for (const yil of yilSirasi) {
      const ty = b.toplamYillar.find((y) => y.yil === yil);
      const ag =
        ty?.agirlikli && ty.agirlik != null
          ? ` (ağırlık ${ty.agirlik.toLocaleString("tr-TR", { style: "percent", maximumFractionDigits: 1 })})`
          : "";
      const kolonYil = b.kolonlar.map(
        (k) => k.yillar.find((y) => y.yil === yil)?.oran ?? null,
      );
      const yilRow = bosSatir(colCount);
      doldurSatir(
        yilRow,
        labelCol,
        toplamCol,
        dataCol,
        `${yil} = ${fmtTr(ty?.oran ?? null)}${ag}`,
        ty?.oran ?? null,
        kolonYil,
      );
      rows.push(yilRow);
    }
    rows.push(bosSatir(colCount));
  }

  return rows;
}
