CREATE TABLE digests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  pub_date TEXT NOT NULL,
  raw_content TEXT NOT NULL,
  processed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  digest_id INTEGER NOT NULL REFERENCES digests(id),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  importance TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_digests_date ON digests(date);
CREATE INDEX idx_highlights_digest ON highlights(digest_id);
CREATE INDEX idx_highlights_importance ON highlights(importance);
CREATE INDEX idx_highlights_category ON highlights(category);
