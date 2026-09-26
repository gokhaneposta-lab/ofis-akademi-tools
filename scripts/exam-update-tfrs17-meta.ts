/**
 * tfrs-17 sınav metni ve SEDDK Finans sertifika konu kotaları.
 *   npx tsx scripts/exam-update-tfrs17-meta.ts
 */
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { neon } from "@neondatabase/serverless";
import type { ExamSelectionRules } from "../lib/exam/sections";

const SELECTION_RULES: ExamSelectionRules = {
  sections: [
    { key: "tfrs17", label: "TFRS 17 Temel Kavramlar", weight: 40, default: true },
    {
      key: "muhasebe",
      label: "Muhasebe ve Finansal Raporlama",
      weight: 30,
      categories: ["Muhasebe ve Finansal Raporlama", "Muhasebe"],
    },
    {
      key: "ekonomi",
      label: "Ekonomi ve Finans Teorisi",
      weight: 15,
      categories: ["Ekonomi ve Finans Teorisi", "Ekonomi"],
    },
    {
      key: "mevzuat",
      label: "Temel Sigortacılık Mevzuatı",
      weight: 15,
      categories: ["Temel Sigortacılık Mevzuatı", "Temel Sigortacılık"],
    },
  ],
};

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL yok");
    process.exit(1);
  }
  const sql = neon(url);

  const title = "TFRS 17 Finans Sertifika Hazırlık";
  const description =
    "SEDDK TFRS 17 Finans sertifika sınavı formatında deneme: 50 soru, 60 dakika, %70 baraj. Sorular her denemede konu dağılımına göre rastgele seçilir. Giriş gerekmez.";

  await sql`
    UPDATE exams
    SET title = ${title},
        description = ${description},
        selection_rules = ${JSON.stringify(SELECTION_RULES)}::jsonb,
        updated_at = now()
    WHERE slug = 'tfrs-17'
  `;
  console.log("OK — exam meta + konu kotaları güncellendi");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
