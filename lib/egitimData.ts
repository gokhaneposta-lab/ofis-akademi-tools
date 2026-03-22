import type { PracticeGridDef } from "@/components/ExcelPracticeGrid";
import type { SheetFromTable } from "@/lib/egitimExcelExport";

export type FunctionDef = {
  name: string;
  use: string;
  syntax?: string;
  params?: { name: string; description: string }[];
};

export type FunctionGroup = {
  title: string;
  description: string;
  image?: string;
  functions: FunctionDef[];
};

export type LevelConfig = {
  slug: string;
  label: string;
  title: string;
  description: string;
  target: string;
  focus: string[];
  functionGroups: FunctionGroup[];
};

export type LevelKey = "temel" | "orta" | "ileri";

/* ─────────────────────────────────────────────
   PRACTICE DEFS – interaktif alıştırmalar
   ───────────────────────────────────────────── */

export const practiceDefs: Record<string, PracticeGridDef> = {
  /* ── TEMEL ── */
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
      B2: { type: "editable", expected: "=TOPLA(A1:A5)", hint: "Toplam için =TOPLA(A1:A5) yazın." },
      B3: { type: "editable", expected: "=ORTALAMA(A1:A5)", hint: "Ortalama için =ORTALAMA(A1:A5) yazın." },
      B4: { type: "editable", expected: "=MİN(A1:A5)", expectedAlternatives: ["=MIN(A1:A5)"], hint: "En küçük değer için =MİN(A1:A5) veya =MIN(A1:A5) yazın." },
      B5: { type: "editable", expected: "=MAKS(A1:A5)", expectedAlternatives: ["=MAX(A1:A5)"], hint: "En büyük değer için =MAKS(A1:A5) veya =MAX(A1:A5) yazın." },
      B6: { type: "editable", expected: "=SAY(A1:A5)", hint: "Sayı adedi için =SAY(A1:A5) yazın." },
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
      B2: { type: "editable", expected: '=EĞER(A2>=50;"Geçti";"Kaldı")', expectedAlternatives: ['=IF(A2>=50;"Geçti";"Kaldı")'], hint: '=EĞER(A2>=50;"Geçti";"Kaldı") yazın. Koşul: A2>=50, doğruysa "Geçti", yanlışsa "Kaldı".' },
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
      B2: { type: "editable", expected: "=SAĞ(A2;2)", expectedAlternatives: ["=RIGHT(A2;2)"], hint: "Son 2 karakter için =SAĞ(A2;2) yazın." },
      C2: { type: "editable", expected: "=SOL(A2;2)", expectedAlternatives: ["=LEFT(A2;2)"], hint: "İlk 2 karakter için =SOL(A2;2) yazın." },
    },
  },
  temelReferans: {
    instruction:
      "B1 hücresinde KDV oranı (%20) var. B2'de A2 fiyatını KDV ile çarpın ama B1 sabit kalsın (mutlak referans). B3, B4 için de aynı formülü yazın.",
    rows: 5,
    cols: 3,
    cells: {
      A1: { type: "label", value: "Fiyat" },
      B1: { type: "label", value: "0,20" },
      C1: { type: "label", value: "KDV Tutarı" },
      A2: { type: "label", value: "100" },
      A3: { type: "label", value: "250" },
      A4: { type: "label", value: "500" },
      B2: { type: "editable", expected: "=A2*$B$1", expectedAlternatives: ["=A2*B$1"], hint: "=A2*$B$1 yazın. $B$1 mutlak referans: kopyalarken sabit kalır." },
      B3: { type: "editable", expected: "=A3*$B$1", expectedAlternatives: ["=A3*B$1"], hint: "=A3*$B$1 yazın." },
      B4: { type: "editable", expected: "=A4*$B$1", expectedAlternatives: ["=A4*B$1"], hint: "=A4*$B$1 yazın." },
    },
  },

  /* ── ORTA ── */
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
      B1: { type: "editable", expected: '=EĞERSAY(A1:A5;">50")', expectedAlternatives: ['=COUNTIF(A1:A5;">50")'], hint: '=EĞERSAY(A1:A5;">50") yazın.' },
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
      E1: { type: "editable", expected: "=DÜŞEYARA(D1;A2:B4;2;0)", expectedAlternatives: ["=DÜŞEYARA(D1;A2:B4;2;YANLIŞ)", "=VLOOKUP(D1;A2:B4;2;0)"], hint: "=DÜŞEYARA(D1;A2:B4;2;0) — aranan: D1, tablo: A2:B4, sütun no: 2, tam eşleşme: 0 veya YANLIŞ." },
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
      C2: { type: "editable", expected: '=BİRLEŞTİR(A2;" ";B2)', expectedAlternatives: ['=CONCATENATE(A2;" ";B2)', '=A2&" "&B2'], hint: '=BİRLEŞTİR(A2;" ";B2) — araya boşluk koyarak birleştirir.' },
    },
  },
  tarihOrnek: {
    instruction:
      "A2'deki tarih değerinden GÜN, AY ve YIL ile gün, ay ve yıl sayısını B2, C2, D2 hücrelerine yazın.",
    rows: 3,
    cols: 5,
    cells: {
      A1: { type: "label", value: "Tarih" },
      B1: { type: "label", value: "Gün" },
      C1: { type: "label", value: "Ay" },
      D1: { type: "label", value: "Yıl" },
      A2: { type: "label", value: "15.03.2025" },
      B2: { type: "editable", expected: "=GÜN(A2)", expectedAlternatives: ["=DAY(A2)"], hint: "Gün sayısı için =GÜN(A2) yazın." },
      C2: { type: "editable", expected: "=AY(A2)", expectedAlternatives: ["=MONTH(A2)"], hint: "Ay sayısı için =AY(A2) yazın." },
      D2: { type: "editable", expected: "=YIL(A2)", expectedAlternatives: ["=YEAR(A2)"], hint: "Yıl için =YIL(A2) yazın." },
    },
  },
  ortaIcIceEger: {
    instruction:
      "A2'deki puana göre B2'de harf notu hesaplayın: 90+ → \"A\", 80-89 → \"B\", 70-79 → \"C\", 60-69 → \"D\", 60 altı → \"F\". İç içe EĞER kullanın.",
    rows: 3,
    cols: 3,
    cells: {
      A1: { type: "label", value: "Puan" },
      B1: { type: "label", value: "Not" },
      A2: { type: "label", value: "85" },
      B2: {
        type: "editable",
        expected: '=EĞER(A2>=90;"A";EĞER(A2>=80;"B";EĞER(A2>=70;"C";EĞER(A2>=60;"D";"F"))))',
        expectedAlternatives: ['=IF(A2>=90;"A";IF(A2>=80;"B";IF(A2>=70;"C";IF(A2>=60;"D";"F"))))'],
        hint: '=EĞER(A2>=90;"A";EĞER(A2>=80;"B";EĞER(A2>=70;"C";EĞER(A2>=60;"D";"F")))) — büyükten küçüğe kontrol edin.',
      },
    },
  },
  ortaYuvarlama: {
    instruction:
      "A2'deki 127,856 sayısını: B2'de 2 ondalığa yuvarla (YUVARLAK), C2'de yukarı yuvarla (YUKARIYUVARLA, 0 ondalık), D2'de aşağı yuvarla (AŞAĞIYUVARLA, 0 ondalık).",
    rows: 3,
    cols: 5,
    cells: {
      A1: { type: "label", value: "Tutar" },
      B1: { type: "label", value: "Yuvarlak(2)" },
      C1: { type: "label", value: "Yukarı(0)" },
      D1: { type: "label", value: "Aşağı(0)" },
      A2: { type: "label", value: "127,856" },
      B2: { type: "editable", expected: "=YUVARLAK(A2;2)", expectedAlternatives: ["=ROUND(A2;2)"], hint: "2 ondalığa yuvarlama: =YUVARLAK(A2;2)" },
      C2: { type: "editable", expected: "=YUKARIYUVARLA(A2;0)", expectedAlternatives: ["=ROUNDUP(A2;0)"], hint: "Yukarı yuvarlama: =YUKARIYUVARLA(A2;0)" },
      D2: { type: "editable", expected: "=AŞAĞIYUVARLA(A2;0)", expectedAlternatives: ["=ROUNDDOWN(A2;0)"], hint: "Aşağı yuvarlama: =AŞAĞIYUVARLA(A2;0)" },
    },
  },

  /* ── İLERİ ── */
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
      E1: { type: "editable", expected: '=EĞERHATA(DÜŞEYARA(D1;A2:B4;2;0);"-")', expectedAlternatives: ['=IFERROR(VLOOKUP(D1;A2:B4;2;0);"-")'], hint: '=EĞERHATA(DÜŞEYARA(D1;A2:B4;2;0);"-") — hata olursa "-" gösterir.' },
    },
  },
  ileriToplaCarpim: {
    instruction:
      "TOPLA.ÇARPIM ile B2:B5 aralığında sadece \"Elma\" olanların C2:C5 tutarlarını toplayın. Sonucu D2'ye yazın.",
    rows: 6,
    cols: 5,
    cells: {
      A1: { type: "label", value: "#" },
      B1: { type: "label", value: "Ürün" },
      C1: { type: "label", value: "Tutar" },
      D1: { type: "label", value: "Elma Toplam" },
      A2: { type: "label", value: "1" },
      B2: { type: "label", value: "Elma" },
      C2: { type: "label", value: "100" },
      A3: { type: "label", value: "2" },
      B3: { type: "label", value: "Armut" },
      C3: { type: "label", value: "150" },
      A4: { type: "label", value: "3" },
      B4: { type: "label", value: "Elma" },
      C4: { type: "label", value: "200" },
      A5: { type: "label", value: "4" },
      B5: { type: "label", value: "Muz" },
      C5: { type: "label", value: "80" },
      D2: {
        type: "editable",
        expected: '=TOPLA.ÇARPIM((B2:B5="Elma")*C2:C5)',
        expectedAlternatives: ['=SUMPRODUCT((B2:B5="Elma")*C2:C5)'],
        hint: '=TOPLA.ÇARPIM((B2:B5="Elma")*C2:C5) — koşula uyan satırların tutarlarını toplar.',
      },
    },
  },
};

/* ─────────────────────────────────────────────
   PRACTICE ↔ GROUP MAPPING
   ───────────────────────────────────────────── */

export const practiceByGroupTitle: Record<string, { key: string; label: string }> = {
  "Temel Hesaplama Fonksiyonları": { key: "temelHesaplama", label: "Uygulama: Topla, Ortalama, Min/Maks, Say" },
  "Karar & Mantık Fonksiyonları": { key: "egerOrnek", label: "Uygulama: EĞER ile Geçti/Kaldı" },
  "Tablo, Filtre ve Temel Metin": { key: "metinTemel", label: "Uygulama: SAĞ ve SOL ile metin parçası" },
  "Hücre Referansları ve Adresleme": { key: "temelReferans", label: "Uygulama: Mutlak referans ile sabit hücre" },
  "Arama & Getirme Fonksiyonları": { key: "duseyaraOrnek", label: "Uygulama: DÜŞEYARA ile tablodan getirme" },
  "Koşullu Toplama & Sayma": { key: "egersayOrnek", label: "Uygulama: EĞERSAY ile koşullu sayma" },
  "Metinle Çalışma": { key: "metinBirlestir", label: "Uygulama: BİRLEŞTİR ile Ad Soyad" },
  "Tarih & Saat Fonksiyonları": { key: "tarihOrnek", label: "Uygulama: GÜN, AY, YIL ile tarih parçalama" },
  "İç İçe EĞER ve Çoklu Koşullar": { key: "ortaIcIceEger", label: "Uygulama: Puana göre harf notu" },
  "Yuvarlama ve Sayı İşleme": { key: "ortaYuvarlama", label: "Uygulama: Tutarları yuvarlama" },
  "Hata Yönetimi & Kombinasyonlar": { key: "duseyaraEgerhata", label: "Uygulama: DÜŞEYARA + EĞERHATA" },
  "TOPLA.ÇARPIM ve Dizi Formülleri": { key: "ileriToplaCarpim", label: "Uygulama: Koşullu ağırlıklı toplam" },
};

/* ─────────────────────────────────────────────
   İLERİ SEVİYE EK SAYFALAR (Excel export)
   ───────────────────────────────────────────── */

export const ileriEkSayfalar: SheetFromTable[] = [
  {
    sheetName: "PivotTable Ornek Veri",
    rows: 5,
    cols: 3,
    cells: { A1: "Tarih", B1: "Ürün", C1: "Tutar", A2: "01.01.2025", B2: "Elma", C2: "100", A3: "01.01.2025", B3: "Armut", C3: "150", A4: "02.01.2025", B4: "Elma", C4: "120", A5: "02.01.2025", B5: "Muz", C5: "80" },
  },
  {
    sheetName: "Filtre Siralar Benzersiz",
    rows: 6,
    cols: 2,
    cells: { A1: "Ürün", B1: "Adet", A2: "Elma", B2: "10", A3: "Armut", B3: "5", A4: "Elma", B4: "8", A5: "Muz", B5: "12", A6: "Armut", B6: "3" },
  },
];

/* ═══════════════════════════════════════════════
   LEVEL CONFIGS – her seviyenin tüm içeriği
   ═══════════════════════════════════════════════ */

export const levelConfig: Record<LevelKey, LevelConfig> = {
  /* ╔═══════════════════════════════════════════╗
     ║  SEVİYE 1 — TEMEL                        ║
     ╚═══════════════════════════════════════════╝ */
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
      "Hücre referansları, biçimlendirme ve grafik temelleri",
    ],
    functionGroups: [
      {
        title: "Temel Hesaplama Fonksiyonları",
        description: "Günlük raporlar, özet tablolar ve hızlı kontroller için en çok kullanılan fonksiyonlar.",
        functions: [
          { name: "TOPLA", use: "Seçili hücre aralığındaki sayıları toplar.", syntax: "=TOPLA(aralık)", params: [{ name: "aralık", description: "Toplanacak hücre aralığı (örn. A1:A10)." }] },
          { name: "ORTALAMA", use: "Bir sayı grubunun aritmetik ortalamasını alır.", syntax: "=ORTALAMA(aralık)", params: [{ name: "aralık", description: "Ortalaması alınacak hücre aralığı." }] },
          { name: "MİN / MAKS", use: "Bir aralıktaki en küçük ve en büyük değeri bulur.", syntax: "=MİN(aralık)  veya  =MAKS(aralık)", params: [{ name: "aralık", description: "En küçük veya en büyük değerin aranacağı hücre aralığı." }] },
          { name: "SAY", use: "Sayı içeren hücrelerin sayısını verir.", syntax: "=SAY(aralık)", params: [{ name: "aralık", description: "Sayılacak hücre aralığı; yalnızca sayı içeren hücreler sayılır." }] },
        ],
      },
      {
        title: "Karar & Mantık Fonksiyonları",
        description: "Basit kurallara göre çıktılar üretmek ve hataları daha iyi yönetmek için.",
        functions: [
          { name: "EĞER", use: "Bir koşul doğruysa A, yanlışsa B sonucunu döndürür.", syntax: "=EĞER(mantıksal_sınama; doğruysa_değer; yanlışsa_değer)", params: [{ name: "mantıksal_sınama", description: "Doğru veya yanlış sonuç veren koşul (örn. A2>=50)." }, { name: "doğruysa_değer", description: "Koşul doğruysa döndürülecek değer veya metin." }, { name: "yanlışsa_değer", description: "Koşul yanlışsa döndürülecek değer veya metin." }] },
          { name: "VE / VEYA (giriş)", use: "Birden fazla koşulu aynı anda kontrol etmeye giriş seviyesi.", syntax: "=VE(koşul1; koşul2; ...)  veya  =VEYA(koşul1; koşul2; ...)", params: [{ name: "koşul1, koşul2, ...", description: "VE: hepsi doğruysa DOĞRU. VEYA: en az biri doğruysa DOĞRU." }] },
          { name: "EĞERHATA (giriş)", use: "Formül hata verdiğinde daha okunabilir bir çıktı üretir.", syntax: "=EĞERHATA(değer; hata_ise_değer)", params: [{ name: "değer", description: "Kontrol edilecek formül veya ifade." }, { name: "hata_ise_değer", description: "Hata oluşursa gösterilecek değer (örn. \"-\" veya \"Bulunamadı\")." }] },
        ],
      },
      {
        title: "Tablo, Filtre ve Temel Metin",
        description: "Veriyi tabloya dönüştürerek ve basit metin fonksiyonları ile temizleyerek analize hazır hale getirirsin.",
        functions: [
          { name: "Tabloya Dönüştür (Ctrl+T)", use: "Dinamik tablo yapısı, filtre ve sıralama için temel adım.", syntax: "Kısayol: Ctrl+T (tablo olarak biçimlendir).", params: [] },
          { name: "FİLTRELE / SIRALA (arayüz)", use: "Listeyi istediğin kritere göre daraltır veya sıralar.", syntax: "Veri sekmesi → Filtrele veya Sırala (arayüz komutları).", params: [] },
          { name: "SAĞ / SOL / UZUNLUK (giriş)", use: "Hücredeki metnin belirli kısımlarını almak veya uzunluğunu ölçmek için.", syntax: "=SAĞ(metin; karakter_sayısı)  =SOL(metin; karakter_sayısı)  =UZUNLUK(metin)", params: [{ name: "metin", description: "İşlenecek metin veya metin içeren hücre." }, { name: "karakter_sayısı", description: "SAĞ/SOL için alınacak karakter sayısı. UZUNLUK'ta yok; metnin uzunluğu döner." }] },
        ],
      },
      /* ── YENİ TEMEL GRUPLAR ── */
      {
        title: "Hücre Referansları ve Adresleme",
        description: "Formülleri kopyalarken hücrelerin kaymaması veya doğru kayması için $ işaretinin kullanımı.",
        image: "/images/egitimler/temel-hucre-referans.png",
        functions: [
          { name: "Göreli Referans (A1)", use: "Formülü kopyaladığınızda satır ve sütun numarası otomatik değişir. Varsayılan davranıştır.", syntax: "=A1+B1 → aşağı kopyalanırsa =A2+B2 olur", params: [] },
          { name: "Mutlak Referans ($A$1)", use: "Formülü nereye kopyalarsanız kopyalayın, bu hücre referansı değişmez.", syntax: "=$A$1*B2 → B2 kayar, $A$1 sabit kalır", params: [{ name: "$ işareti", description: "F4 tuşu ile $ eklenip kaldırılabilir. $ sütun harfinin önünde → sütun sabit, $ satır numarasının önünde → satır sabit." }] },
          { name: "Karışık Referans (A$1 veya $A1)", use: "Sadece satırı veya sadece sütunu sabitler; çapraz kopyalamalarda çok işe yarar.", syntax: "=A$1 (satır sabit)  =$A1 (sütun sabit)", params: [] },
        ],
      },
      {
        title: "Sayı Biçimlendirme ve Görünüm",
        description: "Sayıları para birimi, yüzde veya özel formatta göstererek raporlarını profesyonel hale getirirsin.",
        image: "/images/egitimler/temel-sayi-bicimlendirme.png",
        functions: [
          { name: "Sayı Formatı", use: "Hücredeki sayının görünümünü belirler; binlik ayırıcı, ondalık basamak sayısı gibi.", syntax: "Sağ tık → Hücreleri Biçimlendir → Sayı sekmesi", params: [] },
          { name: "Para Birimi ve Yüzde", use: "₺, $, € gibi para birimi sembolü veya % işareti ekler.", syntax: "Giriş → Sayı grubu → ₺ veya % düğmesi", params: [] },
          { name: "Tarih ve Özel Format", use: "GG.AA.YYYY gibi tarih formatları veya \"0000\" gibi başa sıfır ekleyen özel formatlar.", syntax: "Hücreleri Biçimlendir → Özel → Format kodu girin (örn. GG/AA/YYYY)", params: [] },
        ],
      },
      {
        title: "Basit Grafik Oluşturma",
        description: "Verileri görselleştirerek raporlarını daha anlaşılır hale getirirsin.",
        image: "/images/egitimler/temel-basit-grafik.png",
        functions: [
          { name: "Sütun Grafik", use: "Kategoriler arası karşılaştırma için en yaygın grafik türü.", syntax: "Veriyi seç → Ekle sekmesi → Sütun Grafik", params: [] },
          { name: "Pasta Grafik", use: "Bütünün yüzde dağılımını göstermek için idealdir.", syntax: "Veriyi seç → Ekle sekmesi → Pasta Grafik", params: [] },
          { name: "Çizgi Grafik", use: "Zaman serileri ve trendleri göstermek için kullanılır.", syntax: "Veriyi seç → Ekle sekmesi → Çizgi Grafik", params: [] },
        ],
      },
      {
        title: "Otomatik Doldurma ve Seri Oluşturma",
        description: "Tekrarlayan verileri hızlıca doldurarak zaman kazanırsın.",
        image: "/images/egitimler/temel-otomatik-doldurma.png",
        functions: [
          { name: "Sayı ve Tarih Serisi", use: "İki hücreye başlangıç değerlerini yazıp sağ alt köşeden sürükleyerek seri oluşturursun.", syntax: "Örn: 1, 2 yazıp sürükle → 3, 4, 5... veya Ocak, Şubat → Mart, Nisan...", params: [] },
          { name: "Flash Fill (Hızlı Doldurma)", use: "Excel deseni otomatik algılayarak geri kalan hücreleri doldurur.", syntax: "Veri sekmesi → Hızlı Doldurma veya Ctrl+E", params: [] },
        ],
      },
      /* ── MEVCUT TEMEL SSS'ler ── */
      { title: "Sık Sorulan: Ondalık Ayırıcı ve Bölge Ayarları", description: "Türkiye'de Excel formüllerinde virgül mü nokta mı kullanılır?", image: "/images/egitimler/temel-ondalik.png", functions: [{ name: "Ondalık ayırıcı virgül mü nokta mı?", use: "Türkiye bölge ayarında formül parametreleri noktalı virgül (;) ile ayrılır, ondalık ayırıcı virgüldür. Sayı yazarken 12,5; formülde =TOPLA(A1;A2) kullanırsınız. İngilizce Excel'de virgül parametre ayırıcı, nokta ondalık ayırıcıdır.", params: [] }] },
      { title: "Sık Sorulan: Değer Olarak Yapıştır", description: "Formül yerine sadece sonucu yapıştırmak.", image: "/images/egitimler/temel-deger-yapistir.png", functions: [{ name: "Kopyaladığım formül değil, sonuç yapışsın", use: "Hücreyi kopyalayıp yapıştırırken Özel Yapıştır (Ctrl+Alt+V) kullanın; \"Değerler\" seçeneğini işaretleyin. Böylece formül değil, hesaplanmış sayı veya metin yapışır. Kısayol: kopyala → hedefe sağ tık → Yapıştır Seçenekleri → Değerler (sadece 123 ikonu).", params: [] }] },
      { title: "Sık Sorulan: Satır veya Sütun Sabitleme", description: "Kaydırırken başlıkların hep görünmesi.", image: "/images/egitimler/temel-bolmeleri-dondur.png", functions: [{ name: "Bölmeleri dondur (Freeze Panes)", use: "Üst satırları veya sol sütunları sabitlemek için: Görünüm sekmesi → Pencere → Bölmeleri Dondur. Önce sabitlenecek satırın altındaki ve sütunun sağındaki hücreyi seçin, sonra Bölmeleri Dondur'u tıklayın. İlk satır veya ilk sütun için hazır seçenekler de vardır.", params: [] }] },
      { title: "Sık Sorulan: Otomatik Toplam Kısayolu", description: "Hızlı toplam ve ortalama.", image: "/images/egitimler/temel-otomatik-toplam.png", functions: [{ name: "Alt + = ile otomatik TOPLA", use: "Toplam alınacak sayıların hemen altındaki (veya sağındaki) boş hücreyi seçin, Alt+= tuşlarına basın. Excel otomatik TOPLA formülünü yazar. Birden fazla satır/ sütun seçiliyse her biri için ayrı TOPLA oluşur.", params: [] }] },
      { title: "Sık Sorulan: Tarih Sayı Olarak Görünüyor", description: "Tarih yerine 45000 gibi sayı neden çıkar?", image: "/images/egitimler/temel-tarih-sayi.png", functions: [{ name: "Tarih hücresi neden sayı?", use: "Excel tarihleri seri numarası olarak saklar (1 Ocak 1900 = 1). Hücre \"Genel\" veya \"Sayı\" formatındaysa tarih sayı gibi görünür. Çözüm: Hücreyi seçin → Sağ tık → Hücreleri Biçimlendir → Tarih (veya Özel: GG.AA.YYYY) seçin.", params: [] }] },
      { title: "Sık Sorulan: Boş Hücreleri Doldurma", description: "Aynı değeri yukarıdaki gibi doldurmak.", image: "/images/egitimler/temel-bos-hucre-doldur.png", functions: [{ name: "Boş hücrelere üstteki değeri yazmak", use: "Boş hücreleri seçin (Ctrl ile çoklu seçim veya F5 → Özel → Boşluklar). Sonra = yazıp üstteki dolu hücreyi referans alın (örn. =A2) ve Ctrl+Enter ile tüm seçime aynı formülü uygulayın. İsterseniz sonucu Değer olarak yapıştırıp formülü kaldırın.", params: [] }] },
      { title: "Sık Sorulan: Yazdırma ve Sayfa Sığdırma", description: "Tüm sütunlar tek sayfaya sığsın.", image: "/images/egitimler/temel-yazdirma-sayfa.png", functions: [{ name: "Yazdırırken tüm sütunlar tek sayfaya", use: "Sayfa Düzeni sekmesi → Genişlik ve Yükseklik açılır listelerinden \"1 sayfa\" seçin; veya Yazdırma Alanı → Ölçekle → Sığdır: 1 sayfa genişliğe, 1 sayfa yüksekliğe. Önizleme ile kontrol edin.", params: [] }] },
      { title: "Sık Sorulan: Hücre Birleştirme Ne Zaman Sorun Çıkarır?", description: "Birleştirilmiş hücreler ve formül/filtre.", image: "/images/egitimler/temel-birlestirme.png", functions: [{ name: "Hücreleri birleştirmek ne zaman sakıncalı?", use: "Birleştirilmiş hücreler sıralama, filtre ve bazı formüllerde sorun çıkarabilir; birleşik alan tek hücre sayılır. Başlık için \"Hücreyi Ortala ve Birleştir\" yerine sadece \"Hücreyi Ortala\" kullanıp birleştirmemek veri tablolarında daha güvenlidir.", params: [] }] },
      { title: "Sık Sorulan: Açılır Liste (Veri Doğrulama)", description: "Hücrede liste kutusu ile seçim.", image: "/images/egitimler/temel-acilir-liste.png", functions: [{ name: "Dropdown liste nasıl yapılır?", use: "Liste öğelerini bir sütuna yazın (örn. A1:A5). Listenin görüneceği hücreyi seçin → Veri sekmesi → Veri Doğrulama → İzin Ver: Liste → Kaynak: =A1:A5 (veya doğrudan \"Elma;Armut;Muz\"). Hücrede ok çıkacak; tıklayınca seçenekler görünür.", params: [] }] },
      { title: "Sık Sorulan: Kopyala-Yapıştırda Sadece Biçim veya Sadece Değer", description: "Özel yapıştır seçenekleri.", image: "/images/egitimler/temel-ozel-yapistir.png", functions: [{ name: "Sadece biçimi veya sadece değeri yapıştırmak", use: "Kopyala (Ctrl+C) sonrası hedefe yapıştırırken Ctrl+Alt+V ile Özel Yapıştır açılır: Değerler (sadece sayı/metin), Biçimler (renk, kenarlık, yazı tipi), Formüller vb. ayrı ayrı seçilebilir. Sadece biçim için \"Biçimler\" seçin.", params: [] }] },
      /* ── YENİ TEMEL SSS'ler ── */
      { title: "Sık Sorulan: Formül Çubuğunun Kullanımı", description: "Formülü görmek ve düzenlemek.", image: "/images/egitimler/temel-formul-cubugu.png", functions: [{ name: "Formül çubuğu nerede ve nasıl kullanılır?", use: "Şerit altındaki uzun beyaz alan formül çubuğudur. Hücreye tıkladığınızda içeriğini (metin veya formül) burada görürsünüz. Düzenleme için çubuğa tıklayın veya F2 tuşuna basın. Uzun formüller için çubuğu genişletebilirsiniz (alt kenarından sürükleyin).", params: [] }] },
      { title: "Sık Sorulan: Sayfa Kopyalama ve Taşıma", description: "Çalışma sayfasını kopyalamak veya başka dosyaya taşımak.", image: "/images/egitimler/temel-sayfa-kopyalama.png", functions: [{ name: "Sayfa sekmesini kopyalamak", use: "Sayfa sekmesine sağ tık → Taşı veya Kopyala → \"Kopya oluştur\" onay kutusunu işaretleyin → Tamam. Ctrl tuşuna basılı tutarak sayfa sekmesini sürüklemek de kopyalar. Başka dosyaya taşımak için \"Kitap\" listesinden hedef dosyayı seçin.", params: [] }] },
      { title: "Sık Sorulan: Hücre ve Sayfa Koruma", description: "Yanlışlıkla değiştirmeyi engellemek.", image: "/images/egitimler/temel-sayfa-koruma.png", functions: [{ name: "Hücreleri veya sayfayı nasıl korurum?", use: "Gözden Geçir sekmesi → Sayfayı Koru. Varsayılanda tüm hücreler kilitlidir. Düzenlenmesini istediğiniz hücreleri önce seçip Hücreleri Biçimlendir → Koruma → \"Kilitli\" onayını kaldırın; sonra sayfayı koruyun. Şifre isteğe bağlıdır.", params: [] }] },
      { title: "Sık Sorulan: Hızlı Erişim Çubuğu Özelleştirme", description: "En çok kullandığın komutlara tek tıkla ulaşmak.", image: "/images/egitimler/temel-hizli-erisim.png", functions: [{ name: "Hızlı Erişim Çubuğunu özelleştirmek", use: "Sol üst köşedeki küçük çubuğun yanındaki ok → Diğer Komutlar. Sık kullandığınız komutları (Değer Olarak Yapıştır, Sıralama, Filtre vb.) ekleyin. Her komut bir simge olarak görünür ve tek tıkla çalışır.", params: [] }] },
    ],
  },

  /* ╔═══════════════════════════════════════════╗
     ║  SEVİYE 2 — ORTA                         ║
     ╚═══════════════════════════════════════════╝ */
  orta: {
    slug: "orta",
    label: "Seviye 2 · Orta",
    title: "İş Hayatında En Çok Kullandığın Formüller",
    description:
      "Raporlarını otomatikleştirmek, listeler arasında arama yapmak ve koşullu özetler kurmak için gereken orta seviye fonksiyonlar.",
    target: "Excel'i aktif kullanan, raporlarını daha otomatik ve hatasız hale getirmek isteyenler",
    focus: [
      "Farklı listeler arasında veri çekme (müşteri, ürün, satış vb.)",
      "Koşullu toplama ve sayma ile otomatik özetler",
      "Metin fonksiyonlarıyla veriyi temiz ve analiz edilebilir hale getirme",
      "Yuvarlama, koşullu biçimlendirme ve veri doğrulama ile profesyonel raporlar",
    ],
    functionGroups: [
      {
        title: "Arama & Getirme Fonksiyonları",
        description: "Farklı sayfalardaki veya tablolardaki verileri tek bir raporda birleştirirsin.",
        functions: [
          { name: "DÜŞEYARA", use: "Bir anahtara göre tablodan ilgili bilgiyi çeker.", syntax: "=DÜŞEYARA(aranan_değer; tablo_aralığı; sütun_indisi; [aralık_bak])", params: [{ name: "aranan_değer", description: "Aranacak değer (örn. ürün kodu)." }, { name: "tablo_aralığı", description: "Aramanın yapılacağı tablo aralığı (örn. A2:D100)." }, { name: "sütun_indisi", description: "Sonuç olarak getirilecek sütunun tablodaki numarası (1, 2, 3...)." }, { name: "aralık_bak", description: "0 veya YANLIŞ = tam eşleşme; 1 veya DOĞRU = yaklaşık eşleşme (sıralı liste gerekir)." }] },
          { name: "XLOOKUP", use: "DÜŞEYARA'nın daha esnek, modern ve hata toleranslı versiyonu.", syntax: "=XLOOKUP(aranan; arama_aralığı; dönüş_aralığı; [bulunamazsa]; [eşleşme_türü])", params: [{ name: "aranan", description: "Aranacak değer." }, { name: "arama_aralığı", description: "Aranan değerin aranacağı aralık." }, { name: "dönüş_aralığı", description: "Sonucun alınacağı aralık (arama_aralığı ile aynı boyutta)." }, { name: "bulunamazsa", description: "Eşleşme yoksa gösterilecek değer (isteğe bağlı)." }] },
          { name: "İNDİS + KAÇINCI", use: "Daha esnek arama senaryoları için ikili kombinasyon.", syntax: "=İNDİS(dizi; satır_no; [sütun_no])  ve  =KAÇINCI(aranan; dizi; [eşleşme_türü])", params: [{ name: "dizi", description: "İNDİS: sonuç alınacak aralık. KAÇINCI: aranacak tek sütun/satır." }, { name: "satır_no / aranan", description: "İNDİS'te satır numarası; KAÇINCI'da aranan değer." }, { name: "eşleşme_türü", description: "KAÇINCI'da 0=tam, 1=küçük eşit, -1=büyük eşit." }] },
        ],
      },
      {
        title: "Koşullu Toplama & Sayma",
        description: "Sadece belirli kritere uyan satırları saymak veya toplamak için.",
        functions: [
          { name: "EĞERSAY", use: "Tek bir koşulu sağlayan hücreleri sayar.", syntax: "=EĞERSAY(aralık; ölçüt)", params: [{ name: "aralık", description: "Sayılacak hücre aralığı." }, { name: "ölçüt", description: "Koşul (sayı, metin veya \">50\", \"=Elma\" gibi ifade)." }] },
          { name: "ÇOKETOPLA", use: "Birden fazla kritere göre toplam alır.", syntax: "=ÇOKETOPLA(toplam_aralığı; ölçüt_aralığı1; ölçüt1; [ölçüt_aralığı2; ölçüt2]; ...)", params: [{ name: "toplam_aralığı", description: "Toplanacak sayıların bulunduğu aralık." }, { name: "ölçüt_aralığı1, ölçüt1", description: "İlk koşul: hangi aralıkta, hangi değer aranacak." }, { name: "ölçüt_aralığı2, ölçüt2, ...", description: "İkinci ve sonraki koşul çiftleri (isteğe bağlı)." }] },
          { name: "ÇOKEĞERSAY", use: "Birden fazla koşulu sağlayan satırların sayısını bulur.", syntax: "=ÇOKEĞERSAY(ölçüt_aralığı1; ölçüt1; [ölçüt_aralığı2; ölçüt2]; ...)", params: [{ name: "ölçüt_aralığı1, ölçüt1", description: "İlk koşul: aralık ve kriter." }, { name: "ölçüt_aralığı2, ölçüt2, ...", description: "Diğer koşul çiftleri; tüm koşulları sağlayan satırlar sayılır." }] },
        ],
      },
      {
        title: "Metinle Çalışma",
        description: "CRM, ERP veya dış sistemlerden gelen karışık metinleri temizlemek için.",
        functions: [
          { name: "SAĞ / SOL / PARÇAAL", use: "Metnin belirli kısmını çekmek için.", syntax: "=SAĞ(metin; karakter_sayısı)  =SOL(metin; karakter_sayısı)  =PARÇAAL(metin; başlangıç; uzunluk)", params: [{ name: "metin", description: "İşlenecek metin veya hücre." }, { name: "karakter_sayısı / başlangıç / uzunluk", description: "SAĞ/SOL: kaç karakter. PARÇAAL: hangi pozisyondan, kaç karakter." }] },
          { name: "BİRLEŞTİR / METNEBİRLEŞTİR", use: "Birden fazla hücredeki metni tek hücrede birleştirir.", syntax: "=BİRLEŞTİR(metin1; [metin2]; ...)  veya  =METNEBİRLEŞTİR(ayırıcı; boş_atla; metin1; [metin2]; ...)", params: [{ name: "metin1, metin2, ...", description: "Birleştirilecek metinler veya hücreler; araya virgül/boşluk eklenebilir." }, { name: "ayırıcı (METNEBİRLEŞTİR)", description: "Metinler arasına konacak karakter (örn. \" \", \";\")." }] },
          { name: "UZUNLUK", use: "Metin uzunluğunu kontrol ederek veri kalitesini ölçmek için.", syntax: "=UZUNLUK(metin)", params: [{ name: "metin", description: "Uzunluğu sayılacak metin veya hücre (boşluklar dahil karakter sayısı)." }] },
        ],
      },
      {
        title: "Tarih & Saat Fonksiyonları",
        description: "Satış, abonelik, vade ve performans analizleri için tarih bazlı hesaplamalar.",
        functions: [
          { name: "BUGÜN / ŞİMDİ", use: "Raporlarını güncel tarihe göre dinamik hale getirir.", syntax: "=BUGÜN()  veya  =ŞİMDİ()", params: [{ name: "parametre yok", description: "BUGÜN sadece tarihi, ŞİMDİ tarih ve saati verir; her hesaplamada güncellenir." }] },
          { name: "GÜN / AY / YIL", use: "Tarih içinden istediğin bileşeni çekmek için.", syntax: "=GÜN(seri_no)  =AY(seri_no)  =YIL(seri_no)", params: [{ name: "seri_no", description: "Tarih içeren hücre veya geçerli bir tarih değeri; GÜN/AY/YIL o bileşeni sayı olarak döndürür." }] },
          { name: "EDATE (giriş)", use: "Belirli bir tarihe ay ekleyerek vade/son tarih hesaplar.", syntax: "=EDATE(başlangıç_tarihi; ay_sayısı)", params: [{ name: "başlangıç_tarihi", description: "Başlangıç tarihi (hücre veya tarih)." }, { name: "ay_sayısı", description: "Eklenecek ay sayısı (negatif olursa geriye gider)." }] },
        ],
      },
      /* ── YENİ ORTA GRUPLAR ── */
      {
        title: "İç İçe EĞER ve Çoklu Koşullar",
        description: "Birden fazla koşula göre farklı sonuçlar üreten karar yapıları.",
        image: "/images/egitimler/orta-ic-ice-eger.png",
        functions: [
          { name: "İç İçe EĞER", use: "Birden fazla koşulu sırayla kontrol ederek farklı sonuçlar döndürür (örn. not hesaplama).", syntax: "=EĞER(koşul1; değer1; EĞER(koşul2; değer2; EĞER(koşul3; değer3; varsayılan)))", params: [{ name: "koşul1, değer1, ...", description: "En geniş koşuldan en dara doğru sıralayın (90+, 80+, 70+... gibi)." }] },
          { name: "EĞER + VE / VEYA", use: "Birden fazla koşulu aynı EĞER içinde birleştirmek için.", syntax: "=EĞER(VE(A2>50;B2>50);\"İkisi de geçti\";\"En az biri kaldı\")", params: [] },
          { name: "IFS (EĞERLER)", use: "İç içe EĞER'in daha okunaklı alternatifi (Excel 2019+ / 365).", syntax: "=IFS(koşul1; değer1; koşul2; değer2; DOĞRU; varsayılan)", params: [{ name: "koşul-değer çiftleri", description: "İlk doğru olan koşulun değerini döndürür. Son çift olarak DOĞRU;varsayılan ekleyin." }] },
        ],
      },
      {
        title: "Yuvarlama ve Sayı İşleme",
        description: "Fatura, muhasebe ve finans hesaplamalarında kuruş hassasiyetini kontrol etmek için.",
        image: "/images/egitimler/orta-yuvarlama.png",
        functions: [
          { name: "YUVARLAK", use: "Belirtilen ondalık basamağa normal yuvarlama yapar.", syntax: "=YUVARLAK(sayı; ondalık_basamak)", params: [{ name: "sayı", description: "Yuvarlanacak sayı veya hücre." }, { name: "ondalık_basamak", description: "Kaç ondalık basamağa yuvarlanacak (0=tam sayı, 2=kuruş vb.)." }] },
          { name: "YUKARIYUVARLA / AŞAĞIYUVARLA", use: "Her zaman yukarı veya aşağı yuvarlamak için.", syntax: "=YUKARIYUVARLA(sayı; basamak)  =AŞAĞIYUVARLA(sayı; basamak)", params: [] },
          { name: "TAMSAYI", use: "En yakın alt tam sayıya yuvarlar.", syntax: "=TAMSAYI(sayı)", params: [{ name: "sayı", description: "3,7 → 3; -2,3 → -3. Her zaman aşağı (küçüğe) yuvarlar." }] },
          { name: "MOD", use: "Bölme işleminin kalanını verir; tek/çift kontrolü veya periyodik dağıtım için.", syntax: "=MOD(sayı; bölen)", params: [{ name: "sayı", description: "Bölünecek sayı." }, { name: "bölen", description: "Bölücü; örn. MOD(A2;2)=0 ise çift sayıdır." }] },
        ],
      },
      {
        title: "Koşullu Biçimlendirme (Formül Tabanlı)",
        description: "Verideki önemli değerleri otomatik renklendirerek raporları görsel hale getirirsin.",
        image: "/images/egitimler/orta-kosullu-bicimlendirme.png",
        functions: [
          { name: "Renk Ölçeği ve Veri Çubuğu", use: "Hücre değerine göre arka plan rengini veya çubuk uzunluğunu otomatik ayarlar.", syntax: "Giriş → Koşullu Biçimlendirme → Renk Ölçekleri veya Veri Çubukları", params: [] },
          { name: "İkon Seti", use: "Değere göre yeşil/sarı/kırmızı ok veya yıldız gibi simgeler gösterir.", syntax: "Giriş → Koşullu Biçimlendirme → Simge Setleri", params: [] },
          { name: "Formül Tabanlı Kural", use: "Kendi formülünüzle özel koşul tanımlarsınız (en esnek yöntem).", syntax: "Koşullu Biçimlendirme → Yeni Kural → Formül Kullan → =A2>B2 gibi formül yazın", params: [{ name: "formül", description: "DOĞRU döndüğünde biçimlendirme uygulanır. Satır başına $ kullanmayın ki her satır kendi koşulunu kontrol etsin." }] },
        ],
      },
      {
        title: "Veri Doğrulama ve Bağımlı Listeler",
        description: "Kullanıcı girişlerini kontrol altında tutarak hatalı veri girişini önlersin.",
        image: "/images/egitimler/orta-veri-dogrulama.png",
        functions: [
          { name: "Açılır Liste (Tekrar)", use: "Hücrede seçenekler sunar; yanlış veri girişini engeller.", syntax: "Veri → Veri Doğrulama → İzin Ver: Liste → Kaynak: aralık veya metin", params: [] },
          { name: "DOLAYLI ile Bağımlı Liste", use: "İlk listede seçilen değere göre ikinci liste otomatik değişir.", syntax: "=DOLAYLI(A2) — A2'deki metni aralık adı olarak kullanır", params: [{ name: "İpucu", description: "Her kategori için ayrı isimlendirilmiş aralık oluşturun (Ad Tanımla). DOLAYLI ilk listeden gelen adı alır, ikinci listenin kaynağı olur." }] },
          { name: "Hata Mesajı Özelleştirme", use: "Geçersiz veri girildiğinde özel uyarı mesajı gösterir.", syntax: "Veri Doğrulama → Hata Uyarısı sekmesi → Başlık ve mesaj yazın", params: [] },
        ],
      },
      /* ── MEVCUT ORTA SSS'ler ── */
      { title: "Sık Sorulan: İki Listeyi Karşılaştırma", description: "A'da var B'de yok gibi listeler.", image: "/images/egitimler/orta-iki-listeyi-karsilastir.png", functions: [{ name: "İki listeyi karşılaştırmak (A'da var B'de yok)", use: "EĞERSAY veya SAYI ile: B listesinde olmayan A kayıtlarını bulmak için =EĞERSAY(B:B;A2)=0 koşulu kullanılabilir (A2'de A listesinden bir değer). Filtreleyerek veya yardımcı sütunda DOĞRU/YANLIŞ gösterip \"sadece A'da olanlar\" çıkarılır.", params: [] }] },
      { title: "Sık Sorulan: #YOK Hatası", description: "DÜŞEYARA veya arama formüllerinde bulunamadı.", image: "/images/egitimler/orta-yok-hatasi.png", functions: [{ name: "#YOK neden olur, nasıl gizlenir?", use: "#YOK, aranan değer tabloda bulunamadığında (DÜŞEYARA, KAÇINCI vb.) oluşur. Gizlemek için formülü EĞERHATA veya EĞERYOK ile sarın: =EĞERHATA(DÜŞEYARA(...);\"-\") veya Excel 365'te =EĞERYOK(DÜŞEYARA(...);\"-\").", params: [] }] },
      { title: "Sık Sorulan: #BAŞV! (#REF!) Hatası", description: "Geçersiz hücre referansı.", image: "/images/egitimler/orta-basv-hatasi.png", functions: [{ name: "#BAŞV! hatası ne anlama gelir?", use: "Silinen satır/sütun veya taşınan hücreye referans kaldığında oluşur. Formülde artık var olmayan bir aralık yazıyorsa #BAŞV! görürsünüz. Çözüm: Formülü düzeltip doğru aralığı yazın veya silme/taşıma işlemini geri alın.", params: [] }] },
      { title: "Sık Sorulan: Metin Olarak Kaydedilmiş Sayılar", description: "Sol hizalı sayılar, toplam almıyor.", image: "/images/egitimler/orta-metin-sayi.png", functions: [{ name: "Metin olan sayıları sayıya çevirmek", use: "Sol hizalı, yeşil uyarı köşesi varsa hücre \"metin\" formatındadır. Tek hücre: uyarı ikonuna tıkla → \"Sayıya Dönüştür\". Toplu: Boş hücreye 1 yaz, kopyala; sayıya çevrilecek aralığı seç → Özel Yapıştır → Çarp.", params: [] }] },
      { title: "Sık Sorulan: Tarih ve Saati Ayrı Sütunlara Bölmek", description: "Tarih + saat tek hücredeyse.", image: "/images/egitimler/orta-tarih-saat-ayir.png", functions: [{ name: "Tarih ve saati ayırmak", use: "Tarih için =TAMSAYI(A2), saat için =A2-TAMSAYI(A2) ve hücreyi saat formatında gösterin; veya GÜN/AY/YIL ve SAAT/DAKİKA/SANIYE fonksiyonlarını kullanın.", params: [] }] },
      { title: "Sık Sorulan: Koşullu Biçimlendirme ile Vurgulama", description: "Belirli koşula göre renklendirme.", image: "/images/egitimler/orta-kosullu-bicim.png", functions: [{ name: "Koşula göre hücre rengi vermek", use: "Biçimlendirilecek aralığı seçin → Giriş → Koşullu Biçimlendirme → Kural türü seçin (örn. \"Büyüktür\" 50 → kırmızı dolgu). Özel formül için \"Formül kullan\" seçip =A2>50 gibi yazın.", params: [] }] },
      { title: "Sık Sorulan: Yinelenenleri Kaldırma", description: "Tekrarlayan satırları temizlemek.", image: "/images/egitimler/orta-yinelenenleri-kaldir.png", functions: [{ name: "Tekrarlayan satırları kaldırmak", use: "Veriyi seçin → Veri sekmesi → Yinelenenleri Kaldır. Hangi sütunlara göre tekrar sayılacağını seçin. Dikkat: Kalıcı siler; önce dosyanın kopyasında deneyin.", params: [] }] },
      { title: "Sık Sorulan: Metni Sütunlara Bölme", description: "Virgülle veya ayırıcıyla ayrılmış metin.", image: "/images/egitimler/orta-metni-sutunlara.png", functions: [{ name: "Virgülle ayrılmış metni sütunlara bölmek", use: "Veriyi seçin → Veri → Metni Sütunlara Dönüştür. Sınırlandırılmış seçin, ayırıcı olarak virgül veya noktalı virgül işaretleyin; Son.", params: [] }] },
      { title: "Sık Sorulan: Tabloda Formül Otomatik Genişlemesi", description: "Excel tablosunda yeni satıra formül yayılması.", image: "/images/egitimler/orta-tablo-formul.png", functions: [{ name: "Tablo (Ctrl+T) formülü otomatik dolduruyor mu?", use: "Evet. Tablo sütunundaki bir hücreye formül yazdığınızda Excel tüm satırlara otomatik uygular. Yeni satır eklediğinizde formül otomatik iner.", params: [] }] },
      { title: "Sık Sorulan: Ad Tanımla ile Formülleri Okunaklı Yapma", description: "Aralıklara isim vermek.", image: "/images/egitimler/orta-ad-tanimla.png", functions: [{ name: "Formülde A1:B10 yerine isim kullanmak", use: "Formüller sekmesi → Ad Tanımla. Aralığa \"SatisVerisi\" gibi ad verin; formülde =TOPLA(SatisVerisi) yazabilirsiniz. Adlar sayfa ekleyip silerken daha az kırılır.", params: [] }] },
      /* ── YENİ ORTA SSS'ler ── */
      { title: "Sık Sorulan: ETOPLA vs ÇOKETOPLA Farkı", description: "Hangisini ne zaman kullanmalı?", image: "/images/egitimler/orta-etopla-coketopla.png", functions: [{ name: "ETOPLA ve ÇOKETOPLA farkı nedir?", use: "ETOPLA (SUMIF) tek koşullu toplam alır: =ETOPLA(aralık;kriter;toplam_aralığı). ÇOKETOPLA (SUMIFS) birden fazla koşul destekler ve parametre sırası farklıdır: toplam_aralığı ilk sırada. Yeni dosyalarda ÇOKETOPLA tercih edin; tek koşulda bile çalışır.", params: [] }] },
      { title: "Sık Sorulan: Excel Hata Türleri Özeti", description: "Tüm hata kodlarının anlamı.", image: "/images/egitimler/orta-hata-turleri.png", functions: [{ name: "#YOK, #DEĞER!, #BAŞV!, #AD?, #BÖL/0! ne anlama gelir?", use: "#YOK: Arama sonuçsuz. #DEĞER!: Yanlış veri tipi (metin+sayı). #BAŞV!: Silinen hücreye referans. #AD?: Excel tanımadığı fonksiyon adı. #BÖL/0!: Sıfıra bölme. Her hata için EĞERHATA ile yakalama yapılabilir.", params: [] }] },
      { title: "Sık Sorulan: Formülleri Görünür Yapma (Ctrl+`)", description: "Tüm formülleri aynı anda görmek.", image: "/images/egitimler/orta-formul-gorunur.png", functions: [{ name: "Formülleri ekranda görmek", use: "Ctrl+` (tırnak işareti, ESC altındaki tuş) ile tüm sayfadaki formüller görünür hale gelir. Tekrar basınca sonuçlara döner. Formüller sekmesi → Formülleri Göster ile de açılabilir. Hata ayıklama ve denetim için çok faydalıdır.", params: [] }] },
      { title: "Sık Sorulan: VERİTABANI.AL (DGET) ile Tekil Değer Çekme", description: "Veritabanı fonksiyonu ile tek kayıt getirmek.", image: "/images/egitimler/orta-dlge.png", functions: [{ name: "VERİTABANI.AL nasıl çalışır?", use: "=VERİTABANI.AL(veritabanı; alan; ölçütler). Kriterlerinizi ayrı bir alana yazarsınız (başlık + koşul satırı). Tek eşleşme döndürür; birden fazla eşleşme varsa hata verir. DÜŞEYARA yerine kullanılabilir ama daha az yaygındır.", params: [] }] },
    ],
  },

  /* ╔═══════════════════════════════════════════╗
     ║  SEVİYE 3 — İLERİ                        ║
     ╚═══════════════════════════════════════════╝ */
  ileri: {
    slug: "ileri",
    label: "Seviye 3 · İleri",
    title: "PivotTable, Dashboard & Veri Analizi",
    description:
      "Büyük veri setleriyle çalışıp, yönetime sunabileceğin gösterge panelleri ve etkileşimli raporlar hazırlamak için.",
    target: "Raporlama, finans, satış, operasyon gibi alanlarda düzenli rapor üreten ve analiz yapanlar",
    focus: [
      "PivotTable ile esnek özet raporlar ve kırılımlar",
      "Dashboard mantığıyla tek sayfada net özetler hazırlama",
      "Gelişmiş fonksiyonlarla dinamik analiz alanları oluşturma",
      "Power Query, TOPLA.ÇARPIM ve gelişmiş grafik türleri",
    ],
    functionGroups: [
      {
        title: "PivotTable ve Özetleme",
        description: "Ham veriyi bozmadan farklı bakış açılarıyla analiz etmeni sağlar.",
        functions: [
          { name: "PivotTable", use: "Sürükle-bırak mantığı ile esnek özet tablolar kurar.", syntax: "Ekle sekmesi → PivotTable; satır/sütun/değer alanlarını sürükleyerek özet oluştur.", params: [] },
          { name: "Dilimleyiciler & Zaman Çizelgesi", use: "Raporu filtrelemek için etkileşimli butonlar ekler.", syntax: "PivotTable Araçları → Analiz → Dilimleyici Ekle veya Zaman Çizelgesi.", params: [] },
          { name: "Hesaplanan Alan (giriş)", use: "Pivot içinde ek formüllerle özel metrikler üretir.", syntax: "PivotTable Araçları → Analiz → Alanlar, Öğeler ve Kümeler → Hesaplanan Alan.", params: [{ name: "Formül", description: "Pivot alanları kullanarak yazılan özel hesaplama (örn. satış/aded oranı)." }] },
        ],
      },
      {
        title: "Dinamik Dizi & Gelişmiş Fonksiyonlar",
        description: "Büyük listelerde otomatik filtreleme, sıralama ve benzersiz değer analizi için.",
        functions: [
          { name: "FİLTRE", use: "Belirli kritere uyan satırları dinamik olarak süzer.", syntax: "=FİLTRE(dizi; koşul; [boşsa])", params: [{ name: "dizi", description: "Filtrelenecek aralık." }, { name: "koşul", description: "Her satır için DOĞRU/YANLIŞ dönen mantıksal dizi (örn. A2:A10>50)." }, { name: "boşsa", description: "Hiç eşleşme yoksa gösterilecek değer." }] },
          { name: "SIRALA", use: "Sonuç listesini artan/azalan şekilde sıralar.", syntax: "=SIRALA(dizi; [sıralama_indisi]; [sıralama_sırası])", params: [{ name: "dizi", description: "Sıralanacak aralık." }, { name: "sıralama_indisi", description: "Hangi sütuna göre sıralanacak." }, { name: "sıralama_sırası", description: "1 = artan, -1 = azalan." }] },
          { name: "BENZERSİZ", use: "Tekrarsız liste çıkararak müşteri/ürün/kanal listeleri oluşturur.", syntax: "=BENZERSİZ(dizi; [sütun_bazlı]; [yalnızca_bir_kez])", params: [{ name: "dizi", description: "Benzersiz değerlerin alınacağı aralık." }, { name: "sütun_bazlı", description: "YANLIŞ = satır bazlı, DOĞRU = sütun bazlı." }, { name: "yalnızca_bir_kez", description: "DOĞRU = yalnızca tek geçenleri ver." }] },
        ],
      },
      {
        title: "Hata Yönetimi & Kombinasyonlar",
        description: "Gerçek ofis dosyalarında sık görülen karmaşık ama pratik kombinasyonlar.",
        functions: [
          { name: "DÜŞEYARA + EĞERHATA", use: "Bulunamayan kayıtlar için daha okunabilir sonuçlar verir.", syntax: "=EĞERHATA(DÜŞEYARA(aranan; tablo; sütun; 0); \"bulunamadı_metni\")", params: [{ name: "DÜŞEYARA(...)", description: "Normal DÜŞEYARA formülü; bulunamazsa #YOK hatası verir." }, { name: "bulunamadı_metni", description: "Hata durumunda gösterilecek metin veya değer." }] },
          { name: "İÇİÇE EĞER (ileri seviye)", use: "Birden fazla skala veya segment kuralını tek formülde toplar.", syntax: "=EĞER(koşul1; değer1; EĞER(koşul2; değer2; EĞER(koşul3; değer3; varsayılan)))", params: [{ name: "koşul1, değer1, ...", description: "İlk koşul doğruysa değer1; değilse içteki EĞER değerlendirilir." }] },
          { name: "VE / VEYA ile çoklu koşullar", use: "Raporlarında daha ince filtreler ve sinyaller kurmak için.", syntax: "=EĞER(VE(koşul1; koşul2); \"evet\"; \"hayır\")", params: [{ name: "koşul1, koşul2, ...", description: "VE: hepsi doğru olmalı. VEYA: en az biri doğru olmalı." }] },
        ],
      },
      /* ── YENİ İLERİ GRUPLAR ── */
      {
        title: "Dashboard Oluşturma (Adım Adım)",
        description: "Yönetim raporu niteliğinde tek sayfada tüm KPI'ları gösteren gösterge paneli oluşturma.",
        image: "/images/egitimler/ileri-dashboard.png",
        functions: [
          { name: "Veri Kaynağı Hazırlama", use: "Dashboard'un güvenilir olması için kaynak veriyi Tablo (Ctrl+T) yapın; PivotTable veya formüllerle özet hesapları ayrı bir sayfada kurun.", syntax: "Ham veri → Tablo → Özet sayfası → Dashboard sayfası", params: [] },
          { name: "PivotChart", use: "PivotTable'dan otomatik grafik oluşturur; dilimleyici ile birlikte çalışır.", syntax: "PivotTable seçin → Ekle → PivotChart", params: [] },
          { name: "Dilimleyici Yerleşimi", use: "Filtre butonlarını dashboard sayfasında kullanıcı dostu bir şekilde yerleştirin.", syntax: "Dilimleyicileri boyutlandırıp şekillendirin; birden fazla Pivot'a bağlayın.", params: [] },
          { name: "Sayfa Düzeni", use: "Kılavuz çizgilerini gizleyin, başlık çubuğu ekleyin, hücreleri birleştirerek düzen oluşturun.", syntax: "Görünüm → Kılavuz Çizgileri kaldır → Başlıklar ekle → Yazdırma alanını belirle", params: [] },
        ],
      },
      {
        title: "TOPLA.ÇARPIM ve Dizi Formülleri",
        description: "Birden fazla koşul ve ağırlıklı hesaplamalar için güçlü dizi tabanlı fonksiyon.",
        image: "/images/egitimler/ileri-topla-carpim.png",
        functions: [
          { name: "TOPLA.ÇARPIM", use: "İki veya daha fazla diziyi eleman eleman çarpar ve toplar; ÇOKETOPLA'ya alternatif.", syntax: "=TOPLA.ÇARPIM(dizi1; dizi2; ...)", params: [{ name: "dizi1, dizi2", description: "Aynı boyutlardaki aralıklar. Koşullu toplam için: =TOPLA.ÇARPIM((A:A=\"Elma\")*C:C)" }] },
          { name: "Çoklu Koşul ile TOPLA.ÇARPIM", use: "AND/OR mantığını dizi formülü olarak uygular.", syntax: "=TOPLA.ÇARPIM((koşul1)*(koşul2)*değer_aralığı)", params: [{ name: "İpucu", description: "AND için * (çarpım), OR için + (toplam) kullanın. ÇOKETOPLA'dan daha esnektir." }] },
          { name: "Dizi Sabitleri", use: "Formül içinde sabit değer listeleri kullanmak için.", syntax: "={1;2;3} veya ={\"A\";\"B\";\"C\"}", params: [{ name: "İpucu", description: "TOPLA.ÇARPIM ile birleştirildiğinde güçlü eşleştirme ve filtreleme yapılabilir." }] },
        ],
      },
      {
        title: "Power Query Temelleri",
        description: "Dış kaynaklardan veri almak, dönüştürmek ve otomatik güncellenebilir sorgular oluşturmak için.",
        image: "/images/egitimler/ileri-power-query-temel.png",
        functions: [
          { name: "Veri Al (Dosyadan, Web'den)", use: "Excel, CSV, web sayfası veya veritabanından veri çeker.", syntax: "Veri sekmesi → Veri Al → Kaynağı seçin", params: [] },
          { name: "Satırları / Sütunları Dönüştür", use: "Veri tipini değiştirme, sütun bölme, birleştirme, filtreleme gibi işlemler.", syntax: "Power Query Düzenleyicisi'nde Dönüştür sekmesi → ilgili işlem", params: [] },
          { name: "Sorgu Birleştir (Merge)", use: "İki tabloyu ortak bir anahtar sütuna göre birleştirir (SQL JOIN gibi).", syntax: "Giriş → Sorguları Birleştir → Eşleşme sütunlarını seçin", params: [] },
          { name: "Sorgu Ekle (Append)", use: "Aynı yapıdaki tabloları alt alta birleştirir (SQL UNION gibi).", syntax: "Giriş → Sorguları Ekle → Tabloları seçin", params: [] },
        ],
      },
      {
        title: "Gelişmiş Grafik Türleri",
        description: "Dashboard ve raporlarda profesyonel görselleştirmeler için ileri grafik teknikleri.",
        image: "/images/egitimler/ileri-gelismis-grafik.png",
        functions: [
          { name: "Combo (Bileşik) Grafik", use: "Aynı grafikte sütun + çizgi birlikte göstererek farklı ölçekleri karşılaştırır.", syntax: "Veriyi seç → Ekle → Bileşik Grafik → Her seri için grafik türünü seç", params: [] },
          { name: "Sparkline (Mini Grafik)", use: "Tek hücre içinde küçük bir trend çizgisi gösterir.", syntax: "Ekle → Mini Grafikler → Çizgi/Sütun/Kazanç-Kayıp → Veri aralığını belirle", params: [] },
          { name: "Hedef-Gerçekleşen Grafik", use: "Bullet chart mantığıyla hedef değer ile gerçekleşen değeri karşılaştırır.", syntax: "Yığılmış sütun + işaretçi çizgisi ile oluşturulur; veya combo grafik kullanılır.", params: [] },
        ],
      },
      /* ── MEVCUT İLERİ SSS'ler ── */
      { title: "Sık Sorulan: PivotTable Veri Kaynağını Güncelleme", description: "Kaynak genişlediğinde Pivot'u yenilemek.", image: "/images/egitimler/ileri-pivot-veri-yenile.png", functions: [{ name: "PivotTable veri eklenince güncellenmiyor", use: "PivotTable Araçları → Analiz → Verileri Yenile. Yeni satırlar eklediyseniz: Pivot'a sağ tık → PivotTable Seçenekleri → Veri → Kaynak veriyi yeni aralığa göre güncelleyin. Tablo (Ctrl+T) kullanırsanız kaynak otomatik büyür.", params: [] }] },
      { title: "Sık Sorulan: Dilimleyici Birden Fazla Pivot'a Bağlama", description: "Bir dilimleyici tüm raporları filtrelesin.", image: "/images/egitimler/ileri-dilimleyici-baglanti.png", functions: [{ name: "Aynı dilimleyiciyi birden fazla Pivot'ta kullanmak", use: "Dilimleyiciye sağ tık → Dilimleyici Rapor Bağlantıları. Listeden bağlanacak PivotTable'ları işaretleyin.", params: [] }] },
      { title: "Sık Sorulan: FİLTRE Sonucu Dinamik Liste", description: "Excel 365 dinamik dizi davranışı.", image: "/images/egitimler/ileri-filtre-dinamik.png", functions: [{ name: "FİLTRE sonucu komşu hücrelere taşıyor", use: "FİLTRE (ve SIRALA, BENZERSİZ) dinamik dizi döndürür; sonuç otomatik olarak aşağı/sağa \"taşar\". Altındaki hücrelere yazı yazmayın. Excel 365 / 2021 gerekir.", params: [] }] },
      { title: "Sık Sorulan: Grafik Veri Aralığını Dinamik Yapma", description: "Yeni satır eklenince grafiğin güncellenmesi.", image: "/images/egitimler/ileri-grafik-dinamik.png", functions: [{ name: "Grafik yeni eklenen veriyi göstermiyor", use: "Veriyi Tablo (Ctrl+T) yaparsanız grafik tablo genişledikçe güncellenir. Alternatif: Grafik veri kaynağını Ad Tanımla ile dinamik aralık olarak belirleyin.", params: [] }] },
      { title: "Sık Sorulan: Gösterge Paneli ve Koşullu Biçimlendirme", description: "KPI'ları renk veya ikonla göstermek.", image: "/images/egitimler/ileri-gosterge-paneli.png", functions: [{ name: "Hedef/gerçekleşen göstergesi nasıl yapılır?", use: "İlerleme çubuğu: Koşullu Biçimlendirme → Veri Çubukları. Yüzde hedef karşılaştırması için Simge Setleri (yeşil/sarı/kırmızı ok) kullanın. Dashboard'da genelde formülle hedef/gerçek oranı hesaplanır.", params: [] }] },
      { title: "Sık Sorulan: Çoklu Koşullu Toplam (ÇOKETOPLA Sınırı)", description: "ÇOKETOPLA'da OR mantığı.", image: "/images/egitimler/ileri-coketopla-or.png", functions: [{ name: "Birden fazla değerden birine uyuyorsa toplam (OR)", use: "ÇOKETOPLA tek başına AND mantığıdır. OR için: ayrı ÇOKETOPLA'ları toplayın. Veya TOPLA.ÇARPIM ile OR mantığı kurun: =TOPLA.ÇARPIM(((A:A=\"Elma\")+(A:A=\"Armut\"))*C:C)", params: [] }] },
      { title: "Sık Sorulan: Tarih Dilimleyici ve Mali Yıl", description: "Pivot'ta mali yıl veya çeyrek gruplama.", image: "/images/egitimler/ileri-tarih-gruplama.png", functions: [{ name: "PivotTable'da tarihi ay/yıl/çeyrek gruplamak", use: "Tarih alanını Pivot'a sürükleyin; otomatik Ay, Çeyrek, Yıl grupları oluşur. Mali yıl farklı başlıyorsa yardımcı sütunda ay kayması hesaplayın.", params: [] }] },
      { title: "Sık Sorulan: Yinelenen Başlıklar ve Birleştirilmiş Hücre", description: "Pivot ve dış raporlarda birleştirme.", image: "/images/egitimler/ileri-yinelenen-baslik.png", functions: [{ name: "Pivot'ta aynı başlık tekrar ediyor", use: "PivotTable Seçenekleri → Düzen ve Biçim → \"Yinelenen öğe etiketlerini göster\" işaretli olursa tekrarlanır. Dış tablolarda birleştirilmiş hücre kullanmak sıralama/filtre sorunu çıkarır.", params: [] }] },
      { title: "Sık Sorulan: Dış Veri ve Power Query Giriş", description: "Veri sekmesinden veri çekmek.", image: "/images/egitimler/ileri-power-query.png", functions: [{ name: "Excel'e dış kaynaktan veri almak", use: "Veri sekmesi → Veri Al (Power Query). Excel dosyası, CSV, web sayfası, SQL vb. bağlanabilir. Sorguyu düzenleyip Yükle ile sayfaya getirirsiniz; veri yenile ile güncellenir.", params: [] }] },
      { title: "Sık Sorulan: Makro ve VBA Ne Zaman Gerekir?", description: "Formül yetmediğinde otomasyon.", image: "/images/egitimler/ileri-makro.png", functions: [{ name: "Makro ne zaman kullanılır?", use: "Tekrarlayan tıklama, dosya aç/kapa gibi işler formülle zor; makro (VBA) ile otomatikleştirilebilir. Önce formül, PivotTable ve Power Query ile çözülebilir mi bakın. Makro içeren dosyalar .xlsm olur.", params: [] }] },
      /* ── YENİ İLERİ SSS'ler ── */
      { title: "Sık Sorulan: What-If Analizi", description: "Hedef Ara, Senaryo Yöneticisi ve Veri Tablosu.", image: "/images/egitimler/ileri-what-if.png", functions: [{ name: "What-If araçlarını ne zaman kullanırım?", use: "Veri → What-If Analizi altında üç araç: (1) Hedef Ara: sonuç hücresi belirli değeri alsın diye giriş hücresini bulur. (2) Senaryo Yöneticisi: farklı varsayımları (iyimser/kötümser) karşılaştırır. (3) Veri Tablosu: bir veya iki değişkene göre sonuçları tablo halinde gösterir.", params: [] }] },
      { title: "Sık Sorulan: LET ve LAMBDA Fonksiyonları", description: "Formülleri değişkenle sadeleştirmek ve özel fonksiyon yazmak.", image: "/images/egitimler/ileri-let-lambda.png", functions: [{ name: "LET ve LAMBDA ne işe yarar?", use: "LET: Formül içinde ara değişken tanımlayarak okunabilirliği artırır ve tekrarlayan hesaplamayı önler: =LET(x;A1*2; x+x). LAMBDA: Kendi özel fonksiyonunuzu tanımlarsınız; Ad Tanımla ile kaydedin: =LAMBDA(x; x*1.18). Excel 365 gerekir.", params: [] }] },
      { title: "Sık Sorulan: Veri Modeli ve İlişkiler", description: "Birden fazla tabloyu ilişkilendirmek.", image: "/images/egitimler/ileri-veri-modeli.png", functions: [{ name: "Veri Modeli nedir, nasıl kullanılır?", use: "Power Pivot sekmesi → Veri Modeline Ekle. Birden fazla tabloyu ilişkilendirin (SQL'deki birincil/yabancı anahtar mantığı). PivotTable'da birden fazla tablodan veri çekin. DAX formülleri ile hesaplanan ölçüler ekleyebilirsiniz.", params: [] }] },
      { title: "Sık Sorulan: Makro Kaydetme Adımları", description: "İlk makroyu adım adım oluşturmak.", image: "/images/egitimler/ileri-makro-kaydet.png", functions: [{ name: "Makro nasıl kaydedilir?", use: "Görünüm veya Geliştirici sekmesi → Makro Kaydet → Ad ve kısayol tuşu belirleyin → İşlemleri yapın (Excel her tıklamayı kaydeder) → Kaydı Durdur. Sonra aynı kısayolla veya Makro Çalıştır ile tekrar edin. Dosyayı .xlsm olarak kaydedin.", params: [] }] },
    ],
  },
};

/* ─────────────────────────────────────────────
   YARDIMCI FONKSİYONLAR
   ───────────────────────────────────────────── */

export function getLevelPracticeSheets(levelKey: LevelKey): { groupTitle: string; practiceKey: string; sheetName: string }[] {
  const groups = levelConfig[levelKey].functionGroups;
  const out: { groupTitle: string; practiceKey: string; sheetName: string }[] = [];
  for (const g of groups) {
    const p = practiceByGroupTitle[g.title];
    if (p) out.push({ groupTitle: g.title, practiceKey: p.key, sheetName: g.title.replace(/&/g, " ve ") });
  }
  return out;
}
