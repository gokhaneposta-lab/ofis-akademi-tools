"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";

const ACCENT = "#217346";

const STORAGE_KEY = "ofis-akademi-hata-kontrol-checklist";

type ChecklistItem = {
  id: string;
  label: string;
  tip?: string;
  excelYol?: string;
};

const sections: { title: string; items: ChecklistItem[] }[] = [
  {
    title: "Formüller",
    items: [
      {
        id: "formul-hata-hucreleri",
        label: "#DEĞER!, #YOK, #AD?, #SAYI/0 gibi hata hücreleri yok",
        tip: "Sayfada Ctrl+G → Özel → Formüller → Hatalar ile tüm hata hücrelerini seçebilirsin.",
        excelYol: "Giriş → Bul ve Seç → Özel Git → Formüller → Hatalar",
      },
      {
        id: "dongusel-referans",
        label: "Döngüsel referans uyarısı yok",
        tip: "Formül kendi hücresine veya zincirleme kendine bağlanıyorsa Excel uyarır. Formüller → Hata Denetimi ile kontrol et.",
        excelYol: "Formüller → Hata Denetimi",
      },
      {
        id: "bos-referans",
        label: "Silinmiş sütun/satır referansı (#BAŞV! veya #REF!) yok",
        tip: "Sütun/satır sildiysen formüllerdeki referanslar bozulur. Tüm sayfada #BAŞV! ara.",
      },
      {
        id: "tarih-sayi-format",
        label: "Tarih ve sayılar doğru formatta (sayı olarak, metin değil)",
        tip: "Metin olarak girilen sayılar toplam/ortalama almaz. Hücreyi sayı formatına çevir veya SAYIYAÇEVİR kullan.",
      },
    ],
  },
  {
    title: "Bağlantılar",
    items: [
      {
        id: "dis-baglanti",
        label: "Dış dosya bağlantıları bilinçli (gerekmiyorsa kaldırıldı)",
        tip: "Veri → Bağlantıları Düzenle ile dış bağlantıları gör. Teslim edeceğin dosyada başka PC’de açılmayan yollar olabilir.",
        excelYol: "Veri → Bağlantıları Düzenle",
      },
      {
        id: "kirik-link",
        label: "Kırık veya “güvenlik uyarısı” veren bağlantı yok",
        tip: "Dosyayı açınca “Bağlantıları Güncelle” veya “Güvenlik Uyarısı” çıkıyorsa bağlantıları gözden geçir.",
      },
    ],
  },
  {
    title: "Hücre ve sayfa güvenliği",
    items: [
      {
        id: "duzenlenecek-hucreler",
        label: "Sadece düzenlenmesi gereken hücreler kilitsiz",
        tip: "Varsayılan olarak tüm hücreler kilitli. Düzenlenebilir olmasını istediğin hücreleri seç → Sağ tık → Hücreleri Biçimlendir → Koruma → Kilitli işaretini kaldır. Sonra sayfayı koru.",
        excelYol: "Giriş → Biçim → Hücreleri Koruma",
      },
      {
        id: "sayfa-koruma",
        label: "Sayfa koruması (şifre) gerekiyorsa doğru uygulandı",
        tip: "Gözden Geçir → Sayfayı Koru. Sadece formül hücrelerini kilitleyip kullanıcının sadece belirli alanları doldurmasını sağlayabilirsin.",
        excelYol: "Gözden Geçir → Sayfayı Koru",
      },
      {
        id: "gizli-satir-sutun",
        label: "Gizli satır/sütun varsa bilinçli (gereksiz gizliler kaldırıldı)",
        tip: "Gizli satır/sütunlar yazdırmada veya kopyalamada karışıklık yaratabilir. Gerek yoksa göster.",
      },
    ],
  },
  {
    title: "Genel ve teslim öncesi",
    items: [
      {
        id: "gereksiz-sayfalar",
        label: "Boş veya deneme sayfaları silindi",
        tip: "Sadece kullanılacak sayfaları bırak; “Sayfa1 (2)” gibi kopyaları temizle.",
      },
      {
        id: "yazdirma-alani",
        label: "Yazdırma alanı / sayfa sonları uygun (isteğe bağlı)",
        tip: "Sayfa Düzeni → Yazdırma Alanı ve Sayfa Sonları ile kontrol et.",
        excelYol: "Sayfa Düzeni → Yazdırma Alanı",
      },
      {
        id: "grafik-etiket",
        label: "Grafiklerde başlık ve eksen etiketleri anlaşılır",
        tip: "Grafik teslim edilecekse “Başlık 1” yerine anlamlı başlık koy.",
      },
    ],
  },
];

function getDefaultChecked(): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  sections.forEach((s) =>
    s.items.forEach((i) => {
      out[i.id] = false;
    })
  );
  return out;
}

function loadChecked(): Record<string, boolean> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return null;
  }
}

function saveChecked(checked: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  } catch {
    // ignore
  }
}

export default function HataKontrolChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>(getDefaultChecked);
  const [mounted, setMounted] = useState(false);

  const howToSteps = [
    "Excel dosyanızı teslim etmeden önce bu maddeleri sırayla kontrol edin.",
    "Her maddeyi tamamladıkça işaretleyin; ilerleme otomatik kaydedilir.",
    "İpucu ve Excel yolu olan maddelerde detayı görmek için genişletin.",
  ];

  const faq = [
    {
      question: "İşaretler kaydediliyor mu?",
      answer: "Evet, yalnızca bu cihaz/tarayıcıda ilerleme kaydedilir.",
    },
    {
      question: "Excel yolu ne işe yarar?",
      answer: "Her madde için nereden kontrol edeceğini kısaca gösterir.",
    },
    {
      question: "Her dosyada şart mı?",
      answer: "Özellikle rapor ve büyük veri içeren dosyalarda hata riskini azaltır.",
    },
  ];

  const aboutContent = (
    <>
      <p className="text-sm leading-relaxed text-gray-700">
        Dosya tesliminden önce en sık görülen hataları hızlıca gözden geçirmek için kullanılır. Boş hücre, tekrar, yanlış veri tipi/format ve bağlantı-güvenlik gibi konuları tek bir checklist’te toplar.
      </p>
      <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50/90 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Örnek kullanım</p>
        <ol className="mt-2 list-inside list-decimal space-y-2 text-sm text-gray-700">
          <li>Formüllerde hata (#YOK, #DEĞER!, #BAŞV! gibi) var mı kontrol et.</li>
          <li>Tarih/sayı metin karışımı gibi veri tipi sorunlarını işaretle.</li>
          <li>Dış bağlantılar/kırık linkler gibi teslim öncesi riskleri gözden geçir.</li>
        </ol>
      </div>
    </>
  );

  useEffect(() => {
    setMounted(true);
    const saved = loadChecked();
    if (saved) setChecked((prev) => ({ ...getDefaultChecked(), ...saved }));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveChecked(checked);
  }, [checked, mounted]);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function clearAll() {
    setChecked(getDefaultChecked());
  }

  const total = sections.reduce((acc, s) => acc + s.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <ToolLayout
      title="Hata Kontrol Checklist'i"
      description="Dosya teslim etmeden önce formül, bağlantı ve hücre güvenliği kontrollerini adım adım işaretle."
      path="/excel-araclari/hata-kontrol-checklist"
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-sm text-gray-600">
          Daha detaylı rehber:{" "}
          <Link
            href="/blog/excel-hata-kontrol-checklist"
            className="font-medium underline underline-offset-2"
            style={{ color: ACCENT }}
          >
            hata kontrol checklist yazısı
          </Link>
        </span>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-4 pt-2 sm:px-6 sm:space-y-8 sm:pb-6 sm:pt-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold tabular-nums text-gray-900">{done}</span>
              <span className="text-gray-500"> / {total} madde tamamlandı</span>
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-800 hover:underline"
            >
              Tümünü temizle
            </button>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: total ? `${(done / total) * 100}%` : "0%",
                backgroundColor: ACCENT,
              }}
            />
          </div>
        </div>

        {sections.map((section) => (
          <section key={section.title} className="space-y-3 sm:space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-gray-900 sm:text-base">{section.title}</h2>
            <ul className="space-y-3">
              {section.items.map((item) => {
                const isDone = checked[item.id] ?? false;
                return (
                  <li key={item.id}>
                    <div
                      className={[
                        "rounded-2xl border p-4 shadow-sm transition-colors sm:p-5",
                        isDone
                          ? "border-emerald-200/90 bg-emerald-50/50 ring-1 ring-emerald-100"
                          : "border-gray-200 bg-white ring-1 ring-black/[0.04]",
                      ].join(" ")}
                    >
                      <label className="flex cursor-pointer gap-3 sm:gap-4">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(item.id)}
                          className="mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 text-emerald-600 accent-emerald-600 focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-0"
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <span
                            className={
                              isDone
                                ? "block text-sm font-medium leading-snug text-gray-400 line-through decoration-gray-300"
                                : "block text-sm font-medium leading-snug text-gray-900"
                            }
                          >
                            {item.label}
                          </span>
                          {(item.tip || item.excelYol) && (
                            <div className="space-y-1.5 text-xs leading-relaxed text-gray-600 sm:text-sm">
                              {item.tip && <p>{item.tip}</p>}
                              {item.excelYol && (
                                <p className="rounded-lg bg-gray-100/90 px-2.5 py-1.5 text-gray-600">
                                  <span className="font-medium text-gray-500">Excel: </span>
                                  {item.excelYol}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 shadow-sm ring-1 ring-amber-100/80 sm:p-5">
          <h2 className="text-sm font-semibold text-amber-950 sm:text-base">Yaygın tuzaklar · Kısa çözümler</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-amber-900/90">
            <li>
              <strong className="font-semibold text-amber-950">#YOK</strong> → DÜŞEYARA/YATAYARA eşleşmedi; EĞERHATA ile “-” veya metin ver.
            </li>
            <li>
              <strong className="font-semibold text-amber-950">#DEĞER!</strong> → Metin ile sayı karıştı; SAYIYAÇEVİR veya doğru veri tipi kullan.
            </li>
            <li>
              <strong className="font-semibold text-amber-950">#BAŞV!</strong> → Sütun/satır silindi; formülü düzelt veya sabit aralık kullan ($).
            </li>
            <li>
              <strong className="font-semibold text-amber-950">Dış bağlantı uyarısı</strong> → Veri → Bağlantıları Düzenle → Kaldır veya yolu güncelle.
            </li>
            <li>
              <strong className="font-semibold text-amber-950">Yanlış toplam</strong> → Gizli satırlar dahil; Görünüm → Gizli satırları göster/kaldır veya ALT+= ile TOPLA kontrol et.
            </li>
          </ul>
        </section>
      </div>
    </ToolLayout>
  );
}
