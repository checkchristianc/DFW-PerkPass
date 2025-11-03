import { STRIPE_CONFIG } from '@/constants/stripe';

export interface StripePaymentMethodData {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface StripeCustomerData {
  id: string;
  email: string;
  name: string;
}

export interface StripeSubscriptionData {
  id: string;
  customerId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export async function createStripeCustomer(
  email: string,
  name: string,
  paymentMethodId: string
): Promise<StripeCustomerData | null> {
  try {
    console.log('Creating Stripe customer for:', email);
    
    const response = await fetch('YOUR_BACKEND_API/create-customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    return null;
  }
}

export async function createSubscription(
  customerId: string,
  paymentMethodId: string
): Promise<StripeSubscriptionData | null> {
  try {
    console.log('Creating subscription for customer:', customerId);
    
    const response = await fetch('YOUR_BACKEND_API/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        paymentMethodId,
        priceId: 'YOUR_STRIPE_PRICE_ID',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    return null;
  }
}

export async function setupConnectedAccount(businessName: string, email: string): Promise<string | null> {
  try {
    console.log('Setting up Stripe Connect account for:', businessName);
    
    const response = await fetch('YOUR_BACKEND_API/create-connected-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName,
        email,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to setup connected account');
    }

    const data = await response.json();
    return data.accountId;
  } catch (error) {
    console.error('Error setting up connected account:', error);
    return null;
  }
}

export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * (STRIPE_CONFIG.platformFeePercentage / 100));
}

export function calculateBusinessPayout(amount: number): number {
  const platformFee = calculatePlatformFee(amount);
  return amount - platformFee;
}
