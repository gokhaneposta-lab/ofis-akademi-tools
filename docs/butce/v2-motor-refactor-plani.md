# Bütçe V2 GT — Refactor Planı (KPK → F22 → F96 zinciri)

> **Durum:** Plan onayı bekleniyor. **Kod değiştirilmedi.**  
> **Referans:** Excel `Bütçe GT Çalışma_v8.xlsx` → `gt_excel_harita.json`  
> **Kapsam:** KPK / devreden / F22 / F21 / F96 / bağımlı teknik gider zinciri  
> **Kapsam dışı (şimdilik):** F38 mali gelir proxy, F105 alt kırılım Excel uyumu

---

## Hedef mimari ilkesi

```
Tek GT hücresi = tek değer = tek kaynak
Hesap anında kullanılan değer = Dashboard değeri = bransAylik değeri
Excel formül sırası: yapraklar → rollup → bağımlı formüller
Post-override YOK
```

---

## ESKİ AKIŞ (mevcut — sorunlu)

```
1. buildKpkSonuc()
      → gtAylik[23] = cari stok
      → gtAylik[24] = 0 (motor)
      → gtAylik[22] = F23+0

2. devredenKpkOcakFromMizan()
      → Map<brans, {satir24, satir27}>

3. buildGelirTablosu — aylık döngü (i=0..11)
      3a. disHucreler[21..30] ← kpk gtAylik (F22 = F23+0)
      3b. disHucreler[24,27] ← mizan devreden
      3c. ⚠ disHucreler[22] GÜNCELLENMİYOR
      3d. gtMotoru.hesaplaBrans() → F96, F86, F95, …
      3e. bransAylik[*][i] = YTD delta

4. POST-OVERRIDE (döngü sonrası)
      4a. bransAylik[21..30] ← kpk gtAylik (ezilir)
      4b. bransAylik[24,27] ← sabit devreden
      4c. turetKpkUstSatirlar() → F22 = F23+F24 (EKRANDA)
      4d. ⚠ F96, F86, F95, F94 DEĞİŞMEZ

5. buildV2GelirTablosu pass-1 → mali gelir proxy (hatalı F96 ile)
6. buildV2GelirTablosu pass-2 → final GT
7. hesaplaV2SentetikSatirlar → F9001–F9005 (stored, UI okumaz)
```

**Kök hata:** Adım 3 ile 4 arasında F22 değişiyor; adım 3'te hesaplanan F96 donmuş kalıyor.

---

## YENİ AKIŞ (hedef)

```
1. buildKpkSonuc()                    [KORUNUR — rolling cari stok]
      → gtAylik[23], gtAylik[26], gtAylik[29] (cari yapraklar)

2. devredenKpkOcakFromMizan()         [KORUNUR — kaynak doğrulanacak]
      → devreden F24, F27 (branş × ay=1 mizan)

3. ★ buildKpkGtHucreleri(brans, ay)   [YENİ — tek birleştirme noktası]
      F23 ← rolling motor gtAylik[23][ay]
      F24 ← devreden mizan (işaret doğrulanmış)
      F22 ← F23 + F24                 ← Excel: =SUM(F23:F24)
      F26 ← motor gtAylik[26][ay]
      F27 ← devreden mizan
      F25 ← F26 + F27
      F29/F30 ← motor
      F28 ← F29 + F30
      F21 ← F22 + F25 + F28           ← Excel: =F22+F25+F28
      → Record<21..30, number> TEK SET

4. buildGelirTablosu — aylık döngü
      4a. disHucreler[21..30] ← buildKpkGtHucreleri()  (final)
      4b. disHucreler[faaliyet] ← faaliyet YTD (mevcut)
      4c. disHucreler[muallak devreden] ← mizan (mevcut)
      4d. gtMotoru.hesaplaBrans() → F96, F86, F95, F94, …
      4e. bransAylik[KPK 21..30][i] ← buildKpkGtHucreleri() (aynı değer)
      4f. bransAylik[formül satırları][i] ← motor delta (mevcut)

5. ❌ POST-OVERRIDE KPK BLOĞU KALDIRILIR

6. buildV2 pass-1 / pass-2           [KORUNUR — F38 hariç]
      → pass-1 artık düzeltilmiş F96 ile proxy

7. hesaplaV2SentetikSatirlar         [KORUNUR — temizlik ayrı faz]
```

---

## KALDIRILACAK HESAPLAMALAR

| Yapı | Dosya | Neden |
|------|-------|-------|
| KPK post-override bloğu | `gelirTablosu.ts:268–283` | Excel sırasına aykırı; F96 stale bırakıyor |
| `turetKpkUstSatirlar()` çağrısı (post-loop) | `gelirTablosu.ts:282` | Rollup artık `buildKpkGtHucreleri` içinde, hesap öncesi |
| Döngü içi KPK delta → ezilme döngüsü | `gelirTablosu.ts:259–264` + override | Atıl ara değer; tek yazım yolu kalacak |
| `kpkMotoru.devredenStok[]` | `kpkMotoru.ts` | GT'ye yazılmıyor; kullanılmıyor (doğrulama sonrası sil) |
| `gtAylik[22/25/28/21]` motor rollup | `kpkMotoru.ts:133–136` | Rollup tek yerde: `buildKpkGtHucreleri` (motor yalnızca yaprak üretir) |

**Şimdilik kaldırılmayacak (başka yerde kullanılıyor / ayrı konu):**

| Yapı | Neden korunuyor |
|------|-----------------|
| GT pass-1 (`gtPass1`) | Mali gelir proxy F96/F11 nakit profiline ihtiyaç duyuyor (F38 refactor öncesi) |
| Faaliyet post-override | Aynı anti-pattern ama **Faz 2** — KPK öncelikli |
| F105 = F96×F436 zorlaması | Excel alt kırılım farkı; **Faz 2b** |
| `hesaplaV2SentetikSatirlar` stored değerler | `v2OzetDeger` zaten bileşen topluyor; temizlik **Faz 3** |

---

## KORUNACAK HESAPLAMALAR

| Modül | Rol |
|-------|-----|
| `DagitimMotoru` | Tarife → 7xx prim |
| `aylikOranlariFromMizan` | Mevsim profili |
| `buildKpkSonuc` / rolling stok | F23 cari (YK KPK karşılığı) |
| `devredenKpkOcakFromMizan` | F24/F27 devreden kaynağı |
| `MizanOranServisi` | F320, F451, F295, … |
| `GelirTablosuMotoru` | Excel formül grafı (F96, F86, F95, …) |
| `buildFaaliyetGiderFromMizanArtis` | 61402–06 kullanıcı/mizan girdisi |
| `buildMaliGelirProxy` | F38 proxy (değiştirilmeyecek) |
| `v2OzetDeger` | Dashboard okuma |
| `kpkGtTutarlilik` prepush guard | Regression'a genişletilecek |

---

## YENİ HESAPLAMA SIRASI (branş × ay)

```
A. Girdiler hazır (döngü dışı, bir kez)
   primHedefleri, endirektPrim, aylikPrim
   kpkByBrans (buildKpkSonuc)
   kpkDevredenOcak (mizan 01212/01222)
   fgByBrans (faaliyet gider)
   muallakDevredenOcak

B. Her branş, her ay i:
   B1. ytdBrut, ytdEndirekt (prim × kümülatif pay)
   B2. ★ kpkHucre = buildKpkGtHucreleri(kpkBrans, kpkDev, i)
   B3. disHucreler ← kpkHucre (F21..F30)
   B4. disHucreler ← faaliyet YTD, muallak devreden
   B5. gtMotoru.hesaplaBrans(brans, ytdBrut, ytdEndirekt, disHucreler, i+1)
   B6. bransAylik[21..30][i] = kpkHucre[s]        ← seviye, delta değil
   B7. bransAylik[formül satırları][i] = YTD delta  ← F96, F95, …
```

---

## F22 KAYNAĞI (yeni)

```
F22[brans, ay] = F23[brans, ay] + F24[brans, ay]

F23[brans, ay] = kpkByBrans.gtAylik[23][ay]
                 = −rollingStok(cariStok[ay])
                 Kaynak: geçmiş+mizan prim geçmişi + vade tablosu

F24[brans, ay] = devredenKpkOcak.get(brans).satir24   (tüm aylar sabit*)
                 Kaynak: mizan-aylik-full GT 01212, yil=2026, ay=1
                 *Excel ile ay dağılımı doğrulanacak — bkz. Sorular

F22 tek fonksiyonda türetilir; gtMotoru ve bransAylik aynı F22'yi okur.
```

---

## F24 KAYNAĞI (yeni — doğrulama gerekli)

```
Excel:
  F24 = SUMIFS('MEVCUT YIL DEVREDEN KPK'!$V:$V, …) × (−1)

Kod (mevcut):
  F24 = mizanAylikFull[GT 01212, brans, 2026-Ocak].tutar   (işaret OLDUĞU GİBİ)

Doğrulama adımı (kod değişikliği öncesi):
  701 Yangın için Excel F24 vs mizan 01212 vs mizan 01212×(−1) yan yana
  Hangisi F22 = −19.637.739 veriyorsa o kural kalıcılaştırılır
```

**701 Ocak geri hesap (teşhisten):**
```
F22 (hedef)  = −19.637.739
F23 (motor)  = −426.786.484
F24 (gerekli)= F22 − F23 = +407.148.745
```

---

## F96 KAYNAĞI (yeni)

```
F96 = (F11 + F22 + F32) × F320

F11 = ytdBrut (prim dağılımı × kümülatif pay)
F22 = buildKpkGtHucreleri() → F23+F24  ← düzeltilmiş
F32 = gtMotoru içinde (DERK; disHucreler veya formül)
F320 = MizanOranServisi kalem 0211, ay=i+1, branş override

Hesap: GelirTablosuMotoru.hesaplaBrans()
Depolama: bransAylik[96][i] = YTD_F96[i] − YTD_F96[i−1]
Dashboard: v2OzetDeger → Σ bransAylik[96][0..anchor−1]
```

**701 Ocak beklenen (F22 düzeltildikten sonra):**
```
F96 ≈ (92.165.464 + (−19.637.739) + 0) × (−0,2037)
    ≈ −14.773.897
(Excel referans değeri onay bekliyor)
```

---

## F96'YA BAĞLI SATIRLAR (Excel bağımlılık grafiği)

```
F22 ─────────────────────────────────────────┐
                                              ▼
F11 ──┐                                  F96 = (F11+F22+F32)×F320
F32 ──┘                                      │
                                             ├──► F105 (=F96×F436 kodda; Excel SUM(F98:F100) — Faz 2b)
                                             │         │
                                             │         ▼
                                             └──► F95 = F96+F105
                                                       │
F116 = F11×F451 ────────────────────────────────────┼──► F86 = (F96+F116)×F315
F126 = F11×F456 (devreden muallak)                   │
F115 = F116+F126 ──► F114 ───────────────────────────┤
                                                       ▼
                                                  F94 = F95+F114+F157+F164+F176+F217+F202
                                                       │
F21 ← F22 rollup ──► F10 ────────────────────────────┼──► F9 = F10+F21+F31+F38+F83+F86
                                                       │
                                                       ▼ (V2)
                                                  F9002 Teknik Gider
                                                  F9001 = F10+F21+F31+F83+F86 (F38 hariç)
                                                  F9003 Safi TKZ

Pass-1 mali gelir proxy (F38 hariç, korunur):
  netNakit ← F11, F96, F105, F86, F177, F19, F190–194
  → buildMaliGelirProxy → F38 dağılımı
```

**F22 düzelince yeniden hesaplanması gerekenler (aynı gtMotoru pass'inde otomatik):**
F96 → F105 → F95 → F86 → F94 → (F9 bileşenleri) → pass-1 proxy girişleri → F9001/F9002/F9003

**Muallak (F116/F126):** F22'den bağımsız; F96 düzeltmesi F86'yı dolaylı etkiler (F96+F116 baz).

---

## KPK STOK / HAREKET — Excel kararı

Excel `gt_excel_harita.json` satır adları:

| Hücre | Excel adı | Formül kaynağı | Kavram |
|-------|-----------|----------------|--------|
| F23 | KAZANILMAMIŞ PRİM KARŞILIĞI | YK KPK stok (V) | **Ay sonu cari stok** |
| F24 | DEVREDEN KPK | Devreden sayfa (V)×−1 | **Devreden stok (işaretli)** |
| F22 | BRÜT KPK (DEVREDEN DÜŞÜLMÜŞ) | F23+F24 | **Net stok pozisyonu** |
| F21 | KPK **DEĞİŞİM** | F22+F25+F28 | GT'de "değişim" etiketi; Excel'de stok rollup toplamı |

**Plan kararı:** Kod da Excel gibi **stok seviyesi** tutacak (yaprak + rollup). UI etiketleri "hareketi" → "stok/seviye" olarak düzeltilecek (ayrı PR). `bransAylik[KPK]` = **ay sonu seviye** (delta değil). `v2OzetDeger` + `kpkStokYtd` mevcut okuma korunur.

**Hareket (mizan 601 P&L):** GT bütçe modeli mizan hareketini doğrudan okumaz; KPK sayfası stok mantığıyla gider. Bu Excel ile uyumlu.

---

## UYGULAMA FAZLARI

### Faz 1 — KPK birleştirme (öncelik, senin onayın sonrası)

1. `lib/butce/kpk/buildKpkGtHucreleri.ts` — yeni fonksiyon
2. `gelirTablosu.ts` — post-override kaldır; döngüde yeni fonksiyon
3. `kpkMotoru.ts` — üst satır rollup kaldır (yaprak only); veya rollup deprecated bırak
4. Regression script: `scripts/butce-v2-701-regression.ts`
5. `kpkGtTutarlilik.ts` — F96 = f(F11,F22,F32,F320) guard ekle
6. `butce-v2-prepush-check.ts` — guard entegrasyonu

### Faz 2 — Faaliyet gider aynı pattern

Faaliyet post-override kaldır; `disHucreler[190–194]` final değerler döngü öncesi.

### Faz 2b — F105 Excel uyumu (isteğe bağlı)

Excel `SUM(F98:F100)` vs `F96×F436` — sen karar ver.

### Faz 3 — Temizlik

- `devredenStok` kaldır
- Stored sentetik yazımı sadeleştir
- Pass-1'i proxy-only hafif hesap moduna indir (F38 refactor sonrası)

---

## 701 YANGIN OCAK — REGRESSION TEST (uygulama sonrası)

Script her satır için yazdıracak:

| Satır | Excel | Kod | Fark | F96 hesabında kullanıldı mı? |
|-------|------:|----:|-----:|:----------------------------:|
| F11 | ? | | | ✓ |
| F23 | ? | | | (F22 bileşeni) |
| F24 | ? | | | (F22 bileşeni) |
| F22 | ? | | | **✓ — ekran = hesap kanıtı** |
| F21 | ? | | | |
| F32 | ? | | | ✓ |
| F320 | ? | | | ✓ |
| F96 | ? | | | çıktı |
| F105 | ? | | | |
| F95 | ? | | | |
| F86 | ? | | | |

Açık kanıt satırı:
```
F96 = (F11 + F22 + F32) × F320
    = (_______ + _______ + _______) × _______
    = _______
Kullanılan F22 = _______ = Ekran F22 = _______  → AYNI / FARKLI
```

**Excel sütun değerleri:** Repoda v8 xlsx yok — regression için Excel'den 701 Ocak kolonu export veya manuel giriş gerekli (bkz. Sorular).

---

## AÇIK SORULAR (cevap olmadan uygulamaya geçilmemeli)

### S1. Devreden KPK işareti
Excel `F24 = SUMIFS(…) × −1`. Mizan `01212` tutarı **zaten GT işaretinde mi**, yoksa koda `×−1` uygulanmalı mı?

701 için: mizan 01212 ham değeri nedir? `+407.148.745` mi yoksa farklı mı?

### S2. Devreden KPK dönemi
Kod: **2026 Ocak** mizan (`01212`, ay=1).  
Muallak devreden: **2025 Aralık** (`02212`, ay=12).  
Excel `MEVCUT YIL DEVREDEN KPK` sayfası hangi dönemi temsil ediyor — Ocak devralma mı, önceki yıl kapanış mı?

### S3. F24 ay profili
Kod F24'ü **12 aya aynı sabit** yazıyor. Excel'de devreden KPK yalnızca Ocak kolonunda mı görünüyor, yoksa tüm aylarda mı?

### S4. Excel referans rakamları
701 Yangın Ocak 2026 için Excel modelinden şu hücreleri paylaşabilir misin?
`F11, F23, F24, F22, F21, F32, F320, F96, F105, F95, F86`

Regression "Excel vs Kod" tablosu bunlar olmadan eksik kalır.

### S5. YTD vs aylık hareket (F96)
Excel bütçe GT'sinde Ocak kolonu **YTD kümülatif** mi, yoksa **sadece Ocak hareketi** mi?  
(Mevcut kod YTD motor + delta kullanıyor; Excel kolon yapısı onaylanmalı.)

### S6. Faaliyet gider post-override
KPK refactor ile **aynı PR**'da mı düzeltilsin, yoksa KPK doğrulandıktan sonra ayrı faz mı?

---

## ÖZET — Plan onayı için checklist

- [ ] Yeni akış: `buildKpkGtHucreleri` → disHucreler → gtMotoru → bransAylik (aynı F22)
- [ ] Post-override KPK bloğu kaldırılacak
- [ ] F96, düzeltilmiş F22 ile hesaplanacak; ekran = hesap kanıtlanacak
- [ ] F21 rollup aynı fonksiyonda
- [ ] F38 / mali gelir dokunulmayacak
- [ ] Pass-1 korunacak (düzeltilmiş F96 ile)
- [ ] 701 regression test eklenecek
- [ ] S1–S6 cevapları bekleniyor

---

*Sonraki adım: Bu plan + soru cevapları onaylandıktan sonra Faz 1 uygulaması.*
