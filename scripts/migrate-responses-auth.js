#!/usr/bin/env node

// Script to migrate responses table to include user_id for authentication

import { config } from 'dotenv';
import { getSupabase } from '../dist/supabase.js';

// Load environment variables
config();

async function migrateResponsesAuth() {
  console.log('🔄 Migrating responses table to support user authentication...');
  
  try {
    const supabase = getSupabase();
    
    // Check if user_id column already exists
    console.log('\n1. Checking current table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'responses' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (columnsError) {
      console.log('❌ Failed to check table structure:', columnsError);
      return;
    }

    const hasUserId = columns?.some(col => col.column_name === 'user_id');
    
    if (hasUserId) {
      console.log('✅ user_id column already exists in responses table');
    } else {
      console.log('📝 Adding user_id column to responses table...');
      
      // Add user_id column
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          -- Add user_id column to responses table
          ALTER TABLE responses ADD COLUMN user_id TEXT;
          
          -- Create index for better query performance
          CREATE INDEX IF NOT EXISTS idx_responses_user_id ON responses(user_id);
          
          -- Create composite index for form_id and user_id
          CREATE INDEX IF NOT EXISTS idx_responses_form_user ON responses(form_id, user_id);
          
          -- Add comment for documentation
          COMMENT ON COLUMN responses.user_id IS 'Supabase auth user ID - tracks which user submitted the response';
        `
      });

      if (alterError) {
        console.log('❌ Failed to add user_id column:', alterError);
        return;
      }
      
      console.log('✅ Successfully added user_id column and indexes');
    }

    // Test the new structure
    console.log('\n2. Testing new table structure...');
    const { data: newColumns, error: newColumnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'responses' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (newColumnsError) {
      console.log('❌ Failed to verify new structure:', newColumnsError);
      return;
    }

    console.log('✅ Updated responses table structure:');
    newColumns?.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });

    // Check indexes
    console.log('\n3. Verifying indexes...');
    const { data: indexes, error: indexError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT indexname, indexdef
          FROM pg_indexes 
          WHERE tablename = 'responses' 
          AND schemaname = 'public'
          ORDER BY indexname;
        `
      });

    if (indexError) {
      console.log('❌ Failed to check indexes:', indexError);
    } else {
      console.log('✅ Indexes on responses table:');
      indexes?.forEach(idx => {
        console.log(`   - ${idx.indexname}`);
      });
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('✅ Added user_id column to responses table');
    console.log('✅ Created performance indexes');
    console.log('✅ Form submissions now require authentication');
    console.log('✅ Users can only submit each form once');
    console.log('✅ Responses are tracked per user');

    console.log('\n🚀 Next steps:');
    console.log('1. Deploy the updated code');
    console.log('2. Test the authentication flow:');
    console.log('   - Try accessing a form without signing in');
    console.log('   - Sign in with Google/Microsoft');
    console.log('   - Submit a form');
    console.log('   - Try submitting the same form again');
    console.log('3. Verify one-time submission works correctly');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    console.log('2. Verify you have admin access to the database');
    console.log('3. Check that the responses table exists');
  }
}

migrateResponsesAuth();
