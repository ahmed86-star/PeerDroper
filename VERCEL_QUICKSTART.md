# 🚀 Quick Start: Deploy to Vercel

**5-Minute Setup Guide** | Full details in `VERCEL_MIGRATION_PLAN.md`

---

## ⚠️ Before You Start

Your app uses **WebSockets** and **large file uploads (100MB)** which are NOT compatible with Vercel serverless.

**Quick Options:**
1. **Deploy anyway** → Basic features work, WebSockets & large uploads fail
2. **Use Pusher** → $0-49/mo, full WebSocket support
3. **Keep Railway** → Hybrid deployment, $5-20/mo
4. **Read full plan** → See `COMPATIBILITY_SOLUTIONS.md`

For this quick start, we'll do **Option 1** (deploy and fix later).

---

## Step 1: Push to GitHub (2 minutes)

```bash
# If not using Git yet
git init
git add .
git commit -m "Prepare for Vercel deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

---

## Step 2: Deploy to Vercel (3 minutes)

1. Go to **https://vercel.com/new**
2. Click **Import** your GitHub repo
3. Configure:
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `dist/public`
4. **Add Environment Variable**:
   - Key: `DATABASE_URL`
   - Value: (copy from Railway)
5. Click **Deploy**

---

## Step 3: Configure DNS (5-60 minutes wait time)

### At your domain registrar (droppyx.org):

**Option A: Vercel Nameservers** (Recommended)
```
Nameserver 1: ns1.vercel-dns.com
Nameserver 2: ns2.vercel-dns.com
```

**Option B: Manual DNS**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### In Vercel Dashboard:
1. **Settings** → **Domains**
2. Add: `droppyx.org`
3. Wait for DNS propagation ☕

---

## Step 4: Verify (2 minutes)

```bash
# Check DNS
nslookup droppyx.org

# Should return: 76.76.21.21
```

Visit: **https://droppyx.org** 🎉

---

## What Works / What Doesn't

### ✅ Working:
- Static frontend
- API endpoints
- Database connections
- QR generator
- Image converter
- Small file uploads (<4.5MB)

### ❌ Not Working (expected):
- WebSocket connections (real-time features)
- Large file uploads (>4.5MB)

---

## Next Steps

1. **Fix WebSockets**: Read `COMPATIBILITY_SOLUTIONS.md` → Use Pusher
2. **Fix File Uploads**: Use Vercel Blob or S3
3. **Or**: Use hybrid deployment (keep Railway for these features)

---

## Files Created for You

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel configuration |
| `api/index.ts` | Serverless function entry point |
| `VERCEL_MIGRATION_PLAN.md` | Complete migration guide |
| `DNS_CONFIGURATION.md` | Detailed DNS setup |
| `ENVIRONMENT_VARIABLES.md` | Environment variables guide |
| `COMPATIBILITY_SOLUTIONS.md` | WebSocket & upload solutions |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |

---

## Quick Commands

```bash
# Test build locally
npm run build:vercel

# Deploy with Vercel CLI
npm i -g vercel
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs --follow
```

---

## Environment Variables Needed

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

That's it for basic deployment! 🎉

---

## Need Help?

- **Full guide**: Read `VERCEL_MIGRATION_PLAN.md`
- **DNS issues**: See `DNS_CONFIGURATION.md`
- **WebSocket/Upload issues**: See `COMPATIBILITY_SOLUTIONS.md`
- **Vercel docs**: https://vercel.com/docs

---

## Troubleshooting

### Build fails
```bash
# Check locally
npm run build:vercel

# Check environment variables
vercel env ls
```

### Domain not working
```bash
# Check DNS
nslookup droppyx.org

# Wait 15-60 minutes for propagation
```

### Database errors
- Verify `DATABASE_URL` in Vercel dashboard
- Check format includes `?sslmode=require`

---

**Time to deploy**: ~10 minutes + DNS wait time
**Cost**: Free tier (then $20/mo Pro if you need it)
**Difficulty**: Easy ⭐⭐☆☆☆

Good luck! 🚀

