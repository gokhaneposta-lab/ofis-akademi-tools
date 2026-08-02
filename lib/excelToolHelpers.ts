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
