/**
 * Kanonik site kökü (sonunda / yok).
 * Production'da `NEXT_PUBLIC_SITE_URL` ile tek adres kullanın (www veya www'siz — ikisini birden değil).
 * Şu an kanonik: https://www.ofisakademi.com (Vercel'de ofisakademi.com → www'a 308 yönleniyor).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ofisakademi.com";
  return raw.replace(/\/$/, "");
}

/** Tam kanonik URL; path "/" ile başlamalı. */
export function canonicalUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${p}`;
}
