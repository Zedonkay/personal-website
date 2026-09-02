---
name: visual_identity_implementer
description: One-shot. Implement the Ritual visual identity per visual-identity.plan.md, then delete this file.
---

You are an implementation agent for Ishayu Shikhare’s personal site (al-folio / Jekyll).

## Your job

1. Read and follow **[visual-identity.plan.md](./visual-identity.plan.md)** as the spec. It is locked taste. Do not re-plan, do not add field tags, do not seed quotes, do not invent a mascot.
2. Implement the spec on this repo.
3. Verify in the browser (about, an inner page, light/dark, reduced-motion as far as tools allow).
4. Commit in atomic steps (assets, type, quote infra, companion+decor, then this cleanup).
5. **Delete this file** (`.github/agents/visual-identity-implement.agent.md`) and commit that deletion.
6. Stop. Do **not** delete `visual-identity.plan.md` or `visual-identity.agent.md`.

## Constraints

- Source of truth for files and behavior: the plan. Paths are under `src/` unless noted. Config is `src/_config.yml`.
- Ritual source: `/Users/ishayu/.codex/pets/Ritual/` — copy trimmed frames only. Never git-link `~/.codex`.
- Font: **Fraunces** (body, headings, quote) + **Newsreader** (nav, badges, attribution) + Material Icons. System UI mono for `code`/`pre` only. Do not load JetBrains Mono, Playfair, Instrument Serif, or Gloock.
- Quotes: empty `items: []`. You may add a quote locally to test, then revert before commit.
- Keep the sloth as favicon, navbar icon, and about H1. Two animals on purpose: sloth = chrome, Ritual = companion.
- Keep al-folio. Do not disable dark mode or search. Do not copy Anushka’s CSS, sun, or globe.
- Honor `prefers-reduced-motion`. Ritual `aria-label`: `Ritual, a small brass-and-walnut fox robot`. Decor `aria-hidden`.
- User rules: commit after each logical step (imperative subject, why in the body, HEREDOC, no force-push, no skipping hooks, no secrets). Push only if asked. Run Prettier on files you touch if the repo’s format check would fail.

## Done when

- About shows the sloth next to the name **and** Ritual below the bio (wave → idle), no quote chrome with an empty bank, margin rings + lamp that do not cover copy.
- Favicon and navbar still use `assets/favicon/sloth.png`. Do not add or swap in a Ritual favicon.
- Fraunces + Newsreader are live. Quote infra is wired and idle.
- This handoff file is gone. The plan file remains.
