# Vercel Full-Stack Deployment Guide

This guide will help you deploy the Abacus Learning Platform to Vercel.

## Prerequisites

1. GitHub account
2. Vercel account (free) - [vercel.com](https://vercel.com)
3. PlanetScale account (free) - [planetscale.com](https://planetscale.com) for MySQL database

## Step 1: Set Up PlanetScale Database

1. Go to [planetscale.com](https://planetscale.com) and sign up
2. Create a new database: "abacus-learn"
3. Copy the connection string (it will look like: `mysql://...`)
4. Save this for Step 3

## Step 2: Push Code to GitHub

Your code should already be on GitHub. If not:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository: `komalchaubhe/I_like_abacus`
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as is (root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm run install:all`

5. Add Environment Variables:
   - `DATABASE_URL`: Your PlanetScale connection string
   - `JWT_SECRET`: Generate a random secret (e.g., use `openssl rand -base64 32`)
   - `FRONTEND_URL`: Will be set automatically by Vercel (or use `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`
   - `PUBLIC_URL_PREFIX`: `https://your-app.vercel.app/api/uploads`

6. Click "Deploy"

## Step 4: Run Database Migrations

After deployment:

1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Note your `DATABASE_URL`

4. Run migrations locally or use Vercel CLI:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Link project
   vercel link
   
   # Pull environment variables
   vercel env pull
   
   # Run migrations
   cd backend
   npx prisma migrate deploy
   ```

5. Seed the database:
   ```bash
   cd backend
   npm run seed
   ```

## Step 5: Update API Functions (If Needed)

The API functions are in the `api/` folder. Vercel will automatically detect and deploy them as serverless functions.

## Step 6: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test the application:
   - Home page loads
   - Login works (use seeded credentials)
   - API endpoints respond

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PlanetScale database is active
- Ensure SSL is enabled in connection string

### API Routes Not Working
- Check Vercel function logs in dashboard
- Verify API routes are in `api/` folder
- Check CORS headers in response

### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies are installed
- Check Node.js version (should be 18+)

### Environment Variables
- Ensure all required env vars are set
- Check variable names match exactly
- Redeploy after adding new variables

## File Uploads

For production file uploads, consider:
- **Vercel Blob**: Built-in file storage
- **Cloudinary**: Free tier available
- **AWS S3**: More robust but requires setup

Update `api/uploads/upload.js` to use your chosen service.

## Updating After Deployment

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Vercel automatically redeploys
4. Changes go live in 1-3 minutes

## Login Credentials (After Seeding)

- **Teacher**: `teacher@example.com` / `Test1234`
- **Admin**: `admin@example.com` / `Admin1234`

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- PlanetScale Docs: [planetscale.com/docs](https://planetscale.com/docs)
- Prisma Docs: [prisma.io/docs](https://www.prisma.io/docs)

