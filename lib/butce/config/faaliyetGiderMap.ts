/** Mizan 614xx → GT satır eşlemesi (Genel Gider / faaliyet giderleri). */
export const FAALIYET_HESAP_GT: Record<
  string,
  { gtSatir: number; gtKod: string; ad: string }
> = {
  "61402": { gtSatir: 190, gtKod: "0252", ad: "Personel giderleri" },
  "61403": { gtSatir: 191, gtKod: "0253", ad: "Yönetim giderleri" },
  "61404": { gtSatir: 192, gtKod: "0254", ad: "AR-GE giderleri" },
  "61405": { gtSatir: 193, gtKod: "0255", ad: "Pazarlama giderleri" },
  "61406": { gtSatir: 194, gtKod: "0256", ad: "Dış hizmet giderleri" },
  "61408": { gtSatir: 200, gtKod: "0258", ad: "Diğer faaliyet giderleri" },
  "61409": { gtSatir: 201, gtKod: "0259", ad: "Diğer faaliyet giderleri (2)" },
};

export const FAALIYET_GT_SATIRLARI = Object.values(FAALIYET_HESAP_GT).map((x) => x.gtSatir);

export function faaliyetHesapGtSatir(hesap: string): number | null {
  const kod = hesap.replace(/\D/g, "").slice(0, 5);
  return FAALIYET_HESAP_GT[kod]?.gtSatir ?? null;
}
