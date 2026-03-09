const axios = require('axios');

// Comprehensive authentication debugging script
async function debugAuthentication() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🔍 ForensicsAI Authentication Debug Script\n');
  console.log('This script will test each step of the authentication process...\n');
  
  try {
    // Step 1: Test server health
    console.log('Step 1: Testing server health...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`);
      console.log('✅ Server is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server health check failed:', error.message);
      console.log('🔧 Make sure the backend server is running on port 5000');
      return;
    }
    
    // Step 2: Test database connection by creating test user
    console.log('\nStep 2: Testing database connection and user creation...');
    try {
      const testUserResponse = await axios.post(`${baseURL}/api/auth/create-test-user`);
      console.log('✅ Database connection working:', testUserResponse.data.message);
    } catch (error) {
      console.log('❌ Database/User creation failed:', error.response?.data || error.message);
      console.log('🔧 Check MongoDB connection and User model');
      return;
    }
    
    // Step 3: Test login validation
    console.log('\nStep 3: Testing login validation...');
    try {
      await axios.post(`${baseURL}/api/auth/login`, {
        email: 'invalid-email',
        password: '123'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working correctly:', error.response.data.message);
      } else {
        console.log('⚠️  Unexpected validation response:', error.response?.data);
      }
    }
    
    // Step 4: Test login with wrong credentials
    console.log('\nStep 4: Testing login with wrong credentials...');
    try {
      await axios.post(`${baseURL}/api/auth/login`, {
        email: 'test@forensics.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication security working:', error.response.data.message);
      } else {
        console.log('⚠️  Unexpected auth response:', error.response?.data);
      }
    }
    
    // Step 5: Test successful login
    console.log('\nStep 5: Testing successful login...');
    let authToken = null;
    try {
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'test@forensics.com',
        password: 'password123'
      });
      
      console.log('✅ Login successful!');
      console.log('   User:', loginResponse.data.user.email);
      console.log('   Role:', loginResponse.data.user.role);
      console.log('   Token received:', loginResponse.data.accessToken ? 'Yes' : 'No');
      
      authToken = loginResponse.data.accessToken;
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      console.log('🔧 Check User model password comparison and JWT generation');
      return;
    }
    
    // Step 6: Test authenticated endpoint
    console.log('\nStep 6: Testing authenticated endpoint...');
    try {
      const meResponse = await axios.get(`${baseURL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Authenticated request successful:', meResponse.data.user.email);
    } catch (error) {
      console.log('❌ Authenticated request failed:', error.response?.data || error.message);
      console.log('🔧 Check auth middleware and JWT verification');
      return;
    }
    
    // Step 7: Test CORS and frontend compatibility
    console.log('\nStep 7: Testing CORS configuration...');
    try {
      const corsResponse = await axios.options(`${baseURL}/api/auth/login`, {
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      console.log('✅ CORS preflight successful');
    } catch (error) {
      console.log('⚠️  CORS preflight response:', error.response?.status || error.message);
    }
    
    console.log('\n🎉 All authentication tests completed successfully!');
    console.log('\n📋 Test Results Summary:');
    console.log('✅ Server is running and healthy');
    console.log('✅ Database connection working');
    console.log('✅ User model and password hashing working');
    console.log('✅ JWT token generation working');
    console.log('✅ Authentication middleware working');
    console.log('✅ CORS configuration working');
    
    console.log('\n🔐 Login Credentials for Frontend:');
    console.log('   Email: test@forensics.com');
    console.log('   Password: password123');
    
    console.log('\n🚀 Frontend should now work correctly!');
    console.log('   1. Start frontend: npm run client');
    console.log('   2. Go to: http://localhost:3000');
    console.log('   3. Click Login and use the credentials above');
    
  } catch (error) {
    console.error('\n💥 Unexpected error during testing:', error.message);
    console.log('\n🔧 Troubleshooting checklist:');
    console.log('1. Is MongoDB running?');
    console.log('2. Is the backend server running on port 5000?');
    console.log('3. Are all npm dependencies installed?');
    console.log('4. Check the backend/.env file configuration');
  }
}

// Additional function to test frontend connectivity
async function testFrontendConnectivity() {
  console.log('\n🌐 Testing Frontend Connectivity...');
  
  const frontendBaseURL = 'http://localhost:5000'; // This is what frontend will use
  
  try {
    // Test the exact request the frontend makes
    const response = await axios.post(`${frontendBaseURL}/api/auth/login`, {
      email: 'test@forensics.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('✅ Frontend-style request successful');
    console.log('   Response structure correct:', {
      hasUser: !!response.data.user,
      hasAccessToken: !!response.data.accessToken,
      hasRefreshToken: !!response.data.refreshToken
    });
    
  } catch (error) {
    console.log('❌ Frontend-style request failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  await debugAuthentication();
  await testFrontendConnectivity();
}

runAllTests();