# Persistent hit log

The live site sends a hidden 1×1 pixel to a Cloudflare Worker on `hits.ishayushikhare.com`. Each page view is stored in:

- **D1** (`site-hits`) — queryable rows (IP, geo, ASN, UA, path, referrer, TLS)
- **R2** (`site-hits-logs`) — one JSON object per hit at `raw/YYYY-MM-DD/<id>.json`

The apex site stays on GitHub Pages (gray-cloud DNS). Only this subdomain is a Worker origin. Bot Fight Mode is off for the zone because it cannot be skipped per-hostname on the Free plan, and the only proxied hostname is this logger (the public site is DNS-only).

## View stats

Dashboard (token in `workers/hits/.dev.vars`, gitignored):

`https://hits.ishayushikhare.com/stats?token=YOUR_TOKEN`

JSON: add `&format=json`. Drop likely bots: `&bots=exclude`. Only hinted bots: `&bots=only`.

Hints are heuristic (hosting ASN / crawler User-Agent), not a verdict.

## Deploy the Worker

From `workers/hits/`:

```bash
npx wrangler login
npx wrangler d1 migrations apply site-hits --remote
npx wrangler secret put STATS_TOKEN
npx wrangler deploy
```

`wrangler.jsonc` already points at D1 `5ba51e2f-1eeb-42c4-a40a-002080033ebe`, R2 `site-hits-logs`, and custom domain `hits.ishayushikhare.com`.
