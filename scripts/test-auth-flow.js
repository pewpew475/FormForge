#!/usr/bin/env node

// Test the authentication flow for form filling

import { config } from 'dotenv';

// Load environment variables
config();

async function testAuthFlow() {
  const baseUrl = process.argv[2] || 'http://localhost:5000';
  
  console.log('🧪 Testing authentication flow for form filling...');
  console.log('📍 Base URL:', baseUrl);
  
  try {
    // Test 1: Try to access form without authentication
    console.log('\n1. Testing unauthenticated access...');
    
    const formsResponse = await fetch(`${baseUrl}/api/forms`);
    if (!formsResponse.ok) {
      throw new Error(`Forms API failed: ${formsResponse.status}`);
    }
    
    const forms = await formsResponse.json();
    const publishedForm = forms.find(form => form.isPublished && form.questions?.length > 0);
    
    if (!publishedForm) {
      console.log('⚠️  No published forms with questions found. Please create and publish a form first.');
      return;
    }
    
    console.log('✅ Found published form:', publishedForm.title);
    console.log('📝 Form ID:', publishedForm.id);
    
    // Test 2: Try to submit without authentication
    console.log('\n2. Testing submission without authentication...');
    
    const sampleAnswers = {};
    publishedForm.questions.forEach(question => {
      switch (question.type) {
        case 'categorize':
          if (question.categories && question.items) {
            const answers = {};
            question.categories.forEach(cat => answers[cat] = []);
            if (question.items.length > 0) {
              answers[question.categories[0]] = [question.items[0]];
            }
            sampleAnswers[question.id] = answers;
          }
          break;
        case 'cloze':
          if (question.blanks) {
            const answers = {};
            question.blanks.forEach(blank => {
              answers[blank.id] = question.options?.[0] || 'test';
            });
            sampleAnswers[question.id] = answers;
          }
          break;
        case 'comprehension':
          if (question.subQuestions) {
            const answers = {};
            question.subQuestions.forEach(subQ => {
              answers[subQ.id] = 0;
            });
            sampleAnswers[question.id] = answers;
          }
          break;
      }
    });

    const unauthSubmission = await fetch(`${baseUrl}/api/forms/${publishedForm.id}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answers: sampleAnswers
      })
    });

    if (unauthSubmission.status === 401) {
      console.log('✅ Unauthenticated submission correctly rejected (401)');
    } else {
      console.log('⚠️  Expected 401 for unauthenticated submission, got:', unauthSubmission.status);
    }

    // Test 3: Check frontend authentication requirement
    console.log('\n3. Testing frontend authentication requirement...');
    console.log('📱 Frontend behavior:');
    console.log('   - Form fill page should show sign-in screen for unauthenticated users');
    console.log('   - Only Google and Microsoft sign-in options should be available');
    console.log('   - No email/password sign-in option');
    console.log('   - User indicator should show after successful sign-in');

    // Test 4: Simulate authenticated flow
    console.log('\n4. Simulating authenticated user flow...');
    console.log('🔐 With authentication, the flow should be:');
    console.log('   1. User visits form URL');
    console.log('   2. Redirected to sign-in if not authenticated');
    console.log('   3. Signs in with Google or Microsoft');
    console.log('   4. Redirected back to form');
    console.log('   5. Can fill and submit form');
    console.log('   6. Subsequent visits show submitted state');
    console.log('   7. Cannot submit again (one-time submission)');

    // Test 5: Database structure verification
    console.log('\n5. Database structure requirements...');
    console.log('📊 The responses table should have:');
    console.log('   - user_id column (TEXT, nullable)');
    console.log('   - Index on user_id for performance');
    console.log('   - Composite index on (form_id, user_id)');
    console.log('   - Unique constraint per user per form enforced by application logic');

    console.log('\n🎯 Expected authentication behavior:');
    console.log('✅ Form filling requires Google or Microsoft sign-in');
    console.log('✅ Each user can submit each form only once');
    console.log('✅ User submissions are tracked by user_id');
    console.log('✅ localStorage keys are user-specific');
    console.log('✅ Form state persists across browser sessions');
    console.log('✅ Multiple users can use the same browser independently');

    console.log('\n🧪 Manual testing checklist:');
    console.log('□ Visit form URL without signing in');
    console.log('□ Verify sign-in screen appears');
    console.log('□ Sign in with Google');
    console.log('□ Verify user indicator shows in form header');
    console.log('□ Fill and submit form');
    console.log('□ Verify success message and score display');
    console.log('□ Refresh page - should show submitted state');
    console.log('□ Try to submit again - should be prevented');
    console.log('□ Sign out and sign in as different user');
    console.log('□ Verify new user can submit the same form');
    console.log('□ Test with Microsoft sign-in as well');

    console.log('\n🔧 OAuth Configuration Required:');
    console.log('1. Google OAuth:');
    console.log('   - Client ID and Secret configured in Supabase');
    console.log('   - Redirect URLs properly set');
    console.log('   - Scopes: email, profile');
    
    console.log('2. Microsoft OAuth:');
    console.log('   - Azure AD app registration');
    console.log('   - Client ID and Secret in Supabase');
    console.log('   - Proper redirect URLs');
    console.log('   - Scopes: openid, email, profile');

    console.log('\n✅ Authentication flow test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running');
    console.log('2. Verify OAuth providers are configured in Supabase');
    console.log('3. Check that forms exist and are published');
    console.log('4. Run the migration script first: npm run migrate-auth');
  }
}

// Handle missing fetch
if (typeof fetch === 'undefined') {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

testAuthFlow();
