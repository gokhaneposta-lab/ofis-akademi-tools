# Site Durum Raporu — Boş Vaatler, Geliştirme Noktaları, İçerik Zenginleştirme

Tarih: Mart 2025

---

## 1. Boş vaatler ve altı dolu olmayan metinler

### ✅ Daha önce giderilenler (şu an tutarlı)

| Konu | Eski durum | Şu an |
|------|------------|--------|
| E-posta formu | Buton işlevsizdi | Form çalışıyor; Resend ile hoş geldin maili + Excel linkleri gidiyor. |
| "Mini videolar" | Sitede video yoktu | Metin "Metin anlatımlar, uygulama dosyaları ve kısa alıştırmalarla" olarak güncellendi. |
| "7 günlük giriş programı" / "10+ dosya" | Net tanımlı değildi | "Adım adım konular", "Uygulamalı örnek Excel dosyaları" ifadelerine sadeleştirildi. |
| "Dosya + video + mini quizler" | Video yoktu | "Dosya + uygulama + mini alıştırmalar" olarak değiştirildi. |
| Üst bar başlıkları | 3 sayfada eksikti | Rapor Şablonları, Hata Kontrol, Kısayol & Formül Kartları eklendi. |

### ⚠️ Kontrol edilmesi / yumuşatılması önerilen

| Konu | Konum | Öneri |
|------|--------|--------|
| **"7 günde Excel akışını kur"** / **"Ücretsiz mini program"** | Ana sayfa, gösterge paneli kartı (sağ blok) | Sitede gün gün 7 günlük ayrı bir program yok. İfade "Ücretsiz içerikle adım adım ilerle" veya "Ücretsiz eğitimle temelini kur" gibi yumuşatılabilir; ya da olduğu gibi bırakılabilir (genel vaat olarak). |
| **"Canlı Uygulama"** | Aynı kart, üst etiket | Gösterge paneli gerçekten canlı (sayılar/formül dönüşüyor); bu ifade doğru, değiştirmeye gerek yok. |

### ✅ Altı dolu olan metinler (kontrol edildi)

- "Her bölüm, kendi dosyası ve egzersizleriyle birlikte gelir" → Eğitim sayfalarında Excel indir + alıştırma grid’leri var.
- "E-posta bırak, başlangıç setine (Excel linkleri) e-posta ile ulaş" → Form çalışıyor, linkler mailde gidiyor.
- Tüm Excel araçları açıklamaları (Ad Soyad, CSV, Liste Birleştirici, Rapor Şablonları, Checklist, Kısayol Kartları) ilgili sayfalarla uyumlu.
- Placeholder’lar (örn. e-posta, CSV örneği) sadece kullanım örneği; vaat değil.

**Özet:** Büyük boş vaat kalmadı. İsteğe bağlı tek nokta: "7 günde Excel akışını kur" / "Ücretsiz mini program" ifadesini yukarıdaki gibi yumuşatmak.

---

## 2. Geliştirilmesi gereken noktalar

### Teknik / UX

| # | Konu | Açıklama | Öncelik |
|---|------|----------|--------|
| 1 | **Ana sayfa – Excel araçları tutarlılığı** | "Faydalı Excel araçları" bölümünde 3 kart var; hub’ta 6 araç. Ad Soyad, CSV Ayırıcı, Liste Birleştirici ana sayfada kart olarak yok. | Düşük |
| 2 | **Mobil görünüm** | Tüm sayfalar mobilde kontrol edilmeli (form, tablolar, PDF butonları). | Orta |
| 3 | **Erişilebilirlik** | Form alanlarına `aria-label`, butonlara anlamlı metin; kontrast oranları kontrolü. | Orta |
| 4 | **SEO** | Her sayfa için `title` / `description` (özellikle eğitim ve araç sayfaları); gerekirse `metadata` veya `generateMetadata`. | Orta |
| 5 | **Yükleme / hata durumları** | Excel indir, PDF indir gibi aksiyonlarda "İndiriliyor…" ve hata mesajı net olsun. | Düşük |
| 6 | **E-posta formu – rate limit** | Aynı IP/e-posta ile kısa sürede çok istek engellenebilir (spam / kötüye kullanım). | Düşük |

### İçerik / Ürün

| # | Konu | Açıklama | Öncelik |
|---|------|----------|--------|
| 7 | **Eğitim sayfalarında ilerleme** | Kullanıcı hangi konuları "tamamladı" takip edilmiyor; isteğe bağlı basit ilerleme (örn. localStorage) eklenebilir. | Düşük |
| 8 | **Hata Kontrol Checklist** | LocalStorage’da saklanıyor; cihaz değişince kaybolur. İsteğe bağlı: export/import veya hesap ile senkron. | Düşük |
| 9 | **Rapor şablonları** | Şablon sayısı veya türü artırılabilir (örn. aylık özet, proje takip). | İsteğe bağlı |

---

## 3. İçerik zenginleştirme önerileri

### Ana sayfa

- **Sosyal kanıt:** "X kişi Excel setini indirdi" veya kısa kullanıcı yorumu (gerçek/anonim).
- **Net fayda cümleleri:** "Raporu 10 dakikada mı 2 saatte mi hazırlıyorsun?" gibi tek cümlelik pain-point.
- **FAQ (SSS):** "Ücretsiz mi?", "Excel versiyonu?", "Video var mı?" — 3–5 soru + kısa cevap.

### Eğitim sayfaları

- **Kısa "Bu bölümde ne var?"** paragrafı her seviye için (zaten kısmen var; tek paragraf özet güçlendirilebilir).
- **İpuçları kutusu:** Her fonksiyon grubunda "Günlük kullanım: …" veya "Dikkat: …" 1–2 cümle.
- **Ek alıştırma fikri:** Mevcut grid’lere ek "Kendi verinle dene" (örnek: kullanıcı kendi sayılarını girer, formül aynı kalır).

### Excel araçları

- **Ad Soyad Ayırıcı:** "2+ ad (Örn: Mehmet Ali Yılmaz) nasıl bölünür?" kısa not veya tooltip.
- **CSV Ayırıcı:** "Virgül mü noktalı virgül mü?" kısa açıklama (zaten var; "Türkçe Excel’de sık noktalı virgül" vurgulanabilir).
- **Liste Birleştirici:** SQL IN dışında "Excel’de TEKSTBİRLEŞTİR ile nasıl kullanılır?" 1 cümle.
- **Rapor Şablonları:** Her şablon için 1–2 cümle "Bu şablonu ne zaman kullanırsın?".

### Genel

- **Blog / ipuçları sayfası:** "Excel ipuçları", "Sık yapılan hatalar" gibi 3–5 kısa yazı (SEO + değer).
- **Kısayol & Formül Kartları:** İkinci sayfa veya "İleri seviye formüller" kartı (FİLTRE, SIRALA, BENZERSİZ özeti).
- **Videolar (ileride):** "Mini videolar" demeden önce 1–2 kısa ekran kaydı eklenirse vaat tam karşılanır.

---

## Özet tablo

| Başlık | Durum |
|--------|--------|
| **1. Boş vaatler** | Çoğu giderildi; opsiyonel: "7 günde / mini program" ifadesi yumuşatılabilir. |
| **2. Geliştirme noktaları** | 9 madde (teknik, UX, içerik); öncelikler tabloda. |
| **3. İçerik zenginleştirme** | Ana sayfa, eğitim, araçlar ve genel için somut öneriler listelendi. |

İlk adım olarak "7 günde / Ücretsiz mini program" metnini yumuşatmak isterseniz kod tarafında tek satırlık değişiklik yeterli.
