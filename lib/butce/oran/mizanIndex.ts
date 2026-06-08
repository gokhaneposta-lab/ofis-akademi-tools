import { normalizeBransKodu } from "../textUtils";
import type { MizanRow } from "../types";

/** yil|brans → satırlar; yil → şirket geneli */
export class MizanIndex {
  private readonly byYilBrans = new Map<string, MizanRow[]>();
  private readonly byYil = new Map<number, MizanRow[]>();

  constructor(mizan: MizanRow[]) {
    for (const r of mizan) {
      if (r.bransKodu === "TOPLAM") continue;
      const yil = r.yil;
      const br = normalizeBransKodu(r.bransKodu);
      const yb = `${yil}|${br}`;

      let list = this.byYilBrans.get(yb);
      if (!list) {
        list = [];
        this.byYilBrans.set(yb, list);
      }
      list.push(r);

      let yilList = this.byYil.get(yil);
      if (!yilList) {
        yilList = [];
        this.byYil.set(yil, yilList);
      }
      yilList.push(r);
    }
  }

  hesapTutar(
    yil: number,
    brans: string,
    hesaplar: string[],
    opts: { prefix?: boolean; tumSirket?: boolean } = {},
  ): number {
    const { prefix = false, tumSirket = false } = opts;
    const rows = tumSirket
      ? (this.byYil.get(yil) ?? [])
      : (this.byYilBrans.get(`${yil}|${normalizeBransKodu(brans)}`) ?? []);

    if (rows.length === 0) return 0;

    let toplam = 0;
    for (const r of rows) {
      const h = String(r.hesap);
      for (const hesap of hesaplar) {
        if (prefix ? h.startsWith(hesap) : h === hesap) {
          toplam += r.tutar;
          break;
        }
      }
    }
    return toplam;
  }
}
