/**
 * IBAN doğrulama (ISO 13616): Türkiye (TR) ve genel MOD-97 kontrolü.
 * IBAN'ı büyük harfe çevirip boşlukları kaldırarak kontrol eder.
 */
export function validateIBAN(iban: string): { valid: boolean; message?: string } {
  const raw = iban.trim().replace(/\s/g, "").toUpperCase();
  if (raw.length < 15 || raw.length > 34) return { valid: false, message: "Geçersiz uzunluk" };
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(raw)) return { valid: false, message: "Geçersiz format" };

  const rearranged = raw.slice(4) + raw.slice(0, 4);
  let numStr = "";
  for (const c of rearranged) {
    if (c >= "A" && c <= "Z") numStr += (c.charCodeAt(0) - 55).toString();
    else numStr += c;
  }

  let remainder = 0;
  for (let i = 0; i < numStr.length; i += 7) {
    const chunk = remainder.toString() + numStr.slice(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }
  return remainder === 1 ? { valid: true } : { valid: false, message: "Kontrol basamağı hatalı" };
}
