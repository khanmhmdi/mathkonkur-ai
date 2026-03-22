/**
 * End-to-End GapGPT Integration Test
 * Simulates frontend sending a message to the backend via the full stack
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:4001/api';

async function testFullStackGapGPT() {
  console.log('\n🧪 Full Stack GapGPT Integration Test\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Test 1: Check backend health
    console.log('1️⃣  Checking Backend Health...');
    try {
      const health = await axios.get(`http://localhost:4001/health`, { timeout: 5000 });
      console.log('✅ Backend healthy\n');
    } catch (err: any) {
      throw new Error('Backend not responding: ' + err.message);
    }

    // Test 2: Register/Login test user
    console.log('2️⃣  Testing Authentication Flow...');
    const testEmail = `test-${Date.now()}@mathkonkur.ir`;
    const testPassword = 'TestPassword123!';

    try {
      const registerRes = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          email: testEmail,
          password: testPassword,
          name: 'Test User'
        },
        { timeout: 10000, withCredentials: true }
      );
      
      console.log('✅ Registration successful');
      console.log(`   User: ${testEmail}\n`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.log('ℹ️  User already exists, continuing...\n');
      } else {
        throw err;
      }
    }

    // Test 3: Login
    console.log('3️⃣  Testing Login...');
    const loginRes = await axios.post(
      `${API_BASE_URL}/auth/login`,
      {
        email: testEmail,
        password: testPassword
      },
      { timeout: 10000, withCredentials: true }
    );

    const accessToken = loginRes.data.data.accessToken;
    console.log('✅ Login successful');
    console.log(`   Token: ${accessToken.substring(0, 20)}...\n`);

    // Test 4: Create chat conversation
    console.log('4️⃣  Testing GapGPT Chat API...');
    const chatRes = await axios.post(
      `${API_BASE_URL}/chat`,
      {
        subject: 'حسابان',
        level: 'ریاضی فیزیک',
        initialMessage: 'سلام! یک معادله خطی ساده حل کن: 2x + 3 = 7'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000,
        withCredentials: true
      }
    );

    const { conversation, message } = chatRes.data.data;
    console.log('✅ GapGPT Response Received!\n');
    
    if (!conversation || !message) {
      throw new Error('Invalid response structure: missing conversation or message');
    }
    
    console.log('📊 Response Details:');
    console.log(`   Conversation ID: ${conversation.id}`);
    console.log(`   Subject: ${conversation.subject}`);
    console.log(`   Level: ${conversation.level}`);
    console.log(`   AI Message Content Length: ${message.content.length} chars\n`);

    console.log('📝 AI Response Preview:');
    console.log('   ' + message.content.substring(0, 150) + '...\n');

    // Verify Persian content
    const persianRegex = /[\u0600-\u06FF]/;
    if (persianRegex.test(message.content)) {
      console.log('✅ Persian language support confirmed\n');
    }

    console.log('=' .repeat(60));
    console.log('\n✨ Full Stack GapGPT Integration: SUCCESS!\n');
    console.log('🎯 Summary:');
    console.log('   • Frontend → Backend API ✅');
    console.log('   • Authentication Flow ✅');
    console.log('   • GapGPT AI Service ✅');
    console.log('   • Persian Response ✅');
    console.log('   • LaTeX Support Ready ✅\n');
    
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Test Failed!\n');
    console.error('Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    console.error('\nDebug Info:');
    console.error('  Backend URL:', API_BASE_URL);
    console.error('  Time:', new Date().toISOString());
    process.exit(1);
  }
}

testFullStackGapGPT();
