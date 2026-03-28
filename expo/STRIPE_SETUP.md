# Stripe Integration Setup Guide

## Overview
This app now has full Stripe integration for business subscriptions and payment routing. Here's what has been implemented:

## What's Been Implemented

### 1. Stripe SDK Integration
- **Package**: `@stripe/stripe-react-native` installed
- **Configuration**: `constants/stripe.ts` with publishable key and settings
- **Provider**: StripeProvider wrapped around the app in `app/_layout.tsx`

### 2. Payment Card Input Component
- **File**: `components/StripeCardInput.tsx`
- **Features**:
  - Secure card input using Stripe's CardField component
  - Real-time validation
  - Payment method creation
  - Error handling
  - Loading states

### 3. Payment Setup Page
- **File**: `app/auth/payment-setup.tsx`
- **Flow**: Business signup → Payment setup → Dashboard
- **Features**:
  - Display business information
  - Show pricing ($9.99/month)
  - Collect payment card details
  - Create payment method and subscription
  - Redirect to dashboard on success

### 4. Business Signup Flow
- **Updated**: `app/auth/business-login.tsx`
- **New Flow**: Sign up form → Navigate to payment-setup → Complete payment → Dashboard
- When "Continue to Payment" is clicked, business data is passed to payment setup page

### 5. Auth Context Updates
- **File**: `contexts/AuthContext.tsx`
- **New Fields** added to AuthUser:
  - `stripeCustomerId`: Stripe customer ID
  - `stripePaymentMethodId`: Payment method ID
  - `stripeConnectedAccountId`: For payment routing to businesses

### 6. Payment Utilities
- **File**: `utils/stripePayments.ts`
- **Functions**:
  - `createStripeCustomer()`: Create customer with payment method
  - `createSubscription()`: Set up monthly subscription
  - `setupConnectedAccount()`: Create Stripe Connect account for business
  - `calculatePlatformFee()`: Calculate 10% platform fee
  - `calculateBusinessPayout()`: Calculate business payout after fee

## Setup Instructions

### Step 1: Get Your Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → API keys
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)

### Step 2: Configure Environment Variables
Create or update your `.env` file:

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
EXPO_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CLIENT_ID_HERE
```

### Step 3: Update Stripe Configuration
Edit `constants/stripe.ts` with your actual keys:

```typescript
export const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE',
  merchantIdentifier: 'merchant.com.dfwperkpass', // For Apple Pay (optional)
  urlScheme: 'dfwperkpass', // For redirects
  monthlySubscriptionPrice: 9.99,
  platformFeePercentage: 10, // 10% platform fee
};
```

### Step 4: Create Stripe Products & Prices
1. In Stripe Dashboard, go to Products
2. Create a new product: "DFW PerkPass Business Subscription"
3. Add a price: $9.99/month recurring
4. Copy the **Price ID** (starts with `price_`)

### Step 5: Set Up Backend API (REQUIRED)
The current implementation uses placeholder API calls. You need to create a backend to:

#### Backend Endpoints Needed:

**1. Create Customer**
```
POST YOUR_BACKEND_API/create-customer
Body: { email, name, paymentMethodId }
Returns: { id: customerId, email, name }
```

**2. Create Subscription**
```
POST YOUR_BACKEND_API/create-subscription
Body: { customerId, paymentMethodId, priceId }
Returns: { id: subscriptionId, customerId, status, ... }
```

**3. Create Connected Account** (for payment routing)
```
POST YOUR_BACKEND_API/create-connected-account
Body: { businessName, email }
Returns: { accountId }
```

#### Update API Calls:
Replace placeholder URLs in:
- `app/auth/payment-setup.tsx` (line 74)
- `utils/stripePayments.ts` (lines 33, 60, 93)

### Step 6: Set Up Stripe Connect (For Payment Routing)
1. Enable Stripe Connect in your Dashboard
2. Choose "Standard" or "Express" account type
3. Configure your platform settings
4. Get your Connect client ID
5. Update `EXPO_PUBLIC_STRIPE_CONNECT_CLIENT_ID`

### Step 7: Test the Integration

#### Test Card Numbers (Test Mode Only):
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

Use any future expiration date and any 3-digit CVC.

#### Test Flow:
1. Launch app
2. Go to Business Login
3. Click "Sign Up"
4. Fill in business details
5. Click "Continue to Payment"
6. Enter test card: 4242 4242 4242 4242
7. Complete payment
8. Should redirect to Business Dashboard

## Payment Routing Architecture

### How It Works:
1. **Customer pays platform**: $9.99/month subscription
2. **Platform collects payment**: Full amount charged to platform account
3. **Businesses get paid**: When customers redeem coupons (future implementation)
4. **Platform fee**: 10% of transaction value
5. **Business payout**: 90% of transaction value transferred via Stripe Connect

### Connected Accounts:
Each business needs a Stripe Connected Account to receive payouts. This is created during onboarding.

## Current Implementation Status

### ✅ Completed:
- [x] Stripe SDK integration
- [x] Payment card input component
- [x] Payment setup page
- [x] Business signup flow with payment
- [x] Auth context with Stripe fields
- [x] Payment utilities and helpers
- [x] Platform fee calculation (10%)

### 🚧 TODO (Requires Backend):
- [ ] Backend API for customer creation
- [ ] Backend API for subscription management
- [ ] Backend API for Stripe Connect account creation
- [ ] Webhook handlers for subscription events
- [ ] Payment routing for coupon redemptions
- [ ] Business payout management
- [ ] Subscription cancellation flow
- [ ] Payment method update flow

## Security Notes

⚠️ **IMPORTANT**: Never expose your Stripe secret key in the app! Only use publishable keys.

### Best Practices:
1. Use environment variables for all keys
2. Process payments server-side with secret keys
3. Validate payment intents server-side
4. Use webhooks to track subscription events
5. Store sensitive data server-side only

## Troubleshooting

### "Invalid API Key" Error
- Check that your publishable key is correct in `constants/stripe.ts`
- Ensure environment variables are loaded properly

### Card Input Not Working
- Verify StripeProvider is wrapped around the app
- Check that publishableKey prop is not empty
- Test with Stripe test cards only in test mode

### Payment Not Processing
- Check console logs for detailed errors
- Verify backend API endpoints are reachable
- Ensure payment method was created successfully
- Check Stripe Dashboard for payment intents

## Additional Resources
- [Stripe React Native SDK Docs](https://stripe.com/docs/payments/accept-a-payment?platform=react-native)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
