import * as XLSX from "xlsx";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { BilancoAylikRow, MizanAylikRow, MizanRow } from "../types";

const PRIM_KODLAR = new Set(["0111", "01111", "01112"]);

const BRIDGE_SINGLE: Record<string, string> = {
  "60001": "0111",
  "600011": "01111",
  "600012": "01112",
  "60002": "0112",
  "60003": "0113",
  "600": "011",
  "60101": "0121",
  "60201": "0131",
  "60301": "0141",
  "61001": "0211",
  "61002": "0212",
  "61101": "0221",
  "61102": "0222",
  "611": "022",
  "611011": "02211",
  "611012": "02212",
  "611021": "02221",
  "611022": "02222",
  "61301101": "02411",
  "614011": "0251",
  "61402": "0252",
  "61408": "0258",
  "61409": "0259",
  "605": "016",
};

const BRIDGE_SUM: Record<string, { prefix: string; includes: string[]; excludes: string[] }> = {
  "6140110101": { prefix: "0251101", includes: ["URETIM KOMISYON GIDERI"], excludes: [] },
  "6140110102": { prefix: "0251101", includes: ["ERTELENMIS KOMISYON GIDER"], excludes: ["GELIR"] },
  "61401199": { prefix: "0251199", includes: ["KOMISYON GIDER"], excludes: ["GELIR"] },
};

function serialYM(value: unknown): [number, number] | null {
  if (value instanceof Date) return [value.getFullYear(), value.getMonth() + 1];
  const serial = Number(value);
  if (!Number.isFinite(serial)) return null;
  const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
  return [d.getUTCFullYear(), d.getUTCMonth() + 1];
}

function isLeafBrans(brans: string) {
  return /^\d{3}$/.test(brans) && brans[0] === "7";
}

function sortedMonths(monthMap: Map<number, number>) {
  return [...monthMap.entries()].sort((a, b) => a[0] - b[0]);
}

function latestDecember(
  gtGroups: Map<string, Map<number, Map<number, number>>>,
  adMap: Map<string, string>,
) {
  const out: MizanRow[] = [];
  const yillar = new Set<number>();
  const branslar = new Set<string>();
  for (const [key, byYear] of gtGroups) {
    const [bransKodu] = key.split("|");
    branslar.add(bransKodu);
    for (const yil of byYear.keys()) {
      if (byYear.get(yil)?.has(12)) yillar.add(yil);
    }
  }

  for (const bransKodu of branslar) {
    for (const [hesap, gtKod] of Object.entries(BRIDGE_SINGLE)) {
      for (const yil of yillar) {
        const gtKey = `${bransKodu}|${gtKod}`;
        const val = gtGroups.get(gtKey)?.get(yil)?.get(12) ?? 0;
        out.push({ yil, hesap, bransKodu, tutar: val });
      }
    }
    for (const [hesap, rule] of Object.entries(BRIDGE_SUM)) {
      for (const yil of yillar) {
        let sum = 0;
        for (const key of gtGroups.keys()) {
          const [b, kod] = key.split("|");
          if (b !== bransKodu || !kod.startsWith(rule.prefix)) continue;
          const ad = adMap.get(kod) ?? "";
          if (!rule.includes.every((s) => ad.includes(s))) continue;
          if (rule.excludes.some((s) => ad.includes(s))) continue;
          sum += gtGroups.get(key)?.get(yil)?.get(12) ?? 0;
        }
        out.push({ yil, hesap, bransKodu, tutar: sum });
      }
    }
  }
  return { rows: out, yillar: [...yillar].sort((a, b) => a - b) };
}

export function importAylikGtBilancoFromBuffer(buffer: Buffer): {
  mizan: MizanRow[];
  mizanAylik: MizanAylikRow[];
  mizanAylikFull: MizanAylikRow[];
  bilancoAylik: BilancoAylikRow[];
  yillar: number[];
  log: string;
} {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("Aylık GT ve Bilanço mizanı boş veya okunamadı.");

  const rows = XLSX.utils.sheet_to_json<(string | number | Date | null)[]>(sheet, {
    header: 1,
    defval: null,
  });

  const gtGroups = new Map<string, Map<number, Map<number, number>>>();
  const bilGroups = new Map<string, Map<number, Map<number, number>>>();
  const adMap = new Map<string, string>();
  let satirOk = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || normalizeText(r[1]) !== "SIGORTA") continue;
    const ym = serialYM(r[0]);
    if (!ym) continue;
    const [yil, ay] = ym;
    if (ay < 1 || ay > 12) continue;
    const hesapNo = String(r[2] ?? "").trim();
    if (!hesapNo) continue;
    const tutar = Number(r[4]) || 0;
    satirOk++;

    if (hesapNo[0] === "7") {
      const bransKodu = normalizeBransKodu(hesapNo.slice(0, 3));
      if (!isLeafBrans(bransKodu)) continue;
      const kod = hesapNo.slice(3);
      if (!adMap.has(kod)) adMap.set(kod, normalizeText(r[3]));
      const key = `${bransKodu}|${kod}`;
      if (!gtGroups.has(key)) gtGroups.set(key, new Map());
      if (!gtGroups.get(key)!.has(yil)) gtGroups.get(key)!.set(yil, new Map());
      gtGroups.get(key)!.get(yil)!.set(ay, tutar);
    } else {
      const key = hesapNo.replace(/\.0$/, "");
      if (!bilGroups.has(key)) bilGroups.set(key, new Map());
      if (!bilGroups.get(key)!.has(yil)) bilGroups.get(key)!.set(yil, new Map());
      bilGroups.get(key)!.get(yil)!.set(ay, tutar);
    }
  }

  const mizanAylikFull: MizanAylikRow[] = [];
  const mizanAylik: MizanAylikRow[] = [];
  for (const [key, byYear] of gtGroups) {
    const [bransKodu, hesap] = key.split("|");
    for (const [yil, byMonth] of byYear) {
      for (const [ay, tutar] of sortedMonths(byMonth)) {
        const row = { yil, ay, hesap, bransKodu, tutar };
        mizanAylikFull.push(row);
        if (PRIM_KODLAR.has(hesap)) mizanAylik.push(row);
      }
    }
  }

  const bilancoAylik: BilancoAylikRow[] = [];
  for (const [hesap, byYear] of bilGroups) {
    for (const [yil, byMonth] of byYear) {
      for (const [ay, tutar] of sortedMonths(byMonth)) {
        bilancoAylik.push({ yil, ay, hesap, tutar });
      }
    }
  }

  const mizan = latestDecember(gtGroups, adMap);
  const yillar = [...new Set([...mizan.yillar, ...mizanAylikFull.map((r) => r.yil)])].sort((a, b) => a - b);
  if (satirOk === 0 || yillar.length === 0) {
    throw new Error("Aylık GT ve Bilanço satırı okunamadı — Dönem, Şirket, Hesap No, Hesap Adı, Net kolonlarını kontrol edin.");
  }

  return {
    mizan: mizan.rows,
    mizanAylik,
    mizanAylikFull,
    bilancoAylik,
    yillar,
    log: `Aylık GT/Bilanço: ${satirOk.toLocaleString("tr-TR")} satır, yıl ${yillar[0]}–${yillar[yillar.length - 1]}`,
  };
}
