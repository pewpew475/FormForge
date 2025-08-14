#!/usr/bin/env node

// Debug form structure

async function debugFormStructure() {
  const baseUrl = 'https://form-forge-two.vercel.app';
  
  console.log('🔍 Debugging form structure...');
  
  try {
    // Get all forms and see the actual structure
    const formsResponse = await fetch(`${baseUrl}/api/forms`);
    if (formsResponse.ok) {
      const forms = await formsResponse.json();
      console.log('📋 Forms found:', forms.length);
      
      if (forms.length > 0) {
        console.log('\n📝 First form structure:');
        console.log(JSON.stringify(forms[0], null, 2));
        
        // Test individual form access
        const formId = forms[0].id;
        console.log('\n🔍 Testing individual form access...');
        const individualResponse = await fetch(`${baseUrl}/api/forms?id=${formId}`);
        if (individualResponse.ok) {
          const individualForm = await individualResponse.json();
          console.log('\n📝 Individual form structure:');
          console.log(JSON.stringify(individualForm, null, 2));
        } else {
          console.log('❌ Individual form failed:', individualResponse.status);
        }
      }
    } else {
      console.log('❌ Forms API failed:', formsResponse.status);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Handle missing fetch
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

debugFormStructure();
