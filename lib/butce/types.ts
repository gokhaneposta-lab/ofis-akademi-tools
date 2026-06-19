/** MIZAN satırı — yıl sonu branş × hesap tutarı. */
export type MizanRow = {
  yil: number;
  hesap: string;
  bransKodu: string;
  tutar: number;
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
  mizanYilMin?: number;
  mizanYilMax?: number;
  mizanSatirSayisi?: number;
  tarifeMapGuncellemeIso?: string;
  tarifeMapSatirSayisi?: number;
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
  kaynak: "uretim" | "mizan";
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
