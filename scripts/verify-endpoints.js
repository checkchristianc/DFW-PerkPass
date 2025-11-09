/**
 * Endpoint Verification Script
 * Tests all API endpoints to ensure they're working correctly
 */

const BASE_URL = 'https://dfw-perkpass.vercel.app';

async function testEndpoint(method, path, body = null, description) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = `${BASE_URL}${path}`;
    console.log(`\n🧪 Testing: ${method} ${path}`);
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS (${response.status})`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      return { success: true, status: response.status, data };
    } else {
      console.log(`   ❌ FAILED (${response.status})`);
      console.log(`   Error:`, data);
      return { success: false, status: response.status, error: data };
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function verifyEndpoints() {
  console.log('🚀 Starting Endpoint Verification');
  console.log('=' .repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log('=' .repeat(50));

  const results = {
    root: await testEndpoint('GET', '/', null, 'Root endpoint'),
    checkSubscription: await testEndpoint('GET', '/api/check-subscription?email=test@example.com', null, 'Check subscription (no subscription)'),
    redeemCoupon: await testEndpoint('POST', '/api/redeem-coupon', { couponId: 'test-coupon-123', userId: 'test-user' }, 'Redeem coupon'),
    stripeSuccess: await testEndpoint('GET', '/stripe-success?email=test@example.com', null, 'Stripe success page'),
  };

  // Test tRPC endpoint (this is more complex, just check if it responds)
  try {
    console.log(`\n🧪 Testing: POST /api/trpc/coupons.redeem`);
    const trpcResponse = await fetch(`${BASE_URL}/api/trpc/coupons.redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          couponId: 'test-coupon-123',
          userId: 'test-user',
        },
      }),
    });
    
    if (trpcResponse.ok) {
      const trpcData = await trpcResponse.json();
      console.log(`   ✅ SUCCESS (${trpcResponse.status})`);
      console.log(`   Response:`, JSON.stringify(trpcData, null, 2));
      results.trpcRedeem = { success: true, status: trpcResponse.status, data: trpcData };
    } else {
      console.log(`   ⚠️  Response (${trpcResponse.status}) - This is expected if tRPC format differs`);
      results.trpcRedeem = { success: false, status: trpcResponse.status };
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    results.trpcRedeem = { success: false, error: error.message };
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  Object.entries(results).forEach(([key, result]) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${key}`);
  });

  return results;
}

// Run verification
if (typeof fetch !== 'undefined') {
  verifyEndpoints().catch(console.error);
} else {
  console.log('⚠️  This script requires a fetch API. Run with Node.js 18+ or in a browser.');
  console.log('   Install node-fetch: npm install node-fetch');
}

