# Bütçe V2 Gelir Tablosu Motoru — Teknik Özet (GPT inceleme metni)

> **Amaç:** Bu dosya, `ofis-akademi` reposundaki V2 bütçe gelir tablosu motorunun mimarisini, veri akışını, formül mantığını ve bilinen tutarsızlıkları kod tabanına bakmadan anlatmak için hazırlanmıştır. Dışarıdaki bir modele (GPT vb.) verilebilir.
>
> **Repo:** ofis-akademi · **Modül:** Bütçe V2 · **Bütçe yılı:** 2026 · **Son güncelleme:** Mart 2026

---

## 1. Ne yapar?

V2 motoru, sigorta şirketi **2026 bütçe gelir tablosunu (GT)** branş bazında (7xx Hazine branş kodları) üretir. Excel'deki GT formüllerini (`gt_excel_harita.json`) TypeScript'te değerlendirir; prim hedefi, teknik oranlar, KPK, faaliyet gideri ve mali gelir proxy'sini birleştirir.

| Rol | Dosya / yol |
|-----|-------------|
| Giriş noktası | `lib/butce/v2/buildV2GelirTablosu.ts` → `buildV2GelirTablosu()` |
| Dashboard UI | `components/butce/V2DashboardClient.tsx` |
| API | `app/api/butce/v2/hesapla/route.ts` |
| Genel anlatım (Türkçe) | `docs/butce-v2-nasil-calisir.md` |

---

## 2. Pipeline (sırayla)

```
1. Prim dağıtımı (DagitimMotoru)
   → branş × yıllık brüt prim + endirekt prim

2. Aylık prim payları (mizan geçmişi veya varsayılan 1/12)
   → branş × 12 ay pay serisi (toplam = 1)

3. Faaliyet gideri (buildFaaliyetGiderFromMizanArtis)
   → önceki yıl mizan × (1 + artış oranı), branş dağılımı

4. GT Pass-1 (buildGelirTablosu) — mali gelir proxy için net nakit profili

5. Mali gelir proxy (buildMaliGelirProxy)
   → F38 (603) aylık serisi; banka bakiyesi × aylık getiri

6. GT Pass-2 (buildGelirTablosu + aylikSatirOverride F38)
   → asıl GT; F38 prim payıyla yazılır

7. F38 net nakit payıyla ezilir (dagitMaliGelirNetNakit)
   → DASK gibi "sıfır prim payı ≠ sıfır nakit" düzeltmesi

8. Sentetik satırlar (hesaplaV2SentetikSatirlar)
   → TEKNİK GELİR (9001), TEKNİK GİDER (9002), SAFİ TKZ (9003), TKZ (9005) vb.
```

---

## 3. Ana veri kaynakları

| Kaynak | Loader | Kullanım |
|--------|--------|----------|
| Mizan (YTD snapshot) | `loadMizanRows()` | Oran motoru, prim fallback |
| Mizan aylık | `loadMizanAylikRows()` | Aylık prim dağılım oranları |
| Mizan aylık full | `loadMizanAylikFullRows()` | GT kodları (01212 vb.), devreden KPK/muallak |
| Oran ayar paketi | `loadOranAyarPaket()` | Kullanıcı override (Uygulanan %) |
| KPK vade | `loadKpkVadeRows()` | Rolling KPK stok |
| Tarife hedefleri | V2 varsayımlar / V3 defaults | Prim dağıtım girdisi |
| GT formül haritası | `lib/butce/data/gt_excel_harita.json` | F11, F96, F320… formülleri |
| Oran kalem tanımları | `lib/butce/data/oran_kalem_excel.json` | F320 pay/baz hesapları |

---

## 4. GT hesap döngüsü

**Dosya:** `lib/butce/gelir/gelirTablosu.ts`

Her aktif branş için **12 aylık döngü** (i = 0…11 = Ocak…Aralık):

### 4.1 YTD prim

```
cumPay += aylikPay[i]
ytdBrut = yillikBrutPrim × cumPay
ytdEndirekt = yillikEndirekt × cumPay
```

### 4.2 Dış hücreler (`disHucreler`) — GT motoruna enjekte edilen değerler

| Kaynak | GT satırları | Ocak'ta ne yazılır? |
|--------|--------------|---------------------|
| KPK motoru | 21–30 | `gtAylik[s][i]` — ay sonu **stok/seviye** |
| Faaliyet gider motoru | 176, 177, … | Ocak–i **kümülatif YTD** toplam |
| Devreden muallak (mizan) | 126, 147 | Ocak sabit; Şubat–Aralık delta = 0 |
| Devreden KPK (mizan) | 24, 27 | Ocak mizan devralma tutarı |

### 4.3 GT motoru çağrısı

```typescript
ytdVals = motor.hesaplaBrans(brans, ytdBrut, ytdEndirekt, disHucreler, i+1)
bransAylik[s][i] = ytdVals[s] - prevYtd[s]   // aylık delta
```

### 4.4 KPK/faaliyet override (döngü SONRASI — kritik!)

Döngü bittikten sonra KPK ve faaliyet satırları **kendi motor serileriyle ezilir**:

```typescript
bransAylik[s] = [...kpkBrans.gtAylik[s]]   // KPK satırları 21–30
if (kpkDevreden) {
  bransAylik[24] = sabit devreden seri
  bransAylik[27] = sabit devreden seri
  turetKpkUstSatirlar(bransAylik)  // F22=F23+F24, F21=F22+F25+F28 yeniden türet
}
// Faaliyet satırları da benzer şekilde ezilir
```

**Sonuç:** F96 gibi oranla çarpılan satırlar döngü içinde hesaplanır; KPK satırları döngü sonrası değişir. **F96 yeniden hesaplanmaz.** Bu, bilinen tutarsızlık kaynağıdır (Bölüm 9).

---

## 5. GT formül motoru

**Dosya:** `lib/butce/gelir/gtMotoru.ts`

Excel hücre grafını değerlendirir.

**Doğrudan girdiler:**

- `F11` = brüt yazılan prim (ytdBrut)
- `F15` = endirekt prim (ytdEndirekt)
- `disHucreler[satir]` = KPK, faaliyet, devreden override

**Çarpım hücreleri:**

```
değer = evalExpr(baz_ifade) × oranDeger(oran_hucre, brans, ay)
```

**Örnek — Brüt ödenen hasar (61001):**

```
F96 = (F11 + F22 + F32) × F320
```

| GT hücresi | Hesap | Anlam |
|------------|-------|-------|
| F11 | 60001 | Brüt yazılan prim |
| F22 | 60101 | Brüt KPK (**F21 değil!**) |
| F32 | 60201 | Brüt DERK |
| F320 | — | Brüt ödenen hasar payı (kalem 0211) |

Oran tanımı (`oran_kalem_excel.json`):

- pay: `61001`
- baz: `60001`, `60101`, `60201`
- GT hücresi: `F320`
- tahmin formülü: `=(F11+F22+F32)*F320`

**F320 oranı:** `MizanOranServisi` — geçmiş yıl(lar) mizan pay÷payda, yıl birleştirme ağırlıkları, kullanıcı override (`oranAyar`), V2'de küçük baz / hasar bloğu grup fallback.

---

## 6. Teknik oran motoru

**Dosya:** `lib/butce/oran/mizanOranlar.ts`

- `v2Metodoloji: true` ile V2 GT'de kullanılır.
- Branş×ay (1–12) kümülatif oran tabloları üretir.
- **V2 grup fallback:** baz çok küçükse tarife grubu (7xx komşuları) ortalamasına düşer.
- **Hasar bloğu (F320, F451, F436, …):** aynı grupta tutarlı fallback.
- Kullanıcı "Uygulanan %" → `oranAyar[kalemKodu].brans[bransKodu]`

---

## 7. KPK motoru

**Dosya:** `lib/butce/kpk/kpkMotoru.ts`

**Rolling stok modeli:** geçmiş + bütçe prim yazımları, vade günü, ay sonu aktif KPK stoku.

**GT satır eşlemesi** (`lib/butce/v2/v2GtHesapAgac.ts`):

| GT F | Hesap | Anlam |
|------|-------|-------|
| F21 | 601 | KPK toplam değişim |
| F22 | 60101 | Brüt KPK |
| F23 | 601011 | Cari brüt KPK |
| F24 | 601012 | Devreden brüt KPK |
| F25–F30 | 60102/60103 alt | Reasürör, SGK payları |

**Motor üretimi:**

- Yapraklar (23, 26, 29): rolling stok × (−1), reasürör/SGK türetilmiş
- F24/F27: motor **0** üretir; devreden mizandan gelir
- Üst satırlar: F22 = F23+F24, F21 = F22+F25+F28

**Semantik karışıklık (açık sorun):**

- `gtAylik` yapraklarda **ay sonu stok seviyesi** tutuluyor (hareket/delta değil).
- GT muhasebesinde 601 satırı **"değişim"** anlamına gelir.
- Dashboard `v2OzetDeger` KPK satırları için `kpkStokYtd()` → anchor ay hücresi (toplam değil).
- Bu yüzden 601 pozitif/negatif "değişim" gibi okunurken aslında stok seviyesi olabilir.

---

## 8. Devreden KPK / muallak

**Dosyalar:** `lib/butce/gelir/kpkDevreden.ts`, `lib/butce/gelir/muallakDevreden.ts`

**Devreden KPK (601012/601022):**

- Kaynak: bütçe yılı **Ocak** mizan (`mizan-aylik-full`, GT kod 01212/01222)
- Yalnızca Ocak hareketi; Şubat–Aralık = 0
- `disHucreler[24/27]` hesap anında set edilir
- Döngü sonrası `bransAylik[24/27]` sabitlenir + `turetKpkUstSatirlar()` ile F21/F22 güncellenir

**Devreden muallak (611012/611022):** aynı mantık, F126/F147.

---

## 9. Bilinen tutarsızlık: F96 vs dashboard KPK satırları

### Somut örnek: 701 Yangın, Ocak sonu (2026 bütçe, yerel build)

**Dashboard'da görünen** (`v2OzetDeger`):

| Satır | Tutar |
|-------|-------|
| F11 brüt prim | 92.165.464 |
| F21 KPK (601) | +47.282.213 |
| F22 brüt KPK (60101) | −19.637.739 |
| F96 brüt ödenen hasar | +68.150.590 |
| F320 | −20,37% |

**Kullanıcı beklentisi (yanlış baz — F21 kullanılırsa):**

```
(92.165.464 + 47.282.213 + 0) × (−0,2037) = −28.400.611  ≠ +68 mn
```

**Motorun F96 hesap anında kullandığı girdiler:**

```
F11  = 92.165.464
F22  = −426.786.484   ← dashboard'daki −19,6 mn DEĞİL
F32  = 0
F320 = −0,2037

Baz  = 92.165.464 + (−426.786.484) = −334.621.020
F96  = (−334.621.020) × (−0,2037) = +68.150.590  ✓
```

**Kök neden:**

1. F96 formülü **F21 (601) değil F22 (60101)** kullanır.
2. Hesap anında `disHucreler[22]` = KPK motorunun ham F22 stoku (−427 mn).
3. Döngü sonrası devreden KPK mizandan F24'e yazılır, `turetKpkUstSatirlar()` F22'yi **−19,6 mn** yapar — ama **F96 yeniden hesaplanmaz**.
4. Negatif baz × negatif oran → pozitif F96; dashboard gider satırını pozitif gösterebilir.

**Alternatif senaryolar (aynı dashboard F11/F320):**

| F22 kullanılırsa | F96 sonucu |
|------------------|------------|
| Motor hesap anı (−426,8 mn) | **+68,2 mn** |
| Dashboard F22 (−19,6 mn) | −14,8 mn |
| Dashboard F21 (+47,3 mn) | −28,4 mn |

**Doğrulama:** `scripts/butce-v2-prepush-check.ts` bölüm 8 (KPK tutarlılık); F96 için henüz guard yok.

---

## 10. Dashboard okuma

**Dosya:** `lib/butce/v2/v2GtFiltre.ts`

```typescript
v2OzetDeger(gt, satir, ozetAy, bransKodlari)
```

- `ozetAy = 1` → Ocak sonu YTD
- Normal satırlar: `aylikBrans[kod][satir][0..ozetAy-1]` toplamı
- KPK satırları (21–30): `kpkStokYtd()` → anchor ay **tek hücre** (stok seviyesi)
- Sentetik satırlar (9001–9006): bileşen formülü (`v2SentetikFormul`)

**Sentetik TEKNİK GELİR (9001):**

```
F10 + F21 + F31 + F83 + F86
(603/F38 hariç)
```

---

## 11. Mali gelir (F38 / 603)

- `buildMaliGelirProxy`: GT aylık nakit akışından banka simülasyonu → yıllık mali gelir
- F38 **GT motoruna gömülmez**; `aylikSatirOverride` ile yazılır
- Sonra **net nakit payı** ile branşlara dağıtılır (prim payı değil)

---

## 12. V2 katmanları (sunum)

```
TEKNİK GELİR (9001)  = 600+601+602+604+605
TEKNİK GİDER (9002)  = 610+611+612+613+614(tk faaliyet)+615+202
SAFİ TKZ (9003)      = teknik gelir + teknik gider
TKZ (9005)           = safi + F38 + genel giderler (61402–06)
```

---

## 13. V2 vs V3

| | V2 | V3 |
|--|----|----|
| Amaç | Bütçe / plan | Gerçekleşen + projeksiyon |
| F96 | Oran motoru × formül | Mizan YTD lock (`ytdOverlay.ts`) |
| KPK | Rolling stok motoru | V2 üzerine overlay |
| Dashboard | `V2DashboardClient` | `V3DashboardClient` |

701 Ocak F96: V2 bütçe ≈ +68 mn; V3 mizan-kilitli farklı (≈ −7,6 mn).

---

## 14. Ana dosya haritası

```
lib/butce/v2/buildV2GelirTablosu.ts    — V2 orchestrator
lib/butce/gelir/gelirTablosu.ts        — 12 ay × branş döngüsü, disHucreler, KPK override
lib/butce/gelir/gtMotoru.ts            — Excel formül graf motoru
lib/butce/oran/mizanOranlar.ts         — Teknik oranlar (F320 vb.)
lib/butce/kpk/kpkMotoru.ts             — Rolling KPK stok
lib/butce/kpk/buildKpkSonuc.ts         — KPK → GT satır enjeksiyonu
lib/butce/gelir/kpkDevreden.ts         — 601012 devreden + turetKpkUstSatirlar
lib/butce/v2/v2GtFiltre.ts             — Dashboard v2OzetDeger
lib/butce/v2/v2SentetikFormul.ts       — 9001–9006 formülleri
lib/butce/data/gt_excel_harita.json    — F satır formülleri
lib/butce/data/oran_kalem_excel.json   — Oran kalem pay/baz
components/butce/V2DashboardClient.tsx — UI
scripts/butce-v2-prepush-check.ts      — Push öncesi doğrulama
docs/butce-v2-nasil-calisir.md         — Genel Türkçe anlatım
```

---

## 15. Açık sorunlar / inceleme soruları

1. **F96–KPK zamanlama:** KPK satırları döngü sonrası ezildiğinde oranla türetilen satırlar (F96, F116, …) yeniden hesaplanmalı mı?
2. **KPK semantiği:** `gtAylik` stok mu hareket mi tutmalı? GT 601 "değişim" satırı ile uyumsuzluk.
3. **disHucreler[22] vs turetKpkUstSatirlar:** Devreden enjekte edilince F22 hesap anında güncellenmiyor; sadece F24 override ediliyor, F22 eski kalıyor.
4. **F96 işareti:** Hasar gideri negatif mi pozitif mi gösterilmeli?
5. **Prepush guard:** F96 = formül(F11,F22,F32,F320) tutarlılık testi eklenebilir mi?
6. **Prim dağılım farkı:** Aynı branşta dashboard F11 (82 mn) vs build (92 mn) — deploy/veri sürümü farkı olabilir.

---

## 16. Özet cümle

V2 motoru, branş×ay döngüsünde **YTD prim + dış hücreler (KPK/faaliyet/devreden) + teknik oranlar** ile Excel GT formüllerini çalıştırır; KPK satırları döngü **sonrasında** ayrı motor serisiyle ezilir; bu nedenle **61001 (F96) tabloda görünen KPK satırlarıyla tutarlı olmayabilir**. Dashboard `v2OzetDeger` ezilmiş KPK'yı okur; F96 ise ezilmeden önceki KPK girdisiyle hesaplanmış kalır.
