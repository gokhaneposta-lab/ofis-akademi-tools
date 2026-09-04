# SYT / Gerekli özsermaye tarama (ara sonuç)

Tarih: 2026-08-03  
Kapsam: HD prim sıralamasından öncelikli şirketler  
Kaynak tipi: Bağımsız denetim / mali tablo dipnotları (“Sermaye yapısı ve yönetimi” / “Sermaye yönetimi”) + faaliyet raporu

> Rakamlar otomatik metin çıkarımıdır — gözle doğrula.

## Özet sayım (şimdilik)

| Metrik | Adet |
| --- | ---: |
| Hedef / bakılan şirket | 20 |
| PDF / metin kaynağı bulunan | 10+ |
| **Gerekli özsermaye tutarı sayısal çıkan** | **6** |
| Sadece oran / kısmi | 3 |
| Henüz bulunamadı / dipnot yok | kalan |

## Çıkarılan rakamlar

| Şirket | Dönem | Gerekli özsermaye (TL) | Mevcut / kabul edilen (TL) | Fazla/(açık) (TL) | Oran | Kaynak |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Anadolu Anonim Türk Sigorta | 31.12.2025 | 20.897.616.283 | ≈43.125.543.333 (gerekli+fazla) | +22.227.927.050 | ≈%206 | [Konsolide olmayan mali tablo](https://www.anadolusigorta.com.tr/Files/YatirimciIliskileri/FinansalBilgiler/MaliTablolar/2025/ANSGR_12_2025_Konsolide_Olmayan_Finansal_Tablo_Dipnotlar.pdf) |
| Türkiye Sigorta | 31.12.2025 | 24.244.804.630 | ≈52.196.328.614 | +27.951.523.984 | %215 (faaliyet) | Entegre faaliyet / mali dipnot |
| Aksigorta | 31.12.2025 | 4.785.461.829 | ≈7.942.740.305 | +3.157.278.476 | 2024 YE %158 (rapor) | [KAP mali tablo](https://kap.org.tr/en/api/file/download/4028328c9b82727a019c2f92ebce1531) |
| Mapfre Sigorta | 31.12.2025 | 4.960.936.643 | 7.251.122.635 | ≈+2.290.185.992 | ≈%146 | [Bağımsız denetçi raporu](https://www.mapfre.com.tr/sigorta-tr/media/Mapfre-Sigorta-A.S.-Bagimsiz-Denetci-Raporu-31-Aralik-2025.pdf) |
| Axa Sigorta | 30.09.2025 | 15.265.758.366 | ≈24.971.854.350 | +9.706.095.984 | ≈%164 | [Hazine raporu 30.09.2025](https://www.axasigorta.com.tr/media/t1/001/762/341/797/AXA%20Sigorta%20Hazine%20Raporu%2030.09.2025.pdf) |
| Axa Sigorta (önceki YE) | 31.12.2024 | 11.434.624.815 | ≈17.211.165.351 | +5.776.540.536 | — | Aynı PDF içi karşılaştırmalı |
| Magdeburger (eski örnek) | 31.12.2023 | 410.441.499 | 98.324.810 | −312.116.689 | açık | Şirket mali tablo (örnek format) |

## Oran / kısmi (gerekli tutar henüz yok veya net değil)

| Şirket | Bulunan | Not |
| --- | --- | --- |
| Allianz Sigorta | Faaliyet: SYT %194,2 (2025) | Konsolide dipnotta “hesaplama yapılmamaktadır” — **solo** mali tablo lazım |
| Ray Sigorta | 31.12.2024 SYT %122,3 | Faaliyet/YK metni; 2025 YE gerekli tutar henüz çekilmedi |
| Türkiye Sigorta | Oran serisi %165 / %181 / %215 | Tutar yukarıda YE 2025 için çıkarıldı |

## Henüz net gerekli tutar çıkmayan (devam)

Bereket, HDI, Sompo, Neova, Quick, Doğa, Eureko, Unico, Zurich, Ankara, Hepiyi, Bupa Acıbadem, Türkiye Katılım — PDF aranıyor / dipnot metni henüz yakalanmadı.

## Gözlem

- Borsa şirketlerinde (Anadolu, Aksigorta, Türkiye, Mapfre, Axa) **bağımsız denetim dipnotunda** “gerekli özsermaye tutarı” kalıbı sık ve parse edilebilir.
- Allianz gibi gruplarda **konsolide ≠ solo**; solo PDF şart.
- Bazı şirketlerde sadece **oran** (kar dağıtımı gerekçesi) var, tutar yok.
- Ara dönem (Axa 3Ç) ile YE karışmasın — dashboard’da dönem etiketi zorunlu.

## Sonraki adım

Kalan top-20 için solo KAP / şirket sitesi mali tablo PDF’lerini tamamla; bu dosyayı güncelle.
