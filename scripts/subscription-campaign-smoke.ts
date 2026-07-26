/**
 * Campaign Lite smoke — audience count + footer helper (no bulk send).
 *
 *   npx tsx scripts/subscription-campaign-smoke.ts
 */
import { loadEnvConfig } from "@next/env";
import {
  appendCampaignFooter,
  countAudience,
  createCampaign,
  getCampaign,
} from "../lib/subscription/campaign";

loadEnvConfig(process.cwd());

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  assert(process.env.DATABASE_URL?.trim(), "DATABASE_URL required");

  const n = await countAudience("legacy");
  assert(typeof n === "number" && n >= 0, "countAudience");

  const prevSecret = process.env.UNSUBSCRIBE_SECRET;
  if (!prevSecret?.trim()) {
    process.env.UNSUBSCRIBE_SECRET = "smoke-test-secret-campaign-lite-32chars!!";
  }

  const html = appendCampaignFooter("<p>Merhaba</p>", "test+campaign@example.com");
  assert(html.includes("Abonelikten çık"), "footer label");
  assert(html.includes("/abonelikten-cik?"), "footer path");

  const campaign = await createCampaign({
    tag: "legacy",
    subject: `Smoke campaign ${Date.now()}`,
    htmlBody: "<p>Smoke body</p>",
    createdBy: "smoke",
  });
  assert(campaign.status === "draft", "draft status");
  assert(campaign.audience_count === n, "audience snapshot");

  const again = await getCampaign(campaign.id);
  assert(again?.id === campaign.id, "getCampaign");

  if (prevSecret !== undefined) process.env.UNSUBSCRIBE_SECRET = prevSecret;
  else delete process.env.UNSUBSCRIBE_SECRET;

  console.log(
    JSON.stringify({
      ok: true,
      legacyAudience: n,
      campaignId: campaign.id,
    }),
  );
  console.log("subscription-campaign-smoke OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
