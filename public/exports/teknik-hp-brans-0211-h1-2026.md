# 0211 H/P branş kırılımı — Model vs H1 2026

Model: YE ağırlıklı (2025 %80 + 2023 %15 + 2024 ~0). Gerçek: 2026 ay-6 kümülatif.
Baz < 5 Mn branşlar gürültü sayılıp etkiden çıkarıldı.

## Şirket toplamı
- Model: 32.6%
- Gerçek H1: 24.4%
- Fark: +8.3 pp

## Hasar tutarına en çok etki eden branşlar (model−gerçek hasar)

| Branş | Ad | Model H/P | Gerçek H/P | Fark | H1 baz | Model−Gerçek hasar |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| 777 | TARSİM bitkisel | 11.1% | 2.0% | +9.1 pp | 5.874 Mn | **534 Mn** |
| 717 | Kasko | 59.8% | 41.8% | +18.0 pp | 1.580 Mn | 284 Mn |
| 740 | İhtiyari deprem | 30.5% | 0.2% | +30.3 pp | 862 Mn | 261 Mn |
| 715 | Zorunlu trafik | 74.4% | 65.3% | +9.1 pp | 2.813 Mn | 256 Mn |
| 701 | Yangın | 30.6% | 88.2% | −57.6 pp | 404 Mn | **−233 Mn** |
| 785 | Sağlık | 61.3% | 27.2% | +34.2 pp | 424 Mn | 145 Mn |
| 741 | Sel | 21.2% | 681.5% | −660 pp | 21 Mn | −140 Mn |

## Yorum özeti

### Motorun şişirdiği (büyük pay — “mix + mevsim + YE oranı”)
- **777 TARSİM**: tek başına ~534 Mn fazla hasar varsayımı. H1’de hasar henüz gelmemiş / sezonluk olabilir; YE oranı H1’e taşımak abartır.
- **740 ihtiyari deprem**: YE %30 vs H1 %0.2 → katastrof branşında H1 neredeyse sıfır; YE bazlı oran H1’de “hayalet hasar” üretir.
- **717 / 715 / 785**: gerçek oran modelin altında (iyi yıl veya H1 timing); motor muhafazakâr kalmış.

### Gerçeğin modelden kötü olduğu (anomali / gözden kaçan adayı)
- **701 yangın**: model %31 vs H1 %88 → ~233 Mn beklenenden fazla hasar. Büyük hacim + büyük pp → **ciddi inceleme**.
- **741 sel**: %681 H1, küçük baz (21 Mn) → tek/olay şoku; oran olarak anomali, tutar etkisi sınırlı ama **torpu/uyarı** için klasik örnek.
- **765 / 776**: orta etki; kontrol listesine alınabilir.

## Threshold önerisi

Mevcut 0211 torpu: `oran_min -1`, `oran_max 0.5`, `yil_disi_max 1.2` — şirket/branş ham oranını 0–50% bandına sıkıştırır; **741 gibi uçları keser ama 701 (%88) kesmez** (max 50%’e çeker yalnızca model tarafında).

Öneri:
1. **Otomatik clamp’i agresifleştirme** — bütçe muhafazakârlığını bozar; 740/777 gibi katastrof/sezon branşlarında yanlış “iyileştirme” yapar.
2. **Uyarı eşiği (threshold) koy**: branş bazında `|YE_oran − H1_oran| > 15 pp` **ve** `|hasar farkı| > 50 Mn` → review listesi.
3. **Branş sınıfı**: katastrof/TARSİM için YE→H1 karşılaştırmasında mevsim flag’i; anomaly sayma.
4. **701** gibi hem pp hem tutar büyük sapmaları “hayatın gerçeği mi?” diye ayrı kapat (büyük hasar dosyası / fiyat / mix).
