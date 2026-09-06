const COUNTER_ID = "1783365753";
const MONTH_ABBR = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
const MONTH_NAME = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/stats") return handleStats(request, url, env);
    if (url.pathname === "/sync" && (request.method === "GET" || request.method === "POST")) {
      if (!(await tokenOk(request, url, env))) {
        return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
      }
      const result = await backupSmallCounter(env);
      return Response.json(result);
    }
    return new Response("Not found", { status: 404 });
  },

  async scheduled(_controller, env) {
    await backupSmallCounter(env);
  },
};

async function backupSmallCounter(env) {
  const id = env.SMALLCOUNTER_ID || COUNTER_ID;
  const fetchedAt = new Date().toISOString();
  const pages = {
    recent: await fetchPage(`https://smallcounter.com/rc_stats/${id}/`),
    top: await fetchPage(`https://smallcounter.com/cc_stats/${id}/`),
    daily: await fetchPage(`https://smallcounter.com/hc_stats/${id}/`),
  };

  const recent = parseRecent(pages.recent);
  const top = parseTop(pages.top);
  const { daily, monthly, year } = parseDailyPage(pages.daily);
  const parsed = { fetchedAt, recent, top, daily, monthly, year };

  const stamp = fetchedAt.replace(/[:.]/g, "-");
  if (env.LOGS) {
    const puts = [
      env.LOGS.put(`smallcounter/${stamp}/parsed.json`, JSON.stringify(parsed, null, 2), {
        httpMetadata: { contentType: "application/json" },
      }),
      env.LOGS.put(`smallcounter/${stamp}/rc.html`, pages.recent, { httpMetadata: { contentType: "text/html" } }),
      env.LOGS.put(`smallcounter/${stamp}/cc.html`, pages.top, { httpMetadata: { contentType: "text/html" } }),
      env.LOGS.put(`smallcounter/${stamp}/hc.html`, pages.daily, { httpMetadata: { contentType: "text/html" } }),
    ];
    await Promise.all(puts);
  }

  if (env.DB) {
    const stmts = [];
    for (const v of recent) {
      stmts.push(
        env.DB.prepare(
          `INSERT OR IGNORE INTO sc_events (ip, seen_at, location, country, region, city, postal)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(v.ip, v.seen_at, v.location, v.country, v.region, v.city, v.postal)
      );
    }
    for (const d of daily) {
      stmts.push(env.DB.prepare(`INSERT OR REPLACE INTO sc_daily (day, hits, updated_at) VALUES (?, ?, ?)`).bind(d.day, d.hits, fetchedAt));
    }
    for (const m of monthly) {
      stmts.push(
        env.DB.prepare(`INSERT OR REPLACE INTO sc_monthly (year_month, hits, updated_at) VALUES (?, ?, ?)`).bind(m.year_month, m.hits, fetchedAt)
      );
    }
    stmts.push(
      env.DB.prepare(`INSERT INTO sc_syncs (ts, recent_count, daily_count, monthly_total) VALUES (?, ?, ?, ?)`).bind(
        fetchedAt,
        recent.length,
        daily.filter((d) => d.hits > 0).length,
        monthly.reduce((n, m) => n + m.hits, 0)
      )
    );
    if (stmts.length) await env.DB.batch(stmts);
  }

  return {
    fetchedAt,
    stored_events: recent.length,
    daily_days: daily.filter((d) => d.hits > 0).length,
    monthly_total: monthly.reduce((n, m) => n + m.hits, 0),
  };
}

async function fetchPage(url) {
  const res = await fetch(url, { headers: { "User-Agent": "site-hits-backup/1.0 (+https://ishayushikhare.com)" } });
  if (!res.ok) throw new Error(`fetch ${url} failed: ${res.status}`);
  return res.text();
}

function parseRecent(html) {
  const out = [];
  const re =
    /href="\/single_visitor\/(\d+\.\d+\.\d+\.\d+)\/">[\s\S]*?<\/td>\s*<td[^>]*>[\s\S]*?(?:<img[^>]*>)?\s*([^<]*?)\s*at (\d{2}:\d{2}:\d{2}) ([A-Z][a-z]{2})\/(\d{2})\/(\d{4})/g;
  let m;
  while ((m = re.exec(html))) {
    const seen_at = toIso(m[4], m[5], m[6], m[3]);
    if (!seen_at) continue;
    const loc = parseLocation(m[2]);
    out.push({ ip: m[1], seen_at, ...loc });
  }
  return out;
}

function parseTop(html) {
  const out = [];
  const re = /href="\/single_visitor\/(\d+\.\d+\.\d+\.\d+)\/">[\s\S]*?<\/td>\s*<td[^>]*>\s*(\d+)\s*<\/td>\s*<td[^>]*>\s*(?:<img[^>]*>)?\s*([^<]+)/g;
  let m;
  while ((m = re.exec(html))) {
    out.push({ ip: m[1], hits: Number(m[2]), ...parseLocation(m[3]) });
  }
  return out;
}

function parseDailyPage(html) {
  const yearMatch = html.match(/Monthly Stats \((\d{4})\)/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getUTCFullYear();
  const monthMatch = html.match(/Daily Stats \(([A-Za-z]+)\)/);
  const month = MONTH_NAME[monthMatch?.[1]] || new Date().getUTCMonth() + 1;

  const dailySec = sliceBetween(html, "Daily Stats (", "Monthly Stats");
  const monthlySec = sliceBetween(html, "Monthly Stats (", "Page views stats");
  const dailyHits = [...dailySec.matchAll(/title="(\d*)"/g)].map((x) => Number(x[1] || 0));
  const monthlyHits = [...monthlySec.matchAll(/title="(\d*)"/g)].map((x) => Number(x[1] || 0));

  const daily = dailyHits.map((hits, i) => ({
    day: `${year}-${pad(month)}-${pad(i + 1)}`,
    hits,
  }));
  const monthly = monthlyHits.map((hits, i) => ({
    year_month: `${year}-${pad(i + 1)}`,
    hits,
  }));
  return { daily, monthly, year };
}

function sliceBetween(html, start, end) {
  const i = html.indexOf(start);
  const j = html.indexOf(end, i + 1);
  if (i < 0) return "";
  return html.slice(i, j < 0 ? html.length : j);
}

function parseLocation(raw) {
  const location = raw.replace(/\s+/g, " ").trim();
  const parts = location
    .split(" , ")
    .map((p) => p.trim())
    .filter(Boolean);
  const last = parts[parts.length - 1] || "";
  const postal = /^\d{4,6}$/.test(last) ? parts.pop() : "";
  return {
    location,
    country: parts[0] || "",
    region: parts[1] || "",
    city: parts[2] || "",
    postal: postal || "",
  };
}

function toIso(mon, day, year, time) {
  const mi = MONTH_ABBR[mon];
  if (mi == null) return "";
  const [hh, mm, ss] = time.split(":").map(Number);
  return new Date(Date.UTC(Number(year), mi, Number(day), hh, mm, ss)).toISOString();
}

function pad(n) {
  return String(n).padStart(2, "0");
}

async function tokenOk(request, url, env) {
  const expected = env.STATS_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("Authorization") || "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7) : "";
  const provided = bearer || url.searchParams.get("token") || "";
  return timingSafeEqualString(provided, expected);
}

async function timingSafeEqualString(a, b) {
  const enc = new TextEncoder();
  const ha = await crypto.subtle.digest("SHA-256", enc.encode(a));
  const hb = await crypto.subtle.digest("SHA-256", enc.encode(b));
  return crypto.subtle.timingSafeEqual(new Uint8Array(ha), new Uint8Array(hb));
}

async function handleStats(request, url, env) {
  if (!(await tokenOk(request, url, env))) {
    return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": "Bearer" } });
  }
  if (!env.DB) return Response.json({ error: "D1 not bound" }, { status: 503 });

  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 100), 1), 500);
  const [total, lastSync, dailySum, events, daily] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS n FROM sc_events"),
    env.DB.prepare("SELECT ts, recent_count, monthly_total FROM sc_syncs ORDER BY ts DESC LIMIT 1"),
    env.DB.prepare("SELECT COALESCE(SUM(hits), 0) AS n FROM sc_monthly"),
    env.DB.prepare("SELECT * FROM sc_events ORDER BY seen_at DESC LIMIT ?").bind(limit),
    env.DB.prepare("SELECT * FROM sc_daily WHERE hits > 0 ORDER BY day DESC LIMIT 60"),
  ]);

  const payload = {
    source: "smallcounter",
    stored_events: total.results[0]?.n ?? 0,
    monthly_total: dailySum.results[0]?.n ?? lastSync.results[0]?.monthly_total ?? 0,
    last_sync: lastSync.results[0] || null,
    events: events.results,
    daily: daily.results,
  };

  if ((url.searchParams.get("format") || "html") === "json") return Response.json(payload);
  return new Response(statsHtml(payload), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statsHtml(payload) {
  const rows = (payload.events || [])
    .map(
      (h) => `<tr>
        <td>${escapeHtml(h.seen_at)}</td>
        <td>${escapeHtml(h.ip)}</td>
        <td>${escapeHtml(h.location)}</td>
      </tr>`
    )
    .join("");
  const days = (payload.daily || []).map((d) => `<tr><td>${escapeHtml(d.day)}</td><td>${escapeHtml(d.hits)}</td></tr>`).join("");
  const sync = payload.last_sync?.ts || "never";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>SmallCounter backup</title>
  <style>
    body { font: 14px/1.4 system-ui, sans-serif; margin: 24px; color: #111; }
    .nums { display: flex; gap: 16px; margin-bottom: 16px; }
    .nums div { background: #f4f4f5; padding: 12px 16px; border-radius: 8px; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
    th, td { text-align: left; border-bottom: 1px solid #ddd; padding: 6px 8px; }
    th { font-size: 12px; text-transform: uppercase; color: #555; }
    .muted { color: #666; }
  </style>
</head>
<body>
  <h1>SmallCounter backup</h1>
  <div class="nums">
    <div><strong>${payload.monthly_total}</strong><br>SmallCounter year total</div>
    <div><strong>${payload.stored_events}</strong><br>saved visitor rows</div>
  </div>
  <p class="muted">Copied from SmallCounter (last ~1 day of IPs, plus daily totals). Last sync: ${escapeHtml(sync)}. Add <code>&amp;format=json</code>.</p>
  <h2>Daily totals</h2>
  <table><thead><tr><th>Day</th><th>Hits</th></tr></thead><tbody>${days}</tbody></table>
  <h2>Visitors</h2>
  <table>
    <thead><tr><th>Seen (UTC)</th><th>IP</th><th>Location</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}
