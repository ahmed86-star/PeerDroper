# 🌐 DNS Configuration Guide for droppyx.org

## Overview
This guide will help you configure DNS records at your domain registrar to point **droppyx.org** to your Vercel deployment.

---

## Step 1: Locate Your DNS Settings

### Where to find DNS settings:

| Registrar | Location |
|-----------|----------|
| **Namecheap** | Domain List → Manage → Advanced DNS |
| **GoDaddy** | My Products → Domains → DNS |
| **Google Domains** | My Domains → Manage → DNS |
| **Cloudflare** | Select Domain → DNS |
| **Porkbun** | Domain Management → DNS |
| **Name.com** | My Account → Domains → Manage DNS |

---

## Step 2: DNS Records to Add

### Option A: Using Vercel's DNS (Recommended - Easier)

1. **In Vercel Dashboard**:
   - Go to your project → **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `droppyx.org`
   - Click **Add**

2. **Vercel will provide nameservers**:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

3. **At your registrar**:
   - Go to domain settings
   - Look for "Nameservers" or "Custom DNS"
   - Change from default nameservers to:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   - Save changes

4. **Wait for propagation** (5 minutes - 48 hours)

✅ **Advantages**: Automatic SSL, faster propagation, no manual A/CNAME records needed

---

### Option B: Using Your Registrar's DNS (Manual Configuration)

If you prefer to keep your current nameservers:

#### 1. A Record (Root Domain)
```
Type: A
Name: @ (or leave blank for root)
Value: 76.76.21.21
TTL: 3600 (or Auto)
```

#### 2. CNAME Record (www subdomain)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

#### 3. Optional: CNAME for subdomain redirects
```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
TTL: 3600
```

---

## Step 3: Configure Domain in Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **Add**
5. Enter: `droppyx.org`
6. Click **Add**

### Add www subdomain (optional but recommended):
7. Click **Add** again
8. Enter: `www.droppyx.org`
9. Click **Add**

### Configure redirect:
10. Set `www.droppyx.org` to redirect to `droppyx.org` (or vice versa)
11. Vercel will automatically handle this

---

## Step 4: Verify DNS Configuration

### Using Command Line (Terminal/PowerShell)

#### Check A Record:
```bash
nslookup droppyx.org
# Should return: 76.76.21.21
```

#### Check CNAME Record:
```bash
nslookup www.droppyx.org
# Should return: cname.vercel-dns.com
```

### Using Online Tools:
- [DNS Checker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)
- [Google DNS Lookup](https://dns.google/)

Enter `droppyx.org` to see propagation status worldwide.

---

## Step 5: SSL/HTTPS Configuration

Vercel automatically provisions SSL certificates for your domain.

### Automatic SSL Setup:
1. After DNS is configured and propagated
2. Vercel will automatically request a Let's Encrypt certificate
3. This usually takes 1-5 minutes
4. Check status: **Settings** → **Domains** → look for 🔒 icon

### Force HTTPS:
Vercel automatically redirects HTTP → HTTPS. No configuration needed!

---

## DNS Propagation Timeline

| Provider | Typical Time |
|----------|--------------|
| **Cloudflare** | 1-5 minutes |
| **Vercel Nameservers** | 5-15 minutes |
| **Most Registrars** | 1-6 hours |
| **Some Registrars** | Up to 48 hours |

**Tip**: Clear your browser cache and use incognito mode to test without caching.

---

## Complete DNS Configuration Examples

### Example 1: Namecheap
```
Type    Host    Value                   TTL
A       @       76.76.21.21            Automatic
CNAME   www     cname.vercel-dns.com   Automatic
```

### Example 2: Cloudflare
```
Type    Name            Content                 Proxy Status
A       droppyx.org     76.76.21.21            DNS only
CNAME   www             cname.vercel-dns.com   DNS only
```

⚠️ **Important for Cloudflare**: 
- Set Proxy Status to "DNS only" (grey cloud)
- If using "Proxied" (orange cloud), you may need additional configuration

### Example 3: GoDaddy
```
Type    Name    Value                   TTL
A       @       76.76.21.21            1 Hour
CNAME   www     cname.vercel-dns.com   1 Hour
```

---

## Verification Checklist

After configuring DNS, verify:

- [ ] `droppyx.org` resolves to Vercel IP (76.76.21.21)
- [ ] `www.droppyx.org` resolves to `cname.vercel-dns.com`
- [ ] HTTPS works: `https://droppyx.org` shows 🔒
- [ ] `http://droppyx.org` redirects to `https://droppyx.org`
- [ ] `www.droppyx.org` redirects to `droppyx.org` (or vice versa)
- [ ] No certificate warnings in browser

---

## Troubleshooting

### Issue: "Invalid Configuration" in Vercel
**Cause**: DNS records not propagated yet
**Solution**: 
1. Wait 15-30 minutes
2. Check DNS with `nslookup droppyx.org`
3. Click "Refresh" in Vercel dashboard

### Issue: Certificate errors (NET::ERR_CERT_AUTHORITY_INVALID)
**Cause**: SSL certificate not issued yet
**Solution**:
1. Wait 5-10 minutes after DNS propagation
2. Check **Settings** → **Domains** for certificate status
3. If stuck, remove domain and re-add it

### Issue: "This domain is not registered with Vercel"
**Cause**: Domain not added to Vercel project
**Solution**:
1. Go to **Settings** → **Domains**
2. Click **Add**
3. Enter `droppyx.org`

### Issue: DNS changes not taking effect
**Solutions**:
1. **Clear DNS cache** (local computer):
   ```bash
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

2. **Check with different DNS servers**:
   ```bash
   # Google DNS
   nslookup droppyx.org 8.8.8.8
   
   # Cloudflare DNS
   nslookup droppyx.org 1.1.1.1
   ```

3. **Use online DNS checker**:
   - https://dnschecker.org/
   - Enter `droppyx.org`
   - Check multiple locations

### Issue: Website showing old Railway deployment
**Cause**: DNS still pointing to Railway
**Solution**:
1. Verify DNS records are correct
2. Check TTL (Time To Live) - may need to wait
3. Clear browser cache
4. Try different browser or incognito mode

---

## Migration from Railway DNS

If you previously had DNS pointing to Railway:

### Step 1: Find existing records
```bash
nslookup droppyx.org
# Note the current IP
```

### Step 2: Check Railway DNS
Railway might have configured:
- **A Record**: Your Railway app IP
- **CNAME**: `your-app.up.railway.app`

### Step 3: Replace with Vercel records
1. Delete old Railway A record
2. Delete old Railway CNAME
3. Add new Vercel A record: `76.76.21.21`
4. Add new Vercel CNAME: `cname.vercel-dns.com`

---

## Testing After Configuration

### 1. Test DNS Resolution
```bash
# Check root domain
nslookup droppyx.org

# Check www subdomain
nslookup www.droppyx.org

# Check with specific DNS server
nslookup droppyx.org 8.8.8.8
```

### 2. Test HTTP/HTTPS
```bash
# Test HTTP redirect
curl -I http://droppyx.org

# Test HTTPS
curl -I https://droppyx.org

# Test www redirect
curl -I https://www.droppyx.org
```

### 3. Test in Browser
1. Open incognito/private window
2. Visit: `https://droppyx.org`
3. Check for 🔒 in address bar
4. Verify your app loads correctly

### 4. Test from different locations
- Use [Website Planet Multi-Location Test](https://www.websiteplanet.com/webtools/responsive-checker/)
- Or ask someone in a different country to test

---

## Advanced: Custom Email with Domain

If you want email@droppyx.org:

### Option 1: Vercel Email (not available)
Vercel doesn't provide email hosting.

### Option 2: Google Workspace
1. Sign up: https://workspace.google.com/
2. Add MX records provided by Google
3. Keep A and CNAME records for Vercel

### Option 3: Cloudflare Email Routing (Free)
1. Move nameservers to Cloudflare
2. Enable Email Routing
3. Forward to your personal email

### Example MX Records (Google Workspace):
```
Type    Name    Priority    Value
MX      @       1           aspmx.l.google.com
MX      @       5           alt1.aspmx.l.google.com
MX      @       5           alt2.aspmx.l.google.com
MX      @       10          alt3.aspmx.l.google.com
MX      @       10          alt4.aspmx.l.google.com
```

---

## Final Checklist

Before marking migration complete:

- [ ] DNS A record points to 76.76.21.21
- [ ] DNS CNAME for www points to cname.vercel-dns.com
- [ ] Domain added in Vercel dashboard
- [ ] SSL certificate issued (🔒 icon in Vercel)
- [ ] https://droppyx.org loads correctly
- [ ] https://www.droppyx.org redirects properly
- [ ] No certificate warnings
- [ ] Test from multiple devices/networks
- [ ] Test from different geographic locations
- [ ] Old Railway deployment can be shut down

---

## Getting Help

### Vercel Support:
- Documentation: https://vercel.com/docs/concepts/projects/domains
- Support: support@vercel.com
- Community: https://github.com/vercel/vercel/discussions

### DNS Issues:
- Check registrar's support documentation
- Use DNS diagnostic tools
- Contact registrar support if stuck

---

**Last Updated**: December 28, 2025
**Domain**: droppyx.org
**Platform**: Vercel

