-- Email verification. Google sign-ups are verified by Google, so existing
-- Google accounts are marked verified. Password accounts start unverified.
ALTER TABLE users ADD COLUMN email_verified_at TEXT;
UPDATE users SET email_verified_at = created_at WHERE google_sub IS NOT NULL AND email_verified_at IS NULL;
CREATE TABLE IF NOT EXISTS email_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);
CREATE INDEX IF NOT EXISTS email_tokens_user ON email_tokens(user_id, created_at);
