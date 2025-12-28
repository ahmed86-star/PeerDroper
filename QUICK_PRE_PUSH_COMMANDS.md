# ⚡ Quick Pre-Push Commands

Run these commands **before pushing** to verify everything is ready:

---

## 1️⃣ Test the Build (IMPORTANT!)

```bash
npm run build:vercel
```

✅ **Expected**: Build completes successfully
❌ **If it fails**: Fix errors before pushing

---

## 2️⃣ Check for Secrets

```bash
git status
```

✅ **Should NOT see**:
- `.env` 
- `.env.local`
- Any file with passwords/secrets

❌ **If you see `.env`**: Run `git reset .env`

---

## 3️⃣ Review What Will Be Committed

```bash
git diff --cached
```

Or if nothing is staged yet:
```bash
git add .
git status
```

✅ **Should see**:
- `api/index.ts` (new)
- `vercel.json` (modified)
- `package.json` (modified)
- `.gitignore` (modified)
- `vite.config.ts` (modified)
- `env.example` (new)
- Documentation files (new)

---

## 4️⃣ Verify Core Files Unchanged

```bash
git diff server/index.ts
```

✅ **Expected**: "No changes" or empty output
❌ **If changes shown**: Core logic should not be modified

---

## 5️⃣ Final Security Check

```bash
# Search for any secrets in staged files
git diff --cached | grep -i "postgresql://.*@"
```

✅ **Expected**: No real database URLs found
❌ **If found**: Remove secrets before pushing!

---

## 6️⃣ Commit and Push

```bash
# Stage all changes
git add .

# Commit
git commit -m "Add Vercel deployment configuration"

# Push to GitHub
git push origin main
```

---

## ✅ Quick Checklist

- [ ] `npm run build:vercel` works ✓
- [ ] No `.env` files in git status ✓
- [ ] `server/index.ts` unchanged ✓
- [ ] No secrets in commits ✓
- [ ] Ready to push! 🚀

---

## 🚨 If Build Fails

```bash
# Clean and try again
rm -rf dist node_modules
npm install
npm run build:vercel
```

---

## ✅ After Push

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repository
3. **Read**: `VERCEL_QUICKSTART.md` for next steps

---

**Good luck!** 🚀

