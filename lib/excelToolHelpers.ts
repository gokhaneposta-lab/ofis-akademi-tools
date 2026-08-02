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

/** TR şirket ünvanından hukukî ekleri ve gürültüyü temizler. */
const UNVAN_SUFFIXES: RegExp[] = [
  /\bANON[İI]M\s+Ş[İI]RKET[İI]\b/gi,
  /\bL[İI]M[İI]TED\s+Ş[İI]RKET[İI]\b/gi,
  /\bLTD\.?\s*ŞT[İI]\.?\b/gi,
  /\bA\.?\s*Ş\.?\b/gi,
  /\bA\.?\s*S\.?\b/gi,
  /\bLTD\.?\b/gi,
  /\bŞT[İI]\.?\b/gi,
  /\bINC\.?\b/gi,
  /\bCORP\.?\b/gi,
  /\bCO\.?\b/gi,
  /\bLLC\.?\b/gi,
  /\bGMBH\b/gi,
  /\bS\.?\s*A\.?\b/gi,
];

export function cleanSirketUnvan(raw: string): string {
  let s = raw
    .replace(/["'`´]/g, "")
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
