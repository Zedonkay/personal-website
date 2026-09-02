# Ritual visual identity — implementation spec

Durable spec for Ishayu Shikhare’s al-folio site. Steal the *spirit* of [Anushka Rajasekhar’s site](https://anushkarv.github.io/my-website/) (recurring mark, light decorative background, personality on the homepage) — not her globe, stars, planets, sun icon, or CSS.

This document stays after implementation. Do not treat it as optional flavor.

## Decisions (locked)

- Keep al-folio. Layer onto `src/_layouts/`, `src/_includes/`, `src/_sass/_polish.scss`, `src/_data/`, `src/_config.yml`. Do not rebuild as handwritten HTML.
- **Motif B:** Ritual waves once on about-page load, then idles. Hovering the quote (when one is shown) makes him glance at it. `prefers-reduced-motion: reduce` → static idle frame, no sprite loop, no ring spin.
- **No field tags** (not now).
- **Quotes:** infra only. Empty bank. Ishayu populates `src/_data/quotes.yml` himself. Do not seed quotes.
- **Selection:** calendar-day by default (`daily`), with `random` supported in config. Must be **client-side** — GitHub Pages is static; build-time `date: '%j'` would freeze until the next deploy.
- **Sloth:** Ritual replaces it in favicon, navbar (`site.icon`), and the about H1. Keep `src/assets/favicon/sloth.png` in the tree; stop referencing it.
- **Decor:** about/homepage only. Lamp glow + slow-spinning tea-ring / vinyl-groove SVG in the margins. Faint steam near Ritual. Never on project cards, publications, or the library.
- **404 waiting-Ritual:** out of scope for this pass.
- **Type:** replace Playfair Display with **Fraunces** (see Font). Keep JetBrains Mono for nav, badges, code.
- Do not disable dark mode or search.
- Do not git-link or submodule `~/.codex`. Copy only trimmed assets into `src/assets/`.

## Who this is (do not generic-robotics-brand it)

Ritual is a compact brass-and-walnut fox-like robot (Codex pet, `3d-toy`): orange fur, cream muzzle, charcoal apron, copper kettle and cuffs, glass eyes. Idle is a thinking pose; wave is a greeting.

The site already has cream/sage light (`#efe3d5` / `#556b5d` / accent `#b58a80`) and charcoal/copper dark (`#262624` / `#d97757`). Brass/copper on Ritual matches both.

Playfulness comes from **motion and character** (wave, glance, slow rings), not from a collage of hobbies. Work stays in the bio. The identity layer is craft, tea, records, friction, hospitality.

## Font

Playfair is already wired. Swap the *serif* to something wonkier; leave JetBrains Mono.

**Implement Fraunces** unless a later note in this repo names a different option from this list.

| Option | Role | Why |
| --- | --- | --- |
| **Fraunces (default)** | Body + headings | Editorial serif with `WONK` / `SOFT` / `opsz` axes. Same job as Playfair, more playful. Variable font on Google Fonts. |
| Instrument Serif | Headings, or body if it holds at ~16px | Sharp, contemporary, a bit mischievous. No wonk axis. |
| Newsreader | Body + headings | Optical-size magazine serif. Quieter than Fraunces; still warmer than Playfair. |
| Gloock | Headings only | Ball-terminal display. Too costume for body; pair with Newsreader or keep a text serif. |

**Fraunces wiring**

- `src/_config.yml` → `third_party_libraries.google_fonts.url.fonts` must keep **JetBrains Mono** and **Material Icons**. Replace Playfair with Fraunces italic + variable weight/optical size, e.g.

  `family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=JetBrains+Mono:wght@400;500;600;700&family=Material+Icons&display=swap`

- `src/_sass/_polish.scss`: `$font-serif: "Fraunces", Georgia, "Times New Roman", serif;` (keep `$font-display: $font-serif`, `$font-mono` unchanged).
- Body: quieter (`WONK` 0, modest `SOFT`, `opsz` ~18). Headings and the quote: slightly wonkier (`WONK` 1, `opsz` display). Quotes stay italic.
- Do not load an extra novelty font.

## Ritual assets

Source (local only, never a repo dependency): `/Users/ishayu/.codex/pets/Ritual/`

- Atlas: Codex v2, 8×11, cell **192×208**, sheet 1536×2288 RGBA WebP (~2 MB).
- Rows: `idle` (row 0, 6 frames), `waving` (row 3, 4 frames), look-row-9 (row 9; directions 000…157.5). **Look 090** is column 4 (0-based) — glance toward a quote on Ritual’s right.
- `pet.json` / `pet_request.json` describe the pet. Do not invent a different mascot.

**Copy into the site (trimmed):**

| Path | Contents | Budget |
| --- | --- | --- |
| `src/assets/img/ritual/ritual-idle-wave.webp` | 6×3 strip, cell 192×208. Row 0 = idle 0–5. Row 1 = wave 0–3 (cols 4–5 transparent). Row 2 col 0 = look-090. | ≲ 200 KB |
| `src/assets/img/ritual/ritual-idle.png` | Idle frame 0, full body, transparent | ≲ 50 KB |
| `src/assets/favicon/ritual.png` | **Head/shoulders crop** of idle-0 (full body dies at 16px). Square, transparent. | ≲ 30 KB |

Do not commit the full 2 MB sheet. Leave running/jump/fail/wait/other look frames in `~/.codex`.

`site.icon` → `assets/favicon/ritual.png` (same path style as the sloth, so jekyll-imagemagick does not convert it).

## Layout and behavior

### About (`src/_layouts/about.liquid`)

1. Remove the sloth `<img class="title-favicon">` from the H1. The name is the name; Ritual is not a heading emoji.
2. After the bio (`clearfix` content), before socials: an **identity moment** — Ritual on the left (~72px / 4.5rem tall), quote block on the right (desktop). Stack on small screens (Ritual above quote).
3. If the quote bank is empty or `quotes.enabled` is false: still show Ritual. Omit the quote markup entirely (no empty italic, no “add quotes” placeholder).
4. Include the decorative field here only (`permalink: /`).

### Navbar (`src/_includes/header.liquid`)

Already renders `site.icon` on inner pages. Changing `site.icon` is enough. Homepage navbar has no brand (name lives in the about H1) — keep that.

### Ritual companion (`src/_includes/ritual.liquid` + `src/assets/js/ritual.js`)

- Markup: one element, `role="img"`, `aria-label="Ritual, a small brass-and-walnut fox robot"`.
- Motion OK: CSS sprite (`background-size` 600% × 300%). On load, class `is-waving` (4 frames, ~0.45–0.6s, `steps(4)`), then `is-idle` looping ~1.2–1.6s `steps(6)`.
- Quote hover (when a quote is present): `is-glance` → look-090 frame. Ignore hover under reduced motion.
- Reduced motion: no animation classes; show idle frame 0 only (sprite parked or `ritual-idle.png`).
- Tiny JS is justified; do **not** port the Codex pet controller, drag, or look-at-cursor.
- Load `ritual.js` only on `page.permalink == '/'` (same pattern as `library.js`).

### Decorative field (`src/_includes/decor_field.liquid`)

- Inline SVG + CSS. `aria-hidden="true"`, `pointer-events: none`, z-index behind text.
- **Lamp:** large soft radial behind the about header (paper-lantern, not a spotlight). Light: warm mix of `--color-bg` and `--color-accent`. Dark: ember/copper, low opacity. Must not reduce text contrast.
- **Rings:** 3–5 incomplete circles in the **viewport margins** (cup stain + vinyl groove). Stroke from `--color-secondary` / `--color-accent`, opacity ~0.10–0.14. Slow rotate **48s** linear infinite (her globe-spin energy, his records). Color is not Ritual’s fur orange.
- **Steam:** 1–2 faint SVG wisps near Ritual, optional drift. Kill under reduced motion.
- **Mobile (≲768px):** hide rings (no margin). Keep a softer lamp. Never overlap body copy.
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
- Otherwise render a `blockquote` (Playfair/Fraunces italic) + attribution/source as a `footer`/`cite` in JetBrains Mono ~0.75rem. If `url` is set, the cite is a link.
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

1. Extract/copy Ritual assets into `src/assets/img/ritual/` and `src/assets/favicon/ritual.png`.
2. `src/_config.yml` — `icon`, `quotes.*`, Google Fonts URL.
3. `src/_data/quotes.yml` — empty `items: []` plus comments.
4. `src/_includes/quote_of_the_day.liquid` + `src/assets/js/quote-of-the-day.js`
5. `src/_includes/ritual.liquid` + `src/assets/js/ritual.js`
6. `src/_includes/decor_field.liquid`
7. `src/_layouts/about.liquid` — identity moment, drop sloth, include decor.
8. `src/_includes/scripts.liquid` — about-only script tags.
9. `src/_sass/_polish.scss` — Fraunces, companion, quote, rings, lamp, reduced-motion, light/dark.

Do not edit `src/_sass/_themes.scss` unless a lamp/shadow genuinely cannot be done with existing tokens.

## Out of scope

- Field tags
- Seed quotes
- Full Codex pet runtime
- 404 Ritual
- Unoptimized JPEG/MOV dumps
- Copying Anushka’s CSS, sun, or globe
- Deleting `sloth.png`

## Verify before calling it done

About (`/`): Ritual present; waves then idles if motion is allowed; no sloth in the H1; no quote UI while the bank is empty; lamp + rings (desktop) stay out of the text; Fraunces loaded.

Inner page (e.g. `/projects/`): Ritual favicon in the navbar; no rings; library/projects/publications unchanged.

Light and dark. `prefers-reduced-motion`: static Ritual, frozen rings.

Add one temporary quote locally to confirm daily pick, hover-glance, and markup — **revert the YAML to `items: []` before committing**.
