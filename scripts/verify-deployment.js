#!/usr/bin/env node

// Script to verify production deployment
// Run this after deploying to check if everything is working

import fetch from 'node-fetch';

const BASE_URL = process.argv[2] || 'http://localhost:5000';

async function verifyDeployment() {
  console.log(`🔍 Verifying deployment at: ${BASE_URL}`);
  
  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health`,
      expectedStatus: 200,
      expectedContent: 'healthy'
    },
    {
      name: 'Readiness Check',
      url: `${BASE_URL}/api/health/ready`,
      expectedStatus: 200,
      expectedContent: 'ready'
    },
    {
      name: 'Liveness Check',
      url: `${BASE_URL}/api/health/live`,
      expectedStatus: 200,
      expectedContent: 'alive'
    },
    {
      name: 'Forms API',
      url: `${BASE_URL}/api/forms`,
      expectedStatus: 200,
      expectedContent: null // Just check if it responds
    },
    {
      name: 'Frontend',
      url: `${BASE_URL}/`,
      expectedStatus: 200,
      expectedContent: 'FormCraft'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      const response = await fetch(test.url);
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ Status: ${response.status} (Expected: ${test.expectedStatus})`);
        
        if (test.expectedContent) {
          const text = await response.text();
          if (text.includes(test.expectedContent)) {
            console.log(`✅ Content contains: "${test.expectedContent}"`);
          } else {
            console.log(`❌ Content does not contain: "${test.expectedContent}"`);
            failed++;
            continue;
          }
        }
        
        passed++;
      } else {
        console.log(`❌ Status: ${response.status} (Expected: ${test.expectedStatus})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed === 0) {
    console.log(`\n🎉 All tests passed! Deployment is healthy.`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some tests failed. Please check the deployment.`);
    process.exit(1);
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

verifyDeployment().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
