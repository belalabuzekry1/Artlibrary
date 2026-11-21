CREATE TABLE IF NOT EXISTS artwork_likes (
  artwork_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (artwork_id, user_id)
);
CREATE TABLE IF NOT EXISTS artwork_saves (
  artwork_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (artwork_id, user_id)
);
CREATE TABLE IF NOT EXISTS artwork_hides (
  artwork_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (artwork_id, user_id)
);
CREATE TABLE IF NOT EXISTS artwork_reports (
  id TEXT PRIMARY KEY,
  artwork_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TEXT NOT NULL
);
