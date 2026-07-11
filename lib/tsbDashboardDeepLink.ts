import type { TsbSektorSegment } from "./tsbPrimDashboard";
import type { TsbSirketMerkeziSekme } from "./tsbSirketMerkezi";
import type { SegmentSkorPool } from "./tsbSirketSegmentSkor";

export type TsbDashboardUrlPrefs = {
  sirket?: number;
  donem?: string;
  pool?: SegmentSkorPool;
  segment?: TsbSektorSegment;
  sekme?: TsbSirketMerkeziSekme;
};

export function buildTsbDashboardHref(path: string, prefs: TsbDashboardUrlPrefs): string {
  const q = new URLSearchParams();
  if (prefs.sirket != null) q.set("sirket", String(prefs.sirket));
  if (prefs.donem) q.set("donem", prefs.donem);
  if (prefs.pool) q.set("pool", prefs.pool);
  if (prefs.segment) q.set("segment", prefs.segment);
  if (prefs.sekme && prefs.sekme !== "ozet") q.set("sekme", prefs.sekme);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

export function parseTsbDashboardUrl(search: string): TsbDashboardUrlPrefs {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const sp = new URLSearchParams(raw);
  const out: TsbDashboardUrlPrefs = {};

  const sirket = sp.get("sirket");
  if (sirket) {
    const n = Number(sirket);
    if (Number.isFinite(n)) out.sirket = n;
  }

  const donem = sp.get("donem");
  if (donem) out.donem = donem;

  const pool = sp.get("pool");
  if (pool === "HD" || pool === "HAYAT_EMEKLILIK") out.pool = pool;

  const segment = sp.get("segment");
  if (segment === "hayatdisi" || segment === "hayat") out.segment = segment;

  const sekme = sp.get("sekme");
  if (sekme === "finansal" || sekme === "teknik" || sekme === "prim" || sekme === "pazar") {
    out.sekme = sekme;
  }

  return out;
}
