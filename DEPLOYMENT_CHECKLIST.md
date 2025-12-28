# ✅ Vercel Deployment Checklist for droppyx.org

## Pre-Deployment Checklist

### ☑️ Code Preparation
- [x] `vercel.json` configuration created
- [x] `api/index.ts` serverless function created
- [x] `package.json` build scripts updated
- [x] `.gitignore` updated with environment files
- [ ] Remove Replit-specific plugins from production build
- [ ] Test build locally: `npm run build:vercel`
- [ ] Commit all changes to Git

### ☑️ Environment Variables
- [ ] Copy `DATABASE_URL` from Railway
- [ ] Verify database connection string format
- [ ] Prepare list of all required env vars (see `ENVIRONMENT_VARIABLES.md`)

### ☑️ Domain Preparation
- [ ] Have access to domain registrar (droppyx.org)
- [ ] Know where DNS settings are located
- [ ] Read `DNS_CONFIGURATION.md`

---

## Step 1: Code Repository Setup

### 1.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Create repository (e.g., `peerdrop-app`)
3. Don't initialize with README (already have one)

### 1.3 Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/yourusername/peerdrop-app.git
git push -u origin main
```

---

## Step 2: Vercel Account Setup

### 2.1 Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your repositories

### 2.2 Install Vercel CLI (optional but recommended)
```bash
npm install -g vercel
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project
1. Go to https://vercel.com/new
2. Click **Import Project**
3. Select your GitHub repository
4. Click **Import**

### 3.2 Configure Build Settings
Vercel should auto-detect settings, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Other |
| **Build Command** | `npm run build:vercel` |
| **Output Directory** | `dist/public` |
| **Install Command** | `npm install` |
| **Node Version** | 20.x (automatic) |

### 3.3 Add Environment Variables
1. Click **Environment Variables**
2. Add `DATABASE_URL`:
   - Key: `DATABASE_URL`
   - Value: (paste from Railway)
   - Environments: ✅ Production, ✅ Preview, ✅ Development
3. Click **Add**

### 3.4 Deploy
1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Note the deployment URL (e.g., `your-app-abc123.vercel.app`)

---

## Step 4: Test Preview Deployment

### 4.1 Test API Endpoints
```bash
# Replace with your actual preview URL
curl https://your-app-abc123.vercel.app/api/devices
```

### 4.2 Test in Browser
1. Open preview URL in browser
2. Test main functionality:
   - [ ] Homepage loads
   - [ ] Device discovery works
   - [ ] File sharing UI appears
   - [ ] QR generator/scanner loads

### 4.3 Check Vercel Logs
```bash
# Using CLI
vercel logs https://your-app-abc123.vercel.app

# Or in Dashboard:
# Project → Deployments → Select deployment → Logs
```

### 4.4 Known Limitations to Verify
- ⚠️ WebSocket connections will fail (expected)
- ⚠️ File uploads >4.5MB will fail (expected)
- ✅ API endpoints should work
- ✅ Static file serving should work

---

## Step 5: Configure Custom Domain

### 5.1 Add Domain in Vercel
1. Go to **Project Settings** → **Domains**
2. Click **Add**
3. Enter: `droppyx.org`
4. Click **Add**

### 5.2 Add www Subdomain
1. Click **Add** again
2. Enter: `www.droppyx.org`
3. Configure redirect: `www.droppyx.org` → `droppyx.org`

### 5.3 Note DNS Instructions
Vercel will show required DNS records. Note them down.

---

## Step 6: Configure DNS Records

### Option A: Vercel Nameservers (Recommended)

At your domain registrar:
1. Find "Nameservers" or "Custom DNS" section
2. Change to:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
3. Save changes
4. Wait 5-60 minutes for propagation

### Option B: Manual A/CNAME Records

At your domain registrar:
1. **Add A Record**:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600
   ```

2. **Add CNAME Record**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. Save changes
4. Wait 15-60 minutes for propagation

---

## Step 7: Verify DNS Propagation

### 7.1 Check DNS Resolution
```bash
# Windows PowerShell
nslookup droppyx.org

# Should return: 76.76.21.21
```

### 7.2 Online DNS Checker
1. Go to https://dnschecker.org/
2. Enter: `droppyx.org`
3. Wait until most locations show Vercel IP

### 7.3 Check in Vercel Dashboard
1. Go to **Settings** → **Domains**
2. Look for green checkmark ✅ next to domain
3. Look for 🔒 icon (SSL certificate issued)

---

## Step 8: SSL/HTTPS Verification

### 8.1 Wait for SSL Certificate
- Usually takes 1-5 minutes after DNS propagation
- Check status in **Settings** → **Domains**
- Look for 🔒 icon

### 8.2 Test HTTPS
```bash
curl -I https://droppyx.org
# Should return: HTTP/2 200
```

### 8.3 Test Redirect
```bash
curl -I http://droppyx.org
# Should redirect to: https://droppyx.org
```

---

## Step 9: Production Testing

### 9.1 Functional Testing
- [ ] Visit https://droppyx.org
- [ ] Test device discovery
- [ ] Test messaging panel
- [ ] Test QR code generation
- [ ] Test image converter
- [ ] Test file sharing (within 4.5MB limit)
- [ ] Check all UI components load correctly

### 9.2 Performance Testing
- [ ] Check page load speed (should be <2 seconds)
- [ ] Test from different devices (mobile, tablet, desktop)
- [ ] Test from different browsers (Chrome, Firefox, Safari, Edge)

### 9.3 Cross-Location Testing
- [ ] Test from different geographic locations
- [ ] Use VPN or ask friends in other countries
- [ ] Check https://www.websiteplanet.com/webtools/responsive-checker/

---

## Step 10: Post-Deployment

### 10.1 Monitor Logs
```bash
# Real-time logs
vercel logs --follow

# Or in dashboard:
# Project → Logs
```

### 10.2 Set Up Alerts (Optional)
1. Vercel **Settings** → **Notifications**
2. Enable email notifications for:
   - Deployment failures
   - Domain issues
   - High error rates

### 10.3 Update Documentation
- [ ] Update README.md with new domain
- [ ] Document any changes made during deployment
- [ ] Note any features disabled (WebSockets, large uploads)

---

## Step 11: Railway Cleanup (Optional)

### ⚠️ Only after confirming Vercel works perfectly!

### 11.1 Backup Railway Data
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Or use Railway CLI
railway run pg_dump > backup.sql
```

### 11.2 Keep or Delete Railway Project
**Option 1: Keep Railway for WebSockets**
- Use hybrid deployment
- Keep Railway for `/ws` endpoint
- Configure CORS for Vercel frontend

**Option 2: Fully Migrate**
- Delete Railway project
- Migrate to Pusher/Ably for WebSockets
- Use Vercel Blob for file storage

---

## Troubleshooting

### Build Fails on Vercel

**Error**: "Cannot find module..."
```bash
# Solution: Check dependencies
npm install
npm run build:vercel
```

**Error**: "DATABASE_URL must be set"
```bash
# Solution: Add env var in Vercel dashboard
# Settings → Environment Variables → Add DATABASE_URL
```

### Domain Not Working

**Issue**: "This domain is not registered with Vercel"
- Wait for DNS propagation (up to 48 hours)
- Clear browser cache: `Ctrl+Shift+Delete`
- Check DNS with `nslookup droppyx.org`

### SSL Certificate Issues

**Issue**: Certificate not issuing
- Wait 10 minutes after DNS propagation
- Remove and re-add domain in Vercel
- Check DNS points correctly to Vercel

### WebSocket Connection Fails

**Expected**: WebSockets don't work on Vercel serverless
**Solutions**:
1. Use Vercel Edge Functions (experimental)
2. Migrate to Pusher/Ably
3. Keep WebSockets on Railway (hybrid)
4. Use Server-Sent Events (SSE)

---

## Rollback Plan

If something goes wrong:

### 1. Quick Rollback (DNS)
1. Go to domain registrar
2. Change DNS back to Railway:
   ```
   Type: CNAME
   Name: @
   Value: your-app.up.railway.app
   ```
3. Wait for propagation

### 2. Rollback Deployment
```bash
# Using Vercel CLI
vercel rollback <deployment-url>

# Or in dashboard:
# Deployments → Previous deployment → Promote to Production
```

### 3. Keep Railway Running
- Don't delete Railway project until Vercel is stable
- Keep Railway project for at least 7 days after migration

---

## Success Criteria

Deployment is successful when:

- ✅ https://droppyx.org loads correctly
- ✅ SSL certificate is valid (🔒 in browser)
- ✅ All static assets load
- ✅ API endpoints respond correctly
- ✅ Database connections work
- ✅ No console errors in browser
- ✅ Mobile responsive design works
- ✅ SEO meta tags are correct
- ✅ Performance is acceptable (Lighthouse score >80)

---

## Next Steps After Successful Deployment

1. **Monitor for 24-48 hours**
   - Check Vercel logs daily
   - Monitor error rates
   - Watch for user-reported issues

2. **Implement Missing Features**
   - Decide on WebSocket solution
   - Implement large file upload solution
   - Set up proper session management

3. **Performance Optimization**
   - Enable Vercel Speed Insights
   - Optimize images with Vercel Image Optimization
   - Set up CDN caching rules

4. **Security Hardening**
   - Set up rate limiting
   - Configure CORS properly
   - Enable security headers

5. **Backup Strategy**
   - Set up automated database backups
   - Document recovery procedures
   - Test backup restoration

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: support@vercel.com
- **GitHub Issues**: Create issue in your repo
- **Community**: Vercel Discord, GitHub Discussions

---

**Last Updated**: December 28, 2025
**Project**: PeerDroper
**Domain**: droppyx.org
**Platform**: Vercel

**✅ Ready to deploy!**

