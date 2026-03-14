# E-posta ile Excel Dosyası Gönderme – Seçenekler

Tüm seviyelere ait konuların Excel dosyalarını e-posta ile ulaştırmak **mümkün**. Aşağıda birkaç pratik yol var.

---

## 1. E-postada sadece indirme linki (önerilen)

**Nasıl çalışır:** Kullanıcı e-postasını girer. Sistem bir “hoş geldin” e-postası atar; e-postada **tüm seviyelerin Excel dosyalarını indirebileceği linkler** (veya tek bir ZIP linki) olur. Dosyalar e-postaya ek (attachment) olarak **gönderilmez**.

**Artıları:**
- E-posta boyutu küçük, spam/ek filtreleriyle sorun çıkmaz.
- Dosyalar sitede veya depolamada (Vercel Blob, S3) tutulur; istersen güncelleyebilirsin.
- Teknik olarak basit: API route + e-posta servisi yeterli.

**Gerekenler:**
- **API route:** Form POST’unu alan bir endpoint (örn. `app/api/abone/route.ts`).
- **E-posta servisi:** Resend, SendGrid, Mailgun vb. (Resend ücretsiz kotası genelde yeterli.)
- **Dosyaların yeri:**  
  - **A)** Sitede zaten var: Eğitim sayfalarındaki “Örnek Excel İndir” ile aynı dosyalar. Bu durumda e-postada sadece **sayfa linkleri** verilir (örn. “Temel: [link], Orta: [link], İleri: [link]”). Sunucuda ekstra dosya tutmana gerek kalmaz.  
  - **B)** Önceden üretilmiş 3 Excel (veya 1 ZIP) → `public/` veya Vercel Blob’a konur; e-postadaki link bu dosyaya gider.

**Özet:** Evet, tüm seviyelerin Excel’lerini “mail ile göndermek” bu yöntemle = mailde **link** vererek mümkün. Kullanıcı linke tıklayıp indirir.

---

## 2. E-postaya dosya ekleyerek gönderme (attachment)

**Nasıl çalışır:** Kullanıcı e-posta girer. Sunucu 3 seviye için Excel üretir (veya tek ZIP), bu dosyayı e-postaya **ek** yapar ve gönderir.

**Artıları:**
- Kullanıcı tek mailde her şeyi görür, ekleri indirir.

**Eksileri:**
- E-posta sunucuları ek boyutunu sınırlar (genelde 10–25 MB). 3 Excel birlikte birkaç MB olabilir; büyürse ZIP ile sıkıştırılmalı.
- Sunucuda Excel üretimi gerekir: Şu an `buildLevelWorkbook` tarayıcıda çalışıyor; aynı mantığı API route’ta (Node.js + `xlsx`) çalışacak şekilde taşımak gerekir.

**Gerekenler:**
- API route’ta seviye verileri + `xlsx` ile workbook üretimi.
- E-posta servisinin attachment desteklemesi (Resend, SendGrid destekler).

**Özet:** Teknik olarak mümkün; ek boyutu ve sunucu tarafında Excel üretimi planlanmalı.

---

## 3. Sadece e-posta toplama (en basit)

**Nasıl çalışır:** Form çalışır, e-posta bir yere yazılır (veritabanı, Google Sheet, Mailchimp/ConvertKit). Kullanıcıya otomatik bir “Teşekkürler, içerikler sitede” maili atılır; **dosya gönderilmez**, sadece site linki verilir.

**Artıları:**
- En az kod ve entegrasyon.
- E-posta listesiyle sonradan toplu mail veya “başlangıç seti” maili ekleyebilirsin.

**Özet:** Mail ile Excel göndermek istemiyorsan, sadece “e-posta bırak” + bilgilendirme maili de yeterli.

---

## Karar rehberi

| Hedef | Öneri |
|-------|--------|
| “Mail ile Excel seti gitsin” + basit olsun | **1. seçenek:** Mailde **indirme linkleri** (site sayfaları veya hazır Excel/ZIP). |
| “Mailde direkt ek olsun” | **2. seçenek:** API’de Excel üret + attachment ile gönder. |
| “Şimdilik sadece e-posta toplayalım” | **3. seçenek:** Formu çalıştır, maili kaydet, kısa teşekkür maili at. |

---

## Tüm seviyelere ait Excel’leri “mail ile göndermek”

- **Evet, mümkün.** En pratik yol:  
  - E-postada **link** vermek (mevcut eğitim sayfalarındaki indirme linkleri veya senin yükleyeceğin sabit Excel/ZIP).  
- İstersen ileride aynı altyapıyla **attachment** (ekli Excel/ZIP) da eklenebilir; bunun için API’de workbook üretimi gerekir.

İstersen bir sonraki adımda **1. seçenek** için örnek API route + Resend ile “link içeren hoş geldin maili” kodunu çıkarabilirim.
