import { V2_FAALIYET_ARTIS_HESAPLARI } from "./maliGelirProxyConfig";
import { FAALIYET_IMPORT_HESAP_GT } from "../config/faaliyetGiderMap";
import type { FaaliyetGiderRow, MizanAylikRow, MizanRow } from "../types";

export type V2FaaliyetGiderBazSatir = {
  hesap: string;
  ad: string;
  oncekiYilTutari: number;
  kaynakAy: number | null;
};

function normHesap(hesap: string): string {
  return String(hesap).replace(/\D/g, "");
}

/** Tam üst hesap varsa onu, yoksa en derin alt hesapları toplar; parent/child çift sayılmaz. */
function hesapToplami(rows: MizanRow[], hedef: string): number {
  const byKod = new Map<string, number>();
  for (const r of rows) {
    const kod = normHesap(r.hesap);
    if (kod !== hedef && !kod.startsWith(hedef)) continue;
    byKod.set(kod, (byKod.get(kod) ?? 0) + Math.abs(Number(r.tutar) || 0));
  }
  const exact = byKod.get(hedef) ?? 0;
  if (exact > 0) return exact;
  const kodlar = [...byKod.keys()];
  return [...byKod.entries()]
    .filter(([kod]) => !kodlar.some((diger) => diger !== kod && diger.startsWith(kod)))
    .reduce((toplam, [, tutar]) => toplam + tutar, 0);
}

export function faaliyetGiderBazSatirlari(
  mizan: MizanRow[],
  butceYili: number,
  mizanAylikFull: MizanAylikRow[] = [],
): V2FaaliyetGiderBazSatir[] {
  const oncekiYilRows = mizan.filter((r) => r.yil === butceYili - 1);
  return V2_FAALIYET_ARTIS_HESAPLARI.map((hesap) => {
    const mizanTutari = hesapToplami(oncekiYilRows, hesap);
    if (mizanTutari > 0) {
      return {
        hesap,
        ad: FAALIYET_IMPORT_HESAP_GT[hesap]?.ad ?? hesap,
        oncekiYilTutari: mizanTutari,
        kaynakAy: null,
      };
    }
    const gtKod = FAALIYET_IMPORT_HESAP_GT[hesap]?.gtKod;
    const adaylar = mizanAylikFull.filter(
      (r) => r.yil === butceYili - 1 && normHesap(r.hesap) === gtKod,
    );
    const kaynakAy = adaylar.reduce((max, r) => Math.max(max, r.ay), 0);
    const aylikTutar =
      kaynakAy > 0
        ? adaylar
            .filter((r) => r.ay === kaynakAy)
            .reduce((toplam, r) => toplam + Math.abs(Number(r.tutar) || 0), 0)
        : 0;
    return {
      hesap,
      ad: FAALIYET_IMPORT_HESAP_GT[hesap]?.ad ?? hesap,
      oncekiYilTutari: aylikTutar,
      kaynakAy: kaynakAy || null,
    };
  });
}

/**
 * Önceki yıl mizan 61402–06 veya hesap bazlı manuel yıllık bütçe → aylık FaaliyetGiderRow.
 * Aylık profil eşit dağılım (1/12); branş dağıtımı buildFaaliyetGiderSonuc (F368) yapar.
 */
export function buildFaaliyetGiderFromMizanArtis(opts: {
  mizan: MizanRow[];
  mizanAylikFull?: MizanAylikRow[];
  butceYili: number;
  giderArtisOrani: number;
  faaliyetGiderButce?: Record<string, number>;
}): {
  rows: FaaliyetGiderRow[];
  oncekiYil: number;
  bazSatirlar: V2FaaliyetGiderBazSatir[];
  uygulananButce: Record<string, number>;
  uyarilar: string[];
} {
  const oncekiYil = opts.butceYili - 1;
  const uyarilar: string[] = [];
  const bazSatirlar = faaliyetGiderBazSatirlari(
    opts.mizan,
    opts.butceYili,
    opts.mizanAylikFull,
  );
  for (const baz of bazSatirlar) {
    if (baz.kaynakAy != null && baz.kaynakAy !== 12) {
      uyarilar.push(
        `${oncekiYil} ${baz.hesap} Aralık kapanışı yok — ${baz.kaynakAy}. ay kümülatifi baz alındı.`,
      );
    }
  }

  const carpan = 1 + (Number.isFinite(opts.giderArtisOrani) ? opts.giderArtisOrani : 0);
  const rows: FaaliyetGiderRow[] = [];
  const uygulananButce: Record<string, number> = {};
  const totalOnceki = bazSatirlar.reduce((toplam, r) => toplam + r.oncekiYilTutari, 0);

  for (const baz of bazSatirlar) {
    const manuel = opts.faaliyetGiderButce?.[baz.hesap];
    const yillik =
      Number.isFinite(manuel) && Number(manuel) >= 0
        ? Number(manuel)
        : baz.oncekiYilTutari * carpan;
    uygulananButce[baz.hesap] = yillik;
    if (yillik <= 0) continue;
    const aylik = yillik / 12;
    for (let ay = 1; ay <= 12; ay++) {
      rows.push({
        butceYili: opts.butceYili,
        hesap: baz.hesap,
        ay,
        tutar: aylik,
      });
    }
  }

  if (totalOnceki <= 0) {
    uyarilar.push(
      `${oncekiYil} kapanışında 61402–06 baz tutarı bulunamadı — artış yüzdesi hesaplanamaz; manuel bütçe tutarları kullanılır.`,
    );
  }

  return { rows, oncekiYil, bazSatirlar, uygulananButce, uyarilar };
}
