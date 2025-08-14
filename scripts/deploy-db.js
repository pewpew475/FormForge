#!/usr/bin/env node

// Script to deploy database schema to Supabase
// Run this after setting up your Supabase project

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

// Check for required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.log('\nPlease set the following environment variables:');
    console.log('- SUPABASE_URL: Your Supabase project URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key');
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deployDatabase() {
  try {
    console.log('🚀 Deploying database schema to Supabase...');

    // Create forms table
    console.log('Creating forms table...');
    const { error: formsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (formsError) {
      console.log('Forms table might already exist, continuing...');
    }

    // Create responses table
    console.log('Creating responses table...');
    const { error: responsesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS responses (
          id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
          form_id varchar NOT NULL,
          answers jsonb NOT NULL,
          score jsonb,
          submitted_at timestamp DEFAULT now() NOT NULL
        );
      `
    });

    if (responsesError) {
      console.log('Responses table might already exist, continuing...');
    }

    // Add foreign key constraint
    console.log('Adding foreign key constraint...');
    const { error: fkError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'responses_form_id_forms_id_fk'
          ) THEN
            ALTER TABLE responses ADD CONSTRAINT responses_form_id_forms_id_fk
            FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE no action ON UPDATE no action;
          END IF;
        END $$;
      `
    });

    if (fkError) {
      console.log('Foreign key constraint might already exist, continuing...');
    }

    console.log('✅ Database schema deployed successfully!');
    
    // Create storage bucket if it doesn't exist
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'form-images';
    console.log(`📁 Creating storage bucket: ${bucketName}...`);
    
    const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Failed to create storage bucket:', bucketError);
    } else {
      console.log('✅ Storage bucket ready!');
    }
    
    console.log('\n🎉 Database deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployDatabase();
