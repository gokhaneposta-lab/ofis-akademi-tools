import type { SatisButceRow } from "../types";

/** SATIS_BUTCE yokken A motoru için tek satır / tarife sentetik satış satırı. */
export function syntheticSatisFromTarife(
  tarifeHedefleri: Record<string, number>,
): SatisButceRow[] {
  return Object.entries(tarifeHedefleri)
    .filter(([, hedef]) => (Number(hedef) || 0) > 0)
    .map(([tarifeGrubu, hedefPrim]) => ({
      sirket: "V3",
      kanal1: "DIREKT",
      kanal2: "GENEL",
      tarifeGrubu,
      oncekiYil1: 0,
      oncekiYil2: 0,
      tahminYilsonu: 0,
      hedefPrim: Number(hedefPrim) || 0,
    }));
}
