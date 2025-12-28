# 🔐 Environment Variables Guide

## Required Environment Variables for Vercel Deployment

### 1. DATABASE_URL (REQUIRED)
```
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
```
- **Source**: Your Neon PostgreSQL database
- **Where to find it**: Railway Dashboard → Your Database Service → Connect → Connection URL
- **Vercel Setup**: 
  1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
  2. Add new variable:
     - **Key**: `DATABASE_URL`
     - **Value**: Your connection string from Railway/Neon
     - **Environments**: Production, Preview, Development (check all)
  3. Click "Save"

**Example**:
```
DATABASE_URL=postgresql://peerdrop_user:Kj8Hs_x9Pq!Lm@ep-cool-lake-123456.us-east-2.aws.neon.tech/peerdrop?sslmode=require
```

---

### 2. NODE_ENV (Automatically set by Vercel)
```
NODE_ENV=production
```
- **Default**: Vercel automatically sets this to `production`
- **Purpose**: Tells your app it's running in production mode
- **Action**: No manual configuration needed

---

## Optional Environment Variables

### 3. PORT (NOT NEEDED on Vercel)
```
PORT=3000
```
- ⚠️ **Important**: Vercel handles port assignment automatically
- **Railway Usage**: Railway sets this dynamically (e.g., `PORT=8080`)
- **Vercel Usage**: Don't set this - Vercel's serverless functions don't use it
- **Your Code**: Already handles this correctly:
  ```typescript
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  ```

---

### 4. VITE_WS_URL (If using hybrid deployment)
```
VITE_WS_URL=wss://your-railway-app.up.railway.app/ws
```
- **Purpose**: WebSocket connection URL if you keep WS on Railway
- **Only needed if**: You're using the hybrid deployment approach
- **Client Usage**: Your React app will use this to connect to WebSockets

---

### 5. VITE_API_URL (Optional)
```
VITE_API_URL=https://droppyx.org/api
```
- **Purpose**: API base URL for your frontend
- **Default**: Frontend will use relative URLs if not set
- **Use case**: If you split frontend and backend across different domains

---

## Environment Variables Comparison

### Railway (Current Setup)
```env
DATABASE_URL=postgresql://...
PORT=8080                    # Auto-assigned by Railway
NODE_ENV=production
```

### Vercel (Target Setup)
```env
DATABASE_URL=postgresql://...
NODE_ENV=production          # Auto-set by Vercel
# PORT not needed - Vercel handles this
```

---

## How to Migrate Environment Variables

### Step 1: Export from Railway
1. Go to Railway Dashboard
2. Click on your project
3. Go to **Variables** tab
4. Copy the `DATABASE_URL` value

### Step 2: Import to Vercel
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. For each variable:
   - Enter **Key** (e.g., `DATABASE_URL`)
   - Enter **Value** (paste from Railway)
   - Select **Environments**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - Click **Save**

### Step 3: Verify
After deployment, check logs:
```bash
vercel logs <your-deployment-url>
```

Look for connection errors or missing environment variable warnings.

---

## Creating .env Files (For Local Development)

### .env.local (Local development)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/peerdrop_dev
NODE_ENV=development
PORT=5000
```

### .env.example (Template for team members)
```env
# Database Connection
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require

# Environment
NODE_ENV=development

# Server Port (not needed on Vercel)
PORT=5000

# Optional: WebSocket URL (if using hybrid deployment)
# VITE_WS_URL=wss://your-websocket-server.com/ws

# Optional: API URL (if separate frontend/backend)
# VITE_API_URL=https://api.droppyx.org
```

---

## Environment-Specific Values

### Development
```env
DATABASE_URL=postgresql://localhost:5432/peerdrop_dev
NODE_ENV=development
PORT=5000
```

### Preview (Vercel)
```env
DATABASE_URL=<your-preview-database-url>
NODE_ENV=preview
```

### Production (Vercel)
```env
DATABASE_URL=<your-production-database-url>
NODE_ENV=production
```

---

## Security Best Practices

1. **Never commit `.env` files to Git**
   - Add to `.gitignore`:
     ```
     .env
     .env.local
     .env.*.local
     ```

2. **Use different databases for dev/production**
   - Development: Local or separate cloud database
   - Production: Your main Neon database

3. **Rotate secrets regularly**
   - Update `DATABASE_URL` credentials every 90 days
   - Use Vercel's "Redeploy" after updating variables

4. **Use Vercel's secret management**
   - Secrets are encrypted at rest
   - Access is logged and auditable

---

## Common Issues & Solutions

### Issue: "DATABASE_URL must be set" error
**Solution**: 
1. Check environment variables in Vercel Dashboard
2. Ensure `DATABASE_URL` is set for all environments
3. Redeploy: `vercel --prod`

### Issue: Database connection timeout
**Solution**:
1. Verify connection string format includes `?sslmode=require`
2. Check Neon database allows connections from Vercel IPs
3. Test connection locally: 
   ```bash
   psql $DATABASE_URL
   ```

### Issue: Environment variables not updating
**Solution**:
1. After changing variables in Vercel Dashboard
2. You must redeploy: **Settings** → **Deployment** → **Redeploy**
3. Or use CLI: `vercel --prod --force`

---

## Vercel Environment Variables CLI

### List all variables
```bash
vercel env ls
```

### Add a new variable
```bash
vercel env add DATABASE_URL production
# Then paste the value when prompted
```

### Remove a variable
```bash
vercel env rm DATABASE_URL production
```

### Pull environment variables to local
```bash
vercel env pull .env.local
```

---

## Testing Environment Variables

### Local test with Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Pull environment variables
vercel env pull

# Run locally with Vercel environment
vercel dev
```

### Verify in production
```bash
# Deploy to preview
vercel

# Check logs
vercel logs <deployment-url>

# Deploy to production
vercel --prod
```

---

## Summary Checklist

Before deploying to Vercel:

- [ ] Copy `DATABASE_URL` from Railway
- [ ] Add `DATABASE_URL` to Vercel (Production, Preview, Development)
- [ ] Remove `PORT` from Vercel (not needed)
- [ ] Create `.env.example` for your repository
- [ ] Add `.env*` to `.gitignore`
- [ ] Test locally with `vercel dev`
- [ ] Deploy preview and verify
- [ ] Deploy to production

---

**Last Updated**: December 28, 2025
**For**: droppyx.org Vercel deployment

