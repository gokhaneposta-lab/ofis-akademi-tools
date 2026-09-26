/**
 * Konu kotaları — exams.selection_rules içinden okunur.
 *
 * {
 *   "sections": [
 *     { "key": "tfrs17", "label": "TFRS 17 Temel Kavramlar", "weight": 40, "default": true },
 *     { "key": "muhasebe", "label": "Muhasebe ve Finansal Raporlama", "weight": 30,
 *       "categories": ["Muhasebe ve Finansal Raporlama"] }
 *   ]
 * }
 *
 * Soru `category` değeri bir bölümün `categories` listesindeyse o bölüme,
 * değilse `default: true` olan bölüme düşer.
 */

export type ExamSection = {
  key: string;
  label: string;
  weight: number;
  categories?: string[];
  default?: boolean;
};

export type ExamSelectionRules = {
  sections: ExamSection[];
};

export function parseSelectionRules(raw: unknown): ExamSelectionRules | null {
  if (!raw || typeof raw !== "object") return null;
  const sections = (raw as { sections?: unknown }).sections;
  if (!Array.isArray(sections) || sections.length === 0) return null;
  const parsed: ExamSection[] = [];
  for (const s of sections) {
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const weight = Number(o.weight);
    if (typeof o.key !== "string" || typeof o.label !== "string" || !(weight > 0)) continue;
    parsed.push({
      key: o.key,
      label: o.label,
      weight,
      categories: Array.isArray(o.categories) ? o.categories.map(String) : undefined,
      default: o.default === true,
    });
  }
  return parsed.length ? { sections: parsed } : null;
}

export function sectionKeyForCategory(
  category: string,
  rules: ExamSelectionRules,
): string | null {
  const c = category.trim().toLocaleLowerCase("tr-TR");
  for (const s of rules.sections) {
    if (s.categories?.some((x) => x.trim().toLocaleLowerCase("tr-TR") === c)) return s.key;
  }
  return rules.sections.find((s) => s.default)?.key ?? null;
}

/**
 * Ağırlıklara göre soru sayısı (en büyük kalan yöntemi).
 * Eşit kalanlarda rastgele seçilir; 7,5 / 7,5 gibi bölümler denemeden denemeye 7/8 döner.
 */
export function computeSectionQuotas(
  rules: ExamSelectionRules,
  total: number,
  random: () => number = Math.random,
): Map<string, number> {
  const weightSum = rules.sections.reduce((a, s) => a + s.weight, 0);
  const rows = rules.sections.map((s) => {
    const exact = (s.weight / weightSum) * total;
    return { key: s.key, base: Math.floor(exact), rem: exact - Math.floor(exact), tie: random() };
  });
  let left = total - rows.reduce((a, r) => a + r.base, 0);
  const order = [...rows].sort((a, b) => b.rem - a.rem || a.tie - b.tie);
  for (const r of order) {
    if (left <= 0) break;
    r.base += 1;
    left -= 1;
  }
  return new Map(rows.map((r) => [r.key, r.base]));
}
