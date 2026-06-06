export type ButceSirket = "sigorta" | "emeklilik";

export type ButceTabloTip = "GT" | "BL";

/** Aylık unpivot satırı (KPI filtresi uygulanmış). */
export type ButceGtBlRow = {
  donem: string;
  sirket: ButceSirket;
  tabloTip: ButceTabloTip;
  hesapKodu: string;
  hesapAdi: string;
  deger: number;
  /** `60001` yıl içi kümülatif brüt prim */
  degerTipi?: "ytd" | "donem";
};

export type ButceHedefPrimRow = {
  sirketKodu: string;
  kanal1: string;
  kanal2: string;
  tarifeGrupAdi: string;
  tarifeGrupNorm: string;
  bransAp: string | null;
  hedefYil: number;
  hedefTutar: number;
};

export type ButceMeta = {
  schemaVersion: 1;
  gtBlGuncellemeIso?: string;
  gtBlDonemMin?: string;
  gtBlDonemMax?: string;
  gtBlSatirSayisi?: number;
  hedefGuncellemeIso?: string;
  hedefYil?: number;
  hedefToplam?: number;
  hedefSatirSayisi?: number;
};
