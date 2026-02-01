# DNS Troubleshooting Guide for ishayushikhare.com

## Current Issue

The domain `ishayushikhare.com` is showing `DNS_PROBE_FINISHED_NXDOMAIN` error, which means the domain cannot be resolved at the DNS level.

## Root Cause Analysis

While DNS A records have been added in Cloudflare dashboard, the domain is not resolving. This indicates one of the following issues:

### 1. Nameservers Not Updated at Domain Registrar (MOST LIKELY)

**Problem**: The domain registrar (e.g., GoDaddy, Namecheap, Google Domains, etc.) still has the old nameservers and is not pointing to Cloudflare nameservers.

**Solution**: Update the nameservers at your domain registrar to point to Cloudflare.

#### Steps to Fix:

1. **Find your Cloudflare nameservers:**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Select the domain `ishayushikhare.com`
   - Go to **DNS** section
   - Look for "Cloudflare Nameservers" section (usually on the right side or in Overview tab)
   - You should see 2 nameservers like:
     ```
     example.ns.cloudflare.com
     another.ns.cloudflare.com
     ```

2. **Update nameservers at your domain registrar:**
   - Log in to your domain registrar (where you purchased ishayushikhare.com)
   - Find the "Nameservers" or "DNS Settings" section
   - Replace the existing nameservers with the Cloudflare nameservers from step 1
   - Save the changes

3. **Wait for propagation:**
   - Nameserver changes can take 24-48 hours to propagate globally
   - You can check the status with:
     ```bash
     dig NS ishayushikhare.com +short
     ```
   - This should return your Cloudflare nameservers once updated

### 2. Domain Not Fully Added to Cloudflare

**Problem**: The domain might be in a pending state in Cloudflare.

**Solution**: Complete the domain setup in Cloudflare:

1. Go to Cloudflare Dashboard
2. Check if there's a banner saying "Complete nameserver setup"
3. Follow the instructions to complete the setup
4. Verify the nameservers are correctly shown

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

Once you've updated the nameservers and waited for propagation:

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

1. **Nameserver Update**: 5 minutes - 48 hours (typically 2-8 hours)
2. **DNS Record Propagation**: 5 minutes - 2 hours after nameservers are active
3. **SSL Certificate**: GitHub Pages will automatically provision an SSL certificate once DNS is working (can take 1-24 hours)

## Common Issues and Solutions

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN" persists after 48 hours

**Possible causes:**
- Nameservers still not updated at registrar
- Domain expired or suspended
- Cloudflare account has issues

**Solution:**
1. Contact your domain registrar support to verify nameservers are updated
2. Check domain expiration date
3. Contact Cloudflare support if everything else is correct

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

Use this checklist to resolve the DNS issue:

- [ ] Log in to domain registrar (where you bought ishayushikhare.com)
- [ ] Find the Cloudflare nameservers for your domain
- [ ] Update nameservers at the registrar to Cloudflare nameservers
- [ ] Wait 4-8 hours for nameserver propagation
- [ ] Verify nameservers with `dig NS ishayushikhare.com +short`
- [ ] Verify A records with `dig ishayushikhare.com A +short`
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
❌ **DNS Resolution**: Not working - **ACTION REQUIRED: Update nameservers at domain registrar**

Once the nameservers are updated and propagated, the site should work automatically without any changes to the repository.
