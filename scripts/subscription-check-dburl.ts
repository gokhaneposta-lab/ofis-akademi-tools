import { loadEnvConfig } from "@next/env";

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

const raw = process.env.DATABASE_URL;
const u = sanitizeDbUrl(raw);
console.log("rawLen", raw?.length ?? 0);
console.log("sanitizedLen", u?.length ?? 0);
console.log("startsWithPostgres", Boolean(u?.startsWith("postgres")));
console.log("hasWhitespace", Boolean(u && /\s/.test(u)));
console.log("wrappedQuotes", Boolean(raw && /^['"]/.test(raw.trim())));
console.log(
  "isEncryptedPlaceholder",
  u === "[Encrypted]" || u === "Encrypted" || u === "***",
);
try {
  if (!u) throw new Error("empty");
  const forParse = u.replace(/^postgres:/, "postgresql:");
  // eslint-disable-next-line no-new
  new URL(forParse);
  console.log("parse", "OK");
} catch (e) {
  console.log("parse", "BAD", e instanceof Error ? e.message : e);
}
