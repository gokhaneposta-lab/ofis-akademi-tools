# Bütçe V2 — Excel Doğrulama Raporu (S1–S6)

> **Kaynak:** `Bütçe GT Çalışma_v8.xlsx` (Cursor Projeler klasörü)  
> **Branş:** 701 Yangın — GT sütunu **F** (`GT!F5 = 701`)  
> **Durum:** Kod değişikliği yapılmadı. Faz 1 onaylı; uygulama bu rapordan sonra.  
> **Çıkarım aracı:** `scripts/_tmp-excel-701-read.ts` (geçici, tanı amaçlı)

---

## Özet tablo

| Soru | Excel destekliyor mu? | Kısa cevap |
|------|----------------------|------------|
| **S1** Devreden işareti | **Evet** (formül açık) | Ham devreden negatif → GT'ye `× (−1)` ile pozitif yazılır. Mizan 01212 zaten pozitif; koda `× (−1)` **uygulanmamalı**. Tutar farklı (407M vs 451M). |
| **S2** Devreden dönemi | **Kısmen** | Excel: `MEVCUT YIL DEVREDEN KPK` sütun **V** (2026-12-31). Kod: mizan 01212 **Ocak 2026**. Aynı kaynak değil. |
| **S3** F24 ay profili | **Evet** | Excel'de devreden yalnızca **V** sütununda dolu; K–U sıfır. GT formülü **her zaman V** okur — aylık profil yok. |
| **S4** 701 Ocak referans | **Kısmen** | GT sayfasında aylık kolon yok. Ocak stok sütunu (K) = **0**. GT!F değerleri yılsonu (V) ankerli. |
| **S5** YTD vs aylık F96 | **Hayır / belirsiz** | Excel GT tek kolon, seviye bazlı; kod aylık YTD+delta. Doğrudan Ocak karşılaştırması anlamsız. |
| **S6** Faaliyet post-override | — | **Faz 2** — KPK PR'sında olmayacak (onaylandı). |

---

## S1 — Devreden KPK işareti

### Excel formülü (GT!F24)

```
=SUMIFS('MEVCUT YIL DEVREDEN KPK'!$V:$V,
        'MEVCUT YIL DEVREDEN KPK'!$D:$D, GT!F$5,
        'MEVCUT YIL DEVREDEN KPK'!$B:$B, GT!$C$1) * -1
```

`GT!C1` → **parametrik dönem filtresi** (Dashboard ComboBox; örnekte `"<13"` = ilk 12 ay). SUMIFS B kriteri: `'…'!$B:$B, GT!$C$1` — sabit muhasebe kuralı değil. Bkz. [`v2-excel-capraz-kontrol.md`](v2-excel-capraz-kontrol.md).

### Sayısal kanıt (701, yılsonu sütun V)

| Adım | Değer |
|------|------:|
| DEVREDEN ham toplam (V, B=`GT!C1` → örnekte `"<13"`, D=701) | **−450.668.683,38** |
| GT F24 (= ham × −1) | **+450.668.683,38** |
| GT F23 (YK KPK V) | −684.018.528,28 |
| GT F22 (= F23 + F24) | −233.349.844,90 ✓ |

**İşaret kuralı:** Excel devreden sayfası **negatif stok** tutar; GT satır 24'e **`× (−1)`** ile **pozitif** yansıtır.

### Mizan karşılaştırması (kod kaynağı — Excel değil)

| Kaynak | 701 Ocak 2026 tutar |
|--------|--------------------:|
| Mizan `01212` (ham) | **+407.148.744,46** |
| Mizan × (−1) | −407.148.744,46 |
| Excel GT F24 (V sütunu) | +450.668.683,38 |

**Sonuç:**

- **İşaret:** Mizan ham değeri zaten GT F24 yönünde (pozitif). Koda Excel'deki `× (−1)` uygulanırsa işaret **tersine döner** → yanlış.
- **Tutar:** Mizan (+407M) ≠ Excel devreden sayfası (+451M). **~43,5 mn fark** — kaynak eşdeğerliği kanıtlanmadı.
- **Faz 1 kararı:** İşaret kuralı Excel'den net: *devreden sayfa ham → GT'ye ters işaretle*. Mizan eşdeğerliği ayrı doğrulama gerektirir; şimdilik mizan ham kullanımı işaret açısından doğru yönde.

---

## S2 — Devreden KPK dönemi / kaynak

### Excel

| Öğe | Değer |
|-----|-------|
| Sayfa | `MEVCUT YIL DEVREDEN KPK` |
| GT formülünde sabit sütun | **V** (DEVREDEN V5: **31.12.2025**; YK KPK V5: 31.12.2026) |
| Filtre | D = `GT!F$5` (701); B = `GT!$C$1` (parametrik dönem — örnekte `"<13"`) |
| Ocak sütunu K (2026-01-31) ham toplam | **0** (24 satır) |

Devreden stok bu workbook'ta **yılsonu sütununda** dolu; Ocak sütununda **sıfır**.

### Kod

| Öğe | Değer |
|-----|-------|
| Kaynak | `mizan-aylik-full.json` |
| Hesap | GT `01212` / `601012` |
| Dönem | **2026 Ocak** (ay=1) kümülatif |
| 701 tutar | +407.148.744,46 |

### Sonuç

Excel **Aralık 2026 stok snapshot** (KPK devreden sayfası V) kullanır; kod **Ocak mizan devralma** kullanır. İkisi **aynı dönem/kaynak değil**. Mizan Ocak tutarı Excel F24 ile **sayısal olarak eşleşmiyor** → eşdeğerlik **belirsiz** (farklı veri hattı veya farklı konsolidasyon olabilir).

---

## S3 — F24 ay profili

### Excel — `MEVCUT YIL DEVREDEN KPK` (701, B=`GT!C1` — örnekte `"<13"`, 24 satır)

| Sütun | Tarih (satır 5) | Ham devreden | GT F24 (= ×−1) |
|-------|-----------------|-------------:|---------------:|
| K | 2026-01-31 | 0 | 0 |
| L–U | 2026-02 … 2026-11 | 0 | 0 |
| **V** | **2026-12-31** | **−450.668.683,38** | **+450.668.683,38** |
| W | 2027-01-31 | −379.119.014,37 | +379.119.014,37 |

GT formülleri F23/F24 için **sabit `$V:$V`** referansı kullanır — ay parametresi **yok**.

### Kod

F24 Ocak mizanından okunur ve **12 aya aynı sabit** yazılır (`ocakOnlyAylikSeri`).

### Sonuç

| Model | Davranış |
|-------|----------|
| Excel GT | Tek kolon; devreden yalnızca V'de; formül aylık değiştirmez |
| Kod | Ocak mizan → 12× sabit |
| Uyum | **Kısmi:** "sabit tüm yıl" fikri yakın, ama Excel **Aralık stok** okur, kod **Ocak mizan** okur; Excel'de Ocak sütunu **0** |

"Devreden yalnızca Ocak kolonunda mı?" sorusuna Excel cevabı: **Hayır** — bu dosyada Ocak (K) sıfır, dolu sütun **V (Aralık)**.

---

## S4 — Excel'den 701 referans rakamları

### A) GT sayfası sütun F (Excel'in tek branş kolonu)

Formüller **KPK sütun V (2026-12-31)** kullanır — bu bir **yılsonu anker** görünümüdür, Ocak kolonu değil.

| Satır | Formül (GT!F) | Excel değeri |
|-------|---------------|-------------:|
| **F11** | `SUMIFS('3-Prim Ay Dağılımı'!$U:$U, …)` | **1.311.749.504,22** ⚠ |
| F23 | `SUMIFS('YK KPK'!$V:$V, …)` | −684.018.528,28 |
| F24 | `SUMIFS('MEVCUT YIL DEVREDEN KPK'!$V:$V, …)*−1` | +450.668.683,38 |
| **F22** | `=SUM(F23:F24)` | **−233.349.844,90** |
| F21 | `=F22+F25+F28` | −94.896.912,20 |
| F32 | `=SUM(F33:F34)` | 0 |
| **F320** | `=(F319*0,8)+(F318*0,005)+(F317*0,15)` | **−44,77%** |
| **F96** | `=(F11+F22+F32)*F320` | **−482.749.962,21** |
| F105 | `=F106+F110+F111+F112+F113` | +375.078.879,25 |
| F95 | `=F96+F105` | −107.671.082,96 |
| F86 | `=(F96+F116)*F315` | +5.419.162,58 |

**F96 tutarlılık kontrolü (Excel içi):**

```
(1.311.749.504,22 + (−233.349.844,90) + 0) × (−0,4477) = −482.749.962,21 ✓ (fark = 0)
```

**F11 tutarsızlığı (⚠):**

| Kontrol | Sonuç |
|---------|------:|
| Prim U toplamı (701, B=`GT!C1` — örnekte `"<13"`) — formülün beklediği | 124.722.813,53 |
| GT!F11 görünen değer | 1.311.749.504,22 |
| YK KPK sütun J (`TUTAR`) toplamı (701, B=`GT!C1`) | **1.311.749.504,22** ← görünen F11 ile birebir |

GT!F11 **formül metni Prim U** diyor; **önbellek değer YK `TUTAR` (J) toplamına** eşit. Dosya yeniden hesaplatılırsa F11 muhtemelen ~125M olur. Regression için F11 referansı **belirsiz** — hangi hücre değerinin otorite olduğu Excel içinde çelişkili.

---

### B) Ocak sonu — KPK sayfaları sütun K (2026-01-31)

Dashboard "Ocak sonu" ankerine en yakın Excel konumu: `YK KPK` / `MEVCUT YIL DEVREDEN KPK` sütun **K**.

| Bileşen | YK KPK (K) | DEVREDEN ham (K) | GT F24 (=×−1) | F22 |
|---------|----------:|-----------------:|--------------:|----:|
| 701 toplam (24 satır, B=`GT!C1`) | **0** | **0** | **0** | **0** |

Ocak sütunu bu workbook'ta **boş/sıfır** — rolling stok henüz aylık kolonlara yazılmamış; yalnızca **V (Aralık)** dolu.

**701 aggregate satır (YK/DEV satır 246, D=701):** K–U `undefined`; V: YK = −253.519,16; DEV ham = −219.399,11 (tek tarife satırı, tüm branş toplamı değil).

---

### C) Kod (701 Ocak 2026 — karşılaştırma, Excel değil)

Yerel V2 build (`v2-motor-teshis-raporu.md`):

| Satır | Hesapta kullanılan | Ekranda |
|-------|-------------------:|--------:|
| F11 | 92.165.464 | 92.165.464 |
| F22 | −426.786.484 | −19.637.739 |
| F320 | −20,37% | −20,37% |
| F96 | +68.150.590 | +68.150.590 |

Ekran F22 ile beklenen F96: `(92,2M + (−19,6M)) × (−20,37%) ≈ −14,8M`

---

### S4 karşılaştırma özeti

| Satır | Excel GT!F (V anker) | Excel Ocak K | Kod Ocak (ekran) |
|-------|---------------------:|-------------:|-----------------:|
| F11 | 1.311,7M ⚠ | — | 92,2M |
| F23 | −684,0M | 0 | (motor stok) |
| F24 | +450,7M | 0 | +407,1M (mizan) |
| F22 | −233,3M | 0 | −19,6M |
| F320 | −44,77% | — | −20,37% |
| F96 | −482,7M | — | +68,2M (stale F22) |

**701 Ocak için tek anlamlı Excel referansı:** KPK sütun K = sıfır stok; GT!F = yılsonu modeli. Dashboard Ocak ile **doğrudan Excel GT!F karşılaştırması uygun değil**.

Regression için önerilen ayrım (Faz 1 test tasarımı — uygulama öncesi onay):

1. **Zincir testi (701 Ocak):** F96 = (F11+F22+F32)×F320; **hesap F22 = ekran F22** kanıtı (kod içi).
2. **Excel formül uyumu:** F22 = F23+F24, F24 işareti, post-override yok.
3. **Excel sayı eşleşmesi:** GT!F yılsonu snapshot veya Ocak K — hangisinin otorite olacağı **ayrıca karar** (bu raporda belirsiz).

---

## S5 — YTD vs aylık hareket (F96)

### Excel GT yapısı

| Özellik | Excel |
|---------|-------|
| Branş başına kolon sayısı | **1** (701 = F) |
| Aylık kolon | **Yok** |
| F23/F24 kaynağı | KPK sayfası **sabit V** (2026-12-31) |
| F11 kaynağı (formül) | Prim **U** = "2026 Hazine Branşı Bazında Hedef" (yıllık hedef) |
| F96 formülü | `(F11 + F22 + F32) × F320` — **seviye** değerler, delta değil |

### Kod yapısı

| Özellik | Kod |
|---------|-----|
| 12 aylık seri | Var (`bransAylik[satir][ay]`) |
| F11 Ocak | YTD kümülatif prim (~92M) |
| F23 | Rolling motor aylık stok |
| F24 | Ocak mizan, 12× sabit |
| F96 | YTD motor + **aylık delta** saklanır |
| F320 Ocak | −20,37% (Excel GT!F: −44,77%) |

### Sonuç

Excel bu dosyada **aylık GT kolon modeli sunmuyor**; yılsonu stok + (muhtemelen) yıllık prim hedefi ile **tek snapshot GT** üretiyor. Kod ise **aylık YTD hareket** modeli.

**Ocak F96 için Excel ↔ kod sayı karşılaştırması: belirsiz / desteklenmiyor** — farklı anker (Ocak vs Aralık), farklı F11 semantiği (YTD vs yıllık hedef), farklı F320.

Faz 1 regression'ın odaklanması gereken şey: **formül zinciri tutarlılığı** (F22 birleştirme → F96), Excel GT Ocak kolonu aranmamalı.

---

## S6 — Faaliyet gider post-override

**Onay:** KPK refactor (Faz 1) ile **aynı PR'da olmayacak** → **Faz 2**.

Kapsam dışı bırakılan blok: `gelirTablosu.ts` faaliyet post-override (~268–283 benzeri pattern, faaliyet satırları).

---

## Excel formül envanteri (701 / GT!F — Faz 1 kapsamı)

```
F22  = SUM(F23:F24)
F21  = F22 + F25 + F28
F23  = SUMIFS('YK KPK'!$V:$V, D=GT!F$5, B=GT!$C$1)
F24  = SUMIFS('MEVCUT YIL DEVREDEN KPK'!$V:$V, D=GT!F$5, B=GT!$C$1) × (−1)
F96  = (F11 + F22 + F32) × F320
F320 = (F319×0,8) + (F318×0,005) + (F317×0,15)
F11  = SUMIFS('3-Prim Ay Dağılımı'!$U:$U, G=GT!F$5, B=GT!$C$1)   [değer/formül tutarsız — bkz. S4]

GT!C1 = parametrik dönem (Dashboard ComboBox: "<4" Q1, "<7" H1, "<13" 12 ay). Sabit kural değil.
```

---

## Faz 1 için net çıkarımlar

| Konu | Excel'den kesin | Uygulama öncesi karar gerekli |
|------|-----------------|------------------------------|
| F22 = F23+F24 hesap öncesi | ✓ | — |
| F24 işareti (devreden ham negatif → GT pozitif) | ✓ | Mizan ham kullan; ×−1 **yapma** |
| Post-override kaldır | ✓ (model sırası) | — |
| Devreden kaynak/dönem | Kısmen | Mizan Ocak vs Excel V — 43M fark |
| Regression Excel rakamı (701 Ocak) | Kısmen | GT!F (V) mi, KPK K mi, yoksa yalnızca iç tutarlılık mı? |
| F11 / F320 Excel eşleşmesi | Belirsiz | F11 formül/değer çelişkisi; F320 farklı |

---

## Sonraki adım

1. Bu rapordaki **belirsiz** maddeler için senin kararın (özellikle regression otorite kolonu: yılsonu GT!F vs kod Ocak).
2. Onay sonrası Faz 1: `buildKpkGtHucreleri` + post-override kaldırma (`v2-motor-refactor-plani.md`).

*Geçici scriptler: `scripts/_tmp-excel-701-read.ts`, `_tmp-mizan-prim-check.ts`, `_tmp-excel-sheets.ts` — silinebilir.*
