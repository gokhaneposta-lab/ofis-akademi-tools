import { requireSubscriptionSql } from "./db";
import { appendSubscriptionEvent } from "./events";
import {
  mapPageToCategory,
  normalizePagePath,
  type InterestTag,
} from "./rules";
import { addTagIfMissing, listTagsForSubscriber } from "./tags";
import type {
  SubscribeInput,
  SubscribeOutcome,
  SubscribeResult,
  SubscriberRow,
} from "./types";
import { sendWelcomeEmail } from "./welcome";

async function findByEmail(email: string): Promise<SubscriberRow | null> {
  const sql = requireSubscriptionSql();
  const rows = await sql`
    SELECT
      id, email, status, schema_version,
      first_subscribed_at, last_subscribed_at, unsubscribed_at,
      primary_source_page, primary_source_category
    FROM subscribers
    WHERE email = ${email}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  const r = rows[0]!;
  return {
    id: String(r.id),
    email: String(r.email),
    status: r.status as SubscriberRow["status"],
    schema_version: Number(r.schema_version),
    first_subscribed_at: new Date(r.first_subscribed_at as string),
    last_subscribed_at: new Date(r.last_subscribed_at as string),
    unsubscribed_at: r.unsubscribed_at
      ? new Date(r.unsubscribed_at as string)
      : null,
    primary_source_page: (r.primary_source_page as string) ?? null,
    primary_source_category: (r.primary_source_category as string) ?? null,
  };
}

async function touchUpdatedAt(subscriberId: string): Promise<void> {
  const sql = requireSubscriptionSql();
  await sql`
    UPDATE subscribers
    SET updated_at = now()
    WHERE id = ${subscriberId}
  `;
}

async function markActiveResubscribe(subscriberId: string): Promise<void> {
  const sql = requireSubscriptionSql();
  await sql`
    UPDATE subscribers
    SET
      status = 'active',
      unsubscribed_at = NULL,
      last_subscribed_at = now(),
      updated_at = now()
    WHERE id = ${subscriberId}
  `;
}

async function bumpLastSubscribed(subscriberId: string): Promise<void> {
  const sql = requireSubscriptionSql();
  await sql`
    UPDATE subscribers
    SET last_subscribed_at = now(), updated_at = now()
    WHERE id = ${subscriberId}
  `;
}

/**
 * Domain: abonelik upsert + tag union + event append.
 * Welcome yalnızca ilk SUBSCRIBE'da (soft-fail).
 */
export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  const email = input.email;
  const page = normalizePagePath(input.page);
  const category = mapPageToCategory(page);
  const existing = await findByEmail(email);

  if (!existing) {
    return createNewSubscriber({
      email,
      page,
      category,
      reason: input.reason,
      channel: input.channel,
      referrer: input.referrer ?? null,
      sessionId: input.sessionId ?? null,
      utm: input.utm ?? null,
    });
  }

  if (existing.status === "unsubscribed") {
    return resubscribe(existing, {
      page,
      category,
      reason: input.reason,
      channel: input.channel,
      referrer: input.referrer ?? null,
      sessionId: input.sessionId ?? null,
      utm: input.utm ?? null,
    });
  }

  const tags = await listTagsForSubscriber(existing.id);
  if (tags.includes(category)) {
    await touchUpdatedAt(existing.id);
    return {
      ok: true,
      outcome: "already_subscribed",
      email,
      category,
      tags,
      welcomeSent: false,
      subscriberId: existing.id,
    };
  }

  await bumpLastSubscribed(existing.id);
  const eventId = await appendSubscriptionEvent({
    subscriberId: existing.id,
    email,
    eventType: "TAG_ADDED",
    page,
    category,
    reason: input.reason,
    channel: input.channel,
    referrer: input.referrer ?? null,
    sessionId: input.sessionId ?? null,
    utm: input.utm ?? null,
  });
  await addTagIfMissing({
    subscriberId: existing.id,
    tag: category,
    sourceEventId: eventId,
  });
  const nextTags = await listTagsForSubscriber(existing.id);
  return {
    ok: true,
    outcome: "tag_added",
    email,
    category,
    tags: nextTags,
    welcomeSent: false,
    subscriberId: existing.id,
  };
}

async function createNewSubscriber(opts: {
  email: string;
  page: string;
  category: InterestTag;
  reason: SubscribeInput["reason"];
  channel: SubscribeInput["channel"];
  referrer: string | null;
  sessionId: string | null;
  utm: SubscribeInput["utm"];
}): Promise<SubscribeResult> {
  const sql = requireSubscriptionSql();
  const rows = await sql`
    INSERT INTO subscribers (
      email, status, schema_version,
      first_subscribed_at, last_subscribed_at,
      primary_source_page, primary_source_category
    ) VALUES (
      ${opts.email},
      'active',
      1,
      now(),
      now(),
      ${opts.page},
      ${opts.category}
    )
    RETURNING id
  `;
  const subscriberId = String(rows[0]!.id);
  const eventId = await appendSubscriptionEvent({
    subscriberId,
    email: opts.email,
    eventType: "SUBSCRIBE",
    page: opts.page,
    category: opts.category,
    reason: opts.reason,
    channel: opts.channel,
    referrer: opts.referrer,
    sessionId: opts.sessionId,
    utm: opts.utm ?? null,
  });
  await addTagIfMissing({
    subscriberId,
    tag: opts.category,
    sourceEventId: eventId,
  });
  const welcomeSent = await sendWelcomeEmail({
    email: opts.email,
    category: opts.category,
  });
  return {
    ok: true,
    outcome: "subscribed",
    email: opts.email,
    category: opts.category,
    tags: [opts.category],
    welcomeSent,
    subscriberId,
  };
}

async function resubscribe(
  existing: SubscriberRow,
  opts: {
    page: string;
    category: InterestTag;
    reason: SubscribeInput["reason"];
    channel: SubscribeInput["channel"];
    referrer: string | null;
    sessionId: string | null;
    utm: SubscribeInput["utm"];
  },
): Promise<SubscribeResult> {
  await markActiveResubscribe(existing.id);
  await appendSubscriptionEvent({
    subscriberId: existing.id,
    email: existing.email,
    eventType: "RESUBSCRIBE",
    page: opts.page,
    category: opts.category,
    reason: opts.reason,
    channel: opts.channel,
    referrer: opts.referrer,
    sessionId: opts.sessionId,
    utm: opts.utm ?? null,
  });

  const tagsBefore = await listTagsForSubscriber(existing.id);
  let outcome: SubscribeOutcome = "resubscribed";
  if (!tagsBefore.includes(opts.category)) {
    const tagEventId = await appendSubscriptionEvent({
      subscriberId: existing.id,
      email: existing.email,
      eventType: "TAG_ADDED",
      page: opts.page,
      category: opts.category,
      reason: opts.reason,
      channel: opts.channel,
      referrer: opts.referrer,
      sessionId: opts.sessionId,
      utm: opts.utm ?? null,
    });
    await addTagIfMissing({
      subscriberId: existing.id,
      tag: opts.category,
      sourceEventId: tagEventId,
    });
    outcome = "resubscribed";
  }

  const tags = await listTagsForSubscriber(existing.id);
  return {
    ok: true,
    outcome,
    email: existing.email,
    category: opts.category,
    tags,
    welcomeSent: false,
    subscriberId: existing.id,
  };
}
