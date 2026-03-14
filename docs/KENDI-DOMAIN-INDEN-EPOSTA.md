# Kendi Domain'inizden E-posta Gönderme (Resend)

Resend ile kendi domain'inizden (örn. `info@ofisakademi.com`) e-posta göndermek için aşağıdaki adımları uygulayın.

---

## Genel bakış

1. Resend'de domain ekleyip **doğrulamanız** gerekir (DNS kayıtları).
2. Doğrulama tamamlanınca projede **gönderen adresini** bu domain'e göre ayarlarsınız.

**Süre:** DNS kayıtları 5–10 dakika, bazen 24–48 saat içinde yayılır.

---

## Adım 1: Resend'de domain ekleme

1. [resend.com](https://resend.com) → giriş yapın.
2. Sol menüden **Domains** (veya **Dashboard → Domains**) sayfasına gidin.
3. **Add Domain** / **Domain Ekle** butonuna tıklayın.
4. Domain adını girin.

**Öneri:** Ana domain'inizi doğrudan kullanmak yerine **alt domain (subdomain)** kullanın. Örneğin:

- `mail.siteniz.com`
- `gonderi.siteniz.com`
- `eposta.siteniz.com`

Böylece e-posta gönderiminin itibarı ana sitenizden ayrı kalır; Resend de bunu önerir.

**Örnek:** Siteniz `ofisakademi.com` ise domain olarak `mail.ofisakademi.com` yazın.

5. Kaydedin. Resend sizi domain detay sayfasına götürür.

---

## Adım 2: DNS kayıtlarını görüntüleme

Domain eklendikten sonra Resend size **doğrulama için eklemeniz gereken DNS kayıtlarını** gösterir. İki tür kayıt vardır:

| Kayıt | Açıklama |
|-------|----------|
| **SPF** | Hangi sunucuların sizin domain adınıza e-posta gönderebileceğini tanımlar. Bir **TXT** ve genelde bir **MX** kaydı istenir. |
| **DKIM** | E-postanın gerçekten sizin domain'inizden çıktığını kanıtlayan anahtar. Bir veya birkaç **TXT** kaydı istenir. |

Resend ekranında her kayıt için şunlar yazar:

- **Host / Name** (örn. `send` veya `resend._domainkey.send`)
- **Type** (TXT, MX)
- **Value** (uzun metin)

Bunları kopyalayıp domain sağlayıcınıza ekleyeceksiniz. Sayfayı kapatmadan bir yere not alın veya ekran görüntüsü alın.

---

## Adım 3: DNS kayıtlarını domain sağlayıcınızda ekleme

Domain'inizi nereden yönetiyorsanız (GoDaddy, Cloudflare, Namecheap, Turhost, Getir, vb.) orada **DNS yönetimi** bölümüne gidin. Genelde:

- **DNS Settings**, **DNS Management**, **DNS Kayıtları** veya **Nameservers / NS** gibi bir menü olur.

Resend’in verdiği **her bir kayıt** için:

1. **Yeni kayıt ekle** / **Add Record** deyin.
2. **Type:** Resend’de yazdığı gibi seçin (TXT veya MX).
3. **Name / Host:** Resend’deki değeri aynen yazın.  
   - Bazen sadece subdomain kısmı istenir (örn. `send` veya `resend._domainkey.send`).  
   - Bazı panelerde tam ad istenir (örn. `send.mail.siteniz.com`). Sağlayıcınızın örneklerine bakın.
4. **Value / Content / İçerik:** Resend’deki uzun metni **tam ve tek satır** olarak yapıştırın.
5. **TTL:** Varsayılan (örn. 3600 veya Auto) bırakabilirsiniz.
6. Kaydedin.

**Önemli:**  
- TXT value’da tırnak eklemeyin; sadece Resend’den kopyaladığınız metni yapıştırın.  
- Birden fazla TXT/DKIM varsa hepsini tek tek ekleyin.

### Sık kullanılan sağlayıcılar (kısa yol)

- **Cloudflare:** Dashboard → Domain → DNS → Records → Add record.
- **GoDaddy:** Domain’e tıkla → DNS Management → Add → Type/Name/Value gir.
- **Namecheap:** Domain List → Manage → Advanced DNS → Add New Record.
- **Turhost / Getir / Yerel firma:** “DNS ayarları” veya “DNS kayıtları” benzeri menüyü bulun; TXT ve MX ekleyin.

---

## Adım 4: Resend'de doğrulamayı çalıştırma

1. Tüm DNS kayıtlarını ekledikten sonra Resend’deki domain sayfasına dönün.
2. **Verify** / **Verify DNS Records** / **Doğrula** butonuna tıklayın.
3. Resend DNS’i kontrol eder. Sonuç:
   - **Verified:** İşlem tamam. Adım 5’e geçin.
   - **Pending / Failed:** DNS henüz yayılmamış olabilir. 15–30 dakika bekleyip tekrar **Verify** deneyin. Bazı sağlayıcılarda 24–48 saat sürebilir.

Doğrulama başarılı olana kadar bir sonraki adıma geçmeyin.

---

## Adım 5: Projede gönderen adresini ayarlama

Domain **Verified** olduktan sonra:

1. Proje kökündeki **`.env.local`** dosyasını açın (yoksa oluşturun).
2. Resend’den göndermek için kullanacağınız **e-posta adresini** ekleyin. Bu adres, doğruladığınız domain’de olmalıdır.

**Subdomain kullandıysanız** (örn. `mail.siteniz.com`):

```env
RESEND_FROM=Ofis Akademi <info@mail.siteniz.com>
```

**Ana domain kullandıysanız** (örn. `siteniz.com`):

```env
RESEND_FROM=Ofis Akademi <info@siteniz.com>
```

- `Ofis Akademi` → Alıcının gördüğü “gönderen adı”.
- `info@mail.siteniz.com` → Gerçek e-posta adresi (doğruladığınız domain’den olmalı).

3. Dosyayı kaydedin.
4. Geliştirme sunucusunu yeniden başlatın (`npm run dev` durdurup tekrar çalıştırın).

Bundan sonra “Ücretsiz Başla” formu ile gönderilen e-postalar bu adresten gidecektir.

---

## Adım 6 (İsteğe bağlı): DMARC

Gmail/Yahoo gibi sağlayıcılar 2024 itibarıyla **DMARC** kaydı olan domain’lere daha güvenilir gözüyle bakar. SPF ve DKIM doğrulandıktan **sonra** ekleyebilirsiniz:

- **Host:** `_dmarc.siteniz.com` veya sağlayıcınızın istediği format.
- **Type:** TXT  
- **Value örneği:**  
  `v=DMARC1; p=none; rua=mailto:dmarc@siteniz.com;`

Önce `p=none` (sadece raporlama) kullanın; her şey düzgün çalışıyorsa ileride `p=quarantine` veya `p=reject` düşünebilirsiniz. Resend dashboard’da DMARC ile ilgili kısa açıklama da bulunur.

---

## Özet kontrol listesi

- [ ] Resend’de domain eklendi (tercihen subdomain: `mail.siteniz.com`).
- [ ] SPF ve DKIM için verilen tüm DNS kayıtları domain sağlayıcıda eklendi.
- [ ] Resend’de **Verify** tıklandı ve durum **Verified**.
- [ ] `.env.local` içinde `RESEND_FROM=Ofis Akademi <adres@domain.com>` ayarlandı.
- [ ] Uygulama yeniden başlatıldı; form ile test e-postası gönderildi.

Sorun yaşarsanız Resend’in “Domain not verifying?” sayfası ve [Resend Knowledge Base](https://resend.com/knowledge-base) işe yarar. DNS’in yayılması için bir süre beklemek gerekebilir.
