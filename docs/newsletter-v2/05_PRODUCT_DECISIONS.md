# 05 — Product Decisions

**Proje:** Ofis Akademi — Newsletter v2  
**Rol:** Ürün / mimari karar defteri  
**Durum:** v1.0 Final

Bu dosya “neden böyle?” sorularına tek cevap kaynağıdır.

---

## D0 — Business logic yalnızca Domain katmanında

**Karar:** Tag birleştirme, event tipi, welcome / sessiz, already_subscribed, status geçişleri **Domain servislerinde** yaşar.

**Neden:**
- API şişmez; UI’da gizli kural olmaz.
- Test edilebilir çekirdek.
- Resend / DB adaptörleri değişince kurallar durur.

**Sonuç:** Route handler = validate + rate limit + Domain çağrısı. UI = input + `page`/`reason`/`channel`.

---

## D1 — Resend source of truth değil

**Karar:** OA veritabanı otorite; Resend gönderim (+ isteğe bağlı ayna).

**Sonuç:** Welcome soft-fail — DB kayıt başarılıysa abonelik başarılı (`welcomeSent: false` olabilir).

---

## D2 — Aggregate + Event + Tag junction

**Karar:** `subscribers` + `subscriber_tags` + `subscription_events`.

**Neden (tag):** JSONB hızlı ama segment / tag-metadata / ileride score için junction daha doğru. Ölçek küçük; join maliyeti önemsiz.  
**Detay karşılaştırma:** `02_DATABASE_DESIGN.md` §2.

**Sonuç:** JSONB `interest_tags` yok; tag seti = junction.

---

## D3 — Event modeli zorunlu

**Karar:** `SUBSCRIBE` | `RESUBSCRIBE` | `TAG_ADDED` | `UNSUBSCRIBE`.

**Sonuç:** Aynı tag tekrarı → event yok, `already_subscribed` (history şişmesin).

---

## D4 — Üyelik zorunlu değil

Anonim gezinme; kimlik = e-posta.

---

## D5 — TSB ayrı (`tsb`)

`tsb` ≠ `insurance`.

---

## D6 — `general` mümkün olduğunca yok

Form `page` zorunlu enjekte eder.

---

## D7 — Tag birikimi

Union; unsub tag silmez.

---

## D8 — Kategori UI’dan gelmez

Merkezi `subscription-rules`.

---

## D9 — Welcome kategori bazlı; yeni tag sessiz

Yalnızca ilk `SUBSCRIBE`.

---

## D10 — Global unsubscribe (MVP)

Kategori bazlı çıkış yok.

---

## D11 — Legacy bir kerelik

`subscriber_tags.tag = legacy`.

---

## D12 — Interest score / favori / CRM bugün yok

---

## D13 — Aynı request’te birden fazla event

`RESUBSCRIBE` sonra `TAG_ADDED` (iki satır).

---

## D14 — `reason` ve `channel` ayrı

| Alan | Anlam | Örnek |
|------|--------|--------|
| `reason` | Niyet / bağlam | `signup_form`, `download_template` |
| `channel` | UI yüzeyi | `web_footer`, `web_popup` |

Tek alanda karıştırılmaz.

---

## D15 — `session_id` nullable

Şemada var; MVP’de zorunlu değil. Client yoksa `NULL`. Funnel için ileride anonim id.

---

## D16 — `subscribers.schema_version`

Default `1`. Ucuz backfill / şekil işareti; karmaşık versioning logic yok.

---

## Değişiklik günlüğü

| Tarih | Değişiklik |
|-------|------------|
| 2026-07-25 | İlk taslak |
| 2026-07-25 | v1.0 Final — junction tags, reason/channel, session_id, schema_version, Domain-only BL |
