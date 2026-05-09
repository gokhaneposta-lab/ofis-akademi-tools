/** branch-lookup.json satırı (bransKodu string anahtar) */
export type TsbBranchLookupEntry = {
  anaBrans: string;
  tarifeGrubu: string;
};

export type TsbBranchLookupMap = Map<number, TsbBranchLookupEntry>;

/** `/data/tsb/branch-lookup.json` → Map */
export function parseBranchLookupJson(raw: Record<string, { anaBrans?: string; tarifeGrubu?: string }>): TsbBranchLookupMap {
  const m = new Map<number, TsbBranchLookupEntry>();
  for (const [k, v] of Object.entries(raw)) {
    const kod = Number(k);
    if (!Number.isFinite(kod)) continue;
    m.set(kod, {
      anaBrans: String(v.anaBrans ?? ""),
      tarifeGrubu: String(v.tarifeGrubu ?? ""),
    });
  }
  return m;
}

export function tarifeGrubuFromRow(
  bransKodu: number,
  rowTarife: string | undefined,
  lookup: TsbBranchLookupMap | null,
): string {
  const t = String(rowTarife ?? "").trim();
  if (t) return t;
  const ent = lookup?.get(bransKodu);
  if (ent?.tarifeGrubu) return ent.tarifeGrubu.trim();
  return "Belirtilmemiş tarife";
}
