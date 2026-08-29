"use client";

import { useMemo } from "react";
import { parseTsbDashboardUrl, type TsbDashboardUrlPrefs } from "@/lib/tsbDashboardDeepLink";
import { resolveDefaultSirketKodu, type TsbDefaultSirketMod } from "@/lib/tsbPrimDashboard";

export function useTsbDashboardUrlPrefs(): TsbDashboardUrlPrefs {
  return useMemo(() => {
    if (typeof window === "undefined") return {};
    return parseTsbDashboardUrl(window.location.search);
  }, []);
}

/** URL ?sirket= varsa onu seçer; yoksa mevcut varsayılan mantığı uygular. */
export function applyUrlSirketOrDefault(
  sirketler: { kod: number }[],
  urlSirket: number | undefined,
  current: number | "",
  setSirketKodu: (k: number) => void,
  defaultMod: TsbDefaultSirketMod,
): void {
  if (sirketler.length === 0) return;

  // Kullanıcının seçimi geçerliyse koru — stale urlPrefs ile ezme
  if (current !== "" && sirketler.some((s) => s.kod === current)) return;

  if (urlSirket != null && sirketler.some((s) => s.kod === urlSirket)) {
    setSirketKodu(urlSirket);
    return;
  }

  const kod = resolveDefaultSirketKodu(sirketler, defaultMod);
  if (kod !== null) setSirketKodu(kod);
}

/** URL ?donem= varsa seçer; yoksa son dönem state'te kalır. */
export function applyUrlDonemIfEmpty(
  donemler: string[],
  urlDonem: string | undefined,
  current: string,
  setDonem: (d: string) => void,
): void {
  if (donemler.length === 0 || current) return;
  if (urlDonem && donemler.includes(urlDonem)) setDonem(urlDonem);
}
