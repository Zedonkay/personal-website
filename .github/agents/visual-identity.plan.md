# Ritual visual identity — implementation spec

Durable spec for Ishayu Shikhare’s al-folio site. Steal the _spirit_ of [Anushka Rajasekhar’s site](https://anushkarv.github.io/my-website/) (recurring mark, light decorative background, personality on the homepage) — not her globe, stars, planets, sun icon, or CSS.

This document stays after implementation. Do not treat it as optional flavor.

## Decisions (locked)

- Keep al-folio. Layer onto `src/_layouts/`, `src/_includes/`, `src/_sass/_polish.scss`, `src/_data/`, `src/_config.yml`. Do not rebuild as handwritten HTML.
- **Motif B:** On about, the quote is a full-width band. Ritual runs right-to-left across it (quote clipped in his wake, text behind the sprite), parks on the left, waves once, then idles. Hovering the band after that makes him glance. Inner pages get a quieter companion at the bottom of the content; 404 uses the waiting loop. `prefers-reduced-motion: reduce` → static idle frame on the left, quote fully visible, no sprite loop, no ring spin.
- **No field tags** (not now).
- **Quotes:** infra only. Empty bank. Ishayu populates `src/_data/quotes.yml` himself. Do not seed quotes.
- **Selection:** calendar-day by default (`daily`), with `random` supported in config. Must be **client-side** — GitHub Pages is static; build-time `date: '%j'` would freeze until the next deploy.
- **Two animals, different jobs.** The sloth stays as the site mark: favicon, inner-page navbar (`site.icon: assets/favicon/sloth.png`), and the about H1 next to the name. Ritual is the living companion — identity moment on about, a small sign-off on inner pages, waiting pose on 404. Do not replace, unreference, or delete `sloth.png`. Do not add a Ritual favicon. Do not put Ritual in the navbar.
- **Decor:** about/homepage only. A faint scatter of small SVGs in the **viewport margins**, drawn from Ishayu’s interests (tea, cooking, records, film, books, bikes, quadrotor, race car). Vinyl appears **1–2 times**, peeking off a corner, never as the main motif. Charms stay small, ~0.09–0.12 opacity, and must not overlap each other or the content column (hide the field below ~1200px). No header lamp or tinted nav band — the page top is the same `--color-bg` as the body. Never on project cards, publications, or the library.
- **404 waiting-Ritual:** in scope. Waiting loop beside the “page not found” copy. Still no Ritual favicon.
- **Type:** **Fraunces** for body, headings, and quote text. **Newsreader** for nav, badges, buttons, year labels, and quote attribution. System UI mono for actual `code` / `pre` only — do not load JetBrains Mono.
- Do not disable dark mode or search.
- Do not git-link or submodule `~/.codex`. Copy only trimmed assets into `src/assets/`.

## Who this is (do not generic-robotics-brand it)

Ritual is a compact brass-and-walnut fox-like robot (Codex pet, `3d-toy`): orange fur, cream muzzle, charcoal apron, copper kettle and cuffs, glass eyes. Idle is a thinking pose; wave is a greeting.

The site already has cream/sage light (`#efe3d5` / `#556b5d` / accent `#b58a80`) and charcoal/copper dark (`#262624` / `#d97757`). Brass/copper on Ritual matches both.

Playfulness comes from **motion and character** (Ritual’s run, wave, glance) plus a quiet margin field. Work stays in the bio; the field is not a robotics brand.

## Font

Two serifs, no webfont mono. Fraunces is the voice; Newsreader is the quieter magazine face for chrome (same spirit as Anushka using Playfair in the nav, without making the whole page one font).

| Face               | Role                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| **Fraunces**       | Body, headings, quote text                                                                                  |
| **Newsreader**     | Navbar links, publication/project badges and periodical lines, year labels, link buttons, quote attribution |
| **System UI mono** | `code`, `pre`, syntax highlighting only. Do not load JetBrains Mono.                                        |

**Wiring**

- `src/_config.yml` → `third_party_libraries.google_fonts.url.fonts` keep **Material Icons**. Replace Playfair and JetBrains Mono with Fraunces + Newsreader (italics + variable weight/optical size), e.g.

  `family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Material+Icons&display=swap`

- `src/_sass/_polish.scss`:

  ```scss
  $font-serif: "Fraunces", Georgia, "Times New Roman", serif;
  $font-display: $font-serif;
  $font-secondary: "Newsreader", Georgia, "Times New Roman", serif;
  $font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  ```

  Point every current `$font-mono` chrome rule (nav, `.abbr`, `.periodical`, `.links a.btn`, publication years) at `$font-secondary`. Leave real code blocks on `$font-mono`.

- Fraunces body: quieter (`WONK` 0, modest `SOFT`, `opsz` ~18). Headings and the quote: slightly wonkier (`WONK` 1, `opsz` display). Quotes stay italic.
- Newsreader in the nav: `opsz` around 16–18, not display size. Do not uppercase-track it like a mono badge unless the existing badge styles already do.
- Do not load Instrument Serif, Gloock, Playfair, or JetBrains Mono.

## Ritual assets

Source (local only, never a repo dependency): `/Users/ishayu/.codex/pets/Ritual/`

- Atlas: Codex v2, 8×11, cell **192×208**, sheet 1536×2288 RGBA WebP (~2 MB).
- Rows used: `idle` (row 0, 6 frames), `running-left` (row 2, 8 frames), `waving` (row 3, 4 frames), `waiting` (row 6, 6 frames), look-row-9 (row 9; directions 000…157.5). **Look 090** is column 4 (0-based) — glance toward a quote on Ritual’s right.
- `pet.json` / `pet_request.json` describe the pet. Do not invent a different mascot.

**Copy into the site (trimmed):**

| Path                                          | Contents                                                                                                    | Budget   |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| `src/assets/img/ritual/ritual-idle-wave.webp` | 6×3 strip, cell 192×208. Row 0 = idle 0–5. Row 1 = wave 0–3 (cols 4–5 transparent). Row 2 col 0 = look-090. | ≲ 200 KB |
| `src/assets/img/ritual/ritual-run-left.webp`  | 8×1 strip, running-left                                                                                     | ≲ 80 KB  |
| `src/assets/img/ritual/ritual-wait.webp`      | 6×1 strip, waiting                                                                                          | ≲ 60 KB  |
| `src/assets/img/ritual/ritual-idle.png`       | Idle frame 0, full body, transparent                                                                        | ≲ 50 KB  |

Do not commit the full 2 MB sheet. Leave running-right/jump/fail/other look frames in `~/.codex`. Do not write `src/assets/favicon/ritual.png`. Leave `site.icon` pointing at `assets/favicon/sloth.png`.

## Layout and behavior

### About (`src/_layouts/about.liquid`)

1. **Keep** the sloth `<img class="title-favicon">` in the H1. Do not put Ritual there.
2. After the bio (`clearfix` content), before socials: an **identity moment** — a full-width quote band (~4.5rem min-height). Ritual is absolutely positioned, starts off the right, runs left across the quote (z-index above, quote visible behind the sprite), and parks on the left. Quote reveal is a clip-path wake synced to the run (~2.5s).
3. If the quote bank is empty or `quotes.enabled` is false: still show Ritual (wave + idle on the left). Omit the quote markup entirely (no empty italic, no “add quotes” placeholder).
4. Include the decorative field here only (`permalink: /`).

### Navbar (`src/_includes/header.liquid`)

Already renders `site.icon` (the sloth) on inner pages. Leave it. Homepage navbar has no brand (name + sloth live in the about H1) — keep that.

### Ritual companion (`src/_includes/ritual.liquid` + `src/assets/js/ritual.js`)

- Markup: one element, `role="img"`, `aria-label="Ritual, a small brass-and-walnut fox robot"`. `data-ritual` / `pose`: `reveal` (about), `companion` (inner pages), `wait` (404).
- **reveal:** `is-running` (run-left strip + left 100%→0) with quote `quote-wake` clip, then `is-waving` → `is-idle`. After settle, hovering the identity moment → `is-glance`.
- **companion:** smaller (~3.2rem). Wave once when scrolled into view, again on hover, then idle.
- **wait:** waiting strip loop.
- Reduced motion: no animation classes; show idle frame 0 only (`ritual-idle.png`), quote fully visible, Ritual already on the left.
- Tiny JS is justified; do **not** port the Codex pet controller, drag, or look-at-cursor.
- Load `ritual.js` on every page. Keep `quote-of-the-day.js` about-only.

### Inner pages and 404

- `src/_layouts/default.liquid`: after main content, unless permalink is `/` or `/404.html`, render `{% include ritual.liquid pose="companion" %}`.
- `src/_pages/404.md`: waiting Ritual beside the sorry copy. Do not also render the sign-off companion.

### Decorative field (`src/_includes/decor_field.liquid`)

- Inline SVG + CSS. `aria-hidden="true"`, `pointer-events: none`, z-index behind text.
- **No lamp.** The navbar and page top use the same `--color-bg` as the body (solid, no blur, no wash).
- **Charms:** many kinds, one of most. Left/right gutters only, staggered so they cannot sit on top of each other. Vinyl: two small discs, mostly off-canvas, opacity ~0.10.
- **Steam:** optional wisps on the kettle and cup only. Kill under reduced motion.
- **Narrow viewports (≲1200px):** hide charms and vinyls (gutters are gone). Never overlap body copy.
- Honor `prefers-reduced-motion`: freeze rings and steam.

### Quote of the day (infra only)

**Config** (`src/_config.yml`):

```yaml
quotes:
  enabled: true
  selection: daily # daily | random
```

**Data** (`src/_data/quotes.yml`):

```yaml
# Local quote bank. Client-side pick on the about page.
# text is required; attribution, source, url are optional.
#
# items:
#   - text: "..."
#     attribution: "Name"
#     source: "Work"
#     url: https://example.com
items: []
```

**Include** (`src/_includes/quote_of_the_day.liquid`):

- Render nothing if `quotes.enabled` is false or `items` is missing/empty.
- Otherwise render a `blockquote` (Fraunces italic) + attribution/source as a `footer`/`cite` in Newsreader ~0.75rem. If `url` is set, the cite is a link.
- Embed the bank as `<script type="application/json" id="quote-bank">` via `jsonify`. Hide quote text until JS fills it to avoid a flash of the wrong line; if JS fails, show nothing (empty bank is the common case at ship).
- `src/assets/js/quote-of-the-day.js` (about only):
  - `daily`: `dayOfYear(local Date) % n`
  - `random`: `Math.floor(Math.random() * n)` per visit
  - Fill `text`, `attribution`, `source`, `url`. Keep real HTML, not canvas.

Empty/small bank: 0 → omit block. 1 → that line every day.

## Light / dark / a11y

- Sprites are RGBA. Soft warm shadow (~8px, accent-tinted) so the charcoal apron does not vanish on `#262624`.
- Decorative images `aria-hidden`. Ritual is meaningful → short alt/label as above.
- Quotes are HTML. Reduced-motion → no sprite loop, no ring spin, no steam drift.
- Do not put decoration on `.library`, publications cards, or project cards.

## Files to touch (order)

1. Extract/copy Ritual assets into `src/assets/img/ritual/` only (no favicon).
2. `src/_config.yml` — `quotes.*`, Google Fonts URL. **Do not change `icon`.**
3. `src/_data/quotes.yml` — empty `items: []` plus comments.
4. `src/_includes/quote_of_the_day.liquid` + `src/assets/js/quote-of-the-day.js`
5. `src/_includes/ritual.liquid` + `src/assets/js/ritual.js`
6. `src/_includes/decor_field.liquid`
7. `src/_layouts/about.liquid` — identity moment + decor. Leave the H1 sloth.
8. `src/_includes/scripts.liquid` — `ritual.js` sitewide; quote script about-only.
9. `src/_sass/_polish.scss` — Fraunces + Newsreader, companion, quote, rings, lamp, reduced-motion, light/dark.
10. `src/_pages/404.md` — waiting Ritual.

Do not edit `src/_sass/_themes.scss` unless a lamp/shadow genuinely cannot be done with existing tokens.

## Out of scope

- Field tags
- Seed quotes
- Full Codex pet runtime
- Unoptimized JPEG/MOV dumps
- Copying Anushka’s CSS, sun, or globe
- Replacing or deleting the sloth favicon
- A Ritual favicon

## Verify before calling it done

About (`/`): sloth still next to the name; quote is a full-width band; Ritual runs across it then parks left (waves then idles if motion is allowed); lamp + rings (desktop) stay out of the text; Fraunces on the bio, Newsreader on nav. Empty bank → Ritual only, no quote UI.

Inner page (e.g. `/projects/`): sloth favicon in the tab and navbar; Newsreader on nav/badges; no rings; a small Ritual sign-off at the bottom of the content; library/projects/publications cards unchanged.

404: waiting Ritual beside the copy.

Light and dark. `prefers-reduced-motion`: static Ritual, frozen rings, quote already visible.
