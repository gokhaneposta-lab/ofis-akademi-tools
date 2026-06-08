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
};
