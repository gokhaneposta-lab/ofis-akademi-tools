# GTV8 Baseline Regression — 701 Yangın (GT sütun F)

> **Tarih:** 2026-09-13  
> **Kaynak Excel:** `Bütçe GT Çalışma_v8.xlsx` (`GT!F5=701`, `GT!C1="<13"`)  
> **Kod yolu:** `buildV3GelirTablosu` kesim=7 + EYE forecast (`maxMizanAy=7`)  
> **Kod değişikliği:** Yok — salt okuma regression

---

## Okuma kuralları (kritik)

| Taraf | GT!F kolonu ne gösterir? |
|-------|--------------------------|
| **Excel GTV8** | Tek branş kolonu; KPK satırları **YK KPK / DEVREDEN sütun V** (31.12.2026 / 31.12.2025 cohort modeli). F96 = `(F11+F22+F32)×F320` anlık snapshot. |
| **Kod (V3+EYE)** | Kesim Temmuz actual-lock + Ağu–Ara forecast. **F23/F24/F22** = ay sonu **stok seviyesi** (Aralık indeks 11). **F11/F96/F105/F95/F86** = 12 aylık **hareket toplamı**. **F320** = mizan-bazlı oran (`0211`, referans `excel_gt`, ay=12). |

**“Excel ile sayı eşleşmedi” tek başına hata değildir.** Farkın büyük kısmı bilinçli veri hattı / anker / metodoloji ayrımından gelir.

---

## Karşılaştırma tablosu

Tüm tutarlar **mn TL** (÷10⁶). Oran satırı ondalık → %.

| Satır | Excel GT!F | Kod (V3+EYE) | Fark | Aynı metodoloji mi? | Fark beklenen mi? | Sınıf | Açıklama |
|-------|------------|--------------|------|---------------------|-------------------|-------|----------|
| **F11** | **1.311,75** ⚠ | **1.189,12** (YE hareket Σ) | −122,6 mn (−9,3%) | **Hayır** | **Evet** | **B/C** | Excel **görünen** değer YK `TUTAR` cache’i (1.311,75 mn = YK J toplamı). Excel **formül otoritesi** Prim `U` = **124,72 mn** (C). Kod = tarife/bütçe prim dağılımı YE hedefi (`primKaynak: tarife_ana_2025`). Üç farklı prim tanımı. |
| **F23** | **−684,02** (YK V) | **−590,77** (Ara stok) | +93,2 mn | **Hayır** | **Evet** | **B** | Excel: YK KPK sütun V, 31.12.2026, Excel rolling/bütçe modeli. Kod: mizan stok (Tem) + bütçe-prim motor forecast (Ara). Temmuz kod = **−389,09** (mizan). |
| **F24** | **+450,67** (DEV V×−1) | **+407,15** (Ara stok) | −43,5 mn | **Hayır** | **Evet** | **B** | Excel: cohort aktüeryal DEVREDEN 31.12.**2025**. Kod: mizan **01212** Ocak 2026 devralma (sabit H2). Faz 1 kararı: ~43,5 mn sistematik fark — bilinçli. |
| **F22** | **−233,35** (=F23+F24) | **−183,62** (Ara stok) | +49,7 mn | **Hayır** | **Evet** | **B** | Excel snapshot F23+F24 (V anker). Kod Ara stok F23+F24; **iç zincir tutarlı** (Δ≈0). Fark F23/F24 kaynak farkından türetilir. |
| **F21** | **−94,90** (=F22+F25+F28) | **+924,86** (YE hareket Σ) | — | **Hayır** | **Evet** | **B** | Excel: KPK ağacı üst satır snapshot (F22+F25+F28). Kod: 601 aylık **hareket toplamı** — farklı okuma ekseni; doğrudan parity hedefi değil. |
| **F32** | **0** | **0** | 0 | **Evet** | Hayır (eşleşmeli) | **A** | Her iki tarafta DERK yok / sıfır. **Parity sağlandı.** |
| **F320** | **−44,77%** | **−38,53%** (Ara, excel_gt) | +6,2 pp | **Kısmen** | **Evet** | **B** | Excel: `(F319×0,8)+(F318×0,005)+(F317×0,15)` GT rollup. Kod: mizan `0211` oranı, V2 grup fallback, ay=12. Referans yıl/ağırlık farklı. |
| **F96** | **−482,75** | **−387,47** (YE hareket Σ) | +95,3 mn | **Formül evet, girdi hayır** | **Evet** | **B** | Formül aynı: `(F11+F22_stok+F32)×F320`. Excel snapshot girdileriyle **iç tutarlı** (fark=0). Kod YE girdileriyle **iç tutarlı** (snapshot formül −387,47 mn ≈ YE Σ −387,47 mn). **Çapraz parity beklenmez.** |
| **F105** | **+375,08** (F106+… rollup) | **+317,91** (YE Σ); proxy **+234,46** | −57,2 mn | **Hayır** | **Evet** | **B** | Excel alt kırılım rollup. Kod: `F96×F436` proxy (`quality.f105Proxy=true`). Bilinçli tasarım farkı. |
| **F95** | **−107,67** | **−69,56** | +38,1 mn | **Hayır** | **Evet** | **B** | F96+F105 türevi; girdi farkları yansır. |
| **F86** | **+5,42** | **−0,50** | −5,9 mn | **Hayır** | **Evet** | **B** | Excel: `(F96+F116)×F315` snapshot. Kod: forecast muallak sonrası YE hareket; F116 profili farklı. |

---

## Excel iç tutarlılık (referans)

```
(F11 + F22 + F32) × F320 = (−482.749.962)  ✓  (Excel fark = 0)
F22 = F23 + F24                              ✓
```

## Kod iç tutarlılık (V3+EYE, 701)

```
F22(Ara) = F23(Ara) + F24(Ara)               ✓  (−183,62 = −590,77 + 407,15)
(F11_Σ + F22_Ara + F32_Σ) × F320(Ara)       ≈ F96_Σ  (−387,47 mn; Δ≈309 TL)
F96 forecast zinciri (assertEyeForecastZincir) PASS
Actual F23(1..7) = mizan 01211 stok         PASS
```

---

## Sınıf özeti

| Sınıf | Anlam |
|-------|-------|
| **A** | Aynı metodoloji → sayı eşleşmeli |
| **B** | Farklı dönem/anchor/veri hattı → fark bekleniyor |
| **C** | Excel formül/cache/anomali → regression otoritesi değil |

---

## Sonuç 1 — GTV8 ile doğrudan parity beklenen satırlar

| Satır | Durum |
|-------|-------|
| **F32** | **Parity sağlandı** (0 = 0) |
| **F22 = F23 + F24** | Her iki tarafta **iç formül parity** (farklı girdilerle ayrı ayrı tutarlı) |
| **F96 = (F11+F22+F32)×F320** | Her iki tarafta **iç formül parity** (girdiler farklı → çapraz sayı farklı) |

> Not: F22/F96 için “parity” = **formül zinciri**, Excel GT!F tek hücre rakamı ile kod YE toplamının birebir eşleşmesi **değil**.

---

## Sonuç 2 — GTV8 ile parity beklenmeyen satırlar

| Satır | Neden |
|-------|-------|
| **F11** | Excel cache (C) vs Prim U vs kod bütçe prim |
| **F23** | Excel YK V rolling vs kod mizan+bütçe motor |
| **F24** | Excel DEVREDEN cohort 31.12.2025 vs mizan 01212 Ocak 2026 |
| **F22** | KPK stok anker farkı (F23/F24 türevi) |
| **F21** | Excel ağaç snapshot vs kod hareket toplamı |
| **F320** | Excel alt-oran rollup vs mizan teknik oran motoru |
| **F96** | Formül aynı; tüm girdiler farklı |
| **F105** | Excel rollup vs kod F96×F436 proxy |
| **F95, F86** | Üst satırların türev farkları |

---

## Sonuç 3 — Kodda gerçek tutarsızlık

| # | Bulgu | Ciddiyet |
|---|-------|----------|
| 1 | **F22=F23+F24** (actual + forecast + Ara stok) | ✅ Tutarlı — tutarsızlık **yok** |
| 2 | **F96 zinciri** (EYE forecast aylar) | ✅ Tutarlı — validation **PASS** |
| 3 | **Actual KPK F23 = mizan 01211** (1..7) | ✅ Tutarlı — tutarsızlık **yok** |
| 4 | **F105 proxy ≠ Excel rollup** | ⚠ Bilinçli tasarım (`f105Proxy=true`); **bug değil** |
| 5 | **`degerler[23/24]` yıllık alanı** stok satırlarında aylık stokların toplamı (−5,5 mr / +4,9 mr) — GT okuma için **yanıltıcı**; EYE/Ara stok `aylikBrans[23/24][11]` kullanılmalı | 📋 Raporlama/konvansiyon notu; hesap yolu hatası **değil** |

**Gerçek hesaplama tutarsızlığı tespit edilmedi.** GTV8 ile sayı farkları metodoloji sınıfı **B/C** kapsamında.

---

## Ek: Temmuz anker (maxMizanAy=7)

Ağustos mizanı öncesi mevcut cutoff:

| Satır | Excel (V — Ara model) | Kod (Tem actual) |
|-------|----------------------:|-----------------:|
| F23 | −684,02 mn | **−389,09 mn** (mizan) |
| F24 | +450,67 mn | **+407,15 mn** (mizan) |
| F22 | −233,35 mn | **+18,06 mn** (mizan stok) |

Temmuz kod değerleri mizan-prim motor reconciliation ile **~%0,2** uyumlu (ayrı kontrol; `kpkRecon` metriği değil).

---

## Veri kaynakları

| Çıktı | Dosya |
|-------|-------|
| Excel okuma | `data/butce/out/_gtv8-701-read.json` |
| Kod okuma | `data/butce/out/_gtv8-code-701.json` |
| Geçici script | `scripts/_tmp-gtv8-baseline-701.ts` (analiz; commit dışı) |

*Referans: `docs/butce/v2-faz1-on-dogrulama-karar.md`, `docs/butce/v3-eye-validation-raporu.md`*
