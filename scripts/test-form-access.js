#!/usr/bin/env node

// Test form access specifically

async function testFormAccess() {
  const baseUrl = process.argv[2] || 'https://form-forge-two.vercel.app';
  
  console.log('🧪 Testing form access...');
  console.log('📍 Base URL:', baseUrl);
  
  try {
    // Test 1: Get all forms
    console.log('\n1. Getting all forms...');
    const formsResponse = await fetch(`${baseUrl}/api/forms`);
    if (formsResponse.ok) {
      const forms = await formsResponse.json();
      console.log('✅ Found', forms.length, 'forms');
      
      if (forms.length > 0) {
        const testForm = forms[0];
        console.log('📋 Test form:', testForm.title, '(ID:', testForm.id + ')');
        
        // Test 2: Get individual form
        console.log('\n2. Getting individual form...');
        const formResponse = await fetch(`${baseUrl}/api/forms?id=${testForm.id}`);
        if (formResponse.ok) {
          const form = await formResponse.json();
          console.log('✅ Individual form retrieved successfully');
          console.log('📝 Form details:', {
            title: form.title,
            published: form.is_published,
            questions: form.questions?.length || 0
          });
          
          // Test 3: Test form responses API
          console.log('\n3. Testing form responses API...');
          const responsesResponse = await fetch(`${baseUrl}/api/form-responses?formId=${testForm.id}`);
          if (responsesResponse.ok) {
            const responsesData = await responsesResponse.json();
            console.log('✅ Responses API working');
            console.log('📊 Statistics:', {
              totalResponses: responsesData.statistics.totalResponses,
              averageScore: responsesData.statistics.averageScore,
              completionRate: responsesData.statistics.completionRate
            });
          } else {
            const error = await responsesResponse.text();
            console.log('❌ Responses API failed:', responsesResponse.status, error);
          }
          
        } else {
          const error = await formResponse.text();
          console.log('❌ Individual form API failed:', formResponse.status, error);
        }
      } else {
        console.log('⚠️  No forms found');
      }
    } else {
      const error = await formsResponse.text();
      console.log('❌ Forms API failed:', formsResponse.status, error);
    }

    console.log('\n🎯 Form access test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Handle missing fetch
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

testFormAccess();
