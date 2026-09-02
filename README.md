# Personal Website

Repo for [my personal website](https://ishayushikhare.com), based on [al-folio](https://github.com/alshedivat/al-folio).

## Layout

| Path              | What it is                                                     |
| ----------------- | -------------------------------------------------------------- |
| `src/`            | Jekyll site: config, gems, pages, posts, templates, assets     |
| `docs/setup/`     | How this site is deployed (GitHub Pages, Cloudflare, branches) |
| `docs/theme/`     | al-folio install / customize / FAQ guides                      |
| `docker/`         | Local Docker environment                                       |
| `scripts/`        | Build, deploy, and citation helpers                            |
| `config/`         | Prettier, npm, pre-commit, PurgeCSS, lychee                    |
| `src/_config.yml` | Jekyll config                                                  |

## Links

- **Live site:** [ishayushikhare.com](https://ishayushikhare.com)
- **Theme:** [al-folio](https://github.com/alshedivat/al-folio)

## Setup

If you see "There isn't a GitHub Pages site here" when visiting the site, follow the setup guide:

📖 **[GitHub Pages setup](docs/setup/github-pages.md)**

Other setup docs:

- [Quick start](docs/setup/quick-start.md) — daily branch workflow
- [Deployment workflow](docs/setup/deployment.md) — branch-based deployment
- [Cloudflare DNS](docs/setup/cloudflare-dns.md) — custom domain DNS
- [Code scanning](docs/setup/code-scanning.md) — CodeQL

Theme documentation (al-folio):

- [Install](docs/theme/INSTALL.md)
- [Customize](docs/theme/CUSTOMIZE.md)
- [FAQ](docs/theme/FAQ.md)

## Local development

```bash
docker compose -f docker/compose.yml up
```

Then open [http://localhost:8080](http://localhost:8080). Slimmer image: `docker compose -f docker/compose.slim.yml up`.

Formatting:

```bash
npm --prefix config install
npm --prefix config run format:check
```

## Tech

- [Jekyll](https://jekyllrb.com/) static site
- [al-folio](https://github.com/alshedivat/al-folio) theme
- Deployed via GitHub Actions (see [docs/setup/deployment.md](docs/setup/deployment.md))
