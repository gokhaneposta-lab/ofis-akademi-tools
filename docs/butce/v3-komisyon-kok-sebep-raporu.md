# Komisyon Kök Sebep Analizi — Ağustos 2026 YTD Replay

**Kapsam:** Yalnızca komisyon (61401 / 61407). Kod/oran/metodoloji değiştirilmedi.  
**Motor:** `buildV2GelirTablosu` + gerçek Aug YTD brüt prim girdisi (F11 ≈ birebir).  
**Gerçek:** `test_vs_gercek.xlsx` → *gercek mizan* + `mizan-aylik-full.json` (2026-08 GT kodları).  
**Kesim:** anchor = 8 (Ağustos sonu YTD).

---

## 1) Gerçek muhasebe / GT hesap ağacı (Ağustos YTD)

Kaynak: Ağustos mizan import (GT kodları) + *gercek mizan* hesap adları.

### Şirket toplam

| Hesap / GT | Açıklama | Ağu YTD gerçek (mn) | Ana hesaba etkisi |
|------------|----------|--------------------:|-------------------|
| **61401 / 0251** | ÜRETİM KOMİSYON GİD.(-) | **-2.366,74** | 61401 |
| 614011 / 02511 | Üretim Komisyonu Giderleri | -2.366,74 | 61401 |
| 61401101 / 0251101 | Bankalar Üretim Komisyonu | -1.861,63 | 61401 |
| ↳ 0251101010101 | Üretim Komisyon Gideri (cari) | -1.814,64 | 61401 |
| ↳ 0251101010102 | Ertelenmiş Komisyon Giderleri | -71,74 | 61401 |
| ↳ 025110111* | Diğer banka alt kalemleri (net) | +25,72 | 61401 |
| 61401102 / 0251102 | Acenteler | 0,00 | 61401 |
| 61401103 / 0251103 | Doğrudan Satış | 0,00 | 61401 |
| **61401199 / 0251199** | Diğer Üretim Komisyonu (endirekt) | **-505,10** | 61401 |
| 614012 / 02512 | Diğer Üretim Giderleri | 0,00 | 61401 |
| **61407 / 0257** | REASÜRANS KOMİSYONLARI GELİRLERİ | **+1.498,93** | 61407 |
| 614071 / 02571 | Alınan Reasürans Komisyonları | +1.498,93 | 61407 |
| 614072 / 02572 | Verilen Reasürans Komisyonları | 0,00 | 61407 |

**Mutabakat:**
- 61401101 + 61401199 + 61401102/03 + 614012 = -1.861,63 + (-505,10) + 0 = **-2.366,73 ≈ 61401 (-2.366,74)** ✓
- 614071 + 614072 = **1.498,93 = 61407** ✓

### 701 branş

| Hesap / GT | Açıklama | Ağu YTD gerçek (mn) | Ana hesaba etkisi |
|------------|----------|--------------------:|-------------------|
| **61401 / 0251** | ÜRETİM KOMİSYON GİD.(-) | **-184,21** | 61401 |
| 61401101 / 0251101 | Bankalar (tüm komisyon burada) | -184,21 | 61401 |
| ↳ 0251101010101 | Üretim Komisyon Gideri (cari) | -186,84 | 61401 |
| ↳ 0251101010102 | Ertelenmiş Komisyon Giderleri | **+10,92** | 61401 |
| ↳ 025110111* | Diğer banka alt kalemleri (net) | -8,26 | 61401 |
| 61401199 / 0251199 | Endirekt komisyon | **0,00** | 61401 |
| **61407 / 0257** | REASÜRANS KOMİSYONLARI | **+43,14** | 61407 |
| 614071 / 02571 | Alınan RE komisyonu | +43,14 | 61407 |

**Mutabakat:** -186,84 + 10,92 - 8,26 ≈ **-184,18 ≈ -184,21** ✓

---

## 2) Motor komisyon formülü (koddan, tahmin yok)

### 61401 → GT F177

| Alan | Değer |
|------|-------|
| **Dosya** | `lib/butce/gelir/gtMotoru.ts` |
| **Harita** | `lib/butce/data/gt_excel_harita.json` |
| **GT satır** | F177 (kod 0251) = **F178 + F189** |
| **Alt yapı** | F178 = F179 + F182 + F185 + **F188** |
| **Cari komisyon** | **F180 = F11 × F275** (satır 180, `tip: carpim`) |
| **Ertelenmiş komisyon** | **F181** — `SUMIFS('YK KPK'…)` + `SUMIFS('MEVCUT YIL DEVREDEN KPK'…)` → **`tip: dis_sayfa` → motor = 0** |
| **Endirekt komisyon** | **F188** (0251199) — haritada **`formul: 0`, `tip: deger`** → motor = 0 |
| **Oran kalemi** | **0251** → oran hücresi **F275** |
| **Oran tanımı** | `lib/butce/oran/oranKalemLoader.ts` satır 155–162: `pay: ["61401"]`, `baz: ["60001"]`, `carpim: brut_prim`, `excel_carpim: "F11*F275"` |
| **Oran motoru** | `lib/butce/oran/mizanOranlar.ts` — `MizanOranServisi.tumBranslarTablosu("0251", …, { ay })` |
| **Oran dönemi** | **Geçmiş Yıl birleştirme** (2022–2025 YE mizan + aylık GT bridge), ağırlık **50/25/15/10**; anchor ay=8 için kümülatif ay indeksi |
| **Prim türü / baz** | **F11 brüt yazılan prim (60001)** — replay testinde gerçek Aug YTD enjekte |
| **Replay özet okuma** | `lib/butce/v2/v2GtFiltre.ts` → `v2OzetDeger(gt, 177, 8, [brans])` |

**Birebir formül (fiilen çalışan):**

```
F177_motor ≈ F180 = F11 × F275
F275 = weighted_avg(61401_pay ÷ 60001_baz, yıl=2022..2025, ağırlık 50/25/15/10)
```

Kanal ayrımı (banka/acente/DS), endirekt (F15×F431) ve ertelenmiş (F181) **hesaba katılmıyor**.

### 61407 → GT F196

| Alan | Değer |
|------|-------|
| **GT satır** | F196 (kod 02571) = **F197 + F198** |
| **Cari RE komisyon** | **F197 = F11 × F300** (satır 197) |
| **Ertelenmiş RE komisyon** | **F198** — KPK sayfalarından `SUMIFS` → **`dis_sayfa` → motor = 0** |
| **Oran kalemi** | **F300** — `pay: ["614071"]`, `baz: ["60001"]`, `excel_carpim: "F11*F300"` |
| **Oran dönemi** | Aynı yıl birleştirme (50/25/15/10) |
| **GT–hesap eşleme** | `lib/butce/v2/v2GtHesapAgac.ts`: F196 → **614071** (61407 değil) |

**Birebir formül:**

```
F196_motor ≈ F197 = F11 × F300
```

---

## 3) Gerçek vs motor — alt hesap köprüsü

### 61401 — şirket

| Hesap/Kalem | Gerçek Mizan | Motor | Fark | Motor kaynağı | Gerçek kaynağı |
|-------------|-------------:|------:|-----:|---------------|----------------|
| **61401 / F177** | **-2.366,74** | **-2.070,37** | **+296,37** | F11×F275 (tek oran) | 0251101 + 0251199 + alt deferred |
| 0251101 Banka | -1.861,63 | -2.070,37 (F180≈F177) | -208,74 | Tüm F11'e tarihsel oran | Cari + ertelenmiş banka hareketi |
| ↳ Cari (0101) | -1.814,64 | — | — | F180 hedefi | Üretim komisyon gideri |
| ↳ Ertelenmiş (0102) | -71,74 | **0** (F181) | -71,74 | Model yok | KPK/deferred komisyon stok hareketi |
| **0251199 Endirekt** | **-505,10** | **0** (F188) | **-505,10** | Sabit 0 | Endirekt prim komisyonu (F15×F431 Excel) |
| 614012 | 0 | 0 | 0 | F189=0 | — |

**Netting (şirket 61401 farkının aritmetiği):**
- Motor bankayı **208,7 mn fazla** gider yazıyor (F275 > gerçekleşen banka oranı).
- Motor endirekt **505,1 mn hiç yazmıyor**.
- Net: +296,4 mn (gerçek daha negatif) = -505,1 + 208,7 ✓

### 61401 — 701

| Hesap/Kalem | Gerçek | Motor | Fark | Motor kaynağı | Gerçek kaynağı |
|-------------|-------:|------:|-----:|---------------|----------------|
| **61401 / F177** | **-184,21** | **-111,81** | **+72,40** | F11×F275 | 0251101 (banka) |
| ↳ Cari 0101 | -186,84 | -111,81 (F180) | -75,03 | F275=-21,75% | Gerçekleşen cari oranı ≈ -36,3% |
| ↳ Ertelenmiş 0102 | +10,92 | 0 | +10,92 | F181 yok | Deferred amortisman |
| ↳ Diğer 111* | -8,26 | 0 | -8,26 | — | Alt banka kalemleri |
| 0251199 | 0 | 0 | 0 | — | 701'de endirekt komisyon yok |

**701 farkının ~tamamı cari oran sapması:** 514,17 × (|-35,83%| − |-21,75%|) ≈ **72,4 mn** ✓

### 61407 — şirket ve 701

| Hesap/Kalem | Gerçek | Motor F196 | Fark | Motor | Gerçek |
|-------------|-------:|-----------:|-----:|-------|--------|
| **61407 şirket** | +1.498,93 | +1.586,62 | **-87,69** | F11×F300 | 02571 |
| **61407 701** | +43,14 | +44,07 | **-0,93** | F11×F300 | 02571 |
| Ertelenmiş RE (F198) | *(02571 içinde ayrıştırılmamış)* | **0** | ? | KPK sayfası yok | Muhtemelen küçük / 701'de ihmal |

---

## 4) Ertelenmiş komisyon analizi

### Gerçek mizan — var mı?

| Kalem | Şirket | 701 |
|-------|-------:|----:|
| 0251101010102 Ertelenmiş Komisyon Gideri | -71,74 mn | **+10,92 mn** |
| 61407 deferred (F198 karşılığı) | GT yapısı farklı; 02571 yapraklarında ayrı 0102 kodu yok | — |

701'de deferred **net +10,9 mn** (gideri azaltır); şirkette **-71,7 mn** (gideri artırır). Her iki durumda da Aug YTD **stok/hareket** etkisi; üretim dönemi dağılımı bu exporttan çıkarılamaz.

### Motor davranışı — kesin sınıflandırma

| Soru | Cevap |
|------|-------|
| Ertelenmiş komisyon hesaba katılıyor mu? | **Hayır (61401: F181=0; 61407: F198=0)** |
| Ayrı satırda mı? | Excel'de **evet** (F181, F198); motorda **hayır** (dış sayfa → 0) |
| Oran içinde gömülü mü? | **Hayır** — F275/F300 yalnızca cari pay÷baz tarihsel oranı |
| Başka GT hesabına taşınıyor mu? | **Hayır** |

**Sonuç: A) Hiç hesaba katmıyor** — `gtMotoru.ts` `DIS_GIRDI_TIP` / `DIS_FORMUL` ile F181 ve F198 sıfırlanıyor.

701'de deferred etkisi küçük (+10,9 mn, farkın ~%15'i); şirkette banka deferred (-71,7 mn) var ama asıl şirket farkını **0251199 endirekt eksikliği** domine ediyor.

---

## 5) Dönem / anker analizi

| Boyut | Motor | Gerçek 61401 |
|-------|-------|--------------|
| **Dönem** | 2022–2025 **tarihsel YE** ağırlıklı oran; anchor=8'de ay-kümülatif mizan snapshot | **2026 Ağu YTD fiili hareket** (cari + deferred + endirekt) |
| **Oran tipi** | Branş bazlı F275 (61401÷60001) | Fiili GT satır tutarı |
| **701 F275** | **-21,75%** (yılOran: 2022 −13,5%, 2023 −21,2%, 2024 −29,7%, 2025 −19,6%) | **-35,83%** (61401÷60001 gerçekleşen) |
| **Şirket F275 impl.** | **-13,59%** (2070÷15239) | **-15,53%** (2367÷15238) |
| **701 F300** | +8,57% | +8,39% (43,14÷514,17) |
| **Şirket F300 impl.** | +10,41% | +9,84% |

**Ayırım:**
- **2026 cari üretim komisyonu:** Motor F180; gerçek 0251101010101.
- **Deferred / devir:** Gerçek 0251101010102 (+/−); motor F181=0.
- **Endirekt komisyon:** Gerçek 0251199 (-505 mn şirket); motor F188=0.
- **2025 kapanış devri:** F181 Excel formülünde KPK sayfalarından gelir; motorda yok.

---

## 6) Brüt prim doğruyken komisyon neden farklı? — hipotez testi

| # | Hipotez | Sonuç | Kanıt |
|---|---------|-------|-------|
| A | Komisyon oranı yanlış | **KANIT VAR** | 701: F275 −21,75% vs gerçek −35,83%; fark ≈ 72 mn aritmetik olarak oran farkına eşit. Şirket: F275 −13,59% vs −15,53%. |
| B | Komisyon bazı farklı | **KANIT YOK (prim)** | Motor baz = F11 = enjekte gerçek 60001. RE için de aynı. |
| C | Ertelenmiş komisyon eksik | **KANIT VAR (kısmi)** | F181/F198=0. 701'de etki +10,9 mn (küçük). Şirket banka deferred −71,7 mn. |
| D | Önceki dönem devreden etki eksik | **KANIT VAR** | F181 KPK/deferred sayfasına bağlı; motor 0. Excel GT'de ayrı satır. |
| E | RE komisyonu farklı baz | **KANIT YOK** | Aynı F11; sapma yalnızca F300 tarihsel oran vs 2026 fiili (~0,6 pp şirket). |
| F | GT satır ↔ muhasebe kapsam uyumsuz | **KANIT VAR** | F177 motor ⊂ gerçek 61401: **0251199 endirekt motor dışı**; F196≈614071 ama F198 deferred dışı. |
| G | Başka | **KANIT VAR (kanal)** | Motor tek F11×F275; gerçek 0251101 (banka) + 0251199 (endirekt) ayrımı. Şirkette banka ayrı undership, endirekt missing. |

**Brüt prim doğru → komisyon farkı prim kaynaklı değil; oran dönemi, GT kapsam ve model dışı kalemler kaynaklı.**

---

## 7) 701 vs şirket — aynı kaynak mı?

| | 701 | Şirket |
|---|-----|--------|
| **61401 fark** | +72,4 mn (**%39,3**) | +296,4 mn (**%12,5**) |
| **61407 fark** | −0,9 mn (**%2,2**) | −87,7 mn (**%5,9**) |

### 61401 — neden 701 daha büyük oransal sapma?

| Etken | 701 | Şirket |
|-------|-----|--------|
| Tarihsel vs 2026 fiili oran | **−21,75% → −35,83%** (14 pp) | −13,59% → −15,53% (2 pp) |
| 0251199 endirekt | **0** | **−505 mn** (motor 0) |
| Banka F180 vs 0251101 | Motor ** fazla ** gider | Motor ** fazla ** gider (−208 mn) |
| Deferred (0102) | +10,9 mn (küçük) | −71,7 mn |

**Sonuç:** Aynı kök sınıf (tarihsel F275 + GT kapsam), **farklı ağırlık**:
- **701:** neredeyse saf **branş oran sapması** (2026 komisyon yoğunluğu 2024–2025 ortalamasının üzerinde; 701'de 2024 oranı −29,7% ama blend −21,75%).
- **Şirket:** oran sapması + **endirekt blok eksikliği** birbirini kısmen götürüyor → toplam **%12,5** (701'deki **%39**'dan düşük).

### 61407

701 neredeyse eşleşiyor (F300 −0,2 pp). Şirket sapması (−88 mn) **branş dağılımı × tarihsel F300** birleşiminden: yüksek primli branşlarda F300 gerçekleşenden yüksek.

---

## 8) GT satır eşleştirme

| Motor GT | Muhasebe | Aynı ekonomik kapsam? |
|----------|----------|------------------------|
| **F177 / 0251 / 61401** | **61401** | **HAYIR — kısmi** |
| | | Motor = yalnızca **F11×F275** (cari, kanalsız, tarihsel oran). |
| | | Gerçek = **0251101** (banka cari+deferred) + **0251199** (endirekt) + 614012. |
| **F180** | 0251101010101 (cari) | **Yakın ama aynı değil** — motor tüm F11'e uniform oran; gerçek banka cari −1.814,6 mn vs motor F180 −2.070,4 mn (şirket). |
| **F181** | 0251101010102 (deferred) | **Hayır** — motor 0. |
| **F188 / 0251199** | 61401199 | **Hayır** — motor 0; gerçek −505,1 mn. |
| **F196 / 02571 / 614071** | **61407** (614071) | **Büyük ölçüde EVET** (614072=0) |
| **F197** | 614071 cari gelir | **Evet** (baz F11) |
| **F198** | Ertelenmiş RE komisyon | **Hayır** — motor 0 |

**Aynı GT adı, farklı ekonomik kapsam:** F177 özellikle — Excel'de toplam komisyon gideri; motorda **tarihsel oranlı cari proxy**.

---

## 9) Final kök sebep sınıflandırması

| Konu | Kök sebep? | Kanıt | Etki |
|------|------------|-------|------|
| Brüt Prim | **HAYIR** | F11 replay = gerçek 60001 (701: 0,0%; şirket: 0,0%) | — |
| Komisyon oranı | **EVET** | F275/F300 = 2022–25 blend; 2026 fiili daha yüksek (701: −35,8% vs −21,7%) | 701: ~72 mn; şirket: ~209 mn banka fazlası |
| Komisyon bazı | **HAYIR** | Aynı F11 (60001 YTD) | — |
| Ertelenmiş komisyon | **EVET (ikincil)** | F181/F198 = 0; 0102 gerçekte var | 701: +11 mn; şirket: −72 mn (banka) |
| Devir etkisi | **EVET (model dışı)** | F181 KPK sayfalarına bağlı, motor 0 | 61401 deferred hareket |
| Reasürans komisyonu | **EVET (hafif)** | F300 tarihsel > 2026 fiili şirket | −88 mn (61407 şirket); 701 ≈ 1 mn |
| Branş dağıtımı | **EVET (61407 şirket)** | F300 branş oranları 2026 mix'i tam yansıtmıyor | RE sapması branş ağırlıklı |
| GT hesap eşleşmesi | **EVET** | F177 motor ⊂ 61401; **0251199 tamamen dışarıda** | Şirket: −505 mn endirekt eksik |

---

## KÖK SEBEP

1. **Motor F177 yalnızca `F11 × F275` (tarihsel 2022–25 oran) hesaplıyor; gerçek 61401 ise banka (cari+deferred) + endirekt (0251199) + alt kalemleri içeriyor.** Endirekt komisyon (−505 mn şirket) motorda **hiç yok** (F188=0).

2. **2026 fiili komisyon oranı (özellikle 701) tarihsel F275 blend'inin üzerinde.** Brüt prim doğru olduğu halde 701'de farkın **~%100'ü** oran farkından geliyor: −35,8% gerçek vs −21,7% motor.

3. **Ertelenmiş komisyon (F181/F198) ve RE deferred motorda sıfır;** 701'de küçük, şirkette banka kanalında anlamlı. RE tarafında (61407) asıl sapma yine **F300 tarihsel oran > 2026 fiili** (şirket −88 mn).

---

## ŞİMDİLİK NEYİ DEĞİŞTİRMEMELİYİZ?

- **F275 / F300 oran torpusu veya yıl ağırlıkları** — sapma “yanlış oran” değil, **2026 fiili vs tarihsel metod** farkı; kör düzeltme 2025 backtest'i bozar.
- **EYE / YTD overlay / V3 forecast katmanları** — komisyon replay'i V2 saf motor; overlay karıştırılmamalı.
- **Brüt prim girdisi** — doğrulanmış; dokunulmamalı.
- **format_7 TOPLAM kolonu** — komisyon hareket satırı; stok toplamı değil ama replay karşılaştırmasında `v2OzetDeger` anchor=8 kullanılmaya devam.

---

## BİR SONRAKİ TEST NE OLMALI?

1. **Kapsam testi (GT parite):** Motor çıktısına F188 (0251199 = F15×F431) ve F181/F198 stub'ları eklenmeden, yalnızca raporlama katmanında `F177_motor + gerçek_0251199 + gerçek_deferred` üçlü köprüsü — 61401 farkının **% kaçının kapsam, % kaçının oran** olduğu şirket/701 için kilitle.

2. **701 oran kök testi:** 2026 Ağu YTD **fiili** 61401101÷60001 ile F275 yıl bileşenlerini yan yana tablo (2024 −29,7% ağırlığı neden blend'i −21,7%'de tutuyor, 2026 fiili neden −35,8%) — branş komisyon şoku mu, mix mi?

3. **61407 parite:** F300 branş tablosu × Aug gerçek prim mix vs `02571` gerçekleşen — −88 mn'nin hangi 7xx branşlarından geldiği (dağılım haritası).

---

*Veri çıktısı: `data/butce/out/_komisyon-kok-sebep.json` · Script: `scripts/_tmp-komisyon-kok-sebep.ts`*
