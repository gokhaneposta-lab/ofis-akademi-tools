/**
 * Kanonik site kökü (sonunda / yok).
 * Production'da `NEXT_PUBLIC_SITE_URL` ile tek adres kullanın (www veya www'siz — ikisini birden değil).
 * Örnek: https://ofisakademi.com
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://ofisakademi.com";
  return raw.replace(/\/$/, "");
}

/** Tam kanonik URL; path "/" ile başlamalı. */
export function canonicalUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${p}`;
}
