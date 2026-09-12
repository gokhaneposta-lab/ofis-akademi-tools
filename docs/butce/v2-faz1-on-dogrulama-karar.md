# Faz 1 Öncesi — Son Doğrulama ve Karar Raporu

> **Durum:** Kod değişikliği yapılmadı.  
> **Amaç:** F22→F96 zinciri düzeltilirken yanlış veri kaynağının motora taşınmaması.  
> **Veri:** `Bütçe GT Çalışma_v8.xlsx` + `data/butce/private/mizan-aylik-full.json`

---

## A) F24 kaynak analizi

### Kesin bulgular

#### Excel tarafı (701, C1=`"<13"`)

| Öğe | Değer |
|-----|------:|
| Kaynak | `MEVCUT YIL DEVREDEN KPK!V` |
| V5 tarihi | **31.12.2025** |
| Satır sayısı | **24** (B=1…12, her ay cohort'u için **2 satır**) |
| V ham toplam | **−450.668.683,38** |
| GT F24 (= ×−1) | **+450.668.683,38** |

Cohort yapısı (B = ay cohort'u; V = 31.12.2025 stok):

| B | Satır | V ham toplam |
|---|------:|-------------:|
| 1 | 2 | −3.006.665 |
| 2 | 2 | −5.939.439 |
| … | 2 | … |
| 12 | 2 | −118.253.277 |
| **Toplam** | **24** | **−450.668.683** |

Col **F** = 2025 ay tarihi (cohort ayı); col **H** = 2026 karşılık tarihi. Bu bir **ay cohort aktüeryal stok modeli**.

#### Mizan tarafı (701)

| Dönem | 01212 toplam | 0121201 | 0121211 |
|-------|-------------:|--------:|--------:|
| 2025-12 | **328.509.974,89** | 280.271.521,22 | 48.238.453,67 |
| 2026-01 | **407.148.744,46** | 356.745.254,31 | 50.403.490,15 |
| **Ocak−Ara fark** | **+78.638.769,57** | +76.473.733,09 | +2.165.036,48 |

Mizan `601012` hesap kodu ayrı satırda **0** — motor `01212` GT kodunu kullanıyor.

#### Bridge tablosu

| Kaynak | Tutar | Excel F24 farkı |
|--------|------:|----------------:|
| Excel DEV V (×−1) | +450.668.683 | — |
| Mizan 2026 Ocak 01212 | +407.148.744 | **+43,52M** |
| Mizan 2025 Ara 01212 | +328.509.975 | **+122,16M** |
| 12 cohort tek satır toplamı (ilk bulunan) | +49.148.073 | **+401,52M** |

**Satır düzeyinde bridge kurulamıyor:** Excel B=1…12 ay cohort × 2 satır; mizan branş konsolide + 0121201/0121211 reasürans kırılımı. Ortak anahtar yok.

### Soru E cevabı

**"Excel F24 ile kod 01212 aynı ekonomik bakiyeyi temsil ediyor mu?"**

→ **HAYIR**

| | Excel F24 | Mizan 01212 (kod) |
|--|-----------|-------------------|
| GT satır | 01212 devreden KPK | 01212 devreden KPK |
| Veri hattı | KPK aktüeryal sayfa | GL mizan |
| Ölçüm | Cohort stok snapshot | Branş konsolide bakiye |
| Anker | 31.12.**2025** (V sütunu) | 2026 **Ocak** mizan |
| Kırılım | 24 cohort satır | 1 branş (+0121201/0121211) |
| Tutar | +450,7M | +407,1M |

Aynı **GT satır adı**, farklı **ölçüm sistemi** ve **farklı anker**. Sayısal eşdeğerlik yok.

### 43,52M fark — kanıtlı etkenler

| Etken | Kanıt | Etki |
|-------|-------|------|
| **Cohort vs konsolidasyon** | Excel 24 satır; mizan 1 satır | Toplamlaştırma farkı — bridge yok |
| **Farklı anker** | Excel V=31.12.2025; mizan Ocak 2026 | +78,6M mizan içi Ara→Ocak artışı ayrıca var |
| **GL yıl açılışı** | Mizan 2025-12=328,5M → 2026-01=407,1M | Muhasebe devralma/düzeltme; Excel cohort modelinde karşılığı görülmedi |
| **Aktüeryal vs muhasebe** | Excel DEV sayfası ≠ mizan pipeline | Sistematik fark |

328,5M → 407,1M artışın kaynağı (mizan verisinden):
- **0121201:** +76,5M (brüt devreden bileşeni)
- **0121211:** +2,2M (reasürans bileşeni)
- GL yıl açılışı / devralma kaydı; Excel cohort V stokları bu hareketi yansıtmıyor.

### Hâlâ belirsiz

- 43,52M'nin cohort→GL mutabakat tablosu (Excel'de muhasebe posting bridge sayfası yok)
- İki veri hattının hangisinin bütçe otoritesi olduğu (iş kararı)

### Faz 1'e etkisi

**Öneri (kanıta dayalı):** Faz 1'de **mizan 01212 kaynağını koru**; Excel DEVREDEN'e geçiş yapma.

Gerekçe:
1. Faz 1 kapsamı = F22 birleştirme + post-override kaldırma, **veri hattı değişimi değil**
2. Excel DEVREDEN import + cohort mantığı + C1 filtresi = **yeni feature** (43,5M fark çözülmeden Excel'e geçmek parity vaat etmez)
3. Mizan zaten kodun tasarım niyetiyle uyumlu (`kpkDevreden.ts`: 601012 Ocak devralma)
4. Excel parity için ayrı karar + import pipeline gerekir

---

## B) F11 formül / cache analizi

### Üç değer yan yana (701, C1=`"<13"`)

| Kaynak | Tutar |
|--------|------:|
| **GT!F11 formül sonucu** (Prim `U`, SUMIFS) | **124.722.813,53** |
| **GT!F11 kayıtlı/görünen değer** | **1.311.749.504,22** |
| **YK KPK `J` (TUTAR) toplamı** | **1.311.749.504,22** |
| Fark (cache − formül) | 1.187.026.690,68 |

### Gerçek formül (GT!F11, birebir)

```
=SUMIFS('3-Prim Ay Dağılımı'!$U:$U,
        '3-Prim Ay Dağılımı'!$G:$G, GT!F$5,
        '3-Prim Ay Dağılımı'!$B:$B, GT!$C$1)
```

### Somut kanıt — stale cache

| Kanıt | Değer |
|-------|-------|
| Cache = YK J toplamı | `matchYkJ: true` (fark &lt; 1 TL) |
| Workbook `fullCalcOnLoad` | **`false`** |
| `calcOnSave` | `true` |
| Formül → Prim U | 124,7M (formül metni bunu işaret ediyor) |

**701 için teşhis:** Formül **Prim U**'ya güncellenmiş; hücredeki değer **eski YK J TUTAR toplamı** (yeniden hesaplanmamış cache).

Diğer branşlarda aynı pattern genellenmez:
- 715: cache ≠ YK J ≠ Prim U
- 716: cache ≠ YK J ≠ Prim U

### F11 otoritesi

| Seçenek | 701 için |
|---------|----------|
| **A) Formül sonucu** | Prim U = **124,7M** — formül metni otorite |
| **B) Kayıtlı hücre** | 1,31B — **stale cache**, YK J'den kalmış |
| **C) Başka neden** | Workbook `fullCalcOnLoad=false` → açılışta otomatik recalc yok |

**Karar:** Excel regression için GT!F11 = **1,31B kullanılmamalı**. Formül otoritesi = **124,7M** (Prim U). Cache = stale.

### Faz 1'e etkisi

- Faz 1 **F11 kaynağını değiştirmiyor** (prim dağılım motoru ayrı konu)
- Excel F96 regression **F11 cache'e dayanamaz**
- F11 Excel parity → workbook recalc veya manuel formül sonucu gerekir

---

## C) F23 dönem-parametresi analizi

### C1 sweep (701, YK KPK V = 31.12.2026 sabit)

| C1 | YK satır | F23 (YK V) | DEV satır | F24 (DEV V ×−1) | F22 |
|----|---------:|-----------:|----------:|----------------:|----:|
| `<4` | 6 | −45.994.429 | 6 | +31.940.135 | −14.054.293 |
| `<7` | 12 | −155.060.224 | 12 | +153.867.288 | −1.192.936 |
| `<10` | 18 | −341.686.141 | 18 | +229.295.777 | −112.390.364 |
| `<13` | 24 | −684.018.528 | 24 | +450.668.683 | −233.349.845 |

### Kesin cevaplar

**A) F23 C1'e bağlı mı?** → **EVET.** C1 değişince F23/F24/F22 değişir.

**B) V sütunu C1 ile nasıl etkilenir?** → **Etkilenmez.** V her zaman aynı sütun (YK: 31.12.2026; DEV: 31.12.2025). C1 yalnızca **hangi B cohort satırlarının toplama dahil edileceğini** seçer.

**C) C1 ne filtreler?** → **Ay cohort kapsamı** (B=1…12; `<4` = ilk 3 ay cohort'u = 6 satır çünkü ay başına 2 satır). V stok ankeri değil.

### F11'de C1

| C1 | Prim U (701) | YK J (701) |
|----|-------------:|-----------:|
| `<4` | 124.722.814 | 345.708.607 |
| `<7` | 124.722.814 | 631.865.268 |
| `<13` | 124.722.814 | 1.311.749.504 |

Prim U **C1'den bağımsız sabit** — çünkü 701 Prim sayfasında B yalnızca **1 ve 2** (hepsi `<4` içinde).

YK J **C1 ile ölçeklenir** — cohort satır sayısı arttıkça artar (F11 stale cache'in YK J kaynaklı olmasının kanıtı).

**F23 ve F24 aynı mantıkta:** C1 = cohort kapsam filtresi; stok sütunu (V) sabit.

### Faz 1'e etkisi

- Kod anchor ayı → C1 eşlemesi **gelecek faz** (Dashboard dönem seçici)
- Faz 1: mevcut 12 aylık seri korunur; C1 hardcode edilmemeli

---

## D) F320 metodoloji analizi

### Excel bileşenleri (701)

| Hücre | Yıl | Formül | Değer | F320 ağırlığı |
|-------|-----|--------|------:|--------------:|
| F317 | 2023 | Sabit (UNPIVOT 2023 oranı) | −65,90% | **15%** |
| F318 | 2024 | Sabit (UNPIVOT 2024 oranı) | −113,22% | **0,5%** |
| F319 | 2025 | `UNPIVOT: 61001/(60001+60101+60201)` | −42,89% | **80%** |
| F320 | 2026 | `=(F319×0,8)+(F318×0,005)+(F317×0,15)` | **−44,77%** | — |

UNPIVOT 2025 / 701 doğrulama:
- 61001: −237.904.435
- Baz: 554.649.314
- Oran: −42,89% = F319 ✓

### Kod (0211, Ocak 701)

| Öğe | Değer |
|-----|-------|
| Kalem | 0211 — Brüt Ödenen Hasar Payı |
| Pay/baz | 61001 / (60001+60101+60201) |
| Yıl birleştirme | **[2025: 80%, 2024: 10%, 2023: 10%]** |
| Ocak 701 | ≈ **−20,37%** (teşhis raporu) |
| Kaynak | MizanOranServisi + mizan-aylik-full (Ocak kümülatif) |

### Metodoloji karşılaştırması

| Boyut | Excel F320 | Kod 0211 |
|-------|-----------|----------|
| Temel oran | 61001 / teknik baz | Aynı |
| 2025 ağırlığı | 80% | 80% |
| 2024 ağırlığı | **0,5%** | **10%** |
| 2023 ağırlığı | **15%** | **10%** |
| Veri kaynağı | UNPIVOT MİZAN (yıllık YE) | mizan-tidy + aylık (Ocak küm.) |
| Dönem | GT!C319=2025 tam yıl | Ocak ay=1 snapshot |

Aynı ağırlıkla UNPIVOT oranları kullanılırsa:
```
0,8×(−0,4289) + 0,005×(−1,1322) + 0,15×(−0,6590) = −44,77%  ← Excel ✓
```

Kod ağırlıklarıyla (80/10/10):
```
0,8×(−0,4289) + 0,1×(−1,1322) + 0,1×(−0,6590) ≈ −52,2%  ← kod yönünde farklı
```

**D) Aynı iş kuralının iki implementasyonu mu?** → **Kısmen.** Aynı kalem (0211), farklı **yıl ağırlıkları** (80/0,5/15 vs 80/10/10) ve farklı **dönem/kaynak**.

**E) Ayrılma noktası:** Ağırlık vektörü + veri kaynağı (UNPIVOT YE vs mizan Ocak).

### "F320'yi Faz 1'de değiştirmeli miyiz?"

→ **HAYIR.**

Faz 1 = F22 stale bug. F320 metodoloji farkı bilinçli ayrı konu; sessizce değiştirmek regression riski yaratır.

### Faz 1'e etkisi

- F320 **dokunulmaz**
- Excel F96 regression F320 farkını bilerek kapsar dışı bırakır

---

## Özet tablo

| Konu | Kesin karar | Kanıt | Faz 1'de yapılacak |
|------|-------------|-------|-------------------|
| **F24 kaynak** | Excel ≠ Mizan; aynı bakiye **değil** | 450,7M vs 407,1M; farklı pipeline/anker | **Mizan 01212 koru**; Excel DEVREDEN'e geçme |
| **F24 işareti** | Mizana ×(−1) uygulanmaz | Excel ham negatif; mizan ham pozitif | Mevcut işaret kuralı koru |
| **F11 otorite** | Formül = Prim U (124,7M); cache stale | cache = YK J; fullCalcOnLoad=false | F11'e dokunma; Excel reg. cache kullanma |
| **F23 C1** | C1 = cohort kapsam; V sabit | C1 sweep; V tarihi değişmiyor | C1 hardcode yok; anchor eşlemesi sonraki faz |
| **F320** | Excel 80/0,5/15 ≠ Kod 80/10/10 | UNPIVOT + gt_tam_harita + oranKalemLoader | **Değiştirme** |
| **F22→F96** | HAYIR — hesap F22 ≠ ekran F22 | gelirTablosu.ts akışı | **buildKpkGtHucreleri + override kaldır** |

---

## FAZ 1 KOD DEĞİŞİKLİĞİNE BAŞLAMAK İÇİN YETERLİ Mİ?

→ **EVET** — aşağıdaki sınırlarla:

### Yeterli olan (Faz 1 başlayabilir)

1. F22 = F23+F24 hesap öncesi birleştirme — mimari net
2. Post-override kaldırma — teşhis kesin
3. F24 kaynağı: **mizan 01212 devam** — bilinçli karar, kanıtlı fark kabul
4. F320 / F11: **dokunulmaz** — metodoloji/cache ayrı faz

### Faz 1 regression kapsamı (revize)

| Test | Yapılır | Yapılmaz |
|------|---------|----------|
| 701 Ocak: hesap F22 = ekran F22 | ✓ | |
| F96 = (F11+F22+F32)×F320 tutarlılık | ✓ (kod F11/F320 ile) | |
| Excel GT!F24 = 450,7M eşleşmesi | | ✓ (farklı kaynak) |
| Excel GT!F96 = −482,7M eşleşmesi | | ✓ (F11/F320/anker farkı) |

### Hâlâ açık (Faz 1'i bloklamaz)

1. 43,52M mutabakat bridge'i (Excel cohort → GL) — iş/muhasebe kararı
2. Excel DEVREDEN import (parity hedeflenirse) — ayrı faz
3. F11 workbook recalc — Excel regression için
4. F320 ağırlık hizalama (80/0,5/15) — ayrı faz
5. C1 ↔ Dashboard anchor eşlemesi — ayrı faz

---

*Çıkarım scriptleri: `scripts/_tmp-faz1-dogrulama.ts`, `scripts/_tmp-faz1-bridge.ts` (geçici, silinebilir).*
