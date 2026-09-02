# Branch-Based Deployment Workflow

This repository uses a branch-based deployment strategy for staging and production environments.

## Deployment Strategy

### 🧪 Experimental Branch → zedonkay.github.io (Staging)

- **Branch**: `experimental`
- **URL**: https://zedonkay.github.io
- **Purpose**: Testing and development
- **Custom Domain**: None (uses default GitHub Pages URL)

### 🚀 Main Branch → ishayushikhare.com (Production)

- **Branch**: `main` (or `master`)
- **URL**: https://ishayushikhare.com
- **Purpose**: Production site
- **Custom Domain**: Configured via CNAME file

## Workflow

### 1. Development and Testing

1. Create a feature branch from `experimental`:

   ```bash
   git checkout experimental
   git pull origin experimental
   git checkout -b feature/my-new-feature
   ```

2. Make your changes and commit:

   ```bash
   git add .
   git commit -m "Add new feature"
   ```

3. Push and create a PR to `experimental`:

   ```bash
   git push origin feature/my-new-feature
   ```

   Then create a pull request targeting the `experimental` branch.

4. Once merged to `experimental`, the site automatically deploys to **zedonkay.github.io**

5. Test your changes at https://zedonkay.github.io

### 2. Promoting to Production

Once you've tested and verified changes on the experimental branch:

1. Create a PR from `experimental` to `main`:

   ```bash
   git checkout experimental
   git pull origin experimental
   git checkout main
   git pull origin main
   git merge experimental
   git push origin main
   ```

   Or create a pull request from `experimental` to `main` on GitHub.

2. Once merged to `main`, the site automatically deploys to **ishayushikhare.com**

## How It Works

The `.github/workflows/deploy.yml` workflow handles deployments differently based on the branch:

### For `experimental` branch:

- Sets `url` in `_config.yml` to `https://zedonkay.github.io`
- Removes the `CNAME` file so GitHub Pages uses the default domain
- Deploys to the **Zedonkay/zedonkay.github.io** repository (separate site)

### For `main`/`master` branch:

- Uses `url` in `_config.yml` as `https://ishayushikhare.com`
- Keeps the `CNAME` file to enable custom domain
- Deploys to this repo's `gh-pages` branch

## Setup Instructions

### Initial Setup

1. **Create the Zedonkay/zedonkay.github.io repository** (for experimental/staging):
   - Create a new repository named `zedonkay.github.io` under the Zedonkay account
   - This serves as your user/org GitHub Pages site at https://zedonkay.github.io
   - Go to Settings → Pages and ensure it's configured to deploy from the `main` branch (or adjust `branch` in deploy.yml to match)

2. **Create a Personal Access Token (PAT) for cross-repo deployment**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate a token with `repo` scope (or at minimum `public_repo` if both repos are public)
   - Add it as a secret in **personal-website** repo: Settings → Secrets → Actions
   - Name the secret `DEPLOY_TOKEN`

3. **Create the experimental branch** (if it doesn't exist):

   ```bash
   git checkout -b experimental
   git push origin experimental
   ```

4. **Configure branch protection** (recommended):
   - Go to Settings → Branches in your repository
   - Add branch protection rules for both `main` and `experimental`
   - Require pull request reviews before merging

5. **Set up Cloudflare DNS** (for production domain):
   - Follow the instructions in [cloudflare-dns.md](cloudflare-dns.md)
   - This only affects the `main` branch deployment

### GitHub Pages Settings

**personal-website** (production at ishayushikhare.com):

1. Go to **Settings → Pages**
2. Source: Deploy from branch
3. Branch: `gh-pages` / root
4. Custom domain is configured via CNAME (deployed by workflow)

**zedonkay.github.io** (staging at zedonkay.github.io):

1. Go to **Settings → Pages** in the zedonkay.github.io repository
2. Source: Deploy from branch
3. Branch: `main` (or match whatever is in deploy.yml)

## Branch Configuration Summary

| Branch          | Domain             | CNAME File              | Purpose         |
| --------------- | ------------------ | ----------------------- | --------------- |
| `experimental`  | zedonkay.github.io | ❌ Removed during build | Staging/Testing |
| `main`/`master` | ishayushikhare.com | ✅ Present              | Production      |

## Troubleshooting

### Experimental site not updating

- Check that your changes were pushed to the `experimental` branch
- View the Actions tab to see if the deployment succeeded
- Wait 1-2 minutes for GitHub Pages to update

### Production site not updating

- Verify changes are merged to `main` branch
- Check that Cloudflare DNS is properly configured
- Clear browser cache or try incognito mode

### Custom domain issues

- Ensure DNS records are configured in Cloudflare (see [cloudflare-dns.md](cloudflare-dns.md))
- Wait for DNS propagation (typically 5-10 minutes)
- Verify CNAME file exists in the repository root

## Quick Reference Commands

```bash
# Switch to experimental for development
git checkout experimental
git pull origin experimental

# Switch to main for production hotfixes
git checkout main
git pull origin main

# Check which branch you're on
git branch

# View deployment status
# Go to: https://github.com/Zedonkay/zedonkay.github.io/actions
```

## Benefits of This Workflow

✅ **Safe Testing**: Test changes on staging before production  
✅ **Easy Rollback**: Keep production stable while experimenting  
✅ **Clear Separation**: Different URLs for different purposes  
✅ **Automated Deployment**: Push and deploy automatically  
✅ **No Manual Configuration**: Workflow handles environment differences
