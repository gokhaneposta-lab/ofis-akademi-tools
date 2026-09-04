# Bütçe V3 — Yeni Motor Tasarımı (Sıfırdan)

Tarih: 2026-09-03
Yazar: Ajan (Cursor)
Durum: Tasarım — kod öncesi

## 1. Motivasyon

Mevcut V3 (`buildV3GelirTablosu.ts`), V2 motorunun ince bir sarmalayıcısı: `buildV2GelirTablosu()` çağrılır, üzerine yalnızca 3 yaprak GT satırı (F11, F96, F105) için YTD overlay eklenir. Sonuç:

- **Ocak–Temmuz 2026 mizanı gerçek olsa bile**, gelir tablosundaki Safi TKZ (498 mio) muhasebe gerçeğinden (208 mio) sapıyor. Sebep: F19, F22, F31, F86, F114, F116, F157 gibi tüm ara kalemler hâlâ V2 tarihsel oranıyla üretiliyor.
- Kullanıcı yalnızca **(1) tarife hedef prim, (2) genel gider tutarları, (3) aylık mali getiri oranı** girmek istiyor; V2'nin `oran-ayarlar.json` üzerinden 27 teknik oran ayarlaması istemedi.
- Teknik oran motoru V2'nin `MizanOranServisi` sınıfına bağımlı; V3 kendi mantığını kurmuyor.

Kullanıcı isteği: V3'ün altını **sıfırdan** yaz. V2 motoru silinmeyecek (referans olarak kalır), fakat V3 dashboard/API'si tamamen yeni motora bağlanacak.

## 2. Kabul kriterleri

1. **YTD full lock**: Ocak–Anchor (Temmuz 2026) arası tüm yaprak GT satırları `mizan-aylik-full.json`'dan birebir alınır. Motor bu aylara dokunmaz. Safi TKZ Ocak–Temmuz için mizanla birebir tutar.
2. **Ağu–Ara projeksiyon**: Model kendi öğrendiği teknik oranları + aylık mevsimselliği + kullanıcı girdisi primini kullanır. V2 formüllerine dokunma; ama teknik oran tablosu yeni motordan gelir.
3. **Kullanıcı girdisi 3 kalem**: tarife hedef prim (yıllık), 61402–06 genel gider (yıllık), aylık mali gelir oranı (12 sayı). Diğer hiçbir manuel ayar yok.
4. **Öneri rozetleri**: UI'da her kullanıcı girdisinin yanında `model önerisi + Δ%` rozeti; kullanıcı sapmayı görerek bilinçli override eder.
5. **Aynı çıktı formatı**: `GelirTablosuSonuc` şeması korunur; UI ve Excel indirme değişmez.

## 3. Mimari (yeni)

```
lib/butce/v3/motor/
├── kalemHaritasi.ts        Sabit: F satırı → mizan hesap kodu köprüsü
├── oranOgrenici.ts          Yaprak F satırları için pay/baz oranı öğrenir (branş × yıl)
├── mevsimOgrenici.ts        Branş × F satır × 12 ay pay eğrisi
├── ytdFullOverlay.ts        Anchor'a kadar TÜM yaprak satırları mizandan yaz
├── projeksiyon.ts           H2 aylar için: yaprak = (baz aylık) × (öğrenilen oran) × mevsim payı
├── oneriMotoru.ts           Kullanıcı girdileri için "model önerisi" hesapla
├── buildV3Motor.ts          Ana kompozisyon → GelirTablosuSonuc
└── types.ts                 Yeni motor tipleri (V3MotorSonuc, V3Oran, V3Mevsim, V3Oneri)
```

`buildV3GelirTablosu` (mevcut sarmalayıcı) siliniyor, yerine `buildV3Motor` doğrudan API rotasından çağrılır. `lib/butce/oran/mizanOranlar.ts` V2'de kalır, V3 tarafından import edilmez.

## 4. Kalem envanteri (motorun üreteceği yapraklar)

`gt_excel_harita.json`'daki `tahmin_carpim_satirlari` = 27 çarpım kalemi + toplam formülleri. Yaprak = mizandan geldi/oran ile üretildi:

| F satır | GT kod | Ad | Kaynak (öğrenici) |
|---|---|---|---|
| 11 | 0111 | Brüt yazılan prim | **Kullanıcı prim** (yıllık) × mevsim |
| 15 | 011 | Endirekt prim | Tarihsel endirekt/brüt oranı × F11 |
| 19 | 0112 | Reasüransa devredilen | Oran F295 × F11 |
| 20 | 0113 | SGK'ya aktarılan | Oran F290 × F11 |
| 31 | 013 | DERK | Oran F349 × F11 (YE kural) |
| 32 | 0141 | Brüt DERK | Yaprak — mizan 0141 |
| 33–37 | 0142* | DERK cari/devreden/re | Yapraklar — mizan |
| 86 | 016 | Rücu ve sovtaj | Oran F315 × (F96+F116) |
| 96 | 0211 | Brüt ödenen hasar | Oran F320 × (F11+F22+F32) |
| 105 | 0212 | Reasürör hasar payı | F96 × F436 |
| 116 | 02211 | Brüt muallak (cari) | Oran F451 × F11 |
| 117 | 02212 | Brüt muallak (devreden) | Oran F456 × F11 |
| 127, 137, 147 | 022x | Muallak reasürör payı | Oran × F11 |
| 166 | F348 | Dengeleme | Kural: 613 gideri varsa −%12 × net kazanılmış |
| 167 | Dengeleme brüt | | Türev |
| 177 | 0251 | Üretim komisyonu | Oran F275 × F11 (F12 direkt) |
| 180 | Üretim komisyon alt | Türev | |
| 190–194 | 61402–06 | Genel giderler | **Kullanıcı gider** (yıllık) / 12 |
| 196 | 0258 | Alınan re komisyonu | Oran F300 × F11 |
| 197 | 614071 | Alınan re komisyon alt | Türev |
| 200, 201 | 0259, 02592 | Diğer faaliyet | Oran × baz |
| 202 | 60301 | Matematik karş. | Dış girdi (0) |
| 38 | 603 | Mali gelir | **Kullanıcı getiri** × banka × net nakit payı |

Toplam ~25 yaprak, geri kalan ~15 toplam satırı formülle türetilir (`gtMotoru` `evalExpr` çalıştırır).

## 5. Oran öğrenici (yeni)

### 5.1 Algoritma
Her `(kalem_kodu, branş)` için:

1. **Yıllık örneklem**: `mizan-tidy.json`'dan 4 yıl × (pay/baz) → 4 oran örneği.
2. **Aylık örneklem (opsiyonel)**: `mizan-aylik-full.json`'dan aynı ay kümülatiften 12 örnek (mevsim uyumu için).
3. **Torpu (yeni kural)**: her kalem için:
   - `|z-score| > 2` olan yıl at (mean & std dev üzerinden)
   - Kalem-özel `oran_min`/`oran_max` bandına sıkıştır (hasar için −1 ≤ x ≤ 0.5)
4. **Ağırlıklama (veri kalitesi)**: kalan yıllar için `w_yıl = baz_yıl / Σ baz_kalan_yıllar`. Yani büyük hacimli yıl daha çok ağırlık taşır — küçük bazlı gürültü boğulur. Klasik `[0.5, 0.25, 0.15, 0.1]` yerine.
5. **Küçük baz fallback**: branşın son yıl bazı `MIN_BAZ_TL = 500K` altındaysa → aynı tarife grubu (ör. TARSİM 776-786 tümü) için toplam pay / toplam baz oranı.
6. **Hasar bloğu tutarlılığı**: F320, F436, F451, F456 kalemleri korele — biri gruba kayınca hepsi grup oranına düşer.
7. **Kural kalemleri (sabit, öğrenilmez)**:
   - **F348 dengeleme**: mizanda 61301101 gideri olan branşa −%12 × net kazanılmış prim, diğerlerine 0.
   - **F349 DERK**: yıl sonu kümül (013/0111) oranı — YE bazlı, aylara mevsim ile yayılır.
   - **F398 mali gelir payı**: `max(0, F10 − F95) / Σ pozitif net nakit`.

### 5.2 Branşlar arası ilişki (yeni)
V2'de yok — V3'ün "sıfırdan bakış açısı":

- **Reasürans devri ↔ hasar reasürör payı**: yüksek devir → yüksek F436 (hasarın reasürör tarafı). Torpu sonrası kalan yıllarda korelasyon ≥ 0.7 ise F436 = F295 × korelasyon katsayısı bandına sıkıştır.
- **KPK stok ↔ Brüt muallak stok**: her ikisi de F11 ile korele; birlikte hareket. Aynı grup fallback uygulanır.
- **DERK ↔ hasar oranı**: F320 > 0.6 olan branşta F349 sıfır olamaz (paradoks); minimum %0.5 zorla.

Bu 3 kural, `oranOgrenici`'de son adım olarak devreye girer.

## 6. Mevsim öğrenici (yeni)

Her `(branş, F yaprak)` için:

1. Geçmiş 3 tam yılın aylık kümülatif farklarından 12 sayı çıkar (branş × ay artışı).
2. Toplama böl → 12 elemanlı pay eğrisi (normalize, toplamı 1).
3. **2026 YTD blend**: anchor ayına kadar 2026 gerçek payları kullan; kalan H2 için geçmiş ortalamanın H2 payını `1 − ytdPay` ile ölçekle.
4. Fallback: veri yoksa eşit dağıtım (1/12).

## 7. YTD full overlay (yeni)

`ytdFullOverlay.ts`:

1. `mizan-aylik-full.json` içindeki her `hesap` GT koduna çevrilir (`kalemHaritasi.ts`).
2. Branş × F satır × ay kümülatif → aylık artış (`incrementalFromCumul`).
3. Anchor ayına kadar (1..7): motor ne demişse **üzerine yaz** (o hücreleri gerçek yap).
4. Anchor sonrası: motor projeksiyonu bırak.
5. Türev satırlar (F9, F10, F94, F95, ...) — Ocak–Temmuz için yaprakların toplamı olduğundan gerçek olur; H2 için formül motoru zaten hesaplar. Otomatik tutarlı.

**YTD prim ile yıllık hedef arasında uyumsuzluk** (H2 = yıllık − YTD gerçek) — F11 için:
- Yıllık hedef sabit (kullanıcı girdisi).
- YTD 7 ay gerçekleşme çıkarılır.
- H2 5 ay için kalan tutar mevsim payı ile dağıtılır.
- Eğer kalan negatifse (kullanıcı hedefi düşük): H2 = 0, ekranda "hedef Temmuz'da aşıldı" uyarısı.

## 8. Öneri motoru

`oneriMotoru.ts` — her kullanıcı girdisi için "model önerisi" hesaplar:

### 8.1 Tarife hedef prim
```
öneri = (2 yıl CAGR × 2025 tarife hedefi) blend (YTD 2026 × 12/anchor)
```
Yani hem tarihsel büyüme hem güncel gerçekleşme. `Δ% = (kullanıcı − öneri) / öneri`.

### 8.2 Genel gider (61402–06)
```
öneri = önceki yıl kapanış × (1 + son 3 yıl CAGR)
```
Enflasyon proxy (CPI) gerekmez; motor mizan büyümesini zaten yakalar.

### 8.3 Aylık mali getiri
```
öneri[ay] = geçmiş 24 ay mevduat brüt getirisi × (0.7 + 0.3 × trend)
```
`trend` = son 6 ay eğilim (düşüş varsa < 1). Basit ama izlenebilir.

Bu öneriler `/api/butce/v3/varsayimlar` GET yanıtına eklenir; UI hücre yanında rozetle göstersin.

## 9. Kullanılacak Excel formül motoru

`gtMotoru.ts`'deki `evalExpr` + `GelirTablosuMotoru` **kullanılır**. Sadece `MizanOranServisi` constructor'ı yerine yeni `V3OranMotoru` verilecek. Excel'in kendi F19=F11*F295 formülleri değişmez; sadece F295'in **değeri** yeni motordan gelir.

Bu, "sıfırdan" prensibini bozmaz çünkü:
- Excel formülleri = şirket muhasebe tanımı, tartışılmaz.
- Öğrenilen kısım = **oran değeri** (F295, F320, F451 vs.) — bu tamamen yeni.

Alternatif (tüm GT ağacını sıfırdan): 250+ satırlık Excel formülünü elle yeniden yazmak = ay sürer, hata riski yüksek, ekstra değer sıfır. Prensibe uyup pratik olmak: Excel formül motoru kalır, oran motoru yeniden yazılır.

## 10. Yol haritası (uygulama sırası)

1. `motor/kalemHaritasi.ts` — F satır ↔ mizan hesap köprüsü sabit.
2. `motor/types.ts` — V3OranSonuc, V3Mevsim, V3Oneri, V3MotorSonuc.
3. `motor/oranOgrenici.ts` — yaprak F satırları için oran öğren.
4. `motor/mevsimOgrenici.ts` — 12 ay pay eğrisi.
5. `motor/ytdFullOverlay.ts` — anchor'a kadar tüm yaprakları mizandan yaz.
6. `motor/oneriMotoru.ts` — kullanıcı girdileri için öneri üret.
7. `motor/buildV3Motor.ts` — ana kompozisyon.
8. `app/api/butce/v3/hesapla/route.ts` — `buildV3Motor`'a bağla.
9. `app/api/butce/v3/varsayimlar/route.ts` — öneri alanları ekle.
10. `components/butce/V3DashboardClient.tsx` — hücre yanında rozet.
11. Doğrulama: `scripts/butce-v3-motor-dogrula.ts` — YTD Safi TKZ tutuyor mu, Ağu–Ara sapma.
12. Nihai rapor: `docs/butce/v3-yeni-motor-uygulama.md`.

## 11. Risk ve kısıtlar

- **Küçük branşlar** (778, 779, 782, 783, 786): 2-3 yıllık veri; torpu sonrası tek örneğe düşebilir. Fallback: TARSİM grup oranı.
- **Reasürör payı işaret** (F436, F441): pay/baz negatif oran üretebilir; sıkıştırma bandı önemli.
- **DERK (F349)** aylık kümülatif oranı H1'de şişer (V2'de de böyleydi); YE oranını mevsim payı ile aylara yaymaya devam ederiz.
- **Bilanço kalemleri** (KPK stok, muallak stok): şu an gelir tablosunda sadece değişim kullanılıyor. Stok bazlı yeni bir yaklaşım (Modul F.a) bu tasarımın kapsamı dışında — sonraki iterasyonda.

## 12. Tahmini iş yükü

| Modül | Satır | Test | Süre |
|---|---:|---:|---:|
| kalemHaritasi | ~100 | dosya bazlı | 30 dk |
| oranOgrenici | ~300 | node:test 5 case | 2 sa |
| mevsimOgrenici | ~150 | node:test 3 case | 1 sa |
| ytdFullOverlay | ~200 | node:test | 1.5 sa |
| oneriMotoru | ~150 | manuel doğrulama | 1 sa |
| buildV3Motor | ~250 | e2e doğrulama scripti | 2 sa |
| API + UI bağlama | ~150 | tarayıcı | 1 sa |
| Doğrulama + rapor | — | 2026 Ocak-Tem = mizan; Ağu-Ara sapma | 1.5 sa |
| **Toplam** | **~1300** | | **~10 sa** |
