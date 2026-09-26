/**
 * Bankadaki kopya soruları pasife alır: her kopya kümesinden en küçük ID'li soru kalır,
 * kalan sorunun metnindeki "(Uygulama Örneği #N)" eki temizlenir.
 *
 *   npx tsx scripts/exam-dedupe-bank.ts --exam tfrs-17            (sadece rapor)
 *   npx tsx scripts/exam-dedupe-bank.ts --exam tfrs-17 --apply    (uygula)
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { clusterQuestions, stripCopySuffix } from "../lib/exam/dedupe";

loadEnvConfig(process.cwd());

type Q = { id: string; external_id: string | null; category: string; question_text: string };

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function idNum(q: Q): number {
  const n = Number(q.external_id);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

async function main() {
  const examSlug = arg("exam") ?? "tfrs-17";
  const apply = process.argv.includes("--apply");
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL yok");
  const sql = neon(url);

  const rows = (await sql`
    SELECT q.id, q.external_id, q.category, q.question_text
    FROM questions q JOIN exams e ON e.id = q.exam_id
    WHERE e.slug = ${examSlug} AND q.is_active = true
  `) as Q[];

  const groups = clusterQuestions(rows, (q) => q.question_text);
  const toDeactivate: Q[] = [];
  const toRename: { q: Q; text: string }[] = [];
  for (const g of groups) {
    const sorted = [...g].sort((a, b) => idNum(a) - idNum(b));
    const keep = sorted[0]!;
    toDeactivate.push(...sorted.slice(1));
    const clean = stripCopySuffix(keep.question_text);
    if (clean !== keep.question_text) toRename.push({ q: keep, text: clean });
    if (g.length > 1) {
      console.log(
        `Küme (${g.length}) kalan ID ${keep.external_id} — pasif: ${sorted
          .slice(1)
          .map((q) => q.external_id)
          .join(", ")}`,
      );
    }
  }

  console.log(`Aktif: ${rows.length}, tekil: ${groups.length}, pasife alınacak: ${toDeactivate.length}, ek temizlenecek: ${toRename.length}`);

  if (!apply) {
    console.log("Rapor modu. Uygulamak için --apply ekleyin.");
    return;
  }

  for (const q of toDeactivate) {
    await sql`UPDATE questions SET is_active = false, updated_at = now() WHERE id = ${q.id}`;
  }
  for (const { q, text } of toRename) {
    await sql`UPDATE questions SET question_text = ${text}, updated_at = now() WHERE id = ${q.id}`;
  }
  console.log("Uygulandı.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
