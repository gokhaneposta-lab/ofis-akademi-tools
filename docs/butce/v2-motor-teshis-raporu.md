# Bütçe V2 GT Motoru — Teşhis Raporu

> **Durum:** Sadece analiz. Kod değiştirilmedi.  
> **Referans model:** `Bütçe GT Çalışma_v8.xlsx` (JSON çıkarımları: `lib/butce/data/gt_excel_harita.json`, `oran_kalem_excel.json`, `gt_sirket_format.json`)  
> **Tarih:** Mart 2026

---

## Yönetici özeti

Mevcut kod, Excel modelinin formül **metnini** büyük ölçüde doğru taşıyor (`F96 = (F11+F22+F32)×F320` vb.). Ancak **hesaplama sırası** ve **KPK/devreden veri birleştirme** Excel ile aynı değil. Sonuç:

1. **F96 (Ödenen Hasar)** hesaplanırken kullanılan **F22**, ekranda gösterilen **F22 ile aynı değil**.
2. **Devreden KPK (601012)** mizandan okunuyor ama **F22'ye hesap anında yansıtılmıyor**; sadece döngü sonrası ekran serisi güncelleniyor.
3. **F96 yeniden hesaplanmıyor** → kullanıcı tablodaki KPK ile Ödenen Hasar arasında matematik kuramıyor.
4. KPK tarafında **stok seviyesi** ile **hareket/değişim** kavramları karışık; motor stok tutuyor, UI "değişim" diyor.
5. **Mali gelir (F38)** Excel'den bilinçli olarak farklı (proxy); bu ayrı bir sapma.

**İlk hatalı değer:** `gelirTablosu.ts` içinde `disHucreler[22]` — devreden KPK enjekte edilmeden önce KPK motorunun ham F22 stoku yazılıyor, F22 = F23+F24 olarak yeniden türetilmiyor.

---

# BÖLÜM 1 — Excel modelinin GT mantığı

Kaynak: `gt_excel_harita.json` (v8 Excel'den extract). Excel dosyası repoda yok; formüller JSON'dan okunmuştur.

## 1.1 Prim

| Hücre | Hesap | Formül |
|-------|-------|--------|
| F11 | 60001 | `SUMIFS('3-Prim Ay Dağılımı'!…)` — branş × bütçe yılı |
| F10 | 600 | `F11+F19+F20` |
| F19 | 60002 | `F11×F295` (reasürans devredilen prim) |

Prim **dış sayfadan** gelir; GT içinde tahmin edilmez.

## 1.2 KPK ağacı

| Hücre | Hesap | Formül | Semantik |
|-------|-------|--------|----------|
| F23 | 601011 | `SUMIFS('YK KPK'!$V:$V, …)` | Cari brüt KPK **stoku** |
| F24 | 601012 | `SUMIFS('MEVCUT YIL DEVREDEN KPK'!$V:$V, …) × −1` | Devreden KPK **stoku** (işaret ters) |
| F22 | 60101 | `SUM(F23:F24)` | Brüt KPK = cari + devreden |
| F26 | 601021 | `SUMIFS('YK KPK'!$AL:$AL, …)` | Cari reas payı stoku |
| F27 | 601022 | `SUMIFS('MEVCUT YIL DEVREDEN KPK'!$AL:$AL, …) × −1` | Devreden reas stoku |
| F25 | 60102 | `SUM(F26:F27)` | |
| F29/F30 | 601031/032 | `0` | SGK KPK (Excel'de sabit 0) |
| F28 | 60103 | `SUM(F29:F30)` | |
| F21 | 601 | `F22+F25+F28` | Toplam KPK değişimi |

**Excel kuralı:** F22 hesaplandığında **F24 zaten içindedir**. F96 formülü F22'yi kullandığında devreden KPK otomatik dahildir.

## 1.3 Ödenen Hasar

| Hücre | Hesap | Formül |
|-------|-------|--------|
| F96 | 61001 | `=(F11+F22+F32)×F320` |
| F95 | 610 | `F96+F105` |
| F105 | 61002 | `SUM(F106:F113)` (reas payı alt kırılım) |

**Oran F320 (kalem 0211):**
- Mizan pay: `61001`
- Mizan baz: `60001 + 60101 + 60201`
- Tahmin: `=(F11+F22+F32)×F320`

**Kritik:** Hasar **brüt bazında F22 (60101)** kullanır; **F21 (601 toplam) değil**. Net oranlarda F21/F10 kullanılır (F224, F227).

## 1.4 Muallak

| Hücre | Hesap | Formül |
|-------|-------|--------|
| F116 | 611011 | `F11×F451` |
| F126 | 611012 | `F11×F456` (devreden muallak oranı) |
| F115 | 61101 | `F116+F126` |
| F114 | 611 | `F115+F136` |

Muallak **prim × oran** ile türetilir; devreden ayrı satır (F126).

## 1.5 Teknik gelir / gider

| Hücre | Hesap | Formül |
|-------|-------|--------|
| F9 | 60 | `F10+F21+F31+F38+F83+F86` |
| F94 | 61 | `F95+F114+F157+F164+F176+F217+F202` |

V2 bilinçli sapma: F38 F9 sentetiğinden çıkarılır (ayrı TKZ katmanı).

## 1.6 Genel giderler (kullanıcı girdisi)

| Hücre | Hesap | Formül |
|-------|-------|--------|
| F190–F194 | 61402–61406 | `SUMIFS('Genel Gider'!$H:$H, …) × −F368` |
| F368 | — | Branş payı: mizan pay/baz `61402` |

Excel'de genel gider **dış "Genel Gider" sayfasından** gelir; GT tahmin etmez.

## 1.7 Mali gelir

| Hücre | Hesap | Formül |
|-------|-------|--------|
| F38 | 603 | `SUMIFS('Nakit Akış Özet'!$AC:$AC, …, "bs") × F397` |
| F397/F398 | — | Geçmiş 60301 branş payı, ağırlıklı yıl birleştirme |

Excel F38 = **nakit akış bilanço tabanı × tarihsel 60301 payı**. Basit `banka × getiri` değil.

---

# BÖLÜM 2 — 2026 modelinde veri kaynakları

Her kalem için: **KAYNAK → HESAPLAMA → GT SATIRI**

## 2.1 Prim hedefi

```
Kullanıcı tarife hedefleri (V2 varsayımlar / UI)
  → alignTarifeHedefleri(satisRows ile hizalama)
  → DagitimMotoru.dagit()  [lib/butce/prim/dagitimMotoru.ts]
      girdiler: satisRows, uretim, tarifeMap, tarifeBransPay, mizan (yedek pay)
  → primHedefleri[7xx], endirektPrim[7xx]
  → GT F11 (brüt prim YTD = hedef × aylık kümülatif pay)
```

| GT | Hesap | Kaynak |
|----|-------|--------|
| F11 | 60001 | `primHedefleri[brans] × cumPay(ay)` |
| F19 | 60002 | GT motoru: `F11 × F295` |

## 2.2 Tarife / 7xx dağılımı

```
Tarife grubu hedefi
  → DagitimMotoru (geçmiş mizan payları, üretim tablosu, tarife-branş eşlemesi)
  → primHedefleri["701"], ["715"], …
```

Fallback: `primHedefFromTarifeAna()` — tarife ana hedef × mizan pay.

## 2.3 Aylık prim dağılımı

```
mizanAylik (GT 0111, geçmiş yıllar)
  → aylikOranlariFromMizan()
  → createAylikDagilimTablosu()
  → AylikPrimStore (branş × 12 ay pay, toplam=1)
  → gelirTablosu: ytdBrut = yıllıkPrim × Σpay[0..i]
```

## 2.4 KPK (cari)

```
Geçmiş mizan GT 0111 (mizanAylik + mizanAylikFull, Y-2/Y-1)
  + bütçe yılı aylikPrim (dağıtılmış prim)
  → buildKpkPrimGecmisi()
  → hesaplaKpkBrans() / rollingStokSerisi()
      vade: kpk-vade.json (branş × ay gün)
      kpkTutari(prim, yazımAy, vade, değerlemeAy)
  → gtStokSeviyeleriFromRolling()
  → gtAylik[23] = −cariStok[m]   (601011 cari stok)
  → gtAylik[26] = f23 × reasOran
  → gtAylik[22] = f23 + f24_motor   (f24_motor = 0)
```

| GT | Hesap | Kaynak |
|----|-------|--------|
| F23 | 601011 | KPK motor rolling stok |
| F26 | 601021 | F23 × reasürans oranı (mizan 0112) |
| F22 | 60101 | F23+F24 (motor: F24=0) |

**Excel farkı:** Excel F23/F24 ayrı sayfalardan; kod tek rolling motor + mizan devreden.

## 2.5 Devreden KPK

```
mizan-aylik-full
  filtre: yil = butceYili (2026), ay = 1, hesap GT 01212 / 01222, branş 7xx
  → devredenKpkOcakFromMizan()  [kpkDevreden.ts]
  → kpkDev.satir24 (F24), kpkDev.satir27 (F27)
```

| GT | Hesap | Kaynak |
|----|-------|--------|
| F24 | 601012 | **2026 Ocak mizan** GT kodu `01212` (kümülatif YTD) |
| F27 | 601022 | **2026 Ocak mizan** GT kodu `01222` |

**Excel farkı:** Excel `'MEVCUT YIL DEVREDEN KPK'` sayfası + `×−1`. Kod doğrudan mizan tutarını okur (işaret mizandan gelir).

**Önemli:** KPK motorunun `devredenStok[]` alanı hesaplanır ama **GT'ye hiç yazılmaz** — dead code.

## 2.6 Ödenen Hasar

```
disHucreler[11] = ytdBrut (prim motoru)
disHucreler[22] = gtAylik[22][i]  ← SORUNLU (devreden dahil değil)
disHucreler[32] = DERK (GT motoru / KPK sonucu)
F320 = MizanOranServisi kalem 0211 (mizan 61001/60001+60101+60201 + override)
  → gtMotoru.hesaplaBrans() → F96 = (F11+F22+F32)×F320
  → bransAylik[96][i] = YTD_F96[i] − YTD_F96[i−1]
```

| GT | Hesap | Kaynak |
|----|-------|--------|
| F96 | 61001 | Formül motoru (yukarıdaki girdiler) |
| F320 | — | Geçmiş mizan oran + UI override |

## 2.7 Muallak

```
F451, F456, F466, F471 = MizanOranServisi (mizan pay/baz)
F116 = F11 × F451  (GT motoru)
disHucreler[126/147] = devredenMuallakOcakFromMizan()
  kaynak: Y-1 Aralık mizan GT 02212/02222
F115 = F116+F126 (formül)
```

Muallak devreden **disHucreler'a** yazılır; KPK gibi post-loop `bransAylik` override **yok**.

## 2.8 Genel giderler

```
Kullanıcı faaliyetGiderButce[61402..61406]  (tercih edilen)
  VEYA
Önceki yıl mizan 61402–06 × (1 + giderArtisOrani)
  → buildFaaliyetGiderFromMizanArtis()
  → eşit 1/12 aylık profil
  → buildFaaliyetGiderSonuc() → branş dağılımı F368 oranı
  → disHucreler[190–194] YTD kümülatif
  → post-loop bransAylik override (faaliyet motor serisi)
```

| GT | Hesap | Kaynak |
|----|-------|--------|
| F190–F194 | 61402–06 | **Kullanıcı bütçe** veya mizan×artış |
| F368 | — | Mizan branş payı |

## 2.9 Mali gelir

```
gtPass1.aylikToplam (F96, F11, F105, F86, F177, F19, F190–194)
  + resolveAcilisBanka() (Y-1 bilanço 102/100/10)
  + aylikGetiriOrani[] (kullanıcı)
  → buildMaliGelirProxy() — banka rolling simülasyonu
  → proxy.maliGelirAylik[12]
  → gtPass2 aylikSatirOverride {38: proxy}
  → dagitMaliGelirNetNakit() — net nakit payı ile branş dağılımı
```

| GT | Hesap | Kaynak |
|----|-------|--------|
| F38 | 603 | **V2 proxy** (Excel F38 formülü DEĞİL) |

---

# BÖLÜM 3 — KPK zinciri (baştan sona)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. GEÇMİŞ MİZAN (2022 Ocak → 2025 Aralık)                       │
│    GT 0111 brüt prim, mizan-aylik + mizan-aylik-full            │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. PRİM GEÇMİŞİ (buildKpkPrimGecmisi)                           │
│    Y-2, Y-1: mizan aylık artış                                  │
│    Bütçe yılı: aylikPrim store (tarife dağılım × mevsim)        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. ROLLING STOK (hesaplaKpkBrans)                               │
│    Her ay sonu: Σ aktif yazımlardan kpkTutari(prim, vade)       │
│    cariStok[0..12] — ay 0 = önceki yıl 31 Aralık                │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. GT STOK SEVİYELERİ (gtStokSeviyeleriFromRolling)             │
│    F23[m] = −cariStok[m]                                        │
│    F24[m] = 0  ← motor devreden ÜRETMİYOR                       │
│    F22[m] = F23[m] + 0                                          │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. DEVREDEN KPK (devredenKpkOcakFromMizan)                      │
│    Kaynak: 2026 Ocak mizan GT 01212 → satir24                   │
│            2026 Ocak mizan GT 01222 → satir27                     │
│    NOT: Önceki yıl kapanış KPK motoru devredenStok[] kullanılmıyor│
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. GT DÖNGÜSÜ — disHucreler (gelirTablosu.ts:229–257)          │
│    disHucreler[21..30] = gtAylik[s][i]  (stok seviyesi)         │
│    disHucreler[24] = kpkDev.satir24  (mizan devreden)           │
│    disHucreler[27] = kpkDev.satir27                             │
│    ⚠ disHucreler[22] YENİDEN TÜRETİLMİYOR (F23+F24)            │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. GT MOTORU — F96, F116, F9, F94, …                            │
│    F96 = (F11 + disHucreler[22] + F32) × F320                   │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. POST-LOOP OVERRIDE (gelirTablosu.ts:268–283)                 │
│    bransAylik[23,26,29,…] = gtAylik (motor stok serisi)         │
│    bransAylik[24] = 12× sabit devreden mizan                    │
│    bransAylik[27] = 12× sabit devreden reas                     │
│    turetKpkUstSatirlar(): F22=F23+F24, F21=F22+F25+F28          │
│    ⚠ F96 YENİDEN HESAPLANMIYOR                                  │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. DASHBOARD (v2OzetDeger)                                      │
│    KPK satırları: kpkStokYtd → anchor ay tek hücre (stok)       │
│    F96: aylikBrans[96] toplamı (döngü delta'sı, override öncesi)│
└─────────────────────────────────────────────────────────────────┘
```

## Stok vs hareket karışıklığı

| Kavram | Excel | Kod implementasyonu | UI etiketi |
|--------|-------|---------------------|------------|
| F23 (601011) | YK KPK sayfası **stok** | Rolling motor **stok** | "Cari brüt KPK hareketi" ❌ |
| F24 (601012) | Devreden sayfa **stok × −1** | Mizan Ocak **sabit seviye** 12 ay | "Devreden brüt KPK hareketi" ❌ |
| F22 (60101) | F23+F24 (formül) | Motor: F23+0; ekran: F23+F24 (sonra) | "Brüt KPK değişimi" ❌ |
| F21 (601) | F22+F25+F28 | Aynı rollup | "KPK değişim" ❌ |
| F96 baz F22 | F22 hücresi (F24 dahil) | disHucreler[22] (F24 **hariç**) | — |

**Sonuç:** Kod `gtAylik` içinde **stok seviyesi** tutuyor; tip yorumları ve UI **hareket/değişim** diyor. Excel de stok tabanlı ama F22 formülü sayesinde devreden her zaman dahil.

---

# BÖLÜM 4 — Devreden KPK ayrıştırması

| Kavram | Excel kaynağı | Kod kaynağı | Aynı mı? |
|--------|---------------|-------------|----------|
| Önceki yıl kapanış KPK stoku | YK KPK + Devreden sayfaları (Y-1 kolon) | `devredenStok[]` hesaplanır, **kullanılmaz** | ❌ |
| Bütçe yılı Ocak devreden KPK | `MEVCUT YIL DEVREDEN KPK` sayfası × −1 | Mizan GT `01212`, ay=1, yil=2026 | ⚠ Farklı kaynak |
| Cari KPK (601011) | YK KPK stok | Rolling motor `gtAylik[23]` | ⚠ Farklı hesap yolu |
| Ay sonu KPK stoku | KPK sayfaları | `cariStok[m]` rolling | Benzer mantık, farklı implementasyon |
| KPK değişimi (601) | F21 = rollup | Stok rollup (hareket değil) | ❌ Semantik fark |

**Devreden KPK gerçek kaynak (kod):**

```typescript
// kpkDevreden.ts
// GT kod 01212 → F24 (601012)
// GT kod 01222 → F27 (601022)
// Filtre: mizanAylikFull, yil = butceYili, ay = 1, brans 7xx
```

Bu, Excel'in `'MEVCUT YIL DEVREDEN KPK'` sayfasının **muhtemel mizan karşılığıdır** — ancak kod Excel sayfasını okumaz; doğrudan mizan JSON okur. İşaret ve tutar uyumu ayrıca doğrulanmalıdır.

---

# BÖLÜM 5 — Ödenen Hasar (F96) detay

## Excel formülü

```
F96 = (F11 + F22 + F32) × F320
F22 = F23 + F24   ← F24 devreden dahil
F320 = mizan(61001) / mizan(60001+60101+60201)  [yıl birleştirmeli]
```

## Kod — F96 hesap anı

**Dosya:** `gelirTablosu.ts` satır 229–259, `gtMotoru.ts` satır 148–151

```typescript
// 1) KPK motor serisi disHucreler'a yazılır
disHucreler[22] = kpkBrans.gtAylik[22][i]  // = F23[i] + 0

// 2) Devreden ayrı yazılır — F22 güncellenmez
disHucreler[24] = kpkDev.satir24

// 3) F96 hesaplanır — F22 eski, F24 kullanılmaz
ytdVals = motor.hesaplaBrans(..., disHucreler, i+1)
// F96 = (F11 + disHucreler[22] + F32) × F320
```

## Kod — ekran F22 (döngü sonrası)

**Dosya:** `gelirTablosu.ts` satır 278–282, `kpkDevreden.ts` satır 79–85

```typescript
bransAylik[24] = sabit devreden
turetKpkUstSatirlar(bransAylik)
// bransAylik[22] = F23 + F24  ← devreden DAHİL
// F96 bransAylik[96] DEĞİŞMEZ
```

## Fonksiyon sorumluluk tablosu

| Değer | Hesap anı (F96 için) | Ekran değeri | F96 yeniden hesap? |
|-------|----------------------|--------------|-------------------|
| F22 | `gelirTablosu` disHucreler ← `kpkMotoru.gtAylik[22]` | `turetKpkUstSatirlar` sonrası `bransAylik[22]` | **Hayır** |
| F24 | `disHucreler[24]` ← mizan | `bransAylik[24]` ← mizan (12× sabit) | F96'ya dolaylı etki yok |
| F21 | disHucreler[21] ← motor rollup | turetKpkUstSatirlar sonrası | Hayır |
| F96 | gtMotoru.hesaplaBrans delta | bransAylik[96] (delta, frozen) | — |

## Somut örnek: 701 Yangın, Ocak 2026 (yerel build)

| Girdi | Hesapta kullanılan | Ekranda görünen |
|-------|-------------------:|----------------:|
| F11 | 92.165.464 | 92.165.464 |
| F22 | **−426.786.484** | **−19.637.739** |
| F21 | (formülde yok) | +47.282.213 |
| F320 | −20,37% | −20,37% |
| **F96** | **+68.150.590** | **+68.150.590** |

**Doğrulama:**
```
Hesap anı: (92.165.464 + (−426.786.484) + 0) × (−0,2037) = +68.150.590 ✓
Ekran F22 ile: (92.165.464 + (−19.637.739) + 0) × (−0,2037) = −14.773.897 ✗
Kullanıcı F21 ile: (92.165.464 + 47.282.213 + 0) × (−0,2037) = −28.400.611 ✗
```

F22 farkının kökeni:
```
Motor F22 = F23 + 0 ≈ −426,8 mn
Ekran F22 = F23 + F24(devreden) ≈ −426,8 + (+407,2) ≈ −19,6 mn
```

---

# BÖLÜM 6 — "Hayali rakam" tablosu

| GT Satırı | Hesap | Ekranda görünen | Hesapta kullanılan | Fark | Kaynak (hesap) | Kaynak (ekran) | Sorun |
|-----------|-------|----------------:|-------------------:|-----:|----------------|----------------|-------|
| **F22** | 60101 | −19.637.739 | −426.786.484 | +407 mn | `kpkMotoru.gtAylik[22][0]` (F24=0) | `turetKpkUstSatirlar` (F24=mizan) | Devreden F22'ye hesap anında yansımıyor |
| **F21** | 601 | +47.282.213 | disHucreler[21] motor rollup (F24 hariç) | ~467 mn | `kpkMotoru.gtAylik[21][0]` | `turetKpkUstSatirlar` | F96'da kullanılmıyor ama kullanıcı KPK sanıyor |
| **F24** | 601012 | devreden mizan | disHucreler[24] aynı | 0 | mizan 01212 | mizan 01212 | F22 formülüne dahil edilmiyor |
| **F96** | 61001 | +68.150.590 | +68.150.590 | 0 | gtMotoru (eski F22) | aynı frozen delta | Ekran KPK ile tutarsız |
| **F23** | 601011 | stok seviyesi | aynı stok | 0 | rolling motor | motor serisi | Stok ≠ "değişim" etiketi |
| **F105** | 61002 | formül sonucu | F96×F436 (override) | alt satır yok | `gtMotoru.ts:169` zorla | Excel F106–F113 atlanır | Alt kırılım phantom |
| **F38** | 603 | proxy dağılım | pass-1 F96 farklı profil | pass bağımlı | net nakit payı | mali gelir proxy | Excel F38 formülü değil |
| **F9001** | sentetik | v2OzetDeger bileşen toplamı | hesaplaV2Sentetik stored | genelde 0 | recursive v2OzetDeger | stored değer kullanılmıyor | Phantom storage |
| **gtPass1** | tüm GT | gösterilmez | mali gelir proxy girdisi | — | buildGelirTablosu pass-1 | atılır | Gizli ara GT |

**Benzer override riski taşıyan satırlar (F96 ile aynı mekanizma):**

- F116, F115, F114 (muallak bloğu — F126 disHucreler'da sabit)
- F86 (rücu: `(F96+F116)×F315` — F96 frozen)
- F95, F94 (F96'ya bağlı)
- F9001 bileşenleri (F21 post-override)

---

# BÖLÜM 7 — Hesaplama sırası (gerçek akış)

```
buildV2GelirTablosu()
│
├─1─ DagitimMotoru → primHedefleri, endirektPrim
├─2─ aylikOranlariFromMizan → aylikPrim (mevsim)
├─3─ buildFaaliyetGiderFromMizanArtis → 61402–06 (kullanıcı veya mizan×artış)
├─4─ devredenMuallakOcakFromMizan → F126/F147 map
├─5─ devredenKpkOcakFromMizan → F24/F27 map
│
├─6─ buildGelirTablosu() PASS-1  ─────────────────────────────┐
│     ├─ buildKpkSonuc → kpkByBrans                           │
│     ├─ buildFaaliyetGiderSonuc → fgByBrans                  │
│     └─ her branş, ay 0..11:                                 │
│           ├─ disHucreler ← KPK (F22 ham)                    │
│           ├─ disHucreler[24/27] ← devreden                  │
│           ├─ gtMotoru.hesaplaBrans → F96, F116, …           │
│           ├─ bransAylik[s][i] = YTD delta                   │
│           ├─ ⚠ KPK bransAylik OVERRIDE (F22 yeniden türet)  │
│           └─ ⚠ F96 OVERRIDE YOK                             │
│
├─7─ buildMaliGelirProxy(gtPass1.aylikToplam) → F38 serisi
│
├─8─ buildGelirTablosu() PASS-2 (aynı mantık + F38 override)
├─9─ dagitMaliGelirNetNakit → F38 branş payı düzelt
└─10─ hesaplaV2SentetikSatirlar → F9001–F9006
```

**Kritik soru cevabı:** Evet — **F22, F21, F24, F27** döngü sonrası değiştiriliyor. **F96, F95, F86, F9001** buna bağlı ama **yeniden hesaplanmıyor**.

---

# BÖLÜM 8 — Excel vs Kod karşılaştırması

## Yapısal farklar (tüm branşlar)

| Konu | Excel | Kod | İlk sapma noktası |
|------|-------|-----|-------------------|
| F22 birleştirme | `F23+F24` formül hücresi | F22 motor; F24 ayrı; **F22 güncellenmez** | `gelirTablosu.ts:235` vs `:255` |
| Devreden KPK kaynağı | Devreden KPK sayfası | Mizan 01212 Ocak | Veri kaynağı |
| KPK cari | YK KPK sayfası | Rolling motor | Hesap yolu |
| F38 mali gelir | Nakit Akış × 60301 payı | Banka proxy × getiri | Bilinçli V2 fark |
| Genel gider | Genel Gider sayfası | Kullanıcı bütçe / mizan×artış | OK (kullanıcı girdisi) |
| F96 yeniden hesap | Her ay kolon bağımsız | Delta YTD; KPK override sonrası stale | `gelirTablosu.ts:268–283` |
| F22 baz semantiği | Stok rollup (F24 dahil) | Stok (F24 hariç) at calc | `disHucreler[22]` |

## 701 Yangın Ocak — sayısal zincir

```
Prim F11        → Aynı mantık (dağılım farkı olabilir)     → küçük fark OK
KPK F23         → Rolling stok                            → Excel YK KPK ile karşılaştırılmalı
Devreden F24    → Mizan 01212                             → Excel devreden sayfa ile karşılaştırılmalı
F22             → ❌ İLK BÜYÜK FARK (−426M vs −19,6M)      → devreden F22'ye yansımıyor
F96             → ❌ Excel beklentisi ~−15M, kod +68M       → F22 hatasından türetiliyor
Teknik sonuç    → F21/F96 hataları F9001'e yayılır         → bileşen toplamı
Mali gelir F38  → Excel formülü ≠ V2 proxy                  → ayrı bilinen fark
```

**Farkın ilk oluştuğu nokta:** `disHucreler[22]` ataması — devreden enjekte edilmeden **407 mn** eksik/ fazla F22.

---

# BÖLÜM 9 — Muhasebe modeli (koddan çıkarılan)

```
GİRDİLER
├── Tarife prim hedefleri (kullanıcı)
├── Genel gider 61402–06 (kullanıcı veya mizan×artış)
├── Aylık getiri oranları (kullanıcı)
├── Oran override / yıl ağırlıkları (kullanıcı)
├── Mizan 2022–2025 (GT + Bilanço)
├── Mizan-aylik-full (devreden KPK/muallak)
├── KPK vade tablosu
└── Tarife-branş / üretim tabloları
        │
        ▼
PRİM DAĞITIMI ── DagitimMotoru → primHedefleri[7xx]
        │
        ▼
AYLIK PRİM ── mizan geçmiş payları → 12 ay mevsim
        │
        ├──────────────────────────────┐
        ▼                              ▼
KPK MOTOR                          DEVREDEN KPK
rolling stok → F23,F26,F29       mizan 01212/01222 → F24,F27
gtAylik[22]=F23+0                (motor F24=0)
        │                              │
        └──────────┬───────────────────┘
                   ▼
GT DÖNGÜSÜ (12 ay × branş)
├── disHucreler ← KPK stok + devreden F24/F27
├── ⚠ F22 = motor (F24 hariç)
├── gtMotoru.hesaplaBrans
│   ├── F96 = (F11+F22+F32)×F320     ← ÖDENEN HASAR
│   ├── F116 = F11×F451              ← MUALLAK
│   ├── F19 = F11×F295
│   └── F86 = (F96+F116)×F315
├── bransAylik delta
└── POST-OVERRIDE: KPK serisi + turetKpkUstSatirlar
    ⚠ F96 FROZEN
        │
        ▼
FAALİYET GİDER ── 61402–06 → F190–F194 (post-override)
        │
        ▼
MALİ GELİR PROXY ── pass-1 GT nakit → banka×getiri → F38
        │
        ▼
GENEL GİDER ── TKZ altında F9004
        │
        ▼
TEKNİK SONUÇ ── F9001 (F10+F21+…), F9002, F9003 Safi TKZ
        │
        ▼
NET SONUÇ ── F9005 TKZ = Safi + F38 + genel gider
```

---

# BÖLÜM 10 — Sonuç cevapları

## A. Excel'deki doğru model nedir?

1. **Prim** dış sayfadan; GT içinde dağıtım yok.
2. **KPK** ayrı KPK sayfalarından **stok** okunur; **F22 = F23+F24** formül hücresi; devreden **F24 her zaman F22 içinde**.
3. **Ödenen Hasar** = `(Brüt Prim + Brüt KPK_net + Brüt DERK) × Hasar Oranı`; baz **60101 (F22)**, 601 değil.
4. **Muallak** = prim × oran + devreden satır.
5. **Genel gider** dış girdiden × branş payı.
6. **Mali gelir** = nakit akış BS × tarihsel 60301 payı.
7. Her GT hücresi **tek bir değer** taşır; formül referansları **aynı hücreyi** okur.

## B. Mevcut kod bunu nerede bozuyor?

| # | Konum | Bozan davranış |
|---|-------|----------------|
| 1 | `gelirTablosu.ts:230–257` | `disHucreler[22]` motor F22 (F24=0); F24 ayrı yazılır; F22 = F23+F24 **yapılmaz** |
| 2 | `gelirTablosu.ts:268–283` | KPK `bransAylik` post-override; F96 **yeniden hesaplanmaz** |
| 3 | `kpkMotoru.ts` | `gtAylik` stok tutar; UI/hareket beklenir; F24 motor=0 |
| 4 | `kpkMotoru.ts` | `devredenStok` hesaplanır, GT'ye yazılmaz |
| 5 | `buildV2GelirTablosu.ts` | F38 Excel formülü yerine proxy (bilinçli) |
| 6 | `gtMotoru.ts:169` | F105 = F96×F436 zorla; Excel alt kırılım atlanır |
| 7 | `gelirTablosu.ts` YTD loop | F11 kümülatif prim × F22 anlık stok → aylık delta tutarsız |

## C. İlk hatalı değer hangi hesapta oluşuyor?

**`disHucreler[22]`** — `gelirTablosu.ts` satır 235, KPK motor `gtAylik[22][i]`.

Devreden KPK (`disHucreler[24]`) enjekte edildikten sonra F22 **yeniden türetilmediği** için F22, Excel'deki `SUM(F23:F24)` değerinden sapar.

701 Yangın Ocak: **~407 mn TL** F22 farkı buradan başlar.

## D. Sonraki yanlış sonuçlar nasıl türetiliyor?

```
disHucreler[22] hatalı (F24 hariç)
    → F96 = (F11 + hatalı_F22 + F32) × F320     [+68M yerine ~−15M beklenir]
    → F105 = F96 × F436
    → F95 = F96 + F105
    → F86 = (F96 + F116) × F315
    → F94, F9002 teknik gider
    → F9001 bileşenlerinde F21 post-override (ayrı hata)
    → maliGelirProxy pass-1'de hatalı F96 nakit profiline girer
    → F38 dağılımı etkilenir
    → F9005 TKZ sapması
```

## E. Hangi hesaplama sırasının değişmesi gerekiyor?

**Teşhis önerisi (henüz uygulanmadı):**

1. Devreden enjekte edildikten **hemen sonra**: `disHucreler[22] = disHucreler[23] + disHucreler[24]` (ve F25, F21 rollup).
2. **VEYA** KPK post-override **önce** yapılsın, sonra GT motoru çalışsın (tek geçiş).
3. **VEYA** post-override sonrası F96, F86, F95, F94, sentetik satırlar **yeniden hesaplansın**.

Excel sırası: **KPK değerleri (F23, F24) → F22 formül → F96 formül**. Hepsi aynı anda tutarlı.

## F. Hangi hesaplamalar tamamen gereksiz?

| Hesaplama | Neden |
|-----------|-------|
| Döngü içi KPK `bransAylik` delta'ları | Post-override ile atılır |
| `kpkMotoru.devredenStok` | GT'ye yazılmaz |
| `gtPass1` tam GT | Sadece proxy için; F96 pass-1 değeri final değil |
| `hesaplaV2SentetikSatirlar` stored F9001–F9005 | Dashboard `v2OzetDeger` yeniden hesaplar |
| F106–F113 alt kırılım | F105 override ile atlanır |

## G. Hangi hesaplamalar tekrar tekrar yapılıyor?

| İşlem | Kaç kez |
|-------|---------|
| `buildGelirTablosu` | 2× (pass-1 + pass-2) |
| KPK motor (`buildKpkSonuc`) | 2× (her pass'ta) |
| GT motor 12×12 branş-ay | 2× pass |
| F21/F22 rollup | 1× motor + 1× turetKpkUstSatirlar (farklı girdilerle) |
| Sentetik satırlar | 1× store + 1× v2OzetDeger recursive |

## H. Hangi hesaplamalar görünmeyen "hayali" ara değer üretiyor?

1. **`disHucreler[22]` at F96 calc** — ekran F22'den farklı (701: −427M vs −20M).
2. **Döngü delta `bransAylik[21–30]`** — override öncesi, atılır.
3. **`gtPass1` F96** — proxy girdisi, dashboard'da yok.
4. **F105 zorla** — F106–F113 phantom.
5. **Stored F9001–F9005** — UI okumaz.
6. **F21 disHucreler vs ekran F21** — kullanıcı 601 toplamını görür, F96 farklı F22 kullanır.

---

## Ek: Muallak ve faaliyet gideri — benzer risk

| Blok | Post-override? | F96 benzeri stale risk? |
|------|----------------|-------------------------|
| KPK 21–30 | **Evet** | **Evet** (F96, F86) |
| Faaliyet 190–194 | **Evet** | Orta (F94, proxy) |
| Muallak 126/147 | Hayır (sadece disHucreler) | Düşük |
| F38 | pass-2 override + net nakit | Orta |

---

## Sonraki adım (kod değişikliği DEĞİL — senin onayın bekleniyor)

1. Excel v8'den 701 Yangın Ocak **referans rakamları** çıkar (F22, F96, F24) — kod sonuçlarıyla yan yana.
2. Mizan 01212 Ocak 701 devreden tutarını doğrula — F22 farkını sayısal olarak kapat.
3. Onayından sonra: hesap sırası düzeltmesi + F96 tutarlılık guard.

---

*Bu rapor kod değiştirilmeden üretilmiştir. Referans: `lib/butce/gelir/gelirTablosu.ts`, `gtMotoru.ts`, `kpkMotoru.ts`, `kpkDevreden.ts`, `buildV2GelirTablosu.ts`, `gt_excel_harita.json`.*
