/**
 * Blog yazıları — araçlara yönlendiren SEO dostu içerik.
 * content: p = paragraf, h3 = başlık, ul = madde listesi, formula = formül kutusu,
 * table = tablo, callout = vurgu kutusu, diagram = blog şema SVG'leri
 */
export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "formula"; label: string; formula: string }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { type: "callout"; variant: "info" | "warning"; title?: string; text: string }
  | { type: "diagram"; variant: "tfrs17-policy-coverage" | "tfrs17-premium-flow" }
  | { type: "links"; title?: string; items: Array<{ label: string; href: string }> };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  toolHref?: string;
  toolName?: string;
  /** For posts without a tool: link to a related education/guide page. */
  guideHref?: string;
  guideName?: string;
  /** SEO / JSON-LD için anahtar kelimeler */
  keywords?: string[];
  /** Sayfa altında FAQ + FAQPage şeması */
  faqs?: Array<{ question: string; answer: string }>;
  content: ContentBlock[];
};

import { BLOG_POSTS_EXTRA } from "./blog-posts-extra";
import { BLOG_POSTS_TFRS17 } from "./blog-posts-tfrs17";

export type BlogCategorySlug =
  | "formuller"
  | "metin"
  | "veri-analizi"
  | "finans"
  | "donusturme"
  | "dogrulama"
  | "kaynaklar";

export const BLOG_CATEGORIES: Array<{
  slug: BlogCategorySlug;
  label: string;
  description: string;
}> = [
  { slug: "formuller", label: "Formüller", description: "DÜŞEYARA, EĞER ve diğer formül rehberleri." },
  { slug: "metin", label: "Metin", description: "Boşluk, harf dönüştürme, kolonlara bölme, liste işlemleri." },
  { slug: "veri-analizi", label: "Veri Analizi", description: "İstatistik, korelasyon, regresyon ve dağılım hesapları." },
  { slug: "finans", label: "Finans", description: "Faiz, kredi taksit ve yüzde hesapları." },
  { slug: "donusturme", label: "Dönüştürme", description: "CSV, JSON, SQL gibi format dönüşümleri." },
  { slug: "dogrulama", label: "Doğrulama", description: "IBAN, e-posta, telefon gibi kontroller ve temizlik." },
  { slug: "kaynaklar", label: "Kaynaklar", description: "Şablonlar, checklist'ler ve kısayol kartları." },
];

export function getCategoryBySlug(slug: string): (typeof BLOG_CATEGORIES)[number] | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug);
}

export function categorizePost(post: Pick<BlogPost, "slug" | "toolHref" | "toolName" | "title">): BlogCategorySlug {
  const s = `${post.slug} ${post.title} ${post.toolHref ?? ""} ${post.toolName ?? ""}`.toLowerCase();
  if (
    s.includes("tfrs") ||
    s.includes("tfrs 17") ||
    s.includes("sigorta muhasebe") ||
    s.includes("sigortacılık mali") ||
    (s.includes("sigorta") && (s.includes("bilanço") || s.includes("gelir tablosu") || s.includes("teknik")))
  )
    return "finans";
  if (s.includes("kredi") || s.includes("faiz") || s.includes("yuzde") || s.includes("yüzde")) return "finans";
  if (s.includes("iban") || s.includes("telefon") || s.includes("email") || s.includes("e-posta")) return "dogrulama";
  if (s.includes("json") || s.includes("sql") || s.includes("csv")) return "donusturme";
  if (
    s.includes("regresyon") || s.includes("korelasyon") || s.includes("z-score") ||
    s.includes("istatistik") || s.includes("frekans") || s.includes("pivot") ||
    s.includes("grafik") || s.includes("dashboard")
  )
    return "veri-analizi";
  if (
    s.includes("formul") || s.includes("düşeyara") || s.includes("duseyara") ||
    s.includes("eger") || s.includes("xlookup") || s.includes("çaprazara") || s.includes("caprazara")
  )
    return "formuller";
  if (
    s.includes("sablon") || s.includes("checklist") || s.includes("kart") ||
    s.includes("baslangic") || s.includes("başlangıç") || s.includes("nasil-kullanilir")
  )
    return "kaynaklar";
  return "metin";
}

export function getCategoryLabelForPost(post: Pick<BlogPost, "slug" | "toolHref" | "toolName" | "title">): string {
  const cat = categorizePost(post);
  return getCategoryBySlug(cat)?.label || "Excel";
}

export function getBenefitLine(post: Pick<BlogPost, "title" | "toolName" | "slug" | "guideName">): string {
  const t = post.title.toLowerCase();
  if (t.includes("1000") || t.includes("saniy")) return "1000 satırı saniyeler içinde çözün.";
  if (t.includes("tek tık") || t.includes("tek tıkla")) return "Tek tıkla sonucu alıp Excel'e yapıştırın.";
  if (t.includes("anında") || t.includes("aninda")) return "Anında sonuç alın, vakit kaybetmeyin.";
  if (post.slug.includes("iban")) return "IBAN listesini tek tıkla doğrulayın.";
  if (post.slug.includes("csv")) return "CSV'yi tek tıkla sütunlara ayırın.";
  if (post.slug.includes("tarih-farki")) return "Tarih farkını toplu hesaplayın.";
  if (post.slug.includes("iki-liste")) return "Ortak ve farklı kayıtları anında bulun.";
  if (post.slug.includes("tfrs-17")) return "Finans & Sigorta metrikleri ve teknik karşılık özetleriyle tabloyu bağlamlandırın.";
  if (post.guideName) return `${post.guideName} ile adım adım öğrenin.`;
  if (post.toolName) return `${post.toolName} ile 5 saniyede çözün.`;
  return "Adım adım rehberimizle hemen öğrenin.";
}

export function getPostPlainText(post: BlogPost): string {
  const parts = post.content.map((b) => {
    if (b.type === "p") return b.text;
    if (b.type === "h3") return b.text;
    if (b.type === "ul") return b.items.join(" ");
    if (b.type === "formula") return `${b.label} ${b.formula}`;
    if (b.type === "table") return [b.caption, ...b.headers, ...b.rows.map((r) => r.join(" "))].filter(Boolean).join(" ");
    if (b.type === "callout") return `${b.title ?? ""} ${b.text}`;
    if (b.type === "diagram") return `diagram ${b.variant}`;
    if (b.type === "links") return b.items.map((x) => `${x.label} ${x.href}`).join(" ");
    return "";
  });
  const faqText = (post.faqs ?? []).map((f) => `${f.question} ${f.answer}`).join(" ");
  return `${post.title} ${post.description} ${parts.join(" ")} ${faqText}`.trim();
}

const BLOG_POSTS_CORE: BlogPost[] = [
  {
    slug: "excelde-ad-soyad-ayirma",
    title: "Excel'de Ad Soyad Ayırma: 1000 Satırı Saniyeler İçinde Böl (3 Yöntem + Ücretsiz Araç)",
    description: "Excel'de tam ad listesini ad ve soyad sütunlarına ayırmanın en hızlı 3 yolu: Metni Sütunlara Böl, formül ve tek tıkla ücretsiz araç.",
    date: "2025-03-15",
    toolHref: "/excel-araclari/ad-soyad-ayir",
    toolName: "Ad Soyad Ayırıcı",
    content: [
      { type: "p", text: "Excel'de tek sütunda duran ad soyad listesini iki sütuna bölmek, raporlarda ve e-posta listelerinde sık karşılaşılan bir ihtiyaç. Aşağıda hem Excel içinde hem de hızlı sonuç için kullanabileceğiniz 3 yöntemi anlatıyoruz." },
      { type: "h3", text: "1. Yöntem: Metni Sütunlara Böl (En pratik)" },
      { type: "p", text: "Excel'in kendi özelliği; çoğu senaryoda en hızlı çözüm. Adımlar:" },
      { type: "ul", items: ["Ad soyad sütununu seçin.", "Veri sekmesine gidin.", "Metni Sütunlara Dönüştür seçeneğini tıklayın.", "Sınırlandırılmış seçin, ayırıcı olarak Boşluk işaretleyin.", "Son deyin; veri iki sütuna bölünür."] },
      { type: "p", text: "İki adı olan kişilerde (ör. Ayşe Fatma Kaya) ikinci ad ile soyad ayrı sütunlara düşebilir; gerekirse birkaç hücreyi birleştirerek düzeltebilirsiniz." },
      { type: "h3", text: "2. Yöntem: Formül ile ayırma" },
      { type: "p", text: "A1 hücresinde tam ad olduğunu varsayalım. Adı almak için SOL ve BUL, soyadı almak için SAĞ ve UZUNLUK kullanılır:" },
      { type: "formula", label: "Ad için", formula: "=SOL(A1;BUL(\" \";A1)-1)" },
      { type: "formula", label: "Soyad için", formula: "=SAĞ(A1;UZUNLUK(A1)-BUL(\" \";A1))" },
      { type: "p", text: "Birden fazla ad varsa (Meliha Elvin Güzel Yıldırım gibi) son kelime soyad kabul edilir; formül mantığı aynı kalır, sadece boşluk pozisyonu değişir." },
      { type: "h3", text: "3. Yöntem: Online araç kullanmak (En kolayı)" },
      { type: "p", text: "Liste uzunsa veya hem ad+soyad hem sadece soyad çıktısı istiyorsanız, hazır bir araç saniyeler içinde sonuç verir. Listeyi yapıştırıp Ayır dedikten sonra sonucu Tablo veya Excel (noktalı virgüllü) formatında kopyalayıp doğrudan Excel'e yapıştırabilirsiniz." },
      { type: "h3", text: "Ne zaman hangi yöntem?" },
      { type: "ul", items: ["Küçük liste, tek seferlik iş → Excel formül veya Metni Sütunlara Böl yeterli.", "Büyük liste, Ad + Soyad ve Sadece soyad seçenekleri → Online araç daha pratik."] },
      { type: "p", text: "Özetle: Excel içinde iki yöntem (Metni Sütunlara Böl veya formül), hız ve esneklik istiyorsanız araç. Hepsi aynı sonuca götürür; tercihinize göre birini seçebilirsiniz." },
    ],
  },
  {
    slug: "csv-veriyi-sutunlara-ayirma",
    title: "CSV'yi Excel'de Sütunlara Ayırma: En Hızlı 2 Yöntem + Ücretsiz Araç",
    description: "CSV veya virgülle ayrılmış metni sütunlara bölme: Metni Sütunlara Dönüştür ve tek tıkla ücretsiz araç. Hızlı çözüm.",
    date: "2025-03-15",
    toolHref: "/excel-araclari/csv-ayir",
    toolName: "CSV Ayırıcı",
    content: [
      { type: "p", text: "CSV dosyasını Excel'de açtığınızda tüm satır tek sütunda görünür. Bu veriyi anlamlı sütunlara bölmek için iki pratik yol var." },
      { type: "h3", text: "1. Yöntem: Metni Sütunlara Dönüştür (Excel içinde)" },
      { type: "ul", items: ["Veriyi veya ilgili sütunu seçin.", "Veri sekmesi → Metni Sütunlara Dönüştür.", "Sınırlandırılmış seçin.", "Ayırıcı olarak virgül veya noktalı virgül seçin (Türkiye'de CSV genelde ; kullanır).", "Son deyin; veri sütunlara dağılır."] },
      { type: "h3", text: "2. Yöntem: Online araç (metin olarak geldiyse)" },
      { type: "p", text: "Veri Excel'de değil, e-posta veya web sayfasındaki metin olarak geliyorsa: metni kopyalayıp ayırıcıyı (virgül, noktalı virgül veya sekme) seçerek sütunlara bölen bir araca yapıştırın. Sonucu sekme ile kopyalayıp Excel'e yapıştırdığınızda otomatik sütunlara düşer." },
      { type: "p", text: "Özet: Excel'deki veri için Metni Sütunlara Dönüştür; dışarıdan gelen ham metin için ayırıcı seçen araç. İkisi de aynı sonuca götürür." },
    ],
  },
  {
    slug: "excelde-kelime-ve-karakter-sayisi",
    title: "Excel'de Kelime ve Karakter Sayısı: Anında Sonuç (Formül + Ücretsiz Araç)",
    description: "Excel'de UZUNLUK ile karakter sayısı, kelime sayısı formülü. Metni yapıştır, anında say—ücretsiz araç.",
    date: "2025-03-15",
    toolHref: "/excel-araclari/kelime-karakter-sayaci",
    toolName: "Kelime & Karakter Sayacı",
    content: [
      { type: "p", text: "Hücredeki metnin karakter veya kelime sayısını Excel'de formülle alabilir veya hızlı sonuç için bir araca yapıştırabilirsiniz." },
      { type: "h3", text: "Karakter sayısı" },
      { type: "p", text: "UZUNLUK (İngilizce: LEN) fonksiyonu tüm karakterleri sayar; boşluklar dahil. A1 hücresi için: =UZUNLUK(A1). Boşluksuz karakter sayısı için önce boşlukları DEĞİŞTİR ile kaldırıp sonra UZUNLUK alabilirsiniz." },
      { type: "h3", text: "Kelime sayısı (yaklaşık)" },
      { type: "p", text: "En basit yöntem boşluk sayısına dayanır: metinde kaç boşluk varsa yaklaşık kelime sayısı 'boşluk sayısı + 1' olur. TEMİZLE ile baş/son boşlukları alıp, toplam UZUNLUK ile boşluksuz UZUNLUK farkına 1 ekleyen formüller kullanılabilir. Çoklu boşluklar hata verebilir; metni normalize etmek iyi olur." },
      { type: "h3", text: "Hızlı sonuç" },
      { type: "p", text: "Metni veya paragrafı kopyalayıp kelime ve karakter sayısını anında gösteren bir araca yapıştırabilirsiniz; sonucu Excel'e taşımak isterseniz sayıları kopyalayıp yapıştırmanız yeterli." },
    ],
  },
  {
    slug: "iki-listeyi-karsilastirma-excel",
    title: "İki Listeyi Karşılaştırma: Ortak ve Farklı Kayıtları Tek Tıkla Bul (Ücretsiz Araç)",
    description: "İki Excel listesini karşılaştırma: sadece A'da, sadece B'de, ortak kayıtlar. En hızlı çözüm: tek tıkla ücretsiz araç.",
    date: "2025-03-15",
    toolHref: "/excel-araclari/iki-listeyi-karsilastir",
    toolName: "İki Listeyi Karşılaştır",
    content: [
      { type: "p", text: "İki listeyi (müşteri listeleri, Excel sütunları vb.) karşılaştırırken genelde şunları bilmek istersiniz: sadece A'da olanlar, sadece B'de olanlar, her iki listede de olanlar (ortak)." },
      { type: "h3", text: "1. Yöntem: EĞERSAY ile Excel'de" },
      { type: "p", text: "A'da var B'de yok bulmak için: A2'deki değerin B sütununda geçip geçmediğini =EĞERSAY(B:B;A2) ile kontrol edin. Sonuç 0 ise A2 değeri B'de yoktur. Filtreyle 0 olanları gösterirseniz sadece A'da olanlar çıkar. Aynı mantıkla B sütunundaki her değer için A'da arama yaparak sadece B'de olanları bulabilirsiniz." },
      { type: "h3", text: "2. Yöntem: Online araç" },
      { type: "p", text: "Formül yazmak istemiyorsanız iki listeyi (her satırda bir değer) iki kutuya yapıştırıp ortak, sadece A'da ve sadece B'de sonuçlarını üreten araçlar tek tıkla sonuç verir. Çıktıyı virgülle ayrılmış metin veya Excel'e yapıştırmaya uygun tablo olarak alabilirsiniz." },
      { type: "p", text: "Özet: Küçük listeler için EĞERSAY yeterli; büyük listeler ve hazır çıktı formatı için araç daha pratik." },
    ],
  },
];

export const BLOG_POSTS: BlogPost[] = [...BLOG_POSTS_CORE, ...BLOG_POSTS_EXTRA, ...BLOG_POSTS_TFRS17];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}

export function getPostByToolHref(toolHref: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.toolHref === toolHref);
}

export function getPostsByCategory(category: BlogCategorySlug): BlogPost[] {
  return BLOG_POSTS.filter((p) => categorizePost(p) === category);
}

export function getAllCategorySlugs(): BlogCategorySlug[] {
  return BLOG_CATEGORIES.map((c) => c.slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const post = getPostBySlug(slug);
  if (!post) return [];
  const cat = categorizePost(post);
  const sameCategory = BLOG_POSTS.filter((p) => p.slug !== slug && categorizePost(p) === cat);
  const take = sameCategory.slice(0, limit);
  if (take.length >= limit) return take;
  const rest = BLOG_POSTS.filter((p) => p.slug !== slug && !take.some((x) => x.slug === p.slug));
  return [...take, ...rest.slice(0, limit - take.length)];
}
