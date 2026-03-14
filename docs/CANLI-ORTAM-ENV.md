# Canlı Ortam (ofisakademi.com) — Ortam Değişkenleri

Kod GitHub’a push edildi. Site **Vercel**, **Netlify** veya başka bir platformda canlıya alınıyorsa, aşağıdaki değişkenleri **canlı proje ayarlarında** eklemeniz gerekir. (`.env.local` sadece bilgisayarınızda çalışır; canlıda kullanılmaz.)

---

## Zorunlu

| Değişken | Değer | Açıklama |
|----------|--------|----------|
| `RESEND_API_KEY` | `re_...` (Resend’den kopyaladığınız key) | E-posta formunun çalışması için gerekli. |

---

## Önerilen (e-postadaki linkler doğru çıksın)

| Değişken | Değer | Açıklama |
|----------|--------|----------|
| `NEXT_PUBLIC_SITE_URL` | `https://ofisakademi.com` | Gönderilen e-postadaki “Temel / Orta / İleri” linkleri bu adrese gider. Yoksa Vercel otomatik URL kullanılır (örn. ofis-akademi.vercel.app). |

---

## Nereye girilir?

### Vercel
1. [vercel.com](https://vercel.com) → Projenizi seçin.
2. **Settings** → **Environment Variables**.
3. **Name:** `RESEND_API_KEY`, **Value:** key’inizi yapıştırın → **Save**.
4. **Name:** `NEXT_PUBLIC_SITE_URL`, **Value:** `https://ofisakademi.com` → **Save**.
5. **Deployments** → son deployment’ın yanında **⋯** → **Redeploy** (yeni env’lerin yüklenmesi için).

### Netlify
1. Site **Dashboard** → **Site configuration** → **Environment variables**.
2. **Add a variable** ile `RESEND_API_KEY` ve isteğe bağlı `NEXT_PUBLIC_SITE_URL` ekleyin.
3. Gerekirse **Trigger deploy** ile yeniden deploy edin.

### Diğer platformlar
Hosting panelinde “Environment Variables”, “Env” veya “Ortam Değişkenleri” bölümüne aynı isim ve değerleri girin; ardından projeyi yeniden deploy edin.

---

## Kontrol

Canlı sitede (ofisakademi.com) “Ücretsiz Başla” formuna e-posta yazıp gönderin. E-posta gelirse canlı ortam doğru yapılandırılmış demektir.
