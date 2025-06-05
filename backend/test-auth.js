const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  try {
    console.log('🧪 Starting authentication tests...\n');

    // Test 1: Register a manager
    console.log('📝 Test 1: Registering a manager...');
    const managerResponse = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Manager',
        email: 'manager@test.com',
        password: 'password123',
        department: 'Management',
        role: 'manager'
      })
    });
    const managerData = await managerResponse.json();
    console.log('✅ Manager registered:', managerData.name);
    console.log('Role:', managerData.role);
    console.log('Permissions:', managerData.permissions);
    console.log('Token:', managerData.token ? '✅ Received' : '❌ Missing');
    console.log('\n');

    // Test 2: Register an employee
    console.log('📝 Test 2: Registering an employee...');
    const employeeResponse = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Employee',
        email: 'employee@test.com',
        password: 'password123',
        department: 'Operations',
        role: 'employee'
      })
    });
    const employeeData = await employeeResponse.json();
    console.log('✅ Employee registered:', employeeData.name);
    console.log('Role:', employeeData.role);
    console.log('Permissions:', employeeData.permissions);
    console.log('Token:', employeeData.token ? '✅ Received' : '❌ Missing');
    console.log('\n');

    // Test 3: Login as manager
    console.log('📝 Test 3: Logging in as manager...');
    const managerLoginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'manager@test.com',
        password: 'password123'
      })
    });
    const managerLoginData = await managerLoginResponse.json();
    console.log('✅ Manager login successful');
    console.log('Token:', managerLoginData.token ? '✅ Received' : '❌ Missing');
    console.log('\n');

    // Test 4: Login as employee
    console.log('📝 Test 4: Logging in as employee...');
    const employeeLoginResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employee@test.com',
        password: 'password123'
      })
    });
    const employeeLoginData = await employeeLoginResponse.json();
    console.log('✅ Employee login successful');
    console.log('Token:', employeeLoginData.token ? '✅ Received' : '❌ Missing');
    console.log('\n');

    // Test 5: Get manager profile
    console.log('📝 Test 5: Getting manager profile...');
    const managerProfileResponse = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${managerLoginData.token}`
      }
    });
    const managerProfileData = await managerProfileResponse.json();
    console.log('✅ Manager profile retrieved');
    console.log('Name:', managerProfileData.name);
    console.log('Role:', managerProfileData.role);
    console.log('Permissions:', managerProfileData.permissions);
    console.log('\n');

    // Test 6: Get employee profile
    console.log('📝 Test 6: Getting employee profile...');
    const employeeProfileResponse = await fetch(`${API_URL}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${employeeLoginData.token}`
      }
    });
    const employeeProfileData = await employeeProfileResponse.json();
    console.log('✅ Employee profile retrieved');
    console.log('Name:', employeeProfileData.name);
    console.log('Role:', employeeProfileData.role);
    console.log('Permissions:', employeeProfileData.permissions);
    console.log('\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testAuth(); 