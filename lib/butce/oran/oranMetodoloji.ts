/**
 * Bütçe V2 teknik oran metodolojisi — standart yöntemden sapmaların kodları ve açıklamaları.
 * UI ve GT audit çıktısında aynı metinler kullanılır.
 */

export type OranDuzenlemeKodu =
  | "standart"
  | "kural_sabit"
  | "kucuk_baz_grup"
  | "hasar_grup_tutarli"
  | "torpu_yil_dislama"
  | "torpu_sinir"
  | "manuel";

export type OranDuzenleme = {
  kod: OranDuzenlemeKodu;
  /** Kısa etiket (tablo) */
  etiket: string;
  /** Tam açıklama — “neden?” sorusunun cevabı */
  aciklama: string;
  /** İlgili yıl (torpu dışlama) */
  yil?: number;
  /** Tarife grubu adı (grup fallback) */
  grup?: string;
};

export const ORAN_DUZENLEME_ETIKET: Record<OranDuzenlemeKodu, string> = {
  standart:
    "Standart (Excel GT: ağırlıklı yıl birleştirme + torpu)",
  kural_sabit: "Kural / sabit oran (istatistik değil)",
  kucuk_baz_grup: "Küçük baz → tarife grubu oranı",
  hasar_grup_tutarli: "Hasar bloğu → grup oranı (tutarlılık)",
  torpu_yil_dislama: "Uç yıl dışlandı (torpu)",
  torpu_sinir: "Oran sınırlandı (min/max torpu)",
  manuel: "Manuel kayıt (Sisteme dön ile kaldırılır)",
};

export const ORAN_DUZENLEME_ACIKLAMA: Record<OranDuzenlemeKodu, string> = {
  standart:
    "Geçmiş YE mizandan pay÷baz; son 4 yıl Excel GT ağırlıkları (50/25/15/10). Kalem özel ağırlık (ör. 0211 son yıl %80) ve torpu uygulanır.",
  kural_sabit:
    "Mevzuat veya bilinçli model kuralı: mizan ortalaması yerine sabit oran. Örn. F348 dengeleme −%12 yalnızca 613 gideri olan branşlarda.",
  kucuk_baz_grup:
    "Branş paydası eşiğin altında; branş oranı gürültülü olur. Aynı tarife grubundaki 7xx branşların toplam pay÷toplam baz oranı kullanıldı.",
  hasar_grup_tutarli:
    "Hasar/muallak kalemlerinden biri küçük baz nedeniyle gruba kaydı; tutarlılık için aynı gruptaki 0211/0212/muallak kalemleri de grup oranına alındı.",
  torpu_yil_dislama:
    "|oran| eşiği aştığı için o yıl ağırlıklı ortalamaya dahil edilmedi (tek seferlik şok yılı elemek için).",
  torpu_sinir:
    "Ham ağırlıklı ortalama kalem torpu min/max bandına sıkıştırıldı (ör. hasar oranı −100%…+50%).",
  manuel:
    "Teknik oran tablosunda Kaydet ile yazılmış değer; sistem/mizan hesabı ezilir.",
};

/** Son referans yılı payda eşiği (TL, işaretli tutar değil mutlak baz). */
export const V2_KUCUK_BAZ_ESIK_TL = 500_000;

/** Küçük bazda tarife grubu oranına kaydırılacak kalemler. */
export const V2_GRUP_FALLBACK_KALEMLER = new Set([
  "0211",
  "0212",
  "0251",
  "F300",
  "02211",
  "02212",
  "02221",
  "02222",
]);

/** Hasar bloğu — biri gruba kayınca hepsi grup oranı (tutarlılık). */
export const V2_HASAR_BLOK_KALEMLER = new Set([
  "0211",
  "0212",
  "02211",
  "02212",
  "02221",
  "02222",
]);

/** İstatistik yerine kural kullanan kalemler (audit). */
export const V2_KURAL_KALEMLER: Readonly<Record<string, string>> = {
  F348:
    "Dengeleme: mizanda 61301101 gideri olan branşlarda net kazanılmış prim × −%12; diğer branş 0.",
  F349: "DERK: yıl sonu, brüt prim bazlı — ayrı kural (V2 tabloda gösterilir, YE oranı).",
  "014":
    "Teknik olmayan yatırım geliri payı: max(0, net yazılan prim − net ödenen hasar) / Σ pozitif net nakit; negatif net nakitli branş 0. V2 F38 proxy dağılımı ile aynı mantık.",
};

/** Prim mix uyarı eşiği (puan = yüzde puan). */
export const V2_PRIM_MIX_UYARI_ESIK_PP = 8;

/** 0211 / 016 / 022* hasar kalemleri: |yıllık oran| bu eşiği aşarsa o yıl ağırlıktan düşer. */
export const HASAR_YIL_DISI_MAX = 1.1;

/** V2 teknik oran tablosu üst bilgi metni. */
export const V2_ORAN_METODOLOJI_OZET =
  "V2 oranları: (1) Excel GT ağırlıklı yıl birleştirme + torpu, (2) küçük bazda tarife grubu Σpay÷Σbaz, (3) hasar bloğu tutarlılığı, (4) kural kalemleri (F348, 014 net nakit payı). Sapma etiketleri satır altında.";

export function oranDuzenleme(
  kod: OranDuzenlemeKodu,
  extra?: { yil?: number; grup?: string; detay?: string },
): OranDuzenleme {
  let aciklama = ORAN_DUZENLEME_ACIKLAMA[kod];
  if (extra?.yil != null && kod === "torpu_yil_dislama") {
    aciklama = `${extra.yil} yılı: ${aciklama}`;
  }
  if (extra?.grup && (kod === "kucuk_baz_grup" || kod === "hasar_grup_tutarli")) {
    aciklama = `${extra.grup} grubu — ${aciklama}`;
  }
  if (extra?.detay) aciklama = `${aciklama} ${extra.detay}`;
  return {
    kod,
    etiket: ORAN_DUZENLEME_ETIKET[kod],
    aciklama,
    yil: extra?.yil,
    grup: extra?.grup,
  };
}

/** Tekilleştirilmiş düzenleme listesi (kod + grup + yil). */
export function birlestirDuzenlemeler(list: OranDuzenleme[]): OranDuzenleme[] {
  const seen = new Set<string>();
  const out: OranDuzenleme[] = [];
  for (const d of list) {
    const key = `${d.kod}|${d.grup ?? ""}|${d.yil ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(d);
  }
  return out;
}
