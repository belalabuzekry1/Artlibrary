-- Community phase 1: artworks (uploads), projects (portfolio groupings),
-- and project membership. Views counted on the artwork row; likes, saves,
-- reports and points arrive in later migrations.
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT,
  tags TEXT,
  editable_hint TEXT,
  image_key TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  views INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS artworks_user ON artworks(user_id, created_at);
CREATE INDEX IF NOT EXISTS artworks_status_created ON artworks(status, created_at);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  cover_artwork_id TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS projects_user ON projects(user_id, created_at);

CREATE TABLE IF NOT EXISTS project_items (
  project_id TEXT NOT NULL,
  artwork_id TEXT NOT NULL,
  added_at TEXT NOT NULL,
  PRIMARY KEY (project_id, artwork_id)
);
