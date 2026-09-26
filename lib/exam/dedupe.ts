/** Soru metni karşılaştırma: aynı sorunun farklı ID'lerle bankada olmasını yakalar. */

/** "(Uygulama Örneği #25)" gibi kopya ekleri — içerik farkı yaratmaz. */
const COPY_SUFFIX = /\s*\((?:uygulama\s+)?örneği?\s*#?\s*\d+\)\s*$/iu;

export function stripCopySuffix(text: string): string {
  return text.replace(COPY_SUFFIX, "").trim();
}

export function normalizeQuestionText(text: string): string {
  return stripCopySuffix(text)
    .toLocaleLowerCase("tr-TR")
    .replace(/[“”"'’‘`´]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(norm: string): Set<string> {
  return new Set(norm.split(" ").filter((t) => t.length > 2));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  return inter / (a.size + b.size - inter);
}

export const NEAR_DUPLICATE_THRESHOLD = 0.85;

/**
 * Birebir aynı (normalize) veya çok benzer metinleri kümeler.
 * Dönen her küme aynı sorunun kopyalarıdır; tek elemanlı kümeler tekil sorulardır.
 */
export function clusterQuestions<T>(
  items: T[],
  getText: (item: T) => string,
  threshold = NEAR_DUPLICATE_THRESHOLD,
): T[][] {
  const norms = items.map((it) => normalizeQuestionText(getText(it)));
  const tokens = norms.map(tokenSet);
  const parent = items.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (norms[i] === norms[j] || jaccard(tokens[i]!, tokens[j]!) >= threshold) union(i, j);
    }
  }
  const groups = new Map<number, T[]>();
  items.forEach((it, i) => {
    const root = find(i);
    const g = groups.get(root) ?? [];
    g.push(it);
    groups.set(root, g);
  });
  return [...groups.values()];
}
