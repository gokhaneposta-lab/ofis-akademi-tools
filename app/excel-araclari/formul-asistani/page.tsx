"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import ToolLayout from "@/components/ToolLayout";

const ACCENT = "#217346";

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

  const suggestions = useMemo(() => findSuggestions(query), [query]);

  const howToSteps = [
    "Arama kutusuna Excel'de yapmak istediğinizi yazın (örn. iki kolonu birleştir, toplam al, koşula göre değer ver).",
    "Altta önerilen fonksiyonlar (Türkçe / İngilizce) ve kısa açıklama görünür.",
    "İlgili Excel oluşturucu araçlarına veya eğitim sayfalarına geçebilirsiniz.",
  ];

  const faq = [
    {
      question: "Öneriler neye göre?",
      answer: "En çok kullanılan fonksiyonları ve anahtar kelime eşleşmelerini kullanır.",
    },
    {
      question: "Eşleşme çıkmazsa ne yapmalıyım?",
      answer: "Farklı kelimeler deneyin (örn. birleştir, topla, eğer, düşeyara).",
    },
    {
      question: "Formül oluşturucuya bağlanıyor mu?",
      answer: "Evet. Benzer araçlar üzerinden ilgili oluşturucu sayfalarına geçebilirsiniz.",
    },
  ];

  const aboutContent = (
    <>
      <p className="text-sm text-gray-700">
        Excel’de ne yapmak istediğini yazdığında (doğal dil) sana uygun fonksiyon adlarını ve kısa açıklamalarını önerir. Türkçe ve İngilizce karşılıklarıyla hızlı arama yapmanı sağlar.
      </p>
      <p className="mt-3 text-sm text-gray-700">
        Excel’de fonksiyon bulmak için <strong className="font-semibold text-gray-900">Ekle → İşlev</strong> veya formül çubuğundaki{" "}
        <strong className="font-semibold text-gray-900">fx</strong> butonunu kullanabilirsiniz; kategori ve isimle arama yapılır. Bu araç, “iki sütunu birleştir” veya “tarihten ay çıkar” gibi doğal dil ifadelerinizi Türkçe ve İngilizce Excel fonksiyon adlarına yaklaştırır.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Örnek arama</p>
          <p className="text-gray-700">“iki kolonu birleştir”</p>
          <p className="mt-2 text-gray-700">“tarih farkı”</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-xs">
          <p className="mb-1 font-semibold text-gray-800">Neler önerir?</p>
          <p className="text-gray-700">
            Örn. <span className="font-mono text-[13px]">BİRLEŞTİR (CONCAT)</span> ve{" "}
            <span className="font-mono text-[13px]">TARİHFARKI / GÜN360 (DATEDIF)</span>
          </p>
        </div>
      </div>
    </>
  );

  return (
    <ToolLayout
      title="Excel Formül Asistanı"
      description="Excel'de ne yapmak istediğinizi yazın; size uygun fonksiyonu önerir. Türkçe ve İngilizce karşılıkları ile kısa açıklama."
      path="/excel-araclari/formul-asistani"
      keywords={["excel formül asistanı", "excel fonksiyon öner", "excel türkçe ingilizce fonksiyon"]}
      howToSteps={howToSteps}
      faq={faq}
      aboutContent={aboutContent}
      relatedLinks={
        <span className="text-gray-600">
          Devam etmek için{" "}
          <Link href="/excel-araclari/formul-asistani" className="font-medium underline underline-offset-2" style={{ color: ACCENT }}>
            formül asistanı
          </Link>{" "}
          ve{" "}
          <Link href="/egitimler/orta" className="font-medium underline underline-offset-2" style={{ color: ACCENT }}>
            eğitim seviyelerine
          </Link>{" "}
          göz atın.
        </span>
      }
    >
      <div className="mx-auto max-w-3xl px-4 pb-2 pt-1 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3">
            <label htmlFor="formul-arama" className="text-sm font-semibold text-gray-900">
              Excel&apos;de ne yapmak istiyorsunuz?
            </label>
            <div style={{ ["--accent" as string]: ACCENT }}>
              <input
                id="formul-arama"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Örn: iki kolonu birleştir"
                autoComplete="off"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3.5 text-[15px] text-gray-900 placeholder:text-gray-400/60 transition-all duration-200 focus:border-[color:var(--accent)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(33,115,70,0.12)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {query.trim() ? (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Önerilen fonksiyon(lar)</p>
            {suggestions.map((s, i) => (
              <article
                key={i}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-base font-semibold text-gray-900">{s.tr}</span>
                  <span className="text-sm text-gray-500">({s.en})</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{s.aciklama}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Örnek aramalar: iki kolonu birleştir, toplam al, düşey ara, koşula göre, boşluk temizle, tarih farkı
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
