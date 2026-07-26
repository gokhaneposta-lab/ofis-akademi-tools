/**
 * Legacy migration — TC-09
 *
 *   npx tsx scripts/subscription-migrate-legacy.ts --dry-run --file scripts/fixtures/legacy-emails.sample.json
 *   npx tsx scripts/subscription-migrate-legacy.ts --file path/to/emails.json
 *
 * File formats:
 *   - JSON string array: ["a@x.com", "b@y.com"]
 *   - JSON object: { "emails": ["a@x.com"] }
 *   - Plain text: one email per line (# comments ok)
 *
 * Do not commit real PII.
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { loadEnvConfig } from "@next/env";
import { isSubscriptionDbConfigured } from "../lib/subscription/db";
import { importLegacySubscriber } from "../lib/subscription/service";
import { isValidEmail, normalizeEmail } from "../lib/subscription/validate";

loadEnvConfig(process.cwd());

function parseArgs(argv: string[]) {
  let dryRun = false;
  let file: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === "--dry-run") dryRun = true;
    else if (a === "--file") {
      file = argv[++i] ?? null;
    } else if (a.startsWith("--file=")) {
      file = a.slice("--file=".length);
    }
  }
  return { dryRun, file };
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

  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

async function main() {
  const { dryRun, file } = parseArgs(process.argv.slice(2));
  if (!file) {
    console.error(
      "Usage: npx tsx scripts/subscription-migrate-legacy.ts [--dry-run] --file <path>",
    );
    process.exit(1);
  }

  if (!dryRun && !isSubscriptionDbConfigured()) {
    console.error("DATABASE_URL missing — abort");
    process.exit(1);
  }

  const abs = resolve(process.cwd(), file);
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
      console.log(`  dry-run would process ${email}`);
      continue;
    }
    const result = await importLegacySubscriber(email);
    if (result.outcome === "created") created += 1;
    else if (result.outcome === "tagged") tagged += 1;
    else skipped += 1;
    console.log(`  ${result.outcome} ${email}`);
  }

  console.log("--- summary ---");
  console.log(
    JSON.stringify(
      {
        dryRun,
        unique: emails.length,
        invalid: invalid.length,
        created: dryRun ? 0 : created,
        tagged: dryRun ? 0 : tagged,
        skipped: dryRun ? 0 : skipped,
        wouldProcess: dryRun ? emails.length : undefined,
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
