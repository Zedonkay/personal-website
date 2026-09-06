const PIXEL = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), (c) => c.charCodeAt(0));

const HOSTING_ASN =
  /amazon|aws|google llc|google cloud|microsoft|azure|digitalocean|hetzner|ovh|linode|akamai|tencent|alibaba|huawei cloud|choopa|m247|datacamp|psychz|quadranet|leaseweb|contabo|vultr|oracle cloud|cloudflare|tier\.net|tier-net|colocrossing|serverius|hivelocity/i;

const UA_BOT =
  /bot|crawler|spider|crawl|slurp|wget|curl|python-requests|httpclient|go-http|scrapy|headless|preview|monitor|uptimerobot|pingdom|statuscake/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request) });
    }

    if (url.pathname === "/stats") {
      return handleStats(request, url, env);
    }

    if (url.pathname === "/i.gif" && (request.method === "GET" || request.method === "HEAD")) {
      if (request.method === "GET") {
        ctx.waitUntil(persistHit(request, url, env));
      }
      return pixelResponse();
    }

    return new Response("Not found", { status: 404 });
  },
};

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function pixelResponse() {
  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}

function hintsFor(hit) {
  const hints = [];
  const ua = (hit.ua || "").toLowerCase();
  const org = hit.as_org || "";
  if (!hit.ua) hints.push("empty_ua");
  if (hit.ua && UA_BOT.test(ua)) hints.push("ua_bot");
  if (org && HOSTING_ASN.test(org)) hints.push("hosting_asn");
  return hints;
}

function hitFromRequest(request, url) {
  const cf = request.cf || {};
  const hit = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    ip: request.headers.get("CF-Connecting-IP") || request.headers.get("X-Real-IP") || "",
    path: clip(url.searchParams.get("p") || url.searchParams.get("path") || "", 512),
    referrer: clip(request.headers.get("Referer") || url.searchParams.get("r") || "", 1024),
    ua: clip(request.headers.get("User-Agent") || "", 1024),
    accept_language: clip(request.headers.get("Accept-Language") || "", 256),
    country: cf.country || "",
    city: cf.city || "",
    region: cf.region || "",
    region_code: cf.regionCode || "",
    postal_code: cf.postalCode || "",
    timezone: cf.timezone || "",
    continent: cf.continent || "",
    latitude: cf.latitude != null ? String(cf.latitude) : "",
    longitude: cf.longitude != null ? String(cf.longitude) : "",
    colo: cf.colo || "",
    asn: typeof cf.asn === "number" ? cf.asn : null,
    as_org: cf.asOrganization || "",
    http_protocol: cf.httpProtocol || "",
    tls_version: cf.tlsVersion || "",
    tls_cipher: cf.tlsCipher || "",
  };
  hit.hints = JSON.stringify(hintsFor(hit));
  return hit;
}

function clip(value, max) {
  return value.length > max ? value.slice(0, max) : value;
}

async function persistHit(request, url, env) {
  const hit = hitFromRequest(request, url);
  const date = hit.ts.slice(0, 10);
  const key = `raw/${date}/${hit.id}.json`;

  const writes = [];
  if (env.LOGS) {
    writes.push(env.LOGS.put(key, JSON.stringify(hit), { httpMetadata: { contentType: "application/json" } }));
  }
  if (env.DB) {
    writes.push(
      env.DB.prepare(
        `INSERT INTO hits (
          id, ts, ip, path, referrer, ua, accept_language,
          country, city, region, region_code, postal_code, timezone,
          continent, latitude, longitude, colo, asn, as_org,
          http_protocol, tls_version, tls_cipher, hints
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          hit.id,
          hit.ts,
          hit.ip,
          hit.path,
          hit.referrer,
          hit.ua,
          hit.accept_language,
          hit.country,
          hit.city,
          hit.region,
          hit.region_code,
          hit.postal_code,
          hit.timezone,
          hit.continent,
          hit.latitude,
          hit.longitude,
          hit.colo,
          hit.asn,
          hit.as_org,
          hit.http_protocol,
          hit.tls_version,
          hit.tls_cipher,
          hit.hints
        )
        .run()
    );
  }
  await Promise.all(writes);
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
  if (!env.DB) {
    return Response.json({ error: "D1 not bound" }, { status: 503 });
  }

  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 100), 1), 500);
  const bots = url.searchParams.get("bots"); // include | only | exclude
  let where = "";
  if (bots === "exclude") where = "WHERE hints = '[]'";
  else if (bots === "only") where = "WHERE hints != '[]'";

  const [total, humans, flagged, rows] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS n FROM hits"),
    env.DB.prepare("SELECT COUNT(*) AS n FROM hits WHERE hints = '[]'"),
    env.DB.prepare("SELECT COUNT(*) AS n FROM hits WHERE hints != '[]'"),
    env.DB.prepare(`SELECT * FROM hits ${where} ORDER BY ts DESC LIMIT ?`).bind(limit),
  ]);

  const payload = {
    total: total.results[0]?.n ?? 0,
    likely_human: humans.results[0]?.n ?? 0,
    likely_bot: flagged.results[0]?.n ?? 0,
    hits: rows.results,
  };

  if ((url.searchParams.get("format") || "html") === "json") {
    return Response.json(payload);
  }
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
  const rows = payload.hits
    .map((h) => {
      const hints = h.hints && h.hints !== "[]" ? escapeHtml(h.hints) : "";
      return `<tr>
        <td>${escapeHtml(h.ts)}</td>
        <td>${escapeHtml(h.ip)}</td>
        <td>${escapeHtml(h.country)} ${escapeHtml(h.region)} ${escapeHtml(h.city)}</td>
        <td>${escapeHtml(h.as_org)} (${escapeHtml(h.asn)})</td>
        <td>${escapeHtml(h.path)}</td>
        <td title="${escapeHtml(h.ua)}">${escapeHtml((h.ua || "").slice(0, 80))}</td>
        <td>${hints}</td>
      </tr>`;
    })
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Site hits</title>
  <style>
    body { font: 14px/1.4 system-ui, sans-serif; margin: 24px; color: #111; }
    .nums { display: flex; gap: 16px; margin-bottom: 16px; }
    .nums div { background: #f4f4f5; padding: 12px 16px; border-radius: 8px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { text-align: left; border-bottom: 1px solid #ddd; padding: 6px 8px; vertical-align: top; }
    th { font-size: 12px; text-transform: uppercase; color: #555; }
    .muted { color: #666; margin-bottom: 12px; }
  </style>
</head>
<body>
  <h1>Site hits</h1>
  <div class="nums">
    <div><strong>${payload.total}</strong><br>total</div>
    <div><strong>${payload.likely_human}</strong><br>no bot hints</div>
    <div><strong>${payload.likely_bot}</strong><br>bot hints</div>
  </div>
  <p class="muted">Hints are heuristic (hosting ASN / crawler UA), not ground truth. Append <code>&amp;format=json</code>, <code>&amp;bots=exclude</code>, or <code>&amp;bots=only</code>.</p>
  <table>
    <thead>
      <tr><th>Time (UTC)</th><th>IP</th><th>Geo</th><th>ASN</th><th>Path</th><th>User-Agent</th><th>Hints</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}
