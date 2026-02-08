# GitHub Pages Setup Guide

## Overview

This guide will help you configure GitHub Pages for ishayushikhare.com. The repository uses a custom deployment workflow that builds the Jekyll site and deploys it to the `gh-pages` branch.

## Problem

If you see "There isn't a GitHub Pages site here" when visiting ishayushikhare.com, it means GitHub Pages is not properly configured in the repository settings.

## Solution: Enable GitHub Pages

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to your repository: https://github.com/Zedonkay/personal-website
2. Click on **Settings** (gear icon in the top navigation)
3. Scroll down and click on **Pages** in the left sidebar
4. Under **Source**, configure the following:
   - **Branch**: Select `gh-pages` from the dropdown
   - **Folder**: Select `/ (root)` from the dropdown
   - Click **Save**

### Step 2: Configure Custom Domain

After enabling Pages:

1. Still in the **Pages** settings section
2. Under **Custom domain**, enter: `ishayushikhare.com`
3. Click **Save**
4. Wait a few moments for the DNS check to complete
5. Once DNS is verified, check the box for **Enforce HTTPS**

### Step 3: Verify DNS Configuration

Make sure your DNS is configured correctly (see `CLOUDFLARE_DNS_SETUP.md` for detailed instructions):

**Required A Records for ishayushikhare.com:**

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

You can check if DNS is configured correctly:

```bash
dig ishayushikhare.com +short
```

This should return the four GitHub Pages IP addresses listed above.

### Step 4: Wait for Deployment

1. Go to the **Actions** tab in your repository
2. Check that the latest deployment workflow has completed successfully
3. Wait 1-2 minutes for GitHub Pages to update
4. Visit https://ishayushikhare.com to verify the site is live

## How It Works

The repository uses a branch-based deployment strategy:

- **main branch**: Source code for production site
  - Triggers `deploy.yml` workflow on push
  - Builds Jekyll site to `_site` directory
  - Deploys `_site` contents to `gh-pages` branch of this repository
  - GitHub Pages serves from `gh-pages` branch at https://ishayushikhare.com

- **experimental branch**: Source code for staging site
  - Deploys to the `Zedonkay/zedonkay.github.io` repository (a separate GitHub Pages user site)
  - Accessible at: https://zedonkay.github.io (no DNS setup needed)

## Troubleshooting

### "There isn't a GitHub Pages site here"

**Cause**: GitHub Pages is not enabled or configured incorrectly.

**Solution**: Follow Step 1 above to enable GitHub Pages from the `gh-pages` branch.

### Custom domain shows "GitHub Pages site is improperly configured"

**Cause**: DNS records are not configured correctly.

**Solution**: Follow `CLOUDFLARE_DNS_SETUP.md` to configure DNS records in Cloudflare.

### Site shows old content or doesn't update

**Cause**: Deployment may have failed or is still in progress.

**Solution**:

1. Check the **Actions** tab for failed workflows
2. Clear your browser cache
3. Try visiting in incognito/private mode
4. Wait 5-10 minutes for changes to propagate

### HTTPS certificate errors

**Cause**: HTTPS enforcement is enabled before DNS has fully propagated.

**Solution**:

1. Wait for DNS to fully propagate (use https://dnschecker.org)
2. Temporarily disable "Enforce HTTPS" if needed
3. Re-enable after DNS is verified globally

## Quick Check Commands

```bash
# Check if DNS is configured correctly
dig ishayushikhare.com +short

# Check if CNAME file exists in gh-pages branch
git show gh-pages:CNAME

# Check latest deployment
gh workflow view deploy

# Check Pages status (requires gh CLI with authentication)
gh api repos/Zedonkay/personal-website/pages
```

## Important Files

- `CNAME`: Contains the custom domain (ishayushikhare.com)
- `.nojekyll`: Tells GitHub Pages not to process with Jekyll (site is pre-built)
- `.github/workflows/deploy.yml`: Automated deployment workflow

## References

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Configuring a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
