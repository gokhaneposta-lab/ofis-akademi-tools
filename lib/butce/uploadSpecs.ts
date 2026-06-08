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
  steps: ["Prim hedefi adımı aktif olunca yüklenecek."],
  columns: [
    { col: "A", field: "Branş kodu", example: "701" },
    { col: "B", field: "Hazine branş adı", example: "YANGIN VE DOĞAL AFETLER" },
    { col: "C", field: "Ana branş", example: "YANGIN" },
    { col: "D", field: "Şirket branş adı", example: "YANGIN" },
    { col: "E", field: "Tarife grubu", example: "YANGIN" },
  ],
  checks: [],
  comingSoon: true,
};

export const BUTCE_PRIM_SPEC: UploadSpec = {
  id: "satis_butce",
  title: "Bütçe GT Çalışma — SATIS_BUTCE_ sayfası",
  summary: "GM prim hedefi (kanal × tarife × şirket). 7xx branş dağıtımının girdisi.",
  fileHint: "Bütçe GT Çalışma_v8.xlsx (veya eşdeğeri)",
  sheetName: "SATIS_BUTCE_",
  steps: ["Prim hedefi sayfası aktif olunca yüklenecek."],
  columns: [
    { col: "A–C", field: "Şirket, kanal1, kanal2", example: "BS, ACENTE, …" },
    { col: "D", field: "Tarife grubu", example: "KASKO, TRAFİK, …" },
    { col: "…", field: "Geçmiş yıl / hedef kolonları", example: "2027 HEDEF PRİM" },
  ],
  checks: [],
  comingSoon: true,
};
