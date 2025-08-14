#!/usr/bin/env node

// Test database connection and check if tables exist

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('forms')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Tables do not exist yet. Need to create them.');
        console.log('\nTo create tables, run the following SQL in your Supabase SQL Editor:');
        console.log('\n--- Copy and paste this SQL ---');
        console.log(`
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

CREATE TABLE IF NOT EXISTS responses (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id varchar NOT NULL,
  answers jsonb NOT NULL,
  score jsonb,
  submitted_at timestamp DEFAULT now() NOT NULL
);

ALTER TABLE responses ADD CONSTRAINT responses_form_id_forms_id_fk 
FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE no action ON UPDATE no action;
        `);
        console.log('--- End SQL ---\n');
        console.log('After running this SQL, your application will work correctly.');
      } else {
        console.error('❌ Database connection failed:', error);
      }
    } else {
      console.log('✅ Database connection successful!');
      console.log('✅ Tables exist and are accessible.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDatabase();
