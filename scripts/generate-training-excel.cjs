/**
 * Orta Seviye Excel Eğitimi — Sigorta Sektörü Eğitim Dosyası Üretici
 * 1000 satır gerçekçi sigorta verisi + eğitim sayfaları
 */
const XLSX = require("xlsx");
const path = require("path");

// ─── Sabitler ───────────────────────────────────────────────
const ROW_COUNT = 1000;

const BOLGELER = [
  "Marmara", "Ege", "Akdeniz", "İç Anadolu",
  "Karadeniz", "Doğu Anadolu", "Güneydoğu Anadolu",
];

const BOLGE_AGIRLIK = [35, 15, 15, 15, 8, 6, 6];

const KANAL_KODLARI = ["ACN", "BNK", "TKK", "BRK"];
const KANAL_ADLARI = {
  ACN: "Acente", BNK: "Banka", TKK: "Tele Satış (TKK)", BRK: "Broker",
};
const KANAL_AGIRLIK = [45, 25, 15, 15];

const URUN_GRUPLARI = [
  "Kasko", "Trafik", "DASK", "Yangın", "Sağlık",
  "Ferdi Kaza", "Nakliyat", "Mühendislik",
];
const URUN_AGIRLIK = [25, 20, 15, 12, 12, 8, 5, 3];

const MUSTERI_TIPLERI = ["Bireysel", "Kurumsal"];
const MUSTERI_AGIRLIK = [70, 30];

const YENILEME = ["Yeni İş", "Yenileme"];
const YENILEME_AGIRLIK = [40, 60];

const PRIM_ARALIK = {
  Kasko:        [2000, 25000],
  Trafik:       [800, 4500],
  DASK:         [300, 2500],
  Yangın:       [1500, 35000],
  Sağlık:       [3000, 45000],
  "Ferdi Kaza": [500, 8000],
  Nakliyat:     [5000, 80000],
  Mühendislik:  [8000, 120000],
};

const KOMISYON_ORANLARI = {
  ACN: { Kasko: 12, Trafik: 8, DASK: 5, Yangın: 15, Sağlık: 10, "Ferdi Kaza": 18, Nakliyat: 14, Mühendislik: 12 },
  BNK: { Kasko: 8,  Trafik: 5, DASK: 3, Yangın: 10, Sağlık: 7,  "Ferdi Kaza": 12, Nakliyat: 10, Mühendislik: 8 },
  TKK: { Kasko: 10, Trafik: 6, DASK: 4, Yangın: 12, Sağlık: 8,  "Ferdi Kaza": 15, Nakliyat: 12, Mühendislik: 10 },
  BRK: { Kasko: 14, Trafik: 10, DASK: 6, Yangın: 18, Sağlık: 12, "Ferdi Kaza": 20, Nakliyat: 16, Mühendislik: 14 },
};

const ADLAR = [
  "Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Mustafa", "Emine", "Hasan",
  "Hüseyin", "Zeynep", "Elif", "Murat", "Özlem", "Burak", "Selin",
  "Cem", "Deniz", "Gökhan", "Nur", "Emre", "Derya", "Serkan", "Aslı",
  "Oğuz", "Pınar", "Tuncay", "Burcu", "Volkan", "Merve", "Tolga",
];

const SOYADLAR = [
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım",
  "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan",
  "Çetin", "Koç", "Kurt", "Aktaş", "Erdoğan", "Polat", "Korkmaz",
  "Güneş", "Aksoy", "Tekin", "Taş", "Acar", "Başaran", "Eren",
];

const TEMSILCILER_PER_BOLGE = {};
function generateTemsilciler() {
  BOLGELER.forEach((bolge) => {
    const count = bolge === "Marmara" ? 8 : bolge === "Ege" || bolge === "Akdeniz" || bolge === "İç Anadolu" ? 5 : 3;
    const list = [];
    for (let i = 0; i < count; i++) {
      const ad = ADLAR[Math.floor(Math.random() * ADLAR.length)];
      const soyad = SOYADLAR[Math.floor(Math.random() * SOYADLAR.length)];
      const full = `${ad} ${soyad}`;
      if (!list.includes(full)) list.push(full);
      else i--;
    }
    TEMSILCILER_PER_BOLGE[bolge] = list;
  });
}

// ─── Yardımcı ────────────────────────────────────────────────
function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }

function randomDate(yearStart, yearEnd) {
  const start = new Date(yearStart, 0, 1).getTime();
  const end = new Date(yearEnd, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function excelDate(d) {
  const epoch = new Date(1899, 11, 30);
  return Math.floor((d - epoch) / 86400000);
}

// ─── Veri Üretimi ────────────────────────────────────────────
function generateData() {
  generateTemsilciler();
  const rows = [];

  for (let i = 0; i < ROW_COUNT; i++) {
    const bolge = weightedRandom(BOLGELER, BOLGE_AGIRLIK);
    const kanalKodu = weightedRandom(KANAL_KODLARI, KANAL_AGIRLIK);
    const urunGrubu = weightedRandom(URUN_GRUPLARI, URUN_AGIRLIK);
    const musteriTipi = weightedRandom(MUSTERI_TIPLERI, MUSTERI_AGIRLIK);
    const yenileme = weightedRandom(YENILEME, YENILEME_AGIRLIK);
    const temsilci = TEMSILCILER_PER_BOLGE[bolge][randInt(0, TEMSILCILER_PER_BOLGE[bolge].length - 1)];

    const tanzimDate = randomDate(2024, 2025);
    const baslamaDate = addDays(tanzimDate, randInt(0, 7));
    const sureDays = urunGrubu === "Trafik" || urunGrubu === "Kasko" ? 365 : urunGrubu === "DASK" ? 365 : randInt(180, 365);
    const bitisDate = addDays(baslamaDate, sureDays);

    const [primMin, primMax] = PRIM_ARALIK[urunGrubu];
    let netPrim = randFloat(primMin, primMax);
    if (musteriTipi === "Kurumsal") netPrim = Math.round(netPrim * randFloat(1.5, 4));
    netPrim = Math.round(netPrim);

    const polAdet = musteriTipi === "Kurumsal" ? randInt(1, 5) : 1;
    const komisyonOrani = KOMISYON_ORANLARI[kanalKodu][urunGrubu];
    const komisyonTutari = Math.round(netPrim * komisyonOrani / 100);

    const hasarAdedi = Math.random() < 0.2 ? randInt(1, 3) : 0;

    const yil = tanzimDate.getFullYear();
    const polNo = `POL-${yil}-${String(i + 1).padStart(5, "0")}`;

    const hedefPrim = Math.round(netPrim * randFloat(0.7, 1.4));

    rows.push({
      "Poliçe No": polNo,
      "Tanzim Tarihi": excelDate(tanzimDate),
      "Başlama Tarihi": excelDate(baslamaDate),
      "Bitiş Tarihi": excelDate(bitisDate),
      "Satış Kanalı Kodu": kanalKodu,
      "Bölge": bolge,
      "Satış Temsilcisi": temsilci,
      "Ürün Grubu": urunGrubu,
      "Müşteri Tipi": musteriTipi,
      "Yenileme": yenileme,
      "Net Prim (₺)": netPrim,
      "Poliçe Adet": polAdet,
      "Komisyon Oranı (%)": komisyonOrani,
      "Komisyon Tutarı (₺)": komisyonTutari,
      "Hasar Adedi": hasarAdedi,
    });
  }
  return rows;
}

// ─── Yardımcı Tablolar ──────────────────────────────────────
function getKanalTablosu() {
  return [
    { Kod: "ACN", "Kanal Adı": "Acente", "Genel Komisyon (%)": 14 },
    { Kod: "BNK", "Kanal Adı": "Banka", "Genel Komisyon (%)": 8 },
    { Kod: "TKK", "Kanal Adı": "Tele Satış (TKK)", "Genel Komisyon (%)": 10 },
    { Kod: "BRK", "Kanal Adı": "Broker", "Genel Komisyon (%)": 17 },
  ];
}

function getPrimKademeTablosu() {
  return [
    { "Alt Sınır (₺)": 0,      "Prim Oranı (%)": 5,  "Performans": "D" },
    { "Alt Sınır (₺)": 5000,   "Prim Oranı (%)": 8,  "Performans": "C" },
    { "Alt Sınır (₺)": 15000,  "Prim Oranı (%)": 12, "Performans": "B" },
    { "Alt Sınır (₺)": 30000,  "Prim Oranı (%)": 15, "Performans": "A" },
    { "Alt Sınır (₺)": 60000,  "Prim Oranı (%)": 18, "Performans": "A+" },
  ];
}

function getBolgeHedefleri() {
  return [
    { Bölge: "Marmara",              "Yıllık Hedef (₺)": 5000000 },
    { Bölge: "Ege",                  "Yıllık Hedef (₺)": 2500000 },
    { Bölge: "Akdeniz",              "Yıllık Hedef (₺)": 2500000 },
    { Bölge: "İç Anadolu",           "Yıllık Hedef (₺)": 2000000 },
    { Bölge: "Karadeniz",            "Yıllık Hedef (₺)": 1200000 },
    { Bölge: "Doğu Anadolu",         "Yıllık Hedef (₺)": 800000 },
    { Bölge: "Güneydoğu Anadolu",    "Yıllık Hedef (₺)": 800000 },
  ];
}

function getKomisyonDetayTablosu() {
  const rows = [];
  for (const kanal of KANAL_KODLARI) {
    for (const urun of URUN_GRUPLARI) {
      rows.push({
        "Kanal Kodu": kanal,
        "Ürün Grubu": urun,
        "Komisyon Oranı (%)": KOMISYON_ORANLARI[kanal][urun],
      });
    }
  }
  return rows;
}

// ─── Eğitim Sayfaları ────────────────────────────────────────

function createInstructionRows(title, tasks, tips) {
  const rows = [];
  rows.push([`📋 ${title}`]);
  rows.push([]);
  rows.push(["GÖREVLER:"]);
  tasks.forEach((t, i) => rows.push([`  ${i + 1}. ${t}`]));
  rows.push([]);
  if (tips && tips.length) {
    rows.push(["💡 İPUÇLARI:"]);
    tips.forEach((t) => rows.push([`  • ${t}`]));
    rows.push([]);
  }
  rows.push(["⬇️ Aşağıda çalışma alanınız var — formüllerinizi buraya yazın."]);
  rows.push([]);
  return rows;
}

function buildEgerSheet(data) {
  const instructions = createInstructionRows(
    "EĞER FONKSİYONU — Koşullu Karar Verme",
    [
      'F sütununa: Net Prim >= 10.000 ise "Yüksek Prim", değilse "Düşük Prim" yazın.',
      'G sütununa: Hasar Adedi > 0 ise "Hasarlı", değilse "Hasarsız" yazın.',
      'H sütununa: Yenileme = "Yenileme" VE Net Prim >= 5000 ise "Değerli Yenileme", değilse "Standart" yazın. (VE fonksiyonu ile)',
      'I sütununa: Komisyon Tutarı > 5000 VEYA Poliçe Adet > 1 ise "Özel İnceleme", değilse "Normal" yazın. (VEYA fonksiyonu ile)',
    ],
    [
      'EĞER sözdizimi: =EĞER(koşul; "doğruysa"; "yanlışsa")',
      'VE ile: =EĞER(VE(koşul1; koşul2); "doğru"; "yanlış")',
      'VEYA ile: =EĞER(VEYA(koşul1; koşul2); "doğru"; "yanlış")',
    ]
  );

  const sample = data.slice(0, 50);
  const header = ["Poliçe No", "Net Prim (₺)", "Hasar Adedi", "Yenileme", "Komisyon Tutarı (₺)", "Poliçe Adet",
    "Prim Sınıfı (EĞER)", "Hasar Durumu (EĞER)", "Değerli Yenileme (VE)", "Özel İnceleme (VEYA)"];

  const dataRows = sample.map(r => [
    r["Poliçe No"], r["Net Prim (₺)"], r["Hasar Adedi"], r["Yenileme"], r["Komisyon Tutarı (₺)"], r["Poliçe Adet"],
    "", "", "", "",
  ]);

  return [...instructions, header, ...dataRows];
}

function buildIcIceEgerSheet(data) {
  const instructions = createInstructionRows(
    "İÇ İÇE EĞER — Çoklu Koşul / Kademe Belirleme",
    [
      "G sütununa: Net Prim'e göre performans notu verin:\n     >= 60.000 → \"A+\", >= 30.000 → \"A\", >= 15.000 → \"B\", >= 5.000 → \"C\", < 5.000 → \"D\"",
      "H sütununa: Hedef Gerçekleşme Oranına (Net Prim / Hedef Prim) göre:\n     >= %120 → \"Üstün\", >= %100 → \"Başarılı\", >= %80 → \"Geliştirilmeli\", < %80 → \"Yetersiz\"",
      "I sütununa: Aynı performans notunu ÇOKEĞER fonksiyonu ile yazın (Excel 365).",
    ],
    [
      "İç içe EĞER: =EĞER(A>=60000;\"A+\";EĞER(A>=30000;\"A\";EĞER(...)))",
      "Koşulları büyükten küçüğe sıralayın!",
      "ÇOKEĞER: =ÇOKEĞER(A>=60000;\"A+\";A>=30000;\"A\";...;DOĞRU;\"D\")",
    ]
  );

  const sample = data.slice(50, 100);
  const header = ["Poliçe No", "Bölge", "Ürün Grubu", "Net Prim (₺)", "Hedef Prim (₺)", "Gerçekleşme %",
    "Performans Notu (İç İçe EĞER)", "Hedef Değerlendirme", "Performans (ÇOKEĞER)"];

  const dataRows = sample.map(r => {
    const hedef = Math.round(r["Net Prim (₺)"] * (0.7 + Math.random() * 0.7));
    return [r["Poliçe No"], r["Bölge"], r["Ürün Grubu"], r["Net Prim (₺)"], hedef, "", "", "", ""];
  });

  return [...instructions, header, ...dataRows];
}

function buildDuseyaraSheet(data) {
  const instructions = createInstructionRows(
    "DÜŞEYARA — Tablo Arası Veri Çekme",
    [
      "F sütununa: Satış Kanalı Kodunu kullanarak \"Yardımcı Tablolar\" sayfasındaki Kanal Tablosundan KANAL ADINI çekin.",
      "G sütununa: Aynı tablodan Genel Komisyon Oranını çekin.",
      "H sütununa: Bölge adını kullanarak Bölge Hedef Tablosundan YILLIK HEDEFİ çekin.",
      "I sütununa: H sütunundaki DÜŞEYARA'yı EĞERHATA ile sarmalayın — bulunamazsa \"Hedef Yok\" yazsın.",
      "J sütununa: Prim Kademe Tablosundan yaklaşık eşleşme (4. parametre=1) ile prim oranını çekin.",
    ],
    [
      "Tam eşleşme: =DÜŞEYARA(aranan; tablo; sütun_no; 0)",
      "Yaklaşık: =DÜŞEYARA(aranan; tablo; sütun_no; 1) — tablo sıralı olmalı!",
      "Tabloyu kilitlemek için $: =DÜŞEYARA(A2; 'Yardımcı Tablolar'!$A$2:$C$5; 2; 0)",
      "EĞERHATA: =EĞERHATA(DÜŞEYARA(...); \"Bulunamadı\")",
    ]
  );

  const sample = data.slice(100, 160);
  const header = ["Poliçe No", "Satış Kanalı Kodu", "Bölge", "Ürün Grubu", "Net Prim (₺)",
    "Kanal Adı (DÜŞEYARA)", "Genel Kom. % (DÜŞEYARA)", "Bölge Hedefi (DÜŞEYARA)",
    "Hedef Güvenli (EĞERHATA)", "Kademe Oranı (Yaklaşık)"];

  const dataRows = sample.map(r => [
    r["Poliçe No"], r["Satış Kanalı Kodu"], r["Bölge"], r["Ürün Grubu"], r["Net Prim (₺)"],
    "", "", "", "", "",
  ]);

  return [...instructions, header, ...dataRows];
}

function buildIndisKacinciSheet(data) {
  const instructions = createInstructionRows(
    "İNDİS + KAÇINCI — Esnek Arama (DÜŞEYARA'nın Ötesinde)",
    [
      "F sütununa: Komisyon Detay Tablosundan, Kanal Kodu VE Ürün Grubunu eşleştirerek komisyon oranını İNDİS+KAÇINCI ile çekin.",
      "G sütununa: Aynı işi XLOOKUP ile yapın (Excel 365).",
      "H sütununa: Bölge Hedef Tablosunda bölge adı verilen satırın SOLUNDAKİ sütun numarasını KAÇINCI ile bulun.",
    ],
    [
      "İNDİS+KAÇINCI: =İNDİS(sonuç_aralığı; KAÇINCI(aranan; arama_aralığı; 0))",
      "İki koşullu: yardımcı sütunda BİRLEŞTİR ile anahtar oluşturun",
      "XLOOKUP: =XLOOKUP(aranan; arama_aralığı; dönüş_aralığı; \"yok\")",
    ]
  );

  const sample = data.slice(160, 210);
  const header = ["Poliçe No", "Satış Kanalı Kodu", "Ürün Grubu", "Bölge", "Net Prim (₺)",
    "Kom. Oranı (İNDİS+KAÇINCI)", "Kom. Oranı (XLOOKUP)", "Bölge Sırası (KAÇINCI)"];

  const dataRows = sample.map(r => [
    r["Poliçe No"], r["Satış Kanalı Kodu"], r["Ürün Grubu"], r["Bölge"], r["Net Prim (₺)"],
    "", "", "",
  ]);

  return [...instructions, header, ...dataRows];
}

function buildCoketoplaSheet(data) {
  const instructions = createInstructionRows(
    "ÇOKETOPLA / ÇOKEĞERSAY / EĞERSAY — Koşullu Toplama ve Sayma",
    [
      "Sağ taraftaki özet tabloda: Her Bölge için toplam Net Prim'i ÇOKETOPLA ile hesaplayın.",
      "Her Bölge + Ürün Grubu kombinasyonu için toplam primi ÇOKETOPLA ile hesaplayın.",
      "Her Bölge için poliçe sayısını ÇOKEĞERSAY ile bulun.",
      'Net Prim > 20.000 olan poliçe sayısını EĞERSAY ile bulun.',
      'Ürün Grubu "Kasko" VE Müşteri Tipi "Kurumsal" olan toplam primi ÇOKETOPLA ile hesaplayın.',
      'Satış Temsilcisi adı "A" ile başlayan kayıtların toplam primini hesaplayın. (Joker: "A*")',
    ],
    [
      "ÇOKETOPLA: =ÇOKETOPLA(toplam_aralığı; kriter_aralığı1; kriter1; ...)",
      "ÇOKEĞERSAY: =ÇOKEĞERSAY(kriter_aralığı1; kriter1; kriter_aralığı2; kriter2; ...)",
      'Joker karakter: "A*" = A ile başlayan, "*kasko*" = kasko içeren',
      'Büyüktür kriteri: ">20000" (tırnak içinde yazılır)',
    ]
  );

  const summaryHeader = ["", "", "ÖZET TABLO — Formüllerinizi buraya yazın"];
  const bolgeSummary = [["", "", "Bölge", "Toplam Prim", "Poliçe Sayısı"]];
  BOLGELER.forEach(b => bolgeSummary.push(["", "", b, "", ""]));
  bolgeSummary.push(["", "", "", "", ""]);
  bolgeSummary.push(["", "", "Bölge + Ürün", "Bölge", "Ürün Grubu", "Toplam Prim"]);
  bolgeSummary.push(["", "", "Örnek:", "Marmara", "Kasko", ""]);
  bolgeSummary.push(["", "", "Örnek:", "Ege", "Trafik", ""]);
  bolgeSummary.push(["", "", "Örnek:", "İç Anadolu", "Sağlık", ""]);

  return [...instructions, ...bolgeSummary];
}

function buildMetinSheet(data) {
  const instructions = createInstructionRows(
    "METİN FONKSİYONLARI — SAĞ, SOL, PARÇAAL, UZUNLUK, BUL, BİRLEŞTİR",
    [
      "D sütununa: Satış Temsilcisi'nin ADINI ayırın (boşluğa kadar olan kısım). İpucu: SOL + BUL",
      "E sütununa: Satış Temsilcisi'nin SOYADINI ayırın. İpucu: SAĞ + UZUNLUK + BUL",
      "F sütununa: Poliçe No'dan YILI çekin (5. karakterden 4 karakter). İpucu: PARÇAAL",
      "G sütununa: Poliçe No'dan SIRA NUMARASINI çekin (son 5 karakter). İpucu: SAĞ",
      "H sütununa: Bölge + \" - \" + Ürün Grubu şeklinde birleştirin. İpucu: BİRLEŞTİR veya &",
      "I sütununa: Satış Temsilcisi adının kaç karakter olduğunu bulun. İpucu: UZUNLUK",
      "J sütununa: E-posta oluşturun: ad.soyad@sirket.com (küçük harfle). İpucu: KÜÇÜKHARF + BİRLEŞTİR",
    ],
    [
      "BUL: =BUL(\" \"; A2) → boşluğun pozisyonunu verir",
      "SOL: =SOL(A2; BUL(\" \";A2)-1) → boşluğa kadar",
      "SAĞ: =SAĞ(A2; UZUNLUK(A2)-BUL(\" \";A2)) → boşluktan sonra",
      "PARÇAAL: =PARÇAAL(A2; 5; 4) → 5. karakterden 4 tane",
      'BİRLEŞTİR: =BİRLEŞTİR(A2; " - "; B2) veya =A2&" - "&B2',
    ]
  );

  const sample = data.slice(210, 270);
  const header = ["Poliçe No", "Satış Temsilcisi", "Bölge", "Ürün Grubu",
    "Ad (SOL+BUL)", "Soyad (SAĞ+UZUNLUK)", "Yıl (PARÇAAL)", "Sıra No (SAĞ)",
    "Bölge-Ürün (BİRLEŞTİR)", "Karakter Sayısı", "E-posta"];

  const dataRows = sample.map(r => [
    r["Poliçe No"], r["Satış Temsilcisi"], r["Bölge"], r["Ürün Grubu"],
    "", "", "", "", "", "", "",
  ]);

  return [...instructions, header, ...dataRows];
}

function buildTarihSheet(data) {
  const instructions = createInstructionRows(
    "TARİH FONKSİYONLARI — GÜN, AY, YIL, BUGÜN, TARİHFARK",
    [
      "F sütununa: Tanzim Tarihi ile Başlama Tarihi arasındaki GÜN FARKINI hesaplayın. (basit çıkarma)",
      "G sütununa: Başlama ile Bitiş arasındaki AY FARKINI hesaplayın. İpucu: TARİHFARK veya (Bitiş-Başlama)/30",
      "H sütununa: Poliçenin tanzim edildiği AY NUMARASINI çekin. İpucu: AY()",
      "I sütununa: Poliçenin tanzim edildiği YILI çekin. İpucu: YIL()",
      "J sütununa: Bitiş tarihine kaç gün kaldığını hesaplayın. İpucu: Bitiş - BUGÜN()",
      'K sütununa: Bitiş tarihi geçmişse "Süresi Dolmuş", 30 günden az kaldıysa "Yakında Dolacak", değilse "Aktif" yazın.',
    ],
    [
      "Tarih farkı (gün): =B2-A2",
      "AY fonksiyonu: =AY(A2) → ay numarası (1-12)",
      "YIL fonksiyonu: =YIL(A2) → yıl sayısı",
      "BUGÜN(): Bugünün tarihini verir, her açılışta güncellenir",
      'TARİHFARK: =TARİHFARK(başlangıç; bitiş; "d") gün, "m" ay, "y" yıl',
    ]
  );

  const sample = data.slice(270, 330);
  const header = ["Poliçe No", "Tanzim Tarihi", "Başlama Tarihi", "Bitiş Tarihi", "Ürün Grubu",
    "Tanzim-Başlama Farkı (gün)", "Süre (ay)", "Tanzim Ayı", "Tanzim Yılı",
    "Bitiş'e Kalan Gün", "Poliçe Durumu (EĞER)"];

  const dataRows = sample.map(r => [
    r["Poliçe No"], r["Tanzim Tarihi"], r["Başlama Tarihi"], r["Bitiş Tarihi"], r["Ürün Grubu"],
    "", "", "", "", "", "",
  ]);

  return [...instructions, header, ...dataRows];
}

function buildVeriYonetimiSheet() {
  const instructions = createInstructionRows(
    "VERİ YÖNETİMİ — Tablo, Koşullu Biçimlendirme, Veri Doğrulama, Ad Tanımla",
    [
      "\"Veri\" sayfasına gidin, tüm veriyi seçip Ctrl+T ile TABLOYA dönüştürün.",
      "Tabloya \"SigortaVerisi\" adını verin (Tablo Tasarım sekmesi → Tablo Adı).",
      "Net Prim sütununa Koşullu Biçimlendirme ekleyin: Veri Çubukları (yeşil).",
      "Hasar Adedi > 0 olan tüm satırı kırmızı arka plan yapan koşullu biçim kuralı yazın.",
      "Yeni bir sütun ekleyin: \"Onay\" — Veri Doğrulama ile sadece \"Evet\" veya \"Hayır\" seçilebilsin (açılır liste).",
      "Net Prim sütununu Ad Tanımla ile \"PrimAralığı\" olarak adlandırın.",
      "=TOPLA(PrimAralığı) formülü ile toplam primi hesaplayın.",
      "Yinelenenleri Kaldır ile aynı Poliçe No'ya sahip kayıtları kontrol edin (kopyada deneyin!).",
    ],
    [
      "Ctrl+T: Veriyi Excel Tablosuna dönüştürür",
      "Koşullu Biçimlendirme: Giriş → Koşullu Biçimlendirme → Yeni Kural",
      "Veri Doğrulama: Veri → Veri Doğrulama → Liste",
      "Ad Tanımla: Formüller → Ad Tanımla",
    ]
  );
  return instructions;
}

function buildPivotSheet() {
  const instructions = createInstructionRows(
    "PİVOT TABLE & DASHBOARD — Özet Raporlar, Hesaplanan Alan, Dilimleyici",
    [
      "\"Veri\" sayfasındaki tablodan PivotTable oluşturun (Ekle → PivotTable → Yeni Sayfa).",
      "Satırlar: Bölge, Sütunlar: Ürün Grubu, Değerler: Net Prim Toplamı → Bölge-Ürün prim matrisi.",
      "Tarihleri Aylara göre gruplandırın: Tanzim Tarihi → Satırlar, sağ tık → Gruplandır → Ay.",
      "Hesaplanan Alan ekleyin: \"Ort. Prim\" = 'Net Prim (₺)' / 'Poliçe Adet'",
      "Dilimleyici ekleyin: Bölge ve Satış Kanalı Kodu için. İki dilimleyiciyi aynı Pivot'a bağlayın.",
      "Zaman Çizelgesi ekleyin: Tanzim Tarihi için.",
      "PivotChart (Pivot Grafik) ekleyin: Sütun grafik, Bölge bazlı Net Prim.",
      "DASHBOARD sayfası: Yeni bir sayfa oluşturun, en önemli 3-4 PivotTable + Grafik + Dilimleyici ile özet panel tasarlayın.",
    ],
    [
      "PivotTable: Ekle sekmesi → PivotTable → Tabloyu/Aralığı seç",
      "Gruplama: Tarih hücresine sağ tık → Gruplandır",
      "Hesaplanan Alan: PivotTable Araçları → Analiz → Alanlar ve Öğeler → Hesaplanan Alan",
      "Dilimleyici: PivotTable Araçları → Analiz → Dilimleyici Ekle",
      "Dashboard ipucu: Her PivotTable'ı küçük tutun, dilimleyicileri hepsine bağlayın",
    ]
  );
  return instructions;
}

function buildMutlakRefSheet() {
  const instructions = createInstructionRows(
    "MUTLAK & KARMA REFERANS ($) — Formül Kopyalama",
    [
      "B sütunundaki Net Prim değerlerini H1 hücresindeki KDV oranı (%20) ile çarparak C sütununa KDV tutarını yazın. H1'i $ ile kilitleyin.",
      "D sütununa: Her satırın Net Prim'ini B sütununun TOPLAMI'na bölerek yüzde payını hesaplayın. Toplamı $ ile kilitleyin.",
      "Çapraz tablo: Sol tarafta bölgeler, üstte ürün grupları. Kesişimde ÇOKETOPLA ile toplamı hesaplayın. Satır ve sütun referanslarını karma $ ile yazın.",
    ],
    [
      "$A$1 = Mutlak (hem satır hem sütun kilitli)",
      "A$1 = Karma (satır kilitli, sütun serbest)",
      "$A1 = Karma (sütun kilitli, satır serbest)",
      "F4 tuşu ile $ işareti döngüsel olarak eklenir",
    ]
  );

  const header = ["Poliçe No", "Net Prim (₺)", "KDV Tutarı ($'lı)", "Prim Payı % ($'lı)", "", "", "", "KDV Oranı:", 0.20];
  const sampleRows = [];
  for (let i = 0; i < 20; i++) {
    sampleRows.push([`POL-2024-${String(i+1).padStart(5,"0")}`, Math.round(2000 + Math.random() * 50000), "", ""]);
  }

  return [...instructions, header, ...sampleRows];
}

// ─── Excel Oluşturma ─────────────────────────────────────────
function createWorkbook() {
  const data = generateData();
  const wb = XLSX.utils.book_new();

  // 1) Ana Veri sayfası
  const veriWs = XLSX.utils.json_to_sheet(data);
  // Tarih sütunlarını formatla
  const dateFormat = "DD.MM.YYYY";
  const dateCols = [1, 2, 3]; // B, C, D (0-indexed)
  for (let r = 1; r <= ROW_COUNT; r++) {
    dateCols.forEach(c => {
      const cell = XLSX.utils.encode_cell({ r, c });
      if (veriWs[cell]) veriWs[cell].z = dateFormat;
    });
  }
  XLSX.utils.book_append_sheet(wb, veriWs, "Veri");

  // 2) Yardımcı Tablolar
  const helpWs = XLSX.utils.aoa_to_sheet([
    ["KANAL TABLOSU"],
    ...XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(getKanalTablosu()), { header: 1 }),
    [],
    ["PRİM KADEME TABLOSU (Yaklaşık Eşleşme İçin — Sıralı)"],
    ...XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(getPrimKademeTablosu()), { header: 1 }),
    [],
    ["BÖLGE HEDEF TABLOSU"],
    ...XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(getBolgeHedefleri()), { header: 1 }),
    [],
    ["KOMİSYON DETAY TABLOSU (Kanal × Ürün)"],
    ...XLSX.utils.sheet_to_json(XLSX.utils.json_to_sheet(getKomisyonDetayTablosu()), { header: 1 }),
  ]);
  XLSX.utils.book_append_sheet(wb, helpWs, "Yardımcı Tablolar");

  // 3) Eğitim Sayfaları
  const sheets = [
    { name: "1-EĞER", builder: () => buildEgerSheet(data) },
    { name: "2-İç İçe EĞER", builder: () => buildIcIceEgerSheet(data) },
    { name: "3-DÜŞEYARA", builder: () => buildDuseyaraSheet(data) },
    { name: "4-İNDİS KAÇINCI", builder: () => buildIndisKacinciSheet(data) },
    { name: "5-ÇOKETOPLA", builder: () => buildCoketoplaSheet(data) },
    { name: "6-Metin Fonk.", builder: () => buildMetinSheet(data) },
    { name: "7-Tarih Fonk.", builder: () => buildTarihSheet(data) },
    { name: "8-Mutlak Ref ($)", builder: () => buildMutlakRefSheet() },
    { name: "9-Veri Yönetimi", builder: () => buildVeriYonetimiSheet() },
    { name: "10-PivotTable", builder: () => buildPivotSheet() },
  ];

  sheets.forEach(({ name, builder }) => {
    const aoaData = builder();
    const ws = XLSX.utils.aoa_to_sheet(aoaData);
    // Tarih hücreleri varsa formatla (DÜŞEYARA ve Tarih sayfalarında)
    if (name.includes("Tarih")) {
      // Tarih sayfasında B-D sütunları tarih
      const rows = aoaData.length;
      for (let r = 0; r < rows; r++) {
        for (let c = 1; c <= 3; c++) {
          const cell = XLSX.utils.encode_cell({ r, c });
          if (ws[cell] && typeof ws[cell].v === "number" && ws[cell].v > 40000) {
            ws[cell].z = dateFormat;
          }
        }
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  return wb;
}

// ─── Çıktı ───────────────────────────────────────────────────
const wb = createWorkbook();
const outPath = path.join(__dirname, "..", "Orta-Seviye-Excel-Egitimi-Sigorta.xlsx");
XLSX.writeFile(wb, outPath);
console.log(`✅ Eğitim dosyası oluşturuldu: ${outPath}`);
console.log(`   - 1000 satır sigorta verisi (Veri sayfası)`);
console.log(`   - Yardımcı tablolar (4 tablo)`);
console.log(`   - 10 eğitim sayfası (görevler + çalışma alanı)`);
