# Cloudflare DNS Setup for GitHub Pages (Production Deployment)

## Branch-Based Deployment Strategy

This repository uses a **branch-based deployment workflow**:

- **experimental branch** → https://zedonkay.github.io (staging/testbench)
- **main branch** → https://ishayushikhare.com (production with custom domain)

See `DEPLOYMENT_WORKFLOW.md` for complete details on how to use this workflow.

## Production Domain Setup

The following instructions are for configuring the **production** custom domain (ishayushikhare.com) which is used by the `main` branch.

The `experimental` branch automatically uses zedonkay.github.io and does not require any DNS configuration.

### Step 1: Configure DNS A Records

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain: **ishayushikhare.com**
3. Go to **DNS** → **Records**

Add the following **A records** (all pointing to GitHub Pages IP addresses):

| Type | Name | Content         | Proxy Status          | TTL  |
| ---- | ---- | --------------- | --------------------- | ---- |
| A    | @    | 185.199.108.153 | DNS only (gray cloud) | Auto |
| A    | @    | 185.199.109.153 | DNS only (gray cloud) | Auto |
| A    | @    | 185.199.110.153 | DNS only (gray cloud) | Auto |
| A    | @    | 185.199.111.153 | DNS only (gray cloud) | Auto |

**Important:** Set Proxy Status to "DNS only" (gray cloud icon), NOT "Proxied" (orange cloud), at least initially.

### Step 2: Add WWW CNAME Record (Optional but Recommended)

Add a CNAME record to redirect www subdomain:

| Type  | Name | Content            | Proxy Status          | TTL  |
| ----- | ---- | ------------------ | --------------------- | ---- |
| CNAME | www  | zedonkay.github.io | DNS only (gray cloud) | Auto |

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

- ✅ Branch-based deployment workflow configured
- ✅ Experimental branch → zedonkay.github.io (staging)
- ✅ Main branch → ishayushikhare.com (production)
- ✅ CNAME file configured for production deployments
- ✅ GitHub Actions deployment workflow working
- ❌ DNS records need to be added in Cloudflare for production domain (ACTION REQUIRED)

See `DEPLOYMENT_WORKFLOW.md` for usage instructions.
