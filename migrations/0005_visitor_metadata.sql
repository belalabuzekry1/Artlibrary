-- Store coarse Cloudflare city/country and a parsed device category, never IP or raw User-Agent.
ALTER TABLE users ADD COLUMN signup_city TEXT;
ALTER TABLE users ADD COLUMN signup_country TEXT;
ALTER TABLE users ADD COLUMN signup_device_type TEXT;
ALTER TABLE users ADD COLUMN last_login_at TEXT;
ALTER TABLE users ADD COLUMN last_login_city TEXT;
ALTER TABLE users ADD COLUMN last_login_country TEXT;
ALTER TABLE users ADD COLUMN last_login_device_type TEXT;
