import { buildTsbDashboardHref } from "./tsbDashboardDeepLink";

type ListeLinkMeta = {
  path: string;
  donemFrom: "fin" | "prim";
  pool?: true;
  segment?: "hayatdisi";
};

/** Sektör özeti listesi → ilgili dashboard paneli */
const LISTE_PANEL: Record<string, ListeLinkMeta> = {
  vok_oz: { path: "/sigorta/finansal-karsilastirma", donemFrom: "fin", pool: true },
  net_kar_yoy: { path: "/sigorta/finansal-karsilastirma", donemFrom: "fin", pool: true },
  teknik_kar_yoy: { path: "/sigorta/finansal-karsilastirma", donemFrom: "fin", pool: true },
  ozsermaye_yoy: { path: "/sigorta/finansal-karsilastirma", donemFrom: "fin", pool: true },
  brut_hp_dusuk: { path: "/sigorta/hasar-prim-orani", donemFrom: "fin", pool: true },
  net_hp_dusuk: { path: "/sigorta/hasar-prim-orani", donemFrom: "fin", pool: true },
  hp_iyilestiren: { path: "/sigorta/hasar-prim-orani", donemFrom: "fin", pool: true },
  hp_kotulesen: { path: "/sigorta/hasar-prim-orani", donemFrom: "fin", pool: true },
  brut_prim_yoy: { path: "/sigorta/kanal-prim", donemFrom: "prim", segment: "hayatdisi" },
  trafik_haric_yoy: { path: "/sigorta/kanal-prim", donemFrom: "prim", segment: "hayatdisi" },
  teknik_karsilik_yoy: { path: "/sigorta/finansal-karsilastirma", donemFrom: "fin", pool: true },
  yatirim_yoy: { path: "/sigorta/finansal-karsilastirma", donemFrom: "fin", pool: true },
  pay_kazanan: { path: "/sigorta/brans-degisim", donemFrom: "prim", segment: "hayatdisi" },
  pay_kaybeden: { path: "/sigorta/brans-degisim", donemFrom: "prim", segment: "hayatdisi" },
  sira_yukselen: { path: "/sigorta/brans-sira", donemFrom: "prim", segment: "hayatdisi" },
  sira_dusen: { path: "/sigorta/brans-sira", donemFrom: "prim", segment: "hayatdisi" },
};

export function sektorOzetiSatirHref(
  listeId: string,
  sirketKodu: number,
  ctx: { finDonem: string; primDonem: string },
): string {
  const meta = LISTE_PANEL[listeId];
  if (!meta) return "/sigorta/tsb";

  const finDonem = ctx.finDonem !== "—" ? ctx.finDonem : undefined;
  const primDonem = ctx.primDonem !== "—" ? ctx.primDonem : undefined;
  const donem = meta.donemFrom === "fin" ? finDonem : primDonem;

  return buildTsbDashboardHref(meta.path, {
    sirket: sirketKodu,
    donem,
    ...(meta.pool ? { pool: "HD" } : {}),
    ...(meta.segment ? { segment: meta.segment } : {}),
  });
}
