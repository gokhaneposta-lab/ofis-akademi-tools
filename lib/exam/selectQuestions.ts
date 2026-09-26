import { normalizeQuestionText } from "./dedupe";
import {
  computeSectionQuotas,
  sectionKeyForCategory,
  type ExamSelectionRules,
} from "./sections";

export type SelectableQuestion = {
  id: string;
  category: string;
  question_text: string;
};

function shuffle<T>(arr: T[], random: () => number): T[] {
  const pool = [...arr];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  return pool;
}

/**
 * Deneme için soru seçer.
 * - Aynı metin (kopya ekleri dahil) bir denemede iki kez yer almaz.
 * - `rules` varsa bölüm kotaları uygulanır; bir bölümün havuzu yetmezse eksik diğer bölümlerden tamamlanır.
 * - Seçilen sorular bölüm sırası karışık olacak şekilde döner.
 */
export function selectQuestionIds(
  questions: SelectableQuestion[],
  count: number,
  rules: ExamSelectionRules | null,
  random: () => number = Math.random,
): string[] {
  if (count <= 0) return [];

  const seenText = new Set<string>();
  const unique: SelectableQuestion[] = [];
  for (const q of shuffle(questions, random)) {
    const key = normalizeQuestionText(q.question_text);
    if (seenText.has(key)) continue;
    seenText.add(key);
    unique.push(q);
  }
  if (unique.length < count) {
    throw new Error(
      `Yetersiz tekil soru: havuzda ${unique.length}, gereken ${count}`,
    );
  }

  if (!rules) return unique.slice(0, count).map((q) => q.id);

  const bySection = new Map<string, SelectableQuestion[]>();
  const unassigned: SelectableQuestion[] = [];
  for (const q of unique) {
    const key = sectionKeyForCategory(q.category, rules);
    if (!key) {
      unassigned.push(q);
      continue;
    }
    const list = bySection.get(key) ?? [];
    list.push(q);
    bySection.set(key, list);
  }

  const quotas = computeSectionQuotas(rules, count, random);
  const picked: SelectableQuestion[] = [];
  const leftovers: SelectableQuestion[] = [...unassigned];
  for (const s of rules.sections) {
    const pool = bySection.get(s.key) ?? [];
    const quota = quotas.get(s.key) ?? 0;
    picked.push(...pool.slice(0, quota));
    leftovers.push(...pool.slice(quota));
  }
  if (picked.length < count) {
    picked.push(...shuffle(leftovers, random).slice(0, count - picked.length));
  }

  return shuffle(picked, random).map((q) => q.id);
}
