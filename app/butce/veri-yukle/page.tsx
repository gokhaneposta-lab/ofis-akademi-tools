import type { Metadata } from "next";
import ButceDataUploadCard from "@/components/butce/ButceDataUploadCard";
import { butceDataDurumu } from "@/lib/butce/loadData";
import {
  BUTCE_AYLIK_GT_BILANCO_SPEC,
  BUTCE_KPK_VADE_SPEC,
  BUTCE_MAP_TARIFE_SPEC,
  BUTCE_PRIM_SPEC,
  BUTCE_TARIFE_BRANS_PAY_SPEC,
} from "@/lib/butce/uploadSpecs";

export const metadata: Metadata = {
  title: "Bütçe — Veri yükleme",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmt(n: number) {
  return n.toLocaleString("tr-TR");
}

export default async function VeriYuklePage() {
  const durum = await butceDataDurumu();
  const meta = durum.meta;

  const mizanOzet = durum.hasMizan
    ? `${meta?.mizanYilMin ?? "?"}–${meta?.mizanYilMax ?? "?"}, ${fmt(durum.mizanSatir)} yıl sonu satırı`
    : undefined;
  const aylikOzet = durum.hasMizanAylik
    ? `${meta?.mizanAylikYilMin ?? "?"}–${meta?.mizanAylikYilMax ?? "?"}, GT prim ${fmt(durum.mizanAylikSatir)} satır, bilanço ${fmt(meta?.bilancoAylikSatirSayisi ?? 0)} satır`
    : undefined;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-950">
        <h1 className="text-base font-semibold text-blue-950">Bütçe verilerini buradan yükleyin</h1>
        <p className="mt-1">
          Bu sayfa bütçe modelinin ihtiyaç duyduğu tüm iş verilerini toplar. Diğer sekmelerde dosya
          yükleme yoktur; oralarda hedef, oran ve sonuç kontrolleri yapılır.
        </p>
      </section>

      <ButceDataUploadCard
        title="1. Bütçe Prim Hedefi"
        kind="satis_butce"
        butceYili={durum.butceYili}
        status={durum.hasSatisButce ? "loaded" : "missing"}
        statusText={durum.hasSatisButce ? `${fmt(durum.satisButceSatir)} satır` : undefined}
        neden="Üst yönetim veya GM tarafından belirlenen prim hedefleri bu veriden gelir."
        neYuklenmeli="Kanal ve tarife grubu bazında bütçe prim hedefleri. Örneğin YANGIN tarife grubu hedefi 2,7 milyar."
        feeds="Prim hedefi sayfasında tarife grubu hedefleri ve A motoru dağıtımı."
        spec={BUTCE_PRIM_SPEC}
      />

      <ButceDataUploadCard
        title="2. Tarife Grubu → Hazine Branşı Dağılımı"
        kind="tarife_brans_pay"
        butceYili={durum.butceYili}
        status={durum.hasTarifeBransPay ? "loaded" : "missing"}
        statusText={durum.hasTarifeBransPay ? `${fmt(durum.tarifeBransPaySatir)} satır` : undefined}
        neden="Bir tarife grubundan yazılan primin geçmişte hangi 7xx hazine branşlarına dağıldığını gösterir."
        neYuklenmeli="Tarife grubu, hazine branş kodu, tanzim yıl/ay ve net prim tutarları. 2026 verisi geldikçe aynı formatta yüklenebilir."
        feeds="A motoru, tarife hedefini bu geçmiş paylara göre 7xx branşlara böler."
        spec={BUTCE_TARIFE_BRANS_PAY_SPEC}
      />

      <ButceDataUploadCard
        title="3. Aylık GT ve Bilanço Mizanı"
        kind="aylik_gt_bilanco"
        butceYili={durum.butceYili}
        status={durum.hasMizanAylik ? "loaded" : "missing"}
        statusText={aylikOzet ?? mizanOzet}
        neden="GT ve bilanço hesaplarının en güncel gerçekleşen durumunu verir."
        neYuklenmeli="Dönem, şirket, hesap no, hesap adı ve net tutar içeren aylık kümülatif mizan."
        feeds="Aylık dağılım, teknik oranlar, gelir tablosu ve bilanço."
        spec={BUTCE_AYLIK_GT_BILANCO_SPEC}
      />

      <ButceDataUploadCard
        title="4. Tarife Grubu Sabit Tanımları"
        kind="tarife_map"
        butceYili={durum.butceYili}
        status={durum.hasTarifeMap ? "loaded" : "optional"}
        statusText={durum.hasTarifeMap ? `${fmt(durum.tarifeMapSatir)} satır` : undefined}
        neden="Hazine branş kodu, branş adı, ana branş ve tarife grubu gibi nadiren değişen sabit tanımları tutar."
        neYuklenmeli="Tanımlar değişirse güncel sabit tablo. Her bütçe döneminde tekrar yüklenmesi beklenmez."
        feeds="Branş adları, ana branş gösterimleri ve kontrol tabloları."
        spec={BUTCE_MAP_TARIFE_SPEC}
      />

      <ButceDataUploadCard
        title="5. KPK Vade Tanımları"
        kind="kpk_vade"
        butceYili={durum.butceYili}
        status={durum.hasKpkVade ? "loaded" : "optional"}
        statusText={
          durum.hasKpkVade
            ? `${fmt(durum.kpkVadeBransSayisi)} branş × 12 ay (${durum.kpkVadeKaynak === "yuklu" ? "yüklenmiş" : "varsayılan"})`
            : undefined
        }
        neden="KPK hesabında her branşın poliçe ortalama yaşam süresi ay bazında farklıdır (ör. 777 tarımsal sezon). Başlangıç–bitiş tarihi farkı bu tablodan okunur."
        neYuklenmeli="Branş Kod, Branş Ad, Ay (1–12) ve Vade (gün) kolonları. Son 3 yıl üretim ortalaması; sık güncellenmez."
        feeds="Gelir tablosu ve bilanço KPK hesapları."
        spec={BUTCE_KPK_VADE_SPEC}
      />
    </div>
  );
}
