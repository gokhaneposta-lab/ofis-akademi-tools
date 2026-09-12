# EYE (Estimated YE) — Validation Raporu ve Metrik Sözlüğü

Tarih: 2026-09-13  
Bütçe yılı: 2026  
Referans branş: **701 Yangın**  
Snapshot: `data/butce/out/2026-EYE-7-v1.json`  
Validation script: `scripts/butce-eye-701-validate.ts`

Bu belge, EYE implementasyonu sonrası validation sonuçlarını ve `quality.kpkRecon` metriğinin doğru yorumunu tanımlar. **Kod değişikliği gerektirmez**; terminoloji ve raporlama standardıdır.

---

## 1. `quality.kpkRecon` — resmi tanım

**Anlam:**

> Cutoff ayındaki mizan 01211 kümülatif stok ile aynı cutoff ayındaki bütçe-prim rolling KPK motor stokunun göreli mutlak sapmasıdır.

**Formül:**

```
kpkRecon = |mizanF23 − budgetMotorF23| / |budgetMotorF23|
```

| Terim | Kaynak |
|-------|--------|
| `mizanF23` | `mizan-aylik-full` → GT `01211` kümülatif stok (kesim ayı, indeks `anchor−1`) |
| `budgetMotorF23` | `buildKpkSonuc(..., aylikPrim)` → `gtAylik[23][anchor−1]`; prim girdisi V3 tarife/bütçe dağılımı |

**Kapsam:** Yalnızca **tek ay** — kesim (cutoff) ayı. Forecast ayları skaler `kpkRecon` değerine dahil edilmez.

**Bu metrik ne değildir (yanlış yorumlama):**

- ❌ “KPK muhasebe recon'u”
- ❌ “KPK doğruluk oranı”
- ❌ Mizan-prim motor ile actual GL stok uyumu

**Doğru sınıf:** Bütçe-prim motor profili ile mizan GL stok seviyesi arasındaki **kalite / bilgi uyarısı** (quality warning).

### 701 — Temmuz 2026 örneği (kesim=7)

| Girdi | Değer |
|-------|-------|
| Mizan F23 (01211 stok) | −389,09 mn |
| Bütçe-prim motor F23 | −580,29 mn |
| `kpkRecon[701]` | **0,329 ≈ %32,9** |

Bütçe hedef prim (701): ~1.189 mn (`primKaynak: tarife_ana_2025`); Temmuz bütçe-prim girdisi ~112 mn vs mizan gerçekleşen F11 ~70 mn.

---

## 2. Ayrı kontrol — Mizan-prim rolling motor reconciliation

Önceki bağımsız doğrulama **farklı bir kontroldür** ve `kpkRecon` ile karıştırılmamalıdır.

**Resmi ad:**

> **Mizan-prim rolling motor ile actual GL stock reconciliation**

**Yöntem:** Rolling KPK motoru, cari yıl prim girdisi olarak **mizan gerçekleşen prim** (`gercekPrimFromMizan` / `0111` incremental) ile beslenir; sonuç mizan `01211` kümülatif stok ile karşılaştırılır.

**701 Temmuz 2026 sonucu:**

| Girdi | Değer |
|-------|-------|
| Mizan 01211 stok | −389,09 mn |
| Mizan-prim motor F23 | −389,82 mn |
| Göreli sapma | **≈ %0,2** |

Bu kontrol, actual KPK stok kilidinin rolling motor ile tutarlı olduğunu gösterir. `%0,2` ile `%32,9` **çelişmez** — farklı motor prim girdisi kullanırlar.

---

## 3. Cutoff ve test kapsamı (maxMizanAy)

Mevcut veri durumu:

| Parametre | Değer |
|-----------|-------|
| `maxMizanAy` | **7** (Temmuz) |
| Gerçek veriyle test edilen cutoff | **kesim = 7** |
| Kesim 10 isteği | **7'ye clamp** — Ekim mizanı yok |
| Kesim 11 isteği | **7'ye clamp** — Kasım mizanı yok |

**Raporlama kuralı:** Aşağıdaki ifade **kullanılmaz:**

> ~~"kesim 7/10/11 PASS"~~

**Doğru ifade:** Yalnızca **kesim=7** gerçek mizan verisiyle test edilmiştir. Kesim 10 ve 11 senaryoları `maxMizanAy` kısıtı nedeniyle efektif anchor=7 ile **aynı senaryonun tekrarıdır**; ayrı cutoff doğrulaması değildir.

Validation script ham çıktısında `=== SONUÇ: PASS ===` görülse bile, bu yalnızca teknik zincir kontrolünü ifade eder (bkz. Bölüm 4).

---

## 4. EYE validation sınıflandırması (2026-09-13)

| Kontrol | Sonuç | Not |
|---------|-------|-----|
| **Technical chain validation** | **PASS** | Forecast aylarda F22=F23+F24; F96=ΔYTD((YTD_F11+F22_stok+YTD_F32)×F320). Branş 701, efektif kesim=7. |
| **Actual KPK lock validation** | **PASS** | Actual aylar (1–7): GT F23 = mizan `01211` kümülatif stok. 701 Temmuz: −389,09 mn. |
| **Budget-motor vs actual KPK divergence** | **INFORMATION / QUALITY WARNING** | `kpkRecon[701]` ≈ 0,33. Bütçe-prim motor (−580 mn) ≠ mizan stok (−389 mn). Forecast tasarımı gereği beklenen profil farkı; KPK kilidi hatası değil. |
| **Cutoff 10/11 real-data validation** | **NOT YET TESTED** | `maxMizanAy=7`. Ekim/Kasım mizanı gelince yeniden koşulacak. |

### Teknik zincir — 701 özet (kesim=7)

| Metrik | Değer |
|--------|-------|
| Actual F11 YTD (1..7) | 451,23 mn |
| Actual F23 stok (ay 7) | −389,09 mn |
| Forecast F96 (ay 8) | 225,69 mn |
| Snapshot | `2026-EYE-7-v1.json` |
| `quality.f105Proxy` | `true` |

Kesim 10/11 koşularında tüm sayılar kesim=7 ile **birebir aynıdır** (clamp kanıtı).

---

## 5. İki metrik yan yana — hızlı referans

| | `quality.kpkRecon` | Mizan-prim GL reconciliation |
|--|-------------------|------------------------------|
| **Motor prim girdisi** | Bütçe/tarife `aylikPrim` | Mizan gerçekleşen prim |
| **Pay (701 Tem)** | −389,09 mn (mizan stok) | −389,09 mn (mizan stok) |
| **Payda (701 Tem)** | −580,29 mn (bütçe motor) | −389,82 mn (mizan-prim motor) |
| **701 Temmuz sapma** | ~%33 | ~%0,2 |
| **Anlam** | Bütçe profili vs GL stok farkı | Actual lock doğrulaması |
| **Rapor sınıfı** | Quality warning | Validation pass |

---

## 6. İlgili dosyalar

| Dosya | Açıklama |
|-------|----------|
| `lib/butce/v3/kpkMizanStok.ts` | `kpkReconOrani` formülü |
| `lib/butce/v3/estimatedYeForecastLayer.ts` | `kpkRecon` hesaplama (kesim ayı tek nokta) |
| `lib/butce/v2/gercekPrimFromMizan.ts` | Mizan-prim reconciliation girdisi |
| `data/butce/out/_kpk-recon-exact.txt` | 701 aylık karşılaştırma tablosu (analiz çıktısı) |

---

*Bu rapor, EYE validation terminolojisinin resmi referansıdır. Ham script çıktısı (`_eye-validate.txt`) yorumlanırken Bölüm 3–4 kuralları uygulanmalıdır.*
