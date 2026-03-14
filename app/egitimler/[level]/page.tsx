"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import PageRibbon from "@/components/PageRibbon";
import ExcelPracticeGrid from "@/components/ExcelPracticeGrid";
import type { PracticeGridDef } from "@/components/ExcelPracticeGrid";
import { THEME } from "@/lib/theme";
import { buildLevelWorkbook, downloadWorkbook, type SheetFromTable } from "@/lib/egitimExcelExport";

/** PDF'de html2canvas'ın yakalayabilmesi için SVG'lere açık width/height ve stroke veriliyor */
const svgProps = { width: 24, height: 24, viewBox: "0 0 24 24" as const, fill: "none" as const, stroke: "#374151", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

/** Excel kısayolları için küçük ikonlar (Ctrl+X makas, Ctrl+C/V, Ctrl+T tablo) */
function ShortcutIcon({ type, className = "h-4 w-4" }: { type: "cut" | "copy" | "paste" | "table"; className?: string }) {
  const c = className;
  if (type === "cut") {
    return (
      <svg className={c} {...svgProps}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
        <line x1="15.5" y1="8.5" x2="8.5" y2="15.5" />
      </svg>
    );
  }
  if (type === "copy") {
    return (
      <svg className={c} {...svgProps}>
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    );
  }
  if (type === "paste") {
    return (
      <svg className={c} {...svgProps}>
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    );
  }
  if (type === "table") {
    return (
      <svg className={c} {...svgProps}>
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    );
  }
  return null;
}

/** Tek bir fonksiyon: kullanım, sözdizimi, parametreler ve isteğe bağlı örnek tablo */
export type FunctionDef = {
  name: string;
  use: string;
  /** Örn: =EĞER(mantıksal_sınama; doğruysa_değer; yanlışsa_değer) */
  syntax?: string;
  /** Parametre adı ve kısa açıklaması */
  params?: { name: string; description: string }[];
};

/** Seviyeye / konuya göre uygulama alıştırmaları */
const practiceDefs: Record<string, PracticeGridDef> = {
  temelHesaplama: {
    instruction:
      "A1:A5 aralığındaki sayılar için B sütunundaki hücrelere sırasıyla TOPLA, ORTALAMA, MİN, MAKS ve SAY formüllerini yazın. Her formülde aralık A1:A5 olmalı (örn. =TOPLA(A1:A5), =ORTALAMA(A1:A5)).",
    rows: 7,
    cols: 3,
    cells: {
      A1: { type: "label", value: "10" },
      A2: { type: "label", value: "20" },
      A3: { type: "label", value: "30" },
      A4: { type: "label", value: "40" },
      A5: { type: "label", value: "50" },
      B1: { type: "label", value: "Formül" },
      B2: {
        type: "editable",
        expected: "=TOPLA(A1:A5)",
        hint: "Toplam için =TOPLA(A1:A5) yazın.",
      },
      B3: {
        type: "editable",
        expected: "=ORTALAMA(A1:A5)",
        hint: "Ortalama için =ORTALAMA(A1:A5) yazın.",
      },
      B4: {
        type: "editable",
        expected: "=MİN(A1:A5)",
        expectedAlternatives: ["=MIN(A1:A5)"],
        hint: "En küçük değer için =MİN(A1:A5) veya =MIN(A1:A5) yazın.",
      },
      B5: {
        type: "editable",
        expected: "=MAKS(A1:A5)",
        expectedAlternatives: ["=MAX(A1:A5)"],
        hint: "En büyük değer için =MAKS(A1:A5) veya =MAX(A1:A5) yazın.",
      },
      B6: {
        type: "editable",
        expected: "=SAY(A1:A5)",
        hint: "Sayı adedi için =SAY(A1:A5) yazın.",
      },
    },
  },
  egerOrnek: {
    instruction:
      "A2 hücresindeki puan 50 ve üzeriyse B2'de \"Geçti\", değilse \"Kaldı\" yazacak EĞER formülünü yazın. B1'e açıklama olarak \"Sonuç\" yazılmıştır.",
    rows: 3,
    cols: 3,
    cells: {
      A1: { type: "label", value: "Puan" },
      B1: { type: "label", value: "Sonuç" },
      A2: { type: "label", value: "75" },
      B2: {
        type: "editable",
        expected: '=EĞER(A2>=50;"Geçti";"Kaldı")',
        expectedAlternatives: ['=IF(A2>=50;"Geçti";"Kaldı")'],
        hint: '=EĞER(A2>=50;"Geçti";"Kaldı") yazın. Koşul: A2>=50, doğruysa "Geçti", yanlışsa "Kaldı".',
      },
    },
  },
  metinTemel: {
    instruction:
      "A2 hücresindeki \"Excel\" metninden: B2'de son 2 karakteri (el) alacak SAĞ, C2'de ilk 2 karakteri (Ex) alacak SOL formülünü yazın.",
    rows: 3,
    cols: 4,
    cells: {
      A1: { type: "label", value: "Metin" },
      B1: { type: "label", value: "Son 2" },
      C1: { type: "label", value: "İlk 2" },
      A2: { type: "label", value: "Excel" },
      B2: {
        type: "editable",
        expected: "=SAĞ(A2;2)",
        expectedAlternatives: ["=RIGHT(A2;2)"],
        hint: "Son 2 karakter için =SAĞ(A2;2) yazın.",
      },
      C2: {
        type: "editable",
        expected: "=SOL(A2;2)",
        expectedAlternatives: ["=LEFT(A2;2)"],
        hint: "İlk 2 karakter için =SOL(A2;2) yazın.",
      },
    },
  },
  egersayOrnek: {
    instruction:
      "A1:A5 aralığında 50'den büyük kaç sayı olduğunu B1 hücresinde EĞERSAY ile bulun. Kriter: \">50\".",
    rows: 6,
    cols: 3,
    cells: {
      A1: { type: "label", value: "45" },
      A2: { type: "label", value: "52" },
      A3: { type: "label", value: "60" },
      A4: { type: "label", value: "38" },
      A5: { type: "label", value: "55" },
      B1: {
        type: "editable",
        expected: '=EĞERSAY(A1:A5;">50")',
        expectedAlternatives: ['=COUNTIF(A1:A5;">50")'],
        hint: '=EĞERSAY(A1:A5;">50") yazın.',
      },
    },
  },
  duseyaraOrnek: {
    instruction:
      "D1'deki koda (2) göre A2:B4 tablosundan ürün adını E1 hücresine DÜŞEYARA ile getirin. Aranacak sütun 1, sonuç sütunu 2.",
    rows: 5,
    cols: 5,
    cells: {
      A1: { type: "label", value: "Kod" },
      B1: { type: "label", value: "Ürün" },
      A2: { type: "label", value: "1" },
      B2: { type: "label", value: "Elma" },
      A3: { type: "label", value: "2" },
      B3: { type: "label", value: "Armut" },
      A4: { type: "label", value: "3" },
      B4: { type: "label", value: "Muz" },
      D1: { type: "label", value: "2" },
      E1: {
        type: "editable",
        expected: "=DÜŞEYARA(D1;A2:B4;2;0)",
        expectedAlternatives: ["=DÜŞEYARA(D1;A2:B4;2;YANLIŞ)", "=VLOOKUP(D1;A2:B4;2;0)"],
        hint: "=DÜŞEYARA(D1;A2:B4;2;0) — aranan: D1, tablo: A2:B4, sütun no: 2, tam eşleşme: 0 veya YANLIŞ.",
      },
    },
  },
  metinBirlestir: {
    instruction:
      "A2 (Ad) ve B2 (Soyad) hücrelerini tek hücrede, araya boşluk koyarak birleştirin. Sonucu C2'de BİRLEŞTİR ile yazın.",
    rows: 3,
    cols: 4,
    cells: {
      A1: { type: "label", value: "Ad" },
      B1: { type: "label", value: "Soyad" },
      C1: { type: "label", value: "Ad Soyad" },
      A2: { type: "label", value: "Ayşe" },
      B2: { type: "label", value: "Yılmaz" },
      C2: {
        type: "editable",
        expected: '=BİRLEŞTİR(A2;" ";B2)',
        expectedAlternatives: ['=CONCATENATE(A2;" ";B2)', '=A2&" "&B2'],
        hint: '=BİRLEŞTİR(A2;" ";B2) — araya boşluk koyarak birleştirir.',
      },
    },
  },
  tarihOrnek: {
    instruction:
      "A2'deki tarih değerinden GÜN, AY ve YIL ile gün, ay ve yıl sayısını B2, C2, D2 hücrelerine yazın. (Tarih 15.03.2025 olarak girilmiş; Excel'de tarih sayı olarak saklanır.)",
    rows: 3,
    cols: 5,
    cells: {
      A1: { type: "label", value: "Tarih" },
      B1: { type: "label", value: "Gün" },
      C1: { type: "label", value: "Ay" },
      D1: { type: "label", value: "Yıl" },
      A2: { type: "label", value: "15.03.2025" },
      B2: {
        type: "editable",
        expected: "=GÜN(A2)",
        expectedAlternatives: ["=DAY(A2)"],
        hint: "Gün sayısı için =GÜN(A2) yazın.",
      },
      C2: {
        type: "editable",
        expected: "=AY(A2)",
        expectedAlternatives: ["=MONTH(A2)"],
        hint: "Ay sayısı için =AY(A2) yazın.",
      },
      D2: {
        type: "editable",
        expected: "=YIL(A2)",
        expectedAlternatives: ["=YEAR(A2)"],
        hint: "Yıl için =YIL(A2) yazın.",
      },
    },
  },
  duseyaraEgerhata: {
    instruction:
      "D1'deki koda göre A2:B4 tablosundan ürün adını E1'e DÜŞEYARA ile getirin; bulunamazsa \"-\" gösterin. EĞERHATA ile sarmalayın.",
    rows: 5,
    cols: 5,
    cells: {
      A1: { type: "label", value: "Kod" },
      B1: { type: "label", value: "Ürün" },
      A2: { type: "label", value: "1" },
      B2: { type: "label", value: "Elma" },
      A3: { type: "label", value: "2" },
      B3: { type: "label", value: "Armut" },
      A4: { type: "label", value: "3" },
      B4: { type: "label", value: "Muz" },
      D1: { type: "label", value: "5" },
      E1: {
        type: "editable",
        expected: '=EĞERHATA(DÜŞEYARA(D1;A2:B4;2;0);"-")',
        expectedAlternatives: ['=IFERROR(VLOOKUP(D1;A2:B4;2;0);"-")'],
        hint: '=EĞERHATA(DÜŞEYARA(D1;A2:B4;2;0);"-") — hata olursa "-" gösterir.',
      },
    },
  },
};

/** Grup başlığı → uygulama alıştırma anahtarı (practiceDefs'teki key) */
const practiceByGroupTitle: Record<string, { key: string; label: string }> = {
  "Temel Hesaplama Fonksiyonları": { key: "temelHesaplama", label: "Uygulama: Topla, Ortalama, Min/Maks, Say" },
  "Karar & Mantık Fonksiyonları": { key: "egerOrnek", label: "Uygulama: EĞER ile Geçti/Kaldı" },
  "Tablo, Filtre ve Temel Metin": { key: "metinTemel", label: "Uygulama: SAĞ ve SOL ile metin parçası" },
  "Arama & Getirme Fonksiyonları": { key: "duseyaraOrnek", label: "Uygulama: DÜŞEYARA ile tablodan getirme" },
  "Koşullu Toplama & Sayma": { key: "egersayOrnek", label: "Uygulama: EĞERSAY ile koşullu sayma" },
  "Metinle Çalışma": { key: "metinBirlestir", label: "Uygulama: BİRLEŞTİR ile Ad Soyad" },
  "Tarih & Saat Fonksiyonları": { key: "tarihOrnek", label: "Uygulama: GÜN, AY, YIL ile tarih parçalama" },
  "Hata Yönetimi & Kombinasyonlar": { key: "duseyaraEgerhata", label: "Uygulama: DÜŞEYARA + EĞERHATA" },
};

/** Seviyeye göre Excel'e eklenecek sayfa listesi (grup başlığı → practice key ve sayfa adı) */
function getLevelPracticeSheets(levelKey: LevelKey): { groupTitle: string; practiceKey: string; sheetName: string }[] {
  const groups = levelConfig[levelKey].functionGroups;
  const out: { groupTitle: string; practiceKey: string; sheetName: string }[] = [];
  for (const g of groups) {
    const p = practiceByGroupTitle[g.title];
    if (p) out.push({ groupTitle: g.title, practiceKey: p.key, sheetName: g.title.replace(/&/g, " ve ") });
  }
  return out;
}

/** İleri seviye için uygulama örneği olan ama practiceDef olmayan gruplar: Excel'e eklenecek ek sayfalar */
const ileriEkSayfalar: SheetFromTable[] = [
  {
    sheetName: "PivotTable Ornek Veri",
    rows: 5,
    cols: 3,
    cells: {
      A1: "Tarih",
      B1: "Ürün",
      C1: "Tutar",
      A2: "01.01.2025",
      B2: "Elma",
      C2: "100",
      A3: "01.01.2025",
      B3: "Armut",
      C3: "150",
      A4: "02.01.2025",
      B4: "Elma",
      C4: "120",
      A5: "02.01.2025",
      B5: "Muz",
      C5: "80",
    },
  },
  {
    sheetName: "Filtre Siralar Benzersiz",
    rows: 6,
    cols: 2,
    cells: {
      A1: "Ürün",
      B1: "Adet",
      A2: "Elma",
      B2: "10",
      A3: "Armut",
      B3: "5",
      A4: "Elma",
      B4: "8",
      A5: "Muz",
      B5: "12",
      A6: "Armut",
      B6: "3",
    },
  },
];

const levelConfig = {
  temel: {
    slug: "temel",
    label: "Seviye 1 · Temel",
    title: "Temel Excel Akışı",
    description:
      "Excel'e yeni başlayanlar veya temellerini sağlamlaştırmak isteyenler için. Günlük ofis işlerinde en çok kullandığın temel fonksiyonları, tablo yapısını ve veri temizlemeyi öğrenirsin.",
    target: "Excel'e yeni başlayanlar veya temellerini toparlamak isteyenler",
    focus: [
      "Temel hesaplama fonksiyonları ile güvenilir toplamalar ve ortalamalar",
      "EĞER ile basit karar mekanizmaları kurma",
      "Tablo yapısı, filtreleme ve sıralama ile veriyi okunur hale getirme",
    ],
    functionGroups: [
      {
        title: "Temel Hesaplama Fonksiyonları",
        description:
          "Günlük raporlar, özet tablolar ve hızlı kontroller için en çok kullanılan fonksiyonlar.",
        functions: [
          {
            name: "TOPLA",
            use: "Seçili hücre aralığındaki sayıları toplar.",
            syntax: "=TOPLA(aralık)",
            params: [
              { name: "aralık", description: "Toplanacak hücre aralığı (örn. A1:A10)." },
            ],
          },
          {
            name: "ORTALAMA",
            use: "Bir sayı grubunun aritmetik ortalamasını alır.",
            syntax: "=ORTALAMA(aralık)",
            params: [
              { name: "aralık", description: "Ortalaması alınacak hücre aralığı." },
            ],
          },
          {
            name: "MİN / MAKS",
            use: "Bir aralıktaki en küçük ve en büyük değeri bulur.",
            syntax: "=MİN(aralık)  veya  =MAKS(aralık)",
            params: [
              { name: "aralık", description: "En küçük veya en büyük değerin aranacağı hücre aralığı." },
            ],
          },
          {
            name: "SAY",
            use: "Sayı içeren hücrelerin sayısını verir.",
            syntax: "=SAY(aralık)",
            params: [
              { name: "aralık", description: "Sayılacak hücre aralığı; yalnızca sayı içeren hücreler sayılır." },
            ],
          },
        ],
      },
      {
        title: "Karar & Mantık Fonksiyonları",
        description:
          "Basit kurallara göre çıktılar üretmek ve hataları daha iyi yönetmek için.",
        functions: [
          {
            name: "EĞER",
            use: "Bir koşul doğruysa A, yanlışsa B sonucunu döndürür.",
            syntax: "=EĞER(mantıksal_sınama; doğruysa_değer; yanlışsa_değer)",
            params: [
              { name: "mantıksal_sınama", description: "Doğru veya yanlış sonuç veren koşul (örn. A2>=50)." },
              { name: "doğruysa_değer", description: "Koşul doğruysa döndürülecek değer veya metin." },
              { name: "yanlışsa_değer", description: "Koşul yanlışsa döndürülecek değer veya metin." },
            ],
          },
          {
            name: "VE / VEYA (giriş)",
            use: "Birden fazla koşulu aynı anda kontrol etmeye giriş seviyesi.",
            syntax: "=VE(koşul1; koşul2; ...)  veya  =VEYA(koşul1; koşul2; ...)",
            params: [
              { name: "koşul1, koşul2, ...", description: "VE: hepsi doğruysa DOĞRU. VEYA: en az biri doğruysa DOĞRU." },
            ],
          },
          {
            name: "EĞERHATA (giriş)",
            use: "Formül hata verdiğinde daha okunabilir bir çıktı üretir.",
            syntax: "=EĞERHATA(değer; hata_ise_değer)",
            params: [
              { name: "değer", description: "Kontrol edilecek formül veya ifade." },
              { name: "hata_ise_değer", description: "Hata oluşursa gösterilecek değer (örn. \"-\" veya \"Bulunamadı\")." },
            ],
          },
        ],
      },
      {
        title: "Tablo, Filtre ve Temel Metin",
        description:
          "Veriyi tabloya dönüştürerek ve basit metin fonksiyonları ile temizleyerek analize hazır hale getirirsin.",
        functions: [
          {
            name: "Tabloya Dönüştür (Ctrl+T)",
            use: "Dinamik tablo yapısı, filtre ve sıralama için temel adım.",
            syntax: "Kısayol: Ctrl+T (tablo olarak biçimlendir).",
            params: [],
          },
          {
            name: "FİLTRELE / SIRALA (arayüz)",
            use: "Listeyi istediğin kritere göre daraltır veya sıralar.",
            syntax: "Veri sekmesi → Filtrele veya Sırala (arayüz komutları).",
            params: [],
          },
          {
            name: "SAĞ / SOL / UZUNLUK (giriş)",
            use: "Hücredeki metnin belirli kısımlarını almak veya uzunluğunu ölçmek için.",
            syntax: "=SAĞ(metin; karakter_sayısı)  =SOL(metin; karakter_sayısı)  =UZUNLUK(metin)",
            params: [
              { name: "metin", description: "İşlenecek metin veya metin içeren hücre." },
              { name: "karakter_sayısı", description: "SAĞ/SOL için alınacak karakter sayısı. UZUNLUK'ta yok; metnin uzunluğu döner." },
            ],
          },
        ],
      },
    ],
  },
  orta: {
    slug: "orta",
    label: "Seviye 2 · Orta",
    title: "İş Hayatında En Çok Kullandığın Formüller",
    description:
      "Raporlarını otomatikleştirmek, listeler arasında arama yapmak ve koşullu özetler kurmak için gereken orta seviye fonksiyonlar.",
    target:
      "Excel'i aktif kullanan, raporlarını daha otomatik ve hatasız hale getirmek isteyenler",
    focus: [
      "Farklı listeler arasında veri çekme (müşteri, ürün, satış vb.)",
      "Koşullu toplama ve sayma ile otomatik özetler",
      "Metin fonksiyonlarıyla veriyi temiz ve analiz edilebilir hale getirme",
    ],
    functionGroups: [
      {
        title: "Arama & Getirme Fonksiyonları",
        description:
          "Farklı sayfalardaki veya tablolardaki verileri tek bir raporda birleştirirsin.",
        functions: [
          {
            name: "DÜŞEYARA",
            use: "Bir anahtara göre tablodan ilgili bilgiyi çeker.",
            syntax: "=DÜŞEYARA(aranan_değer; tablo_aralığı; sütun_indisi; [aralık_bak])",
            params: [
              { name: "aranan_değer", description: "Aranacak değer (örn. ürün kodu)." },
              { name: "tablo_aralığı", description: "Aramanın yapılacağı tablo aralığı (örn. A2:D100)." },
              { name: "sütun_indisi", description: "Sonuç olarak getirilecek sütunun tablodaki numarası (1, 2, 3...)." },
              { name: "aralık_bak", description: "0 veya YANLIŞ = tam eşleşme; 1 veya DOĞRU = yaklaşık eşleşme (sıralı liste gerekir)." },
            ],
          },
          {
            name: "XLOOKUP",
            use: "DÜŞEYARA'nın daha esnek, modern ve hata toleranslı versiyonu.",
            syntax: "=XLOOKUP(aranan; arama_aralığı; dönüş_aralığı; [bulunamazsa]; [eşleşme_türü])",
            params: [
              { name: "aranan", description: "Aranacak değer." },
              { name: "arama_aralığı", description: "Aranan değerin aranacağı aralık." },
              { name: "dönüş_aralığı", description: "Sonucun alınacağı aralık (arama_aralığı ile aynı boyutta)." },
              { name: "bulunamazsa", description: "Eşleşme yoksa gösterilecek değer (isteğe bağlı)." },
            ],
          },
          {
            name: "İNDİS + KAÇINCI",
            use: "Daha esnek arama senaryoları için ikili kombinasyon.",
            syntax: "=İNDİS(dizi; satır_no; [sütun_no])  ve  =KAÇINCI(aranan; dizi; [eşleşme_türü])",
            params: [
              { name: "dizi", description: "İNDİS: sonuç alınacak aralık. KAÇINCI: aranacak tek sütun/satır." },
              { name: "satır_no / aranan", description: "İNDİS'te satır numarası; KAÇINCI'da aranan değer." },
              { name: "eşleşme_türü", description: "KAÇINCI'da 0=tam, 1=küçük eşit, -1=büyük eşit." },
            ],
          },
        ],
      },
      {
        title: "Koşullu Toplama & Sayma",
        description:
          "Sadece belirli kritere uyan satırları saymak veya toplamak için.",
        functions: [
          {
            name: "EĞERSAY",
            use: "Tek bir koşulu sağlayan hücreleri sayar.",
            syntax: "=EĞERSAY(aralık; ölçüt)",
            params: [
              { name: "aralık", description: "Sayılacak hücre aralığı." },
              { name: "ölçüt", description: "Koşul (sayı, metin veya \"\">50\"\", \"\"=Elma\"\" gibi ifade)." },
            ],
          },
          {
            name: "ÇOKETOPLA",
            use: "Birden fazla kritere göre toplam alır.",
            syntax: "=ÇOKETOPLA(toplam_aralığı; ölçüt_aralığı1; ölçüt1; [ölçüt_aralığı2; ölçüt2]; ...)",
            params: [
              { name: "toplam_aralığı", description: "Toplanacak sayıların bulunduğu aralık." },
              { name: "ölçüt_aralığı1, ölçüt1", description: "İlk koşul: hangi aralıkta, hangi değer aranacak." },
              { name: "ölçüt_aralığı2, ölçüt2, ...", description: "İkinci ve sonraki koşul çiftleri (isteğe bağlı)." },
            ],
          },
          {
            name: "ÇOKEĞERSAY",
            use: "Birden fazla koşulu sağlayan satırların sayısını bulur.",
            syntax: "=ÇOKEĞERSAY(ölçüt_aralığı1; ölçüt1; [ölçüt_aralığı2; ölçüt2]; ...)",
            params: [
              { name: "ölçüt_aralığı1, ölçüt1", description: "İlk koşul: aralık ve kriter." },
              { name: "ölçüt_aralığı2, ölçüt2, ...", description: "Diğer koşul çiftleri; tüm koşulları sağlayan satırlar sayılır." },
            ],
          },
        ],
      },
      {
        title: "Metinle Çalışma",
        description:
          "CRM, ERP veya dış sistemlerden gelen karışık metinleri temizlemek için.",
        functions: [
          {
            name: "SAĞ / SOL / PARÇAAL",
            use: "Metnin belirli kısmını çekmek için.",
            syntax: "=SAĞ(metin; karakter_sayısı)  =SOL(metin; karakter_sayısı)  =PARÇAAL(metin; başlangıç; uzunluk)",
            params: [
              { name: "metin", description: "İşlenecek metin veya hücre." },
              { name: "karakter_sayısı / başlangıç / uzunluk", description: "SAĞ/SOL: kaç karakter. PARÇAAL: hangi pozisyondan, kaç karakter." },
            ],
          },
          {
            name: "BİRLEŞTİR / METNEBİRLEŞTİR",
            use: "Birden fazla hücredeki metni tek hücrede birleştirir.",
            syntax: "=BİRLEŞTİR(metin1; [metin2]; ...)  veya  =METNEBİRLEŞTİR(ayırıcı; boş_atla; metin1; [metin2]; ...)",
            params: [
              { name: "metin1, metin2, ...", description: "Birleştirilecek metinler veya hücreler; araya virgül/boşluk eklenebilir." },
              { name: "ayırıcı (METNEBİRLEŞTİR)", description: "Metinler arasına konacak karakter (örn. \" \", \";\")." },
            ],
          },
          {
            name: "UZUNLUK",
            use: "Metin uzunluğunu kontrol ederek veri kalitesini ölçmek için.",
            syntax: "=UZUNLUK(metin)",
            params: [
              { name: "metin", description: "Uzunluğu sayılacak metin veya hücre (boşluklar dahil karakter sayısı)." },
            ],
          },
        ],
      },
      {
        title: "Tarih & Saat Fonksiyonları",
        description:
          "Satış, abonelik, vade ve performans analizleri için tarih bazlı hesaplamalar.",
        functions: [
          {
            name: "BUGÜN / ŞİMDİ",
            use: "Raporlarını güncel tarihe göre dinamik hale getirir.",
            syntax: "=BUGÜN()  veya  =ŞİMDİ()",
            params: [
              { name: "parametre yok", description: "BUGÜN sadece tarihi, ŞİMDİ tarih ve saati verir; her hesaplamada güncellenir." },
            ],
          },
          {
            name: "GÜN / AY / YIL",
            use: "Tarih içinden istediğin bileşeni çekmek için.",
            syntax: "=GÜN(seri_no)  =AY(seri_no)  =YIL(seri_no)",
            params: [
              { name: "seri_no", description: "Tarih içeren hücre veya geçerli bir tarih değeri; GÜN/AY/YIL o bileşeni sayı olarak döndürür." },
            ],
          },
          {
            name: "EDATE (giriş)",
            use: "Belirli bir tarihe ay ekleyerek vade/son tarih hesaplar.",
            syntax: "=EDATE(başlangıç_tarihi; ay_sayısı)",
            params: [
              { name: "başlangıç_tarihi", description: "Başlangıç tarihi (hücre veya tarih)." },
              { name: "ay_sayısı", description: "Eklenecek ay sayısı (negatif olursa geriye gider)." },
            ],
          },
        ],
      },
    ],
  },
  ileri: {
    slug: "ileri",
    label: "Seviye 3 · İleri",
    title: "PivotTable, Dashboard & Veri Analizi",
    description:
      "Büyük veri setleriyle çalışıp, yönetime sunabileceğin gösterge panelleri ve etkileşimli raporlar hazırlamak için.",
    target:
      "Raporlama, finans, satış, operasyon gibi alanlarda düzenli rapor üreten ve analiz yapanlar",
    focus: [
      "PivotTable ile esnek özet raporlar ve kırılımlar",
      "Dashboard mantığıyla tek sayfada net özetler hazırlama",
      "Gelişmiş fonksiyonlarla dinamik analiz alanları oluşturma",
    ],
    functionGroups: [
      {
        title: "PivotTable ve Özetleme",
        description:
          "Ham veriyi bozmadan farklı bakış açılarıyla analiz etmeni sağlar.",
        functions: [
          {
            name: "PivotTable",
            use: "Sürükle-bırak mantığı ile esnek özet tablolar kurar.",
            syntax: "Ekle sekmesi → PivotTable; satır/sütun/değer alanlarını sürükleyerek özet oluştur.",
            params: [],
          },
          {
            name: "Dilimleyiciler & Zaman Çizelgesi",
            use: "Raporu filtrelemek için etkileşimli butonlar ekler.",
            syntax: "PivotTable Araçları → Analiz → Dilimleyici Ekle veya Zaman Çizelgesi.",
            params: [],
          },
          {
            name: "Hesaplanan Alan (giriş)",
            use: "Pivot içinde ek formüllerle özel metrikler üretir.",
            syntax: "PivotTable Araçları → Analiz → Alanlar, Öğeler ve Kümeler → Hesaplanan Alan.",
            params: [
              { name: "Formül", description: "Pivot alanları kullanarak yazılan özel hesaplama (örn. satış/aded oranı)." },
            ],
          },
        ],
      },
      {
        title: "Dinamik Dizi & Gelişmiş Fonksiyonlar",
        description:
          "Büyük listelerde otomatik filtreleme, sıralama ve benzersiz değer analizi için.",
        functions: [
          {
            name: "FİLTRE",
            use: "Belirli kritere uyan satırları dinamik olarak süzer.",
            syntax: "=FİLTRE(dizi; koşul; [boşsa])",
            params: [
              { name: "dizi", description: "Filtrelenecek aralık (satırlar veya sütunlar)." },
              { name: "koşul", description: "Her satır/sütun için DOĞRU/YANLIŞ dönen mantıksal dizi (örn. A2:A10>50)." },
              { name: "boşsa", description: "Hiç eşleşme yoksa gösterilecek değer (isteğe bağlı)." },
            ],
          },
          {
            name: "SIRALA",
            use: "Sonuç listesini artan/azalan şekilde sıralar.",
            syntax: "=SIRALA(dizi; [sıralama_indisi]; [sıralama_sırası])",
            params: [
              { name: "dizi", description: "Sıralanacak aralık." },
              { name: "sıralama_indisi", description: "Hangi sütuna göre sıralanacak (varsayılan ilk sütun)." },
              { name: "sıralama_sırası", description: "1 = artan, -1 = azalan." },
            ],
          },
          {
            name: "BENZERSİZ",
            use: "Tekrarsız liste çıkararak müşteri/ürün/kanal listeleri oluşturur.",
            syntax: "=BENZERSİZ(dizi; [sütun_bazlı]; [yalnızca_bir_kez])",
            params: [
              { name: "dizi", description: "Benzersiz değerlerin alınacağı aralık." },
              { name: "sütun_bazlı", description: "YANLIŞ = satır bazlı, DOĞRU = sütun bazlı (isteğe bağlı)." },
              { name: "yalnızca_bir_kez", description: "DOĞRU = yalnızca tek geçenleri ver (isteğe bağlı)." },
            ],
          },
        ],
      },
      {
        title: "Hata Yönetimi & Kombinasyonlar",
        description:
          "Gerçek ofis dosyalarında sık görülen karmaşık ama pratik kombinasyonlar.",
        functions: [
          {
            name: "DÜŞEYARA + EĞERHATA",
            use: "Bulunamayan kayıtlar için daha okunabilir sonuçlar verir.",
            syntax: "=EĞERHATA(DÜŞEYARA(aranan; tablo; sütun; 0); \"bulunamadı_metni\")",
            params: [
              { name: "DÜŞEYARA(...)", description: "Normal DÜŞEYARA formülü; bulunamazsa #YOK hatası verir." },
              { name: "bulunamadı_metni", description: "Hata durumunda (örn. kayıt yok) gösterilecek metin veya değer." },
            ],
          },
          {
            name: "İÇİÇE EĞER (ileri seviye)",
            use: "Birden fazla skala veya segment kuralını tek formülde toplar.",
            syntax: "=EĞER(koşul1; değer1; EĞER(koşul2; değer2; EĞER(koşul3; değer3; varsayılan)))",
            params: [
              { name: "koşul1, değer1, ...", description: "İlk koşul doğruysa değer1; değilse içteki EĞER değerlendirilir; böyle devam eder." },
            ],
          },
          {
            name: "VE / VEYA ile çoklu koşullar",
            use: "Raporlarında daha ince filtreler ve sinyaller kurmak için.",
            syntax: "=EĞER(VE(koşul1; koşul2); \"evet\"; \"hayır\")  veya  =EĞER(VEYA(koşul1; koşul2); \"evet\"; \"hayır\")",
            params: [
              { name: "koşul1, koşul2, ...", description: "VE: hepsi doğru olmalı. VEYA: en az biri doğru olmalı; sonucu EĞER ile değere çevirirsin." },
            ],
          },
        ],
      },
    ],
  },
} as const;

type LevelKey = keyof typeof levelConfig;

export default function TrainingLevelPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = use(params);
  const config = levelConfig[level as LevelKey];
  const levelKey = level as LevelKey;

  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfFallback, setPdfFallback] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    return () => {
      if (pdfFallback?.url) URL.revokeObjectURL(pdfFallback.url);
    };
  }, [pdfFallback?.url]);

  const handleDownloadExcel = useCallback(() => {
    const sheets = getLevelPracticeSheets(levelKey);
    const extraSheets = levelKey === "ileri" ? ileriEkSayfalar : [];
    const wb = buildLevelWorkbook(config.label, sheets, practiceDefs, extraSheets);
    const safeName = config.label.replace(/\s+/g, "-").replace(/·/g, "") + "-Ornekler.xlsx";
    downloadWorkbook(wb, safeName);
  }, [levelKey, config.label]);

  const handleDownloadPdf = useCallback(async () => {
    if (typeof window === "undefined") return;
    const el = pdfContentRef.current;
    if (!el) return;
    if (pdfFallback?.url) {
      URL.revokeObjectURL(pdfFallback.url);
    }
    setPdfFallback(null);
    setPdfLoading(true);
    try {
      // Öğenin boyutlarının hazır olması için birkaç frame / kısa bekleme
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 100));
      let h = el.scrollHeight || el.offsetHeight;
      let w = el.scrollWidth || el.offsetWidth;
      if (!h || !w) {
        console.warn("PDF: içerik alanı henüz boyutlanmamış, kısa bekleniyor…");
        await new Promise((r) => setTimeout(r, 300));
        h = el.scrollHeight || el.offsetHeight;
        w = el.scrollWidth || el.offsetWidth;
      }
      if (!h || !w) {
        console.warn("PDF: içerik alanı boyutlanamadı.");
        setPdfLoading(false);
        return;
      }
      const [{ default: h2c }, { default: JsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      // Yatay A4 oranı: 297×210 mm → 1122 px genişlik (96 dpi). Yakalama genişliğini buna sabitle.
      const a4LandscapeW = 1122;
      const canvas = await h2c(el, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        height: h,
        width: Math.max(w, a4LandscapeW),
        windowHeight: h,
        windowWidth: Math.max(w, a4LandscapeW),
        onclone: (clonedDoc, clonedEl) => {
          clonedEl.style.width = `${a4LandscapeW}px`;
          clonedEl.style.maxWidth = `${a4LandscapeW}px`;
          // html2canvas "lab"/"lch" renklerini desteklemiyor (Tailwind v4); hepsini rgb'ye çevir
          const colorProps = ["color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "fill", "stroke"] as const;
          const toRgb = (value: string): string | null => {
            if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") return null;
            if (!/lab\(|lch\(/i.test(value)) return null;
            try {
              const canvas = clonedDoc.createElement("canvas");
              canvas.width = 1;
              canvas.height = 1;
              const ctx = canvas.getContext("2d");
              if (!ctx) return null;
              ctx.fillStyle = value;
              ctx.fillRect(0, 0, 1, 1);
              const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
              return `rgb(${r},${g},${b})`;
            } catch {
              // Canvas lab/lch desteklemiyorsa Tailwind gri tonlarına yakın yedek
              return "rgb(75, 85, 99)";
            }
          };
          const camelToKebab = (s: string) => s.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
          const walk = (el: Element) => {
            const style = clonedDoc.defaultView?.getComputedStyle(el);
            if (style) {
              for (const prop of colorProps) {
                const value = style.getPropertyValue(camelToKebab(prop));
                if (value) {
                  const rgb = toRgb(value);
                  if (rgb) (el as HTMLElement).style[prop] = rgb;
                }
              }
            }
            el.querySelectorAll("*").forEach(walk);
          };
          walk(clonedEl);
          // SVG'lerin canvas'ta çizilmesi için boyutlarını zorla
          clonedEl.querySelectorAll("svg").forEach((svg) => {
            svg.setAttribute("width", "24");
            svg.setAttribute("height", "24");
            if (!svg.getAttribute("stroke") || svg.getAttribute("stroke") === "currentColor") svg.setAttribute("stroke", "#374151");
          });
        },
      });
      const pdf = new JsPDF("l", "mm", "a4"); // yatay A4 (297×210 mm)
      const pageWidthMm = 297;
      const pageHeightMm = 210;
      const imgW = canvas.width;
      const imgH = canvas.height;
      // Ham sayfa yüksekliği (px)
      const rawPageHeightPx = Math.floor((pageHeightMm / pageWidthMm) * imgW);
      // Harflerin ortadan kesilmemesi için dilimi satır hizasına yuvarla (scale 2'de ~24–48px satır yüksekliği)
      const LINE_HEIGHT_PX = 24;
      const pageHeightPx = Math.floor(rawPageHeightPx / LINE_HEIGHT_PX) * LINE_HEIGHT_PX;
      const totalPages = Math.ceil(imgH / pageHeightPx);
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage([297, 210], "l");
        const sy = i * pageHeightPx;
        const sh = Math.min(pageHeightPx, imgH - sy);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = imgW;
        sliceCanvas.height = sh;
        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) {
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.88), "JPEG", 0, -i * pageHeightMm, pageWidthMm, imgH * (pageWidthMm / imgW));
          continue;
        }
        ctx.drawImage(canvas, 0, sy, imgW, sh, 0, 0, imgW, sh);
        const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.88);
        const sliceHeightMm = (sh / pageHeightPx) * pageHeightMm;
        pdf.addImage(sliceData, "JPEG", 0, 0, pageWidthMm, sliceHeightMm);
      }
      const safeName = config.label.replace(/\s+/g, "-").replace(/·/g, "") + "-Egitim-Ozeti.pdf";
      // Blob + programatik tıklama: linki document'a ekleyip tıklatmak birçok tarayıcıda gerekli
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Tarayıcı async sonrası programatik indirmeyi engelleyebilir; yedek olarak tıklanabilir link ver
      setPdfFallback({ url, name: safeName });
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setPdfFallback((prev) => (prev?.url === url ? null : prev));
      }, 60_000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PDF oluşturulamadı:", msg, err);
    } finally {
      setPdfLoading(false);
    }
  }, [config.label, pdfFallback?.url]);

  if (!config) {
    return (
      <div className="min-h-screen bg-[#e2e8ec]" style={{ fontFamily: THEME.font }}>
        <PageRibbon title="Eğitim bulunamadı" description="Bu seviye adresi geçerli değil." />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div
            className="rounded-b shadow-lg border border-t-0 p-6"
            style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
          >
            <p className="text-sm text-gray-600">
              Lütfen adres çubuğundaki seviyeyi kontrol edin veya{" "}
              <Link href="/#topics" className="font-medium underline" style={{ color: THEME.ribbon }}>
                Excel eğitim içerikleri
              </Link>{" "}
              bölümünden tekrar seçim yapın.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e2e8ec]" style={{ fontFamily: THEME.font }}>
      <PageRibbon
        title={config.title}
        description={config.description}
      />

      <main className="mx-auto max-w-6xl flex flex-col px-4 py-6 sm:px-6 lg:px-8 pb-10 min-h-screen">
        {/* Yatay A4 oranında içerik alanı (297×210) */}
        <div ref={pdfContentRef} className="space-y-4 mx-auto w-full max-w-[1122px] print:max-w-none pb-24">
        <div
          className="rounded-b shadow-lg border border-t-0 overflow-hidden"
          style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
        >
          <div className="grid gap-0 text-sm grid-cols-[1fr_1fr]">
            <div className="p-3 border-b sm:border-b-0 sm:border-r" style={{ borderColor: THEME.gridLine, background: THEME.headerBg }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">Kimler için?</h2>
              <p className="mt-1 text-gray-800 text-xs">{config.target}</p>
            </div>
            <div className="p-3" style={{ background: THEME.sheetBg, borderColor: THEME.gridLine }}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-600">Odak</h2>
              <ul className="mt-1 space-y-0.5 text-gray-700 text-xs">
                {config.focus.map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <span className="mt-[4px] h-1 w-1 flex-shrink-0 rounded-full bg-[#217346]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="px-4 py-2 border-t flex flex-wrap items-center gap-2" style={{ borderColor: THEME.gridLine, background: "#f0f4f8" }}>
            <span className="text-xs text-gray-600">Bu seviyedeki tüm uygulama örneklerini tek Excel dosyasında indir:</span>
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              style={{ background: THEME.ribbon }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.576a1 1 0 01.707.293l3.854 3.854a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {config.label} – Örnek Excel İndir
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={pdfLoading}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "#c53030" }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {pdfLoading ? "PDF hazırlanıyor…" : "PDF olarak indir"}
            </button>
            {pdfFallback && (
              <a
                href={pdfFallback.url}
                download={pdfFallback.name}
                onClick={() => {
                  setTimeout(() => {
                    URL.revokeObjectURL(pdfFallback.url);
                    setPdfFallback(null);
                  }, 500);
                }}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 transition"
              >
                PDF hazır — indirmek için tıklayın
              </a>
            )}
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {config.functionGroups.map((group) => (
            <article
              key={group.title}
              className="rounded-b shadow border border-t-0"
              style={{ borderColor: THEME.gridLine, background: "#fafafa" }}
            >
              <div className="px-4 py-2 border-b" style={{ background: THEME.headerBg, borderColor: THEME.gridLine }}>
                <h2 className="text-sm font-semibold text-gray-800 sm:text-base">{group.title}</h2>
                <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">{group.description}</p>
              </div>
              <div className="p-4 space-y-4">
                {group.functions.map((fn) => (
                  <div
                    key={fn.name}
                    className="rounded-lg border p-3 space-y-2"
                    style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: THEME.ribbon }}>
                        {fn.name}
                      </span>
                      {fn.name.includes("Ctrl+T") && (
                        <ShortcutIcon type="table" className="h-3.5 w-3.5 opacity-70" />
                      )}
                      {fn.syntax?.includes("Ctrl+X") && <ShortcutIcon type="cut" className="h-3.5 w-3.5 opacity-70" />}
                      {fn.syntax?.includes("Kes") && fn.syntax?.includes("Ctrl") && <ShortcutIcon type="cut" className="h-3.5 w-3.5 opacity-70" />}
                    </span>
                    <p className="text-xs text-gray-700">{fn.use}</p>
                    {fn.syntax && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold uppercase text-gray-500 mb-0.5">Yazım (sözdizimi)</p>
                        <code className="block text-xs bg-white border rounded px-2 py-1.5 break-all" style={{ borderColor: THEME.gridLine }}>
                          {fn.syntax}
                        </code>
                      </div>
                    )}
                    {fn.params && fn.params.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[10px] font-semibold uppercase text-gray-500 mb-1">Parametreler</p>
                        <ul className="space-y-0.5 text-xs text-gray-700">
                          {fn.params.map((p) => (
                            <li key={p.name}>
                              <span className="font-medium text-gray-800">{p.name}:</span> {p.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Uygulama: bu grupta tanımlı alıştırma varsa Excel benzeri grid; yoksa indirilen Excel'e yönlendir */}
              {practiceByGroupTitle[group.title] ? (() => {
                const { key, label } = practiceByGroupTitle[group.title];
                const def = practiceDefs[key];
                if (!def) return null;
                return (
                  <div key={key} className="px-4 pb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                      {label}
                    </h3>
                    <ExcelPracticeGrid def={def} />
                  </div>
                );
              })() : levelKey === "ileri" && (group.title === "PivotTable ve Özetleme" || group.title === "Dinamik Dizi & Gelişmiş Fonksiyonlar") ? (
                <div className="px-4 pb-4 py-3 rounded border text-sm text-gray-600" style={{ borderColor: THEME.gridLine, background: THEME.sheetBg }}>
                  <p className="font-medium text-gray-700">Uygulama</p>
                  <p className="mt-1">
                    Bu gruptaki araçlar için örnek veri, sayfa başındaki <strong>Örnek Excel İndir</strong> butonuyla indirdiğiniz dosyada yer alır: PivotTable için &quot;PivotTable Ornek Veri&quot;, FİLTRE/SIRALA/BENZERSİZ için &quot;Filtre Siralar Benzersiz&quot; sayfasını kullanabilirsiniz.
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </section>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">Ofis Akademi · Excel & Veri Analizi</div>
      </main>
    </div>
  );
}

