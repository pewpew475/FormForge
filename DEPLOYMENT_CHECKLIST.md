# 📋 FormForge Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## 🗄️ Supabase Setup

- [ ] Create new Supabase project
- [ ] Copy Project URL
- [ ] Copy anon public key  
- [ ] Copy service_role key
- [ ] Copy database connection string
- [ ] Run `npm run db:deploy` to set up schema
- [ ] Create `form-images` storage bucket
- [ ] Set bucket to public
- [ ] Configure bucket file size limit (10MB)
- [ ] Set allowed file types to `image/*`

## 🚀 Vercel Deployment

- [ ] Connect GitHub repository to Vercel
- [ ] Set Framework Preset to "Other"
- [ ] Set Output Directory to `dist/public`
- [ ] Add all environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=postgresql://...`
  - [ ] `SUPABASE_URL=https://...`
  - [ ] `SUPABASE_ANON_KEY=...`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=...`
  - [ ] `SUPABASE_STORAGE_BUCKET=form-images`
  - [ ] `FRONTEND_URL=https://your-app.vercel.app`
- [ ] Deploy project
- [ ] Wait for build to complete

## ✅ Verification

- [ ] Visit app URL - should load homepage
- [ ] Check `/api/health` - should return `{"status": "healthy"}`
- [ ] Check `/api/health/ready` - should return `{"status": "ready"}`
- [ ] Check `/api/health/live` - should return `{"status": "alive"}`
- [ ] Test creating a new form
- [ ] Test adding questions
- [ ] Test image upload
- [ ] Test form publishing
- [ ] Test form submission
- [ ] Run `npm run verify https://your-app.vercel.app`

## 🔧 Optional Configuration

- [ ] Set up custom domain
- [ ] Update `FRONTEND_URL` to custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up monitoring alerts
- [ ] Configure database backups in Supabase

## 🔒 Security Review

- [ ] All secrets are in Vercel environment variables (not in code)
- [ ] No `.env` files committed to repository
- [ ] Supabase service role key is secure
- [ ] CORS is properly configured
- [ ] HTTPS is enabled (automatic with Vercel)

## 📊 Post-Deployment

- [ ] Monitor application performance
- [ ] Check Vercel function logs
- [ ] Monitor Supabase usage
- [ ] Test all features thoroughly
- [ ] Document any issues or learnings

---

**🎉 Congratulations! Your FormForge application is now live on Vercel!**

Share your app: `https://your-app-name.vercel.app`
