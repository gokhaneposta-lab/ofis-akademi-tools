"use client";

import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";
import { downloadWorkbook } from "@/lib/egitimExcelExport";
import {
  buildHaftalikSatisSablonu,
  buildStokOzetiSablonu,
  buildPerformansSablonu,
  buildTumSablonlarTekKitap,
} from "@/lib/raporSablonlari";

const sablonlar = [
  {
    id: "haftalik-satis",
    name: "Haftalık Satış Raporu",
    description:
      "Tarih, ürün, adet ve birim fiyat ile tutarın otomatik hesaplandığı örnek veri. Toplam ve ortalama satış formülleri hazır.",
    build: buildHaftalikSatisSablonu,
    filename: "Ofis-Akademi-Haftalik-Satis-Sablonu.xlsx",
  },
  {
    id: "stok",
    name: "Stok Özeti",
    description:
      "Stok ve minimum stok karşılaştırması; \"Sipariş ver\" / \"Yeterli\" durumu otomatik. Toplam stok ve kritik adet formülleri.",
    build: buildStokOzetiSablonu,
    filename: "Ofis-Akademi-Stok-Ozeti-Sablonu.xlsx",
  },
  {
    id: "performans",
    name: "Performans Raporu",
    description:
      "Hedef ve gerçekleşen değerlerden oran % otomatik; toplam ve hedefi aşan kişi sayısı formülleri hazır.",
    build: buildPerformansSablonu,
    filename: "Ofis-Akademi-Performans-Sablonu.xlsx",
  },
];

const hazirFormuller = [
  { tr: "TOPLA", en: "SUM", aciklama: "Belirtilen aralıktaki sayıları toplar." },
  { tr: "ORTALAMA", en: "AVERAGE", aciklama: "Aralıktaki sayıların ortalamasını verir." },
  { tr: "EĞER", en: "IF", aciklama: "Koşula göre farklı değer döndürür (örn. stok durumu)." },
  { tr: "EĞERSAY", en: "COUNTIF", aciklama: "Bir koşula uyan hücre sayısını verir." },
  { tr: "Çarpım", en: "C2*D2", aciklama: "Adet × Birim fiyat = Tutar gibi hesaplar." },
];

export default function RaporSablonlariPage() {
  function handleDownload(
    build: () => ReturnType<typeof buildHaftalikSatisSablonu>,
    filename: string
  ) {
    const wb = build();
    downloadWorkbook(wb, filename);
  }

  return (
    <div
      className="min-h-screen bg-[#e2e8ec]"
      style={{ fontFamily: THEME.font }}
    >
      <PageRibbon
        title="Otomatik Rapor Şablonları"
        description="Haftalık satış, stok ve performans raporları için örnek veri setleri ve hazır formüller içeren Excel şablonlarını indirin."
      >
        <Link
          href="/excel-araclari"
          className="ml-auto text-sm font-medium text-white/90 hover:text-white underline"
        >
          ← Excel Araçları
        </Link>
      </PageRibbon>

      <div className="mx-4 mt-6 mb-10 max-w-3xl space-y-8">
        <NasilKullanilir
          showEnhancedSections={false}
          steps={[
            "Aşağıdaki listeden istediğiniz şablonun yanındaki İndir butonuna tıklayın.",
            "Excel dosyası indirilir; kendi verinizi yazın veya örnek veriyi düzenleyin.",
            "Hazır formüller (TOPLA, ORTALAMA, EĞER vb.) zaten hücrelerde tanımlıdır.",
          ]}
        />

        <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Bu araç ne işe yarar?</h2>
          <p className="mt-2 text-sm text-slate-700">
            Haftalık satış, stok özeti ve performans raporları için hazır Excel şablonlarını indirmenizi sağlar. Şablonlarda formüller
            ve özet alanları önceden yapılandırıldığı için sadece veriyi güncellemeniz yeterlidir.
          </p>
        </section>

        <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Örnek girdi / çıktı</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>
              <span className="font-semibold">Girdi:</span> Şablondaki örnek tabloyu kendi satış/stok/perf verinizle değiştirin.
            </li>
            <li>
              <span className="font-semibold">Çıktı:</span> Toplam, ortalama ve koşullu özet alanlar otomatik hesaplanır.
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800">Sık sorulan sorular</h2>
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Formüller zaten var mı?</span>
              <br />
              Evet. Şablon hücrelerinde TOPLA, ORTALAMA, EĞER, EĞERSAY gibi fonksiyonlar hazırdır.
            </p>
            <p>
              <span className="font-semibold">Excel’de Türkçe fonksiyon isimleri mi kullanılıyor?</span>
              <br />
              Dosya, Excel diline göre (Türkçe/İngilizce) fonksiyon adlarını uygun şekilde gösterecek şekilde tasarlanmıştır; mantık aynıdır.
            </p>
            <p>
              <span className="font-semibold">Veri alanlarını nasıl güncellerim?</span>
              <br />
              Örnek tablodaki değerleri değiştirin; sonuçlar alt özetlerde otomatik yenilenir.
            </p>
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Daha fazla rehber için{" "}
            <Link href="/blog/excel-rapor-sablonlari" className="underline" style={{ color: THEME.ribbon }}>
              rapor şablonları yazısına
            </Link>{" "}
            göz atabilirsiniz.
          </p>
        </section>

        {/* İndirilebilir şablonlar */}
        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-3">
            Şablonları indir
          </h2>
          <div className="space-y-3">
            {sablonlar.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{s.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{s.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(s.build, s.filename)}
                    className="flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: THEME.ribbon }}
                  >
                    İndir (.xlsx)
                  </button>
                </div>
              </div>
            ))}
            <div className="rounded-xl border-2 border-dashed border-emerald-400/50 bg-emerald-50/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">
                    Tümünü tek kitapta indir
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Haftalık Satış, Stok Özeti ve Performans sayfaları tek Excel
                    dosyasında.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      buildTumSablonlarTekKitap,
                      "Ofis-Akademi-Rapor-Sablonlari-Tumu.xlsx"
                    )
                  }
                  className="flex-shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Tek dosyada indir
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Örnek veri setleri */}
        <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-2">
            Örnek veri setleri
          </h2>
          <p className="text-sm text-slate-600">
            Her şablonda hemen deneyebileceğin örnek satırlar vardır. Hücreleri
            kendi verilerinle değiştirdiğinde formüller otomatik güncellenir.
            Yeni satır eklerken formülleri aşağı doğru kopyalamayı unutma (örn.{" "}
            <code className="rounded bg-slate-200 px-1">TOPLA(E2:E8)</code>{" "}
            aralığını E2:E20 gibi genişletebilirsin).
          </p>
        </section>

        {/* Hazır formüller */}
        <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-3">
            Şablonlarda kullanılan hazır formüller
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Excel Türkçe kurulumda fonksiyon adları Türkçe (TOPLA, EĞER), İngilizce
            kurulumda İngilizce (SUM, IF) görünür. Dosyada formül mantığı aynıdır.
          </p>
          <ul className="space-y-2">
            {hazirFormuller.map((f) => (
              <li
                key={f.tr}
                className="flex flex-wrap items-baseline gap-2 text-sm"
              >
                <span className="font-medium text-slate-800">{f.tr}</span>
                <span className="text-slate-500">({f.en})</span>
                <span className="text-slate-600">— {f.aciklama}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/rapor-sablonlari" />
        </div>
        <div className="pt-4 text-center text-xs text-slate-500">
          Ofis Akademi · Excel & Veri Analizi
        </div>
      </div>
    </div>
  );
}
