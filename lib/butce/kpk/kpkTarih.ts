const MS_DAY = 86_400_000;

/** Poliçe başlangıcı: ay ortası (15.). */
export function policyStart(yil: number, ay: number): Date {
  return new Date(Date.UTC(yil, ay - 1, 15));
}

export function policyEnd(yil: number, ay: number, vadeGun: number): Date {
  return new Date(policyStart(yil, ay).getTime() + vadeGun * MS_DAY);
}

export function monthEnd(yil: number, ay: number): Date {
  return new Date(Date.UTC(yil, ay, 0, 23, 59, 59, 999));
}

/** Değerleme: ay sonu. ay=0 → önceki yılın 31 Aralığı (açılış). */
export function valuationDate(yil: number, ay: number): Date {
  if (ay <= 0) return monthEnd(yil - 1, 12);
  return monthEnd(yil, ay);
}

/** Kalan gün / toplam vade oranı (0–1). */
export function kpkKalanOrani(
  yazimYil: number,
  yazimAy: number,
  vadeGun: number,
  degerlemeYil: number,
  degerlemeAy: number,
): number {
  if (vadeGun <= 0) return 0;
  const start = policyStart(yazimYil, yazimAy);
  const end = policyEnd(yazimYil, yazimAy, vadeGun);
  const val = valuationDate(degerlemeYil, degerlemeAy);
  if (val.getTime() >= end.getTime()) return 0;
  if (val.getTime() < start.getTime()) return 1;
  const total = end.getTime() - start.getTime();
  const remaining = end.getTime() - val.getTime();
  return Math.max(0, Math.min(1, remaining / total));
}

export function kpkTutari(
  prim: number,
  yazimYil: number,
  yazimAy: number,
  vadeGun: number,
  degerlemeYil: number,
  degerlemeAy: number,
): number {
  if (prim <= 0) return 0;
  return prim * kpkKalanOrani(yazimYil, yazimAy, vadeGun, degerlemeYil, degerlemeAy);
}
