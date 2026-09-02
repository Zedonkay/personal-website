# Personal Website

Repo for [my personal website](https://ishayushikhare.com), based on [al-folio](https://github.com/alshedivat/al-folio).

## Links

- **Live site:** [ishayushikhare.com](https://ishayushikhare.com)
- **Theme:** [al-folio](https://github.com/alshedivat/al-folio) (Jekyll theme for academics)

## Setup

If you see "There isn't a GitHub Pages site here" when visiting the site, follow the setup guide:

📖 **[GitHub Pages Setup Guide](docs/github-pages.md)** — complete instructions to enable and configure GitHub Pages

Other setup documentation:

- [Quick start](docs/quick-start.md) — daily branch workflow
- [Deployment workflow](docs/deployment.md) — branch-based deployment strategy
- [Cloudflare DNS setup](docs/cloudflare-dns.md) — configure custom domain DNS

## Local development

```bash
docker compose up
```

Then open [http://localhost:8080](http://localhost:8080). For other install options, see the [al-folio install guide](https://github.com/alshedivat/al-folio/blob/main/INSTALL.md).

## Tech

- [Jekyll](https://jekyllrb.com/) static site
- [al-folio](https://github.com/alshedivat/al-folio) theme
- Deployed via GitHub Actions (see [docs/deployment.md](docs/deployment.md))
