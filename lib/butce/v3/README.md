# Bütçe V3

2026 mizan/GT projeksiyonu. Kullanıcı yalnızca üç girdi verir:

1. Tarife grubu prim hedefleri
2. Aylık mali getiri oranları
3. Genel gider (61402–06)

Teknik oranlar, KPK, branş dağıtımı ve aylık GT, tarihsel mizandan otomatik.

Açılış: `/butce/v3` — API: `POST /api/butce/v3/hesapla`, `GET|POST /api/butce/v3/varsayimlar`.

## V2 ağrı noktaları (neden V3)

- V2 çok adımlı: tarife hedefi, ayrı prim dağıtım, KPK, oranlar — tek ekranda bütçe yok.
- Tam yıl teknik oranları YTD gerçekleşmeyi kilitlemiyor; Temmuz mizanı ile yıllık tahmin sapıyor.
- 614 giderlerinde artış oranı + manuel tutar çift kontrolü karışıklık yaratıyor.
- Aylık mevsimsellik yalnızca geçmiş tam yıllardan; bütçe yılı YTD kullanılmıyordu.

## V3 yöntem (V2 motorunun üstünde)

- Tarife hedefleri → V2 `DagitimMotoru` (tarife-branş pay / üretim / mizan yedek). Pay tablosu yoksa ana branş grupları + geçmiş yıl iç-grup mizan payı (TARSİM/TRAFİK mix korunur).
- YTD kilit: bütçe yılı aylık mizan varsa 1–anchor ay gerçekleşme yazılır; primde H2, yıllık hedefe tamamlanır; hasarda H2 V2 projeksiyonu kalır.
- Üst toplamlar (F10, F95, F9, F94) overlay sonrası yeniden hesaplanır; sentetik TKZ V2 formülleriyle güncellenir.
- Mali gelir (F38) ve 61402–06 kullanıcı girdileriyle V2 proxy / faaliyet gider katmanından gelir.

Doğrulama: `npm run butce:v3-validate` (private mizan gerekir).
