# 🚀 Vercel Migration Plan for PeerDroper (droppyx.org)

## ⚠️ CRITICAL COMPATIBILITY ISSUES

Your application has **TWO MAJOR COMPATIBILITY ISSUES** with Vercel's serverless architecture:

### 1. **WebSocket Support** ❌
- **Issue**: Your app uses WebSockets (`ws` package) for real-time communication
- **Problem**: Vercel serverless functions DO NOT support WebSocket connections
- **Solutions**:
  - **Option A**: Use Vercel's Edge Functions with WebSocket support (experimental)
  - **Option B**: Use a third-party WebSocket service (Pusher, Ably, Socket.io with Redis adapter)
  - **Option C**: Keep WebSockets on Railway and only migrate the HTTP API to Vercel
  - **Option D**: Use Server-Sent Events (SSE) instead of WebSockets

### 2. **File Upload Limitations** ⚠️
- **Issue**: Your app allows 100MB file uploads
- **Problem**: Vercel has a **4.5MB request body limit** for serverless functions
- **Solutions**:
  - **Option A**: Use Vercel Blob Storage for large file uploads
  - **Option B**: Use AWS S3, Cloudflare R2, or similar cloud storage
  - **Option C**: Implement client-side direct uploads with presigned URLs

---

## 📋 MIGRATION CHECKLIST

### Step 1: Update `server/index.ts` for Vercel

Add this export at the end of your `server/index.ts` file (AFTER line 69):

```typescript
// Export the app for Vercel serverless
export default app;
```

This allows Vercel to use your Express app as a serverless function without changing the core logic.

### Step 2: Create Vercel API Handler

Create a new file: `api/index.ts`

```typescript
import app from '../server/index';

export default app;
```

This creates a serverless function entry point that Vercel expects.

### Step 3: Update `vercel.json`

Your `vercel.json` should be:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/public",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Step 4: Update Build Command

Verify your `package.json` build script works for Vercel:

```json
"build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=api"
```

### Step 5: Remove Replit-specific Dependencies

In `vite.config.ts`, remove or conditionally include Replit plugins:

```typescript
// Remove these from production builds:
// @replit/vite-plugin-cartographer
// @replit/vite-plugin-runtime-error-modal
```

---

## 🌐 DNS CONFIGURATION

### Add these records at your domain registrar (droppyx.org):

#### For Vercel Deployment:

1. **A Record** (for root domain):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600
   ```

2. **CNAME Record** (for www subdomain):
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Domains**
2. Add `droppyx.org` and `www.droppyx.org`
3. Vercel will automatically configure SSL/HTTPS

---

## 🔐 ENVIRONMENT VARIABLES

### Variables to migrate from Railway to Vercel:

1. **DATABASE_URL** ✅
   - Type: Secret
   - Value: Your Neon PostgreSQL connection string
   - Format: `postgresql://user:password@host/database?sslmode=require`

2. **NODE_ENV**
   - Value: `production`
   - (Automatically set by Vercel, but you can override)

3. **PORT**
   - ❌ **NOT NEEDED** - Vercel handles ports automatically
   - Remove any hardcoded port references

### How to add in Vercel:

1. Go to **Project Settings** → **Environment Variables**
2. Click **Add New**
3. Paste each variable name and value
4. Select environments: `Production`, `Preview`, `Development`
5. Click **Save**

---

## ✅ DEPENDENCY COMPATIBILITY CHECK

### ✅ Compatible Dependencies:
- `express` - Works in serverless
- `@neondatabase/serverless` - Perfect for Vercel
- `drizzle-orm` - Compatible
- `multer` - Works but limited to 4.5MB
- All React dependencies - No issues

### ⚠️ Problematic Dependencies:
- `ws` (WebSocket) - **NOT COMPATIBLE**
- `memorystore` - May not persist across function invocations
- `connect-pg-simple` - Session storage may have issues

### 🔧 Recommended Changes:

1. **Sessions**: Use JWT tokens or Vercel KV for session storage
2. **WebSockets**: Migrate to Pusher, Ably, or Vercel Edge Functions
3. **File Storage**: Use Vercel Blob or S3 instead of local filesystem

---

## 🚀 DEPLOYMENT STEPS

### 1. Push to GitHub (if not already done)
```bash
git init
git add .
git commit -m "Prepare for Vercel deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Connect to Vercel
1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### 3. Add Environment Variables
- Add `DATABASE_URL` from Railway

### 4. Deploy
- Click **Deploy**
- Wait for build to complete

### 5. Add Domain
1. Go to **Project Settings** → **Domains**
2. Add `droppyx.org`
3. Follow DNS configuration instructions above

---

## 🔄 RECOMMENDED ARCHITECTURE (Hybrid Approach)

Since your app heavily relies on WebSockets and large file uploads, consider:

### **Hybrid Deployment**:
- **Vercel**: Host the static frontend and API routes
- **Railway**: Keep WebSocket server and file upload handling
- **Use CORS**: Allow Vercel frontend to communicate with Railway backend

### Configuration:
```typescript
// In client, point WebSocket to Railway:
const WS_URL = process.env.VITE_WS_URL || 'wss://your-railway-app.railway.app/ws';

// API calls go to Vercel:
const API_URL = 'https://droppyx.org/api';
```

---

## 📊 COST COMPARISON

### Railway:
- ~$5-20/month depending on usage
- Supports WebSockets ✅
- No file size limits ✅

### Vercel:
- Free tier: 100GB bandwidth
- Pro: $20/month (unlimited bandwidth)
- No WebSocket support ❌
- 4.5MB request limit ❌

---

## 🎯 RECOMMENDATION

**Option 1**: **Full Migration with Workarounds**
- Migrate to Vercel Blob for file storage
- Use Pusher/Ably for WebSockets
- Additional cost: ~$10-30/month

**Option 2**: **Hybrid Approach** (Recommended)
- Keep Railway for WebSockets + file uploads
- Use Vercel for static frontend + basic API
- Best of both worlds

**Option 3**: **Stay on Railway**
- If WebSockets and large uploads are core features
- Railway supports everything you need

---

## 📞 NEXT STEPS

1. Decide on WebSocket solution (Pusher, Ably, hybrid, or stay on Railway)
2. Decide on file storage solution (Vercel Blob, S3, or Railway)
3. Test locally with Vercel CLI: `npx vercel dev`
4. Deploy to Vercel preview environment
5. Update DNS records
6. Test thoroughly before making DNS changes live

---

## 🐛 TROUBLESHOOTING

### Build Fails
- Check all environment variables are set
- Ensure `DATABASE_URL` is valid
- Remove Replit plugins from production build

### WebSocket Connection Fails
- Expected! WebSockets don't work on Vercel serverless
- Implement one of the solutions above

### File Uploads Fail
- Check file size (max 4.5MB on Vercel)
- Consider using Vercel Blob Storage

### Database Connection Issues
- Verify `DATABASE_URL` format includes `?sslmode=require`
- Check Neon database allows connections from Vercel IPs

---

## 📚 HELPFUL RESOURCES

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Pusher WebSocket Alternative](https://pusher.com/)
- [Ably WebSocket Alternative](https://ably.com/)
- [Neon Database](https://neon.tech/docs)

---

**Generated**: December 28, 2025
**For**: droppyx.org migration from Railway to Vercel

