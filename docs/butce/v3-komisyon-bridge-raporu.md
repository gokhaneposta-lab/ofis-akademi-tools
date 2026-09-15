# Komisyon Bridge Raporu — Ağustos 2026 YTD

Kod/oran/F275/F300/EYE değiştirilmedi. Veri: `mizan-aylik-full.json`, Aug prim replay motoru.

---

## 1) 701 Komisyon Rate Bridge

### Dönem tablosu

| Dönem | Brüt Prim (mn) | Gerçek 61401 (mn) | Gerçek Oran | F275 Oranı* | Ağırlık | F275 Katkısı |
|-------|---------------:|------------------:|------------:|------------:|--------:|-------------:|
| 2022 | 210,27 | −25,60 | **−12,18%** | −13,49% | 10% | −1,35 pp |
| 2023 | 624,78 | −148,03 | **−23,69%** | −21,18% | 15% | −3,18 pp |
| 2024 | 685,67 | −180,73 | **−26,36%** | −29,72% | 25% | **−7,43 pp** |
| 2025 | 845,30 | −195,10 | **−23,08%** | −19,58% | **50%** | **−9,79 pp** |
| 2026 Ağu YTD | 514,17 | −184,21 | **−35,83%** | *(blend dışı)* | — | — |

\*F275 Oranı = `MizanOranServisi` yilOran (pay 61401 ÷ baz 60001, mizan prefix). Gerçek Oran = GT 0251 ÷ 0111 (701).

### F275 matematiksel oluşumu (701, anchor=8)

```
F275 = 0,50 × (−19,58%) + 0,25 × (−29,72%) + 0,15 × (−21,18%) + 0,10 × (−13,49%)
     = −9,79 + −7,43 + −3,18 + −1,35
     = −21,75%
```

| Yıl | Ağırlık | F275 yilOran | Katkı |
|-----|--------:|-------------:|------:|
| 2025 | 50% | −19,58% | −9,79 pp |
| 2024 | 25% | −29,72% | −7,43 pp |
| 2023 | 15% | −21,18% | −3,18 pp |
| 2022 | 10% | −13,49% | −1,35 pp |
| **Toplam** | 100% | | **−21,75% = F275** |

**2026 fiili vs F275:**
- Gerçek oran: **−35,83%**
- F275 motor: **−21,75%**
- Fark: **−14,08 pp** → parasal: **514,17 × 14,08% ≈ −72,4 mn** (= 701 komisyon gap'inin tamamı)

### 2024 oranı F275'i nasıl etkiliyor?

**Counterfactual:**
- 2024 **olmasaydı** F275 ≈ **−19,09%** (2025 baskın)
- 2024 **eklenince** F275 → **−21,75%** (2,66 pp daha negatif)

2024 (−29,72%) blend'in en yüksek yıllık oranı; %25 ağırlıkla **−7,43 pp** katkı verir ve F275'i **daha negatife** çeker.  
Ancak **2025 %50 ağırlık × −19,58% = −9,79 pp** baskın terimdir ve F275'i **yukarı (sıfıra doğru, daha az negatif)** tutar.

**2026 −35,83% neden bu kadar uzak?**  
2026 Ağu YTD oranı, blend'deki **tüm geçmiş yılları** (2024 dahil −29,7%) aşıyor. F275 tarihsel ortalama; 2026 fiili **branş komisyon şoku** taşıyor (2025 tam yıl −23% iken 8 ayda −35,8%).

---

## 2) 61401 Şirket — 0251199 Endirekt Bridge

### Gerçek yapı (Ağu YTD)

| Kalem | Tutar (mn) |
|-------|----------:|
| 0251101 Banka | −1.861,63 |
| **0251199 Endirekt** | **−505,10** |
| **61401 Toplam** | **−2.366,74** |

### 0251199 — 7xx dağılımı

| 7xx | 0251199 (mn) | Şirket payı % | Motor kapsamı | Açıklama |
|-----|-------------:|--------------:|:-------------:|----------|
| **777** | −368,28 | 72,9% | **YOK** | En büyük endirekt komisyon branşı |
| **779** | −98,45 | 19,5% | **YOK** | |
| **783** | −16,86 | 3,3% | **YOK** | |
| **776** | −15,16 | 3,0% | **YOK** | |
| **778** | −2,62 | 0,5% | **YOK** | |
| **782** | −2,44 | 0,5% | **YOK** | |
| **773** | −0,83 | 0,2% | **YOK** | |
| **715** | −0,47 | 0,1% | **YOK** | |
| **701** | **0,00** | 0% | — | Endirekt komisyon yok |
| **TOPLAM** | **−505,10** | 100% | **F188=0** | |

### 0251199 ekonomik olarak ne?

| Kaynak | Tanım |
|--------|-------|
| `gt_tam_harita.json` | **F188 = F15 × F431** (Endirekt prim × endirekt komisyon oranı) |
| `gt_sirket_format.json` | GT 0251199 → hesap **61401199** "Diğer Üretim Komisyonu Giderleri" |
| `oran_kalem_excel.json` | Kalem **0251199**, oran hücresi **F431**, pay 61401199 |
| `oranKalemLoader.ts` | `0251199`: pay 61401199, baz endirekt prim, `F15×F431` |
| `aylikGtBilancoImport.ts` | 61401199 ← GT prefix 0251199, "KOMISYON GIDER" filtresi |

**Endirekt = banka dışı (777/779 vb. tarife) üretim komisyon gideri; baz F15 (endirekt prim), oran F431.**

### F177 motoru 0251199'u bilinçli mi dışlıyor?

**Cevap: Eksik modelleme — bilinçli kapsam tercihi değil.**

| Kanıt | Detay |
|-------|-------|
| Oran altyapısı **var** | F431 / 0251199 `oranKalemLoader.ts` ve `oran_kalem_excel.json`'da tanımlı |
| Excel GT formülü **var** | `gt_tam_harita`: F188 = F15×F431 |
| Motor haritası **sıfırlıyor** | `gt_excel_harita.json` satır 188: **`formul: 0`, `tip: deger`** |
| F177 etkisi | F177 = F178 + F189; F178 = … + **F188** → F188=0 olduğu sürece 0251199 **asla** F177'e girmez |
| `gtMotoru.ts` | F188 için `carpim` tanımı yok; sabit 0 |

Excel'in tam modelinde endirekt ayrı; 3-dosya motoru F188'i hardcode 0 yaparak **devre dışı bırakmış**. Oran motoru F431'ü hesaplayabilir ama GT satırına bağlanmıyor.

---

## 3) Deferred Komisyon Bridge

### Gerçek Ağu YTD (yaprak GT kodları)

**61401 deferred (0251101010102 + 0251101110102):**

| Kapsam | Deferred net (mn) | Cari 0101 (mn) | 0251101 Banka (mn) |
|--------|------------------:|---------------:|-------------------:|
| **Şirket** | **−44,13** | −1.814,64* | −1.861,63 |
| **701** | **+4,26** | −186,84* | −184,21 |

\*Yaprak 0101 kodları toplamı.

**61407 deferred:** Mizan GT exportunda 02571 altında ayrı 0102 deferred kodu **yok**; 61407 = 02571 bütün olarak raporlanıyor. Excel'de F198 (ertelenmiş RE komisyon geliri) KPK sayfalarından gelir — mizan GT'de ayrıştırılamadı.

### Motor: F181 / F198 neden 0?

| Satır | Excel formülü | Motor tipi | Sonuç |
|-------|---------------|------------|-------|
| **F181** Ertelenmiş Komisyon Gideri | `SUMIFS('YK KPK'…)` + `SUMIFS('MEVCUT YIL DEVREDEN KPK'…)` | `dis_sayfa` | **0** |
| **F198** Ertelenmiş RE Komisyon Geliri | Aynı KPK sayfaları | `dis_sayfa` | **0** |

`gtMotoru.ts`: `DIS_GIRDI_TIP = { dis_sayfa, mizan_oran, oran_birlestirme }` → değer 0.

**Sınıflandırma:**
- Gerçekten model dışı mı? → **Evet** (KPK Excel sayfaları 3-dosya modelde yok)
- Ayrı GT satırına mı gidiyor? → Excel'de **evet** (F181/F198); motorda **hayır** (0)
- Başka hesapta mı? → **Hayır**
- Hiç hesaplanmıyor mu? → **Evet, motor = 0**

### Parasal etki

| | Şirket | 701 |
|---|-------:|----:|
| Deferred 61401 (gerçek, motor=0) | −44,13 mn | +4,26 mn |
| 61407 deferred | Ayrıştırılamadı | — |

701'de deferred **pozitif** (+4,26 mn) → gerçek 61401, cari-only modele göre **daha az negatif** (gider azaltıcı). Etki küçük; 701 gap'inin **~%6'sı**, yön ters.

---

## 4) 61407 — Ayrı Kontrol

| | Gerçek 02571 | Motor F196 | Fark |
|---|------------:|-----------:|-----:|
| **701** | +43,14 mn | +44,07 mn | **−0,93 mn** |
| **Şirket** | +1.498,93 mn | +1.586,62 mn | **−87,63 mn** |

701 neredeyse birebir: F300 = **8,57%** vs fiili **8,39%** → −0,93 mn.

### Şirket −88 mn — 7xx fark dağılımı (en büyükler)

| 7xx | Brüt Prim (mn) | Gerçek 02571 | F300 | Fiili Oran | Motor F197 | Fark (mn) |
|-----|---------------:|-------------:|-----:|-----------:|-----------:|----------:|
| **777** | 5.115,11 | 860,87 | 17,86% | 16,83% | 913,58 | **−52,71** |
| 716 | 281,91 | 31,67 | 3,79% | 11,23% | 10,70 | +20,97 |
| **717** | 1.782,78 | 61,67 | 4,56% | 3,46% | 81,33 | **−19,67** |
| **779** | 1.019,32 | 63,11 | 7,03% | 6,19% | 71,70 | **−8,59** |
| 715 | 3.683,20 | 182,48 | 5,14% | 4,95% | 189,27 | −6,79 |

**Kök neden (61407):**
- **Deferred RE:** Kanıt yok (ayrıştırılamadı; F198=0 ama fark RE cari oranından geliyor)
- **F300 oranı + branş dağılımı:** **EVET** — şirket fiili **9,84%** vs motor impl. **10,41%**
- **777 tek başına −53 mn** (toplam gap'in %60'ı): dev prim bazında F300 (17,86%) > fiili (16,83%)
- 701: prim küçük, F300 neredeyse doğru → fark ihmal edilebilir

---

## 5–6) Rate vs Scope + Forecast sorusu

---

## RATE PROBLEM

**Bulgular:** Motor F275/F300 = 2022–25 ağırlıklı tarihsel oran; 2026 Ağu YTD fiili oranlar belirgin farklı (701 komisyonda −14 pp).

**Parasal etki:**

| Kalem | Şirket 61401 | 701 61401 | Şirket 61407 |
|-------|-------------:|----------:|-------------:|
| Rate etkisi | ~**−296 mn** (toplam gap ≈ rate) | **−72,4 mn** (gap'in %100'ü) | **−87,6 mn** (gap'in ~%100'ü) |

**701:** 514,17 × (−35,83% − (−21,75%)) = **−72,4 mn** — tek açıklayıcı.

**Şirket 61401:** 15.238 × (−15,53% − (−13,59%)) ≈ **−296 mn**. Toplam gap tamamen **fiili vs F275 effective rate** farkı olarak yazılabilir.

**Şirket 61407:** F300 × prim branş dağılımı; 777/717/779 domine.

**Kanıt:** Rate bridge tablosu; F275 matematik; 7xx RE fark tablosu.

---

## SCOPE PROBLEM

**Bulgular:** Gerçek muhasebe ağacının tamamı F177/F196 motor satırında yok.

**0251199:**
- Gerçek: **−505,10 mn** (8 branş; 777 = %73)
- Motor: **0** (F188 hardcode 0)
- 701: **0** (scope sorunu yok)

**Deferred:**
- 61401 şirket: **−44,13 mn** (motor F181=0)
- 61401 701: **+4,26 mn** (motor F181=0; küçük, ters yön)
- 61407: mizanda ayrıştırılamadı; F198=0

**701:** Scope etkisi **ihmal edilebilir** (endirekt 0, deferred +4 mn).

**Şirket:** Scope etkisi **anlamlı** — endirekt −505 mn motor dışı.

**Kanıt:** `gt_excel_harita.json` F188=0 vs `gt_tam_harita.json` F188=F15×F431; mizan 0251199 branş tablosu.

### Şirket 61401 — etkilerin netting'i

Motor tek oran (F180 ≈ F177) = **−2.070 mn** tüm prim üzerinde.

| Bileşen | Etki (mn) | Yön |
|---------|----------:|-----|
| Motor bankayı ** fazla ** tahmin eder (uniform F275 > banka fiili) | **+208,7** | Motor daha negatif |
| Endirekt 0251199 ** eksik** | **−505,1** | Gerçekte var, motorda yok |
| Deferred F181 ** eksik** | **−44,1** | Gerçekte var, motorda yok |
| **Net gap** | **−296,4** | +208,7 − 505,1 ≈ −296 ✓ |

---

## 61407

**Bulgular:** Kapsam büyük ölçüde eşleşir (614071=02571). Sapma **rate + mix**.

**701:** −0,93 mn — F300 −0,18 pp; **rate only**.

**Şirket:** −87,63 mn — **F300 tarihsel > 2026 fiili**, ağırlık **777** (5,1 mr prim).

**Kök neden:** Rate problem (F300), branş dağılımı ile amplifiye; deferred kanıt yok.

---

## KOMİSYON FARKININ KAYNAK DAĞILIMI

### 61401 — Şirket (net gap −296 mn)

| Neden | Yaklaşık etki (mn) | Payı* |
|-------|-------------------:|------:|
| Rate (F275 effective vs 2026 fiili, toplam prim) | −296 | ~100% net |
| Scope — 0251199 endirekt (brüt, motor=0) | −505 | (brüt scope) |
| Rate — motor bankayı uniform F275 ile fazla yazar | +209 | (netting) |
| Scope — deferred F181 | −44 | (küçük) |

\*Net gap tek kaleme indirgenebilir (rate); scope kalemleri **zıt yönde netting** yapar.

### 61401 — 701 (net gap −72 mn)

| Neden | Yaklaşık etki (mn) | Payı |
|-------|-------------------:|-----:|
| **Rate (F275 vs −35,83% fiili)** | **−72,4** | **~100%** |
| Scope — deferred | +4,3 | ~%6 (ters yön) |
| Scope — endirekt | 0 | 0% |

### 61407 — Şirket (net gap −88 mn)

| Neden | Yaklaşık etki (mn) | Payı |
|-------|-------------------:|-----:|
| Rate (F300 + branş mix) | −88 | ~100% |
| Deferred RE (F198) | Kanıt yok | — |

---

## Forecast sorusu (2026 Estimated YE)

> Sorun esas olarak **RATE mi, SCOPE mu, ikisi mi?**

| GT satırı | Cevap | Gerekçe |
|-----------|-------|---------|
| **61401 / F177 — 701** | **RATE** | Gap'in %100'ü F275 vs 2026 fiili; scope ≈ 0 |
| **61401 / F177 — Şirket** | **İKİSİ BİRLİKTE** | Net gap rate gibi görünür (−296); ama −505 endirekt scope + +209 rate netting |
| **61407 / F196** | **RATE (+ mix)** | Scope OK; F300 > fiili, 777 ağırlıklı |

**Yaklaşık parasal katkılar (61401 şirket):**
- Rate (net): **~−296 mn**
- Scope endirekt (brüt, motor dışı): **~−505 mn**
- Scope deferred: **~−44 mn**
- *(Netting: +209 mn motor banka fazlası scope+rate etkileşimi)*

**61401 701:** Rate **−72 mn**; Scope **~0 mn** (net).

**61407 şirket:** Rate **−88 mn**; Scope **~0 mn**.

---

## KÖK SEBEP

1. **701 komisyon gap'i saf RATE problemi:** 2026 fiili −35,8% vs F275 −21,75%; 2025 %50 ağırlığı blend'i yukarı çeker, 2026 tarihselin üzerine çıkar.

2. **Şirket 61401 gap'i RATE + SCOPE netting:** −505 mn endirekt (0251199/F188=0) motor dışı; uniform F275 bankayı +209 mn fazla yazar; net −296 mn.

3. **61407 şirket gap'i RATE (F300 × branş mix):** 701 eşleşir; şirkette 777 branş domine (−53 mn).

---

## HENÜZ DEĞİŞTİRİLMEYECEKLER

- F275
- F300
- Brüt Prim girdisi
- EYE
- Mevcut GT motoru

---

*Veri: `data/butce/out/_komisyon-bridge.json` · Script: `scripts/_tmp-komisyon-bridge.ts`*
