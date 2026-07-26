import { requireSubscriptionSql } from "./db";
import type { InterestTag, SubscribeChannel, SubscribeReason } from "./rules";
import type { SubscriptionEventType, UtmPayload } from "./types";

export async function appendSubscriptionEvent(opts: {
  subscriberId: string;
  email: string;
  eventType: SubscriptionEventType;
  page: string | null;
  category: InterestTag | null;
  reason: SubscribeReason | null;
  channel: SubscribeChannel | null;
  referrer: string | null;
  sessionId: string | null;
  utm: UtmPayload | null;
  metadata?: Record<string, unknown> | null;
}): Promise<number> {
  const sql = requireSubscriptionSql();
  const utmValue = opts.utm ?? null;
  const metaValue = opts.metadata ?? null;
  const rows = await sql`
    INSERT INTO subscription_events (
      subscriber_id, email, event_type, page, category, reason, channel,
      referrer, session_id, utm, metadata
    ) VALUES (
      ${opts.subscriberId},
      ${opts.email},
      ${opts.eventType},
      ${opts.page},
      ${opts.category},
      ${opts.reason},
      ${opts.channel},
      ${opts.referrer},
      ${opts.sessionId},
      ${utmValue},
      ${metaValue}
    )
    RETURNING id
  `;
  const id = rows[0]?.id;
  if (id == null) throw new Error("subscription_events insert returned no id");
  return Number(id);
}
