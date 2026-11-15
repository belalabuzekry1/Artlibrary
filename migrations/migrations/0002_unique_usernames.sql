-- Keep existing handle values, including instinct-test, and enforce username
-- uniqueness without regard to letter case.
CREATE UNIQUE INDEX IF NOT EXISTS users_handle_lower_unique ON users(lower(handle));
