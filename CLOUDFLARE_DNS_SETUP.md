# Cloudflare DNS Setup for GitHub Pages (Production Deployment)

## Current Setup - Staging/Testing Workflow

The repository is currently configured to use **zedonkay.github.io** as a testbench/staging site. This allows you to test changes before deploying to your custom production domain.

- **Staging Site**: https://zedonkay.github.io (current setup)
- **Production Site**: https://ishayushikhare.com (to be configured when ready)

## When You're Ready to Deploy to Production

Follow these steps to switch from the staging site to your custom domain:

### Step 1: Re-enable Custom Domain in Repository

1. Create a `CNAME` file in the repository root with the content:
   ```
   ishayushikhare.com
   ```

2. Update `_config.yml` and change the URL:
   ```yaml
   url: https://ishayushikhare.com
   ```

3. Commit and push these changes

### Step 2: Configure Cloudflare DNS Settings

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain: **ishayushikhare.com**
3. Go to **DNS** → **Records**

Add the following **A records** (all pointing to GitHub Pages IP addresses):

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| A | @ | 185.199.108.153 | DNS only (gray cloud) | Auto |
| A | @ | 185.199.109.153 | DNS only (gray cloud) | Auto |
| A | @ | 185.199.110.153 | DNS only (gray cloud) | Auto |
| A | @ | 185.199.111.153 | DNS only (gray cloud) | Auto |

**Important:** Set Proxy Status to "DNS only" (gray cloud icon), NOT "Proxied" (orange cloud), at least initially.

### Step 3: Add WWW CNAME Record (Optional but Recommended)
Add a CNAME record to redirect www subdomain:

| Type | Name | Content | Proxy Status | TTL |
|------|------|---------|--------------|-----|
| CNAME | www | ishayushikhare.com | DNS only (gray cloud) | Auto |

### Step 3: Verify GitHub Pages Configuration
1. Go to your repository: https://github.com/Zedonkay/zedonkay.github.io
2. Navigate to **Settings** → **Pages**
3. Verify that:
   - Source is set to deploy from **gh-pages** branch
   - Custom domain is set to **ishayushikhare.com**
   - "Enforce HTTPS" is enabled (after DNS propagates)

### Step 4: Wait for DNS Propagation
- Cloudflare typically propagates changes within 5-10 minutes
- Full global propagation usually takes 30 minutes to 2 hours
- In rare cases, it may take up to 24 hours (48 hours is extremely rare)
- You can check propagation status at: https://dnschecker.org/#A/ishayushikhare.com

### Step 5: Enable Cloudflare Proxy (Optional)
After the site is working with "DNS only":
1. You can optionally enable Cloudflare proxy (orange cloud) for:
   - DDoS protection
   - CDN caching
   - SSL/TLS encryption
2. Change the A records from "DNS only" to "Proxied"

## Verification Commands
After DNS propagation, verify the setup:

```bash
# Check A records
dig ishayushikhare.com A +short

# Check CNAME for www
dig www.ishayushikhare.com CNAME +short

# Test HTTP response
curl -I https://ishayushikhare.com
```

## References
- [GitHub Pages Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Cloudflare DNS Setup](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)

## Current Status
- ✅ CNAME file is correctly configured in the repository
- ✅ GitHub Actions deployment workflow is working
- ❌ DNS records need to be added in Cloudflare (ACTION REQUIRED)
