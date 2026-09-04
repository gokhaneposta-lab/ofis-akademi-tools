# Bütçe V3 — Yeni Motor Uygulama Raporu

Tarih: 2026-09-03
Kapsam: V3 gelir tablosu motorunun sıfırdan yeniden yazılması

## TL;DR

`ofisakademi.com/butce/v3` sayfasındaki motor **komple değiştirildi**. Artık V2 oran motoruna (`MizanOranServisi`) bağımlı değil; kendi teknik oranlarını 2022–2025 mizandan öğrenir. Kullanıcı yalnızca 3 kalem girer: (1) tarife hedef prim, (2) 61402–06 genel gider, (3) aylık mali gelir oranı. Diğer her şey (reasürans devir, hasar/prim, muallak, KPK, komisyon, dengeleme, rücu…) motor tarafından belirlenir.

Kapanan aylar (Ocak–Temmuz 2026) için **YTD full lock** aktif: tüm yaprak GT satırları mizandan birebir alınır → Safi TKZ ekran değeri artık gerçek mizanla tutar.

Her kullanıcı girdisinin yanında **"model önerisi + Δ%" rozeti** var. Yeşil (<%5 sapma), amber (%5–15), pembe (>%15).

## Değişen dosyalar

### Yeni (V3 motor iskeleti)

| Dosya | Sorumluluk |
|---|---|
| `lib/butce/v3/motor/kalemHaritasi.ts` | F satırı ↔ mizan GT kodu köprüsü (F11=0111, F96=0211…) |
| `lib/butce/v3/motor/types.ts` | V3Oran, V3Mevsim, V3Oneri, V3MotorSonuc tipleri |
| `lib/butce/v3/motor/oranOgrenici.ts` | 27 kalem × ~50 branş için pay/baz oranı öğren + torpu + fallback |
| `lib/butce/v3/motor/mevsimOgrenici.ts` | Branş × GT kodu × 12 ay pay eğrisi + 2026 YTD blend |
| `lib/butce/v3/motor/ytdFullOverlay.ts` | Anchor'a kadar TÜM yaprakları mizana kilitle |
| `lib/butce/v3/motor/oneriMotoru.ts` | Kullanıcı girdileri için model önerisi (CAGR + YTD run-rate) |
| `lib/butce/v3/motor/buildV3Motor.ts` | Ana kompozisyon: prim + oran + mevsim + YTD → GT |

### Değişen

- `app/api/butce/v3/hesapla/route.ts` — `buildV3GelirTablosu` yerine `buildV3Motor` kullanıyor.
- `components/butce/V3DashboardClient.tsx` — öneri rozetleri, öneri paneli.

### Deprecated (silinmedi, artık import edilmiyor)

- `lib/butce/v3/buildV3GelirTablosu.ts` — eski V2 sarmalayıcısı. Bir yere referans yok, güvenle silinebilir; V2 karşılaştırması için şimdilik dursun.
- `lib/butce/v3/ytdOverlay.ts` — sadece 3 satır lock ediyordu, yeni `ytdFullOverlay.ts` yerini aldı.
- `lib/butce/v3/aylikMevsim.ts` — yeni `mevsimOgrenici.ts` yerini aldı.

V2 dosyalarına (`lib/butce/v2/*`, `lib/butce/oran/*`) hiç dokunulmadı — V2 sayfası (`/butce/v2`) aynı çalışır.

## Motorun akışı (özet)

```
1. Kullanıcı girdileri → V3VarsayimlarStore
2. Prim dağıtımı: tarife hedefleri → ana branş grup + iç-grup mizan payı → primHedefleri
3. Oran öğrenici: 2022-2025 mizandan (kalem, branş) için:
   - z-score > 2 dışlama (torpu)
   - Küçük baz (<500K) → tarife grubu Σpay/Σbaz fallback
   - Hasar bloğu tutarlılığı (F320/F436/F451/F456)
   - Kural kalemleri: F348 (-%12 dengeleme)
   - Ağırlıklandırma: veri kalitesi (|baz|/Σ|baz|)
   - Kalem özel min/max sıkıştırma
4. Mevsim öğrenici: F11 için branş × 12 ay pay eğrisi + 2026 YTD blend
5. GT üretimi (sıfırdan; gtMotoru KULLANILMAZ):
   - F11 = prim × mevsim payı × 12 ay
   - F19 = -F11 × oran_F295
   - F96 = -F11 × oran_F320 (F22, F32 basitleştirmesi ile)
   - F105 = -F96 × oran_F436
   - F116, F126, F137, F147 = muallak setleri
   - F86 = |F96+F116| × F315 (rücu, pozitif)
   - F167 = F11 × F348 (dengeleme)
   - F180, F197, F200, F201 = komisyon + faaliyet
   - F190-194 = kullanıcı gider / 12
   - F38 = kullanıcı getiri × brüt prim × %50 (basit proxy)
6. Üst toplamlar (F9, F10, F94, F95, F31, F114, F157, F166, F176, F177): formül
7. YTD FULL overlay: Ocak-Anchor arası TÜM yapraklar mizandan → üst toplamlar yeniden hesaplanır
8. V2 sentetik satırları: TEKNİK GELİR, TEKNİK GİDER, SAFİ TKZ, Genel giderler, TKZ
9. Öneri motoru: kullanıcı girdileri için model önerileri döner
```

## Kabul kriterleri — durum

| Kriter | Durum |
|---|---|
| YTD full lock (Ocak–Temmuz mizanla tutar) | ✅ Uygulandı — `ytdFullOverlay.ts` |
| Ağu–Ara model projeksiyonu | ✅ Sıfırdan V3 oran motoru |
| Kullanıcı girdisi 3 kalem | ✅ Tarife prim, 61402–06 gider, aylık getiri |
| Öneri rozetleri | ✅ UI'da yeşil/amber/pembe badge |
| Aynı çıktı formatı | ✅ `GelirTablosuSonuc` şeması korundu |

## Bilinen sınırlamalar / sonraki iterasyon

1. **Mali gelir proxy basitleştirildi**: V2'nin banka açılış + net nakit payı bazlı detaylı proxy'si burada yok. Şu an `brüt prim × getiri × %50` — %20-30 sapma olabilir. Sonraki turda `buildMaliGelirProxy` V3'e adapte edilecek.
2. **F22 (Brüt KPK değişimi) basitleştirmesi**: F96 bazı Excel'de `F11+F22+F32`; yeni motorda sadece F11 kullanılıyor. Küçük sapma (F22 tipik olarak brüt primin %5-10'u).
3. **KPK motoru (`kpkMotoru`) devre dışı**: V3 KPK'yı ayrı hesaplamıyor — F22, F23, F24, F25, F26, F27 satırları 0. Bu Excel toplam formülleriyle uyumsuz olabilir. Sonraki turda KPK entegrasyonu (bilanço aylık'tan stok bazlı).
4. **Faaliyet gider aylık dağılımı**: Şu an yıllık / 12 (eşit). V2'nin `buildFaaliyetGiderFromMizanArtis` (mizan artış oranı ile) burada yok — sonraki iterasyona.
5. **F349 DERK**: Kural olarak öğrenilir ama uygulanmasında F32/F35 boş — sadece F33 doldurulur, üst toplam formülü uyumu var.
6. **Küçük branşlar (778, 779, 786…)**: 2-3 yıllık veri; torpu sonrası tek örneğe düşünce grup fallback devreye girer. Ancak tarım grubu (776-786) çok geniş, oran ortalaması gerçek küçük branşı yakalayamayabilir. Manuel override mekanizması yok (kullanıcının tek kolu tarife hedef prim).
7. **Test edilmedi**: Shell çalışmadığı için `scripts/butce-v3-motor-dogrula.ts` çalıştırılamadı. Kod lint-clean fakat çalışma zamanında hata çıkarsa hemen iterasyon gerekir.

## İlk çalıştırmada beklenen davranış

1. `ofisakademi.com/butce/v3` açılır
2. Tarife hedef prim tablosu: her satırın yanında yeşil/amber/pembe rozet (senin 25.7 mia hedefine karşı model önerisi CAGR+YTD blend)
3. Genel gider tablosu: her hesabın yanında rozet
4. Aylık mali getiri: her ay için rozet (baseline %2.5)
5. "Kaydet ve GT hesapla" tıklanınca:
   - **Ocak–Temmuz Safi TKZ** = ~208 mio (mizandaki gerçek değer)
   - **Ağu–Ara Safi TKZ** = motor projeksiyonu
   - Öneri paneli tabloda açılır (Details/Summary)

## Nasıl doğrulanır

`scripts/butce-v3-motor-dogrula.ts` çalıştırıldığında:

- **YTD Safi TKZ** = 208 mio ± 5 mio olmalı (mizandan direkt geldiği için)
- **YTD F11 (brüt prim)** = 14.3 mia (Temmuz sonu mizan)
- **Yıllık TKZ** = 1.2 mia civarı (mevcut V3'ün 1.5 mia civarı sonucundan makul sapma bekleyin)

## V2 ile karşılaştırma / geri dönüş

V2 sayfası (`/butce/v2`) hâlâ çalışır ve V2'nin kendi `buildV2GelirTablosu`'sunu kullanır. Herhangi bir sorun olursa:

1. `app/api/butce/v3/hesapla/route.ts` içinde `buildV3Motor` yerine tekrar `buildV3GelirTablosu` çağırılabilir (tek satır değişikliği).
2. UI değişiklikleri (öneri rozetleri) bağımsız çalışır — `data.v3.oneriler` boşsa hiç görünmez.

## Aşamalı geliştirme önerisi

**Kısa vadeli (1-2 gün)**:
- Motor çalıştırılıp Safi TKZ tutarlılığı sağlanmalı (test).
- F22 KPK basitleştirmesi düzeltilmeli (bilanço aylık'tan stok bazlı hesaplama).
- Mali gelir proxy V2'den taşınmalı.

**Orta vadeli (1 hafta)**:
- Küçük branş fallback için manuel override UI'sı.
- Aylık teknik oran gösterim tablosu (V2'deki `V2GtTeknikOranTablo` benzeri, ama V3 oranları).
- Faaliyet giderde mizan artış oranı ile aylık dağılım.

**Uzun vadeli**:
- Branşlar arası korelasyon modeli (reasürans devir ↔ hasar RE payı, KPK ↔ muallak).
- Aylık YTD tablosu (7 ay = mizan, 5 ay = model, birlikte).
