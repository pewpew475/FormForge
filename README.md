# FormCraft - Advanced Form Builder

A comprehensive form builder application with custom question types, real-time scoring, and image support. Built with React, Express.js, PostgreSQL, and ready for Vercel deployment with Supabase integration.

## 🚀 Production Ready

This application is optimized for production deployment with:
- **Vercel Integration**: Optimized build configuration and serverless functions
- **Supabase Backend**: PostgreSQL database and file storage
- **Health Monitoring**: Built-in health check endpoints
- **Security**: Production middleware including CORS, Helmet, and compression
- **Performance**: Optimized builds, caching, and connection pooling

## Features

- **Three Custom Question Types:**
  - **Categorize**: Drag items into categories
  - **Cloze**: Fill in the blanks with automatic scoring
  - **Comprehension**: Reading comprehension with multiple choice questions

- **Advanced Form Builder:**
  - Drag-and-drop interface
  - Real-time image uploads
  - Form preview and publishing
  - Enhanced UI with collapsible settings

- **Scoring System:**
  - Automatic scoring for Cloze and Comprehension questions
  - Detailed score breakdown
  - Instant results display

- **Production Ready:**
  - PostgreSQL database with Drizzle ORM
  - Supabase integration for storage and database
  - Vercel deployment configuration
  - TypeScript throughout

## Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd formcraft
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:

```env
# Supabase Configuration
DATABASE_URL=postgresql://username:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=form-images
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Development
```bash
npm run dev
```

## Supabase Setup Guide

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for setup to complete

### 2. Get Database URL
1. Go to Project Settings → Database
2. Copy the "Connection string" under "Connection pooling"
3. Replace `[YOUR-PASSWORD]` with your database password

### 3. Get API Keys
1. Go to Project Settings → API
2. Copy:
   - Project URL (SUPABASE_URL)
   - anon/public key (SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

### 4. Setup Storage Bucket
1. Go to Storage in Supabase dashboard
2. Create a new bucket named "form-images"
3. Set it to public if you want direct access to images

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
vercel
```

### 3. Environment Variables
In Vercel dashboard, add these environment variables:
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

### 4. Run Database Migration
After deployment, run the database push command in your local environment:
```bash
npm run db:push
```

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Main pages
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/          # Utilities
├── server/               # Express backend
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── db.ts            # Database connection
│   └── supabase.ts      # Supabase client
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema
├── vercel.json          # Vercel configuration
└── README.md
```

## API Endpoints

- `GET /api/forms` - List all forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `POST /api/forms/:id/responses` - Submit form response
- `GET /api/forms/:id/responses` - Get form responses
- `POST /api/upload` - Upload images

## 🚀 Production Deployment

### 🚀 One-Click Setup & Deploy

1. **Quick Setup:**
   ```bash
   git clone <your-repo-url>
   cd FormForge
   npm install
   npm run setup  # Interactive setup wizard
   ```

2. **Deploy to Vercel:**
   - Connect your repository to Vercel
   - Copy environment variables from the setup output
   - Deploy!

3. **Alternative: Manual Setup:**
   - Create a new Supabase project
   - Get your database URL and API keys
   - Run `npm run db:deploy` to set up the schema

3. **Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=your-supabase-connection-string
   SUPABASE_URL=your-supabase-project-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   SUPABASE_STORAGE_BUCKET=form-images
   FRONTEND_URL=https://your-app.vercel.app
   ```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Health Monitoring

- `GET /api/health` - Application health status
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## Development Notes

- Images are stored as data URLs in development
- Production uses Supabase Storage for images
- Database uses PostgreSQL with Drizzle ORM
- TypeScript for full type safety
- Tailwind CSS for styling
- Production middleware includes security headers, compression, and CORS

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:deploy` - Deploy schema to Supabase
- `npm run check` - TypeScript type checking

## License

MIT License