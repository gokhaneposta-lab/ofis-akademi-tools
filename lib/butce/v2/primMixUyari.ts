import { bransGrubu, GRUP_SIRA } from "./buildGtFormatGrid";
import { V2_PRIM_MIX_UYARI_ESIK_PP } from "../oran/oranMetodoloji";
import type { MizanRow } from "../types";

function fmtPct(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Hedef prim dağılımı geçmiş mizan mix'inden belirgin saparsa uyar.
 * Oran tahmininin güvenilirliği portföy karışımına bağlıdır.
 */
export function primMixUyarilari(
  primHedefleri: Record<string, number>,
  mizan: MizanRow[],
  butceYili: number,
  esikPp = V2_PRIM_MIX_UYARI_ESIK_PP,
): string[] {
  const refYil = butceYili - 1;
  const gecmis: Record<string, number> = Object.fromEntries(GRUP_SIRA.map((g) => [g, 0]));
  const hedef: Record<string, number> = Object.fromEntries(GRUP_SIRA.map((g) => [g, 0]));

  for (const r of mizan) {
    if (r.yil !== refYil || String(r.hesap) !== "60001") continue;
    const br = String(r.bransKodu);
    if (!/^7\d{2}$/.test(br)) continue;
    const g = bransGrubu(br);
    gecmis[g] = (gecmis[g] ?? 0) + Math.abs(Number(r.tutar) || 0);
  }

  for (const [kod, prim] of Object.entries(primHedefleri)) {
    if (!/^7\d{2}$/.test(kod) || prim <= 0) continue;
    const g = bransGrubu(kod);
    hedef[g] = (hedef[g] ?? 0) + prim;
  }

  const topGecmis = Object.values(gecmis).reduce((a, b) => a + b, 0);
  const topHedef = Object.values(hedef).reduce((a, b) => a + b, 0);
  if (topGecmis < 1 || topHedef < 1) return [];

  const uyarilar: string[] = [];
  for (const g of GRUP_SIRA) {
    const pg = (gecmis[g] ?? 0) / topGecmis;
    const ph = (hedef[g] ?? 0) / topHedef;
    const farkPp = (ph - pg) * 100;
    if (Math.abs(farkPp) >= esikPp) {
      uyarilar.push(
        `Prim mix: ${g} hedef pay ${fmtPct(ph)} vs ${refYil} mizan ${fmtPct(pg)} (${farkPp >= 0 ? "+" : ""}${farkPp.toFixed(1)} pp) — teknik oranları aynen taşımak portföy kaymasını yansıtmayabilir.`,
      );
    }
  }
  return uyarilar;
}
