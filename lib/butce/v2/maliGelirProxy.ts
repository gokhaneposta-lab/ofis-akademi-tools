import { AYLAR } from "../config/constants";
import type { BilancoAylikRow, MizanRow } from "../types";
import {
  V2_BANKA_STOK_FALLBACK,
  V2_BANKA_STOK_PREFIX,
  V2_PROXY_GT_CIKIS,
  V2_PROXY_GT_GIRIS,
  V2_MALI_GELIR_DISCLAIMER,
  V2_VERGI_DISCLAIMER,
} from "./maliGelirProxyConfig";
import type { V2MaliGelirProxySonuc } from "./types";

function normHesap(hesap: string): string {
  return String(hesap).replace(/\D/g, "");
}

function prefixMatch(hesap: string, prefix: string): boolean {
  const h = normHesap(hesap);
  return h === prefix || h.startsWith(prefix);
}

/** Aynı ay içindeki tutarları hesap koduna göre topla (mutlak). */
function tutarByHesap(
  rows: { hesap: string; tutar: number }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of rows) {
    const h = normHesap(r.hesap);
    if (!h) continue;
    map.set(h, (map.get(h) ?? 0) + Math.abs(Number(r.tutar) || 0));
  }
  return map;
}

/**
 * Bilanço hiyerarşisinde parent+child çift sayımını önler.
 * 1) Tam kod eşleşmesi (102, sonra 100)
 * 2) Yoksa yalnızca en derin yapraklar (üst hesaplarda child varsa üstü atla)
 */
function bankaStokFromMap(byHesap: Map<string, number>): number {
  let exact = 0;
  for (const kod of V2_BANKA_STOK_PREFIX) {
    exact += byHesap.get(kod) ?? 0;
  }
  if (exact > 0) return exact;

  const cands = [...byHesap.entries()].filter(([h]) =>
    V2_BANKA_STOK_PREFIX.some((p) => h === p || h.startsWith(p)),
  );
  const codes = cands.map(([h]) => h);
  return cands
    .filter(([h]) => !codes.some((o) => o !== h && o.startsWith(h)))
    .reduce((a, [, t]) => a + t, 0);
}

/** Agrega 10: yalnız tam kod — prefix 10* 102/106/… çift sayar. */
function agrega10FromMap(byHesap: Map<string, number>): number {
  return byHesap.get(V2_BANKA_STOK_FALLBACK) ?? 0;
}

/**
 * Açılış banka: bilanço aylıkta bütçe yılından önceki son ay 102 (+100);
 * yoksa yılsonu mizan; yoksa agrega 10. Parent/child toplamı yapılmaz.
 */
export function resolveAcilisBanka(opts: {
  butceYili: number;
  bilancoAylik: BilancoAylikRow[];
  mizan: MizanRow[];
}): { tutar: number; kaynak: "102/100" | "10" | "yok" } {
  const oncekiYil = opts.butceYili - 1;

  const bilancoOnceki = opts.bilancoAylik.filter((r) => r.yil === oncekiYil);
  if (bilancoOnceki.length > 0) {
    let maxAy = 0;
    for (const r of bilancoOnceki) if (r.ay > maxAy) maxAy = r.ay;
    const byHesap = tutarByHesap(bilancoOnceki.filter((r) => r.ay === maxAy));
    const leaf = bankaStokFromMap(byHesap);
    if (leaf > 0) return { tutar: leaf, kaynak: "102/100" };

    const agg = agrega10FromMap(byHesap);
    if (agg > 0) return { tutar: agg, kaynak: "10" };
  }

  const mizanYil = opts.mizan.filter((r) => r.yil === oncekiYil);
  const byMizan = tutarByHesap(mizanYil);
  const leafM = bankaStokFromMap(byMizan);
  if (leafM > 0) return { tutar: leafM, kaynak: "102/100" };

  const aggM = agrega10FromMap(byMizan);
  if (aggM > 0) return { tutar: aggM, kaynak: "10" };

  return { tutar: 0, kaynak: "yok" };
}

function ayToplam(aylikToplam: Record<number, number[]>, satir: number, ayIdx: number): number {
  return aylikToplam[satir]?.[ayIdx] ?? 0;
}

/**
 * Bütçe yılı aylık nakit proxy + bileşik mali gelir.
 * Giriş/çıkış: GT projeksiyon aylık satırlarından (mutlak).
 */
export function buildMaliGelirProxy(opts: {
  aylikToplam: Record<number, number[]>;
  aylikGetiriOrani: number[];
  acilisBanka: number;
  acilisKaynak: "102/100" | "10" | "yok";
}): V2MaliGelirProxySonuc {
  const uyarilar: string[] = [V2_MALI_GELIR_DISCLAIMER, V2_VERGI_DISCLAIMER];
  if (opts.acilisKaynak === "yok" || opts.acilisBanka <= 0) {
    uyarilar.push("Açılış banka bakiyesi bulunamadı — mali gelir 0 üretilir (getiri × 0 stok).");
  } else if (opts.acilisKaynak === "10") {
    uyarilar.push("Açılış banka 102/100 yok; agrega hesap 10 kullanıldı.");
  }

  const getiri = Array.from({ length: 12 }, (_, i) => {
    const g = opts.aylikGetiriOrani[i];
    return Number.isFinite(g) ? g : 0;
  });

  // Açılış negatifse olduğu gibi taşınır (clamp yok) — uyarı ile işaretlenir.
  let ayBasi = opts.acilisBanka;
  const aylar = [];
  const maliGelirAylik: number[] = [];
  const negatifBakiyeAylar: number[] = [];

  for (let i = 0; i < 12; i++) {
    let giris = 0;
    for (const g of V2_PROXY_GT_GIRIS) giris += Math.abs(ayToplam(opts.aylikToplam, g.satir, i));
    let cikis = 0;
    for (const c of V2_PROXY_GT_CIKIS) cikis += Math.abs(ayToplam(opts.aylikToplam, c.satir, i));
    const netNakit = giris - cikis;
    // Negatif ay başında mali gelir anlamsızlaşır — getiri yine uygulanır ama flag/uyarı üretilir.
    const maliGelir = ayBasi * getiri[i]!;
    const aySonu = ayBasi + netNakit + maliGelir;
    const negatifBakiye = ayBasi < 0 || aySonu < 0;
    if (negatifBakiye) negatifBakiyeAylar.push(i + 1);
    maliGelirAylik.push(maliGelir);
    aylar.push({
      ay: i + 1,
      ayAd: AYLAR[i]!,
      ayBasiBanka: ayBasi,
      giris,
      cikis,
      netNakit,
      maliGelir,
      aySonuBanka: aySonu,
      getiriOrani: getiri[i]!,
      negatifBakiye,
    });
    ayBasi = aySonu;
  }

  if (negatifBakiyeAylar.length > 0) {
    uyarilar.push(
      `Negatif banka bakiyesi: ${negatifBakiyeAylar.map((a) => AYLAR[a - 1]).join(", ")} — mali gelir formülü bu aylarda anlamsızlaşır (getiri × negatif stok).`,
    );
  }

  return {
    acilisBanka: opts.acilisBanka,
    acilisKaynak: opts.acilisKaynak,
    aylar,
    maliGelirYillik: maliGelirAylik.reduce((a, b) => a + b, 0),
    maliGelirAylik,
    uyarilar,
    negatifBakiyeAylar,
  };
}
