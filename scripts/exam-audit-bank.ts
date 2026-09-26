/**
 * Soru bankası denetimi: aynı / çok benzer soru metinleri, konu, zorluk ve doğru şık dağılımı.
 *
 *   npx tsx scripts/exam-audit-bank.ts --exam tfrs-17
 *   npx tsx scripts/exam-audit-bank.ts --exam tfrs-17 --file "C:/.../yeni.xlsx" [--id-offset 450]
 *
 * Rapor: data/exams/audit-<exam>.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import * as XLSX from "xlsx";

loadEnvConfig(process.cwd());

type Item = {
  origin: "db" | "file";
  externalId: string;
  category: string;
  difficulty: string;
  correct: string;
  text: string;
  norm: string;
  tokens: Set<string>;
};

const NEAR_THRESHOLD = 0.85;

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function fixMojibake(s: string): string {
  if (!s || !/[ÃÄÅ]/.test(s)) return s;
  const fixed = Buffer.from(s, "latin1").toString("utf8");
  return fixed.includes("\uFFFD") ? s : fixed;
}

function normalizeText(s: string): string {
  return s
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

function bump(map: Record<string, number>, key: string) {
  map[key] = (map[key] ?? 0) + 1;
}

function readFileItems(filePath: string): Item[] {
  const wb = XLSX.read(readFileSync(filePath), { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]!]!;
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return rows.map((raw) => {
    const r: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) r[fixMojibake(k).trim()] = fixMojibake(String(v)).trim();
    const text = r["Soru"] ?? "";
    const norm = normalizeText(text);
    return {
      origin: "file" as const,
      externalId: r["ID"] ?? "",
      category: r["Konu"] ?? "",
      difficulty: r["Zorluk"] ?? "",
      correct: (r["Doğru Cevap"] ?? "").toUpperCase().slice(0, 1),
      text,
      norm,
      tokens: tokenSet(norm),
    };
  });
}

async function readDbItems(examSlug: string): Promise<Item[]> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL yok");
  const sql = neon(url);
  const rows = (await sql`
    SELECT q.external_id, q.category, q.difficulty, q.question_text,
      (SELECT o.option_key FROM question_options o
        WHERE o.question_id = q.id AND o.is_correct LIMIT 1) AS correct
    FROM questions q
    JOIN exams e ON e.id = q.exam_id
    WHERE e.slug = ${examSlug} AND q.is_active = true
  `) as Record<string, unknown>[];
  return rows.map((r) => {
    const text = String(r.question_text ?? "");
    const norm = normalizeText(text);
    return {
      origin: "db" as const,
      externalId: String(r.external_id ?? ""),
      category: String(r.category ?? ""),
      difficulty: String(r.difficulty ?? ""),
      correct: String(r.correct ?? ""),
      text,
      norm,
      tokens: tokenSet(norm),
    };
  });
}

function summarize(items: Item[]) {
  const category: Record<string, number> = {};
  const difficulty: Record<string, number> = {};
  const correct: Record<string, number> = {};
  for (const it of items) {
    bump(category, it.category || "(boş)");
    bump(difficulty, it.difficulty || "(boş)");
    bump(correct, it.correct || "(boş)");
  }
  return { count: items.length, category, difficulty, correct };
}

function label(it: Item) {
  return `${it.origin}#${it.externalId}`;
}

async function main() {
  const examSlug = arg("exam") ?? "tfrs-17";
  const fileArg = arg("file");

  const dbItems = await readDbItems(examSlug);
  let fileItems: Item[] = [];
  if (fileArg) {
    const p = resolve(fileArg);
    if (!existsSync(p)) throw new Error(`Dosya yok: ${p}`);
    fileItems = readFileItems(p);
    const offset = Number(arg("id-offset") ?? 0);
    if (offset) {
      for (const f of fileItems) f.externalId = String(Number(f.externalId) + offset);
    }
  }

  // Dosyadaki ID ile DB'deki aynı ID üst üste yazılacağı için DB kopyasını karşılaştırmadan çıkar
  const fileIds = new Set(fileItems.map((f) => f.externalId));
  const all = [...dbItems.filter((d) => !fileIds.has(d.externalId)), ...fileItems];

  const exactGroups = new Map<string, Item[]>();
  for (const it of all) {
    const g = exactGroups.get(it.norm) ?? [];
    g.push(it);
    exactGroups.set(it.norm, g);
  }
  const exact = [...exactGroups.values()]
    .filter((g) => g.length > 1)
    .map((g) => ({ ids: g.map(label), text: g[0]!.text.slice(0, 160) }));

  const near: { a: string; b: string; score: number; textA: string; textB: string }[] = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i]!;
      const b = all[j]!;
      if (a.norm === b.norm) continue;
      const s = jaccard(a.tokens, b.tokens);
      if (s >= NEAR_THRESHOLD) {
        near.push({
          a: label(a),
          b: label(b),
          score: Math.round(s * 100) / 100,
          textA: a.text.slice(0, 160),
          textB: b.text.slice(0, 160),
        });
      }
    }
  }
  near.sort((x, y) => y.score - x.score);

  // Union-find: benzer soruları kümele → tekil soru sayısı
  const index = new Map(all.map((it, i) => [label(it), i]));
  const parent = all.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i]!)));
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };
  for (const g of exactGroups.values()) {
    for (let k = 1; k < g.length; k++) union(index.get(label(g[0]!))!, index.get(label(g[k]!))!);
  }
  for (const p of near) union(index.get(p.a)!, index.get(p.b)!);
  const clusterMap = new Map<number, Item[]>();
  all.forEach((it, i) => {
    const root = find(i);
    const c = clusterMap.get(root) ?? [];
    c.push(it);
    clusterMap.set(root, c);
  });
  const clusters = [...clusterMap.values()]
    .filter((c) => c.length > 1)
    .sort((a, b) => b.length - a.length)
    .map((c) => ({
      size: c.length,
      category: c[0]!.category,
      ids: c.map(label),
      text: c[0]!.text.slice(0, 160),
    }));
  const uniqueByCategory: Record<string, number> = {};
  for (const c of clusterMap.values()) bump(uniqueByCategory, c[0]!.category || "(boş)");

  const idCollisions = fileItems
    .filter((f) => dbItems.some((d) => d.externalId === f.externalId))
    .map((f) => f.externalId);

  const report = {
    exam: examSlug,
    db: summarize(dbItems),
    file: fileArg ? summarize(fileItems) : null,
    idCollisionsWithDb: idCollisions,
    exactDuplicateGroups: exact.length,
    nearDuplicatePairs: near.length,
    totalItems: all.length,
    uniqueQuestions: clusterMap.size,
    uniqueByCategory,
    duplicateClusters: clusters.length,
    clusters,
    exact,
    near,
  };

  mkdirSync(resolve("data/exams"), { recursive: true });
  const out = resolve(`data/exams/audit-${examSlug}.json`);
  writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

  console.log(`DB aktif: ${dbItems.length}, dosya: ${fileItems.length}`);
  console.log(`ID çakışması (dosya→DB): ${idCollisions.length}`);
  console.log(`Birebir aynı metin grubu: ${exact.length}`);
  console.log(`Çok benzer çift (>= ${NEAR_THRESHOLD}): ${near.length}`);
  console.log(`Toplam: ${all.length}, tekil soru: ${clusterMap.size}, tekrar kümesi: ${clusters.length}`);
  console.log(`Rapor: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
