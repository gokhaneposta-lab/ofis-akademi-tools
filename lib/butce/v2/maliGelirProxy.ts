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
}): {
  tutar: number;
  kaynak: "102/100" | "10" | "yok";
  kaynakYil: number;
  kaynakAy: number | null;
  kaynakEtiket: string;
  uyari?: string;
} {
  const oncekiYil = opts.butceYili - 1;

  const bilancoOnceki = opts.bilancoAylik.filter((r) => r.yil === oncekiYil);
  if (bilancoOnceki.length > 0) {
    const aylar = [...new Set(bilancoOnceki.map((r) => r.ay))].filter((ay) => ay >= 1 && ay <= 12);
    const kaynakAy = aylar.includes(12) ? 12 : Math.max(0, ...aylar);
    const byHesap = tutarByHesap(bilancoOnceki.filter((r) => r.ay === kaynakAy));
    const ayEtiket = AYLAR[kaynakAy - 1] ?? `${kaynakAy}. ay`;
    const uyari =
      kaynakAy !== 12
        ? `${oncekiYil} Aralık bilançosu yok — açılış banka için son mevcut ay (${ayEtiket}) kullanıldı.`
        : undefined;
    const leaf = bankaStokFromMap(byHesap);
    if (leaf > 0) {
      return {
        tutar: leaf,
        kaynak: "102/100",
        kaynakYil: oncekiYil,
        kaynakAy,
        kaynakEtiket: `${oncekiYil} ${ayEtiket} bilançosu — 102/100`,
        uyari,
      };
    }

    const agg = agrega10FromMap(byHesap);
    if (agg > 0) {
      return {
        tutar: agg,
        kaynak: "10",
        kaynakYil: oncekiYil,
        kaynakAy,
        kaynakEtiket: `${oncekiYil} ${ayEtiket} bilançosu — 10`,
        uyari,
      };
    }
  }

  const mizanYil = opts.mizan.filter((r) => r.yil === oncekiYil);
  const byMizan = tutarByHesap(mizanYil);
  const leafM = bankaStokFromMap(byMizan);
  if (leafM > 0) {
    return {
      tutar: leafM,
      kaynak: "102/100",
      kaynakYil: oncekiYil,
      kaynakAy: null,
      kaynakEtiket: `${oncekiYil} yılsonu mizanı — 102/100`,
      uyari: `${oncekiYil} bilanço kapanışı bulunamadı — yıllık mizan kullanıldı.`,
    };
  }

  const aggM = agrega10FromMap(byMizan);
  if (aggM > 0) {
    return {
      tutar: aggM,
      kaynak: "10",
      kaynakYil: oncekiYil,
      kaynakAy: null,
      kaynakEtiket: `${oncekiYil} yılsonu mizanı — 10`,
      uyari: `${oncekiYil} bilanço kapanışı bulunamadı — yıllık mizan agrega 10 kullanıldı.`,
    };
  }

  return {
    tutar: 0,
    kaynak: "yok",
    kaynakYil: oncekiYil,
    kaynakAy: null,
    kaynakEtiket: `${oncekiYil} kapanışı bulunamadı`,
  };
}

/**
 * Bütçe yılı anchor ayı sonu banka stoku (102/100, yoksa 10).
 * V3 rolling mali gelir: kalan aylar bu bakiyeden proxy ile tahmin edilir.
 */
export function resolveAnchorBanka(opts: {
  butceYili: number;
  anchorAy: number;
  bilancoAylik: BilancoAylikRow[];
}): {
  tutar: number;
  kaynak: "102/100" | "10" | "yok";
  kaynakAy: number | null;
  kaynakEtiket: string;
  uyari?: string;
} {
  const anchor = Math.min(Math.max(opts.anchorAy, 1), 12);
  const rows = opts.bilancoAylik.filter(
    (r) => r.yil === opts.butceYili && r.ay === anchor,
  );
  if (rows.length === 0) {
    const mevcut = opts.bilancoAylik
      .filter((r) => r.yil === opts.butceYili && r.ay >= 1 && r.ay <= 12)
      .map((r) => r.ay);
    const maxAy = mevcut.length ? Math.max(...mevcut) : null;
    return {
      tutar: 0,
      kaynak: "yok",
      kaynakAy: null,
      kaynakEtiket: `${opts.butceYili} ay ${anchor} bilançosu yok`,
      uyari:
        maxAy != null
          ? `${opts.butceYili}-${String(anchor).padStart(2, "0")} bilanço satırı yok (mizan yüklemesinde ${maxAy}. ay mevcut).`
          : `${opts.butceYili} bilanço satırı bulunamadı — GT/Bilanço mizan dosyasını kontrol edin.`,
    };
  }

  const byHesap = tutarByHesap(rows);
  const leaf = bankaStokFromMap(byHesap);
  const ayEtiket = AYLAR[anchor - 1] ?? `${anchor}. ay`;
  if (leaf > 0) {
    return {
      tutar: leaf,
      kaynak: "102/100",
      kaynakAy: anchor,
      kaynakEtiket: `${opts.butceYili} ${ayEtiket} bilançosu — 102/100`,
    };
  }
  const agg = agrega10FromMap(byHesap);
  if (agg > 0) {
    return {
      tutar: agg,
      kaynak: "10",
      kaynakAy: anchor,
      kaynakEtiket: `${opts.butceYili} ${ayEtiket} bilançosu — 10`,
      uyari: "102/100 yok; agrega 10 kullanıldı.",
    };
  }
  return {
    tutar: 0,
    kaynak: "yok",
    kaynakAy: anchor,
    kaynakEtiket: `${opts.butceYili} ${ayEtiket} bilançosu — banka stoku 0`,
    uyari: `${opts.butceYili} ${ayEtiket} bilançosunda 102/100/10 bulunamadı.`,
  };
}

/** Anchor sonrası aylık mali gelir tahmini (bileşik banka stoku). */
export function buildMaliGelirForecastFromBank(opts: {
  aylikToplam: Record<number, number[]>;
  aylikGetiriOrani: number[];
  acilisBanka: number;
  /** 0-indexed; bu aydan itibaren tahmin (anchor ay = ilk tahmin ayı değil, anchor SONRASI). */
  tahminBaslangicIdx: number;
}): { maliGelirAylik: number[]; uyarilar: string[] } {
  const uyarilar: string[] = [];
  const start = Math.min(Math.max(opts.tahminBaslangicIdx, 0), 11);
  const getiri = Array.from({ length: 12 }, (_, i) => {
    const g = opts.aylikGetiriOrani[i];
    return Number.isFinite(g) ? g : 0;
  });

  const maliGelirAylik = Array(12).fill(0);
  if (opts.acilisBanka <= 0) {
    uyarilar.push("Anchor banka bakiyesi 0 — kalan aylar mali gelir tahmini 0.");
    return { maliGelirAylik, uyarilar };
  }

  let ayBasi = opts.acilisBanka;
  for (let i = start; i < 12; i++) {
    let giris = 0;
    for (const g of V2_PROXY_GT_GIRIS) giris += Math.abs(ayToplam(opts.aylikToplam, g.satir, i));
    let cikis = 0;
    for (const c of V2_PROXY_GT_CIKIS) cikis += Math.abs(ayToplam(opts.aylikToplam, c.satir, i));
    const netNakit = giris - cikis;
    const maliGelir = ayBasi * getiri[i]!;
    maliGelirAylik[i] = maliGelir;
    ayBasi = ayBasi + netNakit + maliGelir;
  }

  return { maliGelirAylik, uyarilar };
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
  acilisKaynakYil?: number;
  acilisKaynakAy?: number | null;
  acilisKaynakEtiket?: string;
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
    acilisKaynakYil: opts.acilisKaynakYil ?? 0,
    acilisKaynakAy: opts.acilisKaynakAy ?? null,
    acilisKaynakEtiket: opts.acilisKaynakEtiket ?? opts.acilisKaynak,
    aylar,
    maliGelirYillik: maliGelirAylik.reduce((a, b) => a + b, 0),
    maliGelirAylik,
    uyarilar,
    negatifBakiyeAylar,
  };
}
