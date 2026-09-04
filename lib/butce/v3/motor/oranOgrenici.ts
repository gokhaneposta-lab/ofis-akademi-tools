/**
 * Bütçe V3 (yeni motor) — Oran öğrenici.
 *
 * V2'nin `MizanOranServisi` sınıfına bağımlı DEĞİLDİR. Kendi ayrıştırma,
 * torpu, ağırlıklandırma ve grup fallback kurallarını uygular.
 *
 * Amaç: 2022–2025 arası yıllık mizandan (isteğe göre aylık kümülatiften de)
 * her (kalem, branş) için tek bir efektif oran çıkarmak. Bu oran, GT
 * projeksiyonunda `F19 = F11 × F295` benzeri çarpımlarda kullanılır.
 *
 * Sabit farklar (V2'den ayrılan noktalar):
 *   1. Ağırlık: klasik `[0.5, 0.25, 0.15, 0.1]` yerine **veri kalitesi bazlı**
 *      → yıl ağırlığı = baz_yıl / Σ baz_kalan_yıllar. Büyük hacimli yıl
 *      daha çok ağırlık taşır, küçük bazlı gürültü boğulur.
 *   2. Torpu: z-score > 2 (mean & std) yılları at + kalem özel min/max bandı.
 *   3. Grup fallback: son yıl baz < 500K TL ise tarife grubu Σpay/Σbaz.
 *   4. Hasar bloğu tutarlılığı: F320/F436/F451/F456 aynı grup fallback.
 *   5. Kural kalemleri (F348, F349, F398) sabit — öğrenilmez.
 */

import type { MizanRow } from "../../types";
import { ANA_BRANS_GRUPLARI, HAZINE_BRANS_KODLARI, HAZINE_BRANS_SIRASI } from "../../config/brans";
import { normalizeBransKodu } from "../../textUtils";
import type { OranGozlem, V3Oran } from "./types";

/** Öğrenme parametreleri — tek yerden ayarlanır. */
export const V3_ORAN_PARAMS = {
  MIN_BAZ_TL: 500_000,
  Z_SCORE_ESIK: 2.0,
  MIN_YIL_ORNEK: 1,           // 1 yıl bile kaldıysa oran kabul (aksi halde grup fallback)
  KURAL_SABITLER: {
    F348: -0.12,               // Dengeleme
  },
  ORAN_MIN_MAX: {
    // hasar bloğu
    F320: { min: 0, max: 1.2 },   // brüt hasar/prim (baz F11+F22+F32)
    F436: { min: 0, max: 0.9 },   // reasürör hasar payı oranı
    F451: { min: 0, max: 1.5 },   // brüt muallak
    F456: { min: -0.5, max: 1.5 },
    F466: { min: 0, max: 1.5 },
    F471: { min: -0.5, max: 1.5 },
    // reasürans
    F295: { min: 0, max: 0.95 },
    F290: { min: 0, max: 0.5 },
    F441: { min: 0, max: 1.0 },
    // komisyon / faaliyet
    F275: { min: 0, max: 0.4 },
    F300: { min: 0, max: 0.5 },
    F315: { min: 0, max: 0.5 },
    F383: { min: 0, max: 0.2 },
    F388: { min: 0, max: 0.2 },
    // DERK (kural)
    F349: { min: 0, max: 0.5 },
  } as Record<string, { min: number; max: number }>,
} as const;

/** Kalem tanımı: pay = Σ pay_hesaplar, baz = Σ baz_hesaplar. */
export type V3KalemSpec = {
  kalemKodu: string;
  ad: string;
  payHesap: readonly string[];
  bazHesap: readonly string[];
  hasarBloku?: boolean;
  kuralSabit?: number;
};

/**
 * V3'ün doğrudan yönettiği oran kalemleri.
 * V2'nin `oran_kalem_excel.json`'a bağımlı değil — kendi tanımımız.
 */
export const V3_ORAN_KALEMLERI: readonly V3KalemSpec[] = [
  { kalemKodu: "F295", ad: "Reasüransa devir (F19/F11)", payHesap: ["60002"], bazHesap: ["60001"] },
  { kalemKodu: "F290", ad: "SGK devir (F20/F11)", payHesap: ["60003"], bazHesap: ["60001"] },
  { kalemKodu: "F441", ad: "Endirekt/brüt (F15/F11)", payHesap: ["611"], bazHesap: ["60001"] },
  { kalemKodu: "F349", ad: "DERK (F33/F11)", payHesap: ["013"], bazHesap: ["0111"], kuralSabit: 0 }, // öğrenmeye çalış, negatif olursa 0
  { kalemKodu: "F320", ad: "Brüt ödenen hasar (F96/F11+F22+F32)", payHesap: ["61001"], bazHesap: ["60001", "60101", "60201"], hasarBloku: true },
  { kalemKodu: "F436", ad: "Ödenen hasar RE payı (F105/F96)", payHesap: ["61002"], bazHesap: ["61001"], hasarBloku: true },
  { kalemKodu: "F451", ad: "Brüt muallak (F116/F11)", payHesap: ["611011"], bazHesap: ["60001"], hasarBloku: true },
  { kalemKodu: "F456", ad: "Devreden brüt muallak (F126/F11)", payHesap: ["611012"], bazHesap: ["60001"], hasarBloku: true },
  { kalemKodu: "F466", ad: "Muallak RE payı (F137/F11)", payHesap: ["611021"], bazHesap: ["60001"], hasarBloku: true },
  { kalemKodu: "F471", ad: "Devreden muallak RE payı (F147/F11)", payHesap: ["611022"], bazHesap: ["60001"], hasarBloku: true },
  { kalemKodu: "F315", ad: "Rücu ve sovtaj (F86/(F96+F116))", payHesap: ["605"], bazHesap: ["61001", "611011"] },
  { kalemKodu: "F275", ad: "Üretim komisyonu (F180/F11)", payHesap: ["614011"], bazHesap: ["60001"] },
  { kalemKodu: "F300", ad: "Alınan RE komisyonu (F197/F11)", payHesap: ["614071"], bazHesap: ["60001"] },
  { kalemKodu: "F383", ad: "Diğer faaliyet gideri (F200/F11)", payHesap: ["61408"], bazHesap: ["60001"] },
  { kalemKodu: "F388", ad: "Diğer faaliyet gideri 2 (F201/F11)", payHesap: ["61409"], bazHesap: ["60001"] },
  { kalemKodu: "F348", ad: "Dengeleme (F167/F10+F21)", payHesap: ["61301101"], bazHesap: ["600", "60101", "60102", "60103"], kuralSabit: -0.12 },
];

/** Branşın ait olduğu ana grup (YANGIN/TRAFİK/TARSİM…) üyeleri. */
function bransGrubu(brans: string): string[] {
  const ana = HAZINE_BRANS_KODLARI[brans]?.[2];
  if (!ana) return [];
  const list = ANA_BRANS_GRUPLARI[ana];
  return list ? [...list] : [];
}

/** Bir yıl için mizan pay/baz toplamı. Prefix eşleşme kullanılmaz (V2 uyumlu). */
function hesapTutar(
  rows: MizanRow[],
  yil: number,
  brans: string | null,      // null = tüm şirket
  hesaplar: readonly string[],
): number {
  let toplam = 0;
  for (const r of rows) {
    if (r.yil !== yil) continue;
    if (brans != null && normalizeBransKodu(r.bransKodu) !== brans) continue;
    if (!hesaplar.includes(String(r.hesap))) continue;
    toplam += Number(r.tutar) || 0;
  }
  return toplam;
}

function hesapTutarGrup(
  rows: MizanRow[],
  yil: number,
  branslar: readonly string[],
  hesaplar: readonly string[],
): number {
  let toplam = 0;
  const set = new Set(branslar);
  for (const r of rows) {
    if (r.yil !== yil) continue;
    if (!set.has(normalizeBransKodu(r.bransKodu))) continue;
    if (!hesaplar.includes(String(r.hesap))) continue;
    toplam += Number(r.tutar) || 0;
  }
  return toplam;
}

function bandSikistir(oran: number, kalem: string): number {
  const band = V3_ORAN_PARAMS.ORAN_MIN_MAX[kalem];
  if (!band) return oran;
  return Math.min(Math.max(oran, band.min), band.max);
}

/** Ana öğrenici — tek (kalem, branş) için. */
function ogrenTekBrans(
  spec: V3KalemSpec,
  brans: string,
  mizan: MizanRow[],
  yillar: readonly number[],
): V3Oran {
  const notlar: string[] = [];

  // 1) Kural kalemleri
  if (spec.kalemKodu === "F348") {
    // Dengeleme: mizanda 613 gideri geçmişi varsa −%12
    let gecmisPay = 0;
    for (const y of yillar) gecmisPay += hesapTutar(mizan, y, brans, spec.payHesap);
    const oran = gecmisPay < -1 ? spec.kuralSabit! : 0;
    return {
      kalemKodu: spec.kalemKodu,
      bransKodu: brans,
      oran,
      gozlemSayisi: yillar.length,
      yontem: "kural_sabit",
      notlar: [`Kural F348: mizan pay geçmişi ${gecmisPay < -1 ? "VAR" : "YOK"} → ${oran}`],
      gozlemler: [],
    };
  }

  // 2) Gözlemleri topla
  const gozlemler: OranGozlem[] = [];
  for (const y of yillar) {
    const pay = hesapTutar(mizan, y, brans, spec.payHesap);
    const baz = hesapTutar(mizan, y, brans, spec.bazHesap);
    if (Math.abs(baz) < 1) {
      gozlemler.push({ yil: y, pay, baz, oran: 0, quality: "sifir_baz" });
      continue;
    }
    const oran = pay / baz;
    const kucuk = Math.abs(baz) < V3_ORAN_PARAMS.MIN_BAZ_TL;
    gozlemler.push({
      yil: y,
      pay,
      baz,
      oran,
      quality: kucuk ? "kucuk_baz" : "ok",
    });
  }

  // 3) Torpu (z-score > 2)
  const okGozlem = gozlemler.filter((g) => g.quality === "ok" || g.quality === "kucuk_baz");
  if (okGozlem.length >= 3) {
    const mean = okGozlem.reduce((a, g) => a + g.oran, 0) / okGozlem.length;
    const std = Math.sqrt(okGozlem.reduce((a, g) => a + (g.oran - mean) ** 2, 0) / okGozlem.length);
    if (std > 1e-6) {
      for (const g of okGozlem) {
        const z = Math.abs(g.oran - mean) / std;
        if (z > V3_ORAN_PARAMS.Z_SCORE_ESIK) {
          g.quality = "torpu_dislandi";
          notlar.push(`${g.yil}: |z|=${z.toFixed(2)} > ${V3_ORAN_PARAMS.Z_SCORE_ESIK} → dışlandı`);
        }
      }
    }
  }

  // 4) Kalan gözlemleri veri-kalite ağırlığıyla birleştir
  const kalan = gozlemler.filter((g) => g.quality === "ok" || g.quality === "kucuk_baz");
  const kucukBazSonYil = gozlemler[gozlemler.length - 1]?.quality === "kucuk_baz";

  // 5) Küçük baz / yetersiz gözlem → grup fallback
  if (kalan.length < V3_ORAN_PARAMS.MIN_YIL_ORNEK || (kucukBazSonYil && spec.hasarBloku)) {
    const grup = bransGrubu(brans);
    if (grup.length > 1) {
      let grupPay = 0;
      let grupBaz = 0;
      for (const y of yillar) {
        grupPay += hesapTutarGrup(mizan, y, grup, spec.payHesap);
        grupBaz += hesapTutarGrup(mizan, y, grup, spec.bazHesap);
      }
      const grupOran = Math.abs(grupBaz) >= 1 ? grupPay / grupBaz : 0;
      return {
        kalemKodu: spec.kalemKodu,
        bransKodu: brans,
        oran: bandSikistir(grupOran, spec.kalemKodu),
        gozlemSayisi: 0,
        yontem: "grup_fallback",
        notlar: [`Küçük baz / hasar bloğu → tarife grubu Σpay/Σbaz = ${grupOran.toFixed(4)}`, ...notlar],
        gozlemler,
      };
    }
  }

  if (kalan.length === 0) {
    return {
      kalemKodu: spec.kalemKodu,
      bransKodu: brans,
      oran: 0,
      gozlemSayisi: 0,
      yontem: "manuel_varsayilan",
      notlar: ["Gözlem yok — 0 varsayılır", ...notlar],
      gozlemler,
    };
  }

  // Veri kalite ağırlığı = |baz| / Σ|baz|
  const bazToplam = kalan.reduce((a, g) => a + Math.abs(g.baz), 0);
  let etkin = 0;
  for (const g of kalan) {
    const w = bazToplam > 0 ? Math.abs(g.baz) / bazToplam : 1 / kalan.length;
    etkin += g.oran * w;
  }
  etkin = bandSikistir(etkin, spec.kalemKodu);

  return {
    kalemKodu: spec.kalemKodu,
    bransKodu: brans,
    oran: etkin,
    gozlemSayisi: kalan.length,
    yontem: "veri_kalite_agirlikli",
    notlar,
    gozlemler,
  };
}

/**
 * Tüm 7XX branş × tüm V3_ORAN_KALEMLERI için öğren.
 * `yillar`: 2022..(butceYili-1) — kullanıcı `yilAgirliklari` verse bile motor bunu bilmez;
 * ağırlığı veri hacminden çıkarır.
 */
export function ogrenTumOranlar(
  mizan: MizanRow[],
  butceYili: number,
): V3Oran[] {
  const yillar = [...new Set(mizan.map((r) => Number(r.yil)))]
    .filter((y) => Number.isFinite(y) && y < butceYili)
    .sort((a, b) => a - b);

  const out: V3Oran[] = [];
  for (const spec of V3_ORAN_KALEMLERI) {
    for (const brans of HAZINE_BRANS_SIRASI) {
      out.push(ogrenTekBrans(spec, brans, mizan, yillar));
    }
  }
  return out;
}

/** Oranları branş bazlı harita halinde döndürür: kalemKodu → bransKodu → oran. */
export function oranlarToMap(oranlar: V3Oran[]): Map<string, Map<string, number>> {
  const m = new Map<string, Map<string, number>>();
  for (const o of oranlar) {
    if (!m.has(o.kalemKodu)) m.set(o.kalemKodu, new Map());
    m.get(o.kalemKodu)!.set(o.bransKodu, o.oran);
  }
  return m;
}
