#!/usr/bin/env node

// Test upload against local server

import { readFileSync } from 'fs';

async function testLocalUpload() {
  try {
    console.log('🧪 Testing upload against local server...');
    
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
    
    console.log('📤 Testing upload to: http://localhost:5001/api/upload');
    
    const response = await fetch('http://localhost:5001/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Local upload successful:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Local upload failed:', errorText);
      
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

testLocalUpload();
