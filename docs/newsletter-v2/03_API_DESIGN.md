# 03 — API Design

**Proje:** Ofis Akademi — Newsletter v2  
**Durum:** v1.0 Final  
**Base:** Next.js App Router route handlers

---

## 1. Genel kurallar

- Content-Type: `application/json`
- E-posta: trim + lowercase
- Category **client’tan kabul edilmez** (gönderilirse ignore + log)
- Category: Domain + `subscription-rules` + `page`
- **Business logic Domain’de**; route handler validate + çağır
- Hata: `{ "error": { "code": string, "message": string } }`

---

## 2. Endpoints (MVP)

| Method | Path | Amaç |
|--------|------|------|
| `POST` | `/api/subscriptions` | Abone ol / tag ekle / resubscribe |
| `POST` | `/api/subscriptions/unsubscribe` | Global çıkış |
| `GET` | `/api/subscriptions/health` | Opsiyonel |

Mevcut `POST /api/abone` → cutover (`04`).

---

## 3. `POST /api/subscriptions`

### Request

```json
{
  "email": "kisi@ornek.com",
  "page": "/tsb/sektor-ozeti",
  "reason": "signup_form",
  "channel": "web_inline",
  "session_id": null,
  "referrer": "https://google.com/",
  "utm": {
    "source": "linkedin",
    "medium": "social",
    "campaign": "tsb-q2",
    "term": null,
    "content": null
  }
}
```

| Alan | Zorunlu | Kurallar |
|------|---------|----------|
| `email` | ✓ | Geçerli email, max 320 |
| `page` | ✓* | Pathname |
| `reason` | | Intent whitelist; default `signup_form` |
| `channel` | | Surface whitelist; default `unknown` |
| `session_id` | | Nullable; anonim oturum id (MVP zorunlu değil) |
| `referrer` | | max 2k |
| `utm` | | Object |

\* Form her sayfada pathname enjekte eder.

### Davranış (Domain)

1. Validate + rate limit (API).
2. `category = mapPageToCategory(page)`.
3. Transaction:
   - Yok → subscriber + tag + `SUBSCRIBE` + welcome(category).
   - Unsubscribed → `RESUBSCRIBE` (+ gerekirse `TAG_ADDED`); welcome yok.
   - Active + yeni tag → `TAG_ADDED`; welcome yok.
   - Active + aynı tag → **event yok**; `outcome: "already_subscribed"`; isteğe bağlı `updated_at` touch.
4. Resend sync / welcome **soft-fail**: DB başarılıysa HTTP 200; `welcomeSent: false` olabilir.

### Response `200`

```json
{
  "ok": true,
  "outcome": "subscribed",
  "email": "kisi@ornek.com",
  "category": "tsb",
  "tags": ["tsb"],
  "welcomeSent": true
}
```

| `outcome` | Anlam |
|-----------|--------|
| `subscribed` | İlk kayıt |
| `tag_added` | Yeni ilgi |
| `resubscribed` | Tekrar aktif |
| `already_subscribed` | Tag zaten var; yeni event yok |

### Errors

| HTTP | code |
|------|------|
| 400 | `invalid_email` / `invalid_body` |
| 429 | `rate_limited` |
| 500 | `persist_failed` |
| 503 | `misconfigured` |

---

## 4. `POST /api/subscriptions/unsubscribe`

### Request

```json
{
  "email": "kisi@ornek.com",
  "token": "signed-optional-mvp",
  "reason": "manual",
  "channel": "email_footer"
}
```

### Response

`200` → `unsubscribed` | `already_unsubscribed` (idempotent).

Tag satırları silinmez.

---

## 5. Validation

- Email regex + length.
- `reason` / `channel` ∈ whitelist else default.
- `page`: leading `/`, max 512.
- Body size cap ~8KB.

---

## 6. Rate limiting

| Anahtar | Limit |
|---------|--------|
| IP | 20 / 10 dk |
| Email | 5 / 10 dk |

---

## 7. Mapping (config)

| Path prefix | Tag |
|-------------|-----|
| `/excel-araclari` | `excel` |
| `/formul-kutuphanesi` | `excel` |
| `/egitimler` | `training` |
| `/finans-sigorta` | `finance` |
| `/sigorta` | `insurance` |
| `/tsb` | `tsb` |
| `/ifrs17` | `ifrs17` |

En uzun prefix kazanır. `general` son çare.

---

## 8. Geriye uyumluluk

`POST /api/abone` `{ email, source }` geçişte `page`/`reason`/`channel` map edilir; yeni formlar `/api/subscriptions` kullanır.
