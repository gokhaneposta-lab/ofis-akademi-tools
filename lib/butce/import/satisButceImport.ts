import * as XLSX from "xlsx";
import { normalizeText } from "../textUtils";
import type { SatisButceRow } from "../types";

function findColIndex(header: (string | number | null)[], keywords: string[]): number | null {
  for (let idx = 0; idx < header.length; idx++) {
    const val = header[idx];
    if (val == null) continue;
    const text = normalizeText(val);
    if (keywords.some((kw) => text.includes(normalizeText(kw)))) return idx;
  }
  return null;
}

function yearInHeader(text: string): number {
  const m = text.match(/20\d{2}/);
  return m ? parseInt(m[0], 10) : 0;
}

export function importSatisButceFromBuffer(buffer: Buffer): { rows: SatisButceRow[]; log: string } {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });
  const sheet = wb.Sheets.SATIS_BUTCE_;
  if (!sheet) {
    throw new Error(
      "SATIS_BUTCE_ sayfası bulunamadı — Bütçe GT Çalışma dosyasında sayfa adını kontrol edin.",
    );
  }

  const raw = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: null,
  });

  let headerRowIdx = 3;
  for (let i = 0; i < raw.length; i++) {
    const row = raw[i];
    if (!row) continue;
    const lower = row.map((v) => String(v ?? "").toLowerCase());
    if (lower.some((v) => v.includes("tarife")) || lower.some((v) => v.includes("hedef"))) {
      headerRowIdx = i;
      break;
    }
  }

  const header = raw[headerRowIdx] ?? [];
  const dataRows = raw.slice(headerRowIdx + 1);
  const ncols = Math.max(...dataRows.map((r) => r?.length ?? 0), header.length);

  if (ncols < 4) {
    throw new Error(`SATIS_BUTCE_ sayfasında yeterli kolon yok (en az 4 bekleniyor, ${ncols} bulundu).`);
  }

  let idx2023 = findColIndex(header, ["2023", "YIL SONU"]);
  let idx2024 = findColIndex(header, ["2024", "YIL SONU"]);
  if (idx2023 != null && idx2024 != null && idx2023 === idx2024) {
    idx2023 = ncols > 4 ? 4 : null;
    idx2024 = ncols > 5 ? 5 : null;
  }
  if (idx2023 == null && ncols > 4) {
    const cand = findColIndex(header, ["2023"]);
    if (cand != null) idx2023 = cand;
  }
  if (idx2024 == null && ncols > 5) {
    const cand = findColIndex(header, ["2024"]);
    if (cand != null && !normalizeText(header[cand] ?? "").includes("09")) idx2024 = cand;
  }

  let idx2025Tahmin = findColIndex(header, ["2025", "TAHMIN"]);
  if (idx2025Tahmin == null && ncols > 12) idx2025Tahmin = 12;

  const hedefCandidates: { idx: number; text: string }[] = [];
  for (let idx = 0; idx < header.length; idx++) {
    const val = header[idx];
    if (val == null) continue;
    const text = normalizeText(val);
    if (text.includes("HEDEF") && !text.includes("HGO")) hedefCandidates.push({ idx, text });
  }
  let idxHedef: number | null = null;
  if (hedefCandidates.length > 0) {
    hedefCandidates.sort((a, b) => yearInHeader(b.text) - yearInHeader(a.text));
    idxHedef = hedefCandidates[0].idx;
  }
  if (idxHedef == null && ncols > 15) idxHedef = 15;
  else if (idxHedef == null && ncols === 5) idxHedef = 4;

  const col = (row: (string | number | null)[], seriesIdx: number | null): number => {
    if (seriesIdx == null || seriesIdx >= row.length) return 0;
    const n = Number(row[seriesIdx]);
    return Number.isFinite(n) ? n : 0;
  };

  const rows: SatisButceRow[] = [];
  for (const row of dataRows) {
    if (!row || row.length < 4) continue;
    const tarifeGrubu = String(row[3] ?? "").trim();
    if (!tarifeGrubu) continue;
    rows.push({
      sirket: String(row[0] ?? "").trim(),
      kanal1: String(row[1] ?? "").trim(),
      kanal2: String(row[2] ?? "").trim(),
      tarifeGrubu,
      oncekiYil1: col(row, idx2023),
      oncekiYil2: col(row, idx2024),
      tahminYilsonu: col(row, idx2025Tahmin),
      hedefPrim: col(row, idxHedef),
    });
  }

  if (rows.length === 0) {
    throw new Error("SATIS_BUTCE_ satırı okunamadı — tarife grubu (D kolonu) dolu satır yok.");
  }

  return {
    rows,
    log: `SATIS_BUTCE_: ${rows.length.toLocaleString("tr-TR")} satır`,
  };
}
