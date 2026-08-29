import type { FinansalKarsilastirmaPool } from "./tsbFinansalKarsilastirmaData";
import {
  parseBransKiyasView,
  parsePrimPanelId,
  primPanelHref,
} from "./tsbDashboardPanels";
import type { TsbSektorSegment } from "./tsbPrimDashboard";
import type { TsbSirketKarneSekme } from "./tsbSirketKarneSekmeler";

export type TsbDashboardUrlPrefs = {
  sirket?: number;
  donem?: string;
  /** Finansal paneller: HD | HAYAT_EMEKLILIK | SEKTOR (toplam). */
  pool?: FinansalKarsilastirmaPool;
  segment?: TsbSektorSegment;
  sekme?: TsbSirketKarneSekme;
};

/** Eski /sigorta/prim?panel=… → standalone panel URL. */
export function normalizeTsbDashboardPath(path: string): string {
  const qIdx = path.indexOf("?");
  const base = qIdx >= 0 ? path.slice(0, qIdx) : path;
  if (base !== "/sigorta/prim") return base;
  if (qIdx < 0) return "/sigorta/kanal-prim";
  const sp = new URLSearchParams(path.slice(qIdx + 1));
  const panelRaw = sp.get("panel");
  if (panelRaw === "brans-sira") return "/sigorta/brans-sira";
  const panel = parsePrimPanelId(panelRaw);
  if (panel === "brans") return primPanelHref("brans", parseBransKiyasView(sp.get("view")));
  return primPanelHref(panel);
}

export function buildTsbDashboardHref(path: string, prefs: TsbDashboardUrlPrefs): string {
  const normalized = normalizeTsbDashboardPath(path);
  const qIdx = normalized.indexOf("?");
  const base = qIdx >= 0 ? normalized.slice(0, qIdx) : normalized;
  const q = new URLSearchParams(qIdx >= 0 ? normalized.slice(qIdx + 1) : "");
  if (prefs.sirket != null) q.set("sirket", String(prefs.sirket));
  if (prefs.donem) q.set("donem", prefs.donem);
  if (prefs.pool) q.set("pool", prefs.pool);
  if (prefs.segment) q.set("segment", prefs.segment);
  if (prefs.sekme && prefs.sekme !== "ozet") q.set("sekme", prefs.sekme);
  const s = q.toString();
  return s ? `${base}?${s}` : base;
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
  if (pool === "HD" || pool === "HAYAT_EMEKLILIK" || pool === "SEKTOR") out.pool = pool;

  const segment = sp.get("segment");
  if (segment === "hayatdisi" || segment === "hayat") out.segment = segment;

  const sekme = sp.get("sekme");
  if (sekme === "finansal" || sekme === "teknik" || sekme === "prim" || sekme === "pazar") {
    out.sekme = sekme;
  }

  return out;
}
