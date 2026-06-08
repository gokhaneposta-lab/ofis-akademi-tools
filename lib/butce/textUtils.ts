const TR_MAP: Record<string, string> = {
  İ: "I", I: "I", ı: "I", i: "I",
  Ş: "S", ş: "S", Ğ: "G", ğ: "G",
  Ü: "U", ü: "U", Ö: "O", ö: "O",
  Ç: "C", ç: "C",
};

export function normalizeText(value: unknown): string {
  if (value == null || value === "") return "";
  const s = String(value).trim();
  return [...s].map((ch) => TR_MAP[ch] ?? ch).join("").toUpperCase();
}

export function normalizeBransKodu(value: unknown): string {
  if (value == null) return "";
  let s = String(value).trim().replace(/\.0$/, "");
  if (/^\d+$/.test(s)) {
    return s.length <= 3 ? s.padStart(3, "0") : s;
  }
  return s;
}

export function isEndirektKanal(kanal1: unknown, sirket?: unknown): boolean {
  const k1 = normalizeText(kanal1);
  const sk = sirket != null ? normalizeText(sirket) : "";
  if (sk === "HAVUZ") return true;
  return k1.includes("HAVUZ") || k1.includes("ENDIREKT");
}
