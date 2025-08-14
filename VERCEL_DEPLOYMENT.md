# 🚀 Complete Vercel Deployment Guide for FormForge

This guide will walk you through deploying your FormForge application to Vercel with Supabase as your backend.

## 📋 Prerequisites

- [GitHub](https://github.com) account with your FormForge repository
- [Vercel](https://vercel.com) account
- [Supabase](https://supabase.com) account
- Node.js 18+ installed locally (for testing)

## 🗄️ Step 1: Set up Supabase

### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project name: `formforge-production`
5. Set database password (save this!)
6. Choose region closest to your users
7. Click "Create new project"

### 1.2 Get Supabase Credentials
1. Go to **Settings → API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

3. Go to **Settings → Database**
4. Copy the **Connection string** (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.abcdefgh.supabase.co:5432/postgres`

### 1.3 Deploy Database Schema
```bash
# Clone your repository locally
git clone <your-repo-url>
cd FormForge

# Install dependencies
npm install

# Set environment variables temporarily
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Deploy the database schema
npm run db:deploy
```

### 1.4 Set up Storage Bucket
1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Name: `form-images`
4. Make it **Public**
5. Set file size limit: **10MB**
6. Allowed file types: `image/*`

## 🚀 Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select your FormForge repository

### 2.2 Configure Project Settings
1. **Framework Preset**: Other
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run vercel-build` (or leave default)
4. **Output Directory**: `dist/public`
5. **Install Command**: `npm install`

### 2.3 Set Environment Variables
In the Vercel project settings, add these environment variables:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_STORAGE_BUCKET=form-images
FRONTEND_URL=https://your-app-name.vercel.app
```

**Important**: Replace the bracketed values with your actual Supabase credentials!

### 2.4 Deploy
1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at `https://your-app-name.vercel.app`

## ✅ Step 3: Verify Deployment

### 3.1 Check Health Endpoints
Visit these URLs to verify everything is working:

- `https://your-app.vercel.app/api/health` → Should return `{"status": "healthy"}`
- `https://your-app.vercel.app/api/health/ready` → Should return `{"status": "ready"}`
- `https://your-app.vercel.app/api/health/live` → Should return `{"status": "alive"}`

### 3.2 Test the Application
1. Visit your Vercel app URL
2. Try creating a new form
3. Add some questions
4. Upload an image
5. Publish the form
6. Submit a response

### 3.3 Automated Verification
Run the verification script locally:
```bash
npm run verify https://your-app.vercel.app
```

## 🔧 Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions
5. Update `FRONTEND_URL` environment variable to your custom domain

## 🔍 Troubleshooting

### Build Failures
- **Check environment variables**: Ensure all required variables are set
- **Check logs**: Review build logs in Vercel dashboard
- **Node version**: Ensure you're using Node.js 18+

### Database Connection Issues
- **Verify DATABASE_URL**: Check the connection string format
- **Check Supabase status**: Ensure your Supabase project is active
- **SSL issues**: The connection should use SSL in production

### API Errors
- **CORS issues**: Verify `FRONTEND_URL` matches your Vercel domain
- **Function timeout**: Check if functions are timing out (30s limit)
- **Memory issues**: Monitor function memory usage

### Storage Issues
- **Bucket permissions**: Ensure `form-images` bucket is public
- **File size limits**: Check if uploads exceed 10MB limit
- **CORS policy**: Verify Supabase storage CORS settings

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Enable Vercel Analytics in your project settings
- Monitor performance and usage

### Supabase Monitoring
- Check database usage in Supabase dashboard
- Monitor storage usage
- Review API usage

### Health Checks
Set up monitoring for these endpoints:
- `/api/health` - Overall health
- `/api/health/ready` - Readiness probe
- `/api/health/live` - Liveness probe

## 🔒 Security Checklist

- [ ] Environment variables are set in Vercel (not in code)
- [ ] Supabase service role key is kept secret
- [ ] Database has proper access controls
- [ ] Storage bucket has appropriate permissions
- [ ] CORS is properly configured
- [ ] HTTPS is enabled (automatic with Vercel)

## 🚀 Going Live

1. **Test thoroughly** in the Vercel preview environment
2. **Set up monitoring** for health endpoints
3. **Configure alerts** for downtime
4. **Set up backups** in Supabase
5. **Document** your deployment process
6. **Share** your app URL!

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Supabase project status
4. Verify all environment variables are correct

Your FormForge application is now production-ready and deployed on Vercel! 🎉
