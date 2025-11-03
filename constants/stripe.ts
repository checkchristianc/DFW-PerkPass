export const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE',
  merchantIdentifier: 'merchant.com.couponhub',
  urlScheme: 'rork-app',
  monthlySubscriptionPrice: 9.99,
  platformFeePercentage: 10,
  successUrl: 'rork-app://payment-success',
};

export const STRIPE_CONNECT_CONFIG = {
  clientId: process.env.EXPO_PUBLIC_STRIPE_CONNECT_CLIENT_ID || '',
};
