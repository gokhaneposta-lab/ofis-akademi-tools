"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
const SEPARATORS = [
  { key: ";", label: ";" },
  { key: ",", label: "," },
  { key: "space", label: "Boşluk" }
];

/** Gösterge panelinde dönüşümlü gösterilecek Excel formülleri */
const DASHBOARD_FORMULAS = [
  "=TOPLA(E2:E31)",
  "=ORTALAMA(E2:E31)",
  "=MİN(E2:E31)",
  "=MAKS(E2:E31)",
  "=SAY(E2:E31)",
  "=EĞERSAY(E2:E31;\">0\")",
  "=ÇOKETOPLA(E2:E31;A2:A31;\"Satış\")",
  "=DÜŞEYARA(G2;A2:E31;5;0)",
];

/** Belirli aralıkta rastgele tam sayı */
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Rastgele sayıyı Türkçe para formatında (428.900₺) */
function formatCurrency(value: number) {
  return value.toLocaleString("tr-TR") + "₺";
}

/** Rastgele yüzde (örn. %18) */
function formatPercent(value: number, decimals = 0) {
  return "%" + value.toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

const trainingLevels = [
  {
    slug: "temel",
    badge: "SEVİYE 1 · TEMEL",
    title: "Hızlı Başlangıç & Temel Beceriler",
    bullets: [
      "Temel formüller: TOPLA, ORTALAMA, MİN, MAKS, EĞER",
      "Tablo yapısı, veri temizleme ve filtreleme",
      "Kısayollar ve hızlı biçimlendirme",
    ],
    accent: false,
  },
  {
    slug: "orta",
    badge: "SEVİYE 2 · ORTA",
    title: "İşte Gerçekten Kullandığın Formüller",
    bullets: [
      "DÜŞEYARA / XLOOKUP, İÇİÇE EĞER, VE, VEYA",
      "Koşullu toplama & sayma: EĞERSAY, ÇOKETOPLA, ÇOKEĞERSAY",
      "Metin fonksiyonları: SAĞ, SOL, PARÇAAL, BİRLEŞTİR, METNEBİRLEŞTİR",
    ],
    accent: true,
  },
  {
    slug: "ileri",
    badge: "SEVİYE 3 · İLERİ",
    title: "PivotTable, Dashboard & Veri Analizi",
    bullets: [
      "PivotTable ile özet raporlar ve dilimleyiciler",
      "Grafikler, mini grafikler ve gösterge panelleri",
      "Gelişmiş fonksiyonlar: FİLTRE, SIRALA, BENZERSİZ, DÜŞEYARA+EĞERHATA",
    ],
    accent: false,
  },
] as const;

type AboneStatus = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [formulaIndex, setFormulaIndex] = useState(0);
  const [toplamSatis, setToplamSatis] = useState(428900);
  const [aylikArtis, setAylikArtis] = useState(18);
  const [siparis, setSiparis] = useState(1274);
  const [iadeOrani, setIadeOrani] = useState(2.1);
  const [aboneEmail, setAboneEmail] = useState("");
  const [aboneStatus, setAboneStatus] = useState<AboneStatus>("idle");
  const [aboneError, setAboneError] = useState("");
  const [separator, setSeparator] = useState(";");

  // Formülü periyodik değiştir
  useEffect(() => {
    const t = setInterval(() => {
      setFormulaIndex((i) => (i + 1) % DASHBOARD_FORMULAS.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // Rakamları daha hızlı hafif rastgele değiştir (canlı hissi)
  useEffect(() => {
    const t = setInterval(() => {
      setToplamSatis((v) => Math.max(200000, v + randomInt(-8000, 8000)));
      setAylikArtis((v) => Math.max(5, Math.min(35, v + randomInt(-3, 3))));
      setSiparis((v) => Math.max(800, v + randomInt(-80, 80)));
      setIadeOrani((v) => Math.max(0.5, Math.min(5, v + (Math.random() - 0.5) * 0.8)));
    }, 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative min-h-screen max-w-[100vw] overflow-x-hidden bg-[#e9f5f1] text-slate-900">
      {/* Excel hücre grid arka plan */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0f172a 1px, transparent 1px),
            linear-gradient(to bottom, #0f172a 1px, transparent 1px)
          `,
          backgroundSize: "min(2rem, 3vw) min(2rem, 3vw)",
        }}
      />
      <main className="relative mx-auto flex min-h-screen w-full min-w-0 max-w-6xl flex-col px-4 py-10 sm:px-8 lg:px-12">
        {/* Hero */}
        <section className="grid flex-1 gap-10 py-8 sm:py-14 lg:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800 ring-1 ring-emerald-600/40">
              Ofis Akademi · Excel & Veri Analizi
            </span>

            <div className="space-y-4">
              <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Excel&apos;i <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">Gerçekten Öğren</span>
              </h1>
              <p className="max-w-xl text-balance text-base leading-relaxed text-slate-800 sm:text-lg">
                Formüllerle boğuşmayı bırak. Günlük iş akışlarında gerçekten
                kullandığın Excel ve veri analizi becerilerini, adım adım ve
                uygulamalı olarak öğren.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#free"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300"
              >
                Ücretsiz Öğrenmeye Başla
              </a>
              <a
                href="/egitimler"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-white/70 px-5 py-3 text-sm font-medium text-emerald-900 shadow-sm transition hover:bg-white hover:border-emerald-700"
              >
                Eğitim içeriklerini gör
              </a>
              <a
                href="/excel-araclari"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-white/70 px-5 py-3 text-sm font-medium text-emerald-900 shadow-sm transition hover:bg-white hover:border-emerald-700"
              >
                Excel Araçları
              </a>
              <a
                href="/blog"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-white/70 px-5 py-3 text-sm font-medium text-emerald-900 shadow-sm transition hover:bg-white hover:border-emerald-700"
              >
                Blog
              </a>
              <a
                href="/formul-kutuphanesi"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-white/70 px-5 py-3 text-sm font-medium text-emerald-900 shadow-sm transition hover:bg-white hover:border-emerald-700"
              >
                Formül Kütüphanesi
              </a>
              <a
                href="/finans-sigorta"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-600 bg-white/70 px-5 py-3 text-sm font-medium text-emerald-900 shadow-sm transition hover:bg-white hover:border-emerald-700"
              >
                Finans & Sigorta
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Gerçek ofis senaryoları
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Dosya + uygulama + mini alıştırmalar
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Sıfırdan ileri seviye
              </span>
            </div>
          </div>

          <div className="relative group/dashboard">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-tr from-emerald-500/30 via-sky-500/20 to-transparent blur-3xl" />
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-emerald-500/10 backdrop-blur transition-shadow duration-300 group-hover/dashboard:shadow-emerald-500/20">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                <span>Excel Gösterge Paneli</span>
                <span>Canlı Uygulama</span>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.2fr,0.9fr]">
                <div className="space-y-3 rounded-2xl bg-slate-950/60 p-4 ring-1 ring-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Satış Özeti</span>
                    <span className="font-mono tabular-nums transition-opacity duration-300" title="Dönen Excel formülleri">
                      {DASHBOARD_FORMULAS[formulaIndex]}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-200">
                    <div className="rounded-xl bg-emerald-500/10 p-3 transition-transform duration-300 ease-out group-hover/dashboard:scale-[1.03] origin-center">
                      <p className="text-[10px] text-slate-400">Toplam Satış</p>
                      <p className="mt-1 text-base font-semibold text-emerald-300 origin-bottom-left animate-[dashboard-number-pulse_1.2s_ease-in-out_infinite] tabular-nums">
                        {formatCurrency(toplamSatis)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-sky-500/10 p-3 transition-transform duration-300 ease-out group-hover/dashboard:scale-[1.03] origin-center">
                      <p className="text-[10px] text-slate-400">Aylık Artış</p>
                      <p className="mt-1 text-base font-semibold text-sky-300 origin-bottom-left animate-[dashboard-number-pulse_1.2s_ease-in-out_infinite_0.15s] tabular-nums">
                        {formatPercent(aylikArtis)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-violet-500/10 p-3 transition-transform duration-300 ease-out group-hover/dashboard:scale-[1.03] origin-center">
                      <p className="text-[10px] text-slate-400">Sipariş</p>
                      <p className="mt-1 text-base font-semibold text-violet-300 origin-bottom-left animate-[dashboard-number-pulse_1.2s_ease-in-out_infinite_0.3s] tabular-nums">
                        {siparis.toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-3 transition-transform duration-300 ease-out group-hover/dashboard:scale-[1.03] origin-center">
                      <p className="text-[10px] text-slate-400">İade Oranı</p>
                      <p className="mt-1 text-base font-semibold text-amber-300 origin-bottom-left animate-[dashboard-number-pulse_1.2s_ease-in-out_infinite_0.45s] tabular-nums">
                        {formatPercent(iadeOrani, 1)}
                      </p>
                    </div>
                  </div>
                  {/* Mini grafik – sürekli dalgalanma, hover gerekmez */}
                  <div className="mt-3 rounded-xl bg-slate-900/50 px-3 py-2">
                    <p className="text-[9px] text-slate-500 mb-1.5">Satış trendi</p>
                    <div className="flex items-end justify-between gap-0.5 h-10">
                      {[10, 6, 14, 8, 11, 5, 16, 9, 12, 7].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 flex-1 rounded-t bg-gradient-to-t from-emerald-500/70 to-sky-400/60 origin-bottom animate-[dashboard-bar-wave_1.4s_ease-in-out_infinite]"
                          style={{
                            height: `${h}px`,
                            minHeight: 4,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
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
                        Adım adım ücretsiz içerik
                      </span>
                      <span className="text-emerald-300">Temel · Orta · İleri</span>
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
              <p className="mt-2 max-w-xl text-base text-slate-700">
                Konular, ofiste yaşanan gerçek problemler üzerinden kurgulandı.
                Her bölüm, kendi dosyası ve egzersizleriyle birlikte gelir.
              </p>
              <p className="mt-2">
                <Link
                  href="/egitimler"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 underline underline-offset-2"
                >
                  Tüm Excel Eğitimleri sayfası →
                </Link>
              </p>
            </div>
            <div className="text-sm text-slate-600">
              Temelden ileri seviyeye net yol haritası
            </div>
          </div>

          <div className="mt-8 grid gap-[2px] md:grid-cols-3 border border-slate-300 rounded-xl overflow-hidden bg-slate-300 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)]" style={{ backgroundImage: "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)", backgroundSize: "1.5rem 1.5rem" }}>
            {trainingLevels.map((level) => (
              <Link
                key={level.slug}
                href={`/egitimler/${level.slug}`}
                className={`group flex flex-col gap-2 rounded-none p-5 ring-0 border border-slate-700/50 bg-slate-950/90 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-emerald-400/70 hover:z-10 ${
                  level.accent
                    ? "ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-900/30"
                    : "hover:bg-slate-900/95"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  {level.badge}
                </p>
                <h3 className="text-sm font-semibold text-slate-50">
                  {level.title}
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300">
                  {level.bullets.map((item) => (
                    <li key={item} className="flex gap-1.5">
                      <span className="mt-[3px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-3 text-[11px] font-medium text-emerald-300 group-hover:text-emerald-200">
                  Seviye detaylarını gör →
                </span>
              </Link>
            ))}
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
                Excel Araçları
              </h2>
              <p className="mt-2 max-w-xl text-base text-slate-700">
                Eğitimle birlikte gelen hazır dosya ve araçlar; hesaplama, metin,
                finans ve istatistik araçları günlük işte anında kullanıma hazır.
              </p>
              <p className="mt-2">
                <Link
                  href="/excel-araclari"
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 underline underline-offset-2"
                >
                  Tüm Excel Araçları sayfası →
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-[2px] md:grid-cols-3 border border-slate-300 rounded-xl overflow-hidden bg-slate-300" style={{ backgroundImage: "linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)", backgroundSize: "1.5rem 1.5rem" }}>
            <Link href="/excel-araclari/rapor-sablonlari" className="flex flex-col justify-between gap-3 rounded-none bg-slate-950/90 p-5 border border-slate-700/50 hover:border-slate-600/50 transition">
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
            </Link>

            <Link href="/excel-araclari/hata-kontrol-checklist" className="flex flex-col justify-between gap-3 rounded-none bg-slate-950/90 p-5 border border-slate-700/50 hover:border-slate-600/50 transition">
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
            </Link>

            <Link href="/excel-araclari/ksayol-formul-kartlari" className="flex flex-col justify-between gap-3 rounded-none bg-slate-950/90 p-5 border border-slate-700/50 hover:border-slate-600/50 transition">
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
            </Link>
          </div>
        </section>

        {/* Free learning CTA */}
        <section
          id="free"
          className="border-t border-slate-800/80 py-10 sm:py-14"
        >
          <div className="grid gap-[2px] rounded-2xl overflow-hidden border border-slate-300 bg-slate-200/80 sm:grid-cols-[minmax(0,1.5fr),minmax(0,1fr)]" style={{ backgroundImage: "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)", backgroundSize: "1.5rem 1.5rem" }}>
            <div className="space-y-4 rounded-none border border-slate-300/80 bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-transparent p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-800 sm:text-2xl">
                Ücretsiz Excel öğrenme alanı
              </h2>
              <p className="text-base text-slate-700 leading-relaxed">
                İlk adımlar tamamen ücretsiz. Metin anlatımlar, uygulama dosyaları
                ve kısa alıştırmalarla Excel&apos;de güçlü bir temel kur.
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                <li>· Adım adım konular (temel, orta, ileri)</li>
                <li>· Uygulamalı örnek Excel dosyaları</li>
                <li>· Temel formüller için hızlı rehber</li>
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-none border border-slate-300/80 bg-slate-100/50 p-6 sm:p-8">
              <div className="rounded-xl border border-slate-300 bg-slate-950/90 p-4 text-sm ring-1 ring-slate-700">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">
                  Ücretsiz Katıl
                </p>
                <p className="mt-2 text-xs text-slate-200">
                  E-posta bırak, başlangıç setine (Excel linkleri) e-posta ile ulaş.
                </p>
                {aboneStatus === "success" ? (
                  <div className="mt-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-2 text-xs text-emerald-200">
                    E-postanı gönderdik. Gelen kutunu kontrol et; Excel seti linkleri orada.
                  </div>
                ) : (
                  <form
                    className="mt-3 flex flex-col gap-3 sm:flex-row"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!aboneEmail.trim()) return;
                      setAboneStatus("loading");
                      setAboneError("");
                      try {
                        const res = await fetch("/api/abone", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: aboneEmail.trim() }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          setAboneError(data.error ?? "Bir hata oluştu.");
                          setAboneStatus("error");
                          return;
                        }
                        setAboneStatus("success");
                        setAboneEmail("");
                      } catch {
                        setAboneError("Bağlantı hatası. Lütfen tekrar dene.");
                        setAboneStatus("error");
                      }
                    }}
                  >
                    <input
                      type="email"
                      required
                      value={aboneEmail}
                      onChange={(e) => setAboneEmail(e.target.value)}
                      placeholder="ornek@eposta.com"
                      disabled={aboneStatus === "loading"}
                      className="h-10 flex-1 rounded-full border border-slate-700 bg-slate-900 px-3 text-xs text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={aboneStatus === "loading"}
                      className="h-10 rounded-full bg-emerald-400 px-5 text-xs font-semibold text-slate-950 shadow shadow-emerald-500/30 transition hover:bg-emerald-300 disabled:opacity-60"
                    >
                      {aboneStatus === "loading" ? "Gönderiliyor…" : "Ücretsiz Başla"}
                    </button>
                  </form>
                )}
                {aboneStatus === "error" && aboneError && (
                  <p className="mt-2 text-[11px] text-red-300">{aboneError}</p>
                )}
                <p className="mt-2 text-[11px] text-slate-400">
                  Spam yok. Sadece Excel ve veri analizi için pratik içerikler.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
