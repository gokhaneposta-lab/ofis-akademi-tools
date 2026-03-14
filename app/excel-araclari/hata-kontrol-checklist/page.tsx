"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import { THEME } from "@/lib/theme";

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
    <div
      className="min-h-screen bg-[#e2e8ec]"
      style={{ fontFamily: THEME.font }}
    >
      <PageRibbon
        title="Hata Kontrol Checklist'i"
        description="Dosya teslim etmeden önce formül, bağlantı ve hücre güvenliği kontrollerini adım adım işaretle."
      >
        <Link
          href="/excel-araclari"
          className="ml-auto text-sm font-medium text-white/90 hover:text-white underline"
        >
          ← Excel Araçları
        </Link>
      </PageRibbon>

      <div className="mx-4 mt-6 mb-10 max-w-3xl space-y-8">
        {/* İlerleme */}
        <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{done}</span> / {total} madde tamamlandı
            </p>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-slate-500 underline hover:text-slate-700"
            >
              Tümünü temizle
            </button>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: total ? `${(done / total) * 100}%` : "0%",
                background: THEME.ribbon,
              }}
            />
          </div>
        </div>

        {/* Bölümler */}
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-1">
                  <label className="flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={checked[item.id] ?? false}
                      onChange={() => toggle(item.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={checked[item.id] ? "text-slate-500 line-through" : "text-slate-800"}>
                      {item.label}
                    </span>
                  </label>
                  {(item.tip || item.excelYol) && (
                    <div className="ml-7 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      {item.tip}
                      {item.excelYol && (
                        <span className="mt-1 block text-slate-500">
                          Excel: {item.excelYol}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Yaygın tuzaklar özet */}
        <section className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
          <h2 className="text-base font-semibold text-amber-900 mb-2">
            Yaygın tuzaklar · Kısa çözümler
          </h2>
          <ul className="space-y-1.5 text-sm text-amber-800">
            <li>· <strong>#YOK</strong> → DÜŞEYARA/YATAYARA eşleşmedi; EĞERHATA ile “-” veya metin ver.</li>
            <li>· <strong>#DEĞER!</strong> → Metin ile sayı karıştı; SAYIYAÇEVİR veya doğru veri tipi kullan.</li>
            <li>· <strong>#BAŞV!</strong> → Sütun/satır silindi; formülü düzelt veya sabit aralık kullan ($).</li>
            <li>· <strong>Dış bağlantı uyarısı</strong> → Veri → Bağlantıları Düzenle → Kaldır veya yolu güncelle.</li>
            <li>· <strong>Yanlış toplam</strong> → Gizli satırlar dahil; Görünüm → Gizli satırları göster/kaldır veya ALT+= ile TOPLA kontrol et.</li>
          </ul>
        </section>

        <div className="pt-4 text-center text-xs text-slate-500">
          Ofis Akademi · Excel & Veri Analizi
        </div>
      </div>
    </div>
  );
}
