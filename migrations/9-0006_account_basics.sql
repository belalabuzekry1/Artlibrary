-- Account basics: profile fields, temporary deactivation, one-time email
-- codes (password reset/change, email change), and deletion feedback.
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_data TEXT;
ALTER TABLE users ADD COLUMN deactivated_until TEXT;

CREATE TABLE IF NOT EXISTS auth_codes (
  code_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  payload TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  attempts INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS auth_codes_user ON auth_codes(user_id, purpose, created_at);

CREATE TABLE IF NOT EXISTS deletion_feedback (
  id TEXT PRIMARY KEY,
  username TEXT,
  email TEXT,
  mode TEXT NOT NULL,
  period TEXT,
  reason TEXT,
  created_at TEXT NOT NULL
);
