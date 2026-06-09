import {
  CARPIM_BRUT_PRIM,
  CARPIM_DIREKT_PRIM,
  CARPIM_ENDIREKT_PRIM,
  CARPIM_HASAR_BAZ,
  CARPIM_NET_PRIM,
} from "../config/constants";
import type { BilesenSpec, OranKalemSpec } from "./oranKalemLoader";
import { ORAN_BAZLI_KALEMLER, ORAN_KALEM_MIZAN } from "./oranKalemLoader";
import { exportNormSpec } from "./oranMotoru";

export type OranKalemAciklama = {
  kalemKodu: string;
  ad: string;
  gtHucre?: string;
  excelHucre?: string;
  /** Tek satır özet: pay ÷ baz */
  mizanOranFormul: string;
  /** Bileşen kırılımı (çok parçalı kalemler) */
  mizanSatirlar: { etiket: string; formul: string }[];
  /** GT tahmin satırında çarpım bazı */
  tahminAciklama?: string;
  excelCarpim?: string;
  yilBirlestirme: string;
  notlar: string[];
};

const CARPIM_LABEL: Record<string, string> = {
  [CARPIM_BRUT_PRIM]: "Brüt prim (GT F11 / hesap 60001)",
  [CARPIM_DIREKT_PRIM]: "Direkt prim (GT F12)",
  [CARPIM_ENDIREKT_PRIM]: "Endirekt prim (GT F15)",
  [CARPIM_HASAR_BAZ]: "Hasar bazı (F11 + F22 + F32)",
  [CARPIM_NET_PRIM]: "Net prim",
};

function fmtHesaplar(hesaplar: string[], prefix?: boolean): string {
  if (hesaplar.length === 0) return "—";
  const parts = hesaplar.map((h) => (prefix ? `${h}…` : h));
  return parts.length === 1 ? parts[0] : `(${parts.join(" + ")})`;
}

function fmtPayTaraf(bilesen: Pick<BilesenSpec, "pay" | "hesap_eslesme">): string {
  const p = fmtHesaplar(bilesen.pay, bilesen.hesap_eslesme === "prefix");
  return bilesen.hesap_eslesme === "prefix" ? `${p} (alt hesaplar dahil)` : p;
}

function fmtBazTaraf(bilesen: Pick<BilesenSpec, "baz" | "hesap_eslesme" | "baz_toplam_sirket">): string {
  const b = fmtHesaplar(bilesen.baz, bilesen.hesap_eslesme === "prefix");
  if (bilesen.baz_toplam_sirket) {
    return `${b} — tüm şirket toplamı (branş değil)`;
  }
  if (bilesen.hesap_eslesme === "prefix") {
    return `${b} (alt hesaplar dahil) — branş`;
  }
  return `${b} — branş`;
}

function bilesenFormul(bilesen: BilesenSpec): string {
  return `${fmtPayTaraf(bilesen)} ÷ ${fmtBazTaraf(bilesen)}`;
}

function yilBirlestirmeMetni(spec: OranKalemSpec): string {
  if (!spec.yil_birlestirme.length) return "—";
  return spec.yil_birlestirme
    .map(([ofset, agirlik]) => {
      const pct = new Intl.NumberFormat("tr-TR", { style: "percent", maximumFractionDigits: 1 }).format(agirlik);
      return ofset === 1 ? `son yıl ${pct}` : `${ofset}. önceki yıl ${pct}`;
    })
    .join(" + ");
}

function normSpecSafe(kalemKodu: string): OranKalemSpec & { bilesenler: BilesenSpec[] } | null {
  if (!(kalemKodu in ORAN_KALEM_MIZAN)) return null;
  try {
    return exportNormSpec(kalemKodu);
  } catch {
    return null;
  }
}

export function oranKalemAciklama(kalemKodu: string): OranKalemAciklama | null {
  const meta = ORAN_BAZLI_KALEMLER[kalemKodu];
  const spec = normSpecSafe(kalemKodu);
  if (!meta && !spec) return null;

  const notlar: string[] = [
    "MIZAN oranı = pay tutarı ÷ baz tutarı (branş bazında, geçmiş yıl sonu).",
    "Tablodaki oran = yılların Excel GT ağırlığıyla birleştirilmiş halidir.",
  ];

  if (!spec) {
    return {
      kalemKodu,
      ad: meta?.ad ?? kalemKodu,
      gtHucre: meta?.gt_hucre,
      mizanOranFormul: "Tanım yok — varsayılan oran kullanılır",
      mizanSatirlar: [],
      yilBirlestirme: "—",
      notlar,
    };
  }

  const mizanSatirlar = spec.bilesenler.map((b, i) => ({
    etiket: spec.bilesenler.length > 1 ? b.ad || `Bileşen ${i + 1}` : "Oran",
    formul: bilesenFormul(b),
  }));

  const ana = mizanSatirlar[0];
  const mizanOranFormul =
    mizanSatirlar.length === 1
      ? ana.formul
      : mizanSatirlar.map((s) => `${s.etiket}: ${s.formul}`).join(" · ");

  if (spec.baz_toplam_sirket && spec.pay.join() === spec.baz.join()) {
    notlar.push("Bu kalem branş payıdır: aynı hesabın branş tutarı, şirket genelindeki toplama bölünür.");
  }

  let tahminAciklama: string | undefined;
  if (spec.carpim) {
    const baz = CARPIM_LABEL[spec.carpim] ?? spec.carpim;
    tahminAciklama = `GT tahmin tutarı ≈ ${baz} × bu oran`;
    if (spec.gt_hucre) {
      tahminAciklama += ` (Excel hücre ${spec.gt_hucre})`;
    }
  }

  return {
    kalemKodu,
    ad: spec.ad,
    gtHucre: spec.gt_hucre ?? meta?.gt_hucre,
    excelHucre: spec.excel_kalem_kodu,
    mizanOranFormul,
    mizanSatirlar,
    tahminAciklama,
    excelCarpim: spec.excel_carpim,
    yilBirlestirme: yilBirlestirmeMetni(spec),
    notlar,
  };
}

export function oranKalemAciklamaListesi(): OranKalemAciklama[] {
  return Object.keys(ORAN_BAZLI_KALEMLER)
    .map((k) => oranKalemAciklama(k))
    .filter((x): x is OranKalemAciklama => x != null);
}
