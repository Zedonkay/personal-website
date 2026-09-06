# SmallCounter backup

The live site only uses SmallCounter’s public counter pixel. A Cloudflare Worker copies those logs into storage you control, because SmallCounter itself only keeps about a day of visitor IPs.

Once a day (08:00 UTC) the Worker fetches:

- recent visitors (`rc_stats`)
- top visitors (`cc_stats`)
- daily / monthly totals (`hc_stats`)

and writes:

- **D1** (`site-hits`) — visitor rows (`sc_events`) plus daily/monthly totals
- **R2** (`site-hits-logs`) — raw HTML + parsed JSON under `smallcounter/<timestamp>/`

Nothing on ishayushikhare.com talks to this Worker. The dashboard is private.

## View stats

Token in `workers/hits/.dev.vars` (gitignored):

`https://hits.ishayushikhare.com/stats?token=YOUR_TOKEN`

JSON: add `&format=json`. Manual sync: `/sync?token=YOUR_TOKEN`.

## Deploy

From `workers/hits/`:

```bash
npx wrangler login
npx wrangler d1 migrations apply site-hits --remote
npx wrangler secret put STATS_TOKEN
npx wrangler deploy
```
