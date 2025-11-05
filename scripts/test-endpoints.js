// Test analytics endpoints
import fetch from 'node-fetch';

async function testEndpoints() {
  const baseUrl = 'http://localhost:3000';
  
  // You'll need to get a valid auth token first
  console.log('Testing analytics endpoints...\n');
  
  try {
    // Test phase-summary
    console.log('1. Testing phase-summary endpoint:');
    const phaseRes = await fetch(`${baseUrl}/api/analytics/phase-summary`, {
      headers: {
        'Cookie': 'auth_token=YOUR_TOKEN_HERE' // You'll need to replace this
      }
    });
    const phaseData = await phaseRes.json();
    console.log('Phase Summary Response:', JSON.stringify(phaseData, null, 2));
    
    // Test item-breakdown
    console.log('\n2. Testing item-breakdown endpoint:');
    const itemRes = await fetch(`${baseUrl}/api/analytics/item-breakdown?limit=5`, {
      headers: {
        'Cookie': 'auth_token=YOUR_TOKEN_HERE' // You'll need to replace this
      }
    });
    const itemData = await itemRes.json();
    console.log('Item Breakdown Response:', JSON.stringify(itemData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testEndpoints();
