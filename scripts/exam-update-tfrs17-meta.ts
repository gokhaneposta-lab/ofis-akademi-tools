/**
 * Update tfrs-17 exam copy for production (real bank live).
 *   npx tsx scripts/exam-update-tfrs17-meta.ts
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL yok");
  process.exit(1);
}
const sql = neon(url);

const title = "TFRS 17 Finans Sertifika Hazırlık";
const description =
  "TFRS 17 deneme sınavı. Her denemede soru bankasından rastgele 50 soru seçilir. Süre 60 dakika, geçme barajı %70. Giriş gerekmez.";

await sql`
  UPDATE exams
  SET title = ${title},
      description = ${description},
      updated_at = now()
  WHERE slug = 'tfrs-17'
`;
console.log("OK — exam meta güncellendi");
