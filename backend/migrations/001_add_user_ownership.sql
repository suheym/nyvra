-- Nyvra production ownership migration.
-- Clerk owns authentication. Nyvra stores only the stable Clerk user ID
-- needed to enforce ownership of application data.
--
-- Run this against the production database before enabling the authenticated API.

ALTER TABLE journal_entries
    ADD COLUMN IF NOT EXISTS user_id TEXT;

ALTER TABLE habit_data
    ADD COLUMN IF NOT EXISTS user_id TEXT;

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id_created_at
    ON journal_entries (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_habit_data_user_id_created_at
    ON habit_data (user_id, created_at);

-- Existing rows created before authentication cannot safely be assigned to a
-- user automatically. They must be reviewed before user_id is made NOT NULL.
-- Once legacy rows have been intentionally migrated (or removed from the
-- production database), enforce the invariant with:
--
-- ALTER TABLE journal_entries ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE habit_data ALTER COLUMN user_id SET NOT NULL;
