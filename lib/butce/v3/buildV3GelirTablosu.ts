/**
 * Bütçe V3 gelir tablosu — ince sarmalayıcı: V2 motorunu çağırır, üstüne YTD kilidi ekler.
 *
 * V2 ağrı noktaları (neden V3):
 * - Çok adımlı akış (tarife → ayrı prim dağıtım → KPK → oranlar) tek ekranda yoktu.
 * - Tam yıl teknik oranları YTD gerçekleşmeyi kilitlemiyordu; Temmuz mizanı ↔ yıllık sapma.
 * - 614 giderinde artış oranı + manuel tutar çift kontrolü kafa karıştırıyordu.
 * - Aylık mevsimsellik yalnızca geçmiş tam yıllardan; bütçe yılı YTD kullanılmıyordu.
 * - Tarife mix (TARSİM/TRAFİK) toplam prim + mizan payıyla ezilebiliyordu.
 *
 * V3 yaklaşımı: kullanıcı tarife prim + 61402–06 + aylık getiri verir; DagitimMotoru + V2 GT
 * + YTD overlay (aylık mizan varsa anchor aya kadar gerçekleşme kilidi, uyarılarda not).
 */
import {
  buildV2GelirTablosu,
  hesaplaV2SentetikSatirlar,
  type V2GelirTablosuSonuc,
} from "../v2/buildV2GelirTablosu";
import { referansYilAgirliklari } from "../config/constants";
import { DagitimMotoru, tarifeOzetFromSatis } from "../prim/dagitimMotoru";
import { createAylikDagilimTablosu } from "../prim/primDagilim";
import type {
  AylikPrimStore,
  BilancoAylikRow,
  KpkKapanisTahminStore,
  KpkVadeRow,
  MizanAylikRow,
  MizanRow,
  OranAyarStore,
  SatisButceRow,
  TarifeBransPayRow,
  TarifeMapRow,
  UretimRow,
} from "../types";
import type { V2VarsayimlarStore } from "../v2/types";
import { aylikMevsimOranlari, genelMevsimOranlari } from "./aylikMevsim";
import {
  alignTarifeHedefleri,
  toplamPrimFromTarife,
  v3DefaultsForYear,
} from "./defaults";
import { V3_DEFAULT_YTD_ANCHOR, V3_METODOLOJI_ADIMLARI } from "./metodoloji";
import { primHedefFromTarifeAna, primHedefFromToplam } from "./primFromToplam";
import { syntheticSatisFromTarife } from "./syntheticSatis";
import { detectYtdAnchorAy, uygulaYtdOverlay } from "./ytdOverlay";
import { uygulaMaliGelirRolling } from "./maliGelirRolling";
import { mizanV3Recon, reconTutmayanListe } from "./mizanV3Recon";
import type { V3GelirTablosuSonuc, V3VarsayimlarStore } from "./types";

function olcekTarifeHedefleri(
  satisRows: SatisButceRow[],
  toplamPrimHedef: number,
): Record<string, number> {
  const ozet = tarifeOzetFromSatis(satisRows);
  const mevcutToplam = ozet.reduce((a, r) => a + r.mevcutHedef, 0);
  if (mevcutToplam <= 0 || toplamPrimHedef <= 0) {
    const out: Record<string, number> = {};
    for (const r of ozet) out[r.tarifeGrubu] = 0;
    return out;
  }
  const carpan = toplamPrimHedef / mevcutToplam;
  const out: Record<string, number> = {};
  for (const r of ozet) out[r.tarifeGrubu] = r.mevcutHedef * carpan;
  return out;
}

function resolveTarifeHedefleri(
  varsayimlar: V3VarsayimlarStore,
  satisRows: SatisButceRow[],
): Record<string, number> {
  const fromStore = varsayimlar.tarifeHedefleri;
  if (fromStore && Object.keys(fromStore).length > 0) {
    return alignTarifeHedefleri(fromStore, satisRows);
  }
  const yilDefaults = v3DefaultsForYear(varsayimlar.butceYili);
  if (yilDefaults?.tarifeHedefleri && Object.keys(yilDefaults.tarifeHedefleri).length > 0) {
    return alignTarifeHedefleri(yilDefaults.tarifeHedefleri, satisRows);
  }
  if (satisRows.length > 0 && varsayimlar.toplamPrimHedef > 0) {
    return olcekTarifeHedefleri(satisRows, varsayimlar.toplamPrimHedef);
  }
  return {};
}

function resolveToplamPrim(
  varsayimlar: V3VarsayimlarStore,
  tarifeHedefleri: Record<string, number>,
): number {
  const tarifeToplam = toplamPrimFromTarife(tarifeHedefleri);
  if (tarifeToplam > 0) return tarifeToplam;
  if (Number.isFinite(varsayimlar.toplamPrimHedef) && varsayimlar.toplamPrimHedef > 0) {
    return varsayimlar.toplamPrimHedef;
  }
  const yilDefaults = v3DefaultsForYear(varsayimlar.butceYili);
  return yilDefaults?.toplamPrimHedef ?? 0;
}

export function buildV3GelirTablosu(opts: {
  varsayimlar: V3VarsayimlarStore;
  satisRows: SatisButceRow[];
  uretim: UretimRow[];
  tarifeMap: TarifeMapRow[];
  tarifeBransPay: TarifeBransPayRow[];
  mizan: MizanRow[];
  mizanAylik: MizanAylikRow[];
  mizanAylikFull?: MizanAylikRow[];
  bilancoAylik: BilancoAylikRow[];
  oranAyar: OranAyarStore;
  kpkVade: KpkVadeRow[];
  kapanisTahmin: KpkKapanisTahminStore | null;
}): V3GelirTablosuSonuc {
  const uyarilar: string[] = [];
  const butceYili = opts.varsayimlar.butceYili;
  const mizanFullEarly = opts.mizanAylikFull ?? opts.mizanAylik;
  const preferredAnchor = opts.varsayimlar.ytdAnchorAy ?? V3_DEFAULT_YTD_ANCHOR;
  const ytdDetect = detectYtdAnchorAy(mizanFullEarly, butceYili, preferredAnchor);
  const ytdAnchorAy = ytdDetect.anchorAy;
  if (!ytdDetect.preferredUsed && ytdDetect.maxAvailable != null) {
    uyarilar.push(
      `YTD kilidi: tercih ${preferredAnchor}, mevcut veri max ay=${ytdDetect.maxAvailable} → anchor=${ytdAnchorAy}.`,
    );
  }
  const referansEtiket =
    opts.varsayimlar.referansEtiket ?? "Son 2 Yıl Ortalaması (2024-2025)";
  const yilAgirliklari = referansYilAgirliklari(
    referansEtiket,
    opts.varsayimlar.yilAgirliklari,
  );

  const tarifeHedefleri = resolveTarifeHedefleri(opts.varsayimlar, opts.satisRows);
  const toplamPrimHedef = resolveToplamPrim(opts.varsayimlar, tarifeHedefleri);

  let satisRows = opts.satisRows;
  if (satisRows.length === 0 && Object.keys(tarifeHedefleri).length > 0) {
    satisRows = syntheticSatisFromTarife(tarifeHedefleri);
    uyarilar.push("SATIS_BUTCE yok — tarife hedeflerinden sentetik satış satırları kullanıldı.");
  }

  let primHedefleri: Record<string, number> = {};
  let endirektPrim: Record<string, number> = {};
  let primKaynak = "mizan_yok";

  if (Object.keys(tarifeHedefleri).length > 0) {
    const motor = new DagitimMotoru(
      opts.uretim,
      opts.tarifeMap,
      opts.mizan,
      opts.tarifeBransPay,
    );
    const dagitim = motor.dagit({
      satisRows,
      referansEtiket,
      mizanYedek: true,
      tarifeHedefleri,
      yilAgirliklari,
    });
    for (const b of dagitim.bransOzet) primHedefleri[b.bransKodu] = b.hedefPrim;
    for (const b of dagitim.bransDirektEndirekt) endirektPrim[b.bransKodu] = b.endirektPrim;
    primKaynak = "tarife_dagitim";
    uyarilar.push(
      `Prim dağıtımı: tarife hedefleri → branş (dağıtılan ${Math.round(dagitim.ozet.dagitilan).toLocaleString("tr-TR")} TL, ${dagitim.ozet.bransSayisi} branş).`,
    );
    if (dagitim.ozet.dagitilan <= 0) {
      const fallback = primHedefFromTarifeAna(tarifeHedefleri, opts.mizan, butceYili);
      primHedefleri = fallback.primHedefleri;
      endirektPrim = fallback.endirektPrim;
      primKaynak = fallback.kaynak;
      uyarilar.push(
        `Tarife-branş pay / üretim yok — ana branş grupları + ${fallback.referansYil} mizan iç-grup payı kullanıldı.`,
      );
    } else if (toplamPrimHedef > 0 && dagitim.ozet.dagitilan < toplamPrimHedef * 0.95) {
      uyarilar.push(
        `Dağıtılan prim hedefinin %${((dagitim.ozet.dagitilan / toplamPrimHedef) * 100).toFixed(0)}'i — eşleşmeyen tarife grupları olabilir.`,
      );
    }
  } else {
    const fallback = primHedefFromToplam(toplamPrimHedef, opts.mizan, butceYili);
    primHedefleri = fallback.primHedefleri;
    endirektPrim = fallback.endirektPrim;
    primKaynak = fallback.kaynak;
    uyarilar.push(`Prim dağıtımı: ${fallback.kaynak} (referans ${fallback.referansYil}).`);
    if (fallback.kaynak === "mizan_yok") {
      uyarilar.push("Branş payı mizandan okunamadı — mizan-tidy.json kontrol edin.");
    }
  }

  const gecmisYillar = [...new Set(opts.mizanAylik.map((r) => r.yil))]
    .filter((y) => y < butceYili)
    .sort((a, b) => b - a)
    .slice(0, 3);

  const genelOranlar = genelMevsimOranlari(
    opts.mizanAylik,
    butceYili,
    ytdAnchorAy,
    gecmisYillar,
  );

  const bransOranlari: Record<string, number[]> = {};
  for (const kod of Object.keys(primHedefleri)) {
    if ((primHedefleri[kod] ?? 0) <= 0) continue;
    bransOranlari[kod] = aylikMevsimOranlari(
      opts.mizanAylik,
      butceYili,
      kod,
      ytdAnchorAy,
      gecmisYillar,
    );
  }

  const aylikSatirlar = createAylikDagilimTablosu(
    primHedefleri,
    bransOranlari,
    genelOranlar,
  );
  const aylikPrim: AylikPrimStore = {
    butceYili,
    referansYil: butceYili - 1,
    kaynak: "mizan_aylik",
    genelOranlar,
    satirlar: aylikSatirlar,
    guncellemeIso: new Date().toISOString(),
  };

  const v2Varsayimlar: V2VarsayimlarStore = {
    butceYili,
    tarifeHedefleri,
    referansEtiket,
    yilAgirliklari,
    giderArtisOrani: 0,
    faaliyetGiderButce: opts.varsayimlar.faaliyetGiderButce,
    aylikGetiriOrani: opts.varsayimlar.aylikGetiriOrani,
  };

  const v2Sonuc: V2GelirTablosuSonuc = buildV2GelirTablosu({
    varsayimlar: v2Varsayimlar,
    satisRows,
    uretim: opts.uretim,
    tarifeMap: opts.tarifeMap,
    tarifeBransPay: opts.tarifeBransPay,
    mizan: opts.mizan,
    mizanAylik: opts.mizanAylik,
    mizanAylikFull: opts.mizanAylikFull,
    bilancoAylik: opts.bilancoAylik,
    oranAyar: opts.oranAyar,
    kpkVade: opts.kpkVade,
    kapanisTahmin: opts.kapanisTahmin,
    aylikPrimOverride: aylikPrim,
    primHedefleriOverride: primHedefleri,
    endirektPrimOverride: endirektPrim,
  });

  const { gt: gtOverlay, kalibrasyon } = uygulaYtdOverlay(
    v2Sonuc.gt,
    mizanFullEarly,
    butceYili,
    ytdAnchorAy,
  );

  const maliGelirRolling =
    kalibrasyon.length > 0
      ? uygulaMaliGelirRolling(gtOverlay, {
          butceYili,
          anchorAy: ytdAnchorAy,
          bilancoAylik: opts.bilancoAylik,
          aylikGetiriOrani: opts.varsayimlar.aylikGetiriOrani,
        })
      : null;
  if (maliGelirRolling) uyarilar.push(...maliGelirRolling.uyarilar);

  const gtFinal = hesaplaV2SentetikSatirlar(gtOverlay);

  const mizanRecon = mizanV3Recon(gtFinal, mizanFullEarly, butceYili, ytdAnchorAy);
  if (mizanRecon.tutmayanSayisi > 0) {
    uyarilar.push(
      `Mizan kontrol: ${mizanRecon.tutmayanSayisi} kalem YTD sapması (>50.000 TL).`,
    );
    for (const line of mizanRecon.ozet.slice(0, 8)) uyarilar.push(line);
  } else if (kalibrasyon.length > 0) {
    uyarilar.push("Mizan kontrol: Temmuz YTD tüm ana hesaplarda tutarlı.");
  }

  if (kalibrasyon.length === 0) {
    uyarilar.push(
      `YTD overlay uygulanmadı — ${butceYili} aylık mizan bulunamadı (anchor=${ytdAnchorAy}). ` +
        `Hesaplama saf V2 projeksiyonudur; mizan-aylik-full yüklenince 1–${ytdAnchorAy}. ay kilitlenir.`,
    );
  } else {
    uyarilar.push(
      `YTD kilit aktif: ${butceYili}-01 … ${butceYili}-${String(ytdAnchorAy).padStart(2, "0")} ` +
        `mizan-aylik-full (${kalibrasyon.length} kalem).`,
    );
    for (const k of kalibrasyon) {
      if (k.sapmaPct != null && Math.abs(k.sapmaPct) > 5) {
        uyarilar.push(`${k.ad}: overlay öncesi sapma ${k.sapmaPct.toFixed(1)}%.`);
      }
    }
  }

  uyarilar.push(...v2Sonuc.uyarilar);

  return {
    ...v2Sonuc,
    gt: gtFinal,
    primHedefleri,
    endirektPrim,
    uyarilar: [...new Set(uyarilar)],
    v3: {
      toplamPrimHedef,
      primKaynak,
      ytdAnchorAy,
      kalibrasyon,
      mizanRecon,
      mizanTutmayan: reconTutmayanListe(mizanRecon),
      maliGelirRolling,
      metodolojiOzeti: [...V3_METODOLOJI_ADIMLARI],
      uyarilar,
    },
  };
}
