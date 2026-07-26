# Newsletter v2 — Sprint 1 Test Cases

**Sürüm:** v1.0 Final ile hizalı  
**Kural:** Sprint 1, bu matrisin **Sprint 1 kapsamındaki** satırları yeşil olmadan Done sayılmaz.  
**Sapma:** Beklenen davranış değişirse önce mimari doküman, sonra bu dosya, sonra kod.

---

## Ortam önkoşulları

| # | Koşul |
|---|--------|
| 1 | Neon/Postgres ayakta; `DATABASE_URL` set |
| 2 | `npm run subscription:migrate` başarılı |
| 3 | `GET /api/subscriptions` → `{ "configured": true }` |
| 4 | Temiz veya bilinen test email’leri (`test+s1-*@…`) |

**Base URL:** yerel `http://localhost:3000` veya staging.

**Ortak istek başlıkları:** `Content-Type: application/json`

---

## Kapsam notu (önemli)

| Senaryo | Sprint 1 kodunda var mı? | Done kapısı |
|---------|--------------------------|-------------|
| TC-01 … TC-04, TC-06 … TC-08, TC-10 | Evet | **Zorunlu yeşil** |
| TC-05 Unsubscribe | Hayır (Sprint 3) | Sprint 1 Done için: DB ile manuel `status=unsubscribed` sonrası TC-04 yeterli; **TC-05 API yeşili Sprint 3 kapısı** |
| TC-09 Legacy migration | Hayır (Sprint 3 script) | **Sprint 3 kapısı**; burada beklenenler yazılı |

GPT’nin “tümü yeşil” ifadesi ürün niyetiyle uyumlu olsun diye TC-05/TC-09 bu dosyada tam yazıldı; Sprint 1 kapanışı için zorunlu set = **TC-01, 02, 03, 04, 06, 07, 08, 10**.

---

## TC-01 — Yeni abonelik

### Amaç
İlk kez görülen email + bilinen path → `SUBSCRIBE` + junction tag + `subscribed`.

### İstek
```http
POST /api/subscriptions
```
```json
{
  "email": "test+s1-new@example.com",
  "page": "/tsb/sektor-ozeti",
  "reason": "signup_form",
  "channel": "web_inline"
}
```

### Beklenen API cevabı
- HTTP `200`
```json
{
  "ok": true,
  "outcome": "subscribed",
  "email": "test+s1-new@example.com",
  "category": "tsb",
  "tags": ["tsb"],
  "welcomeSent": false
}
```

### Beklenen veritabanı
| Tablo | Değişiklik |
|-------|------------|
| `subscribers` | 1 satır: `status=active`, `primary_source_page` ≈ `/tsb/sektor-ozeti`, `primary_source_category=tsb`, `schema_version=1` |
| `subscriber_tags` | `(id, tsb)` |
| `subscription_events` | 1 satır aşağıda |

### Beklenen event’ler
| event_type | category | reason | channel |
|------------|----------|--------|---------|
| `SUBSCRIBE` | `tsb` | `signup_form` | `web_inline` |

### Kabul
- [ ] API alanları yukarıdaki gibi  
- [ ] Üç tabloda tutarlı satırlar  
- [ ] `welcomeSent === false` (Sprint 2’ye kadar)

---

## TC-02 — Aynı abonelik (aynı sayfa / aynı tag)

### Amaç
Active abone, aynı path → event şişmesin; `already_subscribed`.

### İstek
TC-01’deki body’nin **birebir tekrarı**.

### Beklenen API cevabı
- HTTP `200`
```json
{
  "ok": true,
  "outcome": "already_subscribed",
  "email": "test+s1-new@example.com",
  "category": "tsb",
  "tags": ["tsb"],
  "welcomeSent": false
}
```

### Beklenen veritabanı
| Tablo | Değişiklik |
|-------|------------|
| `subscribers` | Yeni satır yok; `updated_at` ilerleyebilir |
| `subscriber_tags` | Hâlâ tek `tsb` |
| `subscription_events` | **Yeni satır yok** (SUBSCRIBE/TAG_ADDED eklenmez) |

### Beklenen event’ler
- Önceki `SUBSCRIBE` adedi aynı kalır (genelde 1).

### Kabul
- [ ] `outcome=already_subscribed`  
- [ ] Event count artmaz  
- [ ] Tag count artmaz  

---

## TC-03 — Yeni kategori (tag birikimi)

### Amaç
Aynı email, farklı path → yeni tag + `TAG_ADDED`; eski tag silinmez.

### İstek
```json
{
  "email": "test+s1-new@example.com",
  "page": "/excel-araclari/kredi-taksit",
  "reason": "signup_form",
  "channel": "web_inline"
}
```

### Beklenen API cevabı
- HTTP `200`
```json
{
  "ok": true,
  "outcome": "tag_added",
  "email": "test+s1-new@example.com",
  "category": "excel",
  "tags": ["excel", "tsb"],
  "welcomeSent": false
}
```
(`tags` sırası sort edilmiş olabilir.)

### Beklenen veritabanı
| Tablo | Değişiklik |
|-------|------------|
| `subscribers` | `last_subscribed_at` / `updated_at` güncellenir; `primary_source_*` **değişmez** (ilk kaynak) |
| `subscriber_tags` | `tsb` + `excel` |
| `subscription_events` | +1 `TAG_ADDED` |

### Beklenen event’ler
| event_type | category | page |
|------------|----------|------|
| `TAG_ADDED` | `excel` | `/excel-araclari/kredi-taksit` (normalize) |

Önceki `SUBSCRIBE` durur.

### Kabul
- [ ] `outcome=tag_added`  
- [ ] İki tag  
- [ ] Welcome yok  
- [ ] primary_source_category hâlâ `tsb`  

---

## TC-04 — Resubscribe

### Amaç
`unsubscribed` → tekrar active; `RESUBSCRIBE`; gerekirse `TAG_ADDED`.

### Önkoşul (Sprint 1)
API unsubscribe yokken SQL:
```sql
UPDATE subscribers
SET status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
WHERE email = 'test+s1-new@example.com';
```

### İstek
```json
{
  "email": "test+s1-new@example.com",
  "page": "/egitimler/temel",
  "reason": "signup_form",
  "channel": "web_footer"
}
```

### Beklenen API cevabı
- HTTP `200`
```json
{
  "ok": true,
  "outcome": "resubscribed",
  "email": "test+s1-new@example.com",
  "category": "training",
  "tags": ["excel", "training", "tsb"],
  "welcomeSent": false
}
```

### Beklenen veritabanı
| Tablo | Değişiklik |
|-------|------------|
| `subscribers` | `status=active`, `unsubscribed_at=NULL` |
| `subscriber_tags` | `training` eklenir (yoksa); eski tag’ler kalır |
| `subscription_events` | `RESUBSCRIBE` + (yeni tag ise) `TAG_ADDED` |

### Beklenen event’ler
| Sıra | event_type | category |
|------|------------|----------|
| 1 | `RESUBSCRIBE` | `training` |
| 2 | `TAG_ADDED` | `training` (tag yoksa) |

Eğer `training` zaten varsa yalnızca `RESUBSCRIBE`.

### Kabul
- [ ] status active  
- [ ] En az bir `RESUBSCRIBE` event  
- [ ] `welcomeSent=false`  

---

## TC-05 — Unsubscribe (Sprint 3 API)

### Amaç
Global çıkış; tag’ler silinmez; `UNSUBSCRIBE` event.

### İstek (hedef API — Sprint 3)
```http
POST /api/subscriptions/unsubscribe
```
```json
{
  "email": "test+s1-new@example.com",
  "token": "<signed>",
  "reason": "manual",
  "channel": "email_footer"
}
```

### Beklenen API cevabı
- HTTP `200` → `outcome: "unsubscribed"` (tekrar: `already_unsubscribed`)

### Beklenen veritabanı
| Tablo | Değişiklik |
|-------|------------|
| `subscribers` | `status=unsubscribed`, `unsubscribed_at` set |
| `subscriber_tags` | **Değişmez** |
| `subscription_events` | + `UNSUBSCRIBE` |

### Beklenen event’ler
| event_type |
|------------|
| `UNSUBSCRIBE` |

### Kabul (Sprint 3)
- [ ] Global unsub  
- [ ] Tag’ler duruyor  
- [ ] Idempotent ikinci çağrı  

### Sprint 1
- [ ] N/A — endpoint yok; manuel SQL ile TC-04 yolu kullanılır  

---

## TC-06 — Invalid email

### Amaç
Geçersiz email DB’ye yazılmaz.

### İstek
```json
{
  "email": "not-an-email",
  "page": "/tsb",
  "reason": "signup_form",
  "channel": "web_inline"
}
```

### Beklenen API cevabı
- HTTP `400`
```json
{
  "error": {
    "code": "invalid_email",
    "message": "…"
  }
}
```

### Beklenen veritabanı
- `subscribers` / tags / events’te bu email için **yeni satır yok**.

### Beklenen event’ler
- Yok.

### Kabul
- [ ] 400 + `invalid_email`  
- [ ] DB temiz  

---

## TC-07 — Rate limit

### Amaç
Aynı email kısa sürede aşırı istek → 429; aşırı yazım yok.

### İstek
Aynı geçerli body ile **6+** ardışık `POST` (email limiti: 5 / 10 dk).

Örnek email: `test+s1-rate@example.com`, page `/tsb`.

### Beklenen API cevabı
- İlk başarılı çağrılar: `200` (`subscribed` / `already_subscribed`)  
- Limit aşımı: HTTP `429`
```json
{
  "error": {
    "code": "rate_limited",
    "message": "…"
  }
}
```

### Beklenen veritabanı
- İlk başarılı persist kurallarına uyar.  
- 429 cevaplarında **ek event/tag zorunlu değil** (mümkünse hiç yazılmamalı — rate limit Domain’den önce).

### Beklenen event’ler
- 429 path’inde yeni event yok.

### Kabul
- [ ] 429 + `rate_limited`  
- [ ] In-memory limit serverless’ta yaklaşık olabilir; yerel tek process’te tekrarlanabilir olmalı  

**Not:** Isolate reset rate limit’i sıfırlar — CI’da tek instance kullan.

---

## TC-08 — Unknown page → `general`

### Amaç
Mapping dışı path → `general` (son çare); yine kayıt oluşur.

### İstek
```json
{
  "email": "test+s1-general@example.com",
  "page": "/hakkimizda-olmayan-sayfa",
  "reason": "signup_form",
  "channel": "web_inline"
}
```

### Beklenen API cevabı
- HTTP `200`
```json
{
  "ok": true,
  "outcome": "subscribed",
  "category": "general",
  "tags": ["general"],
  "welcomeSent": false
}
```

### Beklenen veritabanı
| Tablo | |
|-------|--|
| `subscribers` | `primary_source_category=general` |
| `subscriber_tags` | `general` |
| `subscription_events` | `SUBSCRIBE` / `general` |

### Beklenen event’ler
| event_type | category |
|------------|----------|
| `SUBSCRIBE` | `general` |

### Kabul
- [ ] category/tag `general`  
- [ ] Ürün notu: `general` şişmesin diye path config’e eklenmeli (sonraki iş)  

---

## TC-09 — Legacy migration (Sprint 3 script)

### Amaç
Mevcut ~35 abone bir kerelik `legacy` tag + migration event; idempotent.

### İstek
```bash
# Hedef (Sprint 3) — örnek
npx tsx scripts/subscription-migrate-legacy.ts --dry-run
npx tsx scripts/subscription-migrate-legacy.ts
```

### Beklenen API cevabı
- N/A (script). Çıktı log: işlenen / atlanan sayılar.

### Beklenen veritabanı
| Tablo | |
|-------|--|
| `subscribers` | Her legacy email için 1 satır `active` (veya kaynak status) |
| `subscriber_tags` | en az `legacy` |
| `subscription_events` | `SUBSCRIBE` (veya dokümandaki migration tipi) + `reason=migration` |

İkinci çalıştırma: duplicate email insert yok; tag conflict no-op.

### Beklenen event’ler
| event_type | reason | category |
|------------|--------|----------|
| `SUBSCRIBE` | `migration` | `legacy` |

### Kabul (Sprint 3)
- [ ] Idempotent  
- [ ] `legacy` tag  
- [ ] Resend listesiyle satır sayısı makul örtüşür  

### Sprint 1
- [ ] N/A  

---

## TC-10 — Duplicate tag (farklı sayfa, aynı kategori)

### Amaç
Farklı path ama aynı mapped tag → `already_subscribed`; ikinci `TAG_ADDED` yok.

### Önkoşul
`test+s1-dup@example.com` ile bir kez:
```json
{ "email": "test+s1-dup@example.com", "page": "/excel-araclari", "reason": "signup_form", "channel": "web_inline" }
```
→ `subscribed` / `excel`.

### İstek
```json
{
  "email": "test+s1-dup@example.com",
  "page": "/formul-kutuphanesi/xlookup",
  "reason": "download_template",
  "channel": "web_popup"
}
```

### Beklenen API cevabı
- HTTP `200`
```json
{
  "ok": true,
  "outcome": "already_subscribed",
  "category": "excel",
  "tags": ["excel"],
  "welcomeSent": false
}
```

### Beklenen veritabanı
| Tablo | |
|-------|--|
| `subscriber_tags` | Hâlâ tek `excel` |
| `subscription_events` | Yeni `TAG_ADDED` **yok** (ilk `SUBSCRIBE` kalır) |

### Beklenen event’ler
- Event adedi artmaz (TC-02 ile aynı kural; fark: page/reason/channel farklı olsa bile).

### Kabul
- [ ] `already_subscribed`  
- [ ] Tek `excel` tag  
- [ ] History şişmez  

---

## Sprint 1 Done checklist

| ID | Senaryo | Zorunlu Sprint 1 | Sonuç |
|----|---------|------------------|--------|
| TC-01 | Yeni abonelik | Evet | ☐ |
| TC-02 | Aynı abonelik | Evet | ☐ |
| TC-03 | Yeni kategori | Evet | ☐ |
| TC-04 | Resubscribe | Evet (manuel unsub SQL) | ☐ |
| TC-05 | Unsubscribe API | Hayır → Sprint 3 | ☐ |
| TC-06 | Invalid email | Evet | ☐ |
| TC-07 | Rate limit | Evet | ☐ |
| TC-08 | Unknown page | Evet | ☐ |
| TC-09 | Legacy migration | Hayır → Sprint 3 | ☐ |
| TC-10 | Duplicate tag | Evet | ☐ |

**Sprint 1 Done:** TC-01, 02, 03, 04, 06, 07, 08, 10 = PASS.  
**Sprint 3 Done kapısı:** TC-05, TC-09.

---

## Ek: `DATABASE_URL` yok

```http
POST /api/subscriptions
```
→ HTTP `503`, `error.code = misconfigured`  
DB değişmez. (Smoke; Sprint 1 Done için zorunlu değil.)
