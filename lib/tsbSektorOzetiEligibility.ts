/**
 * Sektör Özeti liderlik listeleri — sektör medyanı bazlı uygunluk (eligibility).
 * Eşik oranları merkezi; ileride segment / ölçek grubu genişletilebilir.
 */

/** Medyan × oran eşiği — sabit TL yok. */
export type SektorOzetiUygulukEsik = {
  readonly medyanOrani: number;
};

/** Liste kimliği → uygunluk kuralı (null = filtre yok). */
export const SEKTOR_OZETI_UYGUNLUK_ESIKLERI = {
  vokOz: { medyanOrani: 0.5, metrik: "ozsermaye" },
  netKarYoy: { medyanOrani: 0.25, metrik: "netKar" },
  teknikKarYoy: { medyanOrani: 0.25, metrik: "teknikKar" },
  ozsermayeYoy: { medyanOrani: 0.5, metrik: "ozsermaye" },
  brutPrimYoy: { medyanOrani: 0.5, metrik: "brutPrim" },
  trafikHaricYoy: { medyanOrani: 0.5, metrik: "primTrafikHaric" },
  teknikKarsilikYoy: { medyanOrani: 0.5, metrik: "teknikKarsilik" },
  yatirimYoy: { medyanOrani: 0.25, metrik: "yatirimGeliri" },
} as const satisfies Record<
  string,
  { medyanOrani: number; metrik: keyof SektorOzetiPeerMedians }
>;

export type SektorOzetiPeerMedians = {
  ozsermaye: number | null;
  netKar: number | null;
  teknikKar: number | null;
  brutPrim: number | null;
  primTrafikHaric: number | null;
  teknikKarsilik: number | null;
  yatirimGeliri: number | null;
};

export const SEKTOR_OZETI_METODOLOJI = {
  kisa:
    "Liderlik listelerinde küçük ölçek etkisini azaltmak amacıyla bazı göstergelerde sektör medyanı bazlı uygunluk filtreleri uygulanmaktadır.",
  detay:
    "Yüzde değişim bazlı sıralamalarda düşük hacimli şirketler çok yüksek oranlar gösterebilir. Daha anlamlı karşılaştırma sağlamak amacıyla bazı listelerde sektör medyanı bazlı uygunluk filtreleri kullanılmıştır.",
} as const;

/** Peer kümesi üzerinde medyan (dinamik, dönem bazlı). */
export function sektorOzetiMedyan(degerler: readonly number[]): number | null {
  const finite = degerler.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return null;
  const sorted = [...finite].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

/** Şirket değeri >= medyan × oran (medyan yoksa filtre uygulanmaz). */
export function sektorOzetiUygun(
  sirketDegeri: number,
  medyan: number | null,
  esik: SektorOzetiUygulukEsik,
): boolean {
  if (medyan === null || !Number.isFinite(medyan)) return true;
  if (!Number.isFinite(sirketDegeri)) return false;
  return sirketDegeri >= medyan * esik.medyanOrani;
}

export function sektorOzetiUygunMetrik(
  sirketDegeri: number,
  medians: SektorOzetiPeerMedians,
  metrik: keyof SektorOzetiPeerMedians,
  medyanOrani: number,
): boolean {
  return sektorOzetiUygun(sirketDegeri, medians[metrik], { medyanOrani });
}

/** Peer ham ölçümlerinden dönem medyanları. */
export function sektorOzetiPeerMediansFromValues(values: {
  ozsermaye: number[];
  netKar: number[];
  teknikKar: number[];
  brutPrim: number[];
  primTrafikHaric: number[];
  teknikKarsilik: number[];
  yatirimGeliri: number[];
}): SektorOzetiPeerMedians {
  return {
    ozsermaye: sektorOzetiMedyan(values.ozsermaye),
    netKar: sektorOzetiMedyan(values.netKar),
    teknikKar: sektorOzetiMedyan(values.teknikKar),
    brutPrim: sektorOzetiMedyan(values.brutPrim),
    primTrafikHaric: sektorOzetiMedyan(values.primTrafikHaric),
    teknikKarsilik: sektorOzetiMedyan(values.teknikKarsilik),
    yatirimGeliri: sektorOzetiMedyan(values.yatirimGeliri),
  };
}
