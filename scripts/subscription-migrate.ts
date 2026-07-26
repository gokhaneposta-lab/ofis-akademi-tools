/**
 * Runs db/migrations/001_subscriptions.sql against DATABASE_URL.
 *
 *   npm run subscription:migrate
 *
 * Requires: DATABASE_URL (Neon / Vercel Postgres)
 */
import { readFileSync } from "fs";
import { join } from "path";
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";

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

async function main() {
  const url = sanitizeDbUrl(process.env.DATABASE_URL);
  if (!url) {
    console.error("DATABASE_URL tanımlı değil.");
    process.exit(1);
  }

  process.env.DATABASE_URL = url;

  const file = join(process.cwd(), "db/migrations/001_subscriptions.sql");
  const ddl = readFileSync(file, "utf8");
  const sql = neon(url);

  const statements = ddl
    .split(/;\s*\n/)
    .map((s) =>
      s
        .split("\n")
        .map((line) => line.replace(/--.*$/, "").trimEnd())
        .join("\n")
        .trim(),
    )
    .filter((s) => s.length > 0);

  console.log(`Migration: ${statements.length} statement`);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]!;
    process.stdout.write(`  [${i + 1}/${statements.length}]… `);
    await sql.query(stmt.endsWith(";") ? stmt : `${stmt};`);
    console.log("ok");
  }
  console.log("Tamam: 001_subscriptions.sql");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
