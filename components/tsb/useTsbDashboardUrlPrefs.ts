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

  if (urlSirket != null && sirketler.some((s) => s.kod === urlSirket)) {
    if (current !== urlSirket) setSirketKodu(urlSirket);
    return;
  }

  if (current !== "" && sirketler.some((s) => s.kod === current)) return;

  const kod = resolveDefaultSirketKodu(sirketler, defaultMod);
  if (kod !== null) setSirketKodu(kod);
}
