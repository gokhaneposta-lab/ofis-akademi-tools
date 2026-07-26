/**
 * Legacy migration — TC-09
 *
 *   npx tsx scripts/subscription-migrate-legacy.ts --dry-run --file scripts/fixtures/legacy-emails.sample.json
 *   npx tsx scripts/subscription-migrate-legacy.ts --file path/to/emails.json
 *
 * File formats:
 *   - JSON string array: ["a@x.com", "b@y.com"]
 *   - JSON object: { "emails": ["a@x.com"] }
 *   - Resend CSV: header with `email` column
 *   - Plain text: one email per line (# comments ok)
 *
 * Do not commit real PII.
 */
import { readFileSync } from "fs";
import { isAbsolute, resolve } from "path";
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { isSubscriptionDbConfigured } from "../lib/subscription/db";
import { importLegacySubscriber } from "../lib/subscription/service";
import { isValidEmail, normalizeEmail } from "../lib/subscription/validate";

loadEnvConfig(process.cwd());

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

async function peekLegacyOutcome(
  email: string,
): Promise<"created" | "tagged" | "skipped"> {
  const dbUrl = sanitizeDbUrl(process.env.DATABASE_URL);
  if (!dbUrl) return "created";
  const sql = neon(dbUrl);
  const sub = await sql`
    SELECT id FROM subscribers WHERE email = ${email} LIMIT 1
  `;
  if (sub.length === 0) return "created";
  const tag = await sql`
    SELECT 1 FROM subscriber_tags
    WHERE subscriber_id = ${String(sub[0]!.id)} AND tag = 'legacy'
    LIMIT 1
  `;
  return tag.length > 0 ? "skipped" : "tagged";
}

function parseArgs(argv: string[]) {
  let dryRun = false;
  let verbose = false;
  let file: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--verbose") verbose = true;
    else if (a === "--file") {
      file = argv[++i] ?? null;
    } else if (a.startsWith("--file=")) {
      file = a.slice("--file=".length);
    }
  }
  return { dryRun, verbose, file };
}

function parseCsvEmails(raw: string): string[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  const header = lines[0]!.split(",").map((h) => h.trim().toLowerCase());
  const emailIdx = header.indexOf("email");
  if (emailIdx < 0) {
    throw new Error("CSV header must include an email column");
  }
  const emails: string[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const email = (cols[emailIdx] || "").trim();
    if (email) emails.push(email);
  }
  return emails;
}

function loadEmails(filePath: string): string[] {
  const raw = readFileSync(filePath, "utf8").trim();
  if (!raw) return [];

  if (raw.startsWith("[") || raw.startsWith("{")) {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((x) => String(x));
    }
    if (parsed && typeof parsed === "object" && "emails" in parsed) {
      const emails = (parsed as { emails: unknown }).emails;
      if (!Array.isArray(emails)) {
        throw new Error("JSON .emails must be an array");
      }
      return emails.map((x) => String(x));
    }
    throw new Error("JSON must be string[] or { emails: string[] }");
  }

  const firstLine = raw.split(/\r?\n/)[0] ?? "";
  if (firstLine.toLowerCase().includes("email") && firstLine.includes(",")) {
    return parseCsvEmails(raw);
  }

  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

async function main() {
  const { dryRun, verbose, file } = parseArgs(process.argv.slice(2));
  if (!file) {
    console.error(
      "Usage: npx tsx scripts/subscription-migrate-legacy.ts [--dry-run] [--verbose] --file <path>",
    );
    process.exit(1);
  }

  if (!dryRun && !isSubscriptionDbConfigured()) {
    console.error("DATABASE_URL missing — abort");
    process.exit(1);
  }

  const abs = isAbsolute(file) ? file : resolve(process.cwd(), file);
  const emailsRaw = loadEmails(abs);
  const emails: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const raw of emailsRaw) {
    const email = normalizeEmail(raw);
    if (!isValidEmail(email)) {
      invalid.push(raw);
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }

  console.log(
    `[legacy-migrate] file=${abs} unique=${emails.length} invalid=${invalid.length} dryRun=${dryRun}`,
  );

  let created = 0;
  let tagged = 0;
  let skipped = 0;

  for (const email of emails) {
    if (dryRun) {
      const outcome = await peekLegacyOutcome(email);
      if (outcome === "created") created += 1;
      else if (outcome === "tagged") tagged += 1;
      else skipped += 1;
      if (verbose) console.log(`  dry-run would ${outcome} ${email}`);
      continue;
    }
    const result = await importLegacySubscriber(email);
    if (result.outcome === "created") created += 1;
    else if (result.outcome === "tagged") tagged += 1;
    else skipped += 1;
    if (verbose) console.log(`  ${result.outcome} ${email}`);
  }

  console.log("--- summary ---");
  console.log(
    JSON.stringify(
      {
        dryRun,
        processed: emails.length,
        unique: emails.length,
        invalid: invalid.length,
        created,
        tagged,
        skipped,
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
