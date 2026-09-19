/**
 * Seed TFRS 17 exam + ≥50 dummy questions (test bank, not real content).
 *
 *   npm run exam:seed
 *
 * Requires DATABASE_URL and migration 003_exams.sql applied.
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";

loadEnvConfig(process.cwd());

const DUMMY_COUNT = 55;

const CATEGORIES = [
  "Temel Kavramlar",
  "Muhasebe",
  "Finans",
  "Aktüerya",
  "Mevzuat",
  "Diğer",
] as const;

const DIFFICULTIES = ["easy", "medium", "hard"] as const;

function sanitizeDbUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  let u = raw.trim();
  if (
    (u.startsWith('"') && u.endsWith('"')) ||
    (u.startsWith("'") && u.endsWith("'"))
  ) {
    u = u.slice(1, -1).trim();
  }
  return u || null;
}

async function main() {
  const url = sanitizeDbUrl(process.env.DATABASE_URL);
  if (!url) {
    console.error("DATABASE_URL tanımlı değil.");
    process.exit(1);
  }
  const sql = neon(url);

  const examRows = await sql`
    INSERT INTO exams (
      slug, title, description, category,
      question_count, duration_minutes, passing_score, is_active
    ) VALUES (
      'tfrs-17',
      'TFRS 17 Deneme Sınavı',
      'Profesyonel deneme sınavı. V1 bankası geliştirme/test amaçlı dummy sorular içerir; gerçek TFRS 17 içeriği değildir. Canlıya alındığında gerçek soru bankası ile değiştirilecektir.',
      'tfrs17',
      50,
      60,
      70,
      true
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      question_count = EXCLUDED.question_count,
      duration_minutes = EXCLUDED.duration_minutes,
      passing_score = EXCLUDED.passing_score,
      is_active = true,
      updated_at = now()
    RETURNING id
  `;
  const examId = String((examRows as { id: string }[])[0]!.id);
  console.log("Exam id:", examId);

  // Remove previous dummy questions for clean re-seed
  await sql`
    DELETE FROM questions
    WHERE exam_id = ${examId} AND is_dummy = true
  `;

  for (let i = 1; i <= DUMMY_COUNT; i++) {
    const cat = CATEGORIES[(i - 1) % CATEGORIES.length]!;
    const diff = DIFFICULTIES[(i - 1) % DIFFICULTIES.length]!;
    const externalId = `DUMMY-${String(i).padStart(3, "0")}`;
    const correctKey = (["A", "B", "C", "D"] as const)[(i - 1) % 4]!;

    const qRows = await sql`
      INSERT INTO questions (
        exam_id, category, difficulty, question_text, explanation, source,
        external_id, sort_order, is_active, is_dummy
      ) VALUES (
        ${examId},
        ${cat},
        ${diff},
        ${`[DUMMY / TEST] Örnek soru ${i}: TFRS 17 deneme bankası — bu soru gerçek sınav içeriği değildir. Hangisi doğrudur?`},
        ${`Doğru seçenek ${correctKey}'dir. Bu açıklama test amaçlıdır; gerçek TFRS 17 mevzuat açıklaması değildir.`},
        ${"DUMMY-TEST"},
        ${externalId},
        ${i},
        true,
        true
      )
      ON CONFLICT (exam_id, external_id) DO UPDATE SET
        question_text = EXCLUDED.question_text,
        explanation = EXCLUDED.explanation,
        category = EXCLUDED.category,
        difficulty = EXCLUDED.difficulty,
        is_active = true,
        is_dummy = true,
        updated_at = now()
      RETURNING id
    `;
    const qid = String((qRows as { id: string }[])[0]!.id);

    await sql`DELETE FROM question_options WHERE question_id = ${qid}`;

    for (const key of ["A", "B", "C", "D"] as const) {
      await sql`
        INSERT INTO question_options (question_id, option_key, option_text, is_correct, sort_order)
        VALUES (
          ${qid},
          ${key},
          ${`Seçenek ${key} (dummy)`},
          ${key === correctKey},
          ${key.charCodeAt(0) - 64}
        )
      `;
    }
  }

  const countRows = await sql`
    SELECT COUNT(*)::int AS c FROM questions
    WHERE exam_id = ${examId} AND is_active = true
  `;
  const count = Number((countRows as { c: number }[])[0]?.c ?? 0);
  console.log(`Aktif soru: ${count} (hedef ≥50)`);
  if (count < 50) {
    console.error("Seed başarısız: 50'den az aktif soru");
    process.exit(1);
  }
  console.log("OK — exam:seed tamam");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
