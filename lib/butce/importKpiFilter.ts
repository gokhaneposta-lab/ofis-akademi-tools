/** KPI import filtresi — alt hesap / banka şubesi çift sayımını önler. */

const BL_KPI = new Set(["1", "2", "3", "4", "5", "10", "11", "35", "45", "350", "450"]);

const GT_KPI = new Set(["6", "7", "60", "600", "60001"]);

/** Faaliyet giderleri alt ağacı (614…) — en fazla 8 hane */
function isGtGiderKodu(kod: string): boolean {
  return kod.startsWith("614") && kod.length <= 8;
}

export function isButceKpiHesapKodu(kod: string): boolean {
  const k = String(kod ?? "").trim();
  if (!k) return false;
  if (BL_KPI.has(k) || GT_KPI.has(k)) return true;
  if (isGtGiderKodu(k)) return true;
  return false;
}

export function butceTabloTipFromKod(kod: string): "GT" | "BL" {
  const k = String(kod).trim();
  if (BL_KPI.has(k)) return "BL";
  if (/^[1-5]$/.test(k)) return "BL";
  return "GT";
}

export function butceDegerTipi(hesapKodu: string): "ytd" | "donem" | undefined {
  if (hesapKodu === "60001") return "ytd";
  if (BL_KPI.has(hesapKodu) || /^[1-5]$/.test(hesapKodu)) return "donem";
  return "donem";
}
