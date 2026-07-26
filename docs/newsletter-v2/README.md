# Newsletter v2 — Mimari paket

**Sürüm: v1.0 Final (dondurulmuş)**  
**Tarih: 2026-07-25**  
**Durum:** Onaylı sözleşme — implementasyon bu pakete bağlıdır.

| # | Dosya |
|---|--------|
| 01 | [Architecture](./01_ARCHITECTURE.md) |
| 02 | [Database Design](./02_DATABASE_DESIGN.md) |
| 03 | [API Design](./03_API_DESIGN.md) |
| 04 | [Implementation Plan](./04_IMPLEMENTATION_PLAN.md) |
| 05 | [Product Decisions](./05_PRODUCT_DECISIONS.md) |
| — | [Sprint 1 Test Cases](./TEST_CASES.md) |

## Sözleşme kuralı

Kod yazarken dokümanlardan sapılması gerekirse **önce doküman güncellenir, sonra kod değişir.**  
Mimari ürünün sözleşmesidir.

## Sprint 1 doğrulama durumu

| Madde | Durum |
|-------|--------|
| Kod + `TEST_CASES.md` | Hazır |
| `DATABASE_URL` / migrate | OK |
| Zorunlu TC PASS | **PASS** (TC-01…04, 06…08, 10) — 2026-07-25 |
| Sprint 1 DONE | **Evet** |

Runner: `npm run subscription:sprint1-validate`

| Sprint | Durum |
|--------|--------|
| 1 — Temel altyapı | **DONE** |
| 2 — Welcome + form cutover | **DONE** (2026-07-26) |
| 3 — Unsubscribe + legacy + `/api/abone` | **DONE** (2026-07-26) |
| UX — Welcome footer + `/abonelikten-cik` | **DONE** (2026-07-26) |
| 4 — Campaign Lite | **DONE** (2026-07-27) |
| 5 — Sertleştirme | Bekliyor |

