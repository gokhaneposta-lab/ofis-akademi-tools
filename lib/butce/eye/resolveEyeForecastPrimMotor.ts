import { buildEyeBrutPrimForecast } from "./eyeBrutPrimForecast";
import type {
  ResolveEyeForecastPrimMotorOpts,
  ResolveEyeForecastPrimMotorSonuc,
} from "./eyeBrutPrimForecast.types";

export const EYE_FORECAST_PRIM_BLOCKED_MSG =
  "EYE H2 prim forecast: hesaplanabilir tarife yok (2025 YTD=0 ve override yok).";

/** Public entry — KPK / V2 / V3 orchestrator'ları buradan çağırır. */
export function resolveEyeForecastPrimMotor(
  opts: ResolveEyeForecastPrimMotorOpts,
): ResolveEyeForecastPrimMotorSonuc {
  const anchor = Math.min(Math.max(Math.floor(opts.anchorAy), 1), 12);

  if (opts.injectedAylikPrim && Object.keys(opts.injectedAylikPrim).length > 0) {
    return {
      durum: "ok",
      anchorAy: anchor,
      h2ForecastPrimByBrans: opts.injectedAylikPrim,
      tarifeSatirlari: [],
      uyarilar: [],
      forecastMethodVersion: "eye-prim-v1-growth-h2",
    };
  }

  const built = buildEyeBrutPrimForecast(opts);

  let mesaj: string | undefined;
  if (built.durum === "blocked") {
    mesaj = EYE_FORECAST_PRIM_BLOCKED_MSG;
  }

  return {
    durum: built.durum,
    anchorAy: built.anchorAy,
    h2ForecastPrimByBrans: built.h2ForecastPrimByBrans,
    tarifeSatirlari: built.tarifeSatirlari,
    uyarilar: built.uyarilar,
    mesaj,
    forecastMethodVersion: built.forecastMethodVersion,
  };
}

export { buildEyeBrutPrimForecast } from "./eyeBrutPrimForecast";
export type {
  EyeBrutPrimForecastOpts,
  EyeBrutPrimForecastSonuc,
  EyePrimTarifeSatir,
  EyePrimUyari,
  ResolveEyeForecastPrimMotorOpts,
  ResolveEyeForecastPrimMotorSonuc,
} from "./eyeBrutPrimForecast.types";
