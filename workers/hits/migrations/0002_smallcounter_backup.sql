CREATE TABLE IF NOT EXISTS sc_events (
  ip TEXT NOT NULL,
  seen_at TEXT NOT NULL,
  location TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  postal TEXT,
  PRIMARY KEY (ip, seen_at)
);

CREATE INDEX IF NOT EXISTS idx_sc_events_seen ON sc_events(seen_at);

CREATE TABLE IF NOT EXISTS sc_daily (
  day TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS sc_monthly (
  year_month TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS sc_syncs (
  ts TEXT PRIMARY KEY,
  recent_count INTEGER,
  daily_count INTEGER,
  monthly_total INTEGER
);
