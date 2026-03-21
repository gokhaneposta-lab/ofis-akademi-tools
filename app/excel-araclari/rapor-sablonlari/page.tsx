"use client";

import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";
import { downloadWorkbook } from "@/lib/egitimExcelExport";
import {
  buildHaftalikSatisSablonu,
  buildStokOzetiSablonu,
  buildPerformansSablonu,
  buildTumSablonlarTekKitap,
} from "@/lib/raporSablonlari";

const ACCENT = "#217346";

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

function templateIcon(id: string) {
  const common = "h-10 w-10 shrink-0";
  switch (id) {
    case "haftalik-satis":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 19V5M4 19h16M8 15v-3m4 3V9m4 6v-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "stok":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 8h16v12H4V8zm2-3h12v3H6V5z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "performans":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 7v5l3 2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default function RaporSablonlariPage() {
  function handleDownload(
    build: () => ReturnType<typeof buildHaftalikSatisSablonu>,
    filename: string
  ) {
    const wb = build();
    downloadWorkbook(wb, filename);
  }

  const howToSteps = [
    "Aşağıdaki listeden istediğiniz şablonun yanındaki İndir butonuna tıklayın.",
    "Excel dosyası indirilir; kendi verinizi yazın veya örnek veriyi düzenleyin.",
    "Hazır formüller (TOPLA, ORTALAMA, EĞER vb.) zaten hücrelerde tanımlıdır.",
  ];

  const faq = [
    {
      question: "Formüller zaten var mı?",
      answer:
        "Evet. Şablon hücrelerinde TOPLA, ORTALAMA, EĞER, EĞERSAY gibi fonksiyonlar hazırdır.",
    },
    {
      question: "Excel’de Türkçe fonksiyon isimleri mi kullanılıyor?",
      answer:
        "Dosya, Excel diline göre (Türkçe/İngilizce) fonksiyon adlarını uygun şekilde gösterecek şekilde tasarlanmıştır; mantık aynıdır.",
    },
    {
      question: "Veri alanlarını nasıl güncellerim?",
      answer: "Örnek tablodaki değerleri değiştirin; sonuçlar alt özetlerde otomatik yenilenir.",
    },
  ];

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Haftalık satış, stok özeti ve performans raporları için hazır Excel şablonlarını indirmenizi sağlar. Şablonlarda formüller
        ve özet alanları önceden yapılandırıldığı için sadece veriyi güncellemeniz yeterlidir.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek girdi</p>
          <p className="text-gray-700">Şablondaki örnek tabloyu kendi satış/stok/perf verinizle değiştirin.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek çıktı</p>
          <p className="text-gray-700">Toplam, ortalama ve koşullu özet alanlar otomatik hesaplanır.</p>
        </div>
      </div>
    </>
  );

  const relatedLinks = (
    <p className="text-gray-600">
      Daha fazla rehber için{" "}
      <Link href="/blog/excel-rapor-sablonlari" className="font-medium underline" style={{ color: ACCENT }}>
        rapor şablonları yazısına
      </Link>{" "}
      göz atabilirsiniz.
    </p>
  );

  return (
    <ToolLayout
      title="Otomatik Rapor Şablonları"
      description="Haftalık satış, stok ve performans raporları için örnek veri setleri ve hazır formüller içeren Excel şablonlarını indirin."
      path="/excel-araclari/rapor-sablonlari"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={relatedLinks}
    >
      <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6">
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">Şablonları indir</h2>
            <p className="mt-1 text-sm text-gray-600">Her karttan tek şablonu veya alttan hepsini tek dosyada alabilirsiniz.</p>
          </div>
          <div className="space-y-4">
            {sablonlar.map((s) => (
              <article
                key={s.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div style={{ color: ACCENT }}>
                      {templateIcon(s.id)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900">{s.name}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(s.build, s.filename)}
                    className="w-full shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
                    style={{ backgroundColor: ACCENT }}
                  >
                    İndir (.xlsx)
                  </button>
                </div>
              </article>
            ))}

            <article className="rounded-2xl border border-dashed border-gray-300 bg-white p-4 shadow-md sm:p-5" style={{ borderColor: `${ACCENT}40` }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <div style={{ color: ACCENT }} className="shrink-0">
                    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M7 3h10v6H7V3zM5 11h14v10H5V11z"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Tümünü tek kitapta indir</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                      Haftalık Satış, Stok Özeti ve Performans sayfaları tek Excel dosyasında.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      buildTumSablonlarTekKitap,
                      "Ofis-Akademi-Rapor-Sablonlari-Tumu.xlsx"
                    )
                  }
                  className="w-full shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
                  style={{ backgroundColor: ACCENT }}
                >
                  Tek dosyada indir
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
          <h2 className="text-base font-semibold text-gray-900">Örnek veri setleri</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Her şablonda hemen deneyebileceğin örnek satırlar vardır. Hücreleri kendi verilerinle değiştirdiğinde formüller otomatik güncellenir.
            Yeni satır eklerken formülleri aşağı doğru kopyalamayı unutma (örn.{" "}
            <code className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-800">TOPLA(E2:E8)</code>{" "}
            aralığını E2:E20 gibi genişletebilirsin).
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-md sm:p-6">
          <h2 className="text-base font-semibold text-gray-900">Şablonlarda kullanılan hazır formüller</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Excel Türkçe kurulumda fonksiyon adları Türkçe (TOPLA, EĞER), İngilizce kurulumda İngilizce (SUM, IF) görünür. Dosyada formül mantığı aynıdır.
          </p>
          <ul className="mt-4 space-y-3">
            {hazirFormuller.map((f) => (
              <li
                key={f.tr}
                className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
              >
                <span className="font-medium text-gray-900">{f.tr}</span>
                <span className="text-gray-500">({f.en})</span>
                <span className="text-gray-600">— {f.aciklama}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ToolLayout>
  );
}
