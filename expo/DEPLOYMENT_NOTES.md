# Deployment & API Setup Notes

## ✅ Completed Setup

### 1. Environment Variables
- ✅ Stripe Publishable Key added to `.env`
- ✅ Backend URL configured: `https://dfw-perkpass.vercel.app`
- ✅ `.env.example` created as template

### 2. API Routes
- ✅ Created `app/api/[...path].ts` to expose Hono backend through Expo Router
- ✅ Added handler export in `backend/hono.ts` for serverless functions
- ✅ All endpoints properly configured:
  - `GET /api/check-subscription`
  - `POST /api/redeem-coupon`
  - `POST /api/trpc/*` (tRPC endpoints)
  - `POST /stripe-webhook`
  - `GET /stripe-success`

### 3. Stripe Configuration
- ✅ Stripe publishable key: `pk_test_51SPDrSHtBUevF9daZ5jEkIXUe6C1wWwTg2rH3qRarNqjAtXSjanHd4Q1otFzb5kmRdgocDJYCk3xq7nvGyjNqnvn00wIhuqJfT`
- ⚠️ Stripe Connect Client ID: Still needs to be added (optional)

## 🔧 Next Steps

### 1. Deploy to Vercel
After pushing these changes, the API routes should be accessible at:
- `https://dfw-perkpass.vercel.app/api/check-subscription`
- `https://dfw-perkpass.vercel.app/api/redeem-coupon`
- `https://dfw-perkpass.vercel.app/api/trpc/*`

### 2. Add Stripe Connect Client ID (Optional)
If using Stripe Connect for payment routing:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/settings/applications)
2. Enable Stripe Connect
3. Get your Connect Client ID (starts with `ca_`)
4. Add to `.env`: `EXPO_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CLIENT_ID`

### 3. Set Environment Variables on Vercel
Make sure to add these environment variables in your Vercel project settings:
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_RORK_API_BASE_URL`
- `EXPO_PUBLIC_VERCEL_URL`
- `EXPO_PUBLIC_STRIPE_CONNECT_CLIENT_ID` (optional)

### 4. Test Endpoints
After deployment, test the endpoints:
```bash
# Test check-subscription
curl https://dfw-perkpass.vercel.app/api/check-subscription?email=test@example.com

# Test redeem-coupon
curl -X POST https://dfw-perkpass.vercel.app/api/redeem-coupon \
  -H "Content-Type: application/json" \
  -d '{"couponId":"test-123","userId":"user-123"}'
```

## 📝 File Changes

### New Files:
- `app/api/[...path].ts` - API route handler for Expo Router
- `.env.example` - Environment variable template
- `scripts/verify-endpoints.js` - Endpoint verification script
- `API_SETUP.md` - API setup documentation
- `DEPLOYMENT_NOTES.md` - This file

### Modified Files:
- `backend/hono.ts` - Added handler export for serverless functions
- `.gitignore` - Updated to protect `.env` files
- `.env` - Added Stripe key and backend URLs

## ⚠️ Important Notes

1. **Path Handling**: The Hono routes include `/api/` prefix. When accessed through Expo Router's `app/api/[...path].ts`, the routes should work correctly as the full request URL is passed to Hono.

2. **Serverless Functions**: The backend is now configured to work as serverless functions on Vercel through Expo Router's API routes.

3. **In-Memory Storage**: The subscriptions Map is in-memory and will reset on each serverless function invocation. For production, consider using a database (e.g., PostgreSQL, MongoDB) or Redis for persistent storage.

4. **CORS**: CORS is enabled for all routes. For production, consider restricting CORS to specific origins.

## 🐛 Troubleshooting

If endpoints return 404:
1. Verify the deployment includes the `app/api/[...path].ts` file
2. Check Vercel build logs for any errors
3. Ensure environment variables are set in Vercel
4. Verify the route paths match exactly (case-sensitive)

If endpoints return 500:
1. Check Vercel function logs
2. Verify all dependencies are installed
3. Check for TypeScript compilation errors
4. Verify the Hono app is correctly exported

