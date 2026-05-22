# TSB finansal KPI tanımları (GT + BL + segmentasyon)

Bu dosya **sektör karşılaştırma**, **segmentasyon skoru** ve ilerideki dashboard hesapları için **tek kaynak özet**tir. Veri: `public/data/tsb/gelir-tidy.json` (`tabloTip`: `GT` gelir, `BL` bilanço).

Sohbette hatırlatmak için: **`@docs/tsb-kpi-tanimlari.md`**

---

## 1. Genel kurallar

### 1.1 Bilanço (`BL`) — hiyerarşi ve çoklama

- Bilanço hesapları **ağaç yapısındadır** (ör. `5` Özsermaye altında `50`, `500`, `5xx` …).
- **KPI için yalnızca üst grup satırını** kullanın: `hesapKodu` **tam eşleşme** (`"5"`, `"1"`, …).
- **`50`, `500`, `5xx` gibi alt hesapları ayrıca toplamayın** — üst grup ile **çift sayım** olur.

### 1.2 Gelir (`GT`) — `HAYATDISI` ve branş toplamları

- `bransAp === "HAYATDISI"` sayfası, **HD şirketlerinin hayat dışı gelir tablosu özetidir** (branşların konsolide toplamı).
- Aynı branşın verisi **birden fazla sayfada** yer alabiliyor (ör. trafik hem **TRAFİK** hem **KARA ARAÇLARI SORUMLULUK** vb.); tüm branş sayfalarını toplamak **çift sayım** yapar.
- **Kural (dashboard / KPI):** Aşağıdaki gelir kalemleri için **`bransAp === "HAYATDISI"` tek satır** (veya aynı koda ait yalnızca bu özet satırı) kullanılır; **HAYATDISI + diğer branşlar birlikte toplanmaz**.
- İstisna: **Trafik hariç prim** gibi özel tanımlarda, özetten düşülmek üzere **`bransAp === "TRAFİK"`** (veya ürününüzde netleştirdiğiniz tek branş sayfası) **ayrıca** okunur.

### 1.3 Gider işareti (tidy)

- TSB `gelir-tidy` içinde **faaliyet / personel / genel gider** kalemleri **negatif** `deger` ile gelir; **şimdilik** dashboard’da da **negatif** gösterilir (işaret çevirme yok).

### 1.4 Alan isimleri (`gelir-tidy.json`)

| Alan        | Açıklama                          |
|------------|-----------------------------------|
| `donem`    | Örn. `2025-3`                     |
| `tabloTip` | `GT` gelir tablosu, `BL` bilanço  |
| `bransAp`  | GT: branş sayfası adı; BL: `Aktif` / `Pasif` |
| `hesapKodu` | String; üst grupta tek hane / kısa kod |
| `deger`    | Tutar (sıfırlar import’ta yok)     |

---

## 2. Bilanço KPI’ları (`tabloTip === "BL"`)

**Toplam aktif:** `hesapKodu === "1"` + `hesapKodu === "2"` (ikisi **Aktif** tarafı üst grup).

| KPI | Hesaplama |
|-----|-----------|
| Toplam aktif | `"1" + "2"` |
| Cari varlıklar | `"1"` |
| Cari olmayan varlıklar | `"2"` |
| Nakit ve nakit benzerleri | `"10"` |
| Finansal varlıklar (üst grup) | `"11"` |
| Kısa vadeli yükümlülükler | `"3"` (Pasif) |
| Uzun vadeli yükümlülükler | `"4"` |
| Özsermaye | `"5"` |
| Toplam yükümlülük (özsermaye hariç) | `"3" + "4"` |
| Pasif toplamı (denetim: ≈ aktif) | `"3" + "4" + "5"` |
| Yükümlülük / Özsermaye | `(3+4) / 5` (payda 0 → tanımsız) |
| Yükümlülük / Toplam aktif | `(3+4) / (1+2)` |
| Özsermaye / Toplam aktif | `5 / (1+2)` |
| Nakit benzeri / Kısa vadeli yük. (kaba likidite) | `10 / 3` (`10` Aktif, `3` Pasif) |
| Sigortacılık teknik karşılıkları (KV üst grup) | `"35"` |
| Sigortacılık teknik karşılıkları (UV üst grup) | `"45"` |
| Teknik karşılıklar (üst grup toplamı) | `"35" + "45"` |
| KPK net (KV) | `"350"` |
| KPK net (UV) | `"450"` |
| KPK net (toplam) | `"350" + "450"` |
| Finansal varlık yoğunluğu | `11 / (1+2)` |

**Not:** `35` altında `350`, `352` … ayrı sütunlarda duruyorsa; **üst + alt aynı anda toplanırsa çift sayım** olabilir. Varsayılan KPI: **üst grup (`35`, `45`) veya** ihtiyaç halinde **yalnızca alt net satırlar** — ürün kararı.

- **`450` (KPK net UV)** çeyrek dosyasında **0 veya boş** olabilir; bu, verinin yapısına bağlıdır. **`45` (UV sigortacılık teknik karşılıkları üst grubu)** genelde doludur — kontrol için Pasif sayfasında `hesapKodu === "45"` tek satıra bakın. Excel ile **kuruş farkı** varsa dosya tarihi / revizyon veya yuvarlama farkı kontrol edilir.

---

## 3. Gelir tablosu — Prim KPI’ları (`tabloTip === "GT"`)

### 3.1 Brüt yazılan primler (toplam)

- **Hayat dışı (HD):** `hesapKodu === "60001"` ve **`bransAp === "HAYATDISI"`** → **tek satır** (HD hayat dışı özet brüt prim).
- **Hayat / emeklilik (H, E):** yukarıdaki **`60001` (HAYATDISI)** + tüm branşlarda **`62001`** (hayat üretimi; örn. `bransAp === "HAYAT"`). Uygulama: `lib/tsbSirketSegmentSkor.ts` → `brutPrimFromLookup`.
- **Tüm branşlarda `60001` toplanmaz** (HAYATDISI satırı ile branş `60001` satırları birlikte kullanılmaz).

### 3.2 Trafik hariç prim (özet mantığı)

- **A** = `GT` && `hesapKodu === "60001"` && `bransAp === "HAYATDISI"` → tek satır `deger`.
- **B** = `GT` && `hesapKodu === "60001"` && `bransAp === "TRAFİK"` → tek satır `deger`.
- **Sonuç** = **A − B**.

(`TRAFİK` = verideki sayfa adı / `bransAp` string.)

---

## 4. Gelir tablosu — diğer GT KPI kodları (özet)

**Ortak filtre:** Aşağıdaki kalemlerde (Trafik hariç prim formülü hariç) **`bransAp === "HAYATDISI"`** — her kod için **en fazla bir satır** toplanır; branş sayfaları **ayrıca eklenmez**.

| KPI | Kaynak |
|-----|--------|
| VÖK | Üst gelir tablosu kalemlerinin toplamı: **`hesapKodu` `60`–`65`** → **`bransAp === "HAYATDISI"`**; **`66`, `67`, `68`** → **`bransAp === "MALI"`** (bu üç kod özet sayfada değil, **MALI**’dadır). Her kod için varsa tek satır `deger` toplanır; sıfır olan satırlar tidy’de yoktur. Uygulama: `lib/tsbSirketSegmentSkor.ts` → `vokFromRows`. |
| PRİM (brüt toplam) | HD: `60001` + **`HAYATDISI`** · H/E: + tüm branşlarda `62001` (Bölüm 3.1) |
| Faaliyet giderleri (kom. dahil) | `614` + **`HAYATDISI`** |
| Personel giderleri | `61402`, `63602`, `65202` toplamı, hepsi **`HAYATDISI`** |
| Genel giderler | `61402,63602,65202,61403,63603,65203,61404,63604,65204,61405,63605,65205,61406,63606,65206` toplamı, **`HAYATDISI`** |
| Yatırım geliri (Excel özet / HAYATDISI) | `660,661,662,663,667,668,669,671,672,674,675,677` toplamı — **varsayılan `HAYATDISI`** (Excel ile fark varsa branş kuralı gözden geçirilir). *Segment skoru için asıl tanım aşağıdaki MALI KPI’dır.* |
| **Yatırım geliri (segment KPI)** | **`bransAp === "MALI"`** üzerinden **Bölüm 4.3** formülü. Uygulama: `lib/tsbYatirimGeliriKpi.ts` → `yatirimGeliriSegmentKpiFromRows`. |
| T. kar / zarar (teknik) | Sentetik `__SYN_TKN_KZ__` + **`HAYATDISI`** (`lib/tsbGelirSyntheticCodes.ts`) |
| **SAFİ TEKNİK KAR/ZARAR** | SEDDK: mali gelirin bir kısmı teknik gelire yazılır; bazı genel gider satırları teknik tarafta tekrarlanmaması için gider tarafından düşülür. **Formül (tüm `deger` değerleri tidy’deki işaretiyle):** bkz. **4.2**. Uygulama: `lib/tsbSafiTeknikKpi.ts` → `safiTeknikKzFromRows`. |

### 4.1 VÖK (özet formül)

```
VÖK = Σ deger (GT ∧ bransAp=HAYATDISI ∧ hesapKodu ∈ {60,61,62,63,64,65})
    + Σ deger (GT ∧ bransAp=MALI     ∧ hesapKodu ∈ {66,67,68})
```

### 4.2 SAFİ TEKNİK KAR/ZARAR

**Amaç:** Teknik kar/zarar ile benzer görünse de, **SEDDK** gereği mali gelirin bir kısmının teknik gelire aktarımı ve teknik hesaba giren genel gider bileşenlerinin **gider toplamından çıkarılması** ile tanımlanır.

- **MALI `673`** — “Hayat Dışı Teknik Bölümüne Aktarılan Yatırım Gelirleri (-);” (mali → teknik köprüsü; kontrol / mutabakat için).
- **`603`** — “Teknik Olmayan Bölümden Aktarılan Yatırım Gelirleri” (aktarılan tutarın teknik taraftaki karşılığı). **KPI formülünde doğrudan `603` kullanılır.**

**Hesaplama** (`deger` olduğu gibi; satır yoksa **0**):

```
SAFİ_TEKNİK = ( deger(60) − deger(603) ) + ( deger(61) − deger(61402) − deger(61403) − deger(61404) − deger(61405) − deger(61406) )
```

**`bransAp`:** Bu KPI için **`60`, `61`, `603`, `61402`…`61406`** satırları **`HAYATDISI`** özet sayfasından alınır (her kod **en fazla bir satır**; branş sayfaları eklenmez).  
`603` bazen branş sayfalarında da görünebilir; **özet KPI’da yalnızca `HAYATDISI` satırı** kullanılır.

**Örnek (Bereket 1025, 2025-3, `gelir-tidy`):** **−389.933.894,40** TL (verdiğiniz **−389.933.894** ile aynı; kuruş farkı yuvarlama).

### 4.3 Yatırım geliri (segment KPI — MALI)

**Amaç:** `66` (Yatırım gelirleri) tek başına, **`673`** vb. ile büyük tutarların **hayat dışı teknik bölüme aktarımı** nedeniyle şirketler arası “saf” yatırım geliri büyüklüğünü yansıtmayabilir. **Segmentasyon skoru** ve şirket karşılaştırmalarında yatırım tarafının ölçeği için bu KPI kullanılır.

**Filtre:** `tabloTip === "GT"` ve **`bransAp === "MALI"`**. Her `hesapKodu` için eşleşen satırların `deger` toplamı alınır (çoğu kodda tek satır); **satır yoksa 0**.

**Formül** (`deger` tidy’deki işaretiyle; ek işaret çevirme yok):

```
YATIRIM_GELIRI_SEGMENT = ( deger(66) − deger(664) − deger(665) − deger(666) )
                       + ( deger(671) + deger(672) + deger(674) + deger(675) + deger(677) )
```

**Notlar:**

- **`673`** bu formülde **yok**; teknik aktarımın etkisi, **`66` içinden çıkarılan** `664`–`666` ile ve gerekirse **`671`–`677`** tarafındaki gider/zarar kalemleriyle dengelenmiş bir “segment yatırım geliri” üretmek içindir (SEDDK / tablo hiyerarşisi ile uyumlu kullanım için bu dosya tek iş kuralı olarak formülü sabitler).
- **`675`**, **`677`** vb. tidy’de genelde **negatif** gelir; toplama dahil oldukları için KPI otomatik olarak düşer.

**Örnek (2025-3, `gelir-tidy`):** Allianz 1004 ≈ **19.119.717.594,73** TL; Aksigorta 1003 ≈ **3.959.665.606,67** TL; Bereket 1025 ≈ **1.499.939.740,24** TL (`yatirimGeliriSegmentKpiFromRows` ile aynı).

---

## 5. Excel `Gelir Tablosu` rasyo satırları (B175–B195)

KPI listesi ve **C sütunu formülleri** (satır referansları) için kaynak: TSB **4 Şirketler Gelir Tablosu Özet** Excel, sayfa **Gelir Tablosu**. Uygulamada aynı mantık **`gelir-tidy` + hesap kodu toplamları** ile yeniden kurulacak.

---

## 6. Segmentasyon skoru (çoklu KPI, iki peer havuzu)

### 6.0 Güncelleme takvimi (hatırlatma)

- **Segment resmi güncellemesi yılda birdir:** TSB **`gelir-tidy.json`** içinde **4. çeyrek (yıl sonu)** verisi yayımlandıktan sonra çalıştırılır; **her çeyrek segment üretmek zorunlu değildir** (anlamlı olmayabilir).
- **Şu anki referans dönemi:** **`2025-4`** (Excel ve raporlar buna göre).
- **Sonraki planlı güncelleme:** **`2026-4`** tidy geldikten sonra aynı yöntemle yeniden hesaplanır.
- **Excel çıktısı:** `npm run tsb:segment-xlsx` → varsayılan `data/tsb/out/segment-skor-2025-4.xlsx` (isteğe bağlı: `npx tsx scripts/tsb-segment-export-xlsx.ts <donem> <cikti.xlsx>`). Çıktıda **Özet** sayfalarında ana TL kalemleri; **`HamMetrik_HD`** ve **`HamMetrik_HayatEmeklilik`** sayfalarında VÖK, SAFİ TKZ, brüt prim, bilanço ve tüm oranlar; **`KPI_HD`** / **`KPI_HayatEmeklilik`** sayfalarında her KPI için **minMaxHamGirdi** (normalize edilen girdi) ve **puan0_100** bulunur.

### 6.1 İki ayrı peer havuzu

| `pool` | Kimler | Peer listesi fonksiyonu |
|--------|--------|-------------------------|
| **`HD`** | Hayat dışı: `sirketTipi === "HD"` ve şirket kodu **3… değil** (`isHayatdisiSirket` ile uyumlu) | `segmentPeerSirketKodlari(rows, donem, "HD")` |
| **`HAYAT_EMEKLILIK`** | Hayat / emeklilik: kod **3…** veya tip **H** / **E** (`isHayatEmeklilikSirket` ile uyumlu) | `segmentPeerSirketKodlari(rows, donem, "HAYAT_EMEKLILIK")` |

TSB toplam satırları (`9000`, `9001`, `9003`) her iki havuzda da **hariç** (`isTsbToplamSirketKodu`).

### 6.2 Skor mantığı (0–100)

Aynı `donem` ve **aynı `pool`** içindeki tüm şirketler **peer kümesi**dir. Her KPI’da ham değer, peer’lar arasında **doğrusal min–max → 0–100**; “düşük iyi” KPI’da puan **100 − puan**. Ağırlıklı ortalama → **segment skoru (0–100)**. Oran tanımsızsa ilgili KPI atlanır, **kalan ağırlıklar yeniden normalize** edilir.

**Uygulama:** `lib/tsbSirketSegmentSkor.ts` — `sirketSegmentSkoruFromRows(rows, donem, sirketKodu, { pool: "HD" | "HAYAT_EMEKLILIK", kpiler?: ... })`. Varsayılan KPI seti: `SEGMENT_SKOR_KPI_VARSAYILAN`.

**Skorlar çoğu şirkette neden 60’ı geçmiyor?** Bu genelde **hata değildir**: Her boyutta aynı anda en iyi (100) olmak zordur; skorlar **göreli sıralama** ürettiği için tipik olarak **yaklaşık 35–65** bandında toplanır. Mutlak performans için **ham oranlara** (ör. SAFİ/prim) bakın; “60+ = iyi” gibi sabit eşik bu metodolojinin parçası değildir.

### 6.3 Segment adı (A / B / C)

Aynı havuz içinde skora göre sıralama: **üst üçte birlik → A**, **orta → B**, **alt → C**. Uygulama: `tertileSegmentEtiketleri(...)`. Excel özet sayfalarında **segmentHarf** ve **segmentAdi** sütunları buna göre doldurulur.

### 6.4 KPI listesi ve varsayılan ağırlıklar (toplam **%100**, **7 KPI**)

| Sıra | KPI adı | Ham metrik (kaynak) | Ağırlık | İyi yön |
|------|---------|---------------------|---------|---------|
| 1 | **Brüt prim ölçeği** | `log₁₀(max(brüt prim, ε))`; brüt prim = `GT` + `HAYATDISI` + `60001` | **%35** | Yüksek |
| 2 | **SAFİ teknik K/Z ÷ brüt prim** | **§4.2** ÷ aynı brüt prim | **%5** | Yüksek |
| 3 | **VÖK ÷ özsermaye** | **§4.1** ÷ `BL` + `Pasif` + `5` | **%20** | Yüksek |
| 4 | **Yatırım geliri (segment) ÷ özsermaye** | **§4.3** ÷ `BL` + `Pasif` + `5` | **%10** | Yüksek |
| 5 | **Özsermaye ÷ toplam aktif** | `Pasif` + `5` ÷ (`Aktif` + `1` + `2`) | **%5** | Yüksek |
| 6 | **Yükümlülük ÷ toplam aktif** | (`Pasif` + `3` + `4`) ÷ (`Aktif` + `1` + `2`) | **%10** | **Düşük** (kaldıraç riski) |
| 7 | **Nakit + finansal varlık ÷ toplam aktif** | `BL` **Aktif** satırları **`10` + `11`** ÷ (**`1` + `2`**); `10` ve `11` ayrı alt gruplar (çift sayım yok) | **%15** | Yüksek |

**Notlar:**

- **Prim ölçeği** log ile alınır; güncel ağırlık setinde **ölçek** (brüt prim) segment skoruna **en yüksek payı** verir.
- **SAFİ** ve **yatırım geliri (segment)** kalemleri düşük ağırlıkta da olsa SEDDK / `673` bağlamında karşılaştırmayı tamamlar.
- Ağırlıklar **varsayılan**dır; ürün veya regülasyon görüşüne göre `SEGMENT_SKOR_KPI_VARSAYILAN` kopyalanıp özelleştirilebilir (toplamlarının **1** olması gerekir).

---

## 7. Finansal karşılaştırma tablosu (görünen etiketler)

Sayfa: `/sigorta/finansal-karsilastirma` — satır tanımları `lib/tsbFinansalKarsilastirmaData.ts` → `FINANSAL_KIYASLAMA_SATIRLARI`.

**Gelir tablosu (GT, MALI):** BRÜT PRİM · TRAFİK HARİÇ BRÜT PRİM · SAFÎ TEKNİK KAR / ZARAR · FAALİYET GİDERLERİ · GENEL GİDERLER · PERSONEL GİDERLERİ · YATIRIM GELİRİ · MALÎ KAR · TEKNİK KAR / ZARAR · VERGİ ÖNCESİ KAR (`690`) · **NET KAR** (`692`).

*(ayırıcı satır)*

**Bilanço ve oranlar:** ÖZSERMAYE · TEKNİK KARŞILIKLAR · SAFİ TEKNİK / PRİM · VÖK / ÖZSERMAYE · YATIRIM GELİRİ / ÖZSERMAYE · ÖZSERMAYE / TOPLAM AKTİF · YÜKÜMLÜLÜK (3+4) / TOPLAM AKTİF · NAKİT + FİNANSAL VARLIK / TOPLAM AKTİF · CARİ ORAN · NAKİT ORAN · VÖK / YATIRIM GELİRİ · BRÜT H/P · NET H/P.

**Not:** Sağ blok (kıyas) varsayılan modda **sektör toplamı**dır: TL satırlarında havuzdaki tüm şirketlerin Σ'si; oran satırlarında Σ pay / Σ payda. Ayrı **VÖK** (TL) satırı yoktur. Oran satırlarındaki VÖK paydası `lib/tsbSirketSegmentSkor.ts` → `vokFromRows` ile uyumludur.

---

*Son güncelleme: Finansal karşılaştırma §7; segment §6 — `lib/tsbSirketSegmentSkor.ts`.*
