/**
 * Verify active question bank for an exam.
 *   npx tsx scripts/exam-verify-bank.ts --exam tfrs-17
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { neon } from "@neondatabase/serverless";

async function main() {
  const slug = process.argv.includes("--exam")
    ? process.argv[process.argv.indexOf("--exam") + 1]
    : "tfrs-17";

  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL yok");
    process.exit(1);
  }
  const sql = neon(url);

  const exam = await sql`
    SELECT id, slug, title, question_count, description
    FROM exams WHERE slug = ${slug} LIMIT 1
  `;
  if (!(exam as unknown[]).length) {
    console.error("exam yok");
    process.exit(1);
  }
  const e = (exam as { id: string; title: string; question_count: number }[])[0]!;
  const counts = await sql`
    SELECT
      COUNT(*) FILTER (WHERE is_active AND NOT is_dummy)::int AS active_real,
      COUNT(*) FILTER (WHERE is_active AND is_dummy)::int AS active_dummy,
      COUNT(*) FILTER (WHERE is_active)::int AS active_all
    FROM questions WHERE exam_id = ${e.id}
  `;
  console.log(JSON.stringify({ exam: e, ...(counts as object[])[0] }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
