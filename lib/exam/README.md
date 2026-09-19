# Exam Engine (generic)

Online sınav motoru — TFRS 17 yalnızca ilk `exams` kaydıdır.

## Komutlar

```bash
npm run subscription:migrate   # tüm db/migrations (003_exams dahil)
npm run exam:seed              # ≥55 dummy soru + tfrs-17 exam
```

## Excel import (ileride)

Kolonlar: `ID | Konu | Zorluk | Soru | A | B | C | D | Doğru Cevap | Açıklama | Kaynak`  
→ `external_id`, `category`, `difficulty`, `question_text`, options, `explanation`, `source`

İskelet: `scripts/exam-import-xlsx.ts`
