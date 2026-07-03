/** Kullanıcı yükleme rehberi — import scriptleriyle uyumlu. */

export type UploadSpec = {
  id: string;
  title: string;
  summary: string;
  fileHint: string;
  sheetName: string;
  steps: string[];
  columns: { col: string; field: string; example: string; note?: string }[];
  checks: string[];
  errors?: string[];
  comingSoon?: boolean;
};

export const BUTCE_MAP_MIZAN_SPEC: UploadSpec = {
  id: "mizan",
  title: "Yıl Sonu Mizan",
  summary:
    "Geçmiş yıl sonu branş mizanı. Teknik oranlar ve GT oranları bu veriden hesaplanır.",
  fileHint: "Yıl, hesap kodu, branş kodu ve tutar içeren mizan dosyası",
  sheetName: "MIZAN",
  steps: [
    "Finans / bütçe ekibinden güncel BUTCE_MAP dosyasını alın.",
    "Dosyada MIZAN adlı sayfa olduğundan emin olun (sayfa adı birebir aynı olmalı).",
    "Aşağıdaki kolon düzenine uygun olduğunu kontrol edin.",
    "Dosyayı seçip «Yükle ve import et» — birkaç saniye sürebilir.",
    "Veri durumu kartında yıl aralığı ve satır sayısı görününce Teknik oranlar sayfasına geçin.",
  ],
  columns: [
    { col: "A", field: "Yıl", example: "2024", note: "Tam yıl; bütçe yılından küçük olmalı" },
    { col: "B", field: "Hesap kodu", example: "60001", note: "GT hesap planı kodu (metin veya sayı)" },
    { col: "C", field: "—", example: "—", note: "Okunmaz; boş veya hesap adı olabilir" },
    { col: "D", field: "Branş kodu (7xx)", example: "701", note: "3 haneli hazine branş kodu" },
    { col: "E", field: "Tutar", example: "1234567", note: "Yıl sonu bakiye / tutar (TL)" },
  ],
  checks: [
    "MIZAN sayfası var mı?",
    "İsteğe bağlı MIZAN_AY sayfası (aylık kümülatif, A:yıl B:ay C:hesap D:branş E:tutar)",
    "En az bir geçmiş yıl (ör. 2022–2025) ve 7xx branş kodları var mı?",
    "TOPLAM satırları otomatik atlanır — sorun değil.",
    "Import sonrası ~50.000+ satır normaldir (branş × hesap × yıl).",
    "Canlı sitede (Vercel): BLOB_READ_WRITE_TOKEN tanımlı olmalı — aksi halde yükleme reddedilir.",
  ],
  errors: [
    "«MIZAN sayfası bulunamadı» → Dosyada sayfa adını MIZAN yapın.",
    "«MIZAN satırı okunamadı» → A ve D kolonları dolu mu, yıl sayı mı kontrol edin.",
  ],
};

/** Aynı dosyada; ileride prim hedefi / 7xx dağıtım importu için. */
export const BUTCE_MAP_TARIFE_SPEC: UploadSpec = {
  id: "tarife_map",
  title: "Tarife Grubu Sabit Tanımları",
  summary: "Hazine branş kodu, branş adı, ana branş ve tarife grubu gibi nadiren değişen sabit tanımlar.",
  fileHint: "Sabit tanım tablosu; sadece tanım değişirse güncellenir",
  sheetName: "TARIFE_MAP",
  steps: [
    "Sabit branş/tarife tanım tablosunu alın.",
    "Tanımlar değiştiyse Veri yükleme sayfasından güncelleyin.",
  ],
  columns: [
    { col: "A", field: "Branş kodu", example: "701" },
    { col: "B", field: "Hazine branş adı", example: "YANGIN VE DOĞAL AFETLER" },
    { col: "C", field: "Ana branş", example: "YANGIN" },
    { col: "D", field: "Şirket branş adı", example: "YANGIN" },
    { col: "E", field: "Tarife grubu", example: "YANGIN" },
  ],
  checks: [
    "TARIFE_MAP sayfası var mı?",
    "Her 7xx branş için tarife grubu (E kolonu) dolu mu?",
  ],
  comingSoon: false,
};

export const BUTCE_TARIFE_BRANS_PAY_SPEC: UploadSpec = {
  id: "tarife_brans_pay",
  title: "Tarife Grubu → Hazine Branşı Dağılımı",
  summary:
    "Geçmiş üretimde bir tarife grubunun priminin hangi 7xx hazine branşlarına dağıldığını gösterir. Yeni bütçe hedefleri bu paylara göre branşlara bölünür.",
  fileHint: "Tarife grubu, hazine branş kodu, tanzim yılı/ayı ve net prim içeren üretim dağılımı",
  sheetName: "İlk sayfa okunur",
  steps: [
    "Tarife grubu × hazine branşı üretim/pay raporunu alın.",
    "2026 geldikçe aynı formatta yükleyin; sistem en son yılları referans seçeneğinde kullanır.",
    "Veri yükleme sayfasında bu karttan yükleyin.",
  ],
  columns: [
    { col: "A", field: "Şirket", example: "BS" },
    { col: "B", field: "Tarife Grup Adı", example: "YANGIN" },
    { col: "C", field: "Hazine Branş Kod", example: "701" },
    { col: "D", field: "Hazine Branş Ad", example: "YANGIN VE DOĞAL AFETLER" },
    { col: "E", field: "Tanzim Yıl", example: "2025" },
    { col: "F", field: "Tanzim Ay", example: "12" },
    { col: "G", field: "Net Prim TL", example: "797149442" },
  ],
  checks: [
    "Aynı tarife grubu altında birden fazla 7xx branş olabilir; bu beklenen durumdur.",
    "Yıllar 2023–2025 veya 2026 dahil olabilir.",
    "Net Prim TL aylık satırlarsa sistem yıl içinde toplar; yıl sonu payı bu toplamdan çıkar.",
  ],
};

export const BUTCE_PRIM_SPEC: UploadSpec = {
  id: "satis_butce",
  title: "Bütçe Prim Hedefi",
  summary: "Üst yönetim / GM tarafından belirlenen prim hedefleri. Kanal ve tarife grubu bazında hedef tutarlar buradan gelir.",
  fileHint: "Kanal, tarife grubu ve hedef prim kolonlarını içeren bütçe hedef dosyası",
  sheetName: "SATIS_BUTCE_",
  steps: [
    "Kanal ve tarife grubu bazındaki bütçe prim hedeflerini alın.",
    "Veri yükleme sayfasında Bütçe Prim Hedefi kartından yükleyin.",
    "Sonra Prim hedefi sayfasında hedefleri kontrol edip A motoru ile dağıtın.",
  ],
  columns: [
    { col: "A–C", field: "Şirket, kanal1, kanal2", example: "BS, ACENTE, …" },
    { col: "D", field: "Tarife grubu", example: "KASKO, TRAFİK, …" },
    { col: "…", field: "Geçmiş yıl / hedef kolonları", example: "2027 HEDEF PRİM" },
  ],
  checks: [
    "SATIS_BUTCE_ sayfası var mı?",
    "D kolonu tarife grubu dolu mu?",
  ],
  comingSoon: false,
};

export const BUTCE_AYLIK_GT_BILANCO_SPEC: UploadSpec = {
  id: "aylik_gt_bilanco",
  title: "Aylık GT ve Bilanço Mizanı",
  summary:
    "GT ve bilanço hesaplarının aylık kümülatif gerçekleşen durumunu verir. Aylık dağılım, teknik oranlar, gelir tablosu ve bilanço adımlarını besler.",
  fileHint: "Dönem, şirket, hesap no, hesap adı ve net tutar içeren aylık mizan",
  sheetName: "İlk sayfa okunur",
  steps: [
    "Eldeki en güncel aylık GT ve bilanço mizanını alın.",
    "Bütçe döneminde yeni yıl kapanışı veya yeni ay geldikçe tekrar yükleyin.",
    "Sistem GT prim, yıl sonu mizan ve bilanço verilerini bu dosyadan üretir.",
  ],
  columns: [
    { col: "A", field: "Dönem", example: "31.12.2025" },
    { col: "B", field: "Şirket", example: "Sigorta" },
    { col: "C", field: "Hesap No", example: "7010111" },
    { col: "D", field: "Hesap Adı", example: "BRÜT YAZILAN PRİMLER" },
    { col: "E", field: "Net", example: "845300911" },
  ],
  checks: [
    "Sigorta satırları bulunmalı.",
    "7xx ile başlayan hesaplar branşlı GT verisi olarak okunur.",
    "1/2/3/4/5/6 ile başlayan hesaplar bilanço ve şirket geneli hesaplar için saklanır.",
  ],
};

export const BUTCE_KPK_VADE_SPEC: UploadSpec = {
  id: "kpk_vade",
  title: "KPK Vade Tanımları",
  summary:
    "7xx hazine branşları için ay bazında ortalama poliçe vadesi (gün). KPK hesabında başlangıç–bitiş tarihi farkı bu tablodan okunur.",
  fileHint: "Branş kodu, branş adı, ay (1–12) ve ortalama vade (gün) içeren tablo",
  sheetName: "İlk sayfa okunur",
  steps: [
    "Son 3 yıl üretiminden hesaplanmış branş × ay ortalama vade tablosunu hazırlayın.",
    "Tablo sık değişmez; yeni dosya yüklerseniz mevcut tanımın üzerine yazılır.",
  ],
  columns: [
    { col: "A", field: "Branş Kod", example: "701" },
    { col: "B", field: "Branş Ad", example: "YANGIN" },
    { col: "C", field: "Ay", example: "11" },
    { col: "D", field: "Vade", example: "362.38" },
  ],
  checks: [
    "Her 7xx branş için 1–12 arası aylar tanımlı olmalı.",
    "Vade, poliçe başlangıç–bitiş tarihi arasındaki ortalama gün sayısıdır (ör. tarımsal sezon etkisi ay bazında farklılaşır).",
    "Yükleme yapılmazsa sistemdeki varsayılan tablo kullanılır.",
  ],
};
