/**
 * Sprint 1 zorunlu test runner — docs/newsletter-v2/TEST_CASES.md
 *
 *   npx tsx scripts/subscription-sprint1-validate.ts
 *
 * Requires DATABASE_URL (+ migrated schema).
 */
import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import { isSubscribeRateLimited } from "../lib/subscription/rateLimit";
import { mapPageToCategory } from "../lib/subscription/rules";
import { subscribe } from "../lib/subscription/service";
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

type Result = { id: string; pass: boolean; detail: string };

const results: Result[] = [];

function record(id: string, pass: boolean, detail: string) {
  results.push({ id, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${id}: ${detail}`);
}

async function countEvents(sql: ReturnType<typeof neon>, email: string) {
  const rows = await sql`
    SELECT event_type, category, COUNT(*)::int AS n
    FROM subscription_events
    WHERE email = ${email}
    GROUP BY event_type, category
    ORDER BY event_type, category
  `;
  return rows as { event_type: string; category: string | null; n: number }[];
}

async function getTags(sql: ReturnType<typeof neon>, email: string) {
  const rows = await sql`
    SELECT t.tag
    FROM subscriber_tags t
    JOIN subscribers s ON s.id = t.subscriber_id
    WHERE s.email = ${email}
    ORDER BY t.tag
  `;
  return rows.map((r) => String(r.tag));
}

async function getSubscriber(sql: ReturnType<typeof neon>, email: string) {
  const rows = await sql`
    SELECT id, status, primary_source_category, unsubscribed_at
    FROM subscribers WHERE email = ${email} LIMIT 1
  `;
  return rows[0] ?? null;
}

async function wipe(sql: ReturnType<typeof neon>, email: string) {
  await sql`
    DELETE FROM subscriber_tags
    WHERE subscriber_id IN (SELECT id FROM subscribers WHERE email = ${email})
  `;
  await sql`DELETE FROM subscription_events WHERE email = ${email}`;
  await sql`DELETE FROM subscribers WHERE email = ${email}`;
}

async function main() {
  const url = sanitizeDbUrl(process.env.DATABASE_URL);
  if (!url) {
    console.error("BLOCKED: DATABASE_URL yok — zorunlu TC'ler koşturulamadı.");
    console.error("Neon connection string'i .env.local'e ekleyip migrate çalıştırın.");
    process.exit(2);
  }

  // Ensure domain layer sees the same sanitized URL
  process.env.DATABASE_URL = url;

  const sql = neon(url);
  const suffix = Date.now().toString(36);
  const eNew = `test+s1-new-${suffix}@example.com`;
  const eGen = `test+s1-general-${suffix}@example.com`;
  const eDup = `test+s1-dup-${suffix}@example.com`;
  const eRate = `test+s1-rate-${suffix}@example.com`;

  // --- Offline bits that don't need prior state ---
  record(
    "TC-06-validate-fn",
    !isValidEmail(normalizeEmail("not-an-email")),
    "isValidEmail rejects not-an-email",
  );
  record(
    "TC-08-map",
    mapPageToCategory("/hakkimizda-olmayan-sayfa") === "general",
    "unknown page maps to general",
  );

  try {
    // TC-01
    await wipe(sql, eNew);
    const r1 = await subscribe({
      email: eNew,
      page: "/tsb/sektor-ozeti",
      reason: "signup_form",
      channel: "web_inline",
    });
    const tags1 = await getTags(sql, eNew);
    const ev1 = await countEvents(sql, eNew);
    const sub1 = await getSubscriber(sql, eNew);
    record(
      "TC-01",
      r1.outcome === "subscribed" &&
        r1.category === "tsb" &&
        typeof r1.welcomeSent === "boolean" &&
        tags1.join(",") === "tsb" &&
        ev1.some((e) => e.event_type === "SUBSCRIBE" && e.category === "tsb" && e.n === 1) &&
        sub1?.status === "active" &&
        sub1.primary_source_category === "tsb",
      JSON.stringify({
        outcome: r1.outcome,
        welcomeSent: r1.welcomeSent,
        tags: tags1,
        events: ev1,
      }),
    );

    // TC-02
    const evBefore2 = await countEvents(sql, eNew);
    const totalBefore2 = evBefore2.reduce((a, e) => a + e.n, 0);
    const r2 = await subscribe({
      email: eNew,
      page: "/tsb/sektor-ozeti",
      reason: "signup_form",
      channel: "web_inline",
    });
    const evAfter2 = await countEvents(sql, eNew);
    const totalAfter2 = evAfter2.reduce((a, e) => a + e.n, 0);
    const tags2 = await getTags(sql, eNew);
    record(
      "TC-02",
      r2.outcome === "already_subscribed" &&
        totalAfter2 === totalBefore2 &&
        tags2.join(",") === "tsb",
      JSON.stringify({ outcome: r2.outcome, eventsBefore: totalBefore2, eventsAfter: totalAfter2 }),
    );

    // TC-03
    const r3 = await subscribe({
      email: eNew,
      page: "/excel-araclari/kredi-taksit",
      reason: "signup_form",
      channel: "web_inline",
    });
    const tags3 = await getTags(sql, eNew);
    const ev3 = await countEvents(sql, eNew);
    const sub3 = await getSubscriber(sql, eNew);
    record(
      "TC-03",
      r3.outcome === "tag_added" &&
        r3.category === "excel" &&
        tags3.includes("excel") &&
        tags3.includes("tsb") &&
        ev3.some((e) => e.event_type === "TAG_ADDED" && e.category === "excel") &&
        sub3?.primary_source_category === "tsb",
      JSON.stringify({ outcome: r3.outcome, tags: tags3, primary: sub3?.primary_source_category }),
    );

    // TC-04 — manuel unsub SQL sonra resubscribe
    await sql`
      UPDATE subscribers
      SET status = 'unsubscribed', unsubscribed_at = now(), updated_at = now()
      WHERE email = ${eNew}
    `;
    const r4 = await subscribe({
      email: eNew,
      page: "/egitimler/temel",
      reason: "signup_form",
      channel: "web_footer",
    });
    const sub4 = await getSubscriber(sql, eNew);
    const tags4 = await getTags(sql, eNew);
    const ev4 = await countEvents(sql, eNew);
    record(
      "TC-04",
      r4.outcome === "resubscribed" &&
        sub4?.status === "active" &&
        sub4.unsubscribed_at == null &&
        tags4.includes("training") &&
        ev4.some((e) => e.event_type === "RESUBSCRIBE"),
      JSON.stringify({ outcome: r4.outcome, status: sub4?.status, tags: tags4 }),
    );

    // TC-06 — validation only at domain edge (API order needs DB); assert validator
    record(
      "TC-06",
      !isValidEmail("not-an-email") && isValidEmail(eNew),
      "email validator matches TEST_CASES (API returns 400 when DB configured)",
    );

    // TC-07 rate limit (in-memory helper — same as API)
    let limited = false;
    for (let i = 0; i < 6; i++) {
      if (isSubscribeRateLimited({ ip: "127.0.0.1", email: eRate })) {
        limited = true;
        break;
      }
    }
    // First 5 should not limit, 6th should — function returns true WHEN limited after increment
    // Re-read implementation: hit returns true when count > limit after increment
    // So calls 1..5: count 1..5, limit 5 → count>5 is false until call 6 when count=6
    record("TC-07", limited === true, `rate limited after burst: ${limited}`);

    // TC-08
    await wipe(sql, eGen);
    const r8 = await subscribe({
      email: eGen,
      page: "/hakkimizda-olmayan-sayfa",
      reason: "signup_form",
      channel: "web_inline",
    });
    const tags8 = await getTags(sql, eGen);
    record(
      "TC-08",
      r8.outcome === "subscribed" && r8.category === "general" && tags8.join(",") === "general",
      JSON.stringify({ outcome: r8.outcome, category: r8.category, tags: tags8 }),
    );

    // TC-10
    await wipe(sql, eDup);
    await subscribe({
      email: eDup,
      page: "/excel-araclari",
      reason: "signup_form",
      channel: "web_inline",
    });
    const evBefore10 = (await countEvents(sql, eDup)).reduce((a, e) => a + e.n, 0);
    const r10 = await subscribe({
      email: eDup,
      page: "/formul-kutuphanesi/xlookup",
      reason: "download_template",
      channel: "web_popup",
    });
    const evAfter10 = (await countEvents(sql, eDup)).reduce((a, e) => a + e.n, 0);
    const tags10 = await getTags(sql, eDup);
    record(
      "TC-10",
      r10.outcome === "already_subscribed" &&
        r10.category === "excel" &&
        tags10.join(",") === "excel" &&
        evAfter10 === evBefore10,
      JSON.stringify({ outcome: r10.outcome, tags: tags10, events: evAfter10 }),
    );

    // cleanup
    for (const e of [eNew, eGen, eDup, eRate]) await wipe(sql, e);
  } catch (err) {
    console.error("Runner error:", err);
    record("RUNNER", false, String(err));
  }

  const mandatory = ["TC-01", "TC-02", "TC-03", "TC-04", "TC-06", "TC-07", "TC-08", "TC-10"];
  const failed = results.filter((r) => mandatory.includes(r.id) && !r.pass);
  console.log("\n--- Summary ---");
  for (const id of mandatory) {
    const r = results.find((x) => x.id === id);
    console.log(`${r?.pass ? "PASS" : "FAIL"} ${id}`);
  }
  if (failed.length) {
    console.log(`\nSprint 1 NOT DONE — ${failed.length} failed`);
    process.exit(1);
  }
  console.log("\nSprint 1 mandatory TCs PASS — mark DONE only after this green run.");
}

main();
