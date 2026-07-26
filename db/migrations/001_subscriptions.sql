-- Newsletter v2 Sprint 1 — OA source of truth
-- Docs: docs/newsletter-v2/02_DATABASE_DESIGN.md (v1.0 Final)

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('active', 'unsubscribed', 'bounced', 'complained')),
  schema_version smallint NOT NULL DEFAULT 1,
  first_subscribed_at timestamptz NOT NULL,
  last_subscribed_at timestamptz NOT NULL,
  unsubscribed_at timestamptz,
  primary_source_page text,
  primary_source_category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_last_subscribed ON subscribers (last_subscribed_at DESC);

CREATE TABLE IF NOT EXISTS subscription_events (
  id bigserial PRIMARY KEY,
  subscriber_id uuid NOT NULL REFERENCES subscribers (id) ON DELETE RESTRICT,
  email citext NOT NULL,
  event_type text NOT NULL CHECK (
    event_type IN ('SUBSCRIBE', 'RESUBSCRIBE', 'TAG_ADDED', 'UNSUBSCRIBE')
  ),
  page text,
  category text,
  reason text,
  channel text,
  referrer text,
  session_id text,
  utm jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_subscriber_created
  ON subscription_events (subscriber_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_email_created
  ON subscription_events (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type_created
  ON subscription_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_category
  ON subscription_events (category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_channel
  ON subscription_events (channel) WHERE channel IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_session
  ON subscription_events (session_id) WHERE session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS subscriber_tags (
  subscriber_id uuid NOT NULL REFERENCES subscribers (id) ON DELETE RESTRICT,
  tag text NOT NULL CHECK (
    tag IN (
      'excel',
      'training',
      'finance',
      'insurance',
      'tsb',
      'ifrs17',
      'legacy',
      'general'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  source_event_id bigint REFERENCES subscription_events (id) ON DELETE SET NULL,
  PRIMARY KEY (subscriber_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_subscriber_tags_tag ON subscriber_tags (tag);
