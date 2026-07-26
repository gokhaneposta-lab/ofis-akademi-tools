import { requireSubscriptionSql } from "./db";
import type { InterestTag } from "./rules";

export async function listTagsForSubscriber(
  subscriberId: string,
): Promise<InterestTag[]> {
  const sql = requireSubscriptionSql();
  const rows = await sql`
    SELECT tag FROM subscriber_tags
    WHERE subscriber_id = ${subscriberId}
    ORDER BY tag ASC
  `;
  return rows.map((r) => r.tag as InterestTag);
}

/** Union insert; returns true if a new row was inserted. */
export async function addTagIfMissing(opts: {
  subscriberId: string;
  tag: InterestTag;
  sourceEventId: number | null;
}): Promise<boolean> {
  const sql = requireSubscriptionSql();
  const rows = await sql`
    INSERT INTO subscriber_tags (subscriber_id, tag, source_event_id)
    VALUES (${opts.subscriberId}, ${opts.tag}, ${opts.sourceEventId})
    ON CONFLICT (subscriber_id, tag) DO NOTHING
    RETURNING tag
  `;
  return rows.length > 0;
}
