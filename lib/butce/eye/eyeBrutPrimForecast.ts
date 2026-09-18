import { normalizeBransKodu, normalizeText } from "../textUtils";
import type { TarifeMapRow } from "../types";
import { bransAylikPrimMizan0111, sumIncrementalYtd } from "./mizan0111Incremental";
import type {
  EyeBrutPrimForecastOpts,
  EyeBrutPrimForecastSonuc,
  EyePrimTarifeSatir,
  EyePrimUyari,
} from "./eyeBrutPrimForecast.types";

function tarifeBransSets(tarifeMap: TarifeMapRow[]): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const row of tarifeMap) {
    const tg = normalizeText(row.tarifeGrubu);
    const b = normalizeBransKodu(row.bransKodu);
    if (!tg || !/^7\d{2}$/.test(b)) continue;
    if (!out.has(tg)) out.set(tg, new Set());
    out.get(tg)!.add(b);
  }
  return out;
}

function bransToTarife(tarifeMap: TarifeMapRow[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const row of tarifeMap) {
    const b = normalizeBransKodu(row.bransKodu);
    out.set(b, normalizeText(row.tarifeGrubu));
  }
  return out;
}

function tarifeAyToplam(
  incByBrans: Record<string, number[]>,
  bransSet: Set<string>,
  ayIndex: number,
): number {
  let s = 0;
  for (const b of bransSet) {
    s += incByBrans[b]?.[ayIndex] ?? 0;
  }
  return s;
}

function tarifeYtd(
  incByBrans: Record<string, number[]>,
  bransSet: Set<string>,
  anchorAy: number,
): number {
  let s = 0;
  for (const b of bransSet) {
    s += sumIncrementalYtd(incByBrans[b], anchorAy);
  }
  return s;
}

function tarifeH2Toplam(
  incByBrans: Record<string, number[]>,
  bransSet: Set<string>,
  anchorAy: number,
  yilInc: Record<string, number[]>,
): number {
  let s = 0;
  for (let m = anchorAy; m < 12; m++) {
    s += tarifeAyToplam(yilInc, bransSet, m);
  }
  return s;
}

export function buildEyeBrutPrimForecast(opts: EyeBrutPrimForecastOpts): EyeBrutPrimForecastSonuc {
  const anchor = Math.min(Math.max(Math.floor(opts.anchorAy), 1), 12);
  const cariYil = opts.butceYili;
  const yPrev = cariYil - 1;
  const yPrev2 = cariYil - 2;

  const uyarilar: EyePrimUyari[] = [];
  const h2ForecastPrimByBrans: Record<string, number[]> = {};
  const tarifeSatirlari: EyePrimTarifeSatir[] = [];

  const incCari = bransAylikPrimMizan0111(opts.mizanAylikFull, cariYil);
  const incPrev = bransAylikPrimMizan0111(opts.mizanAylikFull, yPrev);
  const incPrev2 = bransAylikPrimMizan0111(opts.mizanAylikFull, yPrev2);

  const tarifeSets = tarifeBransSets(opts.tarifeMap ?? []);
  const b2t = bransToTarife(opts.tarifeMap);

  const scopeBrans = new Set<string>();
  if (opts.bransKodlari?.length) {
    for (const b of opts.bransKodlari) scopeBrans.add(normalizeBransKodu(b));
  } else {
    for (const b of Object.keys(incCari)) scopeBrans.add(b);
    for (const b of Object.keys(incPrev)) scopeBrans.add(b);
  }

  for (const b of scopeBrans) {
    h2ForecastPrimByBrans[b] = Array(12).fill(0);
  }

  if (anchor >= 12) {
    return {
      durum: "ok",
      anchorAy: anchor,
      butceYili: cariYil,
      tarifeSatirlari: [],
      h2ForecastPrimByBrans,
      uyarilar,
      forecastMethodVersion: "eye-prim-v1-growth-h2",
    };
  }

  let tarifeOk = 0;
  let tarifeNeedsOverride = 0;

  for (const [tarifeNorm, bransSet] of tarifeSets) {
    const relevant = [...bransSet].filter((b) => scopeBrans.has(b));
    if (relevant.length === 0) continue;

    const subSet = new Set(relevant);
    const actualYtd = tarifeYtd(incCari, subSet, anchor);
    const ytdPrev = tarifeYtd(incPrev, subSet, anchor);

    if (actualYtd <= 0) {
      uyarilar.push({
        kod: "ytd_cari_anormal",
        mesaj: `${tarifeNorm}: cari YTD ≤ 0 (${actualYtd})`,
        tarifeGrubu: tarifeNorm,
      });
    }

    let buyumeOtomatik: number | null = null;
    if (ytdPrev > 0) {
      buyumeOtomatik = actualYtd / ytdPrev - 1;
    } else {
      tarifeNeedsOverride += 1;
      uyarilar.push({
        kod: "buyume_otomatik_yok",
        mesaj: `${tarifeNorm}: 2025 YTD=0 — otomatik growth hesaplanamaz, override gerekir`,
        tarifeGrubu: tarifeNorm,
      });
    }

    const h2Prev = tarifeH2Toplam(incPrev, subSet, anchor, incPrev);
    const h2Prev2 = tarifeH2Toplam(incPrev2, subSet, anchor, incPrev2);
    let buyumeH2Tarihsel: number | null = null;
    if (h2Prev2 !== 0) {
      buyumeH2Tarihsel = h2Prev / h2Prev2 - 1;
    } else {
      uyarilar.push({
        kod: "hist_h2_payda_sifir",
        mesaj: `${tarifeNorm}: ${yPrev2} H2 toplam=0 — tarihsel H2 growth yok`,
        tarifeGrubu: tarifeNorm,
      });
    }

    const overrideKey = Object.keys(opts.buyumeOverrideByTarife ?? {}).find(
      (k) => normalizeText(k) === tarifeNorm,
    );
    const overrideRaw = overrideKey != null ? opts.buyumeOverrideByTarife![overrideKey] : undefined;
    let buyumeUygulanan: number | null =
      overrideRaw !== undefined && overrideRaw !== null ? overrideRaw : buyumeOtomatik;

    if (buyumeUygulanan == null) {
      continue;
    }

    tarifeOk += 1;
    const mult = 1 + buyumeUygulanan;
    const aylikForecast = Array(12).fill(0);
    const aylik2025Baz = Array(12).fill(0);
    let h2ForecastToplam = 0;

    for (let m = anchor; m < 12; m++) {
      const baz = tarifeAyToplam(incPrev, subSet, m);
      aylik2025Baz[m] = baz;
      if (baz === 0) {
        uyarilar.push({
          kod: "h2_baz_sifir",
          mesaj: `${tarifeNorm}: ${yPrev} ay ${m + 1} baz=0`,
          tarifeGrubu: tarifeNorm,
          ay: m + 1,
        });
      }
      const fc = baz * mult;
      aylikForecast[m] = fc;
      h2ForecastToplam += fc;

      const payda = baz;
      for (const b of relevant) {
        const brInc = incPrev[b]?.[m] ?? 0;
        if (payda === 0) {
          if (brInc !== 0) {
            uyarilar.push({
              kod: "brans_dagilim_payda_sifir",
              mesaj: `${tarifeNorm} ay ${m + 1}: tarife baz=0, branş ${b} baz≠0`,
              tarifeGrubu: tarifeNorm,
              ay: m + 1,
              bransKodu: b,
            });
          }
          continue;
        }
        const share = brInc / payda;
        h2ForecastPrimByBrans[b]![m] = fc * share;
      }
    }

    const butceKey = Object.keys(opts.butceYillikByTarife ?? {}).find(
      (k) => normalizeText(k) === tarifeNorm,
    );
    const butceYillik =
      butceKey != null ? (opts.butceYillikByTarife![butceKey] ?? null) : null;
    const eyeYillik = actualYtd + h2ForecastToplam;

    tarifeSatirlari.push({
      tarifeGrubu: tarifeNorm,
      butceYillik,
      actualYtd,
      buyumeOtomatik,
      buyumeH2Tarihsel,
      buyumeUygulanan,
      h2ForecastToplam,
      eyeYillik,
      butceSapma: butceYillik != null ? eyeYillik - butceYillik : null,
      aylikForecast,
      aylik2025Baz,
    });
  }

  for (const b of scopeBrans) {
    const tg = b2t.get(b);
    if (!tg) {
      uyarilar.push({
        kod: "tarife_eslesme_yok",
        mesaj: `Branş ${b} tarife map'te yok — H2 forecast üretilmedi`,
        bransKodu: b,
      });
    }
  }

  let durum: EyeBrutPrimForecastSonuc["durum"] = "ok";
  if (anchor < 12 && tarifeOk === 0) durum = "blocked";
  else if (tarifeNeedsOverride > 0 && tarifeOk < tarifeSets.size) durum = "partial";

  return {
    durum,
    anchorAy: anchor,
    butceYili: cariYil,
    tarifeSatirlari,
    h2ForecastPrimByBrans,
    uyarilar,
    forecastMethodVersion: "eye-prim-v1-growth-h2",
  };
}
