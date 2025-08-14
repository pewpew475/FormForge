# FormForge Production Deployment Guide

This guide will help you deploy FormForge to Vercel with Supabase as your database and storage provider.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Supabase Account](https://supabase.com)
- Node.js 18+ installed locally

## Step 1: Set up Supabase

1. **Create a new Supabase project:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Choose your organization and set project details
   - Wait for the project to be created

2. **Get your Supabase credentials:**
   - Go to Settings → API
   - Copy the following values:
     - Project URL
     - `anon` public key
     - `service_role` secret key
   - Go to Settings → Database
   - Copy the connection string (URI format)

3. **Deploy the database schema:**
   ```bash
   # Set environment variables
   export SUPABASE_URL="your-project-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # Deploy the database schema
   npm run db:deploy
   ```

4. **Set up storage bucket:**
   - Go to Storage in your Supabase dashboard
   - Create a new bucket named `form-images`
   - Make it public
   - Set file size limit to 10MB
   - Allow image file types only

## Step 2: Deploy to Vercel

1. **Connect your repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure environment variables in Vercel:**
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variables:

   ```
   NODE_ENV=production
   DATABASE_URL=your-supabase-connection-string
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_STORAGE_BUCKET=form-images
   FRONTEND_URL=https://your-app.vercel.app
   ```

3. **Deploy:**
   - Click "Deploy" in Vercel
   - Wait for the build to complete

## Step 3: Verify Deployment

1. **Check health endpoints:**
   - Visit `https://your-app.vercel.app/api/health`
   - Should return `{"status": "healthy"}`

2. **Test the application:**
   - Visit your Vercel app URL
   - Create a test form
   - Verify data is saved in Supabase

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (production) | Yes |
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket name | No (default: form-images) |
| `FRONTEND_URL` | Your Vercel app URL for CORS | No |

## Troubleshooting

### Database Connection Issues
- Verify your DATABASE_URL is correct
- Check that your Supabase project is active
- Ensure the connection string includes SSL parameters

### Build Failures
- Check that all environment variables are set
- Verify Node.js version compatibility
- Review build logs in Vercel dashboard

### CORS Issues
- Set FRONTEND_URL to your Vercel deployment URL
- Check that your domain is allowed in Supabase settings

## Monitoring

- Use `/api/health` for health checks
- Use `/api/health/ready` for readiness probes
- Use `/api/health/live` for liveness probes
- Monitor logs in Vercel dashboard
- Check database metrics in Supabase dashboard

## Security Notes

- Never commit `.env` files to version control
- Use Vercel's environment variables for secrets
- Regularly rotate your Supabase service role key
- Enable RLS (Row Level Security) in Supabase for production
- Consider setting up database backups

## Performance Optimization

- Images are automatically optimized by Vercel
- Static assets are cached with long TTL
- Database connections are pooled
- Compression is enabled for production builds
