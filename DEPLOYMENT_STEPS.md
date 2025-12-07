# Quick Deployment Steps - Abacus Learning Platform

## Prerequisites Checklist
- [ ] GitHub account
- [ ] Vercel account (free) - https://vercel.com
- [ ] Supabase account (free) - https://supabase.com

---

## Step 1: Set Up Supabase Database (5 minutes)

### 1.1 Create Account
1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub (easiest)

### 1.2 Create Project
1. Click **"New Project"**
2. Fill in:
   - **Name**: `abacus-learn`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
3. Click **"Create new project"**
4. Wait 1-2 minutes for setup

### 1.3 Get Connection String
1. In your project, go to **Settings** → **Database**
2. Scroll to **"Connection string"** section
3. Select **"URI"** tab
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
5. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
6. Save this connection string - you'll need it for Vercel

---

## Step 2: Generate JWT Secret

Run this in PowerShell:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

Save the generated secret.

---

## Step 3: Deploy to Vercel

### 3.1 Sign In
1. Go to **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Sign in with **GitHub**

### 3.2 Import Project
1. Click **"Add New Project"**
2. Find and select: **`komalchaubhe/I_like_abacus`**
3. Click **"Import"**

### 3.3 Configure Project
Leave these settings as default (they're already configured):
- **Framework Preset**: Other
- **Root Directory**: `.` (root)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm run install:all`

### 3.4 Add Environment Variables
Click **"Environment Variables"** and add these:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | Your Supabase connection string (from Step 1.3) | Production, Preview, Development |
| `JWT_SECRET` | Your generated secret (from Step 2) | Production, Preview, Development |
| `NODE_ENV` | `production` | Production only |
| `FRONTEND_URL` | Leave empty for now | Production, Preview, Development |
| `PUBLIC_URL_PREFIX` | Leave empty for now | Production, Preview, Development |

### 3.5 Deploy
1. Click **"Deploy"**
2. Wait 2-5 minutes
3. **Copy your deployment URL** (e.g., `https://your-app.vercel.app`)

---

## Step 4: Update Environment Variables with Your URL

After deployment completes:

1. Go to **Settings** → **Environment Variables**
2. Update `FRONTEND_URL`:
   - Value: `https://your-actual-url.vercel.app` (use your real URL)
   - Environments: Production, Preview, Development
3. Update `PUBLIC_URL_PREFIX`:
   - Value: `https://your-actual-url.vercel.app/api/uploads`
   - Environments: Production, Preview, Development
4. Click **"Save"**
5. Go to **Deployments** → Click **"..."** on latest → **"Redeploy"**

---

## Step 5: Run Database Migrations

### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not installed):
```powershell
npm install -g vercel
```

2. **Login to Vercel**:
```powershell
vercel login
```

3. **Link your project**:
```powershell
cd C:\Users\Admin\Desktop\abacus
vercel link
```
   - Select your project when prompted
   - Use default settings

4. **Pull environment variables**:
```powershell
vercel env pull .env.local
```

5. **Run migrations**:
```powershell
cd backend
npx prisma migrate deploy
```

6. **Seed the database**:
```powershell
npm run seed
```

### Option B: Manual (If CLI doesn't work)

1. Create `.env` file in `backend` folder:
```env
DATABASE_URL=your-supabase-connection-string-here
JWT_SECRET=your-jwt-secret-here
NODE_ENV=production
```

2. Run migrations:
```powershell
cd backend
npx prisma migrate deploy
```

3. Seed database:
```powershell
npm run seed
```

---

## Step 6: Test Your Deployment

1. Visit: `https://your-app.vercel.app`
2. Test home page loads
3. Test login:
   - Email: `teacher@example.com`
   - Password: `Test1234`
4. Test API: `https://your-app.vercel.app/api/health`

---

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure Node.js 18+ (set in Vercel Settings → General)

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Check Supabase database is active
- Ensure password is replaced in connection string

### API Returns 500
- Check Vercel function logs (Deployments → Functions)
- Verify all environment variables are set
- Ensure `FRONTEND_URL` matches your domain

### CORS Errors
- Ensure `FRONTEND_URL` is set to exact domain (no trailing slash)
- Redeploy after updating environment variables

---

## Default Login Credentials (After Seeding)

- **Teacher**: `teacher@example.com` / `Test1234`
- **Admin**: `admin@example.com` / `Admin1234`

---

## Success! 🎉

Your site is now live at: `https://your-app.vercel.app`

