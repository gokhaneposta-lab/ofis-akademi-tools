"use client";
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 sm:px-8 lg:px-12">
        {/* Hero */}
        <section className="grid flex-1 gap-10 py-8 sm:py-14 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300 ring-1 ring-emerald-400/30">
              Ofis Akademi · Excel & Veri Analizi
            </span>

            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Excel&apos;i <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">Gerçekten Öğren</span>
              </h1>
              <p className="max-w-xl text-balance text-sm leading-relaxed text-slate-300 sm:text-base">
                Formüllerle boğuşmayı bırak. Günlük iş akışlarında gerçekten
                kullandığın Excel ve veri analizi becerilerini, adım adım ve
                uygulamalı olarak öğren.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#free"
                className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300"
              >
                Ücretsiz Öğrenmeye Başla
              </a>
              <a
                href="#topics"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900/60"
              >
                Eğitim içeriklerini gör
              </a>
              <a
                href="/tools"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900/60"
              >
                Excel Araçları
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Gerçek ofis senaryoları
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Dosya + video + mini quizler
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Sıfırdan ileri seviye
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-emerald-500/30 via-sky-500/20 to-transparent blur-3xl" />
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-emerald-500/10 backdrop-blur">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                <span>Excel Gösterge Paneli</span>
                <span>Canlı Uygulama</span>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.2fr,0.9fr]">
                <div className="space-y-3 rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Satış Özeti</span>
                    <span>=TOPLA(E2:E31)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-200">
                    <div className="rounded-xl bg-emerald-500/10 p-3">
                      <p className="text-[10px] text-slate-400">Toplam Satış</p>
                      <p className="mt-1 text-base font-semibold text-emerald-300">
                        428.900₺
                      </p>
                    </div>
                    <div className="rounded-xl bg-sky-500/10 p-3">
                      <p className="text-[10px] text-slate-400">Aylık Artış</p>
                      <p className="mt-1 text-base font-semibold text-sky-300">
                        %18
                      </p>
                    </div>
                    <div className="rounded-xl bg-violet-500/10 p-3">
                      <p className="text-[10px] text-slate-400">Sipariş</p>
                      <p className="mt-1 text-base font-semibold text-violet-300">
                        1.274
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-3">
                      <p className="text-[10px] text-slate-400">İade Oranı</p>
                      <p className="mt-1 text-base font-semibold text-amber-300">
                        %2,1
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 h-20 rounded-xl bg-gradient-to-r from-emerald-500/20 via-sky-500/10 to-transparent" />
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800">
                    <p className="text-[11px] font-medium text-slate-200">
                      Öğreneceğin Şeyler
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[11px] text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Temel & ileri formüller
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Tablo, PivotTable & grafik
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Raporlama & gösterge panelleri
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-500/30 to-sky-500/40 p-[1px]">
                    <div className="flex items-center justify-between rounded-[1rem] bg-slate-950/90 px-4 py-3 text-[11px] text-slate-200">
                      <span className="font-medium">
                        7 günde Excel akışını kur
                      </span>
                      <span className="text-emerald-300">Ücretsiz mini program</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Excel training topics */}
        <section
          id="topics"
          className="border-t border-slate-800/80 py-10 sm:py-14"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Excel eğitim içerikleri
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Konular, ofiste yaşanan gerçek problemler üzerinden kurgulandı.
                Her bölüm, kendi dosyası ve egzersizleriyle birlikte gelir.
              </p>
            </div>
            <div className="text-xs text-slate-400">
              Temelden ileri seviyeye net yol haritası
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-2xl bg-slate-950/70 p-5 ring-1 ring-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Seviye 1 · Temel
              </p>
              <h3 className="text-sm font-semibold text-slate-50">
                Hızlı Başlangıç & Temel Beceriler
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                <li>- Arayüz, kısayollar, hızlı formatlama</li>
                <li>- Temel formüller: TOPLA, ORTALAMA, EĞER</li>
                <li>- Veri temizleme & filtreleme</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl bg-slate-950/80 p-5 ring-1 ring-emerald-500/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Seviye 2 · Uygulamalı
              </p>
              <h3 className="text-sm font-semibold text-slate-50">
                İşte Gerçekten Kullandığın Formüller
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                <li>- DÜŞEYARA/XLOOKUP, İÇİÇE EĞER, METİN fonksiyonları</li>
                <li>- Tarih, saat ve finans fonksiyonları</li>
                <li>- Hata yakalama ve sağlam modeller kurma</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl bg-slate-950/70 p-5 ring-1 ring-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Seviye 3 · Analiz
              </p>
              <h3 className="text-sm font-semibold text-slate-50">
                PivotTable, Dashboard & Veri Analizi
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                <li>- Tablo yapısı, gelişmiş sıralama & filtreleme</li>
                <li>- PivotTable ile özet raporlar</li>
                <li>- Grafikler & görsel gösterge panelleri</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Excel tools */}
        <section
          id="tools"
          className="border-t border-slate-800/80 py-10 sm:py-14"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Faydalı Excel araçları
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300">
                Eğitimle birlikte gelen hazır dosya ve araçlar, günlük iş
                hayatında direkt kullanabileceğin şekilde tasarlandı.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-950/70 p-5 ring-1 ring-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-50">
                  Otomatik Rapor Şablonları
                </h3>
                <p className="mt-2 text-xs text-slate-300">
                  Haftalık satış, stok ve performans raporlarını tek tuşla
                  güncelleyebileceğin Excel şablonları.
                </p>
              </div>
              <p className="text-[11px] font-medium text-emerald-300">
                · Örnek veri setleri · Hazır formüller
              </p>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-950/80 p-5 ring-1 ring-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-50">
                  Hata Kontrol Checklist&apos;i
                </h3>
                <p className="mt-2 text-xs text-slate-300">
                  Dosya teslim etmeden önce kontrol edebileceğin,
                  formül/bağlantı/hücre güvenliği checklist&apos;i.
                </p>
              </div>
              <p className="text-[11px] font-medium text-emerald-300">
                · Yaygın tuzaklar · Pratik çözümler
              </p>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-950/70 p-5 ring-1 ring-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-slate-50">
                  Kısayol & Formül Kartları
                </h3>
                <p className="mt-2 text-xs text-slate-300">
                  En çok kullanılan kısayol ve formülleri tek sayfada
                  toplayan mini PDF kartlar.
                </p>
              </div>
              <p className="text-[11px] font-medium text-emerald-300">
                · Yazdırılabilir · Masana asılabilir
              </p>
            </div>
          </div>
        </section>

        {/* Free learning CTA */}
        <section
          id="free"
          className="border-t border-slate-800/80 py-10 sm:py-14"
        >
          <div className="grid gap-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-sky-500/10 to-transparent p-6 ring-1 ring-emerald-500/40 sm:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)] sm:p-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold sm:text-2xl">
                Ücretsiz Excel öğrenme alanı
              </h2>
              <p className="text-sm text-slate-100">
                İlk adımlar tamamen ücretsiz. Mini videolar, uygulama dosyaları
                ve kısa quizlerle, Excel&apos;de güçlü bir temel kur.
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-100/90">
                <li>· 7 günlük giriş programı</li>
                <li>· 10+ uygulamalı örnek dosya</li>
                <li>· Temel formüller için hızlı rehber</li>
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div className="rounded-2xl bg-slate-950/70 p-4 text-sm text-slate-100 ring-1 ring-emerald-500/40">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">
                  Ücretsiz Katıl
                </p>
                <p className="mt-2 text-xs text-slate-200">
                  E-posta bırak, başlangıç setine direkt eriş.
                </p>
                <form
                  className="mt-3 flex flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <input
                    type="email"
                    required
                    placeholder="ornek@eposta.com"
                    className="h-10 flex-1 rounded-full border border-slate-700 bg-slate-900 px-3 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-full bg-emerald-400 px-5 text-xs font-semibold text-slate-950 shadow shadow-emerald-500/30 transition hover:bg-emerald-300"
                  >
                    Ücretsiz Başla
                  </button>
                </form>
                <p className="mt-2 text-[10px] text-slate-400">
                  Spam yok. Sadece Excel ve veri analizi için pratik içerikler.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-800/80 py-6 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>© {new Date().getFullYear()} Ofis Akademi</span>
            <span className="text-slate-600">
              Excel & veri analizi ile ofis hayatını kolaylaştır.
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
