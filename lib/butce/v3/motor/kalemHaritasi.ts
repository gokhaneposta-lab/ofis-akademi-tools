/**
 * Bütçe V3 (yeni motor) — F satırı ↔ mizan GT hesap kodu köprüsü.
 *
 * `mizan-aylik-full.json` içindeki `hesap` alanı, Excel'in "7[branş][kod]"
 * hesap kodundan branş üstü kısmı çıkarılmış GT alt kodudur (0111, 0112, 0211 …).
 * Bu köprü, YTD full-lock overlay + oran öğrenicinin pay/baz derlemesi
 * için tek doğruluk kaynağıdır.
 *
 * NOT: Alt toplam satırları (F9, F10, F31, F94, F95, F114, F136, F157, F166,
 * F176, F177, F94) yaprak sayılmaz — GT formül motoru bunları otomatik türetir.
 * Bu haritada yalnızca gerçekten mizandan gelebilen satırları listeleriz.
 */

export type YaprakKaynak =
  | "mizan_gt"           // mizan-aylik-full'daki tek bir GT kodu
  | "prim_kullanici"     // Kullanıcı tarife hedef prim (F11)
  | "gider_kullanici"    // Kullanıcı 61402–06 gider (F190–194)
  | "mali_kullanici"     // Kullanıcı aylık mali gelir (F38)
  | "oran_uretilen"      // Oran motorunun ürettiği (F19 = F11*F295 gibi)
  | "kural_sabit"        // F348, F349 gibi kural bazlı
  | "dis_sayfa";          // Excel dış sayfası, projeksiyonda 0

export type F_KalemMap = {
  /** Excel F satır no */
  satir: number;
  /** GT alt kodu (mizan-aylik-full.hesap alanıyla eşleşen) */
  gtKod: string | null;
  /** İnsan okuyabilir ad */
  ad: string;
  /** Yaprak kaynağı — YTD lock ve projeksiyon karar aracı */
  kaynak: YaprakKaynak;
  /** Oran motorunun ürettiği kalem için oran kodu (F295, F320 vs.) */
  oranKodu?: string;
};

/**
 * Ana F yaprak envanteri.
 *
 * Kural: Yalnızca projeksiyonda değeri olan / mizan overlay'e girecek yapraklar.
 * Alt toplamlar (F10, F31, F94, F95, F114, F136, F177 …) burada YOK — GT motoru üretir.
 */
export const F_YAPRAK_KALEMLER: readonly F_KalemMap[] = [
  // ---- Prim tarafı ----
  { satir: 11, gtKod: "0111", ad: "Brüt yazılan prim", kaynak: "prim_kullanici" },
  { satir: 15, gtKod: "1112", ad: "Endirekt prim", kaynak: "oran_uretilen", oranKodu: "F441" },
  { satir: 19, gtKod: "0112", ad: "Reasüransa devredilen prim (-)", kaynak: "oran_uretilen", oranKodu: "F295" },
  { satir: 20, gtKod: "0113", ad: "SGK'ya aktarılan primler", kaynak: "oran_uretilen", oranKodu: "F290" },

  // ---- KPK / DERK ----
  { satir: 33, gtKod: "01311", ad: "DERK cari (F11*F349)", kaynak: "kural_sabit", oranKodu: "F349" },
  { satir: 34, gtKod: "01312", ad: "DERK devreden", kaynak: "dis_sayfa" },
  { satir: 36, gtKod: "01321", ad: "DERK RE payı", kaynak: "dis_sayfa" },
  { satir: 37, gtKod: "01322", ad: "DERK RE devreden", kaynak: "dis_sayfa" },

  // ---- Rücu ----
  { satir: 86, gtKod: "016", ad: "Rücu ve sovtaj gelirleri (+)", kaynak: "oran_uretilen", oranKodu: "F315" },

  // ---- Hasar (ödenen) ----
  { satir: 96, gtKod: "0211", ad: "Brüt ödenen hasar (-)", kaynak: "oran_uretilen", oranKodu: "F320" },
  { satir: 105, gtKod: "0212", ad: "Ödenen hasarda reasürör payı (+)", kaynak: "oran_uretilen", oranKodu: "F436" },

  // ---- Muallak (brüt / devreden / RE) ----
  { satir: 116, gtKod: "02211", ad: "Brüt muallak (cari)", kaynak: "oran_uretilen", oranKodu: "F451" },
  { satir: 117, gtKod: "0221101", ad: "Tahakkuk eden brüt muallak", kaynak: "mizan_gt" },
  { satir: 126, gtKod: "02212", ad: "Devreden brüt muallak", kaynak: "oran_uretilen", oranKodu: "F456" },
  { satir: 127, gtKod: "0221201", ad: "Devreden MHK tahakkuk", kaynak: "mizan_gt" },
  { satir: 137, gtKod: "02221", ad: "Muallak RE payı (cari)", kaynak: "oran_uretilen", oranKodu: "F466" },
  { satir: 147, gtKod: "02222", ad: "Devreden muallak RE payı", kaynak: "oran_uretilen", oranKodu: "F471" },

  // ---- Dengeleme ----
  { satir: 167, gtKod: "0241101", ad: "Dengeleme karşılığı (-)", kaynak: "kural_sabit", oranKodu: "F348" },

  // ---- Komisyon / faaliyet ----
  { satir: 180, gtKod: "0251101", ad: "Üretim komisyon gideri", kaynak: "oran_uretilen", oranKodu: "F275" },
  { satir: 197, gtKod: "0257101", ad: "Alınan reasürans komisyonu (+)", kaynak: "oran_uretilen", oranKodu: "F300" },
  { satir: 200, gtKod: "0258", ad: "Diğer faaliyet giderleri (-)", kaynak: "oran_uretilen", oranKodu: "F383" },
  { satir: 201, gtKod: "0259", ad: "Diğer faaliyet giderleri 2 (-)", kaynak: "oran_uretilen", oranKodu: "F388" },

  // ---- Matematik / dış ----
  { satir: 202, gtKod: "026", ad: "Matematik karşılığında değişim", kaynak: "dis_sayfa" },

  // ---- Mali gelir (kullanıcı proxy) ----
  { satir: 38, gtKod: "014", ad: "Teknik olmayan yatırım gelirleri (F38)", kaynak: "mali_kullanici" },

  // ---- Genel giderler (kullanıcı) ----
  { satir: 190, gtKod: "61402", ad: "Personel giderleri (-)", kaynak: "gider_kullanici" },
  { satir: 191, gtKod: "61403", ad: "Yönetim giderleri (-)", kaynak: "gider_kullanici" },
  { satir: 192, gtKod: "61404", ad: "AR-GE giderleri (-)", kaynak: "gider_kullanici" },
  { satir: 193, gtKod: "61405", ad: "Pazarlama giderleri (-)", kaynak: "gider_kullanici" },
  { satir: 194, gtKod: "61406", ad: "Dış hizmet giderleri (-)", kaynak: "gider_kullanici" },
];

/** GT alt kodundan F satır no bulur. */
export const GT_KOD_TO_F_SATIR: Readonly<Record<string, number>> = (() => {
  const map: Record<string, number> = {};
  for (const k of F_YAPRAK_KALEMLER) {
    if (k.gtKod) map[k.gtKod] = k.satir;
  }
  return map;
})();

/** F satır no'sundan kalem tanımı. */
export const F_SATIR_TO_KALEM: ReadonlyMap<number, F_KalemMap> = (() => {
  const map = new Map<number, F_KalemMap>();
  for (const k of F_YAPRAK_KALEMLER) map.set(k.satir, k);
  return map;
})();

/** YTD full-lock overlay'e girecek GT kodları (mizan-aylik-full'dan alınabilecek). */
export const YTD_OVERLAY_GT_KODLARI: readonly string[] = F_YAPRAK_KALEMLER
  .filter((k) => k.gtKod && (k.kaynak === "mizan_gt" || k.kaynak === "oran_uretilen" || k.kaynak === "prim_kullanici" || k.kaynak === "kural_sabit"))
  .map((k) => k.gtKod!)
  .filter((k, i, a) => a.indexOf(k) === i);

/** YTD kilit sonrası tutarlılık için formül motorunun yeniden hesaplaması gereken toplam satırları. */
export const YTD_UST_TOPLAM_SATIRLAR: readonly number[] = [
  10,   // = F11 + F19 + F20 (net yazılan prim)
  21,   // KPK değişimi
  22,   // Brüt KPK değişimi
  25,   // KPK RE payı değişimi
  28,   // KPK SGK payı değişimi
  31,   // DERK toplam = F32 + F35
  32,   // Brüt DERK
  35,   // DERK RE
  95,   // Ödenen hasar (net) = F96 + F105
  114,  // Muallak değişim = F115 + F136
  115,  // Brüt muallak değişim = F116 + F126
  136,  // Muallak RE değişim = F137 + F147
  157,  // İkramiye değişim
  166,  // Dengeleme = F167 + F168
  176,  // Faaliyet giderleri
  177,  // Üretim komisyon = F178 + F189
  178,  // Üretim komisyon alt = F180 + F181
  196,  // Alınan RE komisyon = F197 + F198
  9,    // TEKNİK GELİR (üst toplam)
  94,   // TEKNİK GİDER (üst toplam)
];
