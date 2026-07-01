import * as XLSX from "xlsx";
import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { TarifeBransPayRow } from "../types";

function cell(row: Record<string, unknown>, wanted: string): unknown {
  const target = normalizeText(wanted);
  const key = Object.keys(row).find((k) => normalizeText(k) === target);
  return key ? row[key] : undefined;
}

export function importTarifeBransPayFromBuffer(buffer: Buffer): {
  rows: TarifeBransPayRow[];
  log: string;
} {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) throw new Error("Tarife-branş pay Excel boş veya okunamadı.");

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  const rows: TarifeBransPayRow[] = [];

  for (const row of rawRows) {
    const yil = Number(cell(row, "Tanzim Yıl"));
    const ay = Number(cell(row, "Tanzim Ay"));
    const bransKodu = normalizeBransKodu(cell(row, "Hazine Branş Kod"));
    const tarifeGrubu = normalizeText(cell(row, "Tarife Grup Adı"));
    const netPrim = Number(cell(row, "Net Prim TL")) || 0;

    if (!Number.isFinite(yil) || !Number.isFinite(ay) || ay < 1 || ay > 12) continue;
    if (!/^7\d\d$/.test(bransKodu) || !tarifeGrubu) continue;

    rows.push({
      sirket: String(cell(row, "Şirket") ?? "").trim(),
      tarifeGrubu,
      bransKodu,
      hazineBransAd: String(cell(row, "Hazine Branş Ad") ?? "").trim(),
      yil: Math.round(yil),
      ay: Math.round(ay),
      netPrim,
    });
  }

  if (rows.length === 0) {
    throw new Error(
      "Tarife-branş pay satırı okunamadı — Şirket, Tarife Grup Adı, Hazine Branş Kod, Tanzim Yıl/Ay, Net Prim TL kolonlarını kontrol edin.",
    );
  }

  const yillar = [...new Set(rows.map((r) => r.yil))].sort((a, b) => a - b);
  return {
    rows,
    log: `Tarife-branş pay: ${rows.length.toLocaleString("tr-TR")} satır, yıl ${yillar[0]}–${yillar[yillar.length - 1]}`,
  };
}
