/** TSB panellerinde sağ-blok kıyas modu — sektör / benzer ölçek / tek şirket. */

export type TsbKiyasModu = "sektor" | "olcek" | "sirket";

export type TsbKiyasHedef =
  | { mod: "sektor" }
  | { mod: "olcek" }
  | { mod: "sirket"; sirketKodu: number };

export function kiyasHedefFromModu(
  mod: TsbKiyasModu,
  kiyasSirketKodu: number | "",
): TsbKiyasHedef {
  if (mod === "sektor") return { mod: "sektor" };
  if (mod === "olcek") return { mod: "olcek" };
  if (kiyasSirketKodu === "") return { mod: "sektor" };
  return { mod: "sirket", sirketKodu: kiyasSirketKodu };
}
