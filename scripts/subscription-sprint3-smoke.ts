/**
 * Sprint 3 smoke — TC-05 unsubscribe + TC-09 legacy (fixture) + token.
 *
 *   npx tsx scripts/subscription-sprint3-smoke.ts
 *
 * Requires DATABASE_URL + UNSUBSCRIBE_SECRET (+ migrated schema).
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import {
  importLegacySubscriber,
  subscribe,
  unsubscribe,
} from "../lib/subscription/service";
import {
  createUnsubscribeToken,
  verifyUnsubscribeToken,
} from "../lib/subscription/unsubscribeToken";
import { normalizeEmail } from "../lib/subscription/validate";

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

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  const dbUrl = sanitizeDbUrl(process.env.DATABASE_URL);
  assert(dbUrl, "DATABASE_URL required");
  assert(
    process.env.UNSUBSCRIBE_SECRET?.trim(),
    "UNSUBSCRIBE_SECRET required",
  );

  const sql = neon(dbUrl);
  const stamp = Date.now();
  const email = normalizeEmail(`test+s3-unsub-${stamp}@example.com`);
  const legacyEmail = normalizeEmail(`test+s3-legacy-${stamp}@example.com`);

  // Token unit checks
  const token = createUnsubscribeToken(email);
  assert(verifyUnsubscribeToken(email, token), "token verifies");
  assert(!verifyUnsubscribeToken(email, "bad.token"), "bad token rejected");
  assert(
    !verifyUnsubscribeToken("other@example.com", token),
    "email mismatch rejected",
  );

  // TC-05 setup: subscribe then unsubscribe
  const sub = await subscribe({
    email,
    page: "/tsb",
    reason: "signup_form",
    channel: "web_inline",
    skipWelcome: true,
  });
  assert(sub.outcome === "subscribed", `expected subscribed got ${sub.outcome}`);

  const u1 = await unsubscribe({
    email,
    reason: "manual",
    channel: "email_footer",
  });
  assert(u1.outcome === "unsubscribed", `u1 ${u1.outcome}`);

  const tagsAfter = await sql`
    SELECT tag FROM subscriber_tags st
    JOIN subscribers s ON s.id = st.subscriber_id
    WHERE s.email = ${email}
    ORDER BY tag
  `;
  assert(
    (tagsAfter as { tag: string }[]).some((t) => t.tag === "tsb"),
    "tags preserved after unsub",
  );

  const statusRows = await sql`
    SELECT status, unsubscribed_at IS NOT NULL AS has_unsub
    FROM subscribers WHERE email = ${email}
  `;
  const st = statusRows[0] as { status: string; has_unsub: boolean };
  assert(st.status === "unsubscribed", "status unsubscribed");
  assert(st.has_unsub, "unsubscribed_at set");

  const ev = await sql`
    SELECT COUNT(*)::int AS n FROM subscription_events
    WHERE email = ${email} AND event_type = 'UNSUBSCRIBE'
  `;
  assert(Number((ev[0] as { n: number }).n) >= 1, "UNSUBSCRIBE event");

  const u2 = await unsubscribe({
    email,
    reason: "manual",
    channel: "email_footer",
  });
  assert(u2.outcome === "already_unsubscribed", `u2 ${u2.outcome}`);

  // TC-09 fixture-style
  const c1 = await importLegacySubscriber(legacyEmail);
  assert(c1.outcome === "created", `legacy create ${c1.outcome}`);
  const c2 = await importLegacySubscriber(legacyEmail);
  assert(c2.outcome === "skipped", `legacy idempotent ${c2.outcome}`);

  const legTags = await sql`
    SELECT tag FROM subscriber_tags st
    JOIN subscribers s ON s.id = st.subscriber_id
    WHERE s.email = ${legacyEmail}
  `;
  assert(
    (legTags as { tag: string }[]).some((t) => t.tag === "legacy"),
    "legacy tag",
  );

  const legEv = await sql`
    SELECT COUNT(*)::int AS n FROM subscription_events
    WHERE email = ${legacyEmail}
      AND event_type = 'SUBSCRIBE'
      AND reason = 'migration'
      AND category = 'legacy'
  `;
  assert(Number((legEv[0] as { n: number }).n) >= 1, "migration SUBSCRIBE");

  console.log("subscription-sprint3-smoke OK (TC-05, TC-09)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
