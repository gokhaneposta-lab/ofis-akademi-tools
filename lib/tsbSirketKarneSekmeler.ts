import { buildTsbDashboardHref, type TsbDashboardUrlPrefs } from "./tsbDashboardDeepLink";
import type { SegmentSkorPool } from "./tsbSirketSegmentSkor";

export type TsbSirketKarneSekme = "ozet" | "finansal" | "teknik" | "prim" | "pazar";

export const TSB_SIRKET_KARNE_SEKMELER: readonly {
  id: TsbSirketKarneSekme;
  label: string;
  description: string;
}[] = [
  { id: "ozet", label: "Özet", description: "Prim, finansal, kanal ve 12 ay trend" },
  { id: "finansal", label: "Finansal", description: "GT ve bilanço KPI önizleme" },
  { id: "teknik", label: "Teknik", description: "Hasar/prim ve teknik sonuç" },
  { id: "prim", label: "Prim", description: "Kanal ve branş üretim panelleri" },
  { id: "pazar", label: "Pazar", description: "Branş payı ve sıralama" },
] as const;

export type TsbSirketKarnePanelLink = {
  href: string;
  title: string;
  subtitle: string;
  badge: string;
};

const KARNE_PATH = "/sigorta/sirket-karne";

export function parseSirketKarneSekme(raw: string | null | undefined): TsbSirketKarneSekme {
  if (raw === "finansal" || raw === "teknik" || raw === "prim" || raw === "pazar") return raw;
  return "ozet";
}

export function sirketKarnePrefs(
  prefs: TsbDashboardUrlPrefs & { sekme?: TsbSirketKarneSekme },
): string {
  const q = new URLSearchParams();
  if (prefs.sirket != null) q.set("sirket", String(prefs.sirket));
  if (prefs.donem) q.set("donem", prefs.donem);
  if (prefs.segment) q.set("segment", prefs.segment);
  if (prefs.sekme && prefs.sekme !== "ozet") q.set("sekme", prefs.sekme);
  const s = q.toString();
  return s ? `${KARNE_PATH}?${s}` : KARNE_PATH;
}

export function sirketKarneHref(kod: number, sekme?: TsbSirketKarneSekme): string {
  return sirketKarnePrefs({ sirket: kod, sekme });
}

export function sirketKarnePanelLinks(
  prefs: TsbDashboardUrlPrefs & { finDonem?: string | null },
  sekme: TsbSirketKarneSekme,
): TsbSirketKarnePanelLink[] {
  const pool: SegmentSkorPool = prefs.segment === "hayat" ? "HAYAT_EMEKLILIK" : "HD";
  const finDonem = prefs.finDonem ?? prefs.donem;
  const base: TsbDashboardUrlPrefs = {
    sirket: prefs.sirket,
    donem: prefs.donem,
    segment: prefs.segment,
    pool,
  };

  switch (sekme) {
    case "finansal":
      return [
        {
          href: buildTsbDashboardHref("/sigorta/finansal-karsilastirma", {
            ...base,
            donem: finDonem ?? undefined,
            pool,
          }),
          title: "Finansal karşılaştırma",
          subtitle: "GT + BL KPI · sektör veya şirket kıyası",
          badge: "Finansal",
        },
        {
          href: buildTsbDashboardHref("/sigorta/olcek-segmentasyon", base),
          title: "Ölçek segmentasyonu",
          subtitle: "A+…D grubu ve segment sırası",
          badge: "Ölçek",
        },
      ];
    case "teknik":
      return [
        {
          href: buildTsbDashboardHref("/sigorta/hasar-prim-orani", {
            ...base,
            donem: finDonem ?? undefined,
            pool,
          }),
          title: "Hasar / Prim oranı",
          subtitle: "Branş bazlı H/P · DERK dahil/hariç",
          badge: "H/P",
        },
        {
          href: buildTsbDashboardHref("/sigorta/finansal-karsilastirma", {
            ...base,
            donem: finDonem ?? undefined,
            pool,
          }),
          title: "Finansal karşılaştırma",
          subtitle: "Safi teknik K/Z ve teknik kar/zarar satırları",
          badge: "GT",
        },
      ];
    case "prim":
      return [
        {
          href: buildTsbDashboardHref("/sigorta/kanal-prim", base),
          title: "Kanal bazlı prim",
          subtitle: "Merkez, acente, banka, broker kırılımı",
          badge: "Kanal",
        },
        {
          href: buildTsbDashboardHref("/sigorta/kanal-dagilim", base),
          title: "Kanal dağılımı",
          subtitle: "Şirket vs sektör kanal payları",
          badge: "Dağılım",
        },
        {
          href: buildTsbDashboardHref("/sigorta/prim-trend-12", base),
          title: "Son 12 ay prim",
          subtitle: "Aylık üretim trendi ve sektör payı",
          badge: "Trend",
        },
      ];
    case "pazar":
      return [
        {
          href: buildTsbDashboardHref("/sigorta/brans-degisim", base),
          title: "Branş değişim tablosu",
          subtitle: "Pazar payı ve yıllık değişim",
          badge: "Branş",
        },
        {
          href: buildTsbDashboardHref("/sigorta/brans-sira", base),
          title: "Branş sıra özeti",
          subtitle: "Sektör içi sıra ve YoY Δ sıra",
          badge: "Sıra",
        },
      ];
    default:
      return [];
  }
}
