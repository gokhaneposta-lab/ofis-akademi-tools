import type { PrimDagitimDetay, SatisButceRow } from "../types";

export type BransTarifeIzSatir = {
  satisSatir: number;
  sirket: string;
  kanal1: string;
  kanal2: string;
  tarifeGrubu: string;
  primTipi: "direkt" | "endirekt";
  /** SATIS_BUTCE içinde bu satırın tarife grubu payı (örn. YANGIN 2,7 mr içinde %12) */
  tarifeSatirPayi: number;
  /** Tarife hedefi × tarifeSatirPayi */
  satirHedef: number;
  /** Bu satırda 701 (veya seçilen branş) payı — referans yıl üretim/MIZAN */
  bransPayi: number;
  /** satirHedef × bransPayi */
  bransHedef: number;
  kaynak: "tarife_brans_pay" | "uretim" | "mizan";
  eslesme: string;
};

export type BransTarifeIzleme = {
  bransKodu: string;
  tarifeGrubu: string;
  tarifeHedef: number;
  satirlar: BransTarifeIzSatir[];
  toplamBransHedef: number;
  tarifeIcindeOran: number;
  dagitilanSatirSayisi: number;
};

/**
 * A motoru detayından “701 YANGIN 2,7 mr → pay kadar hedef” iz tablosu.
 */
export function buildBransTarifeIzleme(
  detay: PrimDagitimDetay[],
  satisRows: SatisButceRow[],
  tarifeHedefleri: Record<string, number>,
  bransKodu: string,
  tarifeGrubu: string,
): BransTarifeIzleme {
  const tarifeHedef = tarifeHedefleri[tarifeGrubu] ?? 0;
  const bransDetay = detay.filter(
    (d) => d.bransKodu === bransKodu && d.tarifeGrubu === tarifeGrubu && d.hedefPrim > 0,
  );

  const satirlar: BransTarifeIzSatir[] = bransDetay.map((d) => {
    const meta = satisRows[d.satisSatir];
    const bransPayi = d.pay;
    const bransHedef = d.hedefPrim;
    const satirHedef = bransPayi > 0 ? bransHedef / bransPayi : 0;
    const tarifeSatirPayi = tarifeHedef > 0 ? satirHedef / tarifeHedef : 0;

    return {
      satisSatir: d.satisSatir,
      sirket: meta?.sirket ?? d.sirket,
      kanal1: d.kanal1,
      kanal2: d.kanal2,
      tarifeGrubu: d.tarifeGrubu,
      primTipi: d.primTipi,
      tarifeSatirPayi,
      satirHedef,
      bransPayi,
      bransHedef,
      kaynak: d.kaynak,
      eslesme: d.eslesme,
    };
  });

  satirlar.sort((a, b) => b.bransHedef - a.bransHedef);

  const toplamBransHedef = satirlar.reduce((a, r) => a + r.bransHedef, 0);

  return {
    bransKodu,
    tarifeGrubu,
    tarifeHedef,
    satirlar,
    toplamBransHedef,
    tarifeIcindeOran: tarifeHedef > 0 ? toplamBransHedef / tarifeHedef : 0,
    dagitilanSatirSayisi: satirlar.length,
  };
}
