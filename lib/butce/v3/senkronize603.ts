/**
 * Şirket aylikToplam[38] ile branş aylikBrans[*][38] aylık toplamlarını hizalar.
 * Dashboard şirket serisini kullanır; Excel şirket formatı branş toplamından üretilir.
 */
import type { GelirTablosuSonuc } from "../gelir/gelirTablosu";
import { NET_NAK_GT_SATIRLARI, payFromNetNakitMap } from "../v2/netNakitPay";

const MALI_GELIR_SATIRI = 38;

function bransPaylari(gt: GelirTablosuSonuc): Map<string, number> {
  const netByBrans = new Map<string, number>();
  for (const b of gt.branslar) {
    let net = 0;
    for (const s of NET_NAK_GT_SATIRLARI) net += b.degerler[s] ?? 0;
    netByBrans.set(b.bransKodu, net);
  }
  const paylar = payFromNetNakitMap(netByBrans);
  const payToplam = [...paylar.values()].reduce((a, p) => a + p, 0);
  const brutToplam = gt.branslar.reduce((a, b) => a + b.brutPrim, 0);
  const out = new Map<string, number>();
  for (const b of gt.branslar) {
    out.set(
      b.bransKodu,
      payToplam > 0
        ? (paylar.get(b.bransKodu) ?? 0)
        : brutToplam > 0
          ? b.brutPrim / brutToplam
          : 0,
    );
  }
  return out;
}

export function senkronize603AylikBrans(gt: GelirTablosuSonuc): void {
  const sirketSer = gt.aylikToplam[MALI_GELIR_SATIRI];
  if (!sirketSer?.length) return;

  const paylar = bransPaylari(gt);

  for (let m = 0; m < 12; m++) {
    const hedef = sirketSer[m] ?? 0;
    let bransTop = 0;
    for (const b of gt.branslar) {
      bransTop += gt.aylikBrans[b.bransKodu]?.[MALI_GELIR_SATIRI]?.[m] ?? 0;
    }

    if (Math.abs(hedef) < 0.01 && Math.abs(bransTop) < 0.01) continue;

    if (Math.abs(bransTop) < 0.01) {
      for (const b of gt.branslar) {
        const pay = paylar.get(b.bransKodu) ?? 0;
        const v = hedef * pay;
        if (!gt.aylikBrans[b.bransKodu]) gt.aylikBrans[b.bransKodu] = {};
        const ser = [...(gt.aylikBrans[b.bransKodu]![MALI_GELIR_SATIRI] ?? Array(12).fill(0))];
        ser[m] = v;
        gt.aylikBrans[b.bransKodu]![MALI_GELIR_SATIRI] = ser;
      }
      continue;
    }

    const carpan = hedef / bransTop;
    if (Math.abs(carpan - 1) < 1e-9) continue;

    for (const b of gt.branslar) {
      const mevcut = gt.aylikBrans[b.bransKodu]?.[MALI_GELIR_SATIRI];
      if (!mevcut) continue;
      const ser = [...mevcut];
      ser[m] = (ser[m] ?? 0) * carpan;
      gt.aylikBrans[b.bransKodu]![MALI_GELIR_SATIRI] = ser;
    }
  }

  for (const b of gt.branslar) {
    const ser = gt.aylikBrans[b.bransKodu]?.[MALI_GELIR_SATIRI];
    if (ser) b.degerler[MALI_GELIR_SATIRI] = ser.reduce((a, x) => a + x, 0);
  }
}
