import bransData from "../data/brans.json";

export type BransInfo = [hazineAd: string, sirketAd: string, anaBrans: string];

type BransJson = {
  brans: Record<string, BransInfo>;
  sira: string[];
  ana: Record<string, string[]>;
};

const data = bransData as unknown as BransJson;

export const HAZINE_BRANS_KODLARI: Readonly<Record<string, BransInfo>> = data.brans;
export const HAZINE_BRANS_SIRASI: readonly string[] = data.sira;
export const ANA_BRANS_GRUPLARI: Readonly<Record<string, readonly string[]>> = data.ana;

export function bransAdi(kod: string): string {
  return HAZINE_BRANS_KODLARI[kod]?.[1] ?? kod;
}

export function anaBrans(kod: string): string {
  return HAZINE_BRANS_KODLARI[kod]?.[2] ?? "";
}
