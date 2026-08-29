import { mapPageToCategory, normalizePagePath, type InterestTag } from "./rules";

export type NewsletterCopy = {
  heading: string;
  description: string;
  buttonLabel: string;
};

const DEFAULT_COPY: NewsletterCopy = {
  heading: "Yeni içerikler",
  description:
    "Yeni rehber, araç veya güncelleme yayınlandığında kısa e-posta. Spam yok, istediğin an çık.",
  buttonLabel: "Bültene abone ol",
};

/** Path prefix → footer/inline metin. En uzun eşleşen kazanır (tag kurallarıyla uyumlu). */
const PATH_COPY: { prefix: string; copy: NewsletterCopy }[] = [
  {
    prefix: "/sigorta",
    copy: {
      heading: "TSB sektör güncellemeleri",
      description:
        "Aylık prim veya çeyreklik finansal dönem yayınlandığında, paneller güncellendiğinde kısa e-posta. Gereksiz sıklık yok — istediğin an çık.",
      buttonLabel: "Güncellemeleri al",
    },
  },
  {
    prefix: "/finans-sigorta",
    copy: {
      heading: "Finans & sigorta KPI bülteni",
      description:
        "Yeni metrik rehberleri, hesaplayıcılar ve sektör içerikleri için kısa e-posta. İstediğin an çık.",
      buttonLabel: "Bültene abone ol",
    },
  },
  {
    prefix: "/excel-araclari",
    copy: {
      heading: "Excel ipuçları ve yeni araçlar",
      description:
        "Yeni ücretsiz araç veya pratik Excel rehberi yayınlandığında haber ver. Spam yok, istediğin an çık.",
      buttonLabel: "Araçları takip et",
    },
  },
  {
    prefix: "/formul-kutuphanesi",
    copy: {
      heading: "Formül ve Excel ipuçları",
      description:
        "Yeni formül kartları ve kısa kullanım rehberleri için e-posta bırak. Spam yok, istediğin an çık.",
      buttonLabel: "Bültene abone ol",
    },
  },
  {
    prefix: "/egitimler",
    copy: {
      heading: "Yeni eğitim içerikleri",
      description:
        "Temel, orta ve ileri seviye Excel eğitimlerinde yeni modül veya güncelleme olduğunda haber ver.",
      buttonLabel: "Eğitimleri takip et",
    },
  },
  {
    prefix: "/blog",
    copy: {
      heading: "Yeni rehberler",
      description:
        "Blogda yeni rehber yayınlandığında kısa e-posta. Spam yok, istediğin an çık.",
      buttonLabel: "Rehberleri takip et",
    },
  },
  {
    prefix: "/kaynaklar",
    copy: {
      heading: "Yeni ücretsiz kaynaklar",
      description:
        "Şablon, formül kartı ve checklist yayınlandığında ilk sen haberdar ol. İstediğin an çık.",
      buttonLabel: "Kaynakları takip et",
    },
  },
];

const TAG_FALLBACK: Partial<Record<InterestTag, NewsletterCopy>> = {
  insurance: PATH_COPY.find((r) => r.prefix === "/sigorta")!.copy,
  finance: PATH_COPY.find((r) => r.prefix === "/finans-sigorta")!.copy,
  excel: PATH_COPY.find((r) => r.prefix === "/excel-araclari")!.copy,
  training: PATH_COPY.find((r) => r.prefix === "/egitimler")!.copy,
  tsb: PATH_COPY.find((r) => r.prefix === "/sigorta")!.copy,
};

export function newsletterCopyForPath(page: string): NewsletterCopy {
  const path = normalizePagePath(page).toLowerCase();
  let best: (typeof PATH_COPY)[number] | null = null;
  for (const rule of PATH_COPY) {
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) {
      if (!best || rule.prefix.length > best.prefix.length) best = rule;
    }
  }
  if (best) return best.copy;
  const tag = mapPageToCategory(path);
  return TAG_FALLBACK[tag] ?? DEFAULT_COPY;
}
