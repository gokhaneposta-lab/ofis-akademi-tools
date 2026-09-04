# V2 vs Gerçekleşen (Haziran sonu YTD 2026)

Kaynaklar:
- V2: Downloads/Butce_V2_GT_2026_Aylik_Brans.xlsx (Oca–Haz aylık akış toplamı)
- Gerçek: data/butce/private/mizan-aylik-full.json (2026 ay=6 kümülatif)

| Kalem | V2 YTD | Gerçek YTD | Fark | Sapma | Ayar kolu |
| --- | ---: | ---: | ---: | ---: | --- |
| Brüt yazılan prim | 12.893.903.187 | 12.980.757.772 | -86.854.585 | -0.7% | Prim hedefi / dağıtım + mevsimsellik |
| Reasüransa devredilen prim | 8.047.274.472 | 7.833.066.242 | 214.208.230 | 2.7% | Teknik oran (reas prim) |
| Brüt ödenen hasar | 4.636.570.861 | 3.650.277.951 | 986.292.910 | 27.0% | Teknik oran (hasar) / 0211 |
| Ödenen hasarda reasürör payı | 1.661.248.009 | 1.557.517.328 | 103.730.681 | 6.7% | Teknik oran (reas hasar) |
| Üretim komisyon gideri | 1.712.341.749 | 1.777.766.603 | -65.424.854 | -3.7% | Teknik oran (komisyon) |

## Brüt prim (F11/0111) — en büyük branş sapmaları

| Branş | V2 | Gerçek | Fark | Sapma |
| --- | ---: | ---: | ---: | ---: |
| 777 | 4.201.403.774 | 5.580.498.894 | -1.379.095.121 | -24.7% |
| 716 | 907.697.817 | 187.704.612 | 719.993.205 | 383.6% |
| 715 | 3.220.454.217 | 2.591.745.584 | 628.708.632 | 24.3% |
| 717 | 728.114.684 | 1.216.481.807 | -488.367.123 | -40.1% |
| 701 | 680.481.238 | 381.164.746 | 299.316.492 | 78.5% |
| 760 | 190.835.248 | 23.048.567 | 167.786.681 | 728.0% |
| 740 | 686.506.421 | 740.119.196 | -53.612.775 | -7.2% |
| 765 | 198.896.763 | 250.169.539 | -51.272.776 | -20.5% |
| 783 | 118.672.146 | 160.728.920 | -42.056.774 | -26.2% |
| 779 | 842.749.034 | 800.811.223 | 41.937.811 | 5.2% |

## Ne ayarlanır?

1. Önce F11/0111 sapmasına bak — büyükse tarife hedefi ve branş dağılımı.
2. Prim yakın, hasar/komisyon/reas uzaksa → /butce/oranlar (özellikle 0211).
3. Yıllık mantıklı H1 bozuksa → mevsimsellik (önceki yıl ay payları).
4. F38 mali gelir bu kıyasa dahil değil (proxy).

Not: Canlı Blob güncellenmedi (token yok). Yerel private Haziran mizanı ile kıyas yapıldı.