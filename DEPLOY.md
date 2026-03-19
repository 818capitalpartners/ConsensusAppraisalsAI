# 818 Capital — Deployment Steps

Run these on your Windows machine. Everything is prepped — just follow in order.

## 1. Run the Alembic migration (local DB)

```bash
cd C:\Users\ravip\dev\818-capital\backend
python -m alembic upgrade head
```

This adds the `ai_appraisal_result` JSONB column to the deals table.

## 2. Git init & push

```bash
cd C:\Users\ravip\dev\818-capital
git init
git add -A
git commit -m "818 Capital v1 — full platform with AI appraisal engine"
gh repo create 818-capital --private --source=. --push
```

## 3. Deploy Frontend → Vercel

1. Go to vercel.com → Add New Project
2. Import the `818-capital` GitHub repo
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (auto-detected)
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL` = `https://your-railway-backend-url.railway.app`
4. Deploy
5. Copy the Vercel URL — you'll need it for Railway CORS

## 4. Deploy Backend → Railway

1. Go to railway.app → New Project → Deploy from GitHub Repo
2. Select `818-capital` repo
3. Settings:
   - **Root Directory**: `backend`
   - It will auto-detect the Dockerfile
4. Add a **PostgreSQL** plugin/addon
5. Set environment variables:
   - `DATABASE_URL` = (Railway provides this — use the `postgresql+asyncpg://` version)
   - `DATABASE_URL_SYNC` = (same but with `postgresql://` prefix)
   - `OPENAI_API_KEY` = your key
   - `MONDAY_API_TOKEN` = your key
   - `SLACK_WEBHOOK_URL` = your webhook
   - `BREVO_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel URL (for CORS)
   - `BACKEND_PORT` = `3001`
6. Deploy

## 5. Update Vercel env var

Once Railway is deployed, update the Vercel environment variable:
- `NEXT_PUBLIC_API_URL` = `https://your-railway-url.railway.app`
- Redeploy on Vercel

## 6. GoDaddy DNS

1. Go to GoDaddy → 818capitalpartners.com → DNS Management
2. Add/update CNAME record:
   - **Name**: `@` (or `www`)
   - **Value**: `cname.vercel-dns.com`
3. In Vercel → Settings → Domains → Add `818capitalpartners.com`
4. Vercel will auto-provision SSL
