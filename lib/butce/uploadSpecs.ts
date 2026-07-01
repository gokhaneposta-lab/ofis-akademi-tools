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
  title: "BUTCE_MAP.xlsx — MIZAN sayfası",
  summary:
    "Geçmiş yıl sonu branş mizanı. Teknik oranlar (Faz 1) bu veriden hesaplanır: her branş için pay ÷ baz oranları, Excel GT ağırlıklı yıl birleştirmesi.",
  fileHint: "BUTCE_MAP.xlsx (veya aynı yapıda Excel; .xlsx / .xls)",
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
  title: "BUTCE_MAP.xlsx — TARIFE_MAP sayfası",
  summary: "Tarife grubu ↔ 7xx hazine branş eşlemesi. Prim hedefi dağıtımında kullanılacak.",
  fileHint: "Aynı BUTCE_MAP.xlsx dosyası",
  sheetName: "TARIFE_MAP",
  steps: [
    "Aynı BUTCE_MAP.xlsx dosyasını yükleyin (MIZAN ile birlikte import edilir).",
    "Prim hedefi sayfasında «BUTCE_MAP — MIZAN + TARIFE_MAP» ile yükleyin.",
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
  title: "Tarife grubu × hazine branşı pay tablosu",
  summary:
    "Geçmiş üretimde tarife grubu priminin hangi 7xx hazine branşlarına dağıldığını gösterir. A motoru yeni bütçe hedeflerini bu paylara göre dağıtır.",
  fileHint: "2023-2025 tarifegrubu hazine branşı pay.xlsx (2026 dahil olabilir)",
  sheetName: "İlk sayfa okunur",
  steps: [
    "Tarife grubu × hazine branşı üretim/pay raporunu alın.",
    "2026 geldikçe aynı formatta yükleyin; sistem en son yılları referans seçeneğinde kullanır.",
    "Prim hedefi sayfasında «Tarife-branş pay» ile yükleyin.",
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
  title: "Bütçe GT Çalışma — SATIS_BUTCE_ sayfası",
  summary: "GM prim hedefi (kanal × tarife × şirket). 7xx branş dağıtımının girdisi.",
  fileHint: "Bütçe GT Çalışma_v8.xlsx (veya eşdeğeri)",
  sheetName: "SATIS_BUTCE_",
  steps: [
    "Bütçe GT Çalışma_v8.xlsx dosyasını alın.",
    "Prim hedefi sayfasında «SATIS_BUTCE_» olarak yükleyin.",
    "Tarife hedeflerini düzenleyip A motoru ile dağıtın.",
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
