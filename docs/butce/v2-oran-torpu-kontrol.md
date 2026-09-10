# V2 teknik oran — torpu kontrol listesi

Agent ve manuel test sırasında **oran 0 / GT satırı 0** görüldüğünde önce torpu ihtimalini ele.

## Torpu nedir?

Yıl birleştirmede uç MIZAN oranlarını elemek veya min/max banda sıkıştırmak:

| Kural | Örnek |
|--------|--------|
| `yil_disi_max` | \|oran\| > %110 → o yıl birleştirmeden düş |
| `oran_min` / `oran_max` | Ham ortalamayı −100%…+50% bandına sık |
| **Tüm yıllar elenince** | Motor **0** yazar (sessiz tuzak) |

Kaynak: `lib/butce/oran/oranMotoru.ts`, kalem tanımları: `lib/butce/oran/oranKalemLoader.ts`.

## Muallak istisnası (2026-03)

**Torpu yok** — ham ağırlıklı ortalama:

- `02211` (F451 / 611011 cari)
- `02212` (F456 / 611012 devreden — GT’de çoğunlukla mizan override)
- `02221` (F466)
- `02222` (F471)

**Torpu var** (değişmedi):

- `0211` ödenen hasar (`yil_disi_max` 1.1, oran −100%…+50%)
- `016`, `F461`, vb.

## Sıfır tuzağı — nasıl anlaşılır?

Oranlar panelinde veya teknik oran tablosunda:

1. Yıl sütunları **dolu** (ör. −%647, −%433 …)
2. **Oran % = 0** (veya GT’de prim×oran satırı 0)
3. Düzenleme notunda **“Uç yıl dışlandı (torpu)”** veya tüm yıllar elendi

→ Sorun büyük ihtimalle **torpu**, MIZAN’ın “yanlış” olması değil.

**Muallak (02211–02222):** Bu tablo artık torpu kaynaklı 0 olmamalı; yıl sütunları ağırlıklı ortalama ile Oran % uyumlu olmalı.

## Ocak YTD vs Aralık yılsonu

| Dönem | MIZAN | Tipik profil |
|--------|--------|----------------|
| **Aralık (ay=12)** | Yılsonu kümülatif | Oranlar makul (−%20 bandı) |
| **Ocak (ay=1)** | Ocak YTD | Payda küçük → oran aşırı (−%600); muallakta torpu yok → birleşik de aşırı olabilir |

GT aylık desen **Ocak geçmişi** kullanır; oran panelinde **Kümülatif ay** seçimine dikkat.

## Muallak GT — iki parça

| Hesap | Kaynak |
|--------|--------|
| 611011 / F116 | Brüt prim × F451 (cari) |
| 611012 / F126 | **2025 Aralık mizan** → yalnızca Ocak (prim×F456 değil) |
| 611021 / F137 | Brüt prim × F466 |
| 611022 / F147 | **2025 Aralık mizan** → yalnızca Ocak |

F115 = F116 + F126. **F116=0 ama F115≠0** → cari oran 0, devreden mizandan geliyor demektir.

## Agent test checklist

V2 / muallak / oran değişikliği veya “GT neden 0?” raporunda:

- [ ] Oran paneli: **Kümülatif ay** (Ocak vs Aralık) not edildi mi?
- [ ] Yıl sütunları vs **Oran %** tutarlı mı? (muallakta torpu yok; 0211’de torpu olabilir)
- [ ] 02211 için **torpu etiketi** var mı? (olmamalı)
- [ ] 611011: **Hesaplama** sütunu = prim × F451; 611012 = devreden mizan notu
- [ ] Şüphede: `npx tsx scripts/butce-v2-prepush-check.ts` — bölüm **7) Torpu**

## Kullanıcıya rapor formatı

Torpu kaynaklıysa kısa yaz:

> **Torpu:** {kalem} {branş} ay={ay} — yıl sütunları dolu ({örnek yıllar}) ama birleşik oran 0; {N} yıl |oran|>{eşik} elendi. Muallak kalemi değilse beklenen davranış; muallak ise regresyon.

## İlgili dosyalar

| Dosya | Rol |
|--------|-----|
| `docs/butce-v2-nasil-calisir.md` | Genel V2 akış |
| `lib/butce/oran/oranMetodoloji.ts` | `MUALLAK_ORAN_KALEMLER`, `HASAR_YIL_DISI_MAX` |
| `scripts/butce-v2-prepush-check.ts` | Otomatik torpu taraması |
| `.cursor/rules/butce-oran-torpu.mdc` | Agent kuralı |
