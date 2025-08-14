#!/usr/bin/env node

// Test the existing upload endpoint on Vercel

import { readFileSync } from 'fs';

async function testExistingUpload() {
  try {
    console.log('🧪 Testing existing upload endpoint...');
    
    // Read the thumbnail image
    const imageBuffer = readFileSync('thumbnail-1.png');
    const base64Data = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64Data}`;
    
    const testData = {
      image: dataUrl,
      filename: 'test-thumbnail.png'
    };
    
    console.log('📤 Testing upload to: https://form-forge-two.vercel.app/api/upload');
    
    const response = await fetch('https://form-forge-two.vercel.app/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed:', errorText);
      
      // Try to parse as JSON if possible
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

testExistingUpload();
