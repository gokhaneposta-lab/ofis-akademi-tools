"use client";

import React, { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import PageRibbon from "@/components/PageRibbon";
import NasilKullanilir from "@/components/NasilKullanilir";
import BenzerExcelAraclari from "@/components/BenzerExcelAraclari";
import { THEME } from "@/lib/theme";

type Suggestion = { tr: string; en: string; aciklama: string };

const FORMUL_LISTESI: { anahtar: string[]; tr: string; en: string; aciklama: string }[] = [
  { anahtar: ["iki kolonu birleştir", "kolon birleştir", "sütun birleştir", "birleştir", "concat", "metin birleştir", "hücre birleştir", "birleştirme"], tr: "BİRLEŞTİR", en: "CONCAT", aciklama: "Metinleri veya hücreleri tek metinde birleştirir. Excel 2016+ BİRLEŞTİR; eski sürümde & veya BİRLEŞTİR (CONCATENATE)." },
  { anahtar: ["dikey ara", "düşey ara", "vlookup", "tabloda ara", "tablodan getir", "eşleşen değer"], tr: "DÜŞEYARA", en: "VLOOKUP", aciklama: "Tabloda bir değeri arar, aynı satırdaki başka sütundaki değeri döndürür." },
  { anahtar: ["koşula göre", "eğer", "if", "şarta göre", "doğruysa yanlışsa"], tr: "EĞER", en: "IF", aciklama: "Koşul doğruysa bir değer, yanlışsa başka değer döndürür." },
  { anahtar: ["toplam", "topla", "sum", "toplamak"], tr: "TOPLA", en: "SUM", aciklama: "Seçilen hücrelerin toplamını hesaplar." },
  { anahtar: ["ortalama", "average", "ortalaması"], tr: "ORTALAMA", en: "AVERAGE", aciklama: "Hücrelerin ortalamasını alır." },
  { anahtar: ["say", "count", "kaç tane", "adet", "sayı"], tr: "EĞERSAY", en: "COUNTIF", aciklama: "Koşula uyan hücre sayısını verir. Sadece sayı saymak için BAĞ_SAY_DEĞER (COUNT)." },
  { anahtar: ["boşluk temizle", "trim", "baştaki sondaki boşluk"], tr: "TEMİZLE", en: "TRIM", aciklama: "Metnin başındaki ve sondaki boşlukları siler; aradaki çoklu boşlukları tek yapar." },
  { anahtar: ["büyük harf", "upper", "küçük harf", "lower", "proper", "ilk harf büyük"], tr: "BÜYÜKHARF / KÜÇÜKHARF / YAZIM.DÜZENİ", en: "UPPER / LOWER / PROPER", aciklama: "BÜYÜKHARF, KÜÇÜKHARF veya YAZIM.DÜZENİ (her kelimenin ilk harfi büyük)." },
  { anahtar: ["tarih farkı", "gün sayısı", "yaş hesapla", "vade", "datedif"], tr: "TARİHFARKI / GÜN360", en: "DATEDIF / DAYS", aciklama: "İki tarih arası gün, ay veya yıl. TARİHFARKI veya DATEDIF (eski)." },
  { anahtar: ["yüzde", "yüzde hesapla", "percent"], tr: "Yüzde", en: "Percent", aciklama: "A * B / 100 veya oran için A/B. Hücreyi yüzde formatı: % simgesi veya sayı formatı." },
  { anahtar: ["tekrar kaldır", "benzersiz", "unique", "yinelenen"], tr: "BENZERSİZ", en: "UNIQUE", aciklama: "Listedeki benzersiz değerleri döndürür (Excel 365). Veri sekmesinden Yinelenenleri Kaldır da kullanılır." },
  { anahtar: ["metni böl", "kolonlara ayır", "split", "virgülle ayır"], tr: "Metni Sütunlara Dönüştür", en: "Text to Columns", aciklama: "Veri sekmesi → Metni Sütunlara Dönüştür. Virgül, noktalı virgül veya sabit genişlikle böler." },
  { anahtar: ["hata varsa", "eğerhata", "iferror", "#yok", "#değer"], tr: "EĞERHATA", en: "IFERROR", aciklama: "Formül hata verirse alternatif değer döndürür (#YOK, #DEĞER! yerine metin veya 0)." },
  { anahtar: ["yatay ara", "hlookup"], tr: "YATAYARA", en: "HLOOKUP", aciklama: "Tabloda ilk satırda arar, aynı sütundaki başka satırdaki değeri döndürür." },
  { anahtar: ["ara bul", "index", "kaçıncı", "konum"], tr: "KAÇINCI / İNDİS", en: "MATCH / INDEX", aciklama: "KAÇINCI konum verir; İNDİS o konumdaki değeri verir. Birlikte esnek arama yapılır." },
];

function findSuggestions(query: string): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: Suggestion[] = [];
  for (const item of FORMUL_LISTESI) {
    const match = item.anahtar.some((k) => k.includes(q) || q.includes(k) || q.split(/\s+/).some((w) => w.length > 2 && item.anahtar.some((a) => a.includes(w))));
    if (match) results.push({ tr: item.tr, en: item.en, aciklama: item.aciklama });
  }
  if (results.length > 0) return results;
  return [{ tr: "—", en: "—", aciklama: "Bu istek için kayıtlı bir eşleşme yok. Farklı kelimeler deneyin (örn. birleştir, topla, eğer, düşeyara)." }];
}

export default function FormulAsistaniPage() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const suggestions = useMemo(() => findSuggestions(query), [query]);
  const first = suggestions[0];
  const copyText = first ? `Türkçe: ${first.tr}\nİngilizce: ${first.en}\n${first.aciklama}` : "";

  async function handleCopy() {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec] px-3 py-6 sm:px-4 sm:py-8" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title="Excel Formül Asistanı"
        description="Excel'de ne yapmak istediğinizi yazın; size uygun fonksiyonu önerir. Türkçe ve İngilizce karşılıkları ile kısa açıklama."
      />
      <div
        className="mx-auto mt-2 mb-6 max-w-3xl overflow-hidden rounded-b shadow-lg border border-t-0 p-6 sm:p-8 flex flex-col gap-6"
        style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
      >
        <NasilKullanilir
          steps={[
            "Arama kutusuna Excel'de yapmak istediğinizi yazın (örn. iki kolonu birleştir, toplam al, koşula göre değer ver).",
            "Altta önerilen fonksiyonlar (Türkçe / İngilizce) ve kısa açıklama görünür.",
            "İsterseniz sonucu kopyalayıp not alabilir veya ilgili formül oluşturucu aracımıza gidebilirsiniz.",
          ]}
          excelAlternatif={
            <>Excel&apos;de <strong>Ekle → İşlev</strong> veya formül çubuğundaki <strong>fx</strong> ile fonksiyon arama yapabilirsiniz. Bu araç doğal dil isteğinizi fonksiyon adına çevirir.</>
          }
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Excel'de ne yapmak istiyorsunuz?</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn: iki kolonu birleştir"
            className="w-full rounded-lg border p-3 text-sm bg-white"
            style={{ borderColor: THEME.gridLine }}
          />
        </div>

        {query.trim() && (
          <div className="rounded-lg border p-4 bg-white space-y-4" style={{ borderColor: THEME.ribbon }}>
            <div className="text-xs font-semibold text-gray-700">Önerilen fonksiyon(lar)</div>
            {suggestions.map((s, i) => (
              <div key={i} className="border-l-2 pl-3 space-y-1" style={{ borderColor: THEME.ribbon }}>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-gray-900">{s.tr}</span>
                  <span className="text-gray-500 text-sm">({s.en})</span>
                </div>
                <p className="text-sm text-gray-600">{s.aciklama}</p>
              </div>
            ))}
            <div className="pt-2">
              <CopyButton onClick={handleCopy} copied={copied} label="Sonucu Kopyala" copiedLabel="Kopyalandı" />
            </div>
          </div>
        )}

        {!query.trim() && (
          <p className="text-sm text-gray-500">Örnek aramalar: iki kolonu birleştir, toplam al, düşey ara, koşula göre, boşluk temizle, tarih farkı</p>
        )}

        <div className="mt-6">
          <BenzerExcelAraclari currentHref="/excel-araclari/formul-asistani" />
        </div>
        <div className="text-xs text-gray-500">Ofis Akademi · Mantık & Formül</div>
      </div>
    </div>
  );
}
