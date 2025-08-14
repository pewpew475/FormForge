#!/usr/bin/env node

// Test Supabase Storage setup

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testStorage() {
  try {
    console.log('🧪 Testing Supabase Storage setup...');
    
    const bucketName = 'form-images';
    
    // 1. Check if bucket exists
    console.log('\n1. Checking if bucket exists...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Failed to list buckets:', bucketsError);
      return;
    }
    
    const bucket = buckets.find(b => b.id === bucketName);
    if (!bucket) {
      console.log('❌ Bucket "form-images" does not exist!');
      console.log('\n📋 To create the bucket, run this SQL in Supabase:');
      console.log(`
INSERT INTO storage.buckets (id, name, public)
VALUES ('form-images', 'form-images', true)
ON CONFLICT (id) DO NOTHING;
      `);
      return;
    }
    
    console.log('✅ Bucket exists:', bucket);
    
    // 2. Test upload
    console.log('\n2. Testing file upload...');
    // Create a minimal valid JPEG header for testing
    const testData = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
    ]);
    const testFilename = `test-${Date.now()}.jpg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFilename, testData, {
        contentType: 'image/jpeg',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      console.log('\n📋 You may need to set up storage policies. Run this SQL:');
      console.log(`
CREATE POLICY IF NOT EXISTS "Public Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'form-images');

CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'form-images');
      `);
      return;
    }
    
    console.log('✅ Upload successful:', uploadData);
    
    // 3. Test public URL
    console.log('\n3. Testing public URL...');
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(testFilename);
    
    console.log('✅ Public URL:', publicUrl);
    
    // 4. Clean up test file
    console.log('\n4. Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([testFilename]);
    
    if (deleteError) {
      console.log('⚠️  Could not delete test file:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
    console.log('\n🎉 Storage setup is working correctly!');
    console.log('Your upload functionality should now work.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStorage();
