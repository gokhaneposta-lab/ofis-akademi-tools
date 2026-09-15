# STOCK vs MOVEMENT Aggregation Audit — format_7

**Kod değişikliği yok.** Bu rapor yalnızca mevcut export/aggregation davranışını doğrular.

## 1) format_7 TOPLAM nasıl üretiliyor?

`buildGtFormatTidy` → her branş × her ay (1–12) için `doldurAy()` ile GT hücre değeri alınır.
`yilToplamByBrans` → **12 ayın (replay export'ta Eylül–Aralık sıfır) tutarlarını toplar**.

| Satır tipi | Motor `aylikBrans` içeriği | format_7 TOPLAM = |
|------------|---------------------------|-------------------|
| **STOCK** (F23,F24,F26,F27…) | Ay sonu **stok seviyesi** (rolling KPK / mizan devreden) | Σ(Ocak..Ağu **stok seviyeleri**) — **YANLIŞ snapshot** |
| **MOVEMENT** (F11,F96,F116…) | Ay içi **hareket** (delta) | Σ(Ocak..Ağu hareket) = **YTD** — doğru |
| **KPK üst (F21,F22,F25…)** | Motor `kpkStokYtd`: ay sonu **bileşik stok** | Σ aylık stok bileşeni — hareket GT ile karışır |

## 2) 601011 / 601012 — 8 aylık stok toplamı hipotezi (701)

### 601011 (F23 Cari KPK)

| Metrik | Değer (mn) |
|--------|----------:|
| Gerçek mizan (Ağu sonu stok) | -389.37 |
| format_7 test TOPLAM (701 kolon) | -3093.38 |
| Tidy Σ ay 1–8 (701) | 0.00 |
| Tidy Ağustos ay sonu (701) | 0.00 |
| Motor v2OzetDeger F23 anchor=8 (701) | -388.66 |
| Σ8 / Gerçek (kat) | 0.00× |
| Σ8 / 8 (ortalama) | 0.00 |
| format_7 / Ağu stok | —× |

Aylık Tidy (701, mn): Ocak=0.00, Şubat=0.00, Mart=0.00, Nisan=0.00, Mayıs=0.00, Haziran=0.00, Temmuz=0.00, Ağustos=0.00

### 601012 (F24 Devreden KPK)

| Metrik | Değer (mn) |
|--------|----------:|
| Gerçek mizan (Ağu sonu stok) | 407.15 |
| format_7 test TOPLAM (701 kolon) | 3257.19 |
| Tidy Σ ay 1–8 (701) | 0.00 |
| Tidy Ağustos ay sonu (701) | 0.00 |
| Motor v2OzetDeger F24 anchor=8 (701) | 407.15 |
| Σ8 / Gerçek (kat) | 0.00× |
| Σ8 / 8 (ortalama) | 0.00 |
| format_7 / Ağu stok | —× |

Aylık Tidy (701, mn): Ocak=0.00, Şubat=0.00, Mart=0.00, Nisan=0.00, Mayıs=0.00, Haziran=0.00, Temmuz=0.00, Ağustos=0.00

### 601021 (F26 RE Cari KPK)

| Metrik | Değer (mn) |
|--------|----------:|
| Gerçek mizan (Ağu sonu stok) | 149.22 |
| format_7 test TOPLAM (701 kolon) | 1784.89 |
| Tidy Σ ay 1–8 (701) | 0.00 |
| Tidy Ağustos ay sonu (701) | 0.00 |
| Motor v2OzetDeger F26 anchor=8 (701) | 224.26 |
| Σ8 / Gerçek (kat) | 0.00× |
| Σ8 / 8 (ortalama) | 0.00 |
| format_7 / Ağu stok | —× |

Aylık Tidy (701, mn): Ocak=0.00, Şubat=0.00, Mart=0.00, Nisan=0.00, Mayıs=0.00, Haziran=0.00, Temmuz=0.00, Ağustos=0.00

### 601022 (F27 RE Devreden KPK)

| Metrik | Değer (mn) |
|--------|----------:|
| Gerçek mizan (Ağu sonu stok) | -179.34 |
| format_7 test TOPLAM (701 kolon) | -1434.70 |
| Tidy Σ ay 1–8 (701) | 0.00 |
| Tidy Ağustos ay sonu (701) | 0.00 |
| Motor v2OzetDeger F27 anchor=8 (701) | -179.34 |
| Σ8 / Gerçek (kat) | 0.00× |
| Σ8 / 8 (ortalama) | 0.00 |
| format_7 / Ağu stok | —× |

Aylık Tidy (701, mn): Ocak=0.00, Şubat=0.00, Mart=0.00, Nisan=0.00, Mayıs=0.00, Haziran=0.00, Temmuz=0.00, Ağustos=0.00

## 3) GT satır sınıflandırması (Ağustos kapanış kıyası için)

### STOCK — 31.08.2026 ay sonu seviyesi kullan

| F | Hesap | GT kod | Okuma |
|---|-------|--------|-------|
| 23 | 601011 | 01211 | `v2OzetDeger(gt, 23, 8, brans)` = Ağu sonu stok |
| 24 | 601012 | 01212 | `v2OzetDeger(gt, 24, 8, brans)` = Ağu sonu stok |
| 26 | 601021 | 01221 | `v2OzetDeger(gt, 26, 8, brans)` = Ağu sonu stok |
| 27 | 601022 | 01222 | `v2OzetDeger(gt, 27, 8, brans)` = Ağu sonu stok |
| 29 | 601031 | 01231 | `v2OzetDeger(gt, 29, 8, brans)` = Ağu sonu stok |
| 30 | 601032 | 01232 | `v2OzetDeger(gt, 30, 8, brans)` = Ağu sonu stok |
| 33 | 602011 | 01311 | `v2OzetDeger(gt, 33, 8, brans)` = Ağu sonu stok |
| 34 | 602012 | 01312 | `v2OzetDeger(gt, 34, 8, brans)` = Ağu sonu stok |
| 36 | 602021 | 01321 | `v2OzetDeger(gt, 36, 8, brans)` = Ağu sonu stok |
| 37 | 602022 | 01322 | `v2OzetDeger(gt, 37, 8, brans)` = Ağu sonu stok |

**KPK motor notu:** F21,F22,F25,F28 motor içinde ay-sonu **bileşik stok** tutar; GT Branş'taki 601/60101 **YTD hareket** ile aynı ölçüm değil → sınıf B.

### MOVEMENT — Ocak–Ağustos YTD toplam

| F | Hesap | Okuma |
|---|-------|-------|
| 21 | 601 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 31 | 602 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 11 | 60001 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 19 | 60002 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 20 | 60003 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 22 | 60101 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 25 | 60102 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 28 | 60103 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 32 | 60201 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 96 | 61001 | `v2OzetDeger` veya Σ aylık delta (1–8) |
| 116 | 611011 | `v2OzetDeger` veya Σ aylık delta (1–8) |

## 4) Ağustos sonu snapshot — doğru okuma yöntemi

| Kaynak | STOCK satırlar | MOVEMENT satırlar |
|--------|----------------|-------------------|
| **Gerçek mizan / GT Branş** | Hesap bakiyesi 31.08.2026 | YTD hareket Ocak–Ağu |
| **Motor replay** | `v2OzetDeger(gt, F, 8, brans)` veya `GT_Ozet` son sütun | Aynı (YTD sum for movement) |
| **format_7 TOPLAM** | ❌ Σ aylık — STOCK için kullanma | ✓ Yaklaşık YTD (STOCK hariç) |
| **Tidy_Aylik** | Ağu ayı hücresi = snapshot; Σ1–8 = yanlış toplam | Σ1–8 = YTD |

## 5) 701 — Düzeltilmiş kıyas (Ağustos sonu snapshot / YTD)

| F | Hesap | Tip | Gerçek Ağu | Motor Ağu | Fark | Fark % | format_7 TOPLAM (701) | format_7 hatası? |
|---|-------|-----|----------:|----------:|-----:|-------:|---------------------:|:----------------:|
| 23 | 601011 | STOCK | -389.37 | -388.66 | 0.71 | 0.2% | -3093.38 | EVET (Σ8 stok) |
| 24 | 601012 | STOCK | 407.15 | 407.15 | 0.00 | 0.0% | 3257.19 | EVET (Σ8 stok) |
| 22 | 60101 | MOVEMENT* | 17.78 | 18.49 | 0.71 | 4.0% | 163.81 | N/A |
| 26 | 601021 | STOCK | 149.22 | 224.26 | 75.04 | 50.3% | 1784.89 | EVET (Σ8 stok) |
| 27 | 601022 | STOCK | -179.34 | -179.34 | 0.00 | 0.0% | -1434.70 | EVET (Σ8 stok) |
| 25 | 60102 | MOVEMENT* | -30.12 | 44.92 | 75.04 | 249.1% | 350.19 | N/A |
| 28 | 60103 | MOVEMENT* | 0.00 | 0.00 | 0.00 | — | 0.00 | N/A |
| 21 | 601 | MOVEMENT* | -12.34 | 63.41 | 75.75 | 613.8% | 514.00 | N/A |

*F21/F22/F25/F28: Motor stok bileşeni okur; GT Branş YTD hareket — farklı ölçüm bazı.

## 6) Önceki replay testi ile tutarlılık

| | Önceki replay raporu | Bu audit (motor yeniden çalıştırma) |
|---|---------------------:|-----------------------------------:|
| F23 Gerçek 701 | −389,37 mn | -389.37 mn |
| F23 Motor 701 | −388,66 mn | -388.66 mn |
| Fark | 0,71 mn (0,2%) | 0.71 mn (0.2%) |

**Sonuç:** `v2OzetDeger` / GT_Ozet Ağustos sonu sütunu doğru snapshot verir. format_7 TOPLAM ise STOCK satırlarında ~8× şişirir.

## Ek: Motor F23 aylık seri (701) — her ay stok seviyesi

Ocak=-406.49 | Şubat=-393.88 | Mart=-386.89 | Nisan=-390.19 | Mayıs=-355.88 | Haziran=-381.57 | Temmuz=-389.82 | Ağustos=-388.66

Σ8 = -3093.38 mn vs Ağu=-388.66 mn vs format_7 TOPLAM=-3093.38 mn