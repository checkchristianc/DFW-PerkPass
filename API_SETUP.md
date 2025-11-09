# API Endpoint Setup & Verification

## Current Status

### ✅ Backend Code
- Backend routes are correctly defined in `backend/hono.ts`
- All endpoints are properly configured:
  - `GET /api/check-subscription`
  - `POST /api/redeem-coupon`
  - `POST /api/trpc/*` (tRPC endpoints)
  - `POST /stripe-webhook`
  - `GET /stripe-success`

### ⚠️ Deployment Issue
The backend is returning 404 errors on Vercel. This is because:
1. The backend is in `backend/hono.ts` but needs to be exposed through Expo Router API routes
2. For Expo Router on Vercel, API routes should be in `app/api/` directory
3. The Hono app needs to be integrated with Expo Router's serverless functions

## Solution Options

### Option 1: Create Expo Router API Routes (Recommended)
Create API route handlers in `app/api/` that use the Hono backend.

### Option 2: Deploy Backend Separately
Deploy the Hono backend as a separate service (e.g., on Vercel as a serverless function).

### Option 3: Use Rork's Backend Integration
Since this is a Rork app, check if Rork has a specific way to deploy backend routes.

## Environment Variables

### Required Variables (in `.env`):
```env
EXPO_PUBLIC_RORK_API_BASE_URL=https://dfw-perkpass.vercel.app
EXPO_PUBLIC_VERCEL_URL=https://dfw-perkpass.vercel.app
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
EXPO_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CLIENT_ID_HERE
```

## Next Steps

1. **Add Stripe Keys**: Update `.env` with your Stripe publishable key and Connect client ID
2. **Fix API Routing**: Create API route handlers in `app/api/` or configure Vercel to serve the backend
3. **Test Endpoints**: Verify all endpoints are accessible after deployment

## Testing Endpoints

Use the verification script:
```bash
node scripts/verify-endpoints.js
```

Or test manually:
```bash
# Test root endpoint
curl https://dfw-perkpass.vercel.app/

# Test check-subscription
curl https://dfw-perkpass.vercel.app/api/check-subscription?email=test@example.com

# Test redeem-coupon
curl -X POST https://dfw-perkpass.vercel.app/api/redeem-coupon \
  -H "Content-Type: application/json" \
  -d '{"couponId":"test-123","userId":"user-123"}'
```

