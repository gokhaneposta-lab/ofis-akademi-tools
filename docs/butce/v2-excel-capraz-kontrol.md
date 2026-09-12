# Bütçe V2 — Excel Çapraz Kontrol Raporu

> **Kaynak:** `Bütçe GT Çalışma_v8.xlsx` — branş **701**, GT sütun **F**  
> **Durum:** Kod değişikliği yapılmadı. Bağımsız Excel incelemesi ile karşılaştırma.  
> **İlgili:** [`v2-excel-dogrulama-s1-s6.md`](v2-excel-dogrulama-s1-s6.md)

---

## GT!C1 — Parametrik dönem filtresi (ek bilgi)

### Ne değildir

`GT!C1` **sabit bir muhasebe kuralı değildir.**  
Önceki raporlardaki `"D=701, B<13"` özeti — v8 dosyasında `C1 = "<13"` olduğu için **o anki örnek çalışmada işlevsel olarak doğru** — ancak kalıcı Excel iş kuralı veya sabit muhasebe filtresi olarak yorumlanmamalı.

### Ne dir

`GT!C1`, Dashboard'daki **dönem seçici (ComboBox)** ile değiştirilen **parametrik alan**dır.

| C1 değeri | Anlam (kullanıcı tanımı) |
|-----------|--------------------------|
| `"<4"` | İlk 3 ay / Q1 |
| `"<7"` | İlk 6 ay |
| `"<13"` | İlk 12 ay (tam yıl) |

### Formüllerde kullanım

F23, F24, F11 ve diğer SUMIFS formüllerinde B kriteri:

```
'…'!$B:$B, GT!$C$1
```

şeklinde **doğrudan C1 hücresine referans verir.** Excel, `"<4"` / `"<7"` / `"<13"` gibi değerleri SUMIFS kriteri olarak yorumlar (B sütununda eşleşen satırlar).

**v8 örneği:** `C1 = "<13"` → B = 1…12 (701 için 24 satır). Bu, tam yıl seçiminin sonucudur; her zaman 12 ay anlamına gelmez.

### F24 için çıkarım

| Konu | Açıklama |
|------|----------|
| Filtre tipi | **Dönem seçimine bağlı parametrik filtre** |
| Sabit `"<13"` | Kod veya dokümantasyonda **sabitlenmemeli** |
| Dashboard | Kullanıcının seçtiği döneme göre F24 (ve F23, F11 vb.) **değişir** |
| Faz 1 etkisi | Motor, Dashboard anchor ayına karşılık gelen C1 mantığını yansıtmalı; `"<13"` varsayımı yapılmamalı |

### Gerçek F24 formülü (birebir)

```
=SUMIFS('MEVCUT YIL DEVREDEN KPK'!$V:$V,
        'MEVCUT YIL DEVREDEN KPK'!$D:$D, GT!F$5,
        'MEVCUT YIL DEVREDEN KPK'!$B:$B, GT!$C$1) * -1
```

- Branş: `GT!F$5` (= 701)
- Dönem: `GT!$C$1` (parametrik — örnekte `"<13"`)
- Stok sütunu: `$V:$V` (DEVREDEN sayfasında **31.12.2025** — bkz. aşağı)

---

## V sütunu tarihi — sayfa bazında farklı

| Sayfa | V5 başlık (Excel görünen) | F23/F24 rolü |
|-------|---------------------------|--------------|
| `YK KPK` | **12/31/26** | F23 kaynağı — 2026 yılsonu **cari** KPK stok |
| `MEVCUT YIL DEVREDEN KPK` | **12/31/25** | F24 kaynağı — 2025 yılsonu **devreden** KPK stok |

Aynı sütun harfi **V**, farklı sayfalarda **farklı tarih**. Önceki “V = 2026-12-31” genellemesi **DEVREDEN için hatalıydı**; bağımsız incelemeniz (**31.12.2025**) DEVREDEN sayfası için **doğrulandı**.

---

## Karşılaştırma tablosu (bağımsız inceleme vs çapraz kontrol)

| Konu | Bağımsız bulgu | Çapraz kontrol | Aynı? | Excel'den kesin sonuç |
|------|----------------|----------------|-------|----------------------|
| GT!F sayıları (F11…F86) | Tablo değerleri | Birebir eşleşti | **Evet** | F96 iç tutarlılık diff = 0 |
| F24 formül | `$B:$B, GT!$C$1` | Aynı | **Evet** | Literal `B<13` formülde yok; C1 referansı var |
| **C1 anlamı** | *(önceki raporda kanal filtresi sanılmıştı)* | **Parametrik dönem seçici** | **Düzeltildi** | Kullanıcı: ComboBox ile `<4` / `<7` / `<13` |
| DEVREDEN V tarihi | 31.12.2025 | 31.12.2025 (DEV V5) | **Evet** | YK V5 = 31.12.2026 (farklı) |
| F24 işareti | ×(−1) | ×(−1) | **Evet** | Ham −450,7M → GT +450,7M |
| 43,5M fark | Excel vs mizan 01212 | Aynı | **Evet** | Farklı veri hattı + anker; eşdeğer değil |
| F11 anomali | — | Formül 124,7M; cache 1,31B | **Evet** | Görünen = YK J TUTAR toplamı |
| F22→F96 (kod) | Post-override stale | **HAYIR** (F22 ≠ ekran F22) | **Evet** | Excel'de sorun yok |
| GT!F vs Kod Ocak | Doğrudan kıyas yok | Aynı | **Evet** | Farklı anker/dönem modeli |

---

## F24 — Parametrik dönem filtresi özeti

```
Dashboard dönem seçici → GT!C1 (ör. "<7")
                              ↓
SUMIFS(DEVREDEN!V, D=branş, B=C1) × (−1)  →  GT F24
SUMIFS(YK KPK!V,   D=branş, B=C1)         →  GT F23
                              ↓
                    F22 = F23 + F24  →  F96 = (F11+F22+F32)×F320
```

- **C1 değişince** cohort toplamı (B filtresi) değişir → F24, F23, F22, F96 zinciri değişir.
- v8'de `C1="<13"` ile okunan 701 değerleri (**F24 = +450.668.683,38**) yalnızca **12 aylık dönem seçimi** anına aittir.
- Kod tarafında `"<13"` veya sabit 12 ay **hardcode edilmemeli**; Dashboard anchor ayı ile eşlenmeli.

---

## FAZ 1 — C1 bilgisinin etkisi

| Kesin | Açık |
|-------|------|
| F22 = F23+F24 hesap öncesi | C1/anchor eşlemesi kodda nasıl modellenecek? |
| C1 parametrik; sabit `"<13"` değil | F24 kaynağı: Excel DEVREDEN vs mizan 01212 |
| Post-override kaldırılacak | F11 cache vs formül otoritesi |

---

*Son güncelleme: GT!C1 parametrik dönem filtresi kullanıcı doğrulaması eklendi.*
