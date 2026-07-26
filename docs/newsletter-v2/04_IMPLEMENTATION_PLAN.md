# 04 — Implementation Plan

**Proje:** Ofis Akademi — Newsletter v2  
**Durum:** v1.0 Final (implementasyon onayı sonrası başlar)  
**Önkoşul:** Mimari v1.0 Final onaylı

---

## 0. Önceliklendirme ilkesi

1. Source of truth (DB + `subscriber_tags` + event) önce  
2. Doğru tag / mapping  
3. Welcome kişiselleştirme  
4. Resend aynalama  
5. Legacy migration  
6. Eski `/api/abone` kapatma  

UI cilası ve admin panel en sonda. Business logic Domain’de kalır.

---

## Sprint 1 — Temel altyapı

**Hedef:** DB ayakta; subscribe yazıyor; Resend’siz bile kayıt kalıcı.

| İş | Çıktı |
|----|--------|
| Postgres (Neon/Vercel) + env | `DATABASE_URL` |
| Migration: `subscribers` + `subscriber_tags` + `subscription_events` | DDL |
| `subscription-rules` config | path → tag |
| Domain: Subscription / Tag / Event servisleri | |
| `POST /api/subscriptions` | outcome’lar |
| Rate limit | IP + email |

**Done:** Aynı email iki kategoriden → iki tag satırı + anlamlı event’ler.  
**Doğrulama:** [`TEST_CASES.md`](./TEST_CASES.md) — TC-01…04, 06…08, 10 **PASS** (2026-07-25). **Sprint 1 DONE.**

**Yok (Sprint 2+):** Welcome, unsubscribe UI, Resend sync, legacy.

---

## Sprint 2 — Welcome + Resend + form

| İş | Çıktı |
|----|--------|
| WelcomeEmailService (kategori şablonları) | `lib/subscription/welcome.ts` |
| Soft-fail welcome | DB OK, `welcomeSent` flag |
| Form: `page`, `reason`, `channel`, UTM | NewsletterForm + HomeClient |
| Gizlilik metni | `/gizlilik` |

**Done:** 2026-07-26 — TSB/Excel cutover; soft-fail doğrulandı.

---

## Sprint 3 — Unsubscribe + legacy + deprecate

| İş | Çıktı |
|----|--------|
| Signed unsubscribe + global | `unsubscribeToken.ts` + `POST .../unsubscribe` |
| Legacy migration → tag `legacy` | `subscription-migrate-legacy.ts` (idempotent) |
| `/api/abone` wrapper/deprecate | Domain `subscribe`; çift welcome yok |

**Done:** 2026-07-26 — TC-05 + TC-09 smoke PASS; `/api/abone` Domain wrapper.

---

## Sprint 4 — Campaign Lite

| İş | Çıktı |
|----|--------|
| `campaigns` + `campaign_sends` | `002_campaigns.sql` |
| Tag → audience count / list | Domain `lib/subscription/campaign.ts` |
| Admin panel (butce auth) | `/newsletter-admin` |
| Test + send via Resend | `/api/newsletter-admin/...` |
| Unsub footer otomatik | `appendCampaignFooter` |

**Done kapısı:** smoke + build; Contacts sync yok.

---

## Sprint 5 — Sertleştirme (sonra)

| İş | Çıktı |
|----|--------|
| Bounce/complaint webhook iskelet | |
| Opsiyonel queue / büyük kitle | |
| Doküman ↔ kod uyum | |

---

## Riskler

| Risk | Azaltma |
|------|---------|
| DB kurulumu gecikir | Erken Neon + env |
| `page` boş → general | Form pathname zorunlu |
| Welcome soft-fail görünmez | Log / metric |
| Çift submit | `already_subscribed` |

---

## Teknik borç (bilinçli)

Admin UI, interest score, kategori unsubscribe, zorunlu session — sonra.

**Neon HTTP client:** Sprint 1’de multi-statement transaction yok (ardışık auto-commit). Kısmi yazım riski düşük; Sprint 4’te Pool/transaction ile sıkılaştırılabilir.

**Kod yazımı: mimari v1.0 Final onayından sonra.**
