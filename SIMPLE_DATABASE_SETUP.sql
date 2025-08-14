-- Simple Database Setup for FormForge
-- Copy and paste this into Supabase SQL Editor

-- Create forms table
CREATE TABLE forms (
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
CREATE TABLE responses (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id varchar NOT NULL,
  answers jsonb NOT NULL,
  score jsonb,
  submitted_at timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE responses 
ADD CONSTRAINT responses_form_id_forms_id_fk 
FOREIGN KEY (form_id) REFERENCES forms(id);
