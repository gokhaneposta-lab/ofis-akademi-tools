/**
 * Excel/CSV → exam question bank import skeleton (V1.5+).
 *
 * Expected columns (Turkish headers OK):
 *   ID | Konu | Zorluk | Soru | A | B | C | D | Doğru Cevap | Açıklama | Kaynak
 *
 * Maps to:
 *   external_id, category, difficulty, question_text,
 *   question_options (A–D), is_correct, explanation, source
 *
 * Usage (future):
 *   npx tsx scripts/exam-import-xlsx.ts --exam tfrs-17 --file ./bank.xlsx
 *
 * V1: schema is ready (external_id UNIQUE per exam). Full parse not required for launch.
 */
console.log(
  "exam-import-xlsx: iskelet. Kolon map hazır; gerçek import bir sonraki aşamada eklenecek.",
);
console.log(
  "Gerekli kolonlar: ID, Konu, Zorluk, Soru, A, B, C, D, Doğru Cevap, Açıklama, Kaynak",
);
