# Quick Start Guide: Branch-Based Deployment

## 🚀 Quick Overview

```
┌─────────────────┐         ┌─────────────────┐
│  experimental   │────────▶│ zedonkay        │
│     branch      │         │ .github.io      │
│  (staging)      │         │   (testbench)   │
└─────────────────┘         └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│      main       │────────▶│ ishayushikhare  │
│     branch      │         │     .com        │
│  (production)   │         │  (production)   │
└─────────────────┘         └─────────────────┘
```

## 🎯 Getting Started

### 1️⃣ First Time Setup (Do Once)

After merging this PR to main:

```bash
# Create experimental branch from main
git checkout main
git pull origin main
git checkout -b experimental
git push origin experimental
```

### 2️⃣ Daily Workflow

#### For Testing/Development:

```bash
# Work on experimental
git checkout experimental
git pull origin experimental

# Make changes
# ... edit files ...

git add .
git commit -m "Add new feature"
git push origin experimental

# ✅ Auto-deploys to https://zedonkay.github.io
```

#### For Production:

```bash
# After testing on experimental, promote to production
git checkout main
git pull origin main
git merge experimental
git push origin main

# ✅ Auto-deploys to https://ishayushikhare.com
```

## 📋 Checklist for Production Deployment

Before promoting to main, ensure:

- [ ] Changes tested on experimental (zedonkay.github.io)
- [ ] Site looks good and works correctly
- [ ] All links are working
- [ ] No broken images or assets
- [ ] Cloudflare DNS is configured (see [cloudflare-dns.md](cloudflare-dns.md))

## 🔍 Troubleshooting

| Issue                     | Solution                         |
| ------------------------- | -------------------------------- |
| Experimental not updating | Check Actions tab, wait 1-2 min  |
| Production not updating   | Verify DNS, check Actions tab    |
| 404 errors                | Wait for GitHub Pages to rebuild |
| Wrong domain              | Check which branch you pushed to |

## 📚 Documentation

- **Full workflow guide**: [deployment.md](deployment.md)
- **DNS setup**: [cloudflare-dns.md](cloudflare-dns.md)
- **GitHub Actions**: `.github/workflows/deploy.yml`

## ⚡ Pro Tips

1. **Always test on experimental first** - Never push untested changes to main
2. **Use pull requests** - Create PRs from feature branches to experimental
3. **Review before merging** - Always review changes on experimental before promoting to main
4. **Keep branches in sync** - Regularly merge main back to experimental to avoid conflicts

## 🆘 Need Help?

- Check the Actions tab: https://github.com/Zedonkay/zedonkay.github.io/actions
- View deployment logs for errors
- Review the full documentation in [deployment.md](deployment.md)
