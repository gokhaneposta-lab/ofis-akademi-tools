# 2026 Komisyon Oran Trend Analizi — Ocak–Ağustos

**Amaç:** Estimated YE komisyon forecast'inde 2026 fiili oran bilgisinin kullanılıp kullanılmamasına veri desteği.  
**Kapsam:** Analiz only — F275/F300 motor oranları **değiştirilmedi**.  
**Kaynak:** `mizan-aylik-full.json` (GT kodları: 0111=brüt prim, 0251=61401, 0251101=banka, 0102 yaprak=deferred, 0251199=endirekt).  
**Aylık tutar:** Ay sonu YTD kümülatif farkı (Ocak = YTD; Şubat = Şub YTD − Oca YTD …).

---

## 1) 701 Aylık Oran Trendi

| Ay | Brüt Prim (mn) | 61401 (mn) | Gerçek Oran | Banka (mn) | Deferred (mn) | Endirekt (mn) |
|----|---------------:|-----------:|------------:|-----------:|----------------:|--------------:|
| Oca | 70,87 | −18,74 | **−26,45%** | −18,74 | −0,60 | 0 |
| Şub | 53,44 | −33,57 | **−62,81%** | −33,57 | +1,04 | 0 |
| Mar | 63,72 | −29,12 | **−45,70%** | −29,12 | −5,45 | 0 |
| Nis | 70,92 | −16,47 | **−23,23%** | −16,47 | −4,38 | 0 |
| May | 35,37 | −23,40 | **−66,15%** | −23,40 | −8,87 | 0 |
| Haz | 86,84 | −18,74 | **−21,58%** | −18,74 | +12,03 | 0 |
| Tem | 70,07 | −26,29 | **−37,52%** | −26,29 | +3,31 | 0 |
| **Ağu** | 62,94 | −17,88 | **−28,40%** | −17,88 | +7,18 | 0 |

701'de endirekt **sıfır**; banka = 61401 (tüm komisyon banka kanalında).

### 701 YTD oran (kümülatif)

| Ay | YTD Brüt Prim | YTD 61401 | **YTD Oran** |
|----|-------------:|----------:|-------------:|
| Oca | 70,87 | −18,74 | −26,45% |
| Şub | 124,31 | −52,31 | −42,08% |
| Mar | 188,03 | −81,43 | −43,30% |
| Nis | 258,95 | −97,90 | −37,81% |
| May | 294,32 | −121,30 | −41,21% |
| Haz | 381,16 | −140,04 | −36,74% |
| Tem | 451,23 | −166,33 | −36,86% |
| **Ağu** | **514,17** | **−184,21** | **−35,83%** |

YTD oranı Mart'ta −43,3% zirvesine ulaştı; Haziran–Ağustos **−36% ile −35,8% bandında stabilize** oldu.

---

## 2) Şirket Toplam Trend

| Ay | Brüt Prim (mn) | 61401 (mn) | Gerçek Oran | Banka (mn) | Deferred (mn) | Endirekt (mn) |
|----|---------------:|-----------:|------------:|-----------:|----------------:|--------------:|
| Oca | 2.798,48 | −217,99 | **−7,79%** | −182,97 | +43,78 | −35,02 |
| Şub | 3.018,55 | −253,59 | **−8,40%** | −208,10 | +82,69 | −45,48 |
| Mar | 2.068,86 | −320,59 | **−15,50%** | −250,15 | +6,00 | −70,44 |
| Nis | 1.893,74 | −294,59 | **−15,56%** | −217,54 | +1,62 | −77,05 |
| May | 1.502,60 | −340,32 | **−22,65%** | −255,10 | −59,75 | −85,22 |
| Haz | 1.696,37 | −350,68 | **−20,67%** | −266,45 | −13,58 | −84,24 |
| Tem | 1.353,48 | −339,28 | **−25,07%** | −271,26 | −63,27 | −68,02 |
| **Ağu** | 905,83 | −249,69 | **−27,57%** | −210,06 | −41,62 | −39,64 |

### Şirket YTD oran

| Ay | YTD Brüt Prim | YTD 61401 | **YTD Oran** |
|----|-------------:|----------:|-------------:|
| Oca | 2.798,48 | −217,99 | −7,79% |
| Şub | 5.817,03 | −471,58 | −8,11% |
| Mar | 7.885,90 | −792,17 | −10,05% |
| Nis | 9.779,64 | −1.086,76 | −11,11% |
| May | 11.282,24 | −1.427,08 | −12,65% |
| Haz | 12.978,61 | −1.777,77 | −13,70% |
| Tem | 14.332,08 | −2.117,04 | −14,77% |
| **Ağu** | **15.237,92** | **−2.366,74** | **−15,53%** |

Şirket YTD oranı **monoton yükseliyor** (mutlak değer): −7,79% → −15,53%. Komisyon yoğunluğu yıl içinde **sürekli artıyor**.

Endirekt payı: Ocak −35 mn → May −85 mn → Ağu −40 mn (aylık); YTD endirekt toplam −505 mn.

---

## 3) YTD vs Aylık — Ağustos Özet

| | 701 | Şirket |
|---|-----|--------|
| **Ağu aylık oran** | −28,40% | **−27,57%** |
| **Ağu YTD oran** | **−35,83%** | **−15,53%** |
| Fark (YTD − aylık) | YTD daha negatif | **Aylık çok daha negatif** |

**701:** YTD (−35,8%) > aylık (−28,4%) — erken aylar (Şub −62,8%, May −66,2%) YTD'yi yukarı çekmiş, son aylar daha hafif.

**Şirket:** Ters pattern — **Ağu aylık (−27,6%) >> YTD (−15,5%)**. Son aylar komisyon yoğunluğu hızla artıyor; YTD ortalaması **güncel trendin altında kalıyor**.

---

## 4) Stabilite Testi

| Metrik | 701 | Şirket |
|--------|-----|--------|
| Ocak–Ağu ortalama aylık oran | **−38,98%** | **−17,90%** |
| Medyan aylık oran | −32,96% | −18,11% |
| Standart sapma | **±17,62 pp** | **±7,36 pp** |
| **Ağustos YTD oranı** | **−35,83%** | **−15,53%** |
| Son 3 ay ortalama (Haz–Tem–Ağu) | −29,17% | **−24,43%** |
| Son 3 ay trend (Ağu − Haz aylık) | −6,82 pp | −6,89 pp |

**701:** Aylık oran **yüksek volatilite** (σ=17,6 pp; May −66% outlier). YTD −35,8% son 3 ay ortalamasından (−29,2%) **daha negatif** — erken ay şokları YTD'de hâlâ baskın.

**Şirket:** Daha düşük volatilite (σ=7,4 pp) ama **net yükselen trend**. Son 3 ay ortalaması (−24,4%) >> YTD (−15,5%) — **güncel trend YTD'nin çok üstünde**.

---

## 5) F275 ile Karşılaştırma

| | F275 (motor) | Ağu YTD fiili | Fark | Son 3 ay ort. |
|---|-------------:|--------------:|-----:|--------------:|
| **701** | −21,75% | **−35,83%** | **−14,08 pp** | −29,17% |
| **Şirket** | −13,59% | **−15,53%** | **−1,95 pp** | **−24,43%** |

| Referans | 701 | Şirket |
|----------|-----|--------|
| F275 | −21,75% | −13,59% |
| Ağu YTD | −35,83% | −15,53% |
| Ağu aylık | −28,40% | −27,57% |
| Oca–Ağu ort. aylık | −38,98% | −17,90% |

**701:** F275, tüm 2026 referanslarından **bariz düşük** (en yakın: son 3 ay −29,2%, hâlâ +7,5 pp gap).

**Şirket:** F275 (−13,6%) ≈ Ağu YTD (−15,5%) ama **son 3 ay (−24,4%) ve Ağu aylık (−27,6%) çok daha yüksek** — F275 güncel trendi **ciddi eksik** tahmin eder.

---

## 6) Forecast Kararı — Veri Desteği (metodoloji seçilmedi)

> 2026 EYE komisyon forecast'inde hangi oran kaynağı veriyle daha savunulabilir?

| Seçenek | 701 — veri desteği | Şirket — veri desteği |
|---------|-------------------|----------------------|
| **A) Mevcut F275/F300'ü korumak** | **Zayıf** — 14 pp gap; hiçbir 2026 referansına yakın değil | **Kısmi** — YTD'ye yakın (2 pp) ama son 3 ay/Ağu aylık'tan 9–14 pp aşağı |
| **B) 2026 Ağu YTD oranını kullanmak** | **Güçlü** — YTD Haz–Ağu bandında stabilize (−35,8%); aylık ortalamadan daha az gürültülü | **Orta** — YTD monoton artıyor ama Ağu aylık (−27,6%) >> YTD (−15,5%); YTD **güncel trendi eksik** yansıtır |
| **C) Son 3 ay trendini kullanmak** | **Orta** — F275'ten iyi (−29,2%) ama YTD'den (**−35,8%**) 6,7 pp aşağı; Haz −21,6% outlier düşürüyor | **Güçlü** — Son 3 ay (−24,4%) güncel ivmeyi yakalar; F275'ten 11 pp yukarı; Ağu aylık'a yakın |
| **D) Kontrollü blend** | **Mantıklı** — Yüksek aylık volatilite (σ=17,6 pp) tek kaynağı desteklemez; YTD stabilizasyon + son ay sinyali birlikte daha tutarlı | **En mantıklı** — YTD (düşük) ve son 3 ay (yüksek) bilinçli ayrışıyor; blend ikisini dengeleyebilir |

### Veri ile öne çıkan bulgular

1. **701 ve şirket farklı dinamik:**
   - 701: YTD stabilize, aylık çok oynak → **YTD oranı** tek başına en savunulabilir tek kaynak
   - Şirket: Monoton YTD artış + son aylar hızlanması → **YTD tek başına yetersiz**; son 3 ay sinyali güçlü

2. **F275 hiçbir yerde 2026 701 fiilini temsil etmiyor** — Estimated YE'de 701 komisyon forecast'i için F275 korumak **veri desteklemiyor**.

3. **Şirket F275 ≈ Ağu YTD** görünse de, **Ağu aylık oran (−27,6%) ve son 3 ay (−24,4%)** kalan 4 ay için daha yüksek sinyal taşıyor. F275 korumak **trend yönünde eksik** kalır.

4. **Aylık oranı doğrudan kullanmak** (701 May −66%, Şub −63%) veri desteklemiyor — outlier aylar mevsim/timing etkisi.

5. **Scope (endirekt/deferred) trendi:** Şirket endirekt aylık −35 → −85 → −40 mn; deferred Ocak +44 → Ağu −42 mn. Oran trendi **bileşen kayması** taşıyor — saf F275 banka oranı şirket toplamını temsil etmez (önceki scope analizi ile tutarlı).

---

## Özet Tablo — Forecast Veri Desteği

| Branş/Kapsam | En güçlü veri sinyali | F275 koruma | YTD oran | Son 3 ay |
|--------------|----------------------|:-----------:|:--------:|:--------:|
| **701** | Ağu YTD −35,8% (stabil band) | ✗ | ✓✓ | ○ |
| **Şirket** | Son 3 ay −24,4% (ivme) | △ | ○ | ✓✓ |
| **61407 (şirket)** | F300 ≈ YTD; son aylar ↑ | △ | ○ | ○ |

✓✓ = güçlü destek · ○ = kısmi · △ = zayıf · ✗ = destek yok

---

## HENÜZ DEĞİŞTİRİLMEYECEKLER

- F275 / F300 (bütçe motoru)
- Brüt prim girdisi
- EYE / GT motoru
- Herhangi bir kod

---

*Veri: `data/butce/out/_komisyon-rate-trend.json` · Script: `scripts/_tmp-komisyon-rate-trend.ts`*
