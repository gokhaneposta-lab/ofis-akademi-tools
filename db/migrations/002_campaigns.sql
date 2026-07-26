-- Campaign Lite — Sprint 4
-- OA DB source of truth; Resend is send-only

CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
  subject text NOT NULL,
  html_body text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'sending', 'sent', 'failed')
  ),
  audience_count integer NOT NULL DEFAULT 0,
  sent_ok integer NOT NULL DEFAULT 0,
  sent_fail integer NOT NULL DEFAULT 0,
  test_email citext,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_campaigns_created
  ON campaigns (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_tag_status
  ON campaigns (tag, status);

CREATE TABLE IF NOT EXISTS campaign_sends (
  id bigserial PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES campaigns (id) ON DELETE CASCADE,
  subscriber_id uuid NOT NULL REFERENCES subscribers (id) ON DELETE RESTRICT,
  email citext NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed')),
  resend_id text,
  error text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign
  ON campaign_sends (campaign_id, status);
