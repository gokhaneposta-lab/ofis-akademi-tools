import { V2_FAALIYET_ARTIS_HESAPLARI } from "./maliGelirProxyConfig";
import type { FaaliyetGiderRow, MizanRow } from "../types";

/**
 * Önceki yıl mizan 61402–06 şirket toplamı × (1+artis) → bütçe yılı aylık FaaliyetGiderRow.
 * Aylık profil eşit dağılım (1/12); branş dağıtımı buildFaaliyetGiderSonuc (F368) yapar.
 */
export function buildFaaliyetGiderFromMizanArtis(opts: {
  mizan: MizanRow[];
  butceYili: number;
  giderArtisOrani: number;
}): { rows: FaaliyetGiderRow[]; oncekiYil: number; uyarilar: string[] } {
  const oncekiYil = opts.butceYili - 1;
  const uyarilar: string[] = [];
  const byHesap = new Map<string, number>();

  for (const h of V2_FAALIYET_ARTIS_HESAPLARI) byHesap.set(h, 0);

  for (const r of opts.mizan) {
    if (r.yil !== oncekiYil) continue;
    // Tam kod (61402); slice/prefix 614021… ile çift sayım yapmaz.
    const kod = String(r.hesap).replace(/\D/g, "");
    if (!byHesap.has(kod)) continue;
    byHesap.set(kod, (byHesap.get(kod) ?? 0) + Math.abs(Number(r.tutar) || 0));
  }

  const carpan = 1 + (Number.isFinite(opts.giderArtisOrani) ? opts.giderArtisOrani : 0);
  const rows: FaaliyetGiderRow[] = [];
  let totalOnceki = 0;

  for (const hesap of V2_FAALIYET_ARTIS_HESAPLARI) {
    const onceki = byHesap.get(hesap) ?? 0;
    totalOnceki += onceki;
    const yillik = onceki * carpan;
    if (yillik <= 0) continue;
    const aylik = yillik / 12;
    for (let ay = 1; ay <= 12; ay++) {
      rows.push({
        butceYili: opts.butceYili,
        hesap,
        ay,
        tutar: aylik,
      });
    }
  }

  if (totalOnceki <= 0) {
    uyarilar.push(
      `${oncekiYil} mizanında 61402–06 tutarı bulunamadı — V2 genel gider satırları 0 kalır.`,
    );
  }

  return { rows, oncekiYil, uyarilar };
}
