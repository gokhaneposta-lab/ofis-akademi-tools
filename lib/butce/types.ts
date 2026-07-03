/** MIZAN satırı — yıl sonu branş × hesap tutarı. */
export type MizanRow = {
  yil: number;
  hesap: string;
  bransKodu: string;
  tutar: number;
};

/** MIZAN aylık kümülatif — branş × hesap × ay. */
export type MizanAylikRow = {
  yil: number;
  ay: number;
  hesap: string;
  bransKodu: string;
  tutar: number;
};

export type PrimBransHedefStore = Record<string, number>;

export type AylikPrimStore = {
  butceYili: number;
  referansYil: number;
  kaynak: "mizan_aylik" | "manuel" | "varsayilan";
  genelOranlar: number[];
  satirlar: Array<{
    bransKodu: string;
    aylar: number[];
    toplam: number;
  }>;
  guncellemeIso: string;
};

export type BransOranAyar = {
  referans: string;
  oran: number;
  manuel: boolean;
};

/** kalem_kodu → brans_kodu → ayar */
export type OranAyarStore = Record<string, Record<string, BransOranAyar>>;

export type BransOranSatir = {
  bransKodu: string;
  bransAdi: string;
  anaBrans: string;
  referans: string;
  oran: number;
  manuel: boolean;
};

export type ButceMeta = {
  schemaVersion: 2;
  butceYili: number;
  mizanGuncellemeIso?: string;
  mizanKaynak?: "aylik-gt-koprusu" | "butce-map";
  mizanYilMin?: number;
  mizanYilMax?: number;
  mizanSatirSayisi?: number;
  mizanAylikGuncellemeIso?: string;
  mizanAylikSatirSayisi?: number;
  mizanAylikFullSatirSayisi?: number;
  mizanAylikYilMin?: number;
  mizanAylikYilMax?: number;
  bilancoAylikSatirSayisi?: number;
  kpkVadeGuncellemeIso?: string;
  kpkVadeSatirSayisi?: number;
  kpkKapanisGuncellemeIso?: string;
  tarifeMapGuncellemeIso?: string;
  tarifeMapSatirSayisi?: number;
  tarifeBransPayGuncellemeIso?: string;
  tarifeBransPaySatirSayisi?: number;
  tarifeBransPayYilMin?: number;
  tarifeBransPayYilMax?: number;
  satisButceGuncellemeIso?: string;
  satisButceSatirSayisi?: number;
  uretimGuncellemeIso?: string;
  uretimSatirSayisi?: number;
};

export type TarifeMapRow = {
  bransKodu: string;
  hazineBransAd: string;
  anaBrans: string;
  sirketBransAd: string;
  tarifeGrubu: string;
};

export type SatisButceRow = {
  sirket: string;
  kanal1: string;
  kanal2: string;
  tarifeGrubu: string;
  oncekiYil1: number;
  oncekiYil2: number;
  tahminYilsonu: number;
  hedefPrim: number;
};

export type UretimRow = {
  yil: number;
  ay: number;
  kanal1: string;
  kanal3: string;
  bolge: string;
  bransKodu: string;
  tarifeGrubu: string;
  netPrim: number;
};

export type TarifeBransPayRow = {
  sirket: string;
  tarifeGrubu: string;
  bransKodu: string;
  hazineBransAd: string;
  yil: number;
  ay: number;
  netPrim: number;
};

export type BilancoAylikRow = {
  yil: number;
  ay: number;
  hesap: string;
  tutar: number;
};

/** Branş × ay ortalama poliçe vadesi (gün) — 3 yıllık üretim ortalaması. */
export type KpkVadeRow = {
  bransKodu: string;
  bransAd: string;
  ay: number;
  vadeGun: number;
};

/** Önceki yıl kapanış prim tahmini — tarife × ay manuel müdahale. */
export type KpkKapanisTahminStore = {
  butceYili: number;
  oncekiYil: number;
  sonGercekAy: number;
  /** tarife → sabit büyüme oranı override (null = otomatik YoY) */
  tarifeBuyumeOran?: Record<string, number>;
  /** tarife → ay → TL override */
  tarifeAylikOverride?: Record<string, Record<number, number>>;
  guncellemeIso: string;
};

export type PrimDagitimDetay = {
  satisSatir: number;
  sirket: string;
  kanal1: string;
  kanal2: string;
  tarifeGrubu: string;
  bransKodu: string;
  hedefPrim: number;
  pay: number;
  primTipi: "direkt" | "endirekt";
  kaynak: "tarife_brans_pay" | "uretim" | "mizan";
  eslesme: string;
};

export type PrimDagitimLog = {
  kanal1: string;
  kanal2: string;
  tarifeGrubu: string;
  hedefPrim: number;
  eslesme: string;
  mesaj: string;
};

export type PrimBransOzet = {
  bransKodu: string;
  bransAdi: string;
  anaBrans: string;
  hedefPrim: number;
};

export type PrimDagitimOzet = {
  referans: string;
  toplamHedef: number;
  dagitilan: number;
  dagitilamayan: number;
  uretimSatir: number;
  mizanSatir: number;
  bransSayisi: number;
  uyariSayisi: number;
};
