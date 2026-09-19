/**
 * Full-random question selection for V1.
 * Category quotas can hook in later via exams.selection_rules.
 */
export function pickRandomQuestionIds(
  allActiveIds: string[],
  count: number,
): string[] {
  if (count <= 0) return [];
  if (allActiveIds.length < count) {
    throw new Error(
      `Yetersiz aktif soru: havuzda ${allActiveIds.length}, gereken ${count}`,
    );
  }
  const pool = [...allActiveIds];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  return pool.slice(0, count);
}
