/** Mizan 614xx → GT satır — yalnızca manuel import edilen faaliyet giderleri (61402–61406). */
export const FAALIYET_IMPORT_HESAP_GT: Record<
  string,
  { gtSatir: number; gtKod: string; ad: string }
> = {
  "61402": { gtSatir: 190, gtKod: "0252", ad: "Personel giderleri" },
  "61403": { gtSatir: 191, gtKod: "0253", ad: "Yönetim giderleri" },
  "61404": { gtSatir: 192, gtKod: "0254", ad: "AR-GE giderleri" },
  "61405": { gtSatir: 193, gtKod: "0255", ad: "Pazarlama giderleri" },
  "61406": { gtSatir: 194, gtKod: "0256", ad: "Dış hizmet giderleri" },
};

/** Import override uygulanacak GT satırları (F190–F194). 61408/61409 → F200/F201 orandan gelir. */
export const FAALIYET_IMPORT_GT_SATIRLARI = Object.values(FAALIYET_IMPORT_HESAP_GT).map((x) => x.gtSatir);

export function faaliyetImportHesapGtSatir(hesap: string): number | null {
  const kod = hesap.replace(/\D/g, "").slice(0, 5);
  return FAALIYET_IMPORT_HESAP_GT[kod]?.gtSatir ?? null;
}
