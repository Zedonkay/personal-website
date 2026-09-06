CREATE TABLE IF NOT EXISTS hits (
  id TEXT PRIMARY KEY,
  ts TEXT NOT NULL,
  ip TEXT,
  path TEXT,
  referrer TEXT,
  ua TEXT,
  accept_language TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  region_code TEXT,
  postal_code TEXT,
  timezone TEXT,
  continent TEXT,
  latitude TEXT,
  longitude TEXT,
  colo TEXT,
  asn INTEGER,
  as_org TEXT,
  http_protocol TEXT,
  tls_version TEXT,
  tls_cipher TEXT,
  hints TEXT
);

CREATE INDEX IF NOT EXISTS idx_hits_ts ON hits(ts);
CREATE INDEX IF NOT EXISTS idx_hits_ip ON hits(ip);
CREATE INDEX IF NOT EXISTS idx_hits_asn ON hits(asn);
CREATE INDEX IF NOT EXISTS idx_hits_as_org ON hits(as_org);
