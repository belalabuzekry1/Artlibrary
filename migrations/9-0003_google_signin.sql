-- Link accounts to Google sign-in. google_sub is Google's stable account id;
-- OAuth-only accounts keep the sentinel password_hash 'oauth$google'.
ALTER TABLE users ADD COLUMN google_sub TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_unique ON users(google_sub) WHERE google_sub IS NOT NULL;
