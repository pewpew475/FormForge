#!/usr/bin/env node

// Test upload with the exact format the frontend sends

import { readFileSync } from 'fs';

async function testFrontendFormat() {
  try {
    console.log('🧪 Testing upload with frontend format...');
    
    // Read the thumbnail image
    const imageBuffer = readFileSync('thumbnail-1.png');
    
    // Convert to base64 (exactly like frontend does)
    const reader = {
      result: `data:image/png;base64,${imageBuffer.toString('base64')}`
    };
    
    // Extract base64 data (remove data:image/...;base64, prefix)
    const base64Data = reader.result.split(',')[1];
    
    // Test data in EXACT frontend format
    const testData = {
      file: base64Data,        // ✅ "file" (not "image")
      fileName: 'thumbnail-1.png'  // ✅ "fileName" (not "filename")
    };
    
    console.log('📤 Data format:', {
      hasFile: !!testData.file,
      fileLength: testData.file.length,
      fileName: testData.fileName
    });
    
    console.log('📤 Testing upload to: https://form-forge-two.vercel.app/api/upload');
    
    const response = await fetch('https://form-forge-two.vercel.app/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful:', result);
      
      // Test if the uploaded image is accessible
      console.log('\n🔍 Testing uploaded image accessibility...');
      const imageResponse = await fetch(result.url);
      if (imageResponse.ok) {
        console.log('✅ Uploaded image is accessible');
        console.log('📸 Image URL:', result.url);
      } else {
        console.log('❌ Uploaded image is not accessible:', imageResponse.status);
      }
      
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Error details:', errorJson);
      } catch (e) {
        console.log('📋 Raw error:', errorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Handle missing fetch
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

testFrontendFormat();
