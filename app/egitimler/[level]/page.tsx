"use client";

import Link from "next/link";

const levelConfig = {
  temel: {
    slug: "temel",
    label: "Seviye 1 · Temel",
    title: "Temel Excel Akışı",
    description:
      "Excel'e yeni başlayanlar veya temellerini sağlamlaştırmak isteyenler için. Günlük ofis işlerinde en çok kullandığın temel fonksiyonları, tablo yapısını ve veri temizlemeyi öğrenirsin.",
    target: "Excel'e yeni başlayanlar veya temellerini toparlamak isteyenler",
    focus: [
      "Temel hesaplama fonksiyonları ile güvenilir toplamalar ve ortalamalar",
      "EĞER ile basit karar mekanizmaları kurma",
      "Tablo yapısı, filtreleme ve sıralama ile veriyi okunur hale getirme",
    ],
    functionGroups: [
      {
        title: "Temel Hesaplama Fonksiyonları",
        description:
          "Günlük raporlar, özet tablolar ve hızlı kontroller için en çok kullanılan fonksiyonlar.",
        functions: [
          {
            name: "TOPLA",
            use: "Seçili hücre aralığındaki sayıları toplar.",
          },
          {
            name: "ORTALAMA",
            use: "Bir sayı grubunun aritmetik ortalamasını alır.",
          },
          {
            name: "MİN / MAKS",
            use: "Bir aralıktaki en küçük ve en büyük değeri bulur.",
          },
          {
            name: "SAY",
            use: "Sayı içeren hücrelerin sayısını verir.",
          },
        ],
      },
      {
        title: "Karar & Mantık Fonksiyonları",
        description:
          "Basit kurallara göre çıktılar üretmek ve hataları daha iyi yönetmek için.",
        functions: [
          {
            name: "EĞER",
            use: "Bir koşul doğruysa A, yanlışsa B sonucunu döndürür.",
          },
          {
            name: "VE / VEYA (giriş)",
            use: "Birden fazla koşulu aynı anda kontrol etmeye giriş seviyesi.",
          },
          {
            name: "EĞERHATA (giriş)",
            use: "Formül hata verdiğinde daha okunabilir bir çıktı üretir.",
          },
        ],
      },
      {
        title: "Tablo, Filtre ve Temel Metin",
        description:
          "Veriyi tabloya dönüştürerek ve basit metin fonksiyonları ile temizleyerek analize hazır hale getirirsin.",
        functions: [
          {
            name: "Tabloya Dönüştür (Ctrl+T)",
            use: "Dinamik tablo yapısı, filtre ve sıralama için temel adım.",
          },
          {
            name: "FİLTRELE / SIRALA (arayüz)",
            use: "Listeyi istediğin kritere göre daraltır veya sıralar.",
          },
          {
            name: "SAĞ / SOL / UZUNLUK (giriş)",
            use: "Hücredeki metnin belirli kısımlarını almak veya uzunluğunu ölçmek için.",
          },
        ],
      },
    ],
  },
  orta: {
    slug: "orta",
    label: "Seviye 2 · Orta",
    title: "İş Hayatında En Çok Kullandığın Formüller",
    description:
      "Raporlarını otomatikleştirmek, listeler arasında arama yapmak ve koşullu özetler kurmak için gereken orta seviye fonksiyonlar.",
    target:
      "Excel'i aktif kullanan, raporlarını daha otomatik ve hatasız hale getirmek isteyenler",
    focus: [
      "Farklı listeler arasında veri çekme (müşteri, ürün, satış vb.)",
      "Koşullu toplama ve sayma ile otomatik özetler",
      "Metin fonksiyonlarıyla veriyi temiz ve analiz edilebilir hale getirme",
    ],
    functionGroups: [
      {
        title: "Arama & Getirme Fonksiyonları",
        description:
          "Farklı sayfalardaki veya tablolardaki verileri tek bir raporda birleştirirsin.",
        functions: [
          {
            name: "DÜŞEYARA",
            use: "Bir anahtara göre tablodan ilgili bilgiyi çeker.",
          },
          {
            name: "XLOOKUP",
            use: "DÜŞEYARA'nın daha esnek, modern ve hata toleranslı versiyonu.",
          },
          {
            name: "İNDİS + KAÇINCI",
            use: "Daha esnek arama senaryoları için ikili kombinasyon.",
          },
        ],
      },
      {
        title: "Koşullu Toplama & Sayma",
        description:
          "Sadece belirli kritere uyan satırları saymak veya toplamak için.",
        functions: [
          {
            name: "EĞERSAY",
            use: "Tek bir koşulu sağlayan hücreleri sayar.",
          },
          {
            name: "ÇOKETOPLA",
            use: "Birden fazla kritere göre toplam alır.",
          },
          {
            name: "ÇOKEĞERSAY",
            use: "Birden fazla koşulu sağlayan satırların sayısını bulur.",
          },
        ],
      },
      {
        title: "Metinle Çalışma",
        description:
          "CRM, ERP veya dış sistemlerden gelen karışık metinleri temizlemek için.",
        functions: [
          {
            name: "SAĞ / SOL / PARÇAAL",
            use: "Metnin belirli kısmını çekmek için.",
          },
          {
            name: "BİRLEŞTİR / METNEBİRLEŞTİR",
            use: "Birden fazla hücredeki metni tek hücrede birleştirir.",
          },
          {
            name: "UZUNLUK",
            use: "Metin uzunluğunu kontrol ederek veri kalitesini ölçmek için.",
          },
        ],
      },
      {
        title: "Tarih & Saat Fonksiyonları",
        description:
          "Satış, abonelik, vade ve performans analizleri için tarih bazlı hesaplamalar.",
        functions: [
          {
            name: "BUGÜN / ŞİMDİ",
            use: "Raporlarını güncel tarihe göre dinamik hale getirir.",
          },
          {
            name: "GÜN / AY / YIL",
            use: "Tarih içinden istediğin bileşeni çekmek için.",
          },
          {
            name: "EDATE (giriş)",
            use: "Belirli bir tarihe ay ekleyerek vade/son tarih hesaplar.",
          },
        ],
      },
    ],
  },
  ileri: {
    slug: "ileri",
    label: "Seviye 3 · İleri",
    title: "PivotTable, Dashboard & Veri Analizi",
    description:
      "Büyük veri setleriyle çalışıp, yönetime sunabileceğin gösterge panelleri ve etkileşimli raporlar hazırlamak için.",
    target:
      "Raporlama, finans, satış, operasyon gibi alanlarda düzenli rapor üreten ve analiz yapanlar",
    focus: [
      "PivotTable ile esnek özet raporlar ve kırılımlar",
      "Dashboard mantığıyla tek sayfada net özetler hazırlama",
      "Gelişmiş fonksiyonlarla dinamik analiz alanları oluşturma",
    ],
    functionGroups: [
      {
        title: "PivotTable ve Özetleme",
        description:
          "Ham veriyi bozmadan farklı bakış açılarıyla analiz etmeni sağlar.",
        functions: [
          {
            name: "PivotTable",
            use: "Sürükle-bırak mantığı ile esnek özet tablolar kurar.",
          },
          {
            name: "Dilimleyiciler & Zaman Çizelgesi",
            use: "Raporu filtrelemek için etkileşimli butonlar ekler.",
          },
          {
            name: "Hesaplanan Alan (giriş)",
            use: "Pivot içinde ek formüllerle özel metrikler üretir.",
          },
        ],
      },
      {
        title: "Dinamik Dizi & Gelişmiş Fonksiyonlar",
        description:
          "Büyük listelerde otomatik filtreleme, sıralama ve benzersiz değer analizi için.",
        functions: [
          {
            name: "FİLTRE",
            use: "Belirli kritere uyan satırları dinamik olarak süzer.",
          },
          {
            name: "SIRALA",
            use: "Sonuç listesini artan/azalan şekilde sıralar.",
          },
          {
            name: "BENZERSİZ",
            use: "Tekrarsız liste çıkararak müşteri/ürün/kanal listeleri oluşturur.",
          },
        ],
      },
      {
        title: "Hata Yönetimi & Kombinasyonlar",
        description:
          "Gerçek ofis dosyalarında sık görülen karmaşık ama pratik kombinasyonlar.",
        functions: [
          {
            name: "DÜŞEYARA + EĞERHATA",
            use: "Bulunamayan kayıtlar için daha okunabilir sonuçlar verir.",
          },
          {
            name: "İÇİÇE EĞER (ileri seviye)",
            use: "Birden fazla skala veya segment kuralını tek formülde toplar.",
          },
          {
            name: "VE / VEYA ile çoklu koşullar",
            use: "Raporlarında daha ince filtreler ve sinyaller kurmak için.",
          },
        ],
      },
    ],
  },
} as const;

type LevelKey = keyof typeof levelConfig;

export default function TrainingLevelPage({
  params,
}: {
  params: { level: string };
}) {
  const config = levelConfig[params.level as LevelKey];

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 text-xs text-slate-400">
            <Link href="/" className="text-emerald-300 hover:text-emerald-200">
              Anasayfa
            </Link>{" "}
            <span className="mx-1">/</span>
            <span>Bilinmeyen eğitim seviyesi</span>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h1 className="text-lg font-semibold text-slate-50">
              Bu eğitim seviyesi bulunamadı.
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Lütfen adres çubuğundaki seviyeyi kontrol edin veya{" "}
              <Link
                href="/#topics"
                className="text-emerald-300 underline-offset-2 hover:underline"
              >
                Excel eğitim içerikleri
              </Link>{" "}
              bölümünden tekrar seçim yapın.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-4">
          <div className="text-xs text-slate-400">
            <Link href="/" className="text-emerald-300 hover:text-emerald-200">
              Anasayfa
            </Link>
            <span className="mx-1">/</span>
            <Link
              href="/#topics"
              className="text-emerald-300 hover:text-emerald-200"
            >
              Excel eğitim içerikleri
            </Link>
            <span className="mx-1">/</span>
            <span>{config.label}</span>
          </div>

          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300 ring-1 ring-emerald-400/30">
            {config.label}
          </span>

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {config.title}
            </h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              {config.description}
            </p>
          </div>

          <div className="grid gap-3 text-xs text-slate-200 sm:grid-cols-[minmax(0,1.2fr),minmax(0,1fr)] sm:text-sm">
            <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Kimler için?
              </h2>
              <p className="mt-2 text-xs text-slate-200 sm:text-sm">
                {config.target}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Bu seviyede odaklanacağın şeyler
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-200 sm:text-sm">
                {config.focus.map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <span className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </header>

        <section className="flex-1 space-y-6">
          {config.functionGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-2xl bg-slate-950/70 p-5 ring-1 ring-slate-800"
            >
              <h2 className="text-sm font-semibold text-slate-50 sm:text-base">
                {group.title}
              </h2>
              <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
                {group.description}
              </p>
              <div className="mt-3 grid gap-3 text-xs text-slate-200 sm:text-sm md:grid-cols-2">
                {group.functions.map((fn) => (
                  <div
                    key={fn.name}
                    className="rounded-xl bg-slate-950/70 p-3 ring-1 ring-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                        {fn.name}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-200 sm:text-xs">
                      {fn.use}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

