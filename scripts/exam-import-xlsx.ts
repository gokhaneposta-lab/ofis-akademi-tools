/**
 * Excel → exam question bank import
 *
 * Kolonlar:
 *   ID | Sınav | Konu | Zorluk | Soru | A | B | C | D |
 *   Doğru Cevap | Açıklama | Kaynak | Kaynak URL | Dummy
 *
 *   npm run exam:import-xlsx -- --exam tfrs-17 --file "C:/path/sorular.xlsx"
 *   npm run exam:import-xlsx -- --exam tfrs-17 --file "./data/exams/tfrs17.xlsx" --deactivate-dummy
 *   npm run exam:import-xlsx -- --exam tfrs-17 --file "./yeni.xlsx" --id-offset 450
 *
 * --id-offset N   Dosyadaki ID'lere N ekler (1–150 → 451–600); mevcut soruların üzerine yazmayı önler.
 * Bankada zaten olan (aynı / çok benzer metin) sorular atlanır; --allow-duplicates ile kapatılır.
 *
 * Requires: DATABASE_URL, migration 003 + 004
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import * as XLSX from "xlsx";
import { clusterQuestions, stripCopySuffix } from "../lib/exam/dedupe";

loadEnvConfig(process.cwd());

type Row = Record<string, unknown>;

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

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

/** Excel/CSV bazen UTF-8'i Latin-1 gibi okur (SÄ±nav → Sınav). */
function fixMojibake(s: string): string {
  if (!s) return s;
  // Tipik bozulma: Ä± Å Ã§ Ã¶ Ã¼ Ä
  if (!/[ÃÄÅ]/.test(s)) return s;
  try {
    const fixed = Buffer.from(s, "latin1").toString("utf8");
    if (fixed.includes("\uFFFD")) return s;
    return fixed;
  } catch {
    return s;
  }
}

function normalizeRow(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) {
    const key = fixMojibake(String(k));
    out[key] = typeof v === "string" ? fixMojibake(v) : v;
  }
  return out;
}

function cell(row: Row, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k] != null && String(row[k]).trim() !== "") return String(row[k]).trim();
  }
  // case-insensitive / trimmed header fallback
  const entries = Object.entries(row);
  for (const want of keys) {
    const found = entries.find(
      ([h]) => h.trim().toLocaleLowerCase("tr-TR") === want.trim().toLocaleLowerCase("tr-TR"),
    );
    if (found && found[1] != null && String(found[1]).trim() !== "") {
      return String(found[1]).trim();
    }
  }
  return "";
}

function parseDummy(raw: string): boolean {
  const v = raw.trim().toLocaleLowerCase("tr-TR");
  return v === "true" || v === "1" || v === "evet" || v === "yes" || v === "dummy";
}

function normalizeCorrect(raw: string): "A" | "B" | "C" | "D" | null {
  const v = raw.trim().toUpperCase();
  if (v === "A" || v === "B" || v === "C" || v === "D") return v;
  // "A)" or "A."
  const m = v.match(/^([ABCD])/);
  return m ? (m[1] as "A" | "B" | "C" | "D") : null;
}

function normalizeDifficulty(raw: string): string {
  const v = raw.trim().toLocaleLowerCase("tr-TR");
  if (["easy", "kolay", "e"].includes(v)) return "easy";
  if (["hard", "zor", "h"].includes(v)) return "hard";
  if (["medium", "orta", "m", "mid"].includes(v)) return "medium";
  return raw.trim() || "medium";
}

async function main() {
  const examSlug = arg("exam") ?? "tfrs-17";
  const fileArg = arg("file");
  const deactivateDummy = hasFlag("deactivate-dummy");
  const allowDuplicates = hasFlag("allow-duplicates");
  const idOffset = Number(arg("id-offset") ?? 0);

  if (!fileArg) {
    console.error('Kullanım: npm run exam:import-xlsx -- --exam tfrs-17 --file "C:/.../sorular.xlsx" [--deactivate-dummy]');
    process.exit(1);
  }

  const filePath = resolve(fileArg);
  if (!existsSync(filePath)) {
    console.error("Dosya yok:", filePath);
    process.exit(1);
  }

  const url = sanitizeDbUrl(process.env.DATABASE_URL);
  if (!url) {
    console.error("DATABASE_URL tanımlı değil.");
    process.exit(1);
  }
  const sql = neon(url);

  const examRows = await sql`
    SELECT id, title, question_count FROM exams WHERE slug = ${examSlug} LIMIT 1
  `;
  const exam = (examRows as { id: string; title: string; question_count: number }[])[0];
  if (!exam) {
    console.error("Exam bulunamadı:", examSlug);
    process.exit(1);
  }
  console.log("Exam:", examSlug, exam.id);

  const buf = readFileSync(filePath);
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheetName = wb.SheetNames[0]!;
  const sheet = wb.Sheets[sheetName]!;
  const rows = XLSX.utils
    .sheet_to_json<Row>(sheet, { defval: "" })
    .map(normalizeRow);
  console.log(`Sayfa: ${sheetName}, satır: ${rows.length}`);
  if (rows[0]) {
    console.log("Kolonlar:", Object.keys(rows[0]).join(" | "));
  }

  let ok = 0;
  let skip = 0;
  const errors: string[] = [];

  const fileIdOf = (row: Row): string => {
    const raw = cell(row, "ID", "Id", "id");
    return idOffset && raw ? String(Number(raw) + idOffset) : raw;
  };

  // Bankada ya da dosyanın kendi içinde aynı/çok benzer metin varsa satırı atla
  const duplicateRows = new Set<number>();
  const duplicateNotes: string[] = [];
  if (!allowDuplicates) {
    const fileIds = new Set(rows.map(fileIdOf));
    const bankRows = (await sql`
      SELECT external_id, question_text FROM questions
      WHERE exam_id = ${exam.id} AND is_active = true
    `) as { external_id: string | null; question_text: string }[];
    type Entry = { kind: "bank" | "file"; idx: number; id: string; text: string };
    const entries: Entry[] = [
      ...bankRows
        .filter((b) => !fileIds.has(String(b.external_id)))
        .map((b) => ({ kind: "bank" as const, idx: -1, id: String(b.external_id), text: b.question_text })),
      ...rows
        .map((r, idx) => ({ kind: "file" as const, idx, id: fileIdOf(r), text: cell(r, "Soru") }))
        .filter((e) => e.text),
    ];
    for (const group of clusterQuestions(entries, (e) => e.text)) {
      if (group.length < 2) continue;
      const files = group.filter((e) => e.kind === "file");
      const dropped = group.some((e) => e.kind === "bank") ? files : files.slice(1);
      if (!dropped.length) continue;
      const kept = group.find((e) => !dropped.includes(e))!;
      for (const e of dropped) duplicateRows.add(e.idx);
      duplicateNotes.push(
        `${dropped.map((e) => `ID ${e.id}`).join(", ")} ≈ ${kept.kind === "bank" ? "bankadaki" : "dosyadaki"} ID ${kept.id}`,
      );
    }
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const externalId = fileIdOf(row);
    if (duplicateRows.has(i)) {
      skip += 1;
      continue;
    }
    const category = cell(row, "Konu", "Kategori");
    const difficulty = normalizeDifficulty(cell(row, "Zorluk"));
    const questionText = stripCopySuffix(cell(row, "Soru"));
    const optA = cell(row, "A");
    const optB = cell(row, "B");
    const optC = cell(row, "C");
    const optD = cell(row, "D");
    const correctRaw = cell(row, "Doğru Cevap", "Dogru Cevap", "Doğru");
    const explanation = cell(row, "Açıklama", "Aciklama");
    const source = cell(row, "Kaynak");
    const sourceUrl = cell(row, "Kaynak URL", "Kaynak Url", "Source URL");
    const isDummy = parseDummy(cell(row, "Dummy"));
    const examTitle = cell(row, "Sınav", "Sinav");

    if (!externalId || !questionText) {
      skip += 1;
      errors.push(`Satır ${i + 2}: ID veya Soru boş`);
      continue;
    }
    const correct = normalizeCorrect(correctRaw);
    if (!correct) {
      skip += 1;
      errors.push(`Satır ${i + 2} (ID ${externalId}): Doğru Cevap geçersiz: ${correctRaw}`);
      continue;
    }
    if (!optA || !optB || !optC || !optD) {
      skip += 1;
      errors.push(`Satır ${i + 2} (ID ${externalId}): A/B/C/D eksik`);
      continue;
    }

    const sortOrder = Number(externalId) || i + 1;

    const qRows = await sql`
      INSERT INTO questions (
        exam_id, category, difficulty, question_text, explanation, source, source_url,
        external_id, sort_order, is_active, is_dummy
      ) VALUES (
        ${exam.id},
        ${category || "genel"},
        ${difficulty},
        ${questionText},
        ${explanation || null},
        ${source || null},
        ${sourceUrl || null},
        ${externalId},
        ${sortOrder},
        true,
        ${isDummy}
      )
      ON CONFLICT (exam_id, external_id) DO UPDATE SET
        category = EXCLUDED.category,
        difficulty = EXCLUDED.difficulty,
        question_text = EXCLUDED.question_text,
        explanation = EXCLUDED.explanation,
        source = EXCLUDED.source,
        source_url = EXCLUDED.source_url,
        sort_order = EXCLUDED.sort_order,
        is_active = true,
        is_dummy = EXCLUDED.is_dummy,
        updated_at = now()
      RETURNING id
    `;
    const qid = String((qRows as { id: string }[])[0]!.id);

    await sql`DELETE FROM question_options WHERE question_id = ${qid}`;

    const options: Array<{ key: "A" | "B" | "C" | "D"; text: string }> = [
      { key: "A", text: optA },
      { key: "B", text: optB },
      { key: "C", text: optC },
      { key: "D", text: optD },
    ];
    for (const o of options) {
      await sql`
        INSERT INTO question_options (question_id, option_key, option_text, is_correct, sort_order)
        VALUES (
          ${qid},
          ${o.key},
          ${o.text},
          ${o.key === correct},
          ${o.key.charCodeAt(0) - 64}
        )
      `;
    }

    // Optionally sync exam title from first non-empty Sınav cell
    if (ok === 0 && examTitle) {
      await sql`
        UPDATE exams SET title = ${examTitle}, updated_at = now()
        WHERE id = ${exam.id}
      `;
    }

    ok += 1;
    if (ok % 50 === 0) console.log(`  … ${ok} soru`);
  }

  if (deactivateDummy) {
    const r = await sql`
      UPDATE questions SET is_active = false, updated_at = now()
      WHERE exam_id = ${exam.id} AND is_dummy = true AND is_active = true
      RETURNING id
    `;
    console.log(`Dummy pasif: ${(r as unknown[]).length}`);
  }

  const countRows = await sql`
    SELECT COUNT(*)::int AS c FROM questions
    WHERE exam_id = ${exam.id} AND is_active = true AND is_dummy = false
  `;
  const activeReal = Number((countRows as { c: number }[])[0]?.c ?? 0);
  const allActive = await sql`
    SELECT COUNT(*)::int AS c FROM questions
    WHERE exam_id = ${exam.id} AND is_active = true
  `;
  const activeAll = Number((allActive as { c: number }[])[0]?.c ?? 0);

  console.log(`Import OK: ${ok}, atlanan: ${skip}`);
  console.log(`Aktif gerçek: ${activeReal}, aktif toplam: ${activeAll} (sınav seçim: ${exam.question_count})`);
  if (duplicateNotes.length) {
    console.log(`Tekrar nedeniyle atlanan: ${duplicateRows.size}`);
    for (const n of duplicateNotes.slice(0, 20)) console.log(" -", n);
  }
  if (errors.length) {
    console.log("İlk hatalar:");
    for (const e of errors.slice(0, 15)) console.log(" -", e);
  }
  if (activeAll < exam.question_count) {
    console.error(`UYARI: aktif soru (${activeAll}) < question_count (${exam.question_count})`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
