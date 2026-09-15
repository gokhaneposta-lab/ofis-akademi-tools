/**
 * F436 (0212/0211 RE hasar oranı) — H2 forecast seçim config.
 * Hard-code oran yok; yalnızca seçim metodu tanımlanır.
 */
export type ReinsuranceSelectionMethod = "ytd" | "recent3" | "historical" | "motor";

export const FORECAST_REINSURANCE_RATE_POLICY_CONFIG = {
  /** Varsayılan H2 F436 seçimi (branş bazlı). */
  defaultSelectionMethod: "ytd" satisfies ReinsuranceSelectionMethod,
  /** Gelecekte branş override: bransKodu → method */
  branchOverrides: {} as Record<string, ReinsuranceSelectionMethod>,
} as const;

export type ForecastReinsuranceRatePolicyConfig = typeof FORECAST_REINSURANCE_RATE_POLICY_CONFIG;
