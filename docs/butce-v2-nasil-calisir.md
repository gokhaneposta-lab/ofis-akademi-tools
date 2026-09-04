# Ofis Akademi — Bütçe V2 nasıl çalışır?

Bu metin, Bütçe V2’nin **ne yaptığını** ve **neye göre hesapladığını** aşama aşama anlatır. Branş branş değil; motorun genel mantığıdır. Kaynak: `lib/butce/v2`, `lib/butce/oran`, `lib/butce/kpk`, `lib/butce/gelir`, `lib/butce/prim`.

---

## Bir cümlede

Satış bütçesindeki **tarife hedefleri** → geçmiş paylarla **7xx brüt prim**’e dağılır → geçmiş **mizan teknik oranları** (ağırlıklı yıllar) tahmini prime uygulanır → **KPK** ve **faaliyet gideri** eklenir → önce F38’siz bir gelir tablosu kurulur → şirket geneli **mali gelir proxy** hesaplanır → branşlara **net nakit payı** ile dağıtılır → en sonda **Safi TKZ** (sigortacılık) ve **TKZ** (yatırım + genel gider dahil) ayrılır.

TSB verisi bu boru hattında kullanılmaz. Oran kataloğunun kökü Excel GT çalışma dosyasıdır; V2 üstüne bilinçli kurallar ekler.

---

## V2’nin bilinçli katmanları

| Katman | Ne | Ne yok / ne ayrılır |
|--------|----|---------------------|
| **Teknik gelir** | F9 (prim, KPK, hasar/rücu vb. teknik satırlar) | **603 / F38 mali gelir yok** — F9 motoruna F38 gömülmez |
| **Teknik gider** | F94 − genel gider (61402–06) | Komisyon vb. teknik faaliyette kalır |
| **Safi TKZ** | Teknik gelir + teknik gider | Yatırım geliri ve genel gider **yok** |
| **TKZ** | Safi + F38 (603) + genel giderler | Bunlar **en alta** eklenir |

Özet: Safi TKZ “sigortacılık teknik sonucu”; TKZ “yatırım proxy’si ve genel gider de dahil edilmiş sonuç”.

---

## Pipeline (sıra)

1. **Varsayımlar** — bütçe yılı, tarife hedefleri, yıl ağırlıkları, gider artışı, aylık mali getiri  
2. **Prim dağıtımı** — tarife hedefi → 7xx brüt prim (+ endirekt)  
3. **Mevsimsellik** — yıllık primin aylara yayılması  
4. **Teknik oranlar** — geçmiş mizan pay÷baz, ağırlıklı yıllar, V2 düzeltmeleri  
5. **Faaliyet gideri** — 61402–06 bütçesi  
6. **KPK** — vade × stok farkı → F21–F30  
7. **GT pass 1** — F38 ≈ 0  
8. **Mali gelir proxy** — açılış banka × getiri + nakit proxy  
9. **GT pass 2** — F38 yazılır, net nakit payıyla branşlara dağıtılır  
10. **Sentetik satırlar** — Safi teknik gelir/gider, Safi TKZ, genel gider, TKZ  
11. **Çıktı** — ekran / Excel

Zorunlu girdiler pratikte: mizan, satış bütçesi, tarife–branş payı. KPK vade yoksa ilgili satırlar 0 kalır.

---

## 1) Girdiler

| Veri | Rol |
|------|-----|
| Yılsonu mizan | Teknik oran pay/baz; faaliyet gider baz; banka yedek |
| Aylık GT / bilanço | Mevsimsellik, KPK Y−1 prim, oran overlay, açılış banka |
| Satış bütçesi | Kanal × tarife hedef TL |
| Tarife → 7xx pay | Prim dağıtımının ana anahtarı |
| KPK vade (ve gerekirse kapanış tahmin) | Poliçe vade günleri |
| Oran ayarları | Manuel / referans override |
| V2 varsayımlar | Yıl, getiri, gider artışı, ağırlıklar |

---

## 2) Tahmini / bütçe prim (F11)

1. Tarife bazında bütçe hedefleri alınır.  
2. Geçmiş **tarife → 7xx** paylarıyla branş brüt prim hedeflerine çevrilir (referans yıllar + yıl ağırlıkları).  
3. Endirekt prim ayrı tutulur (F15); F12 = F11 − F15 mantığı Excel haritasından gelir.  
4. Prim **aylara** yayılır: referans yıldaki brüt yazılan prim (`0111`) profili normalize edilir; branş profili yoksa şirket geneli / eşit 1/12.

GT motoru ayları çoğu yerde **YTD** (yıl başından ay sonuna kümülatif) üzerinden çalıştırır; aylık farklar buradan türetilir. KPK ve 61402–06 kendi aylık serilerini korur.

**Prim mix uyarısı:** Tarife grubu hedef payı ile geçen yıl mizan prim payı ≈ **8 puan** ve üstü saparsa sistem uyarır — geçmiş oranları aynen taşımak, portföy kaymasını yansıtmayabilir.

Not: Prim dağıtımındaki yıl ağırlıkları (ör. son 2 yıl 50/50) ile **teknik oran** yıl ağırlıkları (50/25/15/10 veya kalem özel) **ayrı** şeylerdir.

---

## 3) Teknik oranlar — geçmiş → tahmini prime

### Temel fikir

Her kalem için geçmiş yılsonu (ve gerektiğinde ay-sonu) mizanda:

**oran = pay tutarı ÷ baz tutarı**

Birden fazla yıl varsa Excel GT’deki gibi **ağırlıklı ortalama** alınır. Tipik varsayılan (çoğu kalem):

| Yıl | Ağırlık |
|-----|---------|
| Son referans yıl | %50 |
| 2. önceki | %25 |
| 3. önceki | %15 |
| 4. önceki | %10 |

Bazı kalemler özeldir (ör. brüt hasar oranı 0211’de son yıla daha yüksek ağırlık). Uç yıllar **torpu** ile elenir veya oran min/max banda sıkıştırılır.

Referans seçenekleri: Excel GT (varsayılan), son yıl, son 3 yıl aritmetik, tek yıl, manuel kayıt.

### GT’ye nasıl uygulanır?

Hücre değeri kabaca: **baz × oran**.

Örnekler (özet):

| Ne | Mantık |
|----|--------|
| Reasürans prim | Brüt prim × reas oranı |
| Brüt ödenen hasar | (prim + KPK etkileri) × hasar oranı |
| Hasar re payı | Brüt hasar × re hasar oranı |
| Rücu / sovtaj | Hasar bloğu × rücu oranı |
| Komisyon (ödenen) | Brüt prim × (61401… / 60001) |
| Alınan re komisyon | Brüt prim × (614071… / 60001) |
| Dengeleme | İstatistik değil: 613 gideri olan branşta net kazanılmış × **−%12**, yoksa 0 |
| DERK | Brüt prim × DERK oranı; DERK oranı her zaman **yılsonu** snapshot’ından |

**Küçük baz / grup:** Son yılda payda çok küçükse (eşik ~500 bin TL) branş oranı gürültülü olur → aynı tarife grubundaki 7xx’lerin toplam pay÷toplam baz’ı kullanılır. Hasar bloğunda biri gruba kaydıysa tutarlılık için ilgili hasar/muallak kalemleri birlikte gruba alınır.

**014 / mali gelir oranı:** Artık “branş 60301 / şirket 60301” değil. Mizan tarafında **net nakit payı**:

`max(0, 60001+60002+61001+61002) / Σ pozitif net nakit`

Negatif net nakitli branş 0 pay alır. GT’de F38 tutarı bu orandan üretilmez; **şirket proxy tutarı** aynı net nakit mantığıyla dağıtılır (aşağıda).

---

## 4) Faaliyet gideri (61402–06)

- Baz: önceki yıl mizan 61402–06 (çift sayımsız).  
- Bütçe: × `(1 + gider artış oranı)` veya hesap bazlı manuel yıllık tutar.  
- Aylık: eşit **1/12**, işaret gider (negatif).  
- Branş payı: 61402 branş / şirket (F368); yoksa aktif branşlara eşit.

Bu tutarlar GT’de 190–194 satırlarında durur. **Safi teknik gider** hesabında çıkarılır; **TKZ** altına genel gider olarak geri konur.

61408 / 61409 import edilmez; “diğer faaliyet” satırları brüt prim × ilgili oranla gelir.

Komisyon (cari üretim) teknik faaliyette kalır; genel gider sayılmaz.

---

## 5) KPK — çalışma mantığı

Kazanılmamış prim karşılığı, **pro-rata stok** modelidir.

1. Yazım ayının **15’i** başlangıç kabul edilir.  
2. Branş × ay **vade günü** ile bitiş tarihi bulunur (vade yoksa 365).  
3. Değerleme **ay sonu**’dur (`ay=0` → önceki 31 Aralık).  
4. Stok tutarı ≈ `prim × (kalan süre / toplam vade)` (0–1 aralığında).

İki stok:

- **Cari:** bütçe yılı aylık yazılan prim (hedef × mevsimsellik).  
- **Devreden:** geçen yıl yazılan primden kalan (Y−1 seri; eksik aylar tahmin / kapanış store ile tamamlanabilir).

GT’ye yansıma: stok **değişiminin tersi** (stok artınca gelir azalır):

- Cari / devreden brüt KPK hareketleri  
- Reasürör payı: brüt hareket × reas prim oranı (işaret korunarak)  
- SGK KPK: **yalnızca 715** branşında, brüt hareket × SGK prim oranı  

Toplam KPK etkisi F21 altında toplanır; hasar bazında da KPK satırları (F22 vb.) kullanılır.

---

## 6) Gelir tablosu — iki geçiş

### Pass 1

Prim + teknik oranlar + KPK + faaliyet gideri. **F38 ≈ 0.**  
Amaç: mali gelir proxy’sinin nakit giriş/çıkış satırlarını F38’siz, tutarlı bir GT’den okumak.

### Mali gelir proxy (şirket geneli)

Bu, gerçekleşen 603 muhasebesi değil; **tahakkuk esaslı basitleştirilmiş proxy**’dir. Gerçek nakit akışı değildir; vergi / 690 yoktur.

1. **Açılış banka:** Y−1 bilanço son ay (tercihen Aralık) tam kod **102**, yoksa **100**, yoksa agrega **10**; yoksa yılsonu mizan aynı sıra. Prefix toplamı yapılmaz (çift sayım olmasın diye).  
2. Her ay:  
   - **Giriş** (mutlak): brüt prim + hasarda re payı + rücu/sovtaj  
   - **Çıkış** (mutlak): brüt ödenen hasar + komisyon + reas prim + 61402–06  
   - **Net nakit** = giriş − çıkış  
   - **Mali gelir_ay** = ay başı banka × **aylık getiri** (varsayılan ≈ %2,68; 2025 60301 backtest’e kalibre)  
   - Ay sonu banka = ay başı + net nakit + mali gelir → sonraki ayın açılışı  

Gelir bakiyeye eklenir (bileşik etki). Açılış 0 ise mali gelir 0. Negatif bakiye clamp edilmez; uyarı üretilir.

### Pass 2 + branş dağılımı

Yıllık / aylık F38 = proxy çıktısı. Branşlara dağıtım:

`pay = max(0, F10 + F95) / Σ pozitif net nakit`

- F10 ≈ net yazılan prim, F95 ≈ net ödenen hasar (hasar işaretli).  
- Hasar ≥ prim → o branş **0 pay**.  
- Hiç pozitif net nakit yoksa **brüt prim payı** fallback.

F38 yazılır ama **F9 yeniden F38’li hesaplanmaz**. Sentetik “teknik gelir” = F9 (pratikte mali gelirsiz).

---

## 7) Sentetik sonuç satırları (ekran / Excel)

| Kod | Anlam |
|-----|--------|
| Teknik gelir (safi) | F9 |
| Teknik faaliyet gideri | F176 − 190…194 |
| Teknik gider (safi) | F94 − 190…194 |
| **Safi TKZ** | Safi teknik gelir + safi teknik gider |
| Genel giderler | 190…194 |
| **TKZ** | Safi TKZ + F38 + genel giderler |

Gösterimde Safi TKZ vurgulanır; altında “teknik olmayan yatırım gelirleri (V2 proxy)” ve “genel giderler (61402–06)” ayrı görünür.

---

## 8) Bilinçli model notları (sık karışanlar)

1. Safi TKZ’de **603 / F38 yok**; TKZ’de var.  
2. Genel gider (61402–06) teknik giderden çıkarılır, alta konur; komisyon teknikte kalır.  
3. Excel F9 formülünde F38 görünse bile V2 motoru F38’i F9’a gömmez.  
4. Mali gelir nakit değildir; vergi etkisi yok.  
5. 014 / F38 dağılımı 60301 oranı değil, **net nakit payı**.  
6. Dengeleme oranı istatistik değil, **−%12 kuralı** (yalnız 613 gideri olanlarda).  
7. DERK oranı daima yılsonu.  
8. Küçük baz ve hasar bloğu grup oranı kullanır.  
9. Prim mix sapması, oranların “eski portföy”e kilitli kalabileceğini hatırlatır.  
10. TSB KPI / tidy bu motora bağlı değildir (benzer “safi teknik” kavramı ayrı üründe vardır).

---

## 9) Kod haritası (derinlemesine bakmak için)

| Konu | Dosya |
|------|--------|
| V2 orkestrasyon, sentetik, F38 dağıtım | `lib/butce/v2/buildV2GelirTablosu.ts` |
| Net nakit payı | `lib/butce/v2/netNakitPay.ts` |
| Mali gelir proxy | `lib/butce/v2/maliGelirProxy.ts`, `maliGelirProxyConfig.ts` |
| Oran motoru / torpu | `lib/butce/oran/oranMotoru.ts` |
| Pay÷baz, 014, F348, grup | `lib/butce/oran/mizanOranlar.ts`, `oranKalemLoader.ts` |
| Metodoloji etiketleri | `lib/butce/oran/oranMetodoloji.ts` |
| GT çarpım motoru | `lib/butce/gelir/gtMotoru.ts`, `gelirTablosu.ts` |
| KPK | `lib/butce/kpk/*` |
| Prim dağıtım / mevsim | `lib/butce/prim/dagitimMotoru.ts`, `mizanAylikOranlari.ts` |
| API | `app/api/butce/v2/hesapla/route.ts` |

---

*Son güncelleme: 24 Ağustos 2026 — F38/014 net nakit payı ve komisyon 61401 / 614071 mantığıyla uyumlu.*
