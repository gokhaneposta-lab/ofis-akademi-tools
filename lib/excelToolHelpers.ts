/** Excel araçlarında paylaşılan küçük yardımcılar (client-safe). */

export function detectSeparator(line: string): string {
  if (line.includes("\t")) return "\t";
  if (line.includes("|")) return "|";
  if (line.includes(";")) return ";";
  if (line.includes(",")) return ",";
  return "\t";
}

export function looksLikeNumber(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return /^-?\d+([.,]\d+)?$/.test(t.replace(",", "."));
}

export function sqlEscape(val: string): string {
  return val.replace(/'/g, "''");
}

export function formatSqlValue(cell: string, forceQuote: boolean): string {
  const t = cell.trim();
  if (!forceQuote && looksLikeNumber(t)) {
    return t.replace(",", ".");
  }
  return `'${sqlEscape(t)}'`;
}

/**
 * TR şirket ünvanından hukukî ekleri temizler.
 * Noktalı yazımlar da kapsanır: L.T.D, L.T.D., A.Ş., Ş.T.İ. vb.
 * Son sınır `\b` yerine (?=\s|$|noktalama) — "A.Ş." / "L.T.D." için gerekli.
 */
const UNVAN_END = "(?=\\s|$|[.,;|/\\\\])";
const UNVAN_SUFFIXES: RegExp[] = [
  new RegExp(`\\bANON[İI]M\\s+Ş[İI]RKET[İI]${UNVAN_END}`, "gi"),
  new RegExp(`\\bL[İI]M[İI]TED\\s+Ş[İI]RKET[İI]${UNVAN_END}`, "gi"),
  new RegExp(`\\bL\\.?\\s*T\\.?\\s*D\\.?\\s*Ş\\.?\\s*T\\.?\\s*[İI]\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bLTD\\.?\\s*ŞT[İI]\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bL\\.?\\s*T\\.?\\s*D\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bLTD\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bA\\.?\\s*Ş\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bA\\.?\\s*S\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bŞ\\.?\\s*T\\.?\\s*[İI]\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bŞT[İI]\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bI\\.?\\s*N\\.?\\s*C\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bINC\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bC\\.?\\s*O\\.?\\s*R\\.?\\s*P\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bCORP\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bL\\.?\\s*L\\.?\\s*C\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bLLC\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bG\\.?\\s*M\\.?\\s*B\\.?\\s*H\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bGMBH${UNVAN_END}`, "gi"),
  new RegExp(`\\bS\\.?\\s*A\\.?${UNVAN_END}`, "gi"),
  new RegExp(`\\bCO\\.?${UNVAN_END}`, "gi"),
];

export function cleanSirketUnvan(raw: string): string {
  let s = raw
    .replace(/["'`´']/g, "")
    .replace(/\u00a0/g, " ")
    .trim();
  for (const re of UNVAN_SUFFIXES) {
    s = s.replace(re, " ");
  }
  s = s
    .replace(/[.,;|/\\]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

export function extractOnlyNumbers(line: string): string {
  const matches = line.match(/-?\d+(?:[.,]\d+)?/g);
  return matches ? matches.join(" ") : "";
}

export function extractOnlyText(line: string): string {
  return line
    .replace(/-?\d+(?:[.,]\d+)?/g, " ")
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TR_SLUG_MAP: Record<string, string> = {
  ç: "c",
  Ç: "c",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  İ: "i",
  I: "i",
  ö: "o",
  Ö: "o",
  ş: "s",
  Ş: "s",
  ü: "u",
  Ü: "u",
};

export type SlugifyStyle = "kebab" | "snake" | "compact";

/** Türkçe karakterleri ASCII’ye çevirip slug üretir. */
export function slugifyTr(raw: string, style: SlugifyStyle): string {
  let s = raw.trim();
  s = [...s].map((ch) => TR_SLUG_MAP[ch] ?? ch).join("");
  s = s.normalize("NFD").replace(/\p{M}/gu, "");
  s = s.toLowerCase();
  if (style === "compact") {
    return s.replace(/[^a-z0-9]+/g, "");
  }
  const sep = style === "snake" ? "_" : "-";
  s = s.replace(/[^a-z0-9]+/g, sep).replace(new RegExp(`^${sep}+|${sep}+$`, "g"), "");
  return s.replace(new RegExp(`${sep}{2,}`, "g"), sep);
}

export type ExtractPreset = "email" | "url" | "ip";

const EXTRACT_RES: Record<ExtractPreset, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  url: /https?:\/\/[^\s<>"'`]+/gi,
  // IPv4
  ip: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|1?\d{1,2})\b/g,
};

/** Preset ile metinden benzersiz eşleşmeleri ayıklar (sıra korunur). */
export function extractByPreset(text: string, preset: ExtractPreset): string[] {
  const re = new RegExp(EXTRACT_RES[preset].source, EXTRACT_RES[preset].flags);
  const found = text.match(re) ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of found) {
    let v = raw;
    if (preset === "url") v = v.replace(/[),.;]+$/g, "");
    const key = preset === "email" ? v.toLowerCase() : v;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

/** Excel/TSV yapıştırmayı Markdown tabloya çevirir. */
export function excelPasteToMarkdown(input: string): string {
  const lines = input.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return "";
  const sep = lines[0].includes("\t")
    ? "\t"
    : lines[0].includes("|")
      ? "|"
      : lines[0].includes(";")
        ? ";"
        : ",";
  const rows = lines.map((line) =>
    line.split(sep).map((c) => c.trim().replace(/\|/g, "\\|")),
  );
  const width = Math.max(...rows.map((r) => r.length));
  const norm = rows.map((r) => {
    const copy = [...r];
    while (copy.length < width) copy.push("");
    return copy;
  });
  const header = norm[0];
  const body = norm.slice(1);
  const fmt = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const sepRow = `| ${header.map(() => "---").join(" | ")} |`;
  return [fmt(header), sepRow, ...body.map(fmt)].join("\n");
}
