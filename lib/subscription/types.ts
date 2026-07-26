import type { InterestTag, SubscribeChannel, SubscribeReason } from "./rules";

export type SubscriberStatus =
  | "active"
  | "unsubscribed"
  | "bounced"
  | "complained";

export type SubscriptionEventType =
  | "SUBSCRIBE"
  | "RESUBSCRIBE"
  | "TAG_ADDED"
  | "UNSUBSCRIBE";

export type SubscribeOutcome =
  | "subscribed"
  | "tag_added"
  | "resubscribed"
  | "already_subscribed";

export type UtmPayload = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
};

export type SubscribeInput = {
  email: string;
  page: string;
  reason: SubscribeReason;
  channel: SubscribeChannel;
  referrer?: string | null;
  sessionId?: string | null;
  utm?: UtmPayload | null;
};

export type SubscribeResult = {
  ok: true;
  outcome: SubscribeOutcome;
  email: string;
  category: InterestTag;
  tags: InterestTag[];
  welcomeSent: boolean;
  subscriberId: string;
};

export type SubscriberRow = {
  id: string;
  email: string;
  status: SubscriberStatus;
  schema_version: number;
  first_subscribed_at: Date;
  last_subscribed_at: Date;
  unsubscribed_at: Date | null;
  primary_source_page: string | null;
  primary_source_category: string | null;
};
