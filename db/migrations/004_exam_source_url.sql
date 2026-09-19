-- Add source_url for Excel "Kaynak URL" column (import-ready)
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS source_url text;
