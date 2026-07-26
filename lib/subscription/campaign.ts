import { Resend } from "resend";
import { requireSubscriptionSql } from "./db";
import {
  INTEREST_TAGS,
  isInterestTag,
  type InterestTag,
} from "./rules";
import { buildUnsubscribePageUrl } from "./unsubscribeUrl";
import { isValidEmail, normalizeEmail } from "./validate";

export type CampaignStatus = "draft" | "sending" | "sent" | "failed";

export type CampaignRow = {
  id: string;
  tag: InterestTag;
  subject: string;
  html_body: string;
  status: CampaignStatus;
  audience_count: number;
  sent_ok: number;
  sent_fail: number;
  test_email: string | null;
  created_by: string | null;
  created_at: Date;
  started_at: Date | null;
  finished_at: Date | null;
};

export type AudienceMember = {
  subscriberId: string;
  email: string;
};

export type CampaignSendRow = {
  email: string;
  status: "sent" | "failed";
  error: string | null;
  sent_at: Date;
};

function mapCampaign(r: Record<string, unknown>): CampaignRow {
  return {
    id: String(r.id),
    tag: r.tag as InterestTag,
    subject: String(r.subject),
    html_body: String(r.html_body),
    status: r.status as CampaignStatus,
    audience_count: Number(r.audience_count),
    sent_ok: Number(r.sent_ok),
    sent_fail: Number(r.sent_fail),
    test_email: r.test_email ? String(r.test_email) : null,
    created_by: r.created_by ? String(r.created_by) : null,
    created_at: new Date(r.created_at as string),
    started_at: r.started_at ? new Date(r.started_at as string) : null,
    finished_at: r.finished_at ? new Date(r.finished_at as string) : null,
  };
}

export function assertCampaignTag(tag: string): InterestTag {
  if (!isInterestTag(tag)) {
    throw new Error(`invalid_tag:${tag}`);
  }
  return tag;
}

export async function countAudience(tag: InterestTag): Promise<number> {
  const sql = requireSubscriptionSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS n
    FROM subscribers s
    INNER JOIN subscriber_tags t ON t.subscriber_id = s.id
    WHERE s.status = 'active' AND t.tag = ${tag}
  `;
  return Number(rows[0]?.n ?? 0);
}

export async function listAudience(tag: InterestTag): Promise<AudienceMember[]> {
  const sql = requireSubscriptionSql();
  const rows = await sql`
    SELECT s.id, s.email
    FROM subscribers s
    INNER JOIN subscriber_tags t ON t.subscriber_id = s.id
    WHERE s.status = 'active' AND t.tag = ${tag}
    ORDER BY s.email ASC
  `;
  return rows.map((r) => ({
    subscriberId: String(r.id),
    email: String(r.email),
  }));
}

export function appendCampaignFooter(htmlBody: string, email: string): string {
  const unsubUrl = buildUnsubscribePageUrl(email);
  const footer = unsubUrl
    ? `<p style="margin-top:24px;font-size:12px;color:#6b7280;">Bu e-postayı Ofis Akademi bülteni aboneliğin için aldın. <a href="${unsubUrl}" style="color:#6b7280;text-decoration:underline;">Abonelikten çık</a></p>`
    : `<p style="margin-top:24px;font-size:12px;color:#6b7280;">Ofis Akademi</p>`;
  return `${htmlBody.trim()}\n${footer}`;
}

async function sendViaResend(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true; id: string | null } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY missing" };
  }
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM ?? "Ofis Akademi <onboarding@resend.dev>",
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      return {
        ok: false,
        error:
          typeof error === "object" && error && "message" in error
            ? String((error as { message: string }).message)
            : JSON.stringify(error),
      };
    }
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function createCampaign(opts: {
  tag: InterestTag;
  subject: string;
  htmlBody: string;
  createdBy?: string | null;
}): Promise<CampaignRow> {
  const subject = opts.subject.trim();
  const htmlBody = opts.htmlBody.trim();
  if (!subject || subject.length > 200) {
    throw new Error("invalid_subject");
  }
  if (!htmlBody || htmlBody.length > 200_000) {
    throw new Error("invalid_html");
  }

  const audienceCount = await countAudience(opts.tag);
  const sql = requireSubscriptionSql();
  const rows = await sql`
    INSERT INTO campaigns (
      tag, subject, html_body, status, audience_count, created_by
    ) VALUES (
      ${opts.tag},
      ${subject},
      ${htmlBody},
      'draft',
      ${audienceCount},
      ${opts.createdBy ?? null}
    )
    RETURNING *
  `;
  return mapCampaign(rows[0] as Record<string, unknown>);
}

export async function getCampaign(id: string): Promise<CampaignRow | null> {
  const sql = requireSubscriptionSql();
  const rows = await sql`
    SELECT * FROM campaigns WHERE id = ${id} LIMIT 1
  `;
  if (rows.length === 0) return null;
  return mapCampaign(rows[0] as Record<string, unknown>);
}

export async function listRecentCampaignSends(
  campaignId: string,
  limit = 50,
): Promise<CampaignSendRow[]> {
  const sql = requireSubscriptionSql();
  const rows = await sql`
    SELECT email, status, error, sent_at
    FROM campaign_sends
    WHERE campaign_id = ${campaignId}
    ORDER BY sent_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    email: String(r.email),
    status: r.status as "sent" | "failed",
    error: r.error ? String(r.error) : null,
    sent_at: new Date(r.sent_at as string),
  }));
}

export async function sendTestEmail(opts: {
  campaignId: string;
  to: string;
}): Promise<{ ok: boolean; error?: string }> {
  const to = normalizeEmail(opts.to);
  if (!isValidEmail(to)) {
    return { ok: false, error: "invalid_email" };
  }
  const campaign = await getCampaign(opts.campaignId);
  if (!campaign) {
    return { ok: false, error: "not_found" };
  }

  const sql = requireSubscriptionSql();
  await sql`
    UPDATE campaigns
    SET test_email = ${to}
    WHERE id = ${campaign.id}
  `;

  const html = appendCampaignFooter(campaign.html_body, to);
  const result = await sendViaResend({
    to,
    subject: `[TEST] ${campaign.subject}`,
    html,
  });
  if (!result.ok) {
    console.error("[campaign] test send failed", result.error);
    return { ok: false, error: result.error };
  }
  return { ok: true };
}

export async function sendCampaign(campaignId: string): Promise<CampaignRow> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) {
    throw new Error("not_found");
  }
  if (campaign.status === "sending") {
    throw new Error("already_sending");
  }
  if (campaign.status === "sent") {
    throw new Error("already_sent");
  }

  const sql = requireSubscriptionSql();
  await sql`
    UPDATE campaigns
    SET status = 'sending', started_at = now(), sent_ok = 0, sent_fail = 0
    WHERE id = ${campaignId}
  `;

  const audience = await listAudience(campaign.tag);
  let sentOk = 0;
  let sentFail = 0;

  for (const member of audience) {
    const existing = await sql`
      SELECT status FROM campaign_sends
      WHERE campaign_id = ${campaignId} AND email = ${member.email}
      LIMIT 1
    `;
    if (existing.length > 0 && existing[0]!.status === "sent") {
      sentOk += 1;
      continue;
    }

    const html = appendCampaignFooter(campaign.html_body, member.email);
    const result = await sendViaResend({
      to: member.email,
      subject: campaign.subject,
      html,
    });

    if (result.ok) {
      sentOk += 1;
      await sql`
        INSERT INTO campaign_sends (
          campaign_id, subscriber_id, email, status, resend_id, error
        ) VALUES (
          ${campaignId},
          ${member.subscriberId},
          ${member.email},
          'sent',
          ${result.id},
          NULL
        )
        ON CONFLICT (campaign_id, email) DO UPDATE SET
          status = 'sent',
          resend_id = EXCLUDED.resend_id,
          error = NULL,
          sent_at = now()
      `;
    } else {
      sentFail += 1;
      console.error(
        `[campaign] send fail campaign=${campaignId} email=${member.email}`,
        result.error,
      );
      await sql`
        INSERT INTO campaign_sends (
          campaign_id, subscriber_id, email, status, resend_id, error
        ) VALUES (
          ${campaignId},
          ${member.subscriberId},
          ${member.email},
          'failed',
          NULL,
          ${result.error.slice(0, 2000)}
        )
        ON CONFLICT (campaign_id, email) DO UPDATE SET
          status = 'failed',
          error = EXCLUDED.error,
          sent_at = now()
      `;
    }
  }

  const finalStatus: CampaignStatus =
    audience.length === 0
      ? "failed"
      : sentFail > 0 && sentOk === 0
        ? "failed"
        : "sent";

  const updated = await sql`
    UPDATE campaigns
    SET
      status = ${finalStatus},
      audience_count = ${audience.length},
      sent_ok = ${sentOk},
      sent_fail = ${sentFail},
      finished_at = now()
    WHERE id = ${campaignId}
    RETURNING *
  `;

  return mapCampaign(updated[0] as Record<string, unknown>);
}

export { INTEREST_TAGS };
