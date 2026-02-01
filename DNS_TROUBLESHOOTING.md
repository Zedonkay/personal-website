# DNS Troubleshooting Guide for ishayushikhare.com

## Current Issue

The domain `ishayushikhare.com` is showing `DNS_PROBE_FINISHED_NXDOMAIN` error, which means the domain cannot be resolved at the DNS level.

## Important Information

**Domain Registration**: This domain was registered through **Cloudflare Registrar**.

When domains are registered through Cloudflare Registrar, nameservers are automatically configured - no manual nameserver updates are needed. The issue is likely one of the scenarios below.

## Root Cause Analysis

While DNS A records have been added in Cloudflare dashboard, the domain is not resolving. For domains registered with Cloudflare, this indicates one of the following issues:

### 1. Domain Registration Still Pending (MOST LIKELY for new domains)

**Problem**: Domain was recently registered through Cloudflare and the registration is still being processed or propagated.

**Timeline**: New domain registrations can take:
- **Initial registration**: 15 minutes - 2 hours
- **Full DNS propagation**: 24-48 hours for global visibility

**Solution**: Check domain registration status:

#### Steps to Check:

1. **Check domain status in Cloudflare:**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to **Domain Registration** (not just DNS)
   - Select `ishayushikhare.com`
   - Look for status indicators:
     - ✅ "Active" = registration complete
     - ⏳ "Pending" or "Processing" = wait for completion
     - ⚠️ Any warnings or errors = follow the instructions shown

2. **Verify domain appears in WHOIS:**
   ```bash
   whois ishayushikhare.com
   ```
   - If WHOIS returns "No match for domain" → registration still processing
   - If WHOIS shows registration details → registration is active

3. **Check registration email:**
   - Check the email associated with your Cloudflare account
   - Look for domain registration confirmation from Cloudflare
   - Some TLDs (.com, .net, etc.) require email verification

4. **Wait for initial propagation:**
   - If domain was just registered (within last 24 hours), wait 24-48 hours
   - Check status periodically at: https://dnschecker.org/#A/ishayushikhare.com

### 2. DNS Records Configuration Issue

**Problem**: The domain zone might not be properly activated in Cloudflare.

**Solution**: Verify domain zone is active:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select `ishayushikhare.com` from your domain list
3. Check the **Overview** page for:
   - Zone status should be "Active"
   - Any error messages or warnings
4. If zone shows as "Pending" or "Moved":
   - Click on the domain and follow any setup instructions
   - Ensure domain registration is complete

### 3. Incorrect DNS Record Configuration

**Problem**: The DNS A records might be configured incorrectly.

**Current Configuration** (as provided):
```
Type: A
Name: ishayushikhare.com
Content: 185.199.108.153
Content: 185.199.109.153
Content: 185.199.110.153
Content: 185.199.111.153
Proxy Status: DNS only
```

**Correct Configuration**:
```
Type: A
Name: @ (or ishayushikhare.com)
Content: 185.199.108.153
Proxy Status: DNS only (gray cloud)

Type: A
Name: @ (or ishayushikhare.com)
Content: 185.199.109.153
Proxy Status: DNS only (gray cloud)

Type: A
Name: @ (or ishayushikhare.com)
Content: 185.199.110.153
Proxy Status: DNS only (gray cloud)

Type: A
Name: @ (or ishayushikhare.com)
Content: 185.199.111.153
Proxy Status: DNS only (gray cloud)
```

**Note**: In Cloudflare, `@` represents the apex/root domain. It should show as `ishayushikhare.com` in the Name column after saving.

## Verification Steps

Once the domain registration is complete and DNS has propagated:

### 1. Check Nameservers
```bash
dig NS ishayushikhare.com +short
# or
nslookup -type=NS ishayushikhare.com
```

Expected output should include Cloudflare nameservers (e.g., `*.ns.cloudflare.com`)

### 2. Check A Records
```bash
dig ishayushikhare.com A +short
# or
nslookup ishayushikhare.com
```

Expected output should show one or more of:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### 3. Test Website Access
```bash
curl -I https://ishayushikhare.com
# or
curl -I http://ishayushikhare.com
```

This should return HTTP headers if the site is accessible.

### 4. Online DNS Checker
Visit: https://dnschecker.org/#A/ishayushikhare.com

This will show you the DNS propagation status across different global locations.

## GitHub Pages Configuration

The repository is already correctly configured:

✅ **CNAME File**: Contains `ishayushikhare.com`  
✅ **_config.yml**: URL set to `https://ishayushikhare.com`  
✅ **Deployment**: Working correctly to gh-pages branch  
✅ **GitHub Pages Settings**: Should auto-configure once DNS resolves

## Expected Timeline

**For domains registered with Cloudflare Registrar:**

1. **Initial Domain Registration**: 15 minutes - 2 hours after purchase
2. **DNS Propagation**: 24-48 hours for global propagation (can work sooner in many locations)
3. **SSL Certificate**: GitHub Pages will automatically provision an SSL certificate once DNS is working (can take 1-24 hours after DNS is active)

**Note**: Newly registered domains typically take 24-48 hours to be fully accessible worldwide. This is normal and cannot be accelerated.

## Common Issues and Solutions

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN" persists after 48 hours

**Possible causes (for Cloudflare Registrar domains):**
- Domain registration incomplete or payment pending
- Domain requires email verification (check your email)
- DNS zone not properly activated
- Cloudflare account or domain has issues

**Solution:**
1. Log in to Cloudflare Dashboard → Domain Registration
2. Check domain status and complete any pending actions
3. Verify payment was processed
4. Check email for domain verification requests
5. Contact Cloudflare support if status shows as "Active" but DNS still not resolving

### Issue: "This site can't provide a secure connection"

**Possible causes:**
- SSL certificate not yet provisioned by GitHub Pages
- DNS working but GitHub Pages needs more time

**Solution:**
1. Wait 24 hours for SSL certificate provisioning
2. Verify the CNAME file is present in the gh-pages branch
3. Check GitHub Pages settings in repository Settings → Pages

### Issue: Site works but shows GitHub 404 error

**Possible causes:**
- Custom domain not configured in GitHub Pages settings
- CNAME file missing from gh-pages branch

**Solution:**
1. Go to repository Settings → Pages
2. Verify custom domain is set to `ishayushikhare.com`
3. Check that CNAME file exists in gh-pages branch

## Quick Action Checklist

Use this checklist to resolve the DNS issue for Cloudflare Registrar domains:

- [ ] Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [ ] Go to **Domain Registration** and check status of ishayushikhare.com
- [ ] Verify domain status shows "Active" (not "Pending" or "Processing")
- [ ] Check email for any domain verification requests from Cloudflare
- [ ] Verify DNS A records are configured correctly (4 GitHub Pages IPs)
- [ ] Run `whois ishayushikhare.com` to confirm domain is registered
- [ ] Wait 24-48 hours for DNS propagation if domain was recently registered
- [ ] Check DNS propagation at https://dnschecker.org/#A/ishayushikhare.com
- [ ] Once DNS works, verify A records with `dig ishayushikhare.com A +short`
- [ ] Test site access with browser (might need to wait for SSL)
- [ ] Enable "Enforce HTTPS" in GitHub Pages settings once SSL is ready

## Resources

- [Cloudflare: Change Nameservers](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [GitHub Pages: Custom Domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [DNS Checker Tool](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)

## Support

If you've followed all steps and the issue persists after 48 hours:

1. **Domain Registrar Support**: Verify nameservers are correctly updated
2. **Cloudflare Support**: Verify domain is active and DNS records are correct
3. **GitHub Support**: Verify Pages configuration (rarely needed)

## Current Repository Status

✅ **Repository Configuration**: Correct  
✅ **CNAME File**: Present and correct (`ishayushikhare.com`)  
✅ **Deployment Workflow**: Working  
✅ **gh-pages Branch**: Contains correct CNAME file  
⏳ **DNS Resolution**: Not working - **Domain registered with Cloudflare - waiting for DNS propagation (24-48 hours for new domains)**

Once the domain registration is complete and DNS has propagated, the site should work automatically without any changes to the repository.
