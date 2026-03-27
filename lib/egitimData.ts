import type { PracticeGridDef } from "@/components/ExcelPracticeGrid";
import type { SheetFromTable } from "@/lib/egitimExcelExport";

export type FunctionDef = {
  name: string;
  use: string;
  syntax?: string;
  params?: { name: string; description: string }[];
  /** Adım adım yapılış talimatları */
  steps?: string[];
  /** İpuçları, dikkat edilecekler veya sık yapılan hatalar */
  tips?: string[];
  /** Ek açıklayıcı paragraflar (use alanından sonra gösterilir) */
  details?: string;
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
      "Excel arayüzünü tanıma: sekmeler, şerit ve önemli araçların yerleri",
      "Temel hesaplama fonksiyonları ile güvenilir toplamalar ve ortalamalar",
      "EĞER ile basit karar mekanizmaları kurma",
      "Tablo yapısı, filtreleme, sıralama ve grafik temelleri",
    ],
    functionGroups: [
      /* ── EXCEL ARAYÜZÜ VE SEKMELER ── */
      {
        title: "Excel Arayüzü ve Sekmeler",
        description: "Excel'i ilk açtığınızda karşınıza çıkan arayüzü tanıyın: şerit (ribbon), sekmeler, formül çubuğu ve durum çubuğu. Her sekmedeki önemli araçları bilmek, ihtiyacınız olan komutu hızlıca bulmanızı sağlar.",
        image: "/images/egitimler/temel-excel-arayuzu-genel.png",
        functions: [
          {
            name: "Giriş (Home) Sekmesi",
            use: "En çok kullanılan sekme: kopyala/yapıştır, yazı tipi, hücre hizalama, sayı formatı, koşullu biçimlendirme, tablo stilleri ve hücre düzenleme araçları burada bulunur.",
            details: "Giriş sekmesi 7 ana gruba ayrılmıştır: Pano (kopyala/kes/yapıştır), Yazı Tipi (kalın/italik/altı çizili, yazı boyutu ve renk), Hizalama (sola/sağa/ortaya hizala, metni kaydır, birleştir), Sayı (sayı formatı, para birimi, yüzde, ondalık artır/azalt), Stiller (koşullu biçimlendirme, tablo formatı, hücre stilleri), Hücreler (ekle/sil/boyutlandır), Düzenleme (toplam, doldurma, bul-değiştir, sırala-filtrele).",
            steps: [
              "Pano grubu: Ctrl+C (kopyala), Ctrl+X (kes), Ctrl+V (yapıştır). \"Yapıştır\" butonunun altındaki ok ile Özel Yapıştır seçeneklerine ulaşın.",
              "Yazı Tipi grubu: Hücreyi seçip kalın (Ctrl+B), italik (Ctrl+I) yapabilirsiniz. Yazı tipi boyutunu ve rengini buradan değiştirebilirsiniz. Kenarlık eklemek için de bu gruptaki kenarlık ikonunu kullanın.",
              "Hizalama grubu: Metin yatayda sola/ortaya/sağa, dikeyde üst/orta/alt hizalanabilir. \"Metni Kaydır\" uzun metinlerin hücre içinde alt satıra geçmesini sağlar.",
              "Sayı grubu: Açılır listeden Genel, Sayı, Para Birimi, Tarih vb. format seçin. \"%\" butonu yüzde formatı uygular; \",\" butonu binlik ayırıcı ekler.",
              "Stiller grubu: Koşullu Biçimlendirme ile hücreleri otomatik renklendirin, Tablo Olarak Biçimlendir ile veriye profesyonel tablo görünümü verin.",
              "Düzenleme grubu: Alt+= kısayolu ile TOPLA formülü otomatik yazılır. Bul ve Değiştir (Ctrl+H), Sırala ve Filtrele seçenekleri buradadır.",
            ],
            tips: [
              "En sık kullandığınız komutları Hızlı Erişim Çubuğuna ekleyerek tek tıkla ulaşabilirsiniz.",
              "Giriş sekmesindeki komutların çoğunun klavye kısayolu vardır — kısayolları öğrenmek hızınızı 3-4 kat artırır.",
            ],
          },
          {
            name: "Ekle (Insert) Sekmesi",
            use: "Tablolar, grafikler, resimler, şekiller, bağlantılar ve mini grafikler (sparkline) gibi görsel ve yapısal öğeler eklemek için kullanılır.",
            details: "Bu sekmede en çok kullanacağınız 4 grup: Tablolar (PivotTable, Tablo), Grafikler (Sütun, Çizgi, Pasta, Çubuk ve diğer grafik türleri), Çizimler (şekil, simge, metin kutusu ekleme) ve Mini Grafikler (hücre içi küçük grafikler). Grafik eklemek için önce verilerinizi seçip bu sekmeden uygun grafik türünü seçmeniz yeterlidir.",
            steps: [
              "Tablo eklemek: Verilerinizi seçin → Ekle → Tablo (veya Ctrl+T). Excel otomatik olarak başlık satırını algılar ve filtre okları ekler.",
              "Grafik eklemek: Verilerinizi seçin → Ekle → istediğiniz grafik türünü seçin. \"Önerilen Grafikler\" butonu verinize en uygun grafikleri önerir.",
              "PivotTable eklemek: Verilerinizi seçin → Ekle → PivotTable → Yeni veya mevcut çalışma sayfasını seçin.",
            ],
            tips: [
              "Grafik eklemeden önce verilerinizin başlık satırı olduğundan emin olun — Excel başlıkları grafik etiketleri olarak kullanır.",
              "Mini grafikler (Sparklines) tek hücre içinde trend göstermek için mükemmeldir. Dashboard'larda çok işe yarar.",
            ],
          },
          {
            name: "Sayfa Düzeni (Page Layout) Sekmesi",
            use: "Yazdırma ayarları, kenar boşlukları, sayfa yönü (dikey/yatay), kağıt boyutu, yazdırma alanı ve arka plan ayarları için kullanılır.",
            details: "Yazdırma ile ilgili tüm ayarlar bu sekmede toplanmıştır. Rapor hazırlarken sayfanın nasıl görüneceğini kontrol etmek için kullanılır. Sayfa Yapısı grubunda kenar boşlukları, yön (dikey/yatay), boyut ve yazdırma alanı belirlenir. Sığdırma Ölçeği grubunda tablonun sayfa genişliğine/yüksekliğine otomatik sığdırılması ayarlanır.",
            steps: [
              "Sayfa yönünü değiştirmek: Sayfa Düzeni → Yön → Yatay (sütun sayısı fazla olan tablolar için idealdir).",
              "Kenar boşluklarını ayarlamak: Sayfa Düzeni → Kenar Boşlukları → Dar/Normal/Geniş veya Özel Kenar Boşlukları.",
              "Yazdırma alanı belirlemek: Yazdırmak istediğiniz alanı seçin → Sayfa Düzeni → Yazdırma Alanı → Yazdırma Alanını Belirle.",
              "Ölçekleme: Genişlik ve Yükseklik açılır listelerinden \"1 sayfa\" seçerek tüm sütunların tek sayfaya sığmasını sağlayabilirsiniz.",
            ],
          },
          {
            name: "Formüller (Formulas) Sekmesi",
            use: "Tüm Excel fonksiyonlarına kategoriler halinde erişim sağlar. Fonksiyon Ekle sihirbazı, Ad Tanımla ve formül denetim araçları burada yer alır.",
            details: "Fonksiyon Kitaplığı grubunda fonksiyonlar kategorilere ayrılmıştır: Otomatik Toplam, Finansal, Mantıksal, Metin, Tarih ve Saat, Arama ve Başvuru, Matematik ve Trigonometri. Bir fonksiyonun adını bilmiyorsanız \"Fonksiyon Ekle\" (fx) butonuna tıklayarak arama yapabilir veya kategorilere göz atabilirsiniz. Tanımlı Adlar grubunda hücre aralıklarına isim verebilir, formüllerinizi daha okunaklı hale getirebilirsiniz.",
            steps: [
              "Fonksiyon aramak: Formüller → Fonksiyon Ekle (fx ikonu) → Arama kutusuna ne yapmak istediğinizi yazın (örn. \"toplam al\") → Önerilerden seçin.",
              "Ad Tanımla: Bir aralığı seçin → Formüller → Ad Tanımla → İsim verin (örn. \"SatisVerisi\"). Artık formüllerde =TOPLA(SatisVerisi) yazabilirsiniz.",
              "Formül denetimi: Formüller → Öncülleri İzle / Bağımlıları İzle ile formüller arasındaki bağlantıları oklar halinde görebilirsiniz.",
            ],
            tips: [
              "Ctrl+` (ESC altındaki tuş) ile tüm sayfadaki formülleri aynı anda görebilirsiniz. Hata ayıklamak için çok kullanışlıdır.",
            ],
          },
          {
            name: "Veri (Data) Sekmesi",
            use: "Dış kaynaklardan veri alma (Power Query), sıralama, filtreleme, veri doğrulama (açılır liste), metin-sütun dönüşümü, yinelenenleri kaldırma ve What-If analizi araçları.",
            details: "Bu sekme veri yönetiminin kalbi gibidir. Veri Al ve Dönüştür (Power Query) ile dış dosyalardan veri çekebilirsiniz. Sırala ve Filtrele grubunda verinizi alfabetik, sayısal veya özel ölçütlere göre sıralayıp filtreleyebilirsiniz. Veri Araçları grubundaki Veri Doğrulama ile hücrelere açılır liste, sayı sınırlaması gibi kurallar koyabilirsiniz. Metni Sütunlara ayırma, Flash Fill ve yinelenenleri kaldırma da bu sekmede yer alır.",
            steps: [
              "Filtre açmak: Verilerinizin herhangi bir hücresini seçin → Veri → Filtre (veya Ctrl+Shift+L). Başlık satırına filtre okları eklenir.",
              "Sıralama: Veri → Sırala → Sütun, Sıralama Ölçütü (A→Z, Z→A, özel liste) seçin. Birden fazla sıralama düzeyi ekleyebilirsiniz.",
              "Veri Doğrulama (Açılır Liste): Hücreyi seçin → Veri → Veri Doğrulama → İzin Ver: Liste → Kaynak: seçeneklerinizi girin.",
              "Yinelenenleri kaldırmak: Veri → Yinelenenleri Kaldır → Kontrol edilecek sütunları seçin → Tamam.",
            ],
          },
          {
            name: "Görünüm (View) Sekmesi",
            use: "Çalışma kitabı görünümü, yakınlaştırma, bölmeleri dondurma, kılavuz çizgileri ve pencere yönetimi ayarları için kullanılır.",
            details: "Bu sekmede en çok kullanacağınız özellik Bölmeleri Dondur'dur: büyük tablolarda kaydırırken başlık satırının veya ilk sütunun sabit kalmasını sağlar. Normal/Sayfa Sonu Önizleme/Sayfa Düzeni görünümleri arasında geçiş yapabilirsiniz. Kılavuz çizgilerini ve başlıkları gizleme/gösterme seçenekleri de buradadır — dashboard hazırlarken kılavuz çizgilerini kapatmak temiz bir görünüm sağlar.",
            steps: [
              "Bölmeleri Dondur: Sabitlemek istediğiniz satırın altındaki hücreyi seçin → Görünüm → Bölmeleri Dondur. Örnek: 1. satır başlık ise B2'yi seçip Dondur → hem 1. satır hem A sütunu sabit kalır.",
              "Sadece üst satırı dondurmak: Görünüm → Bölmeleri Dondur → Üst Satırı Dondur.",
              "Kılavuz çizgilerini gizlemek: Görünüm → Göster grubunda \"Kılavuz Çizgileri\" kutucuğunun işaretini kaldırın.",
            ],
            tips: [
              "Birden fazla Excel dosyasını yan yana görmek için Görünüm → Tümünü Yerleştir → Dikey seçin.",
            ],
          },
          {
            name: "Formül Çubuğu ve Durum Çubuğu",
            use: "Formül çubuğu: seçili hücrenin içeriğini veya formülünü gösterir ve düzenlemenizi sağlar. Durum çubuğu (en altta): seçili hücrelerin toplamını, ortalamasını ve sayısını anlık olarak gösterir.",
            details: "Formül çubuğu, şeridin hemen altında yer alır. Sol tarafında hücre adresi (Ad Kutusu) bulunur — buraya hücre adresi yazarak hızlıca o hücreye gidebilirsiniz. Sağ tarafı ise formül düzenleme alanıdır; F2 tuşu veya çubuğa tıklayarak düzenleme moduna geçersiniz. Durum çubuğu ise ekranın en altındadır ve seçili hücrelerin hızlı istatistiklerini gösterir.",
            steps: [
              "Ad Kutusu ile hızlı gezinme: Formül çubuğunun solundaki Ad Kutusu'na \"A100\" yazıp Enter'a basarak doğrudan o hücreye gidebilirsiniz.",
              "Formül çubuğunu genişletme: Uzun formülleriniz varsa formül çubuğunun alt kenarından sürükleyerek yüksekliğini artırabilirsiniz.",
              "Durum çubuğu özelleştirme: Durum çubuğuna sağ tıklayın → görmek istediğiniz istatistikleri işaretleyin (Toplam, Ortalama, Sayı, Min, Maks).",
            ],
            tips: [
              "Birden fazla hücre seçtiğinizde durum çubuğunda anlık toplam ve ortalama görürsünüz — formül yazmadan hızlı kontrol için mükemmel.",
            ],
          },
        ],
      },
      {
        title: "Temel Hesaplama Fonksiyonları",
        description: "Günlük raporlar, özet tablolar ve hızlı kontroller için en çok kullanılan fonksiyonlar. Bu fonksiyonları öğrenmek, Excel'deki tüm hesaplama mantığının temelini oluşturur.",
        functions: [
          {
            name: "TOPLA",
            use: "Seçili hücre aralığındaki sayıları toplar. Excel'de en çok kullanılan fonksiyondur; aylık satış raporu, bütçe tablosu veya masraf listesi gibi her türlü hesaplamada karşınıza çıkar.",
            syntax: "=TOPLA(aralık)",
            params: [{ name: "aralık", description: "Toplanacak hücre aralığı (örn. A1:A10). Birden fazla aralık da toplanabilir: =TOPLA(A1:A10;C1:C10)." }],
            steps: [
              "Toplamın görüneceği boş hücreyi seçin.",
              "=TOPLA( yazın ve ardından toplanacak aralığı fare ile seçin (örn. A1:A10).",
              "Parantezi kapatıp Enter'a basın. Sonuç hücrede görünecektir.",
              "Kısayol: Aralığın hemen altındaki boş hücreyi seçip Alt+= tuşlarına basarak otomatik TOPLA yazabilirsiniz.",
            ],
            tips: [
              "Boş hücre veya metin içeren hücreler TOPLA tarafından atlanır, hata vermez.",
              "Yeni satır eklendiğinde formülün otomatik güncellemesi için veriyi Tablo (Ctrl+T) yapmanız önerilir.",
            ],
          },
          {
            name: "ORTALAMA",
            use: "Bir sayı grubunun aritmetik ortalamasını hesaplar. Performans puanları, fiyat ortalamaları veya aylık gider ortalaması gibi karşılaştırmalarda sıkça kullanılır.",
            syntax: "=ORTALAMA(aralık)",
            params: [{ name: "aralık", description: "Ortalaması alınacak hücre aralığı. Boş hücreler ve metin hücreler hesaba katılmaz." }],
            steps: [
              "Sonucun görüneceği hücreyi seçin.",
              "=ORTALAMA( yazın, aralığı seçin (örn. B2:B20), parantezi kapatıp Enter'a basın.",
            ],
            tips: [
              "ORTALAMA boş hücreleri saymaz ama 0 (sıfır) değerli hücreleri sayar. Sıfırları hariç tutmak istiyorsanız =ORTALAMAETOPLA(aralık;\"<>0\") kullanabilirsiniz.",
            ],
          },
          {
            name: "MİN / MAKS",
            use: "Bir aralıktaki en küçük ve en büyük değeri bulur. Sınav sonuçlarında en düşük/en yüksek notu, satış raporlarında en düşük/en yüksek tutarı bulmak için kullanılır.",
            syntax: "=MİN(aralık)  veya  =MAKS(aralık)",
            params: [{ name: "aralık", description: "En küçük veya en büyük değerin aranacağı hücre aralığı (örn. C2:C100)." }],
            steps: [
              "Sonucun görüneceği hücreyi seçin.",
              "=MİN(C2:C100) veya =MAKS(C2:C100) yazıp Enter'a basın.",
              "İpucu: Her iki fonksiyonu yan yana kullanarak aralığı (farkı) da hesaplayabilirsiniz: =MAKS(C2:C100)-MİN(C2:C100).",
            ],
          },
          {
            name: "SAY / SAYA / SAYBOŞ",
            use: "SAY sadece sayı içeren hücreleri sayar, SAYA boş olmayan tüm hücreleri sayar, SAYBOŞ ise boş hücreleri sayar. Veri kalitesi kontrolünde çok işe yarar.",
            syntax: "=SAY(aralık)  =SAYA(aralık)  =SAYBOŞ(aralık)",
            params: [{ name: "aralık", description: "Sayılacak hücre aralığı." }],
            details: "SAY: Yalnızca sayısal değer içeren hücreleri sayar (metin ve boş hücreleri atlar). SAYA: Boş olmayan tüm hücreleri sayar (sayı, metin, hata, mantıksal değer hepsi dahil). SAYBOŞ: Yalnızca boş hücreleri sayar — eksik veri tespiti için kullanışlıdır.",
            steps: [
              "Kaç hücrede sayı olduğunu bulmak için: =SAY(A1:A100).",
              "Kaç hücrenin dolu olduğunu bulmak için: =SAYA(A1:A100).",
              "Kaç hücrenin boş olduğunu bulmak için: =SAYBOŞ(A1:A100).",
            ],
            tips: [
              "Veri girişi tamamlanmamış satırları bulmak için SAYBOŞ çok kullanışlıdır.",
            ],
          },
        ],
      },
      {
        title: "Karar & Mantık Fonksiyonları",
        description: "Belirli kurallara göre farklı çıktılar üretmek için kullanılır. Prim hesaplama, geçti/kaldı durumu veya stok uyarısı gibi senaryolarda karar mekanizmaları kurarsınız.",
        functions: [
          {
            name: "EĞER",
            use: "Bir koşul doğruysa A, yanlışsa B sonucunu döndürür. Excel'in en temel karar fonksiyonudur. Sınav sonucu geçti/kaldı, satış hedefi tuttu/tutmadı, stok düşük/yeterli gibi binlerce senaryoda kullanılır.",
            syntax: "=EĞER(mantıksal_sınama; doğruysa_değer; yanlışsa_değer)",
            params: [
              { name: "mantıksal_sınama", description: "Doğru veya yanlış sonuç veren koşul (örn. A2>=50, B3=\"Evet\")." },
              { name: "doğruysa_değer", description: "Koşul doğruysa döndürülecek değer — metin, sayı veya başka bir formül olabilir." },
              { name: "yanlışsa_değer", description: "Koşul yanlışsa döndürülecek değer." },
            ],
            steps: [
              "Sonucun görüneceği hücreyi seçin.",
              "=EĞER( yazın ve koşulunuzu belirleyin. Örnek: A2>=50 (A2 hücresindeki değer 50'den büyük veya eşit mi?).",
              "Noktalı virgül (;) koyup koşul doğruysa gösterilecek değeri yazın. Metin ise tırnak içinde: \"Geçti\".",
              "Tekrar noktalı virgül koyup koşul yanlışsa gösterilecek değeri yazın: \"Kaldı\".",
              "Parantezi kapatıp Enter'a basın. Tam formül: =EĞER(A2>=50;\"Geçti\";\"Kaldı\").",
            ],
            tips: [
              "Metin değerleri her zaman çift tırnak içinde yazılır (\"Geçti\"). Sayılar tırnak olmadan yazılır.",
              "Türkçe Excel'de parametre ayırıcı noktalı virgül (;) işaretidir, virgül (,) değil.",
              "EĞER fonksiyonları iç içe kullanılabilir (3+ koşul için), ancak çok karmaşık olabilir — bu durumda Orta seviyedeki IFS fonksiyonuna bakın.",
            ],
          },
          {
            name: "VE / VEYA",
            use: "Birden fazla koşulu aynı anda kontrol eder. VE fonksiyonunda tüm koşullar doğruysa DOĞRU döner. VEYA fonksiyonunda en az bir koşul doğruysa DOĞRU döner. EĞER fonksiyonuyla birlikte kullanılarak güçlü karar yapıları kurulur.",
            syntax: "=VE(koşul1; koşul2; ...)  veya  =VEYA(koşul1; koşul2; ...)",
            params: [{ name: "koşul1, koşul2, ...", description: "VE: hepsi doğruysa DOĞRU. VEYA: en az biri doğruysa DOĞRU. 255'e kadar koşul eklenebilir." }],
            details: "Tek başına VE veya VEYA kullanıldığında sadece DOĞRU/YANLIŞ döner. Anlamlı sonuçlar üretmek için genellikle EĞER ile birlikte kullanılır: =EĞER(VE(A2>=50;B2>=50);\"Her ikisi de geçti\";\"En az birinden kaldı\").",
            steps: [
              "Örnek senaryo: Bir çalışanın hem satış hedefini (A2>=100) hem de devamsızlık limitini (B2<=3) tutması gerekiyor.",
              "=EĞER(VE(A2>=100;B2<=3);\"Prim Hak Etti\";\"Prim Yok\") formülünü yazın.",
              "Bu formülde VE fonksiyonu iki koşulu birlikte kontrol eder; ikisi de doğruysa \"Prim Hak Etti\" yazar.",
            ],
            tips: [
              "VE: \"hem X hem Y\" senaryoları için. VEYA: \"X veya Y'den herhangi biri\" senaryoları için kullanın.",
            ],
          },
          {
            name: "EĞERHATA",
            use: "Formül hata verdiğinde (#YOK, #DEĞER!, #BÖL/0! vb.) yerine belirlediğiniz değeri gösterir. Raporlardaki hata mesajlarını gizleyerek daha temiz ve profesyonel bir görünüm sağlar.",
            syntax: "=EĞERHATA(değer; hata_ise_değer)",
            params: [
              { name: "değer", description: "Kontrol edilecek formül veya ifade. Hata yoksa bu değerin sonucu döner." },
              { name: "hata_ise_değer", description: "Hata oluşursa gösterilecek değer (örn. \"-\", \"Bulunamadı\", 0)." },
            ],
            steps: [
              "Hata verebilecek formülünüzü EĞERHATA ile sarmalayın.",
              "Örnek: =EĞERHATA(A2/B2;\"-\") → B2 sıfırsa #BÖL/0! hatası yerine \"-\" gösterir.",
              "Arama formülleriyle kullanım: =EĞERHATA(DÜŞEYARA(D1;A:B;2;0);\"Kayıt bulunamadı\").",
            ],
            tips: [
              "EĞERHATA tüm hata türlerini yakalar. Sadece belirli bir hatayı yakalamak isterseniz EĞERYOK fonksiyonunu kullanın (yalnızca #YOK hatasını yakalar).",
            ],
          },
        ],
      },
      {
        title: "Tablo, Filtre ve Temel Metin",
        description: "Veriyi tabloya dönüştürmek, filtrelemek ve metin fonksiyonları ile temizlemek, Excel'de verimli çalışmanın temelidir. Tablolar dinamik yapıdadır: yeni satır eklenince formüller otomatik güncellenir.",
        functions: [
          {
            name: "Tabloya Dönüştür (Ctrl+T)",
            use: "Ham veriyi Excel Tablosuna çevirerek filtreleme, sıralama, otomatik formül genişleme ve profesyonel görünüm kazandırır. Tablo kullanmak Excel'deki en temel iyi alışkanlıklardan biridir.",
            syntax: "Kısayol: Ctrl+T (tablo olarak biçimlendir).",
            steps: [
              "Verilerinizin herhangi bir hücresine tıklayın.",
              "Ctrl+T tuşlarına basın (veya Ekle → Tablo).",
              "Excel otomatik olarak veri aralığını seçer. \"Tablomda üst bilgiler var\" kutucuğunu kontrol edin.",
              "Tamam'a basın. Artık verileriniz bir tablodur: başlık satırında filtre okları görünür, satır renkleri otomatik çizgilenir.",
            ],
            details: "Tablo kullanmanın avantajları: (1) Yeni satır eklenince formüller otomatik genişler, (2) Grafik veri kaynağı otomatik güncellenir, (3) PivotTable kaynağı olarak kullanıldığında yeni veri eklenince Pivot da güncellenir, (4) Formüllerde yapısal referanslar kullanılabilir: =TOPLA(Tablo1[Tutar]) gibi.",
            tips: [
              "Tablo adını \"Tablo Tasarımı\" sekmesinde (tabloya tıklayınca görünür) anlamlı bir isimle değiştirin. \"SatisVerisi\" gibi adlar formülleri çok okunaklı yapar.",
              "Tablonun son satırına Tab tuşu ile yeni satır ekleyebilirsiniz.",
            ],
          },
          {
            name: "FİLTRELE / SIRALA (arayüz)",
            use: "Filtre ile belirli kritere uyan satırları gösterir, uymayan satırları gizler. Sıralama ile verileri A-Z, Z-A, küçükten büyüğe veya özel ölçüte göre düzenler.",
            syntax: "Veri sekmesi → Filtrele veya Sırala (arayüz komutları). Kısayol: Ctrl+Shift+L.",
            steps: [
              "Filtre açmak: Veri → Filtre'ye tıklayın veya Ctrl+Shift+L basın. Başlık satırına ok düğmeleri eklenir.",
              "Filtre uygulamak: Ok düğmesine tıklayın → görmek istediğiniz değerleri seçin veya metin/sayı filtreleri uygulayın (örn. \"50'den büyük\").",
              "Sıralamak: Başlık okuna tıklayıp \"A'dan Z'ye Sırala\" veya \"Küçükten Büyüğe Sırala\" seçin.",
              "Birden fazla sütuna göre sıralama: Veri → Sırala → \"Düzey Ekle\" ile ikinci, üçüncü sıralama kriteri belirleyin (önce departmana, sonra isme göre gibi).",
            ],
            tips: [
              "Filtre uygulandığında durum çubuğunda \"X kaydın Y tanesi bulundu\" bilgisi görünür.",
              "Filtreyi kaldırmak için Veri → Temizle butonuna basın veya Ctrl+Shift+L ile filtreyi kapatıp tekrar açın.",
            ],
          },
          {
            name: "SAĞ / SOL / UZUNLUK",
            use: "Hücredeki metnin belirli kısımlarını almak veya uzunluğunu ölçmek için kullanılır. TC kimlik numarasının son 4 hanesi, plaka kodunun ilk 2 karakteri gibi pratik senaryolarda işe yarar.",
            syntax: "=SAĞ(metin; karakter_sayısı)  =SOL(metin; karakter_sayısı)  =UZUNLUK(metin)",
            params: [
              { name: "metin", description: "İşlenecek metin veya metin içeren hücre." },
              { name: "karakter_sayısı", description: "SAĞ/SOL için alınacak karakter sayısı. UZUNLUK için parametre gerekmez." },
            ],
            steps: [
              "Metnin son 4 karakteri: =SAĞ(A2;4) — örneğin \"12345678\" metninden \"5678\" alır.",
              "Metnin ilk 2 karakteri: =SOL(A2;2) — örneğin \"İstanbul\" metninden \"İs\" alır.",
              "Metnin uzunluğu: =UZUNLUK(A2) — \"Excel\" için 5 döndürür.",
            ],
            tips: [
              "PARÇAAL fonksiyonu ile metnin ortasından istediğiniz bölümü çekebilirsiniz: =PARÇAAL(A2;3;5) → 3. karakterden başlayarak 5 karakter alır.",
            ],
          },
        ],
      },
      {
        title: "Hücre Referansları ve Adresleme",
        description: "Formülleri kopyalarken hücrelerin kaymaması veya doğru kayması için $ işaretinin kullanımı. Bu konuyu anlamak, Excel'de formül yazarken yapılan hataların büyük çoğunluğunu önler.",
        image: "/images/egitimler/temel-hucre-referans.png",
        functions: [
          {
            name: "Göreli Referans (A1)",
            use: "Formülü kopyaladığınızda satır ve sütun numarası otomatik değişir. Excel'deki varsayılan davranıştır ve çoğu durumda istenen budur.",
            syntax: "=A1+B1 → aşağı kopyalanırsa =A2+B2 olur",
            details: "Bir hücreye =A1*2 yazdığınızda ve bu formülü aşağı kopyaladığınızda, Excel referansı otomatik olarak A2*2, A3*2, A4*2... olarak günceller. Bu mantık, aynı işlemin birçok satıra uygulanmasını tek formülle mümkün kılar.",
            steps: [
              "B1 hücresine =A1*2 yazın.",
              "B1'in sağ alt köşesindeki dolgu tutamacını (küçük siyah kare) aşağı sürükleyin.",
              "B2'de =A2*2, B3'te =A3*2 olduğunu göreceksiniz — referanslar otomatik kaydı.",
            ],
          },
          {
            name: "Mutlak Referans ($A$1)",
            use: "Formülü nereye kopyalarsanız kopyalayın, bu hücre referansı değişmez. KDV oranı, döviz kuru gibi sabit bir değere birçok satırdan referans vermeniz gerektiğinde kullanılır.",
            syntax: "=$A$1*B2 → B2 kayar, $A$1 sabit kalır",
            params: [{ name: "$ işareti", description: "F4 tuşu ile $ eklenip kaldırılabilir. Her basışta: A1 → $A$1 → A$1 → $A1 → A1 şeklinde döner." }],
            steps: [
              "Örnek: B1 hücresinde KDV oranı (%20) var. C2 hücresinde A2 fiyatını KDV ile çarpmak istiyorsunuz.",
              "C2 hücresine =A2*$B$1 yazın. $B$1 sayesinde KDV hücresi sabit kalır.",
              "C2'yi aşağı kopyalayın: C3'te =A3*$B$1, C4'te =A4*$B$1 olur — fiyat satırı değişir ama KDV hücresi hep B1'e bakar.",
            ],
            tips: [
              "F4 tuşu en hızlı yoldur: formülde hücre adresini yazdıktan hemen sonra F4'e basarak $ işaretlerini ekleyin.",
              "Sabit hücreyi unutan formüller en sık yapılan hatadır — formülü kopyaladıktan sonra birkaç satırda sonucu kontrol edin.",
            ],
          },
          {
            name: "Karışık Referans (A$1 veya $A1)",
            use: "Sadece satırı veya sadece sütunu sabitler. Çarpım tablosu veya çapraz tablolamalarda çok kullanışlıdır.",
            syntax: "=A$1 (satır sabit, sütun kayar)  =$A1 (sütun sabit, satır kayar)",
            details: "Diyelim ki satır 1'deki başlık değerleri (B1, C1, D1) sabit olsun ama sütun A'daki değerler satır satır değişsin istiyorsunuz. Bu durumda =$A2*B$1 kullanırsınız. Sağa kopyalayınca $A2 sabit kalır B$1→C$1 olur; aşağı kopyalayınca B$1 sabit kalır $A2→$A3 olur.",
            steps: [
              "Çarpım tablosu örneği: A sütununda 1-10 arası sayılar, satır 1'de 1-10 arası sayılar var.",
              "B2 hücresine =$A2*B$1 yazın.",
              "Hem sağa hem aşağı kopyalayın — çarpım tablosu otomatik oluşur.",
            ],
          },
        ],
      },
      {
        title: "Sayı Biçimlendirme ve Görünüm",
        description: "Sayıları para birimi, yüzde veya özel formatta göstererek raporlarını profesyonel hale getirirsin. Biçimlendirme hücredeki değeri değiştirmez, sadece gösterimini değiştirir.",
        image: "/images/egitimler/temel-sayi-bicimlendirme.png",
        functions: [
          {
            name: "Sayı Formatı",
            use: "Hücredeki sayının görünümünü belirler: binlik ayırıcı, ondalık basamak sayısı, negatif sayı gösterimi gibi ayarları kontrol eder.",
            syntax: "Sağ tık → Hücreleri Biçimlendir → Sayı sekmesi",
            steps: [
              "Biçimlendirilecek hücreleri seçin.",
              "Sağ tık → Hücreleri Biçimlendir (veya Ctrl+1 kısayolu).",
              "Sayı sekmesinde kategorilerden birini seçin: Sayı, Para Birimi, Muhasebe, Tarih, Saat, Yüzde, Kesir, Bilimsel, Metin, Özel.",
              "Ondalık basamak sayısını ve binlik ayırıcı seçeneğini ayarlayın → Tamam.",
            ],
            tips: [
              "Biçimlendirme değeri değiştirmez: hücrede 1234.5 olsa bile 1.234,50 olarak gösterilir ama formüllerde orijinal değer kullanılır.",
            ],
          },
          {
            name: "Para Birimi ve Yüzde",
            use: "₺, $, € gibi para birimi sembolü veya % işareti ekler. Finansal raporlarda ve bütçe tablolarında en çok kullanılan formatlar.",
            syntax: "Giriş → Sayı grubu → ₺ veya % düğmesi",
            steps: [
              "Para birimi: Hücreleri seçin → Giriş sekmesi → Sayı grubundaki ₺ ikonuna tıklayın. Farklı para birimi için ikona sağ tıklayıp seçim yapın.",
              "Yüzde: Hücreleri seçin → % butonuna tıklayın. Dikkat: 0,20 değeri %20 olarak gösterilir; 20 yazarsanız %2000 görünür.",
              "Ondalık artır/azalt: Sayı grubundaki ←0 ve 0→ butonlarıyla ondalık basamak sayısını değiştirin.",
            ],
            tips: [
              "Yüzde formatı uygularken dikkat: Hücreye 20 yazıp % formatı uygularsanız %2000 gösterilir. Doğrusu: önce 0,20 yazın sonra % formatı uygulayın veya hücreye doğrudan %20 yazın.",
            ],
          },
          {
            name: "Tarih ve Özel Format",
            use: "GG.AA.YYYY gibi tarih formatları veya \"0000\" gibi başa sıfır ekleyen özel formatlar uygular. Fatura numaraları, posta kodları gibi başında sıfır olan veriler için özel format şarttır.",
            syntax: "Hücreleri Biçimlendir → Özel → Format kodu girin",
            steps: [
              "Tarih formatı: Hücreleri seçin → Ctrl+1 → Tarih → istediğiniz görünümü seçin (14.03.2025, Mart 2025, 14/03/25 vb.).",
              "Başa sıfır eklemek: Ctrl+1 → Özel → Tür kutusuna \"00000\" yazın (5 haneli posta kodu için). 1234 → 01234 olarak gösterilir.",
              "Özel para formatı: Tür kutusuna #.##0,00 \" ₺\" yazın — 1234.5 değeri 1.234,50 ₺ olarak gösterilir.",
            ],
            tips: [
              "Tarih formatı sadece Excel'in tarih olarak tanıdığı değerlerde çalışır. Hücreye \"15 Mart\" yazarsanız Excel bunu metin olarak algılayabilir.",
            ],
          },
        ],
      },
      {
        title: "Basit Grafik Oluşturma",
        description: "Verileri görselleştirmek, rakamları tablo halinde okumaktan çok daha hızlı bir şekilde anlaşılmasını sağlar. Doğru grafik türünü seçmek, mesajınızın net iletilmesi için kritiktir.",
        image: "/images/egitimler/temel-basit-grafik.png",
        functions: [
          {
            name: "Sütun (Çubuk) Grafik",
            use: "Kategoriler arası karşılaştırma için en yaygın grafik türüdür. Aylık satış karşılaştırması, departman bazlı bütçe, ürün bazlı adetler gibi senaryolarda kullanılır.",
            syntax: "Veriyi seç → Ekle sekmesi → Sütun Grafik",
            steps: [
              "Başlık satırı dahil verilerinizi seçin (örn. A1:B5 — A'da ürün adları, B'de satış tutarları).",
              "Ekle sekmesine gidin → Sütun Grafik simgesine tıklayın.",
              "Alt türler arasından seçim yapın: Kümelenmiş Sütun (en yaygın), Yığılmış Sütun (parçaları gösteren), 3B Sütun.",
              "Grafik oluşturulduktan sonra üzerine tıklayın → Grafik Tasarımı sekmesinden stil, renk ve düzen değiştirin.",
              "Grafik başlığına tıklayarak anlamlı bir başlık yazın (örn. \"2025 Yılı Ürün Bazlı Satışlar\").",
            ],
            tips: [
              "3-7 kategori arasında sütun grafik en okunurdur. 10+ kategori varsa yatay çubuk grafik tercih edin.",
              "Grafik oluşturulduktan sonra sağ tıklayıp \"Veri Etiketleri Ekle\" ile değerleri çubukların üzerine yazabilirsiniz.",
            ],
          },
          {
            name: "Pasta Grafik",
            use: "Bütünün yüzde dağılımını göstermek için idealdir. Departman bazlı gider payları, pazar payı dağılımı gibi oransal verilerde kullanılır.",
            syntax: "Veriyi seç → Ekle sekmesi → Pasta Grafik",
            steps: [
              "Kategori ve değer verilerinizi seçin (örn. A1:B4 — departman adları ve gider tutarları).",
              "Ekle → Pasta Grafik → 2B Pasta veya Halka (Donut) seçin.",
              "Grafik üzerine tıklayın → Grafik Öğeleri (+) butonundan \"Veri Etiketleri\" → \"Yüzde\" seçeneğini açın.",
            ],
            tips: [
              "Pasta grafik en fazla 5-6 dilimle etkili olur. Çok fazla dilim varsa küçükleri \"Diğer\" olarak gruplayın.",
              "Bir dilimi vurgulamak için üzerine tıklayıp sürükleyerek pasta'dan ayırabilirsiniz (exploded pie).",
            ],
          },
          {
            name: "Çizgi Grafik",
            use: "Zaman serileri ve trendleri göstermek için kullanılır. Aylık gelir trendi, günlük sıcaklık değişimi, yıllık büyüme gibi zamana bağlı verilerde en etkili grafik türüdür.",
            syntax: "Veriyi seç → Ekle sekmesi → Çizgi Grafik",
            steps: [
              "Zaman serisi verilerinizi seçin (örn. A1:B13 — aylar ve gelir tutarları).",
              "Ekle → Çizgi Grafik → İşaretçili Çizgi (veri noktaları görünsün) veya düz çizgi seçin.",
              "İkinci bir veri serisini (hedef değer gibi) eklemek için: grafik üzerine sağ tık → Veri Seç → Seri Ekle.",
            ],
            tips: [
              "Trend çizgisi eklemek: Çizgiye sağ tık → Eğilim Çizgisi Ekle → Doğrusal. Bu, genel eğilimi görmenizi sağlar.",
              "İki farklı ölçekteki veriyi (örn. gelir ve müşteri sayısı) göstermek için ikincil eksen kullanın: seriyi sağ tık → Veri Serisini Biçimlendir → İkincil Eksen.",
            ],
          },
        ],
      },
      {
        title: "Otomatik Doldurma ve Seri Oluşturma",
        description: "Tekrarlayan verileri elle yazmak yerine Excel'in otomatik doldurma özelliğini kullanarak zaman kazanırsın.",
        image: "/images/egitimler/temel-otomatik-doldurma.png",
        functions: [
          {
            name: "Sayı ve Tarih Serisi",
            use: "İki hücreye başlangıç değerlerini yazıp dolgu tutamacından sürükleyerek seri oluşturursun. Excel deseni algılar ve devam ettirir.",
            syntax: "Örn: 1, 2 yazıp sürükle → 3, 4, 5... veya Ocak, Şubat → Mart, Nisan...",
            steps: [
              "İki hücreye başlangıç değerlerini yazın (örn. A1'e 1, A2'ye 2).",
              "Her iki hücreyi seçin.",
              "Seçimin sağ alt köşesindeki dolgu tutamacını (küçük siyah kare) aşağı veya sağa sürükleyin.",
              "Excel 3, 4, 5... devam edecektir. Aynı mantık tarihler (01.01, 02.01...), günler (Pazartesi, Salı...) ve aylar (Ocak, Şubat...) için de geçerlidir.",
            ],
            tips: [
              "Sürükledikten sonra sağ alt köşede görünen \"Otomatik Doldurma Seçenekleri\" butonundan seri türünü değiştirebilirsiniz (kopya, seri, yalnızca biçimlendirme vb.).",
              "Sağ tuş ile sürüklerseniz Excel size seçenekler sunar: günler, haftanın günleri, aylar, yıllar.",
            ],
          },
          {
            name: "Flash Fill (Hızlı Doldurma)",
            use: "Excel deseni otomatik algılayarak geri kalan hücreleri doldurur. Metin birleştirme, ayırma, format değiştirme gibi işlemleri formül yazmadan yapar.",
            syntax: "Veri sekmesi → Hızlı Doldurma veya Ctrl+E",
            steps: [
              "A sütununda \"Ahmet Yılmaz\", \"Mehmet Kaya\" gibi ad-soyad bilgileri olsun.",
              "B1 hücresine sadece adı yazın: \"Ahmet\".",
              "B2 hücresine geçin ve Ctrl+E'ye basın.",
              "Excel deseni anlayarak tüm satırlara sadece adları yazar: \"Mehmet\", \"Ayşe\" vb.",
            ],
            tips: [
              "Flash Fill formül oluşturmaz, statik değerler yazar. Kaynak veri değişirse Flash Fill sonuçları güncellenmez — bu durumda metin formülleri tercih edin.",
              "Desen karmaşıksa ilk 2-3 örneği elle yazarak Excel'e deseni daha iyi öğretin.",
            ],
          },
        ],
      },
      /* ── TEMEL SSS'ler ── */
      {
        title: "Sık Sorulan: Ondalık Ayırıcı ve Bölge Ayarları",
        description: "Türkiye'de Excel formüllerinde virgül mü nokta mı kullanılır?",
        image: "/images/egitimler/temel-ondalik.png",
        functions: [{
          name: "Ondalık ayırıcı virgül mü nokta mı?",
          use: "Türkiye bölge ayarında formül parametreleri noktalı virgül (;) ile ayrılır, ondalık ayırıcı virgüldür. Sayı yazarken 12,5; formülde =TOPLA(A1;A2) kullanırsınız. İngilizce Excel'de virgül parametre ayırıcı, nokta ondalık ayırıcıdır.",
          details: "Bu fark, internetteki İngilizce Excel formüllerini kopyalarken en çok kafa karışıklığı yaratan konudur. İngilizce bir siteden =IF(A1>5,\"Yes\",\"No\") kopyalarsanız Türkçe Excel'de hata alırsınız. Doğrusu: =EĞER(A1>5;\"Evet\";\"Hayır\").",
          tips: [
            "İngilizce formüllerdeki virgülleri (,) noktalı virgüle (;) ve noktaları (.) virgüle (,) çevirin.",
            "Bölge ayarınızı Kontrol Paneli → Bölge → Ek Ayarlar'dan kontrol edebilirsiniz.",
          ],
        }],
      },
      {
        title: "Sık Sorulan: Değer Olarak Yapıştır",
        description: "Formül yerine sadece sonucu yapıştırmak.",
        image: "/images/egitimler/temel-deger-yapistir.png",
        functions: [{
          name: "Kopyaladığım formül değil, sonuç yapışsın",
          use: "Hücreyi kopyalayıp yapıştırırken Özel Yapıştır (Ctrl+Alt+V) kullanın; \"Değerler\" seçeneğini işaretleyin. Böylece formül değil, hesaplanmış sayı veya metin yapışır.",
          steps: [
            "Formüllü hücreleri seçin ve Ctrl+C ile kopyalayın.",
            "Hedef hücreye gidin.",
            "Ctrl+Alt+V tuşlarına basın (Özel Yapıştır penceresi açılır).",
            "\"Değerler\" seçeneğini işaretleyip Tamam'a basın.",
            "Alternatif kısayol: Kopyaladıktan sonra hedef hücreye sağ tık → Yapıştır Seçenekleri → \"123\" ikonu (Değerler).",
          ],
        }],
      },
      {
        title: "Sık Sorulan: Satır veya Sütun Sabitleme",
        description: "Kaydırırken başlıkların hep görünmesi.",
        image: "/images/egitimler/temel-bolmeleri-dondur.png",
        functions: [{
          name: "Bölmeleri dondur (Freeze Panes)",
          use: "Üst satırları veya sol sütunları sabitlemek için kullanılır. Büyük tablolarda aşağı kaydırdığınızda başlık satırının kaybolmaması için hayati önem taşır.",
          steps: [
            "Sadece üst satırı dondurmak: Görünüm → Bölmeleri Dondur → Üst Satırı Dondur.",
            "Hem satır hem sütun dondurmak: Sabitlemek istediğiniz satırın altındaki VE sütunun sağındaki hücreyi seçin. Örneğin 1. satır ve A sütunu sabitse B2'yi seçin. Sonra Görünüm → Bölmeleri Dondur.",
            "Dondurmayı kaldırmak: Görünüm → Bölmeleri Çöz.",
          ],
          tips: [
            "Tablo (Ctrl+T) kullanıyorsanız aşağı kaydırınca sütun başlıkları otomatik olarak Excel'in sütun harflerinin yerine görünür — ayrıca dondurma gerekmez.",
          ],
        }],
      },
      { title: "Sık Sorulan: Otomatik Toplam Kısayolu", description: "Hızlı toplam ve ortalama.", image: "/images/egitimler/temel-otomatik-toplam.png", functions: [{ name: "Alt + = ile otomatik TOPLA", use: "Toplam alınacak sayıların hemen altındaki (veya sağındaki) boş hücreyi seçin, Alt+= tuşlarına basın. Excel otomatik TOPLA formülünü yazar. Birden fazla satır/sütun seçiliyse her biri için ayrı TOPLA oluşur.", steps: ["Toplamın görüneceği boş hücreyi seçin (sayıların hemen altında).", "Alt+= tuşlarına basın — Excel otomatik olarak =TOPLA(üst_aralık) yazar.", "Enter'a basarak onaylayın. Birden fazla sütun için aynı satırdaki boş hücreleri seçip tek seferde Alt+= basabilirsiniz."], tips: ["Alt+= butonunun yanındaki küçük ok ile ORTALAMA, SAY, MAKS, MİN fonksiyonlarına da hızlı erişebilirsiniz."] }] },
      { title: "Sık Sorulan: Tarih Sayı Olarak Görünüyor", description: "Tarih yerine 45000 gibi sayı neden çıkar?", image: "/images/egitimler/temel-tarih-sayi.png", functions: [{ name: "Tarih hücresi neden sayı?", use: "Excel tarihleri seri numarası olarak saklar (1 Ocak 1900 = 1). Hücre \"Genel\" veya \"Sayı\" formatındaysa tarih sayı gibi görünür.", steps: ["Sayı görünen hücreyi seçin.", "Ctrl+1 ile Hücreleri Biçimlendir'i açın.", "Tarih kategorisini seçin ve istediğiniz tarih formatını belirleyin (GG.AA.YYYY gibi).", "Tamam'a basın — artık tarih doğru görünecektir."], tips: ["Bu sorun genellikle başka kaynaktan yapıştırılan verilerde olur. Önce hücre formatını Tarih yapın, sonra veriyi yapıştırın."] }] },
      { title: "Sık Sorulan: Boş Hücreleri Doldurma", description: "Aynı değeri yukarıdaki gibi doldurmak.", image: "/images/egitimler/temel-bos-hucre-doldur.png", functions: [{ name: "Boş hücrelere üstteki değeri yazmak", use: "Dış sistemlerden gelen raporlarda genellikle her grup başlığı bir kez yazılır, altındaki satırlar boş kalır. Bu boşlukları doldurmak filtreleme ve formüller için şarttır.", steps: ["Boşlukları doldurmak istediğiniz sütunu seçin (örn. A1:A100).", "F5 → Özel → Boşluklar → Tamam ile sadece boş hücreler seçilir.", "= yazıp yukarıdaki hücreyi referans alın (Excel otomatik olarak üstteki dolu hücreyi gösterir).", "Ctrl+Enter ile tüm seçime aynı formülü uygulayın.", "Son adım: Tüm sütunu seçip Ctrl+C → Ctrl+Alt+V → Değerler ile formülü sabit değere çevirin."] }] },
      { title: "Sık Sorulan: Yazdırma ve Sayfa Sığdırma", description: "Tüm sütunlar tek sayfaya sığsın.", image: "/images/egitimler/temel-yazdirma-sayfa.png", functions: [{ name: "Yazdırırken tüm sütunlar tek sayfaya", use: "Geniş tabloları yazdırırken sütunların kesilmemesi için ölçekleme veya sayfa yönü ayarları yapılması gerekir.", steps: ["Sayfa Düzeni → Yön → Yatay seçerek geniş tablolar için yatay yazdırmayı deneyin.", "Hâlâ sığmıyorsa: Sayfa Düzeni → Genişlik → \"1 sayfa\" seçin.", "Yazdırma Önizleme (Ctrl+P) ile sonucu kontrol edin.", "Çok küçüldüyse kenar boşluklarını daraltın: Sayfa Düzeni → Kenar Boşlukları → Dar."] }] },
      { title: "Sık Sorulan: Hücre Birleştirme Ne Zaman Sorun Çıkarır?", description: "Birleştirilmiş hücreler ve formül/filtre.", image: "/images/egitimler/temel-birlestirme.png", functions: [{ name: "Hücreleri birleştirmek ne zaman sakıncalı?", use: "Birleştirilmiş hücreler sıralama, filtre ve bazı formüllerde sorun çıkarabilir; birleşik alan tek hücre sayılır.", details: "Veri tablosunda birleştirme yapmayın — sıralama bozulur, DÜŞEYARA çalışmaz. Başlıklarda \"Birleştir ve Ortala\" yerine \"Seçimi Ortala\" özelliğini kullanın: Hücreleri Biçimlendir → Hizalama → Yatay: Seçimi Ortala. Bu görsel olarak aynı etkiyi verir ama hücreler ayrı kalır.", tips: ["Hücreleri birleştirme hatası genellikle tabloyu yazdırma düzenine göre şekillendirmeye çalışırken olur. Verilerinizi veri odaklı tutun, görselleştirmeyi biçimlendirme ile yapın."] }] },
      {
        title: "Sık Sorulan: Açılır Liste (Veri Doğrulama)",
        description: "Hücrede liste kutusu ile seçim yapmak: kullanıcıların yanlış veri girmesini önler.",
        image: "/images/egitimler/temel-acilir-liste.png",
        functions: [{
          name: "Dropdown liste nasıl yapılır?",
          use: "Veri Doğrulama ile hücrelere açılır liste ekleyerek kullanıcıların yalnızca belirlenen seçeneklerden birini girmesini sağlarsınız. Departman seçimi, durum belirleme, ürün kategorisi gibi standart değer girişlerinde kullanılır.",
          steps: [
            "Yöntem 1 — Aralıktan liste: Liste öğelerini bir sütuna yazın (örn. E1:E5'e departman adlarını). Listenin görüneceği hücreleri seçin → Veri → Veri Doğrulama → İzin Ver: Liste → Kaynak: =$E$1:$E$5.",
            "Yöntem 2 — Elle yazma: Kaynak kutusuna doğrudan yazın: Satış;Pazarlama;İK;Finans (noktalı virgülle ayırın).",
            "Hücrede aşağı ok butonu görünecektir; tıklayarak seçim yapılır.",
            "Geçersiz giriş uyarısı: Veri Doğrulama penceresinde Hata Uyarısı sekmesinden özel hata mesajı yazabilirsiniz.",
          ],
          tips: [
            "Liste kaynaklarını ayrı bir \"Ayarlar\" sayfasına yazarak organize edin.",
            "Listeyi Tablo (Ctrl+T) yaparsanız yeni öğe eklendiğinde açılır liste otomatik güncellenir.",
          ],
        }],
      },
      { title: "Sık Sorulan: Kopyala-Yapıştırda Sadece Biçim veya Sadece Değer", description: "Özel yapıştır seçenekleri.", image: "/images/egitimler/temel-ozel-yapistir.png", functions: [{ name: "Sadece biçimi veya sadece değeri yapıştırmak", use: "Kopyala (Ctrl+C) sonrası hedefe yapıştırırken Ctrl+Alt+V ile Özel Yapıştır açılır.", steps: ["Kaynak hücreleri seçin ve Ctrl+C ile kopyalayın.", "Hedef hücreleri seçin.", "Ctrl+Alt+V ile Özel Yapıştır'ı açın.", "Seçenekler: Değerler (sadece sayı/metin), Formüller (formülleri kopyalar), Biçimler (renk, kenarlık, yazı tipi), Sütun Genişlikleri.", "İstediğinizi seçip Tamam'a basın."], tips: ["En sık kullanılan: Değerler (formül yerine sonucu yapıştırır) ve Biçimler (başka hücrelerin görünümünü kopyalar)."] }] },
      { title: "Sık Sorulan: Formül Çubuğunun Kullanımı", description: "Formülü görmek ve düzenlemek.", image: "/images/egitimler/temel-formul-cubugu.png", functions: [{ name: "Formül çubuğu nerede ve nasıl kullanılır?", use: "Şerit altındaki uzun beyaz alan formül çubuğudur. Hücreye tıkladığınızda içeriğini (metin veya formül) burada görürsünüz.", steps: ["Herhangi bir hücreye tıklayın — formül çubuğunda içeriğini görürsünüz.", "Düzenleme için çubuğa tıklayın veya F2 tuşuna basın.", "Uzun formüller için çubuğun alt kenarından sürükleyerek genişletin.", "Ad Kutusu (sol taraf): Hücre adresini gösterir; buraya adres yazarak hızlıca o hücreye gidebilirsiniz."] }] },
      { title: "Sık Sorulan: Sayfa Kopyalama ve Taşıma", description: "Çalışma sayfasını kopyalamak veya başka dosyaya taşımak.", image: "/images/egitimler/temel-sayfa-kopyalama.png", functions: [{ name: "Sayfa sekmesini kopyalamak", use: "Sayfa sekmesine sağ tık → Taşı veya Kopyala → \"Kopya oluştur\" onay kutusunu işaretleyin → Tamam.", steps: ["Sayfa sekmesine sağ tıklayın → Taşı veya Kopyala'yı seçin.", "\"Kopya oluştur\" kutucuğunu işaretleyin.", "Başka dosyaya kopyalamak için \"Kitap\" listesinden hedef dosyayı seçin.", "Tamam'a basın. Kopya sayfanın adı sonuna (2) eklenerek oluşturulur."], tips: ["Hızlı yol: Ctrl tuşuna basılı tutarak sayfa sekmesini sürükleyin — kopyası oluşur."] }] },
      { title: "Sık Sorulan: Hücre ve Sayfa Koruma", description: "Yanlışlıkla değiştirmeyi engellemek.", image: "/images/egitimler/temel-sayfa-koruma.png", functions: [{ name: "Hücreleri veya sayfayı nasıl korurum?", use: "Rapor ve şablonlarda formüllerin veya başlıkların yanlışlıkla silinmesini önlemek için kullanılır.", steps: ["Düzenlenmesini istediğiniz hücreleri seçin (örn. veri giriş alanları).", "Ctrl+1 → Koruma sekmesi → \"Kilitli\" kutucuğunun işaretini kaldırın → Tamam.", "Gözden Geçir → Sayfayı Koru → İsteğe bağlı şifre girin → Tamam.", "Artık kilitli hücreler düzenlenemez, kilidini kaldırdığınız hücrelere veri girilebilir."], tips: ["Varsayılanda tüm hücreler \"Kilitli\" olarak işaretlidir ama koruma aktif olana kadar bu kilitleme etkisizdir."] }] },
      { title: "Sık Sorulan: Hızlı Erişim Çubuğu Özelleştirme", description: "En çok kullandığın komutlara tek tıkla ulaşmak.", image: "/images/egitimler/temel-hizli-erisim.png", functions: [{ name: "Hızlı Erişim Çubuğunu özelleştirmek", use: "Sol üst köşedeki küçük çubuğa en sık kullandığınız komutları ekleyerek iş akışınızı hızlandırın.", steps: ["Sol üst köşedeki Hızlı Erişim Çubuğu'nun yanındaki aşağı ok → Diğer Komutlar.", "Sol panelden komutu bulun (Değer Olarak Yapıştır, Hücreleri Biçimlendir, vb.).", "\"Ekle >>\" butonuyla sağ panele taşıyın.", "Tamam'a basın — komut artık tek tıkla erişilebilir."] }] },
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
        description: "Farklı sayfalardaki veya tablolardaki verileri tek bir raporda birleştirmek, Excel'deki en güçlü becerilerden biridir. Müşteri listesinden ad çekmek, ürün tablosundan fiyat getirmek gibi senaryolarda bu fonksiyonlar vazgeçilmezdir.",
        functions: [
          {
            name: "DÜŞEYARA",
            use: "Bir anahtara göre tablodan ilgili bilgiyi çeker. Excel'in en bilinen arama fonksiyonudur. Müşteri numarasından müşteri adını, ürün kodundan fiyatı veya personel sicil numarasından departmanı bulmak gibi senaryolarda kullanılır.",
            syntax: "=DÜŞEYARA(aranan_değer; tablo_aralığı; sütun_indisi; [aralık_bak])",
            params: [
              { name: "aranan_değer", description: "Aranacak değer — genellikle bir kod, numara veya isim (örn. D1 hücresindeki ürün kodu)." },
              { name: "tablo_aralığı", description: "Aramanın yapılacağı tablo aralığı. Aranan değer bu tablonun İLK sütununda olmalıdır (örn. A2:D100)." },
              { name: "sütun_indisi", description: "Sonuç olarak getirilecek sütunun tablodaki numarası. İlk sütun=1, ikinci sütun=2..." },
              { name: "aralık_bak", description: "0 veya YANLIŞ = tam eşleşme (neredeyse her zaman bunu kullanın); 1 veya DOĞRU = yaklaşık eşleşme." },
            ],
            steps: [
              "Arama tablonuzu hazırlayın: İlk sütunda aranan değerler (ürün kodu, sicil no vb.), diğer sütunlarda getirmek istediğiniz bilgiler olmalı.",
              "Sonucun görüneceği hücreye =DÜŞEYARA( yazın.",
              "Aranan değeri girin (başka bir hücre referansı veya doğrudan değer): örn. D1",
              "Noktalı virgül koyup tabloyu seçin: ;A2:C100 — Dikkat: tablo aralığını mutlak referans ($A$2:$C$100) yapmayı unutmayın ki formülü kopyalayınca bozulmasın.",
              "Getirmek istediğiniz sütunun numarasını yazın: ;2 (tablodaki ikinci sütun).",
              "Son parametreyi yazın: ;0 (tam eşleşme). Parantezi kapatıp Enter'a basın.",
              "Tam formül: =DÜŞEYARA(D1;$A$2:$C$100;2;0)",
            ],
            tips: [
              "Aranan değer tablonun ilk sütununda olmalıdır — bu DÜŞEYARA'nın en büyük kısıtlamasıdır. Aranan değer başka bir sütundaysa İNDİS+KAÇINCI veya XLOOKUP kullanın.",
              "Hata alıyorsanız: (1) Aranan değerin veri tipini kontrol edin (metin mi sayı mı?), (2) Tablo aralığında aranan sütun gerçekten ilk sütun mu?",
              "EĞERHATA ile sararak #YOK hatalarını gizleyin: =EĞERHATA(DÜŞEYARA(D1;$A$2:$C$100;2;0);\"Bulunamadı\").",
            ],
          },
          {
            name: "XLOOKUP (ÇAPRAZARA)",
            use: "DÜŞEYARA'nın modern ve çok daha esnek alternatifidir. Aranan değerin tablonun ilk sütununda olması zorunluluğu yoktur, sola da bakabilir, bulunamadığında varsayılan değer döndürebilir. Excel 365 ve Excel 2021+ sürümlerinde kullanılabilir.",
            syntax: "=XLOOKUP(aranan; arama_aralığı; dönüş_aralığı; [bulunamazsa]; [eşleşme_türü]; [arama_modu])",
            params: [
              { name: "aranan", description: "Aranacak değer (hücre referansı veya doğrudan değer)." },
              { name: "arama_aralığı", description: "Aranan değerin aranacağı tek sütun veya satır." },
              { name: "dönüş_aralığı", description: "Eşleşme bulunduğunda sonucun alınacağı sütun veya satır. Arama aralığı ile aynı boyutta olmalıdır." },
              { name: "bulunamazsa", description: "Eşleşme yoksa gösterilecek değer — EĞERHATA kullanma ihtiyacını ortadan kaldırır." },
              { name: "eşleşme_türü", description: "0 = tam eşleşme (varsayılan), -1 = tam veya bir küçük, 1 = tam veya bir büyük, 2 = joker (*, ?) destekli." },
            ],
            steps: [
              "Sonucun görüneceği hücreye =XLOOKUP( yazın.",
              "Aranan değeri girin: D1",
              "Arama aralığını seçin (tek sütun): ;B2:B100 — Bu sütunda arama yapılır.",
              "Dönüş aralığını seçin (sonucu alacağınız sütun): ;C2:C100 — Eşleşen satırdaki değer döndürülür.",
              "İsteğe bağlı: Bulunamazsa değeri ekleyin: ;\"Kayıt yok\".",
              "Parantezi kapatıp Enter'a basın. Tam formül: =XLOOKUP(D1;B2:B100;C2:C100;\"Kayıt yok\")",
            ],
            tips: [
              "DÜŞEYARA'dan farkları: (1) Sola bakabilir, (2) Sütun numarası saymak gerekmez, (3) Bulunamazsa değeri içeridedir — EĞERHATA gerekmez, (4) Birden fazla sütun döndürebilir.",
              "Excel 365 veya 2021 kullanmıyorsanız XLOOKUP yerine İNDİS+KAÇINCI kullanmanız gerekir.",
              "Eski ve yeni Excel sürümleri karışık kullanılan ofislerde DÜŞEYARA tercih edin; dosya uyumluluk sorunu yaşamaz.",
            ],
          },
          {
            name: "İNDİS + KAÇINCI",
            use: "Her Excel sürümünde çalışan, DÜŞEYARA'dan daha esnek bir arama kombinasyonudur. KAÇINCI aranan değerin satır numarasını bulur, İNDİS o satır numarasından sonucu getirir. DÜŞEYARA'nın 'aranan değer ilk sütunda olmalı' kısıtlaması yoktur.",
            syntax: "=İNDİS(dönüş_aralığı; KAÇINCI(aranan; arama_aralığı; 0))",
            params: [
              { name: "dönüş_aralığı (İNDİS)", description: "Sonuç alınacak sütun (örn. C2:C100)." },
              { name: "aranan (KAÇINCI)", description: "Aranacak değer (örn. D1)." },
              { name: "arama_aralığı (KAÇINCI)", description: "Aranacak sütun (örn. B2:B100). Tek sütun veya satır olmalıdır." },
              { name: "eşleşme_türü", description: "0 = tam eşleşme (neredeyse her zaman 0 kullanın)." },
            ],
            steps: [
              "İlk adım — KAÇINCI ile satır numarasını bulun: =KAÇINCI(D1;A2:A100;0) — D1'deki değer A sütununda kaçıncı satırda?",
              "İkinci adım — İNDİS ile sonucu getirin: =İNDİS(C2:C100;KAÇINCI(D1;A2:A100;0))",
              "Bu formül D1'deki değeri A sütununda arar, bulduğu satırdaki C sütunu değerini döndürür.",
              "Avantaj: Arama sütunu herhangi bir yerde olabilir — sola da sağa da bakabilirsiniz.",
            ],
            tips: [
              "İNDİS+KAÇINCI her Excel sürümünde çalışır ve DÜŞEYARA'dan daha az kırılgandır (sütun eklenince sütun numarası bozulmaz).",
              "İki boyutlu arama yapabilirsiniz: =İNDİS(tablo; KAÇINCI(satır_aranan;satır_başlıklar;0); KAÇINCI(sütun_aranan;sütun_başlıklar;0)).",
            ],
          },
        ],
      },
      {
        title: "Koşullu Toplama & Sayma",
        description: "Tüm veriyi toplamak yerine sadece belirli kritere uyan satırları saymak veya toplamak. \"Sadece İstanbul'daki satışları topla\" veya \"Bu ay kaç fatura kesildi?\" gibi sorulara yanıt verir.",
        functions: [
          {
            name: "EĞERSAY",
            use: "Tek bir koşulu sağlayan hücreleri sayar. \"Kaç satırda 'İstanbul' yazıyor?\" veya \"50'den büyük kaç değer var?\" gibi sorulara cevap verir.",
            syntax: "=EĞERSAY(aralık; ölçüt)",
            params: [
              { name: "aralık", description: "Sayılacak hücre aralığı (örn. A2:A1000)." },
              { name: "ölçüt", description: "Koşul: metin için \"İstanbul\", sayı karşılaştırma için \">50\", joker için \"*rapor*\" yazın." },
            ],
            steps: [
              "Sonucun görüneceği hücreye =EĞERSAY( yazın.",
              "Kontrol edilecek aralığı seçin: A2:A1000",
              "Ölçütü belirleyin: ;\"İstanbul\" veya ;\">50\" veya ;D1 (başka bir hücredeki değer).",
              "Parantezi kapatıp Enter'a basın.",
            ],
            tips: [
              "Joker karakterler: * (sıfır veya daha fazla karakter), ? (tek karakter). Örn: \"*Excel*\" → içinde Excel geçen tüm metinler.",
              "Boş olmayan hücreleri saymak: =EĞERSAY(A:A;\"<>\") — Boş olanları saymak: =SAYBOŞ(A:A).",
            ],
          },
          {
            name: "ÇOKETOPLA",
            use: "Birden fazla kritere göre toplam alır. \"İstanbul'daki ve 2025 yılındaki satışların toplamı\" gibi çok koşullu senaryolarda kullanılır. ETOPLA'nın gelişmiş versiyonudur.",
            syntax: "=ÇOKETOPLA(toplam_aralığı; ölçüt_aralığı1; ölçüt1; [ölçüt_aralığı2; ölçüt2]; ...)",
            params: [
              { name: "toplam_aralığı", description: "Toplanacak sayıların bulunduğu aralık (her zaman İLK parametre)." },
              { name: "ölçüt_aralığı1; ölçüt1", description: "İlk koşul: hangi aralıkta, hangi değer aranacak." },
              { name: "ölçüt_aralığı2; ölçüt2; ...", description: "İkinci ve sonraki koşul çiftleri. Tüm koşulları aynı anda sağlayan satırlar toplanır (VE mantığı)." },
            ],
            steps: [
              "=ÇOKETOPLA( yazın.",
              "Toplanacak aralığı seçin: D2:D1000 (tutar sütunu).",
              "Birinci koşul: ;A2:A1000;\"İstanbul\" (şehir sütununda İstanbul olanlar).",
              "İkinci koşul: ;B2:B1000;\">=\"&TARİH(2025;1;1) (tarih sütununda 2025 ve sonrası).",
              "Parantezi kapatıp Enter'a basın.",
            ],
            tips: [
              "ETOPLA ile farkı: ETOPLA tek koşul alır ve parametre sırası farklıdır (toplam_aralığı sonda). ÇOKETOPLA'da toplam_aralığı BAŞTA'dır ve birden fazla koşul destekler.",
              "Tarih koşullarında \">=\"&TARİH(yıl;ay;gün) formülünü kullanın, düz tarih yazmak sorun çıkarabilir.",
            ],
          },
          {
            name: "ÇOKEĞERSAY",
            use: "Birden fazla koşulu sağlayan satırların sayısını bulur. \"İstanbul'daki ve aktif olan müşteri sayısı\" gibi çok koşullu saymalarda kullanılır.",
            syntax: "=ÇOKEĞERSAY(ölçüt_aralığı1; ölçüt1; [ölçüt_aralığı2; ölçüt2]; ...)",
            params: [
              { name: "ölçüt_aralığı1; ölçüt1", description: "İlk koşul: aralık ve kriter." },
              { name: "ölçüt_aralığı2; ölçüt2; ...", description: "Diğer koşul çiftleri; tüm koşulları sağlayan satırlar sayılır." },
            ],
            steps: [
              "=ÇOKEĞERSAY( yazın.",
              "Birinci koşul: A2:A1000;\"İstanbul\"",
              "İkinci koşul: ;C2:C1000;\"Aktif\"",
              "Parantezi kapatın. Sonuç: Her iki koşulu da sağlayan satır sayısı.",
            ],
          },
        ],
      },
      {
        title: "Metinle Çalışma",
        description: "CRM, ERP, muhasebe programları veya dış sistemlerden gelen verilerde genellikle metin temizliği gerekir: gereksiz boşluklar, birleşik alanlar, tutarsız büyük/küçük harf kullanımı gibi sorunlar metin fonksiyonlarıyla çözülür.",
        functions: [
          {
            name: "SAĞ / SOL / PARÇAAL",
            use: "Metnin istediğiniz bölümünü çekmek için kullanılır. TC kimlik numarasının son 4 hanesi, posta kodunun ilk 2 rakamı veya bir kodun ortasındaki bölüm gibi senaryolarda işe yarar.",
            syntax: "=SAĞ(metin; karakter_sayısı)  =SOL(metin; karakter_sayısı)  =PARÇAAL(metin; başlangıç; uzunluk)",
            params: [
              { name: "metin", description: "İşlenecek metin veya hücre." },
              { name: "karakter_sayısı", description: "SAĞ/SOL: alınacak karakter sayısı." },
              { name: "başlangıç; uzunluk (PARÇAAL)", description: "Başlangıç pozisyonu (1'den başlar) ve alınacak karakter sayısı." },
            ],
            steps: [
              "Son 4 karakter: =SAĞ(A2;4) → \"12345678\" den \"5678\" alır.",
              "İlk 2 karakter: =SOL(A2;2) → \"34İstanbul\" dan \"34\" alır.",
              "Ortadan çekme: =PARÇAAL(A2;3;5) → 3. karakterden başlayarak 5 karakter alır.",
              "Dinamik ayırma: Tire (-) ile ayrılmış kodun ikinci bölümünü almak: =PARÇAAL(A2;BUL(\"-\";A2)+1;UZUNLUK(A2))",
            ],
            tips: [
              "BUL veya ARA fonksiyonuyla ayırıcı karakterin pozisyonunu bulup PARÇAAL ile dinamik çekme yapabilirsiniz.",
            ],
          },
          {
            name: "BİRLEŞTİR / METNEBİRLEŞTİR / & Operatörü",
            use: "Birden fazla hücredeki metni tek hücrede birleştirir. Ad+Soyad, Şehir+İlçe veya özel formatlı rapor metni oluşturmak için kullanılır.",
            syntax: "=BİRLEŞTİR(metin1;\" \";metin2)  veya  =A2&\" \"&B2  veya  =METNEBİRLEŞTİR(\" \";DOĞRU;aralık)",
            params: [
              { name: "metin1, metin2, ...", description: "Birleştirilecek metinler veya hücreler." },
              { name: "ayırıcı (METNEBİRLEŞTİR)", description: "Metinler arasına konacak karakter (\" \", \", \" vb.)." },
            ],
            steps: [
              "& operatörü ile: =A2&\" \"&B2 → \"Ahmet\" + \" \" + \"Yılmaz\" = \"Ahmet Yılmaz\".",
              "BİRLEŞTİR ile: =BİRLEŞTİR(A2;\" \";B2) → aynı sonuç.",
              "METNEBİRLEŞTİR (Excel 2019+): =METNEBİRLEŞTİR(\", \";DOĞRU;A2:A10) → boş hücreleri atlayarak virgülle birleştirir.",
            ],
            tips: [
              "& operatörü en hızlı yoldur ve her versiyonda çalışır. METNEBİRLEŞTİR boş hücreleri otomatik atlayabilir.",
              "Sayıları metinle birleştirirken format kaybı olabilir: =A2&\" TL\" yerine =METİN(A2;\"#.##0,00\")&\" TL\" kullanarak formatı koruyun.",
            ],
          },
          {
            name: "UZUNLUK / KIRP / TEMİZ / BÜYÜKHARF / KÜÇÜKHARF",
            use: "Metin kalitesini kontrol etmek ve düzeltmek için bir dizi yardımcı fonksiyon. Fazla boşlukları temizlemek, karakter sayısını kontrol etmek, büyük/küçük harf dönüşümü yapmak.",
            syntax: "=UZUNLUK(metin) =KIRP(metin) =TEMİZ(metin) =BÜYÜKHARF(metin) =KÜÇÜKHARF(metin) =YAZIM.DÜZENİ(metin)",
            steps: [
              "Karakter sayısını kontrol: =UZUNLUK(A2) — TC kimlik no 11 karakter mi kontrol edin.",
              "Baştaki/sondaki boşlukları temizle: =KIRP(A2) — \"  Ahmet  \" → \"Ahmet\".",
              "Görünmeyen karakterleri temizle: =TEMİZ(A2) — dış sistemlerden gelen satır sonu, sekme gibi karakterleri siler.",
              "Büyük/küçük harf: =BÜYÜKHARF(A2) → \"AHMET\", =KÜÇÜKHARF(A2) → \"ahmet\", =YAZIM.DÜZENİ(A2) → \"Ahmet Yılmaz\" (her kelimenin ilk harfi büyük).",
            ],
            tips: [
              "Dış sistemlerden gelen verilerde KIRP + TEMİZ birlikte kullanmak iyi bir pratiktir: =KIRP(TEMİZ(A2)). Bu, DÜŞEYARA eşleşme sorunlarının çoğunu çözer.",
            ],
          },
        ],
      },
      {
        title: "Tarih & Saat Fonksiyonları",
        description: "Satış, abonelik, vade hesaplama ve performans analizlerinde tarih bazlı hesaplamalar kritik önem taşır. Günlük fark hesaplama, ay bazlı gruplama ve dinamik tarih filtreleri oluşturabilirsiniz.",
        functions: [
          {
            name: "BUGÜN / ŞİMDİ",
            use: "BUGÜN sadece bugünün tarihini, ŞİMDİ tarih + saati döndürür. Her hesaplama veya dosya açılışında otomatik güncellenir. Kalan gün hesabı, vade kontrolü, raporlara dinamik tarih etiketi eklemek gibi senaryolarda kullanılır.",
            syntax: "=BUGÜN()  veya  =ŞİMDİ()",
            steps: [
              "Bugünün tarihini göstermek: =BUGÜN() — parametre almaz, parantezler boş kalır.",
              "Vade kontrolü: =BUGÜN()-A2 → A2'deki tarihten bu yana kaç gün geçtiğini hesaplar.",
              "Kalan gün: =A2-BUGÜN() → A2'deki son tarihe kaç gün kaldığını gösterir (negatifse vade geçmiştir).",
            ],
            tips: [
              "BUGÜN ve ŞİMDİ uçucu (volatile) fonksiyonlardır — dosya her açıldığında veya F9'a basıldığında güncellenir. Sabit bir tarih istiyorsanız Ctrl+; (noktalı virgül) ile bugünün tarihini sabit olarak yazabilirsiniz.",
            ],
          },
          {
            name: "GÜN / AY / YIL",
            use: "Tarih değerinden gün, ay veya yıl bileşenini çıkarır. Aylık raporlarda gruplama, doğum günü hesaplama veya yıl bazlı filtreleme için kullanılır.",
            syntax: "=GÜN(tarih)  =AY(tarih)  =YIL(tarih)",
            params: [{ name: "tarih", description: "Tarih içeren hücre veya geçerli bir tarih değeri." }],
            steps: [
              "Gün: =GÜN(A2) → 15.03.2025 için 15 döner.",
              "Ay: =AY(A2) → 15.03.2025 için 3 döner. Ay adını almak için: =METİN(A2;\"MMMM\") → \"Mart\".",
              "Yıl: =YIL(A2) → 2025 döner.",
              "Ay bazlı gruplama için yardımcı sütun: =YIL(A2)&\"-\"&METİN(AY(A2);\"00\") → \"2025-03\" formatında.",
            ],
          },
          {
            name: "EDATE / TARİHFARKI",
            use: "EDATE belirli bir tarihe ay ekler/çıkarır (vade hesaplama). TARİHFARKI (DATEDIF) iki tarih arası gün, ay veya yıl farkını hesaplar (yaş hesaplama).",
            syntax: "=EDATE(başlangıç_tarihi; ay_sayısı)  =TARİHFARKI(başlangıç; bitiş; birim)",
            params: [
              { name: "başlangıç_tarihi", description: "Başlangıç tarihi (hücre veya tarih)." },
              { name: "ay_sayısı (EDATE)", description: "Eklenecek ay sayısı (negatif olursa geriye gider)." },
              { name: "birim (TARİHFARKI)", description: "\"Y\" = tam yıl, \"M\" = tam ay, \"D\" = gün. \"YM\" = yıldan artan aylar, \"MD\" = aydan artan günler." },
            ],
            steps: [
              "3 ay sonraki vade: =EDATE(A2;3) — A2 tarihine 3 ay ekler.",
              "Yaş hesaplama: =TARİHFARKI(A2;BUGÜN();\"Y\") — doğum tarihinden bugüne kaç tam yıl.",
              "Kıdem (yıl-ay): =TARİHFARKI(A2;BUGÜN();\"Y\")&\" yıl \"&TARİHFARKI(A2;BUGÜN();\"YM\")&\" ay\".",
            ],
            tips: [
              "TARİHFARKI (DATEDIF) Excel'in gizli fonksiyonudur — formül sihirbazında görünmez ama çalışır. Başlangıç tarihi bitiş tarihinden büyükse hata verir.",
            ],
          },
        ],
      },
      {
        title: "İç İçe EĞER ve Çoklu Koşullar",
        description: "Not hesaplama, prim skalası, risk sınıflandırması gibi 3+ koşullu karar yapıları kurar. İç içe EĞER karmaşık ama güçlüdür; IFS fonksiyonu daha okunaklı alternatifidir.",
        image: "/images/egitimler/orta-ic-ice-eger.png",
        functions: [
          {
            name: "İç İçe EĞER",
            use: "Birden fazla koşulu sırayla kontrol ederek farklı sonuçlar döndürür. Not hesaplama, performans değerlendirme veya vergi dilimi hesaplaması gibi kademeli karar yapılarında kullanılır.",
            syntax: "=EĞER(koşul1; değer1; EĞER(koşul2; değer2; EĞER(koşul3; değer3; varsayılan)))",
            params: [{ name: "koşul1, değer1, ...", description: "En geniş koşuldan başlayın: 90+, 80+, 70+... Her EĞER'in yanlışsa kısmına yeni EĞER yazılır." }],
            steps: [
              "Senaryo: Puana göre harf notu. 90+ = A, 80-89 = B, 70-79 = C, 60-69 = D, 60 altı = F.",
              "Formül: =EĞER(A2>=90;\"A\";EĞER(A2>=80;\"B\";EĞER(A2>=70;\"C\";EĞER(A2>=60;\"D\";\"F\"))))",
              "Dikkat: Her EĞER bir parantez açar — sonunda tüm parantezleri kapatmanız gerekir. 4 koşul = 4 kapanış parantezi.",
              "Mantık: Koşulları büyükten küçüğe sıralayın. İlk doğru olan koşulun değeri döner, geri kalanlar kontrol edilmez.",
            ],
            tips: [
              "7'den fazla iç içe EĞER kullanılması okunurluk açısından önerilmez. Bu durumda IFS fonksiyonunu veya DÜŞEYARA ile aralık eşleşmesi kullanmayı düşünün.",
            ],
          },
          {
            name: "EĞER + VE / VEYA",
            use: "Bir EĞER fonksiyonu içinde birden fazla koşulu birlikte (VE) veya alternatif olarak (VEYA) kontrol eder. \"Hem satış hedefini tut HEM devamsızlık düşük olsun\" veya \"Ya İstanbul'dan olsun YA da VIP müşteri olsun\" gibi senaryolar.",
            syntax: "=EĞER(VE(A2>=100;B2<=3);\"Prim Hak Etti\";\"Prim Yok\")  =EĞER(VEYA(C2=\"İstanbul\";D2=\"VIP\");\"Öncelikli\";\"Normal\")",
            steps: [
              "VE ile: =EĞER(VE(A2>=100;B2<=3);\"Prim Hak Etti\";\"Prim Yok\") — her iki koşul da doğruysa prim verilir.",
              "VEYA ile: =EĞER(VEYA(C2=\"İstanbul\";D2=\"VIP\");\"Öncelikli\";\"Normal\") — en az bir koşul doğruysa öncelikli.",
            ],
          },
          {
            name: "IFS (EĞERLER)",
            use: "İç içe EĞER'in daha okunaklı alternatifidir. Koşul-sonuç çiftlerini sırayla yazar, parantez karmaşası yoktur. Excel 2019+ ve 365'te kullanılabilir.",
            syntax: "=IFS(koşul1; değer1; koşul2; değer2; ...; DOĞRU; varsayılan)",
            params: [{ name: "koşul-değer çiftleri", description: "İlk doğru olan koşulun değerini döndürür. Son çift olarak DOĞRU;varsayılan ekleyerek 'else' mantığı kurun." }],
            steps: [
              "Aynı not hesaplama örneği: =IFS(A2>=90;\"A\"; A2>=80;\"B\"; A2>=70;\"C\"; A2>=60;\"D\"; DOĞRU;\"F\")",
              "DOĞRU;\"F\" kısmı \"yukarıdaki hiçbir koşul tutmadıysa F yaz\" anlamına gelir — bu varsayılan (else) değeridir.",
            ],
            tips: [
              "DOĞRU;varsayılan çiftini son sıraya eklemeyi unutmayın, yoksa hiçbir koşul tutmadığında #YOK hatası alırsınız.",
            ],
          },
        ],
      },
      {
        title: "Yuvarlama ve Sayı İşleme",
        description: "Fatura, muhasebe ve finans hesaplamalarında kuruş hassasiyetini kontrol etmek, kalan bulmak ve sayıları istenen biçimde yuvarlamak için kullanılır.",
        image: "/images/egitimler/orta-yuvarlama.png",
        functions: [
          {
            name: "YUVARLAK",
            use: "Belirtilen ondalık basamağa normal matematik kurallarıyla yuvarlar (5 ve üzeri yukarı, altı aşağı). Fatura tutarlarını 2 ondalığa, istatistikleri tam sayıya yuvarlamak gibi senaryolarda kullanılır.",
            syntax: "=YUVARLAK(sayı; ondalık_basamak)",
            params: [
              { name: "sayı", description: "Yuvarlanacak sayı veya hücre." },
              { name: "ondalık_basamak", description: "Kaç ondalık basamağa: 0=tam sayı, 2=kuruş, -1=onlara yuvarlama, -2=yüzlere yuvarlama." },
            ],
            steps: [
              "Kuruşa yuvarla: =YUVARLAK(A2;2) → 127,856 → 127,86.",
              "Tam sayıya yuvarla: =YUVARLAK(A2;0) → 127,856 → 128.",
              "Onlara yuvarla: =YUVARLAK(A2;-1) → 127,856 → 130.",
            ],
          },
          {
            name: "YUKARIYUVARLA / AŞAĞIYUVARLA",
            use: "Her zaman yukarı veya her zaman aşağı yuvarlar. Tavan fiyat hesabı (her zaman yukarı) veya bütçe planlaması (her zaman aşağı, güvenli taraf) gibi senaryolarda kullanılır.",
            syntax: "=YUKARIYUVARLA(sayı; basamak)  =AŞAĞIYUVARLA(sayı; basamak)",
            steps: [
              "Yukarı: =YUKARIYUVARLA(3,2;0) → 4 (her zaman büyüğe).",
              "Aşağı: =AŞAĞIYUVARLA(3,8;0) → 3 (her zaman küçüğe).",
            ],
          },
          { name: "TAMSAYI", use: "En yakın alt tam sayıya yuvarlar. AŞAĞIYUVARLA(sayı;0) ile benzerdir ama negatif sayılarda davranışı farklıdır.", syntax: "=TAMSAYI(sayı)", params: [{ name: "sayı", description: "3,7 → 3; -2,3 → -3. Her zaman aşağı (küçüğe) yuvarlar." }] },
          { name: "MOD", use: "Bölme işleminin kalanını verir. Tek/çift sayı kontrolü, sıra numarası hesabı veya döngüsel dağıtım gibi senaryolarda kullanılır.", syntax: "=MOD(sayı; bölen)", params: [{ name: "sayı", description: "Bölünecek sayı." }, { name: "bölen", description: "Bölücü; örn. MOD(A2;2)=0 ise çift, =1 ise tek sayıdır." }], tips: ["Satır renklendirme formülünde sıkça kullanılır: =MOD(SATIR();2)=0 → çift satır mı kontrolü."] },
        ],
      },
      {
        title: "Koşullu Biçimlendirme (Formül Tabanlı)",
        description: "Verideki kritik değerleri, hedef aşımlarını, vadeleri veya aykırı değerleri renk, ikon ve çubuk ile otomatik vurgulayarak raporları bir bakışta okunur hale getirir. Dashboard'ların olmazsa olmazıdır.",
        image: "/images/egitimler/orta-kosullu-bicimlendirme.png",
        functions: [
          {
            name: "Renk Ölçeği ve Veri Çubuğu",
            use: "Hücre değerine göre arka plan rengini veya hücre içi çubuk uzunluğunu otomatik ayarlar. Isı haritası (heatmap) etkisi oluşturur — en yüksek değerler koyu yeşil, en düşükler koyu kırmızı gibi.",
            syntax: "Giriş → Koşullu Biçimlendirme → Renk Ölçekleri veya Veri Çubukları",
            steps: [
              "Biçimlendirilecek aralığı seçin (örn. C2:C100 — satış tutarları).",
              "Giriş → Koşullu Biçimlendirme → Renk Ölçekleri menüsünden istediğiniz renk geçişini seçin (yeşil-sarı-kırmızı vb.).",
              "Veri Çubukları için: Aynı menüden Veri Çubukları → istediğiniz rengi seçin. Hücre içinde değere orantılı çubuk görünür.",
              "Özelleştirme: Kuralları Yönet → Kuralı Düzenle ile minimum/maksimum değerleri, renkleri ve ölçek türünü (sayı, yüzde, formül) değiştirebilirsiniz.",
            ],
            tips: [
              "Veri çubukları özellikle dashboard'larda satış hedefi ilerleme çubuğu olarak mükemmel çalışır.",
            ],
          },
          {
            name: "İkon Seti",
            use: "Değere göre yeşil/sarı/kırmızı ok, bayrak, yıldız veya trafik ışığı gibi simgeler gösterir. KPI raporlarında performans durumunu hızlıca iletmek için kullanılır.",
            syntax: "Giriş → Koşullu Biçimlendirme → Simge Setleri",
            steps: [
              "Aralığı seçin → Koşullu Biçimlendirme → Simge Setleri → istediğiniz seti seçin (3 ok, 3 trafik ışığı, 5 yıldız vb.).",
              "Varsayılan eşik değerlerini değiştirmek: Kuralları Yönet → Kuralı Düzenle → Tür'ü \"Sayı\" yapıp kendi eşiklerinizi girin.",
              "Sadece ikonu göstermek (sayıyı gizlemek): \"Yalnızca Simgeyi Göster\" kutucuğunu işaretleyin.",
            ],
          },
          {
            name: "Formül Tabanlı Kural",
            use: "En esnek yöntem: kendi yazdığınız formüle göre hücreleri biçimlendirir. Vade geçmiş faturaları kırmızıya boyamak, hedefini aşanları yeşil yapmak, belirli koşulları sağlayan tüm satırı renklendirmek gibi.",
            syntax: "Koşullu Biçimlendirme → Yeni Kural → Formül Kullan",
            params: [{ name: "formül", description: "DOĞRU döndüğünde biçimlendirme uygulanır. Referanslarda satır için $ kullanmayın ki her satır kendi koşulunu kontrol etsin." }],
            steps: [
              "Biçimlendirilecek aralığı seçin (örn. A2:D100 — tüm tablo).",
              "Koşullu Biçimlendirme → Yeni Kural → \"Biçimlendirilecek hücreleri belirlemek için formül kullan\".",
              "Formül kutusuna yazın: =$C2>1000 (C sütunundaki değer 1000'den büyükse). $ sütun harfinin önünde: her satır kendi C değerini kontrol eder. Satır numarasında $ yok: satır kayar.",
              "\"Biçimlendir\" butonuyla dolgu rengini, yazı rengini veya kenarlığı ayarlayın.",
              "Tamam'a basın — koşulu sağlayan satırlar biçimlenir.",
            ],
            tips: [
              "TÜM SATIRI renklendirmek: Seçimi tüm tabloya uygulayın (A2:D100) ve formülde sadece kontrol sütununda $ kullanın (=$C2>1000). Bu şekilde C sütunundaki koşul tüm satırdaki hücrelere uygulanır.",
              "Birden fazla kural ekleyebilirsiniz (öncelik sırası önemli). Kuralları Yönet'ten sıralamayı düzenleyin.",
            ],
          },
        ],
      },
      {
        title: "Veri Doğrulama ve Bağımlı Listeler",
        description: "Kullanıcı girişlerini kontrol altında tutarak hatalı, tutarsız veya geçersiz veri girişini kaynağında önlersin. Özellikle birden fazla kişinin veri girdiği dosyalarda kritik önem taşır.",
        image: "/images/egitimler/orta-veri-dogrulama.png",
        functions: [
          {
            name: "Gelişmiş Açılır Liste",
            use: "Hücrelere açılır liste ekleyerek standart veri girişi sağlar. Departman seçimi, durum belirleme, ürün kategorisi gibi alanlar için kullanılır.",
            syntax: "Veri → Veri Doğrulama → İzin Ver: Liste → Kaynak: aralık veya metin",
            steps: [
              "Liste kaynaklarını ayrı bir sayfada (örn. \"Ayarlar\") tutun: A sütununda departmanlar, B sütununda şehirler vb.",
              "Listenin görüneceği hücreleri seçin.",
              "Veri → Veri Doğrulama → İzin Ver: Liste → Kaynak: =Ayarlar!$A$1:$A$10.",
              "Giriş Mesajı sekmesi: Hücre seçildiğinde gösterilecek yardım mesajı yazın (\"Departman seçiniz\").",
              "Hata Uyarısı sekmesi: Geçersiz giriş yapılırsa gösterilecek uyarı mesajını yazın.",
            ],
            tips: [
              "Kaynak aralığını Tablo yaparsanız yeni öğe eklendiğinde liste otomatik güncellenir.",
            ],
          },
          {
            name: "DOLAYLI ile Bağımlı Liste",
            use: "İlk listede seçilen değere göre ikinci liste dinamik olarak değişir. Şehir → İlçe, Kategori → Alt Kategori, Marka → Model gibi hiyerarşik seçim senaryolarında kullanılır.",
            syntax: "=DOLAYLI(A2) — A2'deki metni aralık adı olarak kullanır",
            steps: [
              "Ayarlar sayfasında her kategoriye ait değerleri ayrı ayrı yazın: İstanbul için A1:A5, Ankara için B1:B3 gibi.",
              "Bu aralıklara isim verin (Formüller → Ad Tanımla): \"İstanbul\", \"Ankara\" vb. — isimler boşluk içermemeli.",
              "İlk açılır listeyi oluşturun (C2): Veri Doğrulama → Liste → kaynak şehir listesi.",
              "İkinci açılır listeyi oluşturun (D2): Veri Doğrulama → Liste → Kaynak: =DOLAYLI(C2) yazın.",
              "C2'de \"İstanbul\" seçildiğinde D2 listesi otomatik olarak İstanbul ilçelerini gösterir.",
            ],
            tips: [
              "Ad Tanımla'da isim olarak kullanılan metinlerde boşluk veya özel karakter olamaz. \"İstanbul\" yerine \"Istanbul\" kullanın veya YERİNEKOY ile düzeltin.",
            ],
          },
          {
            name: "Sayı ve Tarih Doğrulama",
            use: "Hücreye yalnızca belirli aralıktaki sayıları veya tarihleri girilebilmesini sağlar. Yaş alanına 0-120 arası, tarih alanına gelecek tarih gibi kısıtlamalar koyar.",
            syntax: "Veri → Veri Doğrulama → İzin Ver: Tam Sayı / Ondalık / Tarih",
            steps: [
              "Hücreleri seçin → Veri → Veri Doğrulama.",
              "İzin Ver: Tam Sayı → Veri: arasında → Minimum: 0, Maksimum: 120.",
              "Tarih doğrulama: İzin Ver: Tarih → Veri: büyüktür → Başlangıç: =BUGÜN() (gelecek tarih zorunlu).",
              "Hata mesajı yazın: \"Lütfen 0-120 arası bir yaş giriniz\" gibi anlaşılır bir metin.",
            ],
          },
        ],
      },
      /* ── ORTA SSS'ler ── */
      { title: "Sık Sorulan: İki Listeyi Karşılaştırma", description: "A'da var B'de yok gibi listeler.", image: "/images/egitimler/orta-iki-listeyi-karsilastir.png", functions: [{ name: "İki listeyi karşılaştırmak (A'da var B'de yok)", use: "EĞERSAY ile: B listesinde olmayan A kayıtlarını bulmak için yardımcı sütunda =EĞERSAY(B:B;A2)=0 formülü kullanılabilir.", steps: ["Yardımcı sütuna formül yazın: =EĞERSAY($D:$D;A2) → A2 değeri D sütununda kaç kez geçiyor?", "Sonuç 0 ise A2 değeri D sütununda yoktur.", "Filtreleyerek sadece 0 olanları gösterin — bunlar A'da olup B'de olmayan kayıtlardır.", "Excel 365 kullanıyorsanız: =FİLTRE(A:A;EĞERSAY(B:B;A:A)=0) tek formülle listeyi çıkarır."], tips: ["Karşılaştırma yapmadan önce her iki listeyi de KIRP ile temizleyin — gizli boşluklar eşleşmeyi bozar."] }] },
      { title: "Sık Sorulan: #YOK Hatası", description: "DÜŞEYARA veya arama formüllerinde bulunamadı.", image: "/images/egitimler/orta-yok-hatasi.png", functions: [{ name: "#YOK neden olur, nasıl gizlenir?", use: "#YOK, aranan değer tabloda bulunamadığında (DÜŞEYARA, KAÇINCI vb.) oluşur.", steps: ["EĞERHATA ile gizleme: =EĞERHATA(DÜŞEYARA(D1;A:B;2;0);\"-\").", "Sebep araştırma: (1) Veri tipi uyumsuzluğu (metin-sayı), (2) Fazla boşluk, (3) Aranan değer tabloda yok.", "Veri tipi sorunu: Aranan metin ama tabloda sayı ise (veya tersi) eşleşme olmaz. Her iki tarafı da aynı tipte tutun."], tips: ["EĞERYOK sadece #YOK hatasını yakalar (diğer hataları yakalamaz). EĞERHATA tüm hata türlerini yakalar."] }] },
      { title: "Sık Sorulan: #BAŞV! (#REF!) Hatası", description: "Geçersiz hücre referansı.", image: "/images/egitimler/orta-basv-hatasi.png", functions: [{ name: "#BAŞV! hatası ne anlama gelir?", use: "Silinen satır/sütun veya taşınan hücreye referans kaldığında oluşur. Formülde artık var olmayan bir aralık yazıyorsa #BAŞV! görürsünüz. Çözüm: Formülü düzeltip doğru aralığı yazın veya silme/taşıma işlemini geri alın (Ctrl+Z)." }] },
      { title: "Sık Sorulan: Metin Olarak Kaydedilmiş Sayılar", description: "Sol hizalı sayılar, toplam almıyor.", image: "/images/egitimler/orta-metin-sayi.png", functions: [{ name: "Metin olan sayıları sayıya çevirmek", use: "Sol hizalı, yeşil uyarı köşesi varsa hücre \"metin\" formatındadır.", steps: ["Tek hücre: Yeşil uyarı ikonuna tıklayın → \"Sayıya Dönüştür\".", "Toplu çevirme: Boş bir hücreye 1 yazın ve kopyalayın. Sayıya çevrilecek aralığı seçin → Özel Yapıştır → Çarp. Bu işlem metinleri sayıya çevirir.", "Alternatif: =DEĞER(A2) formülü ile metin-sayı dönüşümü."] }] },
      { title: "Sık Sorulan: Tarih ve Saati Ayrı Sütunlara Bölmek", description: "Tarih + saat tek hücredeyse.", image: "/images/egitimler/orta-tarih-saat-ayir.png", functions: [{ name: "Tarih ve saati ayırmak", use: "Tarih için =TAMSAYI(A2), saat için =A2-TAMSAYI(A2) ve hücreyi saat formatında gösterin.", steps: ["Tarih ayırma: =TAMSAYI(A2) — tam sayı kısmı tarihtir. Hücreyi Tarih formatına getirin.", "Saat ayırma: =A2-TAMSAYI(A2) — ondalık kısmı saattir. Hücreyi Saat formatına (ss:dd) getirin.", "Alternatif: =SAAT(A2) ile saat, =DAKİKA(A2) ile dakika ayrı alınabilir."] }] },
      { title: "Sık Sorulan: Koşullu Biçimlendirme ile Vurgulama", description: "Belirli koşula göre renklendirme.", image: "/images/egitimler/orta-kosullu-bicim.png", functions: [{ name: "Koşula göre hücre rengi vermek", use: "Biçimlendirilecek aralığı seçin → Giriş → Koşullu Biçimlendirme → Kural türü seçin.", steps: ["Hazır kural: Koşullu Biçimlendirme → Hücre Vurgulama Kuralları → \"Büyüktür\" → 50 yazın → Format seçin (kırmızı dolgu, yeşil metin vb.).", "Formül ile: Yeni Kural → Formül Kullan → =$C2>=$D2 (gerçekleşen >= hedef ise yeşil). Biçimlendir butonuyla renk seçin.", "Birden fazla kural uygulanabilir: Farklı eşiklere farklı renkler (0-50 kırmızı, 50-80 sarı, 80+ yeşil)."] }] },
      { title: "Sık Sorulan: Yinelenenleri Kaldırma", description: "Tekrarlayan satırları temizlemek.", image: "/images/egitimler/orta-yinelenenleri-kaldir.png", functions: [{ name: "Tekrarlayan satırları kaldırmak", use: "Veri sekmesi → Yinelenenleri Kaldır.", steps: ["Önce veri kopyanızı alın (Ctrl+A → Ctrl+C → yeni sayfaya Ctrl+V).", "Veriyi seçin → Veri → Yinelenenleri Kaldır.", "Hangi sütunlara göre tekrar sayılacağını seçin (tümü veya belirli sütunlar).", "Tamam'a basın — kaç adet yinelenen kaldırıldığı bildirilir."], tips: ["Bu işlem kalıcıdır — her zaman önce yedek alın. Koşullu Biçimlendirme → Yinelenen Değerler ile önce göz atabilirsiniz."] }] },
      { title: "Sık Sorulan: Metni Sütunlara Bölme", description: "Virgülle veya ayırıcıyla ayrılmış metin.", image: "/images/egitimler/orta-metni-sutunlara.png", functions: [{ name: "Virgülle ayrılmış metni sütunlara bölmek", use: "Veri → Metni Sütunlara Dönüştür sihirbazı ile ayırıcıya göre böler.", steps: ["Bölünecek sütunu seçin.", "Veri → Metni Sütunlara Dönüştür'ü tıklayın.", "\"Sınırlandırılmış\" seçin → İleri.", "Ayırıcı: Virgül, Noktalı Virgül, Sekme veya Diğer (özel karakter) seçin.", "Önizlemeyi kontrol edip Son'a basın."], tips: ["Sağ taraftaki sütunlarda veri varsa bölme işlemi onların üzerine yazar — önce boş sütunlar açın."] }] },
      { title: "Sık Sorulan: Tabloda Formül Otomatik Genişlemesi", description: "Excel tablosunda yeni satıra formül yayılması.", image: "/images/egitimler/orta-tablo-formul.png", functions: [{ name: "Tablo (Ctrl+T) formülü otomatik dolduruyor mu?", use: "Evet. Tablo sütunundaki bir hücreye formül yazdığınızda Excel tüm satırlara otomatik uygular. Yeni satır eklediğinizde formül otomatik iner. Tablo kullanmak bu yüzden en iyi pratiktir." }] },
      { title: "Sık Sorulan: Ad Tanımla ile Formülleri Okunaklı Yapma", description: "Aralıklara isim vermek.", image: "/images/egitimler/orta-ad-tanimla.png", functions: [{ name: "Formülde A1:B10 yerine isim kullanmak", use: "Formüller sekmesi → Ad Tanımla ile aralıklara anlamlı isimler verebilirsiniz.", steps: ["Aralığı seçin (örn. B2:B100).", "Formüller → Ad Tanımla → Ad: \"SatisTutarlari\" yazın → Tamam.", "Artık formüllerde =TOPLA(SatisTutarlari) yazabilirsiniz — A1:B100 yazmaktan çok daha okunurdur.", "Tanımlı adları görmek: Formüller → Ad Yöneticisi."] }] },
      { title: "Sık Sorulan: ETOPLA vs ÇOKETOPLA Farkı", description: "Hangisini ne zaman kullanmalı?", image: "/images/egitimler/orta-etopla-coketopla.png", functions: [{ name: "ETOPLA ve ÇOKETOPLA farkı nedir?", use: "ETOPLA (SUMIF) tek koşullu toplam alır: =ETOPLA(aralık;kriter;toplam_aralığı). ÇOKETOPLA (SUMIFS) birden fazla koşul destekler ve parametre sırası farklıdır: toplam_aralığı ilk sırada.", tips: ["Yeni dosyalarda her zaman ÇOKETOPLA tercih edin — tek koşulda bile çalışır ve sonradan koşul eklemeniz kolaylaşır."] }] },
      { title: "Sık Sorulan: Excel Hata Türleri Özeti", description: "Tüm hata kodlarının anlamı.", image: "/images/egitimler/orta-hata-turleri.png", functions: [{ name: "#YOK, #DEĞER!, #BAŞV!, #AD?, #BÖL/0! ne anlama gelir?", use: "#YOK: Arama sonuçsuz. #DEĞER!: Yanlış veri tipi (metin+sayı). #BAŞV!: Silinen hücreye referans. #AD?: Excel tanımadığı fonksiyon adı. #BÖL/0!: Sıfıra bölme. Her hata için EĞERHATA ile yakalama yapılabilir.", tips: ["Hata bulmak için: Formüller → Hata Denetimi → Öncülleri İzle ile formülün hangi hücrelerden beslediğini görün."] }] },
      { title: "Sık Sorulan: Formülleri Görünür Yapma (Ctrl+`)", description: "Tüm formülleri aynı anda görmek.", image: "/images/egitimler/orta-formul-gorunur.png", functions: [{ name: "Formülleri ekranda görmek", use: "Ctrl+` (ESC altındaki tuş) ile tüm sayfadaki formüller görünür hale gelir. Tekrar basınca sonuçlara döner.", tips: ["Denetim modunda sütunlar genişler — yazdırmadan önce normal moda dönün."] }] },
      { title: "Sık Sorulan: VERİTABANI.AL (DGET) ile Tekil Değer Çekme", description: "Veritabanı fonksiyonu ile tek kayıt getirmek.", image: "/images/egitimler/orta-dlge.png", functions: [{ name: "VERİTABANI.AL nasıl çalışır?", use: "=VERİTABANI.AL(veritabanı; alan; ölçütler). Kriterlerinizi ayrı bir alana yazarsınız (başlık + koşul satırı). Tek eşleşme döndürür; birden fazla eşleşme varsa hata verir." }] },
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
        description: "PivotTable, Excel'in en güçlü analiz aracıdır. Ham veriyi bozmadan sürükle-bırak mantığıyla farklı açılardan özetler, kırılımlar ve karşılaştırmalar yapmanızı sağlar. Binlerce satırlık veriyi saniyeler içinde anlamlı raporlara dönüştürür.",
        functions: [
          {
            name: "PivotTable Oluşturma",
            use: "Sürükle-bırak mantığı ile esnek özet tablolar kurar. Aylık satış raporu, departman bazlı gider özeti, ürün kategorisi kırılımları gibi her türlü özetleme PivotTable ile yapılabilir.",
            syntax: "Ekle sekmesi → PivotTable → Veri kaynağını ve hedef konumu seçin.",
            steps: [
              "Verilerinizin herhangi bir hücresine tıklayın. Verinin başlık satırı olmalı ve boş satır/sütun bulunmamalıdır.",
              "Ekle → PivotTable'a tıklayın. Excel veri aralığını otomatik seçer — kontrol edin.",
              "\"Yeni Çalışma Sayfası\" veya \"Mevcut Çalışma Sayfası\" seçin → Tamam.",
              "Sağ tarafta PivotTable Alanları paneli açılır. Bu panelde 4 bölge vardır: Filtreler, Sütunlar, Satırlar, Değerler.",
              "Alanları sürükle-bırakla bölgelere yerleştirin: Örn. \"Departman\" → Satırlar, \"Tutar\" → Değerler, \"Ay\" → Sütunlar.",
              "Değerler alanında varsayılan olarak TOPLA kullanılır. Başka bir özet istiyorsanız (ORTALAMA, SAY, MAKS vb.) değer alanına tıklayıp \"Değer Alanı Ayarları\"ndan değiştirin.",
            ],
            tips: [
              "Veri kaynağını mutlaka Tablo (Ctrl+T) yapın — yeni satır eklenince PivotTable kaynağı otomatik büyür, Verileri Yenile ile güncellenir.",
              "Aynı veriden birden fazla PivotTable oluşturabilirsiniz — farklı açılardan analiz için her birini ayrı bir sayfaya koyun.",
              "PivotTable üzerindeki bir değere çift tıklarsanız o değeri oluşturan detay satırları ayrı bir sayfada gösterilir (drill-down).",
            ],
          },
          {
            name: "Dilimleyiciler & Zaman Çizelgesi",
            use: "PivotTable'ı filtrelemek için görsel, etkileşimli butonlar ekler. Dropdown filtre yerine büyük, tıklanabilir butonlar sunarak raporu kullanan kişilere çok daha kolay bir deneyim sağlar. Dashboard'ların olmazsa olmazıdır.",
            syntax: "PivotTable Araçları → Analiz → Dilimleyici Ekle veya Zaman Çizelgesi.",
            steps: [
              "PivotTable'ın herhangi bir hücresine tıklayın.",
              "Analiz (veya PivotTable Analizi) sekmesi → Dilimleyici Ekle.",
              "Filtrelemek istediğiniz alanları işaretleyin (Departman, Şehir, Ürün Kategorisi vb.) → Tamam.",
              "Dilimleyici butonlarından birine tıklayarak filtreleme yapın. Ctrl+tıkla ile çoklu seçim.",
              "Zaman Çizelgesi (tarih alanları için): Analiz → Zaman Çizelgesi Ekle → tarih alanını seçin. Ay, Çeyrek, Yıl bazında kaydırmalı filtre sunar.",
            ],
            tips: [
              "Bir dilimleyiciyi birden fazla PivotTable'a bağlamak: Dilimleyiciye sağ tık → Rapor Bağlantıları → bağlamak istediğiniz Pivot'ları işaretleyin.",
              "Dilimleyicileri boyutlandırıp Dashboard sayfasına taşıyarak profesyonel görünüm oluşturun.",
            ],
          },
          {
            name: "PivotTable Gruplama ve Hesaplanan Alan",
            use: "Tarihleri ay/çeyrek/yıl bazında gruplamak veya PivotTable içinde özel hesaplamalar (kar marjı, birim fiyat vb.) oluşturmak için kullanılır.",
            syntax: "Gruplama: Tarih alanına sağ tık → Grupla. Hesaplanan Alan: Analiz → Alanlar, Öğeler ve Kümeler → Hesaplanan Alan.",
            steps: [
              "Tarih gruplama: Pivot'taki tarih alanına sağ tıklayın → Grupla → Ay, Çeyrek, Yıl seçeneklerini işaretleyin. Excel otomatik olarak grupları oluşturur.",
              "Sayı gruplama: Sayısal alana sağ tık → Grupla → aralık belirleyin (0-50, 50-100 gibi yaş grupları veya fiyat aralıkları).",
              "Hesaplanan Alan: Analiz → Alanlar, Öğeler ve Kümeler → Hesaplanan Alan → Ad ve Formül girin. Örn: Kar_Marji = Kar / Gelir. Yeni alan Değerler'e eklenir.",
            ],
            tips: [
              "Gruplama yapabilmek için tarih sütununda boş hücre veya metin olmamalıdır — önce veri temizliği yapın.",
              "Hesaplanan Alanlar Pivot alanlarını kullanır (hücre referansı değil). Formülde alan adlarını kullanın: = Satış / Adet.",
            ],
          },
        ],
      },
      {
        title: "Dinamik Dizi & Gelişmiş Fonksiyonlar",
        description: "Excel 365 ve 2021'de gelen dinamik dizi fonksiyonları, tek formülle birden fazla hücreye sonuç döndürür. Formül yazma mantığını köklü şekilde değiştirmiştir: tek hücreye yazdığınız formül, sonuç kadar hücreye otomatik \"taşar\" (spill).",
        functions: [
          {
            name: "FİLTRE",
            use: "Belirli kritere uyan satırları dinamik olarak süzer. Arayüz filtresinden farkı: formül tabanlı olduğu için otomatik güncellenir ve sonucu başka bir yere yazdırır (kaynak veriyi bozmaz).",
            syntax: "=FİLTRE(dizi; koşul; [boşsa])",
            params: [
              { name: "dizi", description: "Filtrelenecek tablo aralığı (birden fazla sütun olabilir)." },
              { name: "koşul", description: "Her satır için DOĞRU/YANLIŞ dönen mantıksal dizi. Örn: B2:B100>50 veya A2:A100=\"İstanbul\"." },
              { name: "boşsa", description: "Hiç eşleşme yoksa gösterilecek değer (\"Kayıt yok\" gibi). Yazmazsanız #CALC! hatası alırsınız." },
            ],
            steps: [
              "Sonucun başlayacağı hücreye tıklayın (altında ve sağında yeterli boş alan olmalı).",
              "=FİLTRE( yazın ve filtrelenecek tabloyu seçin: A2:D100",
              "Koşulu belirleyin: ;B2:B100>1000 (B sütununda 1000'den büyük olanlar).",
              "Boş sonuç durumu ekleyin: ;\"Sonuç yok\").",
              "Enter'a basın. Koşulu sağlayan tüm satırlar otomatik listelenir ve kaynak veri değişince güncellenir.",
            ],
            tips: [
              "Çoklu koşul: VE mantığı için koşulları çarpın: (B2:B100>1000)*(C2:C100=\"İstanbul\"). VEYA mantığı için toplayın: (B2:B100>1000)+(C2:C100=\"İstanbul\").",
              "Sonuç hücrelerinin altında veri varsa #TAŞMA! hatası alırsınız — yeterli boş alan bırakın.",
            ],
          },
          {
            name: "SIRALA",
            use: "Sonuç listesini formülle artan/azalan sıralar. Arayüz sıralamasından farkı: kaynak veri bozulmaz, dinamik güncellenir. FİLTRE ile birlikte kullanılarak güçlü raporlar oluşturulur.",
            syntax: "=SIRALA(dizi; [sıralama_indisi]; [sıralama_sırası]; [sütun_bazlı])",
            params: [
              { name: "dizi", description: "Sıralanacak aralık." },
              { name: "sıralama_indisi", description: "Kaçıncı sütuna göre sıralanacak (1=ilk sütun)." },
              { name: "sıralama_sırası", description: "1 = artan (A→Z, küçük→büyük), -1 = azalan." },
            ],
            steps: [
              "Basit kullanım: =SIRALA(A2:C100;3;-1) → 3. sütuna göre büyükten küçüğe sıralar.",
              "FİLTRE ile birlikte: =SIRALA(FİLTRE(A2:C100;B2:B100>1000);3;-1) → Filtrele ve sırala.",
            ],
          },
          {
            name: "BENZERSİZ",
            use: "Tekrarsız (unique) liste çıkarır. Müşteri listesi, ürün kataloğu, kategori listesi gibi benzersiz değerler oluşturmak için kullanılır. Açılır listelerin kaynağı olarak da mükemmeldir.",
            syntax: "=BENZERSİZ(dizi; [sütun_bazlı]; [yalnızca_bir_kez])",
            params: [
              { name: "dizi", description: "Benzersiz değerlerin alınacağı aralık." },
              { name: "sütun_bazlı", description: "YANLIŞ = satır bazlı (varsayılan), DOĞRU = sütun bazlı." },
              { name: "yalnızca_bir_kez", description: "DOĞRU = yalnızca bir kez geçen değerleri ver (tekrarlananları çıkar)." },
            ],
            steps: [
              "Benzersiz müşteri listesi: =BENZERSİZ(A2:A1000) → A sütunundaki tüm benzersiz değerleri listeler.",
              "Sıralı benzersiz liste: =SIRALA(BENZERSİZ(A2:A1000)) → Alfabetik sıralı benzersiz liste.",
              "Kaç benzersiz değer var: =SATIRSAY(BENZERSİZ(A2:A1000)) → benzersiz değer sayısı.",
            ],
            tips: [
              "Bu fonksiyon dinamik dizi döndürür — sonuç otomatik aşağı taşar. Altına veri yazmayın.",
            ],
          },
        ],
      },
      {
        title: "Hata Yönetimi & Kombinasyonlar",
        description: "Gerçek ofis dosyalarında formüller birbirine zincirlenir ve hata olasılığı artar. Bu bölümde sık kullanılan formül kombinasyonlarını ve hataları yönetmeyi öğrenirsiniz.",
        functions: [
          {
            name: "DÜŞEYARA + EĞERHATA",
            use: "DÜŞEYARA bulunamayan değer için #YOK hatası verir. EĞERHATA ile sarmalayarak hatayı anlamlı bir mesajla değiştirirsiniz. Profesyonel raporlarda hata gösteren hücreler kabul edilmez.",
            syntax: "=EĞERHATA(DÜŞEYARA(aranan; tablo; sütun; 0); \"Bulunamadı\")",
            steps: [
              "Normal DÜŞEYARA formülünüzü yazın: =DÜŞEYARA(D1;$A$2:$C$100;2;0).",
              "Formülü EĞERHATA ile sarın: =EĞERHATA(DÜŞEYARA(D1;$A$2:$C$100;2;0);\"Kayıt yok\").",
              "Hata yerine 0 göstermek: =EĞERHATA(DÜŞEYARA(D1;$A$2:$C$100;2;0);0).",
              "Boş bırakmak: =EĞERHATA(DÜŞEYARA(D1;$A$2:$C$100;2;0);\"\").",
            ],
            tips: [
              "XLOOKUP kullanıyorsanız EĞERHATA'ya gerek yoktur — 4. parametre olarak bulunamazsa değerini doğrudan girebilirsiniz.",
            ],
          },
          {
            name: "İÇİÇE EĞER (ileri seviye)",
            use: "Birden fazla skala veya segment kuralını tek formülde toplar. Vergi dilimi, prim skalası, müşteri segmentasyonu gibi kademeli hesaplamalarda kullanılır.",
            syntax: "=EĞER(koşul1; değer1; EĞER(koşul2; değer2; EĞER(koşul3; değer3; varsayılan)))",
            params: [{ name: "koşul1, değer1, ...", description: "İlk koşul doğruysa değer1; değilse içteki EĞER değerlendirilir. Koşulları büyükten küçüğe sıralayın." }],
            details: "İleri seviyede iç içe EĞER genellikle hesaplamalarda kullanılır (sadece metin dönmek yerine formül döner). Örn: Prim hesabı: =EĞER(A2>=200;A2*0,10; EĞER(A2>=100;A2*0,05; 0)). 200+ satışta %10, 100+ satışta %5, altında prim yok.",
            tips: [
              "7+ iç içe EĞER yerine DÜŞEYARA ile aralık eşleşmesi veya IFS fonksiyonunu tercih edin.",
            ],
          },
          {
            name: "VE / VEYA ile çoklu koşullar",
            use: "Raporlardaki daha ince filtreler ve otomatik sinyaller için. Risk değerlendirmesi, SLA ihlali kontrolü, stok uyarısı gibi birden fazla koşulu birlikte değerlendiren senaryolar.",
            syntax: "=EĞER(VE(koşul1; koşul2); \"evet\"; \"hayır\")",
            params: [{ name: "koşul1, koşul2, ...", description: "VE: hepsi doğru olmalı. VEYA: en az biri doğru olmalı." }],
            steps: [
              "Risk değerlendirmesi: =EĞER(VE(B2>100000;C2>90);\"Yüksek Risk\";EĞER(VEYA(B2>50000;C2>60);\"Orta Risk\";\"Düşük Risk\")).",
              "SLA kontrolü: =EĞER(VE(D2>0;D2<=24);\"SLA İçinde\";EĞER(D2>24;\"SLA Aşıldı\";\"Beklemede\")).",
            ],
          },
        ],
      },
      {
        title: "Dashboard Oluşturma (Adım Adım)",
        description: "Dashboard (gösterge paneli), yönetim için tek sayfada tüm KPI'ları, grafikleri ve filtreleri barındıran etkileşimli rapordur. Excel'de profesyonel dashboard oluşturmak, veri analisti seviyesinde bir beceridir.",
        image: "/images/egitimler/ileri-dashboard.png",
        functions: [
          {
            name: "Veri Kaynağı Hazırlama",
            use: "Dashboard'un temeli sağlam veridir. Ham veriyi Tablo yapın, özet hesapları ayrı bir sayfada kurun, Dashboard sayfasında sadece görseller ve özet rakamlar bulunsun.",
            syntax: "Ham veri → Tablo → Özet sayfası → Dashboard sayfası",
            steps: [
              "Ham veri sayfası: Tüm detay verileri buradadır. Ctrl+T ile Tablo yapın, anlamlı ad verin (\"SatisVerisi\").",
              "Hesaplama/Özet sayfası: PivotTable'lar, formül özetleri (toplam satış, müşteri sayısı, ortalama birim fiyat) buraya koyun.",
              "Dashboard sayfası: Bu sayfada sadece grafikler, dilimleyiciler ve KPI kutuları bulunur. Veri veya formül doğrudan yazılmaz — hep özet sayfasına referans verilir.",
              "Bu 3 katmanlı yapı, veri değiştiğinde dashboard'un otomatik güncellenmesini sağlar.",
            ],
            tips: [
              "Altın kural: Dashboard sayfasında hiçbir ham veri satırı olmasın. Sadece grafikler, dilimleyiciler ve özet rakamlar.",
            ],
          },
          {
            name: "PivotChart ve Grafik Yerleştirme",
            use: "PivotTable'dan otomatik grafik oluşturur. Dilimleyici ile birlikte çalışır — dilimleyiciden filtre seçildiğinde hem Pivot hem grafik güncellenir.",
            syntax: "PivotTable seçin → Ekle → PivotChart",
            steps: [
              "Özet sayfasındaki PivotTable'a tıklayın.",
              "Ekle → PivotChart → grafik türünü seçin (sütun, çizgi, pasta vb.).",
              "Grafik oluşturulduktan sonra Dashboard sayfasına taşıyın: Grafik üzerine sağ tık → Grafik Taşı → mevcut sayfa: Dashboard.",
              "Grafik boyutunu ve konumunu ayarlayın. Grafik alanı formatını düzenleyin (kenarlık, arka plan, yazı tipi).",
            ],
          },
          {
            name: "Dilimleyici Yerleşimi ve Bağlama",
            use: "Dashboard'daki tüm grafik ve PivotTable'ları tek dilimleyici ile filtrelemek kullanıcı deneyimini büyük ölçüde iyileştirir.",
            steps: [
              "Dilimleyici ekleyin: PivotTable → Analiz → Dilimleyici Ekle → alanları seçin.",
              "Dilimleyiciyi Dashboard sayfasına taşıyın ve boyutlandırın.",
              "Birden fazla Pivot'a bağlama: Dilimleyiciye sağ tık → Rapor Bağlantıları → ilgili PivotTable'ları işaretleyin.",
              "Stil düzenleme: Dilimleyici Araçları → Seçenekler → Stil ve sütun sayısını ayarlayın.",
            ],
          },
          {
            name: "Sayfa Düzeni ve Son Rötuşlar",
            use: "Dashboard sayfasını profesyonel hale getirmek için kılavuz çizgilerini gizlemek, başlık ve KPI kutuları eklemek, yazdırma alanını belirlemek gerekir.",
            steps: [
              "Kılavuz çizgilerini gizleyin: Görünüm → Göster → \"Kılavuz Çizgileri\" kutucuğunun işaretini kaldırın.",
              "Satır/sütun başlıklarını gizleyin: Görünüm → Göster → \"Başlıklar\" kutucuğunun işaretini kaldırın.",
              "KPI kutuları oluşturun: Hücreleri birleştirerek kutular yapın, içine büyük font ile özet rakamları yazın (=Ozet!B2 gibi referanslarla). Arka plan rengini ve kenarlığı ayarlayın.",
              "Başlık çubuğu: İlk birkaç satırı birleştirip koyu renk arka plan ve beyaz yazı ile dashboard başlığı oluşturun.",
              "Yazdırma alanı: Sayfa Düzeni → Yazdırma Alanı → Yazdırma Alanını Belirle ile dashboard sınırlarını çizin.",
            ],
            tips: [
              "Profesyonel görünüm için maksimum 3-4 renk kullanın. Şirket kurumsal renklerini tercih edin.",
              "Dashboard'u sunum için kullanacaksanız Görünüm → Tam Ekran (veya Ctrl+F1 ile şeridi gizleyin).",
            ],
          },
        ],
      },
      {
        title: "TOPLA.ÇARPIM ve Dizi Formülleri",
        description: "TOPLA.ÇARPIM, birden fazla koşul ve ağırlıklı hesaplamalar için güçlü bir dizi tabanlı fonksiyondur. ÇOKETOPLA'nın yapamadığı OR mantığı ve çapraz hesaplamalar yapabilir. Her Excel sürümünde çalışır.",
        image: "/images/egitimler/ileri-topla-carpim.png",
        functions: [
          {
            name: "TOPLA.ÇARPIM",
            use: "İki veya daha fazla diziyi eleman eleman çarpar ve toplar. Ağırlıklı ortalama, koşullu toplam ve çoklu koşul senaryolarında ÇOKETOPLA'ya güçlü bir alternatiftir.",
            syntax: "=TOPLA.ÇARPIM(dizi1; dizi2; ...)",
            params: [{ name: "dizi1, dizi2", description: "Aynı boyutlardaki aralıklar. Eleman eleman çarpılır ve sonuçlar toplanır." }],
            steps: [
              "Ağırlıklı ortalama: =TOPLA.ÇARPIM(B2:B10;C2:C10)/TOPLA(C2:C10) → B sütunundaki notları C sütunundaki kredi ağırlıklarıyla çarpar ve toplam krediye böler.",
              "Koşullu toplam: =TOPLA.ÇARPIM((A2:A100=\"İstanbul\")*C2:C100) → İstanbul satışlarının toplamı.",
              "Çoklu koşul (VE): =TOPLA.ÇARPIM((A2:A100=\"İstanbul\")*(B2:B100=\"2025\")*C2:C100) → İstanbul + 2025 filtresiyle toplam.",
            ],
            tips: [
              "Koşullar parantez içinde yazılır ve * ile çarpılır (VE mantığı). Koşul doğruysa 1, yanlışsa 0 döner; çarpım mantığı bu sayede çalışır.",
            ],
          },
          {
            name: "Çoklu Koşul ile TOPLA.ÇARPIM — OR Mantığı",
            use: "ÇOKETOPLA tek başına AND mantığıdır — birden fazla değerden herhangi birine uymayı (OR) desteklemez. TOPLA.ÇARPIM ile OR mantığı kurabilirsiniz.",
            syntax: "=TOPLA.ÇARPIM(((A2:A100=\"Elma\")+(A2:A100=\"Armut\"))*C2:C100)",
            steps: [
              "OR mantığı: Koşulları + (toplama) ile birleştirin: (A:A=\"Elma\")+(A:A=\"Armut\") → en az biri doğruysa 1+ döner.",
              "Dikkat: OR sonucunu 1/0'a çevirmek için iki ek parantez kullanın veya --(koşul) yazın: =TOPLA.ÇARPIM(((A2:A100=\"Elma\")+(A2:A100=\"Armut\")>0)*C2:C100).",
            ],
            tips: [
              "AND için * (çarpım), OR için + (toplam) kullanın. İkisi birlikte de kullanılabilir: AND + OR = (A=\"X\")*(B=\"Y\"+(B=\"Z\")).",
            ],
          },
          {
            name: "Dizi Sabitleri",
            use: "Formül içinde sabit değer listeleri kullanarak birden fazla değere aynı anda bakabilirsiniz. TOPLA.ÇARPIM veya EĞERSAY ile birleştirildiğinde güçlü eşleştirmeler yapılır.",
            syntax: "={1;2;3} veya ={\"A\";\"B\";\"C\"}",
            details: "Dizi sabitleri süslü parantez { } içinde yazılır, noktalı virgül ile ayrılır. Örnek: =EĞERSAY(A:A;{\"Elma\";\"Armut\";\"Muz\"}) → Elma, Armut ve Muz'un her birinin sayısını ayrı ayrı döndürür (sonuç da dizi olur). TOPLA ile sararsanız hepsinin toplamını alır: =TOPLA(EĞERSAY(A:A;{\"Elma\";\"Armut\";\"Muz\"})).",
          },
        ],
      },
      {
        title: "Power Query Temelleri",
        description: "Power Query, Excel'in ETL (Extract-Transform-Load) aracıdır. Dış kaynaklardan veri çeker, dönüştürür ve tekrarlanabilir sorgular oluşturur. Her gün tekrarlanan raporlama süreçlerini büyük ölçüde otomatikleştirir.",
        image: "/images/egitimler/ileri-power-query-temel.png",
        functions: [
          {
            name: "Veri Al (Dosyadan, Web'den, Veritabanından)",
            use: "Excel, CSV, web sayfası, JSON, XML, SQL veritabanı gibi kaynakları Excel'e bağlar. Bağlantı kurulduktan sonra \"Verileri Yenile\" ile tek tıkla güncel veri çekilir.",
            syntax: "Veri sekmesi → Veri Al → Dosyadan / Web'den / Veritabanından",
            steps: [
              "Veri sekmesi → Veri Al → kaynağınızı seçin (Excel Dosyası, CSV, Web vb.).",
              "Dosya yolunu veya URL'yi belirtin.",
              "Önizleme penceresinde \"Veriyi Dönüştür\" (Transform Data) butonuna tıklayın — Power Query Düzenleyicisi açılır.",
              "Dönüştürme işlemlerinizi yapın (filtreleme, sütun silme, tip değiştirme vb.).",
              "Giriş → Kapat ve Yükle → Sayfaya veya sadece bağlantı olarak yükleyin.",
            ],
            tips: [
              "Her adım \"Uygulanan Adımlar\" panelinde kaydedilir. Herhangi bir adımı silebilir veya düzenleyebilirsiniz.",
              "Kaynağı bir kez kurun, sonra her gün Veri → Tümünü Yenile ile güncel veri çekin.",
            ],
          },
          {
            name: "Satırları / Sütunları Dönüştür",
            use: "Veri tipini değiştirme, sütun bölme/birleştirme, satır filtreleme, sıralama gibi tüm dönüştürme işlemleri Power Query Düzenleyicisi'nde yapılır.",
            steps: [
              "Veri tipi değiştirme: Sütun başlığına tıklayın → üstte tür ikonu görünür (ABC, 123, tarih). İstediğiniz türe çevirin.",
              "Sütun bölme: Sütunu seçin → Dönüştür → Sütunu Böl → Sınırlayıcıya Göre (virgül, tire vb.).",
              "Sütun birleştirme: Ctrl ile birden fazla sütun seçin → Dönüştür → Sütunları Birleştir → ayırıcı seçin.",
              "Satır filtreleme: Sütun başlığındaki oka tıklayarak filtreleyin (sadece belirli değerler, boş olmayanlar vb.).",
              "Sütun silme: İstenmeyen sütunu seçip sağ tık → Kaldır, veya Ctrl+tıkla ile istenen sütunları seçip \"Diğer Sütunları Kaldır\".",
            ],
          },
          {
            name: "Sorgu Birleştir (Merge) ve Sorgu Ekle (Append)",
            use: "Merge: İki tabloyu ortak anahtar sütuna göre birleştirir (SQL JOIN gibi). Append: Aynı yapıdaki tabloları alt alta ekler (SQL UNION gibi).",
            steps: [
              "Merge (Birleştirme): Power Query'de Giriş → Sorguları Birleştir → İki tablo ve eşleşme sütunlarını seçin → Birleştirme türünü belirleyin (Sol Dış, İç, Tam Dış vb.).",
              "Birleştirme sonucunda gelen sütundaki genişlet butonuna tıklayarak istediğiniz alanları ekleyin.",
              "Append (Ekleme): Giriş → Sorguları Ekle → İki veya daha fazla tabloyu alt alta birleştirir. Aynı sütun yapısında olmalıdırlar.",
            ],
            tips: [
              "Merge = yatay birleştirme (yeni sütunlar eklenir). Append = dikey birleştirme (yeni satırlar eklenir).",
              "Her iki işlem de tekrarlanabilir — kaynak veriler değiştiğinde Yenile ile güncellenir.",
            ],
          },
        ],
      },
      {
        title: "Gelişmiş Grafik Türleri",
        description: "Dashboard ve yönetim raporlarında standart grafiklerin ötesinde profesyonel görselleştirmeler: bileşik grafikler, mini grafikler ve hedef-gerçekleşen karşılaştırmaları.",
        image: "/images/egitimler/ileri-gelismis-grafik.png",
        functions: [
          {
            name: "Combo (Bileşik) Grafik",
            use: "Aynı grafikte sütun + çizgi birlikte göstererek farklı ölçeklerdeki verileri karşılaştırır. Satış tutarı (sütun) + kar marjı yüzdesi (çizgi) gibi.",
            syntax: "Veriyi seç → Ekle → Bileşik Grafik → Her seri için grafik türünü seç",
            steps: [
              "Verilerinizi seçin (en az 2 veri serisi).",
              "Ekle → Combo Grafik (veya Bileşik) seçin.",
              "Her veri serisi için grafik türünü belirleyin: birincisi Kümelenmiş Sütun, ikincisi Çizgi.",
              "İkinci seri için \"İkincil Eksen\" kutucuğunu işaretleyin (farklı ölçeklerde olduklarında).",
            ],
            tips: [
              "İkincil eksen ölçeği otomatik ayarlanır. Manuel ayarlamak için eksen üzerine çift tıklayın.",
            ],
          },
          {
            name: "Sparkline (Mini Grafik)",
            use: "Tek hücre içinde küçük bir trend çizgisi, sütun veya kazanç-kayıp gösterir. Dashboard tablolarında her satırın yanına trend mini grafiği koyarak hızlı görsel analiz sağlar.",
            syntax: "Ekle → Mini Grafikler → Çizgi/Sütun/Kazanç-Kayıp → Veri aralığını belirle",
            steps: [
              "Mini grafiğin görüneceği hücreyi seçin.",
              "Ekle → Mini Grafikler → Çizgi (veya Sütun).",
              "Veri aralığını belirtin: örn. B2:M2 (12 aylık veri).",
              "Mini Grafik Araçları → Tasarım sekmesinden stil ve renk seçin. En yüksek/en düşük noktaları vurgulayabilirsiniz.",
            ],
          },
          {
            name: "Hedef-Gerçekleşen Grafik (Bullet Chart)",
            use: "Hedef değer ile gerçekleşen değeri tek grafikte karşılaştırır. KPI raporlarında \"hedefe ne kadar yaklaşıldı\" sorusuna görsel yanıt verir.",
            steps: [
              "Verilerinizi hazırlayın: Kategori | Gerçekleşen | Hedef sütunları.",
              "Yığılmış Çubuk Grafik oluşturun: İlk seri (Gerçekleşen) koyu renk, ikinci seri (Hedef-Gerçekleşen farkı) açık renk.",
              "Alternatif: Combo grafik ile Gerçekleşen'i sütun, Hedef'i işaretçili çizgi olarak gösterin.",
              "Hedef çizgisi eklemek: Grafik üzerine ortalama/hedef çizgisi için yeni veri serisi ekleyip çizgi türünde gösterin.",
            ],
          },
        ],
      },
      /* ── İLERİ SSS'ler ── */
      { title: "Sık Sorulan: PivotTable Veri Kaynağını Güncelleme", description: "Kaynak genişlediğinde Pivot'u yenilemek.", image: "/images/egitimler/ileri-pivot-veri-yenile.png", functions: [{ name: "PivotTable veri eklenince güncellenmiyor", use: "PivotTable Araçları → Analiz → Verileri Yenile ile güncellenir.", steps: ["Yenileme: PivotTable'a tıklayın → Analiz → Verileri Yenile (veya sağ tık → Yenile).", "Veri kaynağı genişledi: Pivot'a sağ tık → PivotTable Seçenekleri → Veri kaynağını yeni aralığa güncelleyin.", "Otomatik çözüm: Kaynak veriyi Tablo (Ctrl+T) yapın — tablo genişledikçe Pivot kaynağı otomatik güncellenir."], tips: ["Dosya açılışında otomatik yenileme: PivotTable Seçenekleri → Veri → \"Dosya açılırken verileri yenile\" kutucuğunu işaretleyin."] }] },
      { title: "Sık Sorulan: Dilimleyici Birden Fazla Pivot'a Bağlama", description: "Bir dilimleyici tüm raporları filtrelesin.", image: "/images/egitimler/ileri-dilimleyici-baglanti.png", functions: [{ name: "Aynı dilimleyiciyi birden fazla Pivot'ta kullanmak", use: "Dilimleyiciye sağ tık → Dilimleyici Rapor Bağlantıları. Listeden bağlanacak PivotTable'ları işaretleyin.", tips: ["Bağlı Pivot'ların aynı veri kaynağından beslenmesi gerekir. Farklı kaynaklardan gelen Pivot'lar aynı dilimleyiciye bağlanamaz."] }] },
      { title: "Sık Sorulan: FİLTRE Sonucu Dinamik Liste", description: "Excel 365 dinamik dizi davranışı.", image: "/images/egitimler/ileri-filtre-dinamik.png", functions: [{ name: "FİLTRE sonucu komşu hücrelere taşıyor", use: "FİLTRE (ve SIRALA, BENZERSİZ) dinamik dizi döndürür; sonuç otomatik olarak aşağı/sağa taşar.", details: "Bu davranış \"spill\" (taşma) olarak adlandırılır. Formül yalnızca ilk hücrede bulunur, diğer hücreler \"hayalet\" referanslardır. Taşma alanındaki bir hücreye veri yazarsanız #TAŞMA! hatası alırsınız. Taşma alanının tamamına referans vermek için # (diyez) kullanın: =TOPLA(D2#) — D2'deki dinamik dizi formülünün tüm sonuçlarını toplar.", tips: ["Excel 365 veya 2021 gerekir. Eski sürümlerde dinamik dizi fonksiyonları çalışmaz."] }] },
      { title: "Sık Sorulan: Grafik Veri Aralığını Dinamik Yapma", description: "Yeni satır eklenince grafiğin güncellenmesi.", image: "/images/egitimler/ileri-grafik-dinamik.png", functions: [{ name: "Grafik yeni eklenen veriyi göstermiyor", use: "En kolay çözüm: Veriyi Tablo (Ctrl+T) yapın — grafik tablo genişledikçe otomatik güncellenir.", steps: ["Yöntem 1: Veriyi Tablo yapın (Ctrl+T). Grafik kaynağı otomatik büyür.", "Yöntem 2: Grafik veri kaynağını Ad Tanımla ile dinamik aralık yapın. Formüller → Ad Tanımla → isim: GrafikVeri, Başvuru: =KAYDIRMA(Sayfa1!$A$1;0;0;EŞSAY(Sayfa1!$A:$A);2)."] }] },
      { title: "Sık Sorulan: Gösterge Paneli ve Koşullu Biçimlendirme", description: "KPI'ları renk veya ikonla göstermek.", image: "/images/egitimler/ileri-gosterge-paneli.png", functions: [{ name: "Hedef/gerçekleşen göstergesi nasıl yapılır?", use: "İlerleme çubuğu: Koşullu Biçimlendirme → Veri Çubukları. Yüzde hedef karşılaştırması için Simge Setleri (yeşil/sarı/kırmızı ok) kullanın.", steps: ["KPI kutusu: Büyük bir hücreye formülle özet rakam yazın (=Ozet!B2). Hücre formatı: büyük font, koyu renk.", "Hedef karşılaştırma: Yardımcı sütunda =Gerçekleşen/Hedef hesaplayın. Koşullu Biçimlendirme → Simge Setleri uygulayın.", "Veri çubuğu: Yüzde sütununa Koşullu Biçimlendirme → Veri Çubukları uygulayın. Maks değeri %100 yapın."] }] },
      { title: "Sık Sorulan: Çoklu Koşullu Toplam (ÇOKETOPLA Sınırı)", description: "ÇOKETOPLA'da OR mantığı.", image: "/images/egitimler/ileri-coketopla-or.png", functions: [{ name: "Birden fazla değerden birine uyuyorsa toplam (OR)", use: "ÇOKETOPLA tek başına AND mantığıdır. OR için TOPLA.ÇARPIM kullanın.", steps: ["Yöntem 1 — TOPLA.ÇARPIM: =TOPLA.ÇARPIM(((A:A=\"Elma\")+(A:A=\"Armut\")>0)*C:C).", "Yöntem 2 — Ayrı ÇOKETOPLA toplamı: =ÇOKETOPLA(C:C;A:A;\"Elma\")+ÇOKETOPLA(C:C;A:A;\"Armut\").", "Yöntem 3 — Dizi sabiti: =TOPLA(ÇOKETOPLA(C:C;A:A;{\"Elma\";\"Armut\"})) (Ctrl+Shift+Enter ile dizi formülü olarak girin, veya Excel 365'te doğrudan çalışır)."] }] },
      { title: "Sık Sorulan: Tarih Dilimleyici ve Mali Yıl", description: "Pivot'ta mali yıl veya çeyrek gruplama.", image: "/images/egitimler/ileri-tarih-gruplama.png", functions: [{ name: "PivotTable'da tarihi ay/yıl/çeyrek gruplamak", use: "Tarih alanını Pivot'a sürükleyin; otomatik Ay, Çeyrek, Yıl grupları oluşur.", steps: ["Pivot'taki tarih alanına sağ tıklayın → Grupla.", "Gruplamak istediğiniz birimleri seçin: Ay, Çeyrek, Yıl (birden fazla seçilebilir).", "Mali yıl farklı başlıyorsa: Ham veriye yardımcı sütun ekleyin — =EĞER(AY(A2)>=7;YIL(A2)&\"-\"&YIL(A2)+1;YIL(A2)-1&\"-\"&YIL(A2)) gibi mali yıl hesaplayıp Pivot'ta bu alanı kullanın."] }] },
      { title: "Sık Sorulan: Yinelenen Başlıklar ve Birleştirilmiş Hücre", description: "Pivot ve dış raporlarda birleştirme.", image: "/images/egitimler/ileri-yinelenen-baslik.png", functions: [{ name: "Pivot'ta aynı başlık tekrar ediyor", use: "PivotTable Seçenekleri → Düzen ve Biçim → \"Yinelenen öğe etiketlerini göster\" ayarı ile kontrol edilir." }] },
      { title: "Sık Sorulan: Dış Veri ve Power Query Giriş", description: "Veri sekmesinden veri çekmek.", image: "/images/egitimler/ileri-power-query.png", functions: [{ name: "Excel'e dış kaynaktan veri almak", use: "Veri sekmesi → Veri Al (Power Query) ile Excel, CSV, web sayfası, SQL vb. bağlanabilir.", steps: ["Veri → Veri Al → kaynağı seçin (dosya, web, veritabanı).", "Önizleme penceresinde veriyi kontrol edin.", "\"Veriyi Dönüştür\" ile Power Query Düzenleyicisi'nde temizleme/dönüştürme yapın.", "Kapat ve Yükle → sayfaya veya sadece bağlantı olarak yükleyin.", "Güncelleme: Veri → Tümünü Yenile ile tüm sorgular güncellenir."] }] },
      { title: "Sık Sorulan: Makro ve VBA Ne Zaman Gerekir?", description: "Formül yetmediğinde otomasyon.", image: "/images/egitimler/ileri-makro.png", functions: [{ name: "Makro ne zaman kullanılır?", use: "Formül, PivotTable ve Power Query ile çözülemeyen tekrarlayan tıklama/dosya işlemleri için makro (VBA) kullanılır.", details: "Makro kullanmadan önce şu kontrol listesini gözden geçirin: (1) Formülle çözülebilir mi? (2) PivotTable ile özetlenebilir mi? (3) Power Query ile dönüştürülebilir mi? Hâlâ yetmiyorsa makroya geçin. Makro içeren dosyalar .xlsm uzantısıyla kaydedilir.", tips: ["Makro yazmayı bilmenize gerek yok — Makro Kaydet özelliğiyle işlemlerinizi kaydedip tekrarlayabilirsiniz."] }] },
      { title: "Sık Sorulan: What-If Analizi", description: "Hedef Ara, Senaryo Yöneticisi ve Veri Tablosu.", image: "/images/egitimler/ileri-what-if.png", functions: [{ name: "What-If araçlarını ne zaman kullanırım?", use: "\"Şu sonucu elde etmek için giriş değeri ne olmalı?\" veya \"Farklı senaryolarda sonuçlar nasıl değişir?\" sorularına yanıt verir.", steps: ["Hedef Ara: Veri → What-If Analizi → Hedef Ara → Sonuç hücresini, hedef değeri ve değiştirilecek hücreyi belirtin. Örn: Kârın 100.000 olması için birim fiyat ne olmalı?", "Senaryo Yöneticisi: Veri → What-If Analizi → Senaryo Yöneticisi → farklı varsayım setleri tanımlayın (iyimser, olası, kötümser). Özet raporuyla karşılaştırın.", "Veri Tablosu: Tek veya iki değişkene göre sonuçları tablo halinde gösterir. Kredi hesaplamasında farklı faiz oranları ve vadeler için aylık ödemeyi görmek gibi."] }] },
      { title: "Sık Sorulan: LET ve LAMBDA Fonksiyonları", description: "Formülleri değişkenle sadeleştirmek ve özel fonksiyon yazmak.", image: "/images/egitimler/ileri-let-lambda.png", functions: [{ name: "LET ve LAMBDA ne işe yarar?", use: "LET: Formül içinde ara değişken tanımlar — tekrarlayan hesaplamayı önler ve okunabilirliği artırır. LAMBDA: Kendi özel fonksiyonunuzu tanımlarsınız.", steps: ["LET örneği: =LET(toplam;TOPLA(A1:A10); ortalama;toplam/10; EĞER(ortalama>50;\"Yüksek\";\"Düşük\")) — toplam ve ortalama değişkenleri bir kez hesaplanır.", "LAMBDA örneği: Formüller → Ad Tanımla → Ad: KDVEkle → Başvuru: =LAMBDA(fiyat; fiyat*1,20). Artık =KDVEkle(B2) yazabilirsiniz.", "Excel 365 gerekir — eski sürümlerde çalışmaz."] }] },
      { title: "Sık Sorulan: Veri Modeli ve İlişkiler", description: "Birden fazla tabloyu ilişkilendirmek.", image: "/images/egitimler/ileri-veri-modeli.png", functions: [{ name: "Veri Modeli nedir, nasıl kullanılır?", use: "Birden fazla tabloyu birincil/yabancı anahtar mantığıyla ilişkilendirir. PivotTable'da bu tablolardan veri çekersiniz.", steps: ["Tablolarınızı Veri Modeline ekleyin: Power Pivot → Veri Modeline Ekle.", "İlişki kurun: Power Pivot → Diyagram Görünümü → sütunları sürükle-bırakla eşleştirin.", "PivotTable: Ekle → PivotTable → \"Bu çalışma kitabının Veri Modeli\"ni seçin → birden fazla tablodan alan sürükleyebilirsiniz.", "DAX ölçüler: Power Pivot → Ölçü Ekle ile özel hesaplamalar yazın (örn: =TOPLA(Satislar[Tutar]))."] }] },
      { title: "Sık Sorulan: Makro Kaydetme Adımları", description: "İlk makroyu adım adım oluşturmak.", image: "/images/egitimler/ileri-makro-kaydet.png", functions: [{ name: "Makro nasıl kaydedilir?", use: "Excel her tıklamanızı kaydeder ve sonra aynı işlemi otomatik tekrarlar.", steps: ["Geliştirici sekmesini açın: Dosya → Seçenekler → Şeridi Özelleştir → \"Geliştirici\" kutucuğunu işaretleyin.", "Geliştirici → Makro Kaydet → Makro adı ve kısayol tuşu belirleyin.", "Kaydedilecek işlemleri yapın (filtreleme, sıralama, biçimlendirme vb.).", "Geliştirici → Kaydı Durdur.", "Çalıştırma: Belirlediğiniz kısayol tuşu ile veya Geliştirici → Makrolar → Çalıştır.", "Dosyayı .xlsm uzantısıyla kaydedin (makro içeren çalışma kitabı)."], tips: ["Makro kaydederken fare tıklamaları yerine klavye kısayollarını kullanın — kayıt daha temiz olur."] }] },
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
