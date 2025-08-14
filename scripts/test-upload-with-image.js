#!/usr/bin/env node

// Test upload functionality using the actual thumbnail-1.png image

import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

async function testUploadWithImage() {
  try {
    console.log('🧪 Testing upload with actual image file...');
    
    // Read the thumbnail image
    console.log('\n1. Reading thumbnail-1.png...');
    const imageBuffer = readFileSync('thumbnail-1.png');
    console.log('✅ Image loaded, size:', imageBuffer.length, 'bytes');
    
    // Convert to base64 (like the frontend does)
    const base64Data = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Data}`;
    console.log('✅ Converted to base64, length:', dataUrl.length);
    
    // Test data (same format as frontend sends)
    const testData = {
      image: dataUrl,
      filename: 'test-thumbnail.png'
    };
    
    console.log('\n2. Testing local upload API...');
    
    // Test against local server first (if running)
    try {
      const localResponse = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      if (localResponse.ok) {
        const result = await localResponse.json();
        console.log('✅ Local upload successful:', result);
      } else {
        const error = await localResponse.text();
        console.log('❌ Local upload failed:', localResponse.status, error);
      }
    } catch (err) {
      console.log('⚠️  Local server not running or not accessible');
    }
    
    console.log('\n3. Testing production upload API...');
    
    // Test against production
    const productionUrl = process.argv[2] || 'https://form-forge-two.vercel.app';
    
    try {
      console.log('Testing against:', `${productionUrl}/api/test-upload`);
      
      // First test the debug endpoint
      const debugResponse = await fetch(`${productionUrl}/api/test-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      if (debugResponse.ok) {
        const debugResult = await debugResponse.json();
        console.log('✅ Debug endpoint response:', JSON.stringify(debugResult, null, 2));
      } else {
        const debugError = await debugResponse.text();
        console.log('❌ Debug endpoint failed:', debugResponse.status, debugError);
      }
      
      // Now test the actual upload
      console.log('\nTesting actual upload endpoint...');
      const uploadResponse = await fetch(`${productionUrl}/api/upload-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log('✅ Production upload successful:', uploadResult);
        
        // Test if the uploaded image is accessible
        console.log('\n4. Testing uploaded image accessibility...');
        const imageResponse = await fetch(uploadResult.url);
        if (imageResponse.ok) {
          console.log('✅ Uploaded image is accessible');
          console.log('📸 Image URL:', uploadResult.url);
        } else {
          console.log('❌ Uploaded image is not accessible:', imageResponse.status);
        }
        
      } else {
        const uploadError = await uploadResponse.text();
        console.log('❌ Production upload failed:', uploadResponse.status, uploadError);
      }
      
    } catch (err) {
      console.error('❌ Production test failed:', err.message);
    }
    
    console.log('\n🎯 Test Summary:');
    console.log('- Image file read successfully');
    console.log('- Base64 conversion completed');
    console.log('- Check the results above for upload status');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Handle missing fetch in older Node versions
if (typeof fetch === 'undefined') {
  console.log('Installing node-fetch...');
  const { execSync } = await import('child_process');
  execSync('npm install node-fetch', { stdio: 'inherit' });
  const fetch = (await import('node-fetch')).default;
  global.fetch = fetch;
}

testUploadWithImage().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
