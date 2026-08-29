import { buildTsbDashboardHref, type TsbDashboardUrlPrefs } from "./tsbDashboardDeepLink";
import type { TsbSektorSegment } from "./tsbPrimDashboard";
import type { SegmentSkorPool } from "./tsbSirketSegmentSkor";
import { olcekFinDonemForPrimDonem } from "./tsbOlcekSegmentCache";
import type { OlcekSegmentCache } from "./tsbOlcekSegmentCache";

export type TsbHazirSorgu = {
  id: string;
  label: string;
  href: string;
};

type HazirSorguGirdi = {
  sirketKodu: number;
  donem: string;
  segment: TsbSektorSegment;
  olcekCache: OlcekSegmentCache | null;
};

function poolForSegment(segment: TsbSektorSegment): SegmentSkorPool {
  return segment === "hayat" ? "HAYAT_EMEKLILIK" : "HD";
}

function hazirSorguHref(
  girdi: HazirSorguGirdi,
  path: string,
  extra?: Partial<TsbDashboardUrlPrefs>,
): string {
  const finDonem =
    girdi.olcekCache && girdi.donem
      ? olcekFinDonemForPrimDonem(girdi.olcekCache, girdi.donem)
      : null;
  const base: TsbDashboardUrlPrefs = {
    sirket: girdi.sirketKodu,
    donem: girdi.donem,
    segment: girdi.segment,
    pool: poolForSegment(girdi.segment),
    ...extra,
  };
  if (finDonem && (path.includes("finansal") || path.includes("hasar-prim"))) {
    base.donem = finDonem;
  }
  return buildTsbDashboardHref(path, base);
}

/** Şirket karne — hazır panel geçiş chip'leri. */
export function tsbHazirSorgularKarne(girdi: HazirSorguGirdi): TsbHazirSorgu[] {
  const items: { id: string; label: string; path: string; extra?: Partial<TsbDashboardUrlPrefs> }[] = [
    { id: "finansal", label: "Finansal KPI", path: "/sigorta/finansal-karsilastirma" },
    { id: "hp", label: "Hasar / Prim", path: "/sigorta/hasar-prim-orani" },
    { id: "kanal", label: "Kanal payı", path: "/sigorta/kanal-dagilim" },
    { id: "brans-sira", label: "Branş sırası", path: "/sigorta/brans-sira" },
    { id: "trend", label: "12 ay trend", path: "/sigorta/prim-trend-12" },
    { id: "brans-degisim", label: "Branş değişim", path: "/sigorta/brans-degisim" },
    { id: "hhi", label: "Pazar yoğunlaşma", path: "/sigorta/pazar-yogunlasma" },
    { id: "olcek", label: "Ölçek segmenti", path: "/sigorta/olcek-segmentasyon" },
  ];
  return items.map(({ id, label, path, extra }) => ({
    id,
    label,
    href: hazirSorguHref(girdi, path, extra),
  }));
}
