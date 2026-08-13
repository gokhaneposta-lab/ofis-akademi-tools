import formatRaw from "../data/gt_sirket_format.json";

type FormatRow = { gtKod: string; hesapKodu: string; hesapAdi: string };

const HESAP_ADI = new Map<string, string>();
for (const r of (formatRaw as { format7: FormatRow[] }).format7) {
  const kod = String(r.hesapKodu ?? "").trim();
  const ad = String(r.hesapAdi ?? "").trim();
  if (kod && ad && !HESAP_ADI.has(kod)) HESAP_ADI.set(kod, ad);
}

export function hesapAdi(kod: string): string {
  return HESAP_ADI.get(kod) ?? kod;
}

export type V2HesapDugum = {
  id: string;
  /** Boş = sentetik ara toplam (Teknik gelir, Safi TKZ…). */
  hesap?: string;
  satir: number;
  kalin?: boolean;
  vurgu?: boolean;
  children?: V2HesapDugum[];
};

/** V2 özet: 3 haneli hesap + açılır alt hesap. Sentetik toplamlar hesap kodu taşımaz. */
export const V2_HESAP_AGAC: V2HesapDugum[] = [
  {
    id: "tg",
    satir: 9001,
    kalin: true,
    children: [
      {
        id: "600",
        hesap: "600",
        satir: 10,
        kalin: true,
        children: [
          { id: "60001", hesap: "60001", satir: 11 },
          { id: "60002", hesap: "60002", satir: 19 },
          { id: "60003", hesap: "60003", satir: 20 },
        ],
      },
      {
        id: "601",
        hesap: "601",
        satir: 21,
        kalin: true,
        children: [
          {
            id: "60101",
            hesap: "60101",
            satir: 22,
            kalin: true,
            children: [
              { id: "601011", hesap: "601011", satir: 23 },
              { id: "601012", hesap: "601012", satir: 24 },
            ],
          },
          {
            id: "60102",
            hesap: "60102",
            satir: 25,
            kalin: true,
            children: [
              { id: "601021", hesap: "601021", satir: 26 },
              { id: "601022", hesap: "601022", satir: 27 },
            ],
          },
          {
            id: "60103",
            hesap: "60103",
            satir: 28,
            kalin: true,
            children: [
              { id: "601031", hesap: "601031", satir: 29 },
              { id: "601032", hesap: "601032", satir: 30 },
            ],
          },
        ],
      },
      {
        id: "602",
        hesap: "602",
        satir: 31,
        kalin: true,
        children: [
          {
            id: "60201",
            hesap: "60201",
            satir: 32,
            children: [
              { id: "602011", hesap: "602011", satir: 33 },
              { id: "602012", hesap: "602012", satir: 34 },
            ],
          },
          {
            id: "60202",
            hesap: "60202",
            satir: 35,
            children: [
              { id: "602021", hesap: "602021", satir: 36 },
              { id: "602022", hesap: "602022", satir: 37 },
            ],
          },
        ],
      },
      { id: "605", hesap: "605", satir: 86 },
    ],
  },
  {
    id: "td",
    satir: 9002,
    kalin: true,
    children: [
      {
        id: "610",
        hesap: "610",
        satir: 95,
        kalin: true,
        children: [
          { id: "61001", hesap: "61001", satir: 96 },
          { id: "61002", hesap: "61002", satir: 105 },
        ],
      },
      { id: "611", hesap: "611", satir: 114 },
      {
        id: "613",
        hesap: "613",
        satir: 166,
        children: [
          {
            id: "61301",
            hesap: "61301",
            satir: 166,
            children: [{ id: "61301101", hesap: "61301101", satir: 167 }],
          },
        ],
      },
      {
        id: "614",
        hesap: "614",
        satir: 9006,
        kalin: true,
        children: [
          { id: "61401199", hesap: "61401199", satir: 177 },
          { id: "614071", hesap: "614071", satir: 196 },
          { id: "61408", hesap: "61408", satir: 200 },
          { id: "61409", hesap: "61409", satir: 201 },
        ],
      },
    ],
  },
  { id: "safi", satir: 9003, kalin: true, vurgu: true },
  { id: "603", hesap: "603", satir: 38, kalin: true },
  {
    id: "gg",
    satir: 9004,
    kalin: true,
    children: [
      { id: "61402", hesap: "61402", satir: 190 },
      { id: "61403", hesap: "61403", satir: 191 },
      { id: "61404", hesap: "61404", satir: 192 },
      { id: "61405", hesap: "61405", satir: 193 },
      { id: "61406", hesap: "61406", satir: 194 },
    ],
  },
  { id: "tkz", satir: 9005, kalin: true, vurgu: true },
];

const SENTETIK_AD: Record<number, string> = {
  9001: "TEKNİK GELİR",
  9002: "TEKNİK GİDER",
  9003: "SAFİ TKZ",
  9004: "GENEL GİDERLER",
  9005: "TKZ",
  9006: "FAALİYET GİDERLERİ",
};

export function dugumEtiket(d: V2HesapDugum): string {
  if (d.hesap) return hesapAdi(d.hesap);
  return SENTETIK_AD[d.satir] ?? `F${d.satir}`;
}
