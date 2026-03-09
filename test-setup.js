const axios = require('axios');

// Test script to verify backend is working and create test user
async function testSetup() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🔧 Testing ForensicsAI Backend Setup...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Create test user
    console.log('\n2. Creating test user...');
    try {
      const testUserResponse = await axios.post(`${baseURL}/api/auth/create-test-user`);
      console.log('✅ Test user setup:', testUserResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️  Test user already exists');
      } else {
        throw error;
      }
    }
    
    // Test 3: Test login
    console.log('\n3. Testing login with test user...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'test@forensics.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', {
      user: loginResponse.data.user.email,
      role: loginResponse.data.user.role
    });
    
    // Test 4: Test authenticated endpoint
    console.log('\n4. Testing authenticated endpoint...');
    const token = loginResponse.data.accessToken;
    const meResponse = await axios.get(`${baseURL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Authenticated request successful:', meResponse.data.user.email);
    
    console.log('\n🎉 All tests passed! Backend is working correctly.');
    console.log('\n📋 Test Credentials:');
    console.log('   Email: test@forensics.com');
    console.log('   Password: password123');
    console.log('\n🚀 You can now start the frontend and login with these credentials.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if backend server is running on port 5000');
    console.log('3. Verify environment variables in backend/.env');
  }
}

// Run the test
testSetup();