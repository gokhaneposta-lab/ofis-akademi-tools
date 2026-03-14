/**
 * Sayıyı Türkçe yazıya çevirir (0 - 999.999.999,99).
 * Fatura, çek, sözleşme metinleri için uygun format.
 */

const BIRLER = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const ONLAR = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];

function uceKadarCevir(n: number): string {
  if (n === 0) return "";
  if (n < 10) return BIRLER[n];
  if (n < 100) {
    const on = Math.floor(n / 10);
    const bir = n % 10;
    return ONLAR[on] + (bir > 0 ? " " + BIRLER[bir] : "");
  }
  const yuz = Math.floor(n / 100);
  const kalan = n % 100;
  const yuzMetin = yuz === 1 ? "yüz" : BIRLER[yuz] + "yüz";
  return yuzMetin + (kalan > 0 ? " " + uceKadarCevir(kalan) : "");
}

export function sayiyiYaziyaCevir(
  value: number,
  options?: { paraBirimi?: boolean; buyukHarf?: boolean }
): string {
  const { paraBirimi = false, buyukHarf = false } = options ?? {};
  if (!Number.isFinite(value) || value < 0) return "Geçersiz sayı";
  if (value > 999_999_999.99) return "Sayı çok büyük (max 999.999.999,99)";

  const tam = Math.floor(value);
  const kurus = Math.round((value - tam) * 100);

  if (tam === 0 && kurus === 0) {
    let s = "sıfır";
    if (paraBirimi) s += " Türk lirası";
    return buyukHarf ? s.toUpperCase() : s;
  }

  const parts: string[] = [];

  if (tam >= 1_000_000) {
    const milyon = Math.floor(tam / 1_000_000);
    parts.push(milyon === 1 ? "bir milyon" : uceKadarCevir(milyon) + " milyon");
  }
  let kalan = tam % 1_000_000;
  if (kalan >= 1_000) {
    const bin = Math.floor(kalan / 1_000);
    parts.push(bin === 1 ? "bin" : uceKadarCevir(bin) + " bin");
  }
  kalan = tam % 1_000;
  if (kalan > 0) {
    parts.push(uceKadarCevir(kalan));
  }

  let yazi = parts.join(" ").replace(/\s+/g, " ").trim();
  if (paraBirimi) {
    yazi += " Türk lirası";
    if (kurus > 0) yazi += " " + (kurus < 10 ? "sıfır " : "") + uceKadarCevir(kurus) + " kuruş";
  } else if (kurus > 0) {
    yazi += " virgül " + (kurus < 10 ? "sıfır " : "") + uceKadarCevir(kurus);
  }

  return buyukHarf ? yazi.toUpperCase() : yazi;
}
