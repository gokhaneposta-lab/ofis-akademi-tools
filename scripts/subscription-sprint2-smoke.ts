/**
 * Sprint 2 smoke: welcome HTML + soft-fail when Resend key missing.
 */
import { loadEnvConfig } from "@next/env";
import { buildWelcomeHtml, sendWelcomeEmail } from "../lib/subscription/welcome";

loadEnvConfig(process.cwd());

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const html = buildWelcomeHtml("tsb");
  assert(html.includes("TSB"), "tsb intro");
  assert(html.includes("Ofis Akademi"), "brand");
  assert(buildWelcomeHtml("unknown-xyz" as "general").includes("pratik Excel"), "fallback");

  const prev = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  const sent = await sendWelcomeEmail({
    email: "test+s2-softfail@example.com",
    category: "excel",
  });
  assert(sent === false, "missing key => welcomeSent false");
  if (prev !== undefined) process.env.RESEND_API_KEY = prev;

  console.log("subscription-sprint2-smoke OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
