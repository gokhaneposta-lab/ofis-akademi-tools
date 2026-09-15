/**
 * F38 H2 — getiri üreten varlık havuzu tanımı.
 * YTD mizan kilidi değişmez; yalnızca H2 forecast tabanı.
 */

export type MaliGelirPoolSelectionMethod = "yield_bearing_pool";

export type MaliGelirPoolItemDef = {
  id: string;
  label: string;
  /** Tam kod veya prefix (102 → 10201, 10202 yaprakları). */
  match: { type: "prefix"; codes: readonly string[] } | { type: "exact"; codes: readonly string[] };
};

export type ForecastMaliGelirPoolPolicyConfig = {
  selectionMethod: MaliGelirPoolSelectionMethod;
  selectionReason: string;
  /** Alacak / POS — havuza asla dahil edilmez. */
  excludedPrefixes: readonly string[];
  poolItems: readonly MaliGelirPoolItemDef[];
};

export const FORECAST_MALI_GELIR_POOL_POLICY_CONFIG: ForecastMaliGelirPoolPolicyConfig = {
  selectionMethod: "yield_bearing_pool",
  selectionReason:
    "H2 F38 = anchor yield-bearing stok havuzu × aylık user yield; YTD mizan kilidi; netNakit/collection yok",
  excludedPrefixes: ["106", "120", "122", "128"],
  poolItems: [
    {
      id: "banka",
      label: "Banka / vadeli mevduat (102)",
      match: { type: "prefix", codes: ["102"] },
    },
    {
      id: "sukuk",
      label: "Sukuk (11199111)",
      match: { type: "exact", codes: ["11199111"] },
    },
    {
      id: "fon",
      label: "Yatırım fonu yaprakları (11206108, 11206207)",
      match: { type: "exact", codes: ["11206108", "11206207"] },
    },
  ],
};
