# Site Eksiklik Raporu

Tarih: 15 Mart 2025  
Kapsam: Boş linkler, alakasız açıklamalar, işlevsiz butonlar, yanıltıcı metinler.

---

## 1. İşlevsiz buton / form

### Ana sayfa — "Ücretsiz Başla" formu (#free bölümü)

- **Durum:** Form gönderimi sadece `e.preventDefault()` ile engelleniyor; e-posta hiçbir yere kaydedilmiyor ve kullanıcıya "başlangıç seti" verilmiyor.
- **Metin:** "E-posta bırak, başlangıç setine direkt eriş" ve "Ücretsiz Başla" butonu.
- **Sonuç:** Buton tıklanınca görünürde hiçbir şey olmuyor; vaat edilen erişim sağlanmıyor.

**Öneri:** Ya gerçek bir e-posta toplama / dağıtım akışı bağlanmalı ya da metin/buton ("Yakında" vb.) buna göre güncellenmeli.

---

## 2. Yanıltıcı veya abartılı metinler

### Ana sayfa — "Mini videolar"

- **Metin:** "Mini videolar, uygulama dosyaları ve kısa quizlerle, Excel'de güçlü bir temel kur."
- **Durum:** Sitede **video içeriği yok**. Eğitimler metin, formül açıklamaları, Excel benzeri alıştırma grid’leri ve indirilebilir Excel dosyasından oluşuyor.
- **Öneri:** "Mini videolar" ifadesi kaldırılmalı veya "Metin anlatımlar, uygulama dosyaları ve kısa alıştırmalarla" gibi mevcut içeriğe uygun ifadeyle değiştirilmeli.

### Ana sayfa — Ücretsiz bölüm maddeleri (#free)

- **Metin:** "7 günlük giriş programı", "10+ uygulamalı örnek dosya".
- **Durum:** "7 günlük program" diye ayrı bir sayfa veya akış yok. Örnek dosyalar eğitim sayfalarındaki "Örnek Excel İndir" ile veriliyor; "10+" sayısı net tanımlı değil.
- **Öneri:** Ya 7 günlük program ve dosya sayısı gerçekten sunulacak şekilde düzenlenmeli ya da metin ("Örnek Excel dosyaları ve adım adım konular" gibi) mevcut duruma göre sadeleştirilmeli.

### Ana sayfa — Hero bölümü

- **Metin:** "Dosya + video + mini quizler".
- **Durum:** Video yok (yukarıdaki ile aynı).
- **Öneri:** "Dosya + uygulama + mini alıştırmalar" veya "Dosya + metin anlatım + alıştırmalar" gibi ifade kullanılabilir.

---

## 3. Linkler

### Kontrol edilen tüm linkler

| Kaynak | Hedef | Durum |
|--------|--------|--------|
| Ana sayfa | `#free`, `#topics`, `/excel-araclari` | ✅ Sayfada id'ler ve route mevcut |
| Ana sayfa | `/egitimler/temel`, `/egitimler/orta`, `/egitimler/ileri` | ✅ Sayfalar var |
| Ana sayfa | `/excel-araclari/rapor-sablonlari`, `hata-kontrol-checklist`, `ksayol-formul-kartlari` | ✅ Sayfalar var |
| Excel Araçları hub | Tüm 6 araç href'i | ✅ Tüm route'lar mevcut |
| Diğer sayfalar | `/excel-araclari`, `/#topics` | ✅ Çalışıyor |

**Sonuç:** Boş veya kırık link tespit edilmedi.

### Ana sayfada eksik araç linki (tutarsızlık)

- **Durum:** "Faydalı Excel araçları" bölümünde yalnızca 3 kart var: Rapor Şablonları, Hata Kontrol Checklist, Kısayol & Formül Kartları. Oysa `/excel-araclari` sayfasında 6 araç listeleniyor (Ad Soyad Ayırıcı, CSV Ayırıcı, Liste Birleştirici de var).
- **Etki:** Ana sayfadan bu 3 araca doğrudan link yok; kullanıcı "Excel Araçları"na tıklayıp hub’tan erişmek zorunda.
- **Öneri:** İsterseniz ana sayfaya bu 3 aracın da kartları eklenebilir; zorunlu değil, tutarlılık tercihi.

---

## 4. Üst bar (SiteTopBar) başlıkları

- **Durum:** `pathTitles` içinde şu route’lar yok:
  - `/excel-araclari/rapor-sablonlari`
  - `/excel-araclari/hata-kontrol-checklist`
  - `/excel-araclari/ksayol-formul-kartlari`
- **Etki:** Bu sayfalardayken üst barda sayfa adı yerine genel "Ofis Akademi" görünüyor.
- **Öneri:** Bu üç path için `pathTitles`’a uygun başlıklar eklenmeli.

---

## 5. Özet

| Kategori | Adet | Öncelik |
|----------|------|--------|
| İşlevsiz buton / form | 1 | Yüksek |
| Yanıltıcı / abartılı metin | 4 nokta | Orta |
| Boş / kırık link | 0 | — |
| Eksik link (tutarsızlık) | 1 (3 araç ana sayfada yok) | Düşük |
| Eksik path başlığı | 3 | Düşük |

---

*Bu rapor otomatik tespit ve kod incelemesine dayanmaktadır.*
