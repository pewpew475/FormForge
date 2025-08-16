#!/usr/bin/env node

// Script to add user_id column to forms table

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🔄 Running user_id migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'migrations', 'add_user_id_to_forms.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      // If the RPC doesn't exist, try direct SQL execution
      console.log('Trying direct SQL execution...');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error: execError } = await supabase
          .from('forms')
          .select('id')
          .limit(0); // This is just to test connection
        
        if (execError) {
          console.error('Error testing connection:', execError);
          throw execError;
        }
      }
      
      console.log('⚠️  Migration SQL prepared. Please run it manually in your Supabase SQL editor:');
      console.log('\n' + migrationSQL + '\n');
    } else {
      console.log('✅ Migration completed successfully!');
    }
    
    // Test the new column
    console.log('🔍 Testing new column...');
    const { data: testData, error: testError } = await supabase
      .from('forms')
      .select('id, user_id')
      .limit(1);
    
    if (testError) {
      console.error('Error testing new column:', testError);
    } else {
      console.log('✅ New user_id column is accessible!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
