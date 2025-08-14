# 🗄️ Database Setup for FormForge

Your Supabase connection is working, but you need to create the database tables. Here's how:

## 📋 Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project: `zvpyndcaaccpyjoqwfxy`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"

## 📝 Step 2: Copy and Run This SQL

Copy and paste the following SQL into the editor and click "Run":

```sql
-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  header_image text,
  questions jsonb DEFAULT '[]'::jsonb NOT NULL,
  is_published boolean DEFAULT false NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id varchar NOT NULL,
  answers jsonb NOT NULL,
  score jsonb,
  submitted_at timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE responses 
ADD CONSTRAINT IF NOT EXISTS responses_form_id_forms_id_fk 
FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE no action ON UPDATE no action;

-- Create storage bucket for images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('form-images', 'form-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the bucket
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'form-images');

CREATE POLICY IF NOT EXISTS "Public Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'form-images');
```

## ✅ Step 3: Verify Setup

After running the SQL, test your setup:

```bash
npm run dev
```

Then visit: http://localhost:5000/api/health

You should see: `{"status":"healthy"}`

## 🎯 What This Creates

- **forms table**: Stores your form definitions
- **responses table**: Stores form submissions
- **form-images bucket**: Stores uploaded images
- **Storage policies**: Allows public read/write to images

## 🔧 Alternative: Manual Table Creation

If the SQL above doesn't work, you can create tables manually:

1. Go to "Table Editor" in Supabase
2. Click "Create a new table"
3. Create the tables with the columns as shown in the SQL above

Your FormForge application will be fully functional once these tables are created!
